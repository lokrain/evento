import type { CarouselAction } from "../../actions/action-types";
import { createPointerGateHandler } from "./on-pointer";

describe("createPointerGateHandler", () => {
  it("dispatches gate changes on pointerdown/up", () => {
    const dispatch = jest.fn<void, [CarouselAction]>();
    const handler = createPointerGateHandler({ dispatch });

    handler(new PointerEvent("pointerdown"));
    handler(new PointerEvent("pointerup"));

    expect(dispatch).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        type: "GATE/SET",
        payload: expect.objectContaining({ gate: "dragging", value: true }),
      }),
    );

    expect(dispatch).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        type: "GATE/SET",
        payload: expect.objectContaining({ gate: "dragging", value: false }),
      }),
    );
  });
});