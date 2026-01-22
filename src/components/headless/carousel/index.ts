// src/components/headless/carousel/index.ts

// Hook
export { useCarousel } from "./engine/use-carousel";
export { default as useCarouselDefault } from "./engine/use-carousel";

// Public types (re-export from the canonical public types file)
export type {
  UseCarouselOptions,
  CarouselReturn,
  CarouselEngine,
  CarouselBindings,

  Axis,
  ReadingDirection,
  SnapTarget,
  LiveRegionPoliteness,

  CommitThreshold,
  AutoplayGate,

  Controllable,
  Controlled,
  Uncontrolled,

  CapabilityOf,
  IndexCapabilityOf,
  PlayingCapabilityOf,

  ReadonlyCapability,
  WritableCapability,
  ReadonlyIndex,
  WritableIndex,
  ReadonlyPlaying,
  WritablePlaying,
} from "./engine/types-public";
