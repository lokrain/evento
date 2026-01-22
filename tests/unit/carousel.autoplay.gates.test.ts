// tests/unit/carousel.autoplay.gates.test.ts
import { evaluateAutoplay, isAutoplayAllowed } from "@/components/headless/carousel/autoplay/gates";
import type { AutoplayGate } from "@/components/headless/carousel/engine/types-public";

function allGatesFalse(): Readonly<Record<AutoplayGate, boolean>> {
  return {
    hover: false,
    focusWithin: false,
    dragging: false,
    visibilityHidden: false,
    reducedMotion: false,
    manual: false,
  };
}

describe("autoplay/gates (pure)", () => {
  test("Invariant 16: inactive when slideCount <= 1", () => {
    const gates = allGatesFalse();

    expect(
      isAutoplayAllowed({ enabled: true, slideCount: 1, gates, mode: "step" }),
    ).toBe(false);

    expect(
      isAutoplayAllowed({ enabled: true, slideCount: 0, gates, mode: "continuous" }),
    ).toBe(false);

    const d = evaluateAutoplay({ enabled: true, slideCount: 1, gates, mode: "step" });
    expect(d.allowed).toBe(false);
    expect(d.reason).toBe("slideCount");
    expect(d.activeGates).toEqual([]);
  });

  test("Autoplay disabled => not allowed", () => {
    const gates = allGatesFalse();
    const d = evaluateAutoplay({ enabled: false, slideCount: 10, gates, mode: "step" });
    expect(d.allowed).toBe(false);
    expect(d.reason).toBe("disabled");
    expect(d.activeGates).toEqual([]);
  });

  test("Invariant 17: paused when any gate active", () => {
    const gates = { ...allGatesFalse(), hover: true };

    const d = evaluateAutoplay({ enabled: true, slideCount: 10, gates, mode: "step" });
    expect(d.allowed).toBe(false);
    expect(d.activeGates).toEqual(["hover"]);
    expect(d.reason).toBe("gate:hover");
  });

  test("Invariant 18: hover/focus gates pause without mutating play state (policy only)", () => {
    const base = allGatesFalse();
    const hover = { ...base, hover: true };
    const focus = { ...base, focusWithin: true };

    // Policy evaluation only: no state mutation possible in pure function.
    expect(isAutoplayAllowed({ enabled: true, slideCount: 5, gates: hover, mode: "step" })).toBe(false);
    expect(isAutoplayAllowed({ enabled: true, slideCount: 5, gates: focus, mode: "step" })).toBe(false);
  });

  test("Invariant 19: dragging gate pauses immediately", () => {
    const gates = { ...allGatesFalse(), dragging: true };
    const d = evaluateAutoplay({ enabled: true, slideCount: 5, gates, mode: "step" });
    expect(d.allowed).toBe(false);
    expect(d.activeGates).toEqual(["dragging"]);
    expect(d.reason).toBe("gate:dragging");
  });

  test("Invariant 20: visibilityHidden pauses timers (policy)", () => {
    const gates = { ...allGatesFalse(), visibilityHidden: true };
    const d = evaluateAutoplay({ enabled: true, slideCount: 5, gates, mode: "step" });
    expect(d.allowed).toBe(false);
    expect(d.activeGates).toEqual(["visibilityHidden"]);
    expect(d.reason).toBe("gate:visibilityHidden");
  });

  test("Invariant 21: continuous mode respects gates", () => {
    const gates = { ...allGatesFalse(), manual: true };

    const d = evaluateAutoplay({ enabled: true, slideCount: 5, gates, mode: "continuous" });
    expect(d.allowed).toBe(false);
    expect(d.reason).toBe("gate:manual");
    expect(d.activeGates).toEqual(["manual"]);
  });

  test("No gates => allowed when enabled and slideCount > 1", () => {
    const gates = allGatesFalse();
    const d = evaluateAutoplay({ enabled: true, slideCount: 2, gates, mode: "step" });
    expect(d.allowed).toBe(true);
    expect(d.activeGates).toEqual([]);
  });

  test("Multiple gates => activeGates sorted and deterministic reason", () => {
    const gates = { ...allGatesFalse(), manual: true, hover: true, reducedMotion: true };
    const d = evaluateAutoplay({ enabled: true, slideCount: 5, gates, mode: "step" });

    expect(d.allowed).toBe(false);
    expect(d.activeGates).toEqual(["hover", "manual", "reducedMotion"]); // sorted
    expect(d.reason).toBe("gate:hover"); // first sorted gate
  });
});
