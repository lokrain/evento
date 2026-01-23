import { DEFAULT_SNAP_EPSILON_PX, SETTLE_STABILITY_FRAMES } from "../../core/constants";

/**
 * Pure settle detection state machine.
 *
 * Important:
 * - This module does NOT schedule sampling and does NOT subscribe to events.
 * - Callers must:
 *   1) startSettleTracking(token, initialPx)
 *   2) sampleSettle(px) from a low-frequency sampler (RAF loop)
 *      AND/OR notifyScrollEnd() from a scrollend listener
 *   3) observe settledToken and commit exactly once
 *   4) clearSettled() after committing
 */

export interface SettleMachineState {
  readonly pendingToken: number | null;
  readonly lastPx: number | null;
  readonly stableFrames: number;

  /**
   * Once non-null, caller should commit settle exactly once then clear.
   */
  readonly settledToken: number | null;
}

export interface SettleMachineConfig {
  readonly epsilonPx?: number;
  readonly requiredStableFrames?: number;
}

export const createInitialSettleState = (): SettleMachineState => ({
  pendingToken: null,
  lastPx: null,
  stableFrames: 0,
  settledToken: null,
});

export function startSettleTracking(
  _state: SettleMachineState,
  token: number,
  initialPx: number
): SettleMachineState {
  const t = toNonNegInt(token);
  return {
    pendingToken: t,
    lastPx: toFinite(initialPx),
    stableFrames: 0,
    settledToken: null,
  };
}

/**
 * Call from a low-frequency sampler (RAF loop while pending),
 * not from raw scroll events.
 */
export function sampleSettle(
  state: SettleMachineState,
  px: number,
  cfg?: SettleMachineConfig
): SettleMachineState {
  if (state.pendingToken === null) return state;
  if (state.settledToken !== null) return state;

  const epsilon = cfg?.epsilonPx ?? DEFAULT_SNAP_EPSILON_PX;
  const required = cfg?.requiredStableFrames ?? SETTLE_STABILITY_FRAMES;

  const cur = toFinite(px);
  const prev = state.lastPx ?? cur;

  const stable = Math.abs(cur - prev) <= epsilon;
  const nextStableFrames = stable ? state.stableFrames + 1 : 0;

  if (nextStableFrames >= required) {
    return {
      pendingToken: state.pendingToken,
      lastPx: cur,
      stableFrames: nextStableFrames,
      settledToken: state.pendingToken,
    };
  }

  return { ...state, lastPx: cur, stableFrames: nextStableFrames };
}

/**
 * Call when the browser emits `scrollend` (if supported).
 */
export function notifyScrollEnd(state: SettleMachineState): SettleMachineState {
  if (state.pendingToken === null) return state;
  if (state.settledToken !== null) return state;
  return { ...state, settledToken: state.pendingToken };
}

export function clearSettled(state: SettleMachineState): SettleMachineState {
  if (state.settledToken === null) return state;
  return { ...state, settledToken: null };
}

export function resetSettleTracking(_state: SettleMachineState): SettleMachineState {
  return createInitialSettleState();
}

function toNonNegInt(n: number): number {
  const i = Math.trunc(n);
  return i < 0 ? 0 : i;
}

function toFinite(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return n;
}
