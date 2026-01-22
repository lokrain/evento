import type {
	AutoplayGate,
	Axis,
	CommitThreshold,
	Controllable,
	LiveRegionPoliteness,
	ReadingDirection,
	SnapTarget,
} from "./types-public";

export type LoopBuffer = "small" | "medium" | "large";

export interface NormalizedOptions<IndexC extends Controllable<number>, PlayingC extends Controllable<boolean>> {
	slideCount: number;

	layout: {
		axis: Axis;
		readingDirection: ReadingDirection;
		snapTo: SnapTarget;
	};

	loop: {
		enabled: boolean;
		buffer: LoopBuffer;
	};

	interaction: {
		draggable: boolean;
		step: number;
		commitThreshold: CommitThreshold;
		fling: {
			enabled: boolean;
			strength: "subtle" | "normal" | "strong";
		};
	};

	motion: {
		transitionDurationMs: number;
		easing: string;
		disabled: boolean;
	};

	measure: {
		observeResize: boolean;
		remeasureOnNextFrame: boolean;
	};

	autoplay: {
		enabled: boolean;
		playing?: PlayingC;
		mode: "step" | "continuous";
		startDelayMs?: number;
		dwellMs?: number | ((ctx: { index: number; slideCount: number }) => number);
		speedPxPerSec: number;
		resumeAfterInteraction: boolean;
		pauseWhenHidden: boolean;
	};

	accessibility: {
		label: string;
		controlsId?: string;
		live: LiveRegionPoliteness;
		announceChanges: boolean;
	};

	index?: IndexC;
	onIndexChange?: (index: number) => void;
	onSettle?: (index: number) => void;

	debug: boolean;
}

export interface InternalCarouselState {
	// Placeholder for future runtime state
}