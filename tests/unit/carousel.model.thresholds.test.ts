import { toPxThreshold } from "@/components/headless/carousel/model/thresholds";

describe("model/thresholds (commit -> px)", () => {
  const ctx = { viewportPx: 1000, slidePx: 400, snapPx: 300 };

  test("defaults to snap 0.5", () => {
    expect(toPxThreshold(undefined, ctx)).toBe(150);
  });

  test("px kind passes through", () => {
    expect(toPxThreshold({ kind: "px", value: 42 }, ctx)).toBe(42);
  });

  test("viewport scales", () => {
    expect(toPxThreshold({ kind: "viewport", value: 0.25 }, ctx)).toBe(250);
  });

  test("slide scales", () => {
    expect(toPxThreshold({ kind: "slide", value: 0.5 }, ctx)).toBe(200);
  });

  test("snap scales", () => {
    expect(toPxThreshold({ kind: "snap", value: 0.5 }, ctx)).toBe(150);
  });
});
