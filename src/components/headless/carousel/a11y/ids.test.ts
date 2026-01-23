import { createCarouselA11yIds } from "./ids";

describe("createCarouselA11yIds", () => {
  it("generates stable ids", () => {
    const ids = createCarouselA11yIds("carousel:1");
    expect(ids.root).toBe("carousel1-root");
    expect(ids.viewport).toBe("carousel1-viewport");
    expect(ids.slide(3)).toBe("carousel1-slide-3");
  });
});