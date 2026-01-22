/**
 * Public API types for the Carousel Engine.
 *
 * Max strictness principles:
 * - Strict controllable ownership (controlled / uncontrolled / readonly-controlled)
 * - Capability-typed commands:
 *   - readonly-controlled `index` removes navigation commands at compile time
 *   - readonly-controlled `autoplay.playing` removes play/pause/toggle at compile time
 * - Options are generic over both controllables so return types reflect capability
 * - Separation of Engine (algorithm/state) and Bindings (DOM/ARIA/event wiring)
 */

import type * as React from "react";

/* -------------------------------------------------------------------------------------------------
 * Core primitives
 * ------------------------------------------------------------------------------------------------- */

export type Axis = "x" | "y";
export type ReadingDirection = "ltr" | "rtl";
export type SnapTarget = "start" | "center";
export type LiveRegionPoliteness = "polite" | "assertive";

/* -------------------------------------------------------------------------------------------------
 * Strict controllable state
 * ------------------------------------------------------------------------------------------------- */

export type Controlled<T> =
  | {
      mode: "controlled";
      value: T;
      onChange: (next: T) => void;
    }
  | {
      mode: "controlled";
      value: T;
      readonly: true;
      onChange?: never;
    };

export type Uncontrolled<T> = {
  mode: "uncontrolled";
  defaultValue?: T;
  onChange?: (next: T) => void;
};

export type Controllable<T> = Controlled<T> | Uncontrolled<T>;

/* -------------------------------------------------------------------------------------------------
 * Capability typing (generic)
 * ------------------------------------------------------------------------------------------------- */

export type ReadonlyCapability = { __capability: "readonly" };
export type WritableCapability = { __capability: "writable" };

/**
 * Generic capability classifier for any Controllable<T>.
 * - Read-only controlled => readonly
 * - Otherwise => writable
 */
export type CapabilityOf<C extends Controllable<unknown>> =
  C extends { mode: "controlled"; readonly: true } ? ReadonlyCapability : WritableCapability;

export type ReadonlyIndex = { __index: "readonly" };
export type WritableIndex = { __index: "writable" };

export type IndexCapabilityOf<C extends Controllable<number>> =
  C extends { mode: "controlled"; readonly: true } ? ReadonlyIndex : WritableIndex;

export type ReadonlyPlaying = { __playing: "readonly" };
export type WritablePlaying = { __playing: "writable" };

export type PlayingCapabilityOf<C extends Controllable<boolean>> =
  C extends { mode: "controlled"; readonly: true } ? ReadonlyPlaying : WritablePlaying;

/* -------------------------------------------------------------------------------------------------
 * Autoplay gating
 * ------------------------------------------------------------------------------------------------- */

export type AutoplayGate =
  | "hover"
  | "focusWithin"
  | "dragging"
  | "visibilityHidden"
  | "reducedMotion"
  | "manual";

/* -------------------------------------------------------------------------------------------------
 * Interaction thresholds (explicit units)
 * ------------------------------------------------------------------------------------------------- */

export type CommitThreshold =
  | { kind: "px"; value: number }
  | { kind: "viewport"; value: number } // 0..1 of viewport length
  | { kind: "slide"; value: number } // 0..1 of current slide length
  | { kind: "snap"; value: number }; // 0..1 of snap spacing

/* -------------------------------------------------------------------------------------------------
 * Options (generic over index + autoplay playing controllables)
 * ------------------------------------------------------------------------------------------------- */

export interface UseCarouselOptions<
  IndexC extends Controllable<number> = Uncontrolled<number>,
  PlayingC extends Controllable<boolean> = Uncontrolled<boolean>,
> {
  slideCount: number;

  layout?: {
    axis?: Axis; // default: "x"
    readingDirection?: ReadingDirection; // default: "ltr"
    snapTo?: SnapTarget; // default: "start"
  };

  loop?: {
    enabled?: boolean; // default: true
    buffer?: "small" | "medium" | "large"; // default: "medium"
  };

  index?: IndexC;
  onIndexChange?: (index: number) => void;
  onSettle?: (index: number) => void;

  interaction?: {
    draggable?: boolean; // default: true
    step?: number; // default: 1
    commitThreshold?: CommitThreshold; // default: { kind: "snap", value: 0.5 }
    fling?: {
      enabled?: boolean; // default: true
      strength?: "subtle" | "normal" | "strong"; // default: "normal"
    };
  };

  motion?: {
    transitionDurationMs?: number; // default: 320
    easing?: string; // default: "ease-out"
    disabled?: boolean; // default: false
  };

  measure?: {
    observeResize?: boolean; // default: true
    remeasureOnNextFrame?: boolean; // default: true
  };

  autoplay?: {
    enabled?: boolean; // default: false
    /**
     * The autoplay playing state is capability-typed.
     * If readonly-controlled, play/pause/toggle are removed at compile time.
     */
    playing?: PlayingC;
    mode?: "step" | "continuous"; // default: "step"
    startDelayMs?: number;
    dwellMs?: number | ((ctx: { index: number; slideCount: number }) => number);
    speedPxPerSec?: number; // default: 600
    resumeAfterInteraction?: boolean; // default: true
    pauseWhenHidden?: boolean; // default: true
  };

  accessibility?: {
    label?: string; // default: "Carousel"
    controlsId?: string;
    live?: LiveRegionPoliteness; // default: "polite"
    announceChanges?: boolean; // default: true
  };

  debug?: boolean; // default: false
}

/* -------------------------------------------------------------------------------------------------
 * Engine types
 * ------------------------------------------------------------------------------------------------- */

export interface CarouselRefs {
  root: (node: HTMLElement | null) => void;
  viewport: (node: HTMLDivElement | null) => void;
  track: (node: HTMLDivElement | null) => void;
  slide: (renderIndex: number) => (node: HTMLElement | null) => void;
}

export type AutoplayController<PlayingC extends Controllable<boolean>> = {
  enabled: boolean;
  isPlaying: boolean;

  /**
   * Gate evaluation is engine-owned. Bindings/subsystems report gate state;
   * autoplay policy decides whether playback is allowed.
   */
  setGate(gate: AutoplayGate, active: boolean): void;
  getGates(): Readonly<Record<AutoplayGate, boolean>>;

  /**
   * These are available only when `playing` is writable (uncontrolled or writable-controlled).
   */
  play: PlayingCapabilityOf<PlayingC> extends WritablePlaying ? () => void : never;
  pause: PlayingCapabilityOf<PlayingC> extends WritablePlaying ? () => void : never;
  toggle: PlayingCapabilityOf<PlayingC> extends WritablePlaying ? () => void : never;
};

export type NavigationCommands<IndexC extends Controllable<number>> = {
  goTo: IndexCapabilityOf<IndexC> extends WritableIndex
    ? (index: number, opts?: { transitionDurationMs?: number }) => void
    : never;

  next: IndexCapabilityOf<IndexC> extends WritableIndex
    ? (opts?: { transitionDurationMs?: number }) => void
    : never;

  prev: IndexCapabilityOf<IndexC> extends WritableIndex
    ? (opts?: { transitionDurationMs?: number }) => void
    : never;
};

export interface CarouselEngine<
  IndexC extends Controllable<number>,
  PlayingC extends Controllable<boolean>,
> extends NavigationCommands<IndexC> {
  index: number;
  isReady: boolean;
  isDragging: boolean;
  isAnimating: boolean;

  renderCount: number;
  realIndexFromRenderIndex(renderIndex: number): number;

  refs: CarouselRefs;

  autoplay: AutoplayController<PlayingC>;
}

/* -------------------------------------------------------------------------------------------------
 * Bindings types
 *
 * Note: Bindings are intentionally not capability-typed. In readonly index mode, navigation props
 * should still be safe at runtime (e.g., disabled buttons). Capability typing applies to engine
 * commands (imperative API) where it yields the most value and least friction.
 * ------------------------------------------------------------------------------------------------- */

export interface CarouselBindings {
  getRootProps<P extends React.ComponentPropsWithRef<"div">>(user?: P): P;
  getViewportProps<P extends React.ComponentPropsWithRef<"div">>(user?: P): P;
  getTrackProps<P extends React.ComponentPropsWithRef<"div">>(user?: P): P;
  getSlideProps<P extends React.ComponentPropsWithRef<"div">>(
    renderIndex: number,
    user?: P,
  ): P;

  getPrevButtonProps<P extends React.ComponentPropsWithRef<"button">>(user?: P): P;
  getNextButtonProps<P extends React.ComponentPropsWithRef<"button">>(user?: P): P;

  pagination: {
    count: number;
    index: number;
    getListProps<P extends React.ComponentPropsWithRef<"div">>(user?: P): P;
    getDotProps<P extends React.ComponentPropsWithRef<"button">>(index: number, user?: P): P;
  };

  autoplayToggle: {
    getButtonProps<P extends React.ButtonHTMLAttributes<HTMLButtonElement>>(user?: P): P;
  };

  announcer: {
    message: string | null;
    getProps<P extends React.HTMLAttributes<HTMLElement>>(user?: P): P;
  };
}

/* -------------------------------------------------------------------------------------------------
 * Hook return type
 * ------------------------------------------------------------------------------------------------- */

export interface CarouselReturn<
  IndexC extends Controllable<number>,
  PlayingC extends Controllable<boolean>,
> {
  engine: CarouselEngine<IndexC, PlayingC>;
  bindings: CarouselBindings;
}
