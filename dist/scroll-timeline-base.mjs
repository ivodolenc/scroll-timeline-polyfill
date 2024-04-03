const defaultAxis = "block";
const scrollTimelineOptions = /* @__PURE__ */ new WeakMap();
const sourceDetails = /* @__PURE__ */ new WeakMap();
function normalizeAxis(axis, computedStyle) {
  if (["x", "y"].includes(axis))
    return axis;
  if (!computedStyle) {
    throw new Error(
      "To determine the normalized axis the computedStyle of the source is required."
    );
  }
  const horizontalWritingMode = computedStyle.writingMode == "horizontal-tb";
  if (axis === "block") {
    axis = horizontalWritingMode ? "y" : "x";
  } else if (axis === "inline") {
    axis = horizontalWritingMode ? "x" : "y";
  } else {
    throw new TypeError(`Invalid axis \u201C${axis}\u201D`);
  }
  return axis;
}
function scrollEventSource(source) {
  if (source === document.scrollingElement)
    return document;
  return source;
}
function directionAwareScrollOffset(source, axis) {
  if (!source)
    return null;
  const sourceMeasurements = sourceDetails.get(source).sourceMeasurements;
  const style = getComputedStyle(source);
  let currentScrollOffset = sourceMeasurements.scrollTop;
  if (normalizeAxis(axis, style) === "x") {
    currentScrollOffset = Math.abs(sourceMeasurements.scrollLeft);
  }
  return currentScrollOffset;
}
function calculateMaxScrollOffset(source, axis) {
  const sourceMeasurements = sourceDetails.get(source).sourceMeasurements;
  const horizontalWritingMode = getComputedStyle(source).writingMode == "horizontal-tb";
  if (axis === "block")
    axis = horizontalWritingMode ? "y" : "x";
  else if (axis === "inline")
    axis = horizontalWritingMode ? "x" : "y";
  if (axis === "y")
    return sourceMeasurements.scrollHeight - sourceMeasurements.clientHeight;
  return sourceMeasurements.scrollWidth - sourceMeasurements.clientWidth;
}
function isValidAxis(axis) {
  return ["block", "inline", "x", "y"].includes(axis);
}
function measureSource(source) {
  const style = getComputedStyle(source);
  return {
    scrollLeft: source.scrollLeft,
    scrollTop: source.scrollTop,
    scrollWidth: source.scrollWidth,
    scrollHeight: source.scrollHeight,
    clientWidth: source.clientWidth,
    clientHeight: source.clientHeight,
    writingMode: style.writingMode,
    direction: style.direction,
    scrollPaddingTop: style.scrollPaddingTop,
    scrollPaddingBottom: style.scrollPaddingBottom,
    scrollPaddingLeft: style.scrollPaddingLeft,
    scrollPaddingRight: style.scrollPaddingRight
  };
}
function updateMeasurements(source) {
  const details = sourceDetails.get(source);
  details.sourceMeasurements = measureSource(source);
  if (details.updateScheduled)
    return;
  setTimeout(() => {
    for (const ref of details.timelineRefs) {
      ref.deref();
    }
    details.updateScheduled = false;
  });
  details.updateScheduled = true;
}
function updateSource(timeline, source) {
  const timelineDetails = scrollTimelineOptions.get(timeline);
  const oldSource = timelineDetails.source;
  if (oldSource == source)
    return;
  if (oldSource) {
    const details = sourceDetails.get(oldSource);
    if (details) {
      details.timelineRefs.delete(timeline);
      const undefinedRefs = Array.from(details.timelineRefs).filter(
        (ref) => typeof ref.deref() === "undefined"
      );
      for (const ref of undefinedRefs) {
        details.timelineRefs.delete(ref);
      }
      if (details.timelineRefs.size === 0) {
        details.disconnect();
        sourceDetails.delete(oldSource);
      }
    }
  }
  timelineDetails.source = source;
  if (source) {
    let details = sourceDetails.get(source);
    if (!details) {
      details = {
        timelineRefs: /* @__PURE__ */ new Set(),
        sourceMeasurements: measureSource(source)
      };
      sourceDetails.set(source, details);
      const resizeObserver = new ResizeObserver((entries) => {
        for (let i = 0, l = entries.length; i < l; i++) {
          updateMeasurements(timelineDetails.source);
        }
      });
      resizeObserver.observe(source);
      for (const child of source.children) {
        resizeObserver.observe(child);
      }
      const mutationObserver = new MutationObserver((records) => {
        for (const record of records) {
          if (record.target instanceof Element) {
            updateMeasurements(record.target);
          }
        }
      });
      mutationObserver.observe(source, {
        attributes: true,
        attributeFilter: ["style", "class"]
      });
      const scrollListener = () => {
        details.sourceMeasurements.scrollLeft = source.scrollLeft;
        details.sourceMeasurements.scrollTop = source.scrollTop;
        for (const ref of details.timelineRefs) {
          ref.deref();
        }
      };
      scrollEventSource(source).addEventListener("scroll", scrollListener);
      details.disconnect = () => {
        resizeObserver.disconnect();
        mutationObserver.disconnect();
        scrollEventSource(source).removeEventListener("scroll", scrollListener);
      };
    }
    details.timelineRefs.add(new WeakRef(timeline));
  }
}
class ScrollTimeline {
  constructor(options) {
    scrollTimelineOptions.set(this, {
      source: null,
      axis: defaultAxis
    });
    const source = options && options.source !== void 0 ? options.source : document.scrollingElement;
    updateSource(this, source);
    if (options && options.axis !== void 0 && options.axis != defaultAxis) {
      if (!isValidAxis(options.axis))
        throw TypeError("Invalid axis");
      scrollTimelineOptions.get(this).axis = options.axis;
    }
  }
  cancel() {
    const details = sourceDetails.get(this.source);
    details.disconnect();
  }
  get source() {
    return scrollTimelineOptions.get(this).source;
  }
  set source(element) {
    updateSource(this, element);
  }
  get axis() {
    return scrollTimelineOptions.get(this).axis;
  }
  set axis(axis) {
    if (!isValidAxis(axis))
      throw TypeError("Invalid axis");
    scrollTimelineOptions.get(this).axis = axis;
  }
  get phase() {
    const container = this.source;
    if (!container)
      return "inactive";
    const scrollerStyle = getComputedStyle(container);
    if (scrollerStyle.display == "none")
      return "inactive";
    if (container != document.scrollingElement && (scrollerStyle.overflow == "visible" || scrollerStyle.overflow == "clip"))
      return "inactive";
    return "active";
  }
  get duration() {
    return { value: 100 };
  }
  get currentTime() {
    const unresolved = null;
    const container = this.source;
    if (!container || !container.isConnected)
      return unresolved;
    if (this.phase == "inactive")
      return unresolved;
    const scrollerStyle = getComputedStyle(container);
    if (scrollerStyle.display === "inline" || scrollerStyle.display === "none")
      return unresolved;
    const axis = this.axis;
    const scrollPos = directionAwareScrollOffset(container, axis);
    const maxScrollPos = calculateMaxScrollOffset(container, axis);
    return maxScrollPos > 0 ? { value: 100 * scrollPos / maxScrollPos } : { value: 100 };
  }
}

export { ScrollTimeline };
