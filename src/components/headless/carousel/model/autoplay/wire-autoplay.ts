import type { LiveRegionPoliteness } from "../../core/types";
import { computeAutoplayGates } from "./gates";
import { computeAutoplayPolicy } from "./policy";

export interface AutoplayDerivationInput {
  readonly autoplayEnabled: boolean;
  readonly autoplayIntervalMs: number;
  readonly slideCount: number;

  readonly gates: Readonly<{
    manualPause: boolean;
    hover: boolean;
    focusWithin: boolean;
    visibilityHidden: boolean;
    dragging: boolean;
    reducedMotion: boolean;
  }>;

  readonly announceEnabled: boolean;
  readonly baselineLiveMode: LiveRegionPoliteness;
}

export interface AutoplayDerived {
  readonly gates: ReturnType<typeof computeAutoplayGates>;
  readonly plan: ReturnType<typeof computeAutoplayPolicy>;
}

/**
 * Derive autoplay gates + policy from primitive inputs.
 *
 * Contract:
 * - Pure (no DOM, no timers).
 * - Single source of truth: callers should compute this once per render and reuse it
 *   for both effects (start/stop ticker, live region mode) and controller state.
 */
export function deriveAutoplay(input: AutoplayDerivationInput): AutoplayDerived {
  const gates = computeAutoplayGates({
    enabled: input.autoplayEnabled,
    intervalMs: input.autoplayIntervalMs,
    slideCount: input.slideCount,
    gates: {
      manualPause: input.gates.manualPause,
      hover: input.gates.hover,
      focusWithin: input.gates.focusWithin,
      visibilityHidden: input.gates.visibilityHidden,
      dragging: input.gates.dragging,
      reducedMotion: input.gates.reducedMotion,
    },
  });

  const plan = computeAutoplayPolicy({
    gates,
    announceEnabled: input.announceEnabled,
    baselineLiveMode: input.baselineLiveMode,
  });

  return { gates, plan };
}
