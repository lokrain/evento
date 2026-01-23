import { asIndex, asWindowSize } from "../../core/brands";
import { computeSeamBucket, computeVirtualWindow } from "./compute-window";

describe("computeVirtualWindow", () => {
  it("expands the window to include pinned indices", () => {
    const result = computeVirtualWindow({
      slideCount: 5,
      loop: false,
      index: asIndex(2),
      windowSize: asWindowSize(3),
      overscan: 0,
      pinned: new Set([0, 4]),
    });

    expect(result.window).toEqual({
      start: asIndex(0),
      end: asIndex(4),
      size: asWindowSize(5),
    });
  });

  it("computes seam buckets in loop mode", () => {
    const left = computeVirtualWindow({
      slideCount: 5,
      loop: true,
      index: asIndex(0),
      windowSize: asWindowSize(3),
      overscan: 0,
      pinned: new Set(),
    });

    const right = computeVirtualWindow({
      slideCount: 5,
      loop: true,
      index: asIndex(6),
      windowSize: asWindowSize(3),
      overscan: 0,
      pinned: new Set(),
    });

    expect(left.seamBucket).toBe(-1);
    expect(right.seamBucket).toBe(1);
  });
});

describe("computeSeamBucket", () => {
  it("handles negative start positions", () => {
    expect(computeSeamBucket(-1, 5)).toBe(-1);
    expect(computeSeamBucket(-6, 5)).toBe(-2);
  });
});