import { asIndex, asWindowSize } from "../../core/brands";
import { computeVirtualWindow } from "./compute-window";
import { computeVirtualSlots } from "./loop-keys";

describe("computeVirtualSlots", () => {
  it("generates keys based on epoch and position", () => {
    const window = computeVirtualWindow({
      slideCount: 5,
      loop: false,
      index: asIndex(1),
      windowSize: asWindowSize(3),
      overscan: 0,
      pinned: new Set(),
    }).window;

    if (!window) throw new Error("Window is null");

    const slots = computeVirtualSlots({ window, slideCount: 5, loop: false, epoch: 2 });
    expect(slots[0].key).toBe("c:2:0");
  });

  it("wraps logical indices in loop mode", () => {
    const window = { start: asIndex(-1), end: asIndex(1), size: asWindowSize(3) };
    const slots = computeVirtualSlots({ window, slideCount: 3, loop: true, epoch: 0 });
    expect(slots[0].logicalIndex).toBe(2);
  });
});