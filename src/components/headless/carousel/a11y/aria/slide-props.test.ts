import { getSlideAriaProps } from "./slide-props";

describe("getSlideAriaProps", () => {
  it("omits roledescription when disabled", () => {
    const props = getSlideAriaProps({ index: 0, total: 2, roledescription: false });
    expect(props["aria-roledescription"]).toBeUndefined();
  });

  it("uses custom roledescription when provided", () => {
    const props = getSlideAriaProps({ index: 0, total: 2, roledescription: "panel" });
    expect(props["aria-roledescription"]).toBe("panel");
  });
});