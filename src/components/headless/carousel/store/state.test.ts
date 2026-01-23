import { asIndex } from "../core/brands";
import { createInitialState } from "./state";

describe("createInitialState", () => {
  it("clamps slideCount and initialIndex", () => {
    const state = createInitialState({
      axis: "x",
      dir: "ltr",
      loop: false,
      slideCount: -3,
      initialIndex: -2,
    });

    expect(state.slideCount).toBe(0);
    expect(state.index).toEqual(asIndex(0));
  });

  it("applies defaults for autoplay and virtual window", () => {
    const state = createInitialState({
      axis: "y",
      dir: "rtl",
      loop: true,
      slideCount: 5,
    });

    expect(state.autoplay.enabled).toBe(false);
    expect(Number(state.autoplay.intervalMs)).toBeGreaterThan(0);
    expect(state.virtual.windowSize).toBeDefined();
  });
});