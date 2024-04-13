type TimelineAxis = 'x' | 'y';
type TimelinePhase = 'active' | 'inactive';
interface TimelineOptions {
    source: HTMLElement | null;
    axis: TimelineAxis;
}
interface SourceMeasurements {
    scrollLeft: number;
    scrollTop: number;
    scrollWidth: number;
    scrollHeight: number;
    clientWidth: number;
    clientHeight: number;
}
interface SourceDetails {
    sourceMeasurements: SourceMeasurements;
    timelineRefs: Set<WeakRef<ScrollTimeline>>;
    updateScheduled?: boolean;
    disconnect?: VoidFunction;
}
interface ScrollTimelineOptions {
    source?: HTMLElement | null;
    axis?: TimelineAxis;
}
declare class ScrollTimeline {
    constructor(options: ScrollTimelineOptions);
    cancel: VoidFunction;
    source: HTMLElement;
    axis: TimelineAxis;
    phase: TimelinePhase;
    currentTime: {
        value: number;
    } | null;
}

export { ScrollTimeline, type ScrollTimelineOptions, type SourceDetails, type SourceMeasurements, type TimelineAxis, type TimelineOptions, type TimelinePhase };
