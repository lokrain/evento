import { clampIndex, modIndex, stepIndex } from "@/components/headless/carousel/model/index-math";

describe("model/indexMath (pure)", () => {
  test("Invariant 1: clampIndex keeps index within range 0..slideCount-1", () => {
    expect(clampIndex(-10, 5)).toBe(0);
    expect(clampIndex(0, 5)).toBe(0);
    expect(clampIndex(4, 5)).toBe(4);
    expect(clampIndex(5, 5)).toBe(4);
    expect(clampIndex(999, 5)).toBe(4);
  });

  test("modIndex wraps into [0, slideCount)", () => {
    expect(modIndex(0, 5)).toBe(0);
    expect(modIndex(4, 5)).toBe(4);
    expect(modIndex(5, 5)).toBe(0);
    expect(modIndex(6, 5)).toBe(1);
    expect(modIndex(-1, 5)).toBe(4);
    expect(modIndex(-6, 5)).toBe(4);
  });

  test("stepIndex respects loop=false", () => {
    expect(stepIndex({ index: 0, step: 1, slideCount: 5, loop: false, direction: -1 })).toBe(0);
    expect(stepIndex({ index: 4, step: 1, slideCount: 5, loop: false, direction: 1 })).toBe(4);
    expect(stepIndex({ index: 2, step: 2, slideCount: 5, loop: false, direction: 1 })).toBe(4);
  });

  test("stepIndex respects loop=true", () => {
    expect(stepIndex({ index: 0, step: 1, slideCount: 5, loop: true, direction: -1 })).toBe(4);
    expect(stepIndex({ index: 4, step: 1, slideCount: 5, loop: true, direction: 1 })).toBe(0);
    expect(stepIndex({ index: 2, step: 2, slideCount: 5, loop: true, direction: 1 })).toBe(4);
    expect(stepIndex({ index: 2, step: 2, slideCount: 5, loop: true, direction: -1 })).toBe(0);
  });
});
