import type { CarouselAction } from "../actions/action-types";
import { attachHoverGate } from "./hover";

describe("attachHoverGate", () => {
  it("dispatches hover gate on pointer events", () => {
    const root = document.createElement("div");
    const dispatch = jest.fn<void, [CarouselAction]>();

    const detach = attachHoverGate({ root, dispatch });
    root.dispatchEvent(new PointerEvent("pointerenter"));
    root.dispatchEvent(new PointerEvent("pointerleave"));

    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "GATE/SET",
        payload: expect.objectContaining({ gate: "hover", value: true }),
      }),
    );
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "GATE/SET",
        payload: expect.objectContaining({ gate: "hover", value: false }),
      }),
    );

    detach();
  });
});