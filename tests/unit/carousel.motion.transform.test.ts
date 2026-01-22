import { computeTransform } from "@/components/headless/carousel/motion/compute-transform";
import { computeTransition } from "@/components/headless/carousel/motion/compute-transition";

describe("motion/transform", () => {
  test("computeTransform x", () => {
    expect(computeTransform(10, "x")).toBe("translate3d(10px, 0, 0)");
  });

  test("computeTransform y", () => {
    expect(computeTransform(-5, "y")).toBe("translate3d(0, -5px, 0)");
  });
});

describe("motion/transition", () => {
  test("computeTransition", () => {
    expect(computeTransition(300, "ease-out")).toBe("transform 300ms ease-out");
  });
});
