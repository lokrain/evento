import { pickTarget } from "./pick-target";
import { slideSnap } from "./slide-snap";
import { snapLine } from "./snap-line";

describe("snap helpers", () => {
  it("computes snap line for align modes", () => {
    expect(snapLine({ viewportSize: 100, align: "start" })).toBe(0);
    expect(snapLine({ viewportSize: 100, align: "center" })).toBe(50);
    expect(snapLine({ viewportSize: 100, align: "end" })).toBe(100);
  });

  it("computes slide snap for align modes", () => {
    expect(slideSnap({ slideStart: 10, slideSize: 40, align: "start" })).toBe(10);
    expect(slideSnap({ slideStart: 10, slideSize: 40, align: "center" })).toBe(30);
    expect(slideSnap({ slideStart: 10, slideSize: 40, align: "end" })).toBe(50);
  });

  it("picks nearest target", () => {
    const target = pickTarget({ current: 10, delta: 12, targets: [0, 10, 20, 40] });
    expect(target).toBe(20);
  });
});