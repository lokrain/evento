/**
 * RAF sampler helper for settle detection.
 *
 * This file intentionally owns NO settle state.
 * It only schedules sampling and lets the caller decide:
 * - how to read scroll px
 * - how to update settle machine state
 * - how to commit/clear on settle
 */

export interface RafSettleSampler {
  start(): void;
  stop(): void;
  isRunning(): boolean;
}

export function createRafSettleSampler(params: {
  /**
   * Returns true if we should keep sampling.
   * Typically: settleStateRef.current.pendingToken !== null
   */
  readonly shouldContinue: () => boolean;

  /**
   * Called once per frame while shouldContinue() is true.
   * Caller performs: sampleSettle(...) and commit if needed.
   */
  readonly onFrame: () => void;
}): RafSettleSampler {
  let rafId: number | null = null;

  const loop = () => {
    rafId = null;

    if (!params.shouldContinue()) {
      return;
    }

    params.onFrame();
    rafId = requestAnimationFrame(loop);
  };

  return {
    start() {
      if (rafId !== null) return;
      if (!params.shouldContinue()) return;
      rafId = requestAnimationFrame(loop);
    },
    stop() {
      if (rafId === null) return;
      cancelAnimationFrame(rafId);
      rafId = null;
    },
    isRunning() {
      return rafId !== null;
    },
  };
}
