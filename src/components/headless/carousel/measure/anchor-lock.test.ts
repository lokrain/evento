import { computeAnchorLock } from "./anchor-lock";

describe("computeAnchorLock", () => {
  it("prefers target when finite", () => {
    expect(computeAnchorLock(10, 20)).toBe(20);
  });

  it("falls back to current when target invalid", () => {
    expect(computeAnchorLock(10, Number.NaN)).toBe(10);
  });
});