// src/components/headless/carousel/core/types.ts

import type * as React from "react";

export type Axis = "x" | "y";
export type ReadingDirection = "ltr" | "rtl";
export type Dir = ReadingDirection;
export type SnapTarget = "start" | "center" | "end";
export type LiveRegionPoliteness = "off" | "polite" | "assertive";

export type LogicalIndex = number & { readonly __brand: "LogicalIndex" };
export type Px = number & { readonly __brand: "Px" };
export type Ms = number & { readonly __brand: "Ms" };

export type WindowSize = number & { readonly __brand: "WindowSize" };

export interface ViewportSize {
  readonly main: Px;
}

export interface SlideMeasurement {
  readonly index: LogicalIndex;
  readonly size: Px;
}

export interface VirtualWindow {
  readonly start: LogicalIndex;
  readonly end: LogicalIndex;
  readonly size: WindowSize;
}

export type DataAttributes = Partial<Record<`data-${string}`, string | number | boolean>>;

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

export type ReadonlyCapability = { __capability: "readonly" };
export type WritableCapability = { __capability: "writable" };

export type CapabilityOf<C extends Controllable<unknown>> = C extends {
  mode: "controlled";
  readonly: true;
}
  ? ReadonlyCapability
  : WritableCapability;

export type ReadonlyIndex = { __index: "readonly" };
export type WritableIndex = { __index: "writable" };

export type IndexCapabilityOf<C extends Controllable<number>> = C extends {
  mode: "controlled";
  readonly: true;
}
  ? ReadonlyIndex
  : WritableIndex;

export type ReadonlyPlaying = { __playing: "readonly" };
export type WritablePlaying = { __playing: "writable" };

export type PlayingCapabilityOf<C extends Controllable<boolean>> = C extends {
  mode: "controlled";
  readonly: true;
}
  ? ReadonlyPlaying
  : WritablePlaying;

export type AutoplayGate =
  | "hover"
  | "focusWithin"
  | "dragging"
  | "visibilityHidden"
  | "reducedMotion"
  | "manualPause";

export type CommitThreshold =
  | { kind: "px"; value: number }
  | { kind: "viewport"; value: number }
  | { kind: "slide"; value: number }
  | { kind: "snap"; value: number };

export interface UseCarouselOptions<
  IndexC extends Controllable<number> = Uncontrolled<number>,
  PlayingC extends Controllable<boolean> = Uncontrolled<boolean>,
> {
  slideCount: number;

  layout?: {
    axis?: Axis;
    readingDirection?: ReadingDirection;
    snapTo?: SnapTarget;
  };

  loop?: {
    enabled?: boolean;
    buffer?: "small" | "medium" | "large";
  };

  index?: IndexC;
  onIndexChange?: (index: number) => void;
  onSettle?: (index: number) => void;

  interaction?: {
    draggable?: boolean;
    step?: number;
    commitThreshold?: CommitThreshold;
    fling?: {
      enabled?: boolean;
      strength?: "subtle" | "normal" | "strong";
    };
  };

  motion?: {
    transitionDurationMs?: number;
    easing?: string;
    disabled?: boolean;
  };

  measure?: {
    observeResize?: boolean;
    remeasureOnNextFrame?: boolean;
  };

  autoplay?: {
    enabled?: boolean;
    playing?: PlayingC;
    mode?: "step" | "continuous";
    startDelayMs?: number;
    dwellMs?: number | ((ctx: { index: number; slideCount: number }) => number);
    speedPxPerSec?: number;
    resumeAfterInteraction?: boolean;
    pauseWhenHidden?: boolean;
  };

  accessibility?: {
    label?: string;
    controlsId?: string;
    live?: LiveRegionPoliteness;
    announceChanges?: boolean;
    tabIndex?: number;
  };

  debug?: boolean;
}

export interface CarouselRefs {
  root: (node: HTMLElement | null) => void;
  viewport: (node: HTMLDivElement | null) => void;
  track: (node: HTMLDivElement | null) => void;
  slide: (renderIndex: number) => (node: HTMLElement | null) => void;
}

export type AutoplayController<PlayingC extends Controllable<boolean>> = {
  enabled: boolean;
  isPlaying: boolean;
  setGate(gate: AutoplayGate, active: boolean): void;
  getGates(): Readonly<Record<AutoplayGate, boolean>>;
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

/**
 * Public imperative navigation API derived from the index capability.
 */
export type CarouselApi<IndexC extends Controllable<number>> = NavigationCommands<IndexC>;

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

export interface CarouselBindings {
  getRootProps<P extends React.ComponentPropsWithRef<"div"> & DataAttributes>(user?: P): P;
  getViewportProps<P extends React.ComponentPropsWithRef<"div"> & DataAttributes>(user?: P): P;
  getTrackProps<P extends React.ComponentPropsWithRef<"div"> & DataAttributes>(user?: P): P;
  getSlideProps<P extends React.ComponentPropsWithRef<"div"> & DataAttributes>(
    renderIndex: number,
    user?: P,
  ): P;

  getPrevButtonProps<P extends React.ComponentPropsWithRef<"button"> & DataAttributes>(user?: P): P;
  getNextButtonProps<P extends React.ComponentPropsWithRef<"button"> & DataAttributes>(user?: P): P;

  pagination: {
    count: number;
    index: number;
    getListProps<P extends React.ComponentPropsWithRef<"div"> & DataAttributes>(user?: P): P;
    getDotProps<P extends React.ComponentPropsWithRef<"button"> & DataAttributes>(
      index: number,
      user?: P,
    ): P;
  };

  autoplayToggle: {
    getButtonProps<P extends React.ButtonHTMLAttributes<HTMLButtonElement> & DataAttributes>(user?: P): P;
  };

  announcer: {
    message: string | null;
    getProps<P extends React.HTMLAttributes<HTMLElement> & DataAttributes>(user?: P): P;
  };
}

export interface CarouselReturn<
  IndexC extends Controllable<number>,
  PlayingC extends Controllable<boolean>,
> {
  engine: CarouselEngine<IndexC, PlayingC>;
  bindings: CarouselBindings;
}
