import { normalizeLoop } from "@/components/headless/carousel/model/loop";

describe("model/loop", () => {
  test("no spacing returns offset", () => {
    expect(normalizeLoop(10, 0)).toBe(10);
  });

  test("wraps into center band", () => {
    expect(normalizeLoop(150, 100)).toBe(-50); // 150 -> -50 in [-50,50)
    expect(normalizeLoop(-160, 100)).toBe(-60 + 100); // -160 -> 40
  });
});
