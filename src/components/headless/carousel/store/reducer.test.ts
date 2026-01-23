import { buildA11ySetLiveMode } from "../actions/builders/build-a11y";
import { buildAutoplaySetEnabled, buildGateSet } from "../actions/builders/build-autoplay";
import { createInitialState } from "./state";
import { reduceCarousel } from "./reducer";

describe("reduceCarousel", () => {
  it("delegates a11y updates", () => {
    const initial = createInitialState({
      axis: "x",
      dir: "ltr",
      loop: false,
      slideCount: 3,
    });

    const next = reduceCarousel(
      initial,
      buildA11ySetLiveMode({ mode: "assertive", source: "api" }),
    );

    expect(next.a11y.liveMode).toBe("assertive");
  });

  it("delegates autoplay updates", () => {
    const initial = createInitialState({
      axis: "y",
      dir: "rtl",
      loop: true,
      slideCount: 2,
    });

    const next = reduceCarousel(initial, buildAutoplaySetEnabled({ enabled: true, source: "api" }));
    expect(next.autoplay.enabled).toBe(true);
  });

  it("updates drag gate via gate action", () => {
    const initial = createInitialState({
      axis: "x",
      dir: "ltr",
      loop: false,
      slideCount: 2,
    });

    const next = reduceCarousel(
      initial,
      buildGateSet({ gate: "dragging", value: true, source: "dom" }),
    );
    expect(next.gates.dragging).toBe(true);
  });
});