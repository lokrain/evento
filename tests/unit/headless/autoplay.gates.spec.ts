import { evaluateAutoplay, isAutoplayAllowed, type AutoplayGateState } from "@/components/headless/carousel/autoplay/gates";

describe("autoplay/gates (pure)", () => {
  const base = {
    enabled: true,
    slideCount: 3,
    mode: "step" as const,
  };

  const gatesAllOff: AutoplayGateState = {
    hover: false,
    focusWithin: false,
    dragging: false,
    visibilityHidden: false,
    reducedMotion: false,
    manual: false,
  };

  test("disabled feature short-circuits", () => {
    const res = evaluateAutoplay({ ...base, enabled: false, gates: gatesAllOff });
    expect(res.allowed).toBe(false);
    expect(res.reason).toBe("disabled");
    expect(res.activeGates).toEqual([]);
  });

  test("slideCount <= 1 pauses", () => {
    const res = evaluateAutoplay({ ...base, slideCount: 1, gates: gatesAllOff });
    expect(res.allowed).toBe(false);
    expect(res.reason).toBe("slideCount");
  });

  test("active gate pauses and reports gate reason (sorted)", () => {
    const gates: AutoplayGateState = {
      ...gatesAllOff,
      dragging: true,
      hover: true,
    };
    const res = evaluateAutoplay({ ...base, gates });
    expect(res.allowed).toBe(false);
    // dragging comes before hover alphabetically
    expect(res.reason).toBe("gate:dragging");
    expect(res.activeGates).toEqual(["dragging", "hover"].sort());
  });

  test("no gates, enabled, slideCount>1 => allowed", () => {
    const res = evaluateAutoplay({ ...base, gates: gatesAllOff });
    expect(res.allowed).toBe(true);
    expect(res.activeGates).toEqual([]);
    expect(isAutoplayAllowed({ ...base, gates: gatesAllOff })).toBe(true);
  });
});
