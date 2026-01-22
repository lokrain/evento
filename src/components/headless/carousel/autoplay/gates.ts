// src/components/headless/carousel/autoplay/gates.ts
import type { AutoplayGate } from "../engine/types-public";

export type AutoplayMode = "step" | "continuous";

export type AutoplayGateState = Readonly<Record<AutoplayGate, boolean>>;

export type EvaluateAutoplayArgs = Readonly<{
  enabled: boolean;
  slideCount: number;
  gates: AutoplayGateState;
  mode: AutoplayMode;
}>;

export type AutoplayDecision = Readonly<{
  /**
   * Whether autoplay is allowed to run right now (i.e., timers/motion may proceed).
   */
  allowed: boolean;

  /**
   * Reason for the decision, intended for debug tooling and unit tests.
   * - "disabled": autoplay feature disabled
   * - "slideCount": slideCount <= 1
   * - "gate:*": a specific gate is active
   */
  reason:
  | "disabled"
  | "slideCount"
  | `gate:${AutoplayGate}`;

  /**
   * Convenience list of active gates (stable ordering by gate name).
   */
  activeGates: readonly AutoplayGate[];
}>;

/**
 * Pure autoplay gate evaluation.
 *
 * Contract:
 * - Inactive if slideCount <= 1
 * - Paused if any gate is active
 * - Mode does NOT bypass gates (continuous must still respect gates)
 */
export function evaluateAutoplay(args: EvaluateAutoplayArgs): AutoplayDecision {
  const { enabled, slideCount, gates } = args;

  if (!enabled) {
    return { allowed: false, reason: "disabled", activeGates: [] };
  }

  if (slideCount <= 1) {
    return { allowed: false, reason: "slideCount", activeGates: [] };
  }

  const activeGates = (Object.keys(gates) as AutoplayGate[])
    .filter((g) => gates[g] === true)
    .sort((a, b) => a.localeCompare(b));

  if (activeGates.length > 0) {
    // Deterministic: report the first active gate (sorted) as reason
    const first = activeGates[0];
    return { allowed: false, reason: `gate:${first}`, activeGates };
  }

  return { allowed: true, reason: "disabled" as never, activeGates: [] };
}

/**
 * Helper: returns boolean only (useful for hot paths).
 */
export function isAutoplayAllowed(args: EvaluateAutoplayArgs): boolean {
  const d = evaluateAutoplay(args);
  return d.allowed;
}
