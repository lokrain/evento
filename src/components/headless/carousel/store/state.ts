import { asIndex, asMs, asPx, asWindowSize } from "../core/brands";
import { DEFAULT_OVERSCAN, DEFAULT_WINDOW_SIZE } from "../core/constants";
import type { Axis, Dir, LogicalIndex, Ms, Px, VirtualWindow, WindowSize } from "../core/types";

export interface CarouselGatesState {
  readonly reducedMotion: boolean;
  readonly focusWithin: boolean;
  readonly hover: boolean;
  readonly visibilityHidden: boolean;
  readonly dragging: boolean;
  readonly manualPause: boolean;
}

export type CarouselA11yLiveMode = "off" | "polite" | "assertive";

export interface CarouselA11yState {
  /**
   * aria-live mode for the announcer region.
   *
   * Policy guidance:
   * - "off" while autoplay is rotating (avoid spam)
   * - "polite" for user-driven changes on settle
   * - "assertive" only for explicit alerts/errors (not normal navigation)
   */
  readonly liveMode: CarouselA11yLiveMode;

  /**
   * Master switch for announcements (user preference / reduced-motion / etc).
   */
  readonly announceEnabled: boolean;

  /**
   * The last announcement text to be rendered in an aria-live region.
   * Null means “no current announcement.”
   */
  readonly lastAnnouncement: string | null;
}

export interface CarouselMeasureState {
  /**
   * Viewport length on the main axis. Null until measured.
   */
  readonly viewportMain: Px | null;

  /**
   * Gap between slides along the axis in px.
   * If you want per-slide gaps later, move this to sizing model.
   */
  readonly gap: Px;

  /**
   * Slide sizes by logical index (main axis).
   */
  readonly slideSizeByIndex: ReadonlyMap<number, Px>;
}

export interface CarouselVirtualState {
  readonly enabled: true;
  readonly windowSize: WindowSize;
  readonly overscan: number;

  /**
   * Current computed window of logical indices to render (inclusive bounds).
   * Null until we have enough info (e.g., slideCount).
   */
  readonly window: VirtualWindow | null;

  /**
   * Logical indices that must stay rendered (focus pinning).
   */
  readonly pinned: ReadonlySet<number>;

  /**
   * Epoch increments when window crosses a loop seam, used to produce stable DOM keys.
   */
  readonly epoch: number;
}

export interface CarouselMotionState {
  /**
   * Token increments for each new motion request.
   * Used to enforce "exactly one settle".
   */
  readonly token: number;

  /**
   * The token currently expected to settle (if any).
   */
  readonly pendingToken: number | null;

  /**
   * Whether we believe the carousel is in an animating transition.
   * This is a policy signal, not a DOM truth.
   */
  readonly isAnimating: boolean;
}

export interface CarouselAutoplayState {
  readonly enabled: boolean;
  readonly intervalMs: Ms;
}

export interface CarouselState {
  readonly axis: Axis;
  readonly dir: Dir;
  readonly loop: boolean;

  readonly slideCount: number;

  /**
   * Logical "active index" committed only on settle boundaries.
   */
  readonly index: LogicalIndex;

  /**
   * Last known scroll offset in px on main axis.
   * Updated in hot path, stored here only on boundaries (or if you choose to).
   */
  readonly scrollPx: Px;

  readonly isDragging: boolean;

  readonly measure: CarouselMeasureState;
  readonly virtual: CarouselVirtualState;
  readonly motion: CarouselMotionState;
  readonly gates: CarouselGatesState;
  readonly autoplay: CarouselAutoplayState;
  readonly a11y: CarouselA11yState;
}

export interface CreateInitialStateOptions {
  readonly axis: Axis;
  readonly dir: Dir;
  readonly loop: boolean;

  readonly slideCount: number;
  readonly initialIndex?: number;

  readonly gapPx?: number;

  readonly virtualWindowSize?: number;
  readonly virtualOverscan?: number;

  readonly autoplayEnabled?: boolean;
  readonly autoplayIntervalMs?: number;

  readonly reducedMotion?: boolean;
}

export function createInitialState(opts: CreateInitialStateOptions): CarouselState {
  const slideCount = Math.max(0, Math.trunc(opts.slideCount));
  const initialIndex = asIndex(Math.max(0, Math.trunc(opts.initialIndex ?? 0)));

  return {
    axis: opts.axis,
    dir: opts.dir,
    loop: opts.loop,

    slideCount,
    index: initialIndex,

    scrollPx: asPx(0),

    isDragging: false,

    measure: {
      viewportMain: null,
      gap: asPx(Math.max(0, opts.gapPx ?? 0)),
      slideSizeByIndex: new Map<number, Px>(),
    },

    virtual: {
      enabled: true,
      windowSize: asWindowSize(
        Math.max(1, Math.trunc(opts.virtualWindowSize ?? DEFAULT_WINDOW_SIZE)),
      ),
      overscan: Math.max(0, Math.trunc(opts.virtualOverscan ?? DEFAULT_OVERSCAN)),
      window: null,
      pinned: new Set<number>(),
      epoch: 0,
    },

    motion: {
      token: 0,
      pendingToken: null,
      isAnimating: false,
    },

    gates: {
      reducedMotion: Boolean(opts.reducedMotion ?? false),
      focusWithin: false,
      hover: false,
      visibilityHidden: false,
      dragging: false,
      manualPause: false,
    },

    autoplay: {
      enabled: Boolean(opts.autoplayEnabled ?? false),
      intervalMs: asMs(Math.max(0, Math.trunc(opts.autoplayIntervalMs ?? 5000))),
    },

    a11y: {
      liveMode: "polite",
      announceEnabled: true,
      lastAnnouncement: null,
    },
  };
}
