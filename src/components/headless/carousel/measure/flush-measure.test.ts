import { enqueueMeasure, flushMeasureQueue } from "./flush-measure";

describe("flushMeasureQueue", () => {
  const originalRaf = globalThis.requestAnimationFrame;

  afterEach(() => {
    globalThis.requestAnimationFrame = originalRaf;
  });

  it("flushes queued callbacks", () => {
    const calls: string[] = [];
    globalThis.requestAnimationFrame = (cb: FrameRequestCallback) => {
      cb(0);
      return 1;
    };

    enqueueMeasure(() => calls.push("a"));
    enqueueMeasure(() => calls.push("b"));

    flushMeasureQueue();
    expect(calls).toEqual(["a", "b"]);
  });
});