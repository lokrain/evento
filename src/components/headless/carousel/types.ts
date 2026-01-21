import type * as React from "react";
import type { Controllable, DataAttributes } from "@/components/headless/core/props";

export type Axis = "x" | "y";
export type Copies = 3 | 5 | 7 | 9;
export type SnapAlign = "start" | "center";
export type Easing =
  | "linear"
  | "ease"
  | "ease-in"
  | "ease-out"
  | "ease-in-out"
  | { cubicBezier: [number, number, number, number] };

export type AutoplayPolicy =
  | { enabled: false }
  | {
      enabled: true;
      delayMs: number;
      pauseOnHover?: boolean;
      resumeAfterInteraction?: boolean;
      playing?: Controllable<boolean>;
    };

export type MeasurementPolicy = {
  observeResize?: boolean;
  remeasureOnNextFrame?: boolean;
};

export type SnapPolicy = {
  durationMs?: number;
  easing?: Easing;
  /**
   * 0..1. How “sticky” the snap decision is after drag release.
   * With variable widths, we still pick nearest snap point; threshold is applied to
   * bias toward the next/prev snap based on drag direction.
   */
  threshold?: number;
};

export type UseCarouselOptions = {
  axis?: Axis;
  slideCount: number;
  copies?: Copies;
  align?: SnapAlign;

  /** Real index control */
  indexControl?: Controllable<number>;
  onIndexChange?: (next: number) => void;

  draggable?: boolean;
  slidesToScroll?: number;

  autoplay?: AutoplayPolicy;

  measurement?: MeasurementPolicy;
  snap?: SnapPolicy;

  ariaLabel?: string;
  ariaLive?: React.AriaAttributes["aria-live"];
  /** Optional id of the controlled viewport/track region for aria-controls on buttons. */
  ariaControlsId?: string;
};

export type UseCarouselReturn = {
  /** Settled (snapped) real index in [0..slideCount-1]. */
  index: number;

  isDragging: boolean;
  isSettling: boolean;

  canScrollPrev: boolean;
  canScrollNext: boolean;

  scrollTo: (index: number) => void;
  scrollPrev: () => void;
  scrollNext: () => void;
  setIndex: (next: number | ((prev: number) => number)) => void;

  renderCount: number;
  getRealIndexForRenderIndex: (renderIndex: number) => number;

  getRootProps: <P extends React.HTMLAttributes<HTMLElement>>(
    user?: P,
  ) => P & { role: "region"; "aria-roledescription": "carousel" };

  getViewportProps: <P extends React.HTMLAttributes<HTMLDivElement>>(
    user?: P,
  ) => P & { tabIndex: number; "data-carousel-viewport": "" };

  getTrackProps: <P extends React.HTMLAttributes<HTMLDivElement>>(
    user?: P,
  ) => P & { "data-carousel-track": "" };

  getSlideProps: <P extends React.HTMLAttributes<HTMLElement>>(
    renderIndex: number,
    user?: P,
  ) => P & {
    role: "group";
    "aria-roledescription": "slide";
    "data-render-index": number;
    "data-index": number;
  };

  getPrevButtonProps: <P extends React.ButtonHTMLAttributes<HTMLButtonElement>>(
    user?: P,
  ) => P & { type: "button"; "aria-label": string };

  getNextButtonProps: <P extends React.ButtonHTMLAttributes<HTMLButtonElement>>(
    user?: P,
  ) => P & { type: "button"; "aria-label": string };

  isPlaying: boolean;
  getPlayPauseButtonProps: <P extends React.ButtonHTMLAttributes<HTMLButtonElement>>(
    user?: P,
  ) => P & { type: "button"; "aria-pressed": boolean; "aria-label": string };
};

export type SnapModel = {
  // Snap offsets for ONE cycle (length = slideCount), already aligned (start/center).
  snapOffsets: number[];
  // Total length of one cycle along axis (px), including gaps.
  cycleLength: number;
  // Last measured viewport length along axis (px).
  viewportLength: number;
};

export type ElementProps<E extends HTMLElement, P = Record<string, never>> = P &
  React.HTMLAttributes<E>;
export type WithDataAttrs = DataAttributes;
