export type MeasureCallback = () => void;

const queue = new Set<MeasureCallback>();
let rafId: number | null = null;

export function enqueueMeasure(callback: MeasureCallback) {
  queue.add(callback);

  if (rafId !== null) return;
  if (typeof requestAnimationFrame !== "function") return;

  rafId = requestAnimationFrame(() => {
    rafId = null;
    flushMeasureQueue();
  });
}

export function flushMeasureQueue() {
  const callbacks = Array.from(queue);
  queue.clear();

  for (const cb of callbacks) {
    cb();
  }
}
