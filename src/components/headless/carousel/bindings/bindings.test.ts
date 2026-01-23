import { getPrevButtonBindings } from "./controls";
import { getRootBindings } from "./root";
import { getSlideBindings } from "./slide";
import { getViewportBindings } from "./viewport";

describe("bindings", () => {
  it("merges user props and sets root aria", () => {
    const bindings = getRootBindings(
      { label: "Carousel", ref: () => {} },
      { "data-testid": "root" },
    );

    expect(bindings.role).toBe("region");
    expect(bindings["aria-label"]).toBe("Carousel");
    expect(bindings["data-testid"]).toBe("root");
  });

  it("provides slide data-carousel-slide-index", () => {
    const bindings = getSlideBindings(
      { index: 2, total: 5, ref: () => {} },
      { "data-testid": "slide" },
    );

    expect(bindings["data-carousel-slide-index"]).toBe(2);
    expect(bindings["data-testid"]).toBe("slide");
  });

  it("wires aria-controls for controls", () => {
    const bindings = getPrevButtonBindings({ canPrev: false, controlsId: "vp" });
    expect(bindings["aria-controls"]).toBe("vp");
    expect(bindings["aria-disabled"]).toBe(true);
  });

  it("supports viewport data attributes", () => {
    const bindings = getViewportBindings({ ref: () => {} }, { "data-testid": "vp" });
    expect(bindings["data-testid"]).toBe("vp");
  });
});