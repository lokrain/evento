import type { Px, VirtualWindow } from "../core/types";
import type { CarouselA11yLiveMode, CarouselGatesState } from "../store/state";

export type GateKey = keyof CarouselGatesState;

export type CarouselAction =
  // Measure
  | {
    readonly type: "MEASURE/SET_GAP";
    readonly payload: {
      readonly gapPx: number;
    };
  }
  | {
    readonly type: "MEASURE/FLUSH";
    readonly payload: {
      readonly viewportMainPx: number | null;
      readonly slideSizeByIndex: ReadonlyMap<number, Px>;
    };
  }

  // Navigation (intent vs commit)
  | {
    readonly type: "NAV/SET_SLIDE_COUNT";
    readonly payload: {
      readonly slideCount: number;
    };
  }
  | {
    readonly type: "NAV/REQUEST";
    readonly payload: {
      readonly kind: "next" | "prev" | "goto";
      readonly index?: number;
      readonly source: "api" | "keyboard" | "button" | "autoplay";
    };
  }
  | {
    readonly type: "NAV/COMMIT_INDEX";
    readonly payload: {
      readonly index: number;
      readonly source: "settle" | "external";
    };
  }

  // Motion / settle lifecycle (tokened)
  | {
    readonly type: "MOTION/START";
    readonly payload: {
      readonly isAnimating: boolean;
      readonly reason: "nav" | "drag" | "measure" | "external";
    };
  }
  | {
    readonly type: "MOTION/SETTLE_PENDING";
    readonly payload: {
      readonly token: number;
    };
  }
  | {
    readonly type: "MOTION/SETTLE_COMMIT";
    readonly payload: {
      readonly token: number;
    };
  }
  | {
    readonly type: "MOTION/CLEAR";
    readonly payload: {
      readonly reason: "cancel" | "reset";
    };
  }

  // Virtualization
  | {
    readonly type: "VIRTUAL/SET_WINDOW";
    readonly payload: {
      readonly window: VirtualWindow | null;
    };
  }
  | {
    readonly type: "VIRTUAL/PIN";
    readonly payload: {
      readonly index: number;
      readonly reason: "focus" | "custom";
    };
  }
  | {
    readonly type: "VIRTUAL/UNPIN";
    readonly payload: {
      readonly index: number;
      readonly reason: "focus" | "custom";
    };
  }
  | {
    readonly type: "VIRTUAL/SET_EPOCH";
    readonly payload: {
      readonly epoch: number;
      readonly reason: "loop-seam" | "reset";
    };
  }

  // Gates + autoplay config
  | {
    readonly type: "GATE/SET";
    readonly payload: {
      readonly gate: GateKey;
      readonly value: boolean;
      readonly source: "dom" | "policy" | "api";
    };
  }
  | {
    readonly type: "AUTOPLAY/SET_ENABLED";
    readonly payload: {
      readonly enabled: boolean;
      readonly source: "api" | "policy";
    };
  }
  | {
    readonly type: "AUTOPLAY/SET_INTERVAL";
    readonly payload: {
      readonly intervalMs: number;
      readonly source: "api" | "policy";
    };
  }
  | {
    readonly type: "AUTOPLAY/MANUAL_PAUSE";
    readonly payload: {
      readonly paused: boolean;
      readonly source: "api" | "dom";
    };
  }

  // A11y policy + announcements
  | {
    readonly type: "A11Y/SET_LIVE_MODE";
    readonly payload: {
      readonly mode: CarouselA11yLiveMode;
      readonly source: "policy" | "api";
    };
  }
  | {
    readonly type: "A11Y/SET_ANNOUNCE_ENABLED";
    readonly payload: {
      readonly enabled: boolean;
      readonly source: "policy" | "api";
    };
  }
  | {
    readonly type: "A11Y/ANNOUNCE";
    readonly payload: {
      readonly text: string | null;
      readonly source: "policy" | "api";
    };
  }
  | {
    readonly type: "A11Y/CLEAR_ANNOUNCEMENT";
    readonly payload: {
      readonly source: "policy" | "api";
    };
  };
