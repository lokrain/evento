import { computeAutoplayPolicy } from "./policy";

describe("computeAutoplayPolicy", () => {
  it("returns baseline mode when autoplay cannot run", () => {
    const plan = computeAutoplayPolicy({
      gates: { canRun: false, blocked: ["disabled"] },
      announceEnabled: true,
      baselineLiveMode: "assertive",
    });

    expect(plan.shouldRun).toBe(false);
    expect(plan.desiredLiveMode).toBe("assertive");
    expect(plan.suppressAnnouncements).toBe(false);
  });

  it("suppresses announcements while running", () => {
    const plan = computeAutoplayPolicy({
      gates: { canRun: true, blocked: [] },
      announceEnabled: true,
    });

    expect(plan.shouldRun).toBe(true);
    expect(plan.desiredLiveMode).toBe("off");
    expect(plan.suppressAnnouncements).toBe(true);
  });
});