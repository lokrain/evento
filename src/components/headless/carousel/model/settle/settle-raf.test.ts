import { createRafSettleSampler } from "./settle-raf";

describe("createRafSettleSampler", () => {
  const originalRaf = globalThis.requestAnimationFrame;
  const originalCancel = globalThis.cancelAnimationFrame;

  afterEach(() => {
    globalThis.requestAnimationFrame = originalRaf;
    globalThis.cancelAnimationFrame = originalCancel;
  });

  it("schedules frames once and stops when told", () => {
    const queue: FrameRequestCallback[] = [];
    let nextId = 1;

    globalThis.requestAnimationFrame = (cb: FrameRequestCallback) => {
      queue.push(cb);
      return nextId++;
    };
    globalThis.cancelAnimationFrame = () => {};

    let frames = 0;
    let shouldContinue = true;

    const sampler = createRafSettleSampler({
      shouldContinue: () => shouldContinue,
      onFrame: () => {
        frames += 1;
        if (frames >= 2) shouldContinue = false;
      },
    });

    sampler.start();
    sampler.start();
    expect(queue).toHaveLength(1);

    while (queue.length > 0) {
      const cb = queue.shift();
      cb?.(0);
    }

    expect(frames).toBe(2);
    expect(sampler.isRunning()).toBe(false);
  });
});