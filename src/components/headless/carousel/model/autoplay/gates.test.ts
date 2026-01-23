import { computeAutoplayGates } from "./gates";

describe("computeAutoplayGates", () => {
  it("blocks when autoplay disabled", () => {
    const result = computeAutoplayGates({
      enabled: false,
      intervalMs: 3000,
      slideCount: 3,
      gates: {
        manualPause: false,
        hover: false,
        focusWithin: false,
        visibilityHidden: false,
        dragging: false,
        reducedMotion: false,
      },
    });

    expect(result.canRun).toBe(false);
    expect(result.blocked).toContain("disabled");
  });

  it("blocks when any gate is active", () => {
    const result = computeAutoplayGates({
      enabled: true,
      intervalMs: 3000,
      slideCount: 3,
      gates: {
        manualPause: true,
        hover: true,
        focusWithin: false,
        visibilityHidden: true,
        dragging: false,
        reducedMotion: false,
      },
    });

    expect(result.canRun).toBe(false);
    expect(result.blocked).toEqual(
      expect.arrayContaining(["manualPause", "hover", "hidden"]),
    );
  });

  it("blocks while dragging", () => {
    const result = computeAutoplayGates({
      enabled: true,
      intervalMs: 3000,
      slideCount: 3,
      gates: {
        manualPause: false,
        hover: false,
        focusWithin: false,
        visibilityHidden: false,
        dragging: true,
        reducedMotion: false,
      },
    });

    expect(result.blocked).toContain("dragging");
  });

  it("captures combined gate blockers", () => {
    const result = computeAutoplayGates({
      enabled: true,
      intervalMs: 3000,
      slideCount: 3,
      gates: {
        manualPause: true,
        hover: true,
        focusWithin: false,
        visibilityHidden: true,
        dragging: false,
        reducedMotion: false,
      },
    });

    expect(result.blocked).toEqual(
      expect.arrayContaining(["manualPause", "hover", "hidden"]),
    );
  });
});