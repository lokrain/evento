import type { Controllable, SnapTarget, UseCarouselOptions } from "../core/types";
import type { CreateInitialStateOptions } from "./state";

export interface NormalizedOptions {
  readonly initialState: CreateInitialStateOptions;
  readonly label: string;
  readonly align: SnapTarget;
  readonly smoothScroll: boolean;
  readonly indexReadonly: boolean;
  readonly playingReadonly: boolean;
}

/**
 * Normalize consumer options into a canonical shape for the orchestrator.
 *
 * Contract:
 * - Pure (no DOM, no timers, no React).
 * - Establishes the only interpretation of UseCarouselOptions for initial state.
 * - Keeps "readonly" capabilities explicit for downstream enforcement.
 */
export function normalizeOptions<
  IndexC extends Controllable<number>,
  PlayingC extends Controllable<boolean>,
>(opts: UseCarouselOptions<IndexC, PlayingC>): NormalizedOptions {
  const axis = opts.layout?.axis ?? "x";
  const dir = opts.layout?.readingDirection ?? "ltr";
  const loop = opts.loop?.enabled ?? false;

  const { initialIndex, indexReadonly } = resolveIndexConfig(opts.index);
  const { enabled: autoplayEnabled, playingReadonly } = resolvePlayingConfig(
    opts.autoplay?.playing,
    opts.autoplay?.enabled,
  );

  const intervalMs = resolveAutoplayInterval(opts.autoplay?.dwellMs, opts.autoplay?.startDelayMs);

  const initialState: CreateInitialStateOptions = {
    axis,
    dir,
    loop,
    slideCount: opts.slideCount,
    initialIndex,
    autoplayEnabled,
    autoplayIntervalMs: intervalMs,
  };

  return {
    initialState,
    label: opts.accessibility?.label ?? "Featured items",
    align: opts.layout?.snapTo ?? "center",
    smoothScroll: !opts.motion?.disabled,
    indexReadonly,
    playingReadonly,
  };
}

function resolveIndexConfig(config: Controllable<number> | undefined): {
  readonly initialIndex: number;
  readonly indexReadonly: boolean;
} {
  if (!config) return { initialIndex: 0, indexReadonly: false };

  if (config.mode === "controlled") {
    const isReadonly = "readonly" in config && config.readonly === true;
    return { initialIndex: config.value, indexReadonly: isReadonly };
  }

  return { initialIndex: config.defaultValue ?? 0, indexReadonly: false };
}

function resolvePlayingConfig(
  config: Controllable<boolean> | undefined,
  fallbackEnabled?: boolean,
): { readonly enabled: boolean; readonly playingReadonly: boolean } {
  if (!config) {
    return { enabled: Boolean(fallbackEnabled ?? false), playingReadonly: false };
  }

  if (config.mode === "controlled") {
    const isReadonly = "readonly" in config && config.readonly === true;
    return { enabled: config.value, playingReadonly: isReadonly };
  }

  return {
    enabled: config.defaultValue ?? Boolean(fallbackEnabled ?? false),
    playingReadonly: false,
  };
}

function resolveAutoplayInterval(
  dwell: number | ((ctx: { index: number; slideCount: number }) => number) | undefined,
  startDelayMs: number | undefined,
): number | undefined {
  if (typeof dwell === "number") return dwell;
  if (typeof startDelayMs === "number") return startDelayMs;
  return undefined;
}
