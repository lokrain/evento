import { getRootAriaProps } from "./root-props";

describe("getRootAriaProps", () => {
  it("omits roledescription when disabled", () => {
    const props = getRootAriaProps({ label: "Carousel", roledescription: false });
    expect(props["aria-roledescription"]).toBeUndefined();
  });

  it("uses custom roledescription when provided", () => {
    const props = getRootAriaProps({ label: "Carousel", roledescription: "gallery" });
    expect(props["aria-roledescription"]).toBe("gallery");
  });
});