import { createPointerDragTracker } from "./on-pointer";

describe("createPointerDragTracker", () => {
  it("emits start/move/end after threshold", () => {
    const onStart = jest.fn();
    const onMove = jest.fn();
    const onEnd = jest.fn();

    const handler = createPointerDragTracker({
      thresholdPx: 5,
      onDragStart: onStart,
      onDragMove: onMove,
      onDragEnd: onEnd,
    });

    handler(new PointerEvent("pointerdown", { clientX: 0 }));
    handler(new PointerEvent("pointermove", { clientX: 2 }));
    expect(onStart).not.toHaveBeenCalled();

    handler(new PointerEvent("pointermove", { clientX: 6 }));
    expect(onStart).toHaveBeenCalledTimes(1);
    expect(onMove).toHaveBeenCalled();

    handler(new PointerEvent("pointerup", { clientX: 6 }));
    expect(onEnd).toHaveBeenCalled();
  });
});