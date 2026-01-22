import { resolveSnapTarget } from "@/components/headless/carousel/model/snap-targets";

describe("model/snap-targets", () => {
  test("empty snap points -> 0", () => {
    expect(resolveSnapTarget(10, [])).toBe(0);
  });

  test("nearest snap index", () => {
    const snaps = [0, 100, 200, 400];
    expect(resolveSnapTarget(10, snaps)).toBe(0);
    expect(resolveSnapTarget(120, snaps)).toBe(1);
    expect(resolveSnapTarget(380, snaps)).toBe(3);
  });
});
