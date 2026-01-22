import type { Controllable } from "./types-public";
import type { NormalizedOptions } from "./types-internal";

export function normalizeOptions<IndexC extends Controllable<number>, PlayingC extends Controllable<boolean>>(
  options: any,
): NormalizedOptions<IndexC, PlayingC> {
  const slideCount = toInt(options?.slideCount, 0);
  if (!(slideCount > 0)) {
    throw new Error("slideCount must be > 0");
  }

  const layout = {
    axis: options?.layout?.axis ?? "x",
    readingDirection: options?.layout?.readingDirection ?? "ltr",
    snapTo: options?.layout?.snapTo ?? "start",
  } as const;

  const loop = {
    enabled: options?.loop?.enabled ?? true,
    buffer: options?.loop?.buffer ?? "medium",
  } as const;

  const interaction = {
    draggable: options?.interaction?.draggable ?? true,
    step: toInt(options?.interaction?.step, 1),
    commitThreshold: options?.interaction?.commitThreshold ?? { kind: "snap", value: 0.5 },
    fling: {
      enabled: options?.interaction?.fling?.enabled ?? true,
      strength: options?.interaction?.fling?.strength ?? "normal",
    },
  } as const;

  const motion = {
    transitionDurationMs: options?.motion?.transitionDurationMs ?? 320,
    easing: options?.motion?.easing ?? "ease-out",
    disabled: options?.motion?.disabled ?? false,
  } as const;

  const measure = {
    observeResize: options?.measure?.observeResize ?? true,
    remeasureOnNextFrame: options?.measure?.remeasureOnNextFrame ?? true,
  } as const;

  const autoplay = {
    enabled: options?.autoplay?.enabled ?? false,
    playing: options?.autoplay?.playing,
    mode: options?.autoplay?.mode ?? "step",
    startDelayMs: options?.autoplay?.startDelayMs,
    dwellMs: options?.autoplay?.dwellMs,
    speedPxPerSec: options?.autoplay?.speedPxPerSec ?? 600,
    resumeAfterInteraction: options?.autoplay?.resumeAfterInteraction ?? true,
    pauseWhenHidden: options?.autoplay?.pauseWhenHidden ?? true,
  } as const;

  const accessibility = {
    label: options?.accessibility?.label ?? "Carousel",
    controlsId: options?.accessibility?.controlsId,
    live: options?.accessibility?.live ?? "polite",
    announceChanges: options?.accessibility?.announceChanges ?? true,
  } as const;

  return {
    slideCount,
    layout,
    loop,
    interaction,
    motion,
    measure,
    autoplay,
    accessibility,
    index: options?.index,
    onIndexChange: options?.onIndexChange,
    onSettle: options?.onSettle,
    debug: options?.debug ?? false,
  };
}

function toInt(value: unknown, fallback: number): number {
  const n = typeof value === "number" && Number.isFinite(value) ? Math.trunc(value) : fallback;
  return n;
}