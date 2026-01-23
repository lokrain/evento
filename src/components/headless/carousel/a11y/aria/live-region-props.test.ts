import { getLiveRegionProps } from "./live-region-props";

describe("getLiveRegionProps", () => {
  it("returns live region attributes", () => {
    const props = getLiveRegionProps({ mode: "polite", text: "Hello" });
    expect(props["aria-live"]).toBe("polite");
    expect(props["aria-atomic"]).toBe(true);
    expect(props.children).toBe("Hello");
  });
});