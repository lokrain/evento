export interface AutoplayTicker {
  start(intervalMs: number): void;
  stop(): void;
  isRunning(): boolean;
}

/**
 * Interval-based ticker.
 *
 * Requirements:
 * - Idempotent start/stop (React 19 Strict Mode safe)
 * - Supports changing interval by calling start(newMs)
 * - No policy logic here; just timekeeping.
 */
export function createAutoplayTicker(onTick: () => void): AutoplayTicker {
  let id: ReturnType<typeof setInterval> | null = null;
  let currentMs: number | null = null;

  const clear = () => {
    if (id === null) return;
    globalThis.clearInterval(id);
    id = null;
    currentMs = null;
  };

  return {
    start(intervalMs: number) {
      const ms = Math.trunc(intervalMs);
      if (!Number.isFinite(ms) || ms <= 0) {
        clear();
        return;
      }

      // If already running at same interval, do nothing.
      if (id !== null && currentMs === ms) return;

      // Restart with new interval.
      clear();
      currentMs = ms;
      id = globalThis.setInterval(() => {
        onTick();
      }, ms);
    },

    stop() {
      clear();
    },

    isRunning() {
      return id !== null;
    },
  };
}
