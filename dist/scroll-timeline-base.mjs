const timelineOptions = /* @__PURE__ */ new WeakMap();
const sourceDetails = /* @__PURE__ */ new WeakMap();
function scrollEventSource(source) {
  if (source === document.scrollingElement)
    return document;
  return source;
}
function directionAwareScrollOffset(source, axis) {
  const measurements = sourceDetails.get(source).sourceMeasurements;
  let currentScrollOffset = measurements.scrollTop;
  if (axis === "x")
    currentScrollOffset = Math.abs(measurements.scrollLeft);
  return currentScrollOffset;
}
function calculateMaxScrollOffset(source, axis) {
  const measurements = sourceDetails.get(source).sourceMeasurements;
  if (axis === "y")
    return measurements.scrollHeight - measurements.clientHeight;
  return measurements.scrollWidth - measurements.clientWidth;
}
function measureSource(source) {
  return {
    scrollLeft: source.scrollLeft,
    scrollTop: source.scrollTop,
    scrollWidth: source.scrollWidth,
    scrollHeight: source.scrollHeight,
    clientWidth: source.clientWidth,
    clientHeight: source.clientHeight
  };
}
function updateMeasurements(source) {
  const details = sourceDetails.get(source);
  details.sourceMeasurements = measureSource(source);
  for (const ref of details.timelineRefs)
    ref.deref();
  if (details.updateScheduled)
    return;
  setTimeout(() => {
    for (const ref of details.timelineRefs)
      ref.deref();
    details.updateScheduled = false;
  });
  details.updateScheduled = true;
}
function updateSource(timeline, source) {
  const timelineDetails = timelineOptions.get(timeline);
  const oldSource = timelineDetails.source;
  if (oldSource === source)
    return;
  if (oldSource) {
    const details = sourceDetails.get(oldSource);
    if (details) {
      details.timelineRefs.delete(timeline);
      const undefinedRefs = Array.from(details.timelineRefs).filter(
        (ref) => typeof ref.deref() === "undefined"
      );
      for (const ref of undefinedRefs)
        details.timelineRefs.delete(ref);
      if (details.timelineRefs.size === 0) {
        details?.disconnect?.();
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
      for (const child of source.children)
        resizeObserver.observe(child);
      const mutationObserver = new MutationObserver((records) => {
        for (const record of records) {
          if (record.target instanceof HTMLElement) {
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
        for (const ref of details.timelineRefs)
          ref.deref();
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
  constructor({
    source = document.documentElement,
    axis = "y"
  }) {
    timelineOptions.set(this, {
      source: null,
      axis
    });
    updateSource(this, source);
  }
  cancel() {
    const details = sourceDetails.get(this.source);
    details.disconnect?.();
  }
  get source() {
    return timelineOptions.get(this).source;
  }
  set source(element) {
    updateSource(this, element);
  }
  get axis() {
    return timelineOptions.get(this).axis;
  }
  set axis(axis) {
    timelineOptions.get(this).axis = axis;
  }
  get phase() {
    const container = this.source;
    if (!container)
      return "inactive";
    const style = getComputedStyle(container);
    if (style.display === "none")
      return "inactive";
    if (container !== document.scrollingElement && (style.overflow === "visible" || style.overflow === "clip")) {
      return "inactive";
    }
    return "active";
  }
  get currentTime() {
    const unresolved = null;
    const container = this.source;
    if (!container || !container.isConnected)
      return unresolved;
    if (this.phase === "inactive")
      return unresolved;
    const style = getComputedStyle(container);
    if (style.display === "inline" || style.display === "none") {
      return unresolved;
    }
    const axis = this.axis;
    const scrollPos = directionAwareScrollOffset(container, axis);
    const maxScrollPos = calculateMaxScrollOffset(container, axis);
    return maxScrollPos > 0 ? { value: 100 * scrollPos / maxScrollPos } : { value: 100 };
  }
}

export { ScrollTimeline };
