import type { Px } from "../../core/types";
import {
  createInitialSettleState,
  startSettleTracking,
  sampleSettle,
  notifyScrollEnd,
  clearSettled,
  resetSettleTracking,
  type SettleMachineState,
} from "./settle-machine";

/**
 * Owns the settle machine state and exposes an imperative, explicit API.
 *
 * This keeps:
 * - settle-machine pure
 * - lifecycle wiring explicit
 * - integration testable
 */
export function createSettleDriver() {
  let state: SettleMachineState = createInitialSettleState();

  return {
    /** Call when MOTION/START is dispatched */
    onMotionStart(token: number, initialPx: Px) {
      state = startSettleTracking(state, token, initialPx as unknown as number);
    },

    /** Call from a low-frequency sampler (RAF while pending) */
    onSample(px: Px) {
      state = sampleSettle(state, px as unknown as number);
      return state.settledToken;
    },

    /** Call from scrollend listener if supported */
    onScrollEnd() {
      state = notifyScrollEnd(state);
      return state.settledToken;
    },

    /** Call after committing settle (NAV/COMMIT_INDEX + MOTION/SETTLE_COMMIT) */
    clearSettled() {
      state = clearSettled(state);
    },

    /** Call on cancel/reset/unmount */
    reset() {
      state = resetSettleTracking(state);
    },

    /** For diagnostics / testing only */
    getState(): SettleMachineState {
      return state;
    },
  };
}
