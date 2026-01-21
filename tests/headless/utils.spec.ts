import { expect, test } from "@playwright/test";
import { clamp, invariant, mod, toEasingCss } from "../../src/components/headless/carousel/utils";

test.describe("headless carousel utils", () => {
  test("clamp bounds values", () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-5, 0, 10)).toBe(0);
    expect(clamp(25, 0, 10)).toBe(10);
  });

  test("mod wraps negatives", () => {
    expect(mod(5, 4)).toBe(1);
    expect(mod(-1, 4)).toBe(3);
  });

  test("toEasingCss handles cubic-bezier", () => {
    expect(toEasingCss("ease-in")).toBe("ease-in");
    expect(toEasingCss({ cubicBezier: [0.1, 0.2, 0.3, 0.4] })).toBe(
      "cubic-bezier(0.1, 0.2, 0.3, 0.4)",
    );
  });

  test("invariant throws on failure", () => {
    expect(() => invariant(false, "boom")).toThrow("boom");
  });
});
