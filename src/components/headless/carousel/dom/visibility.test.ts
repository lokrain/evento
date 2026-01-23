import type { CarouselAction } from "../actions/action-types";
import { attachVisibilityGate } from "./visibility";

describe("attachVisibilityGate", () => {
  it("dispatches on visibility change", () => {
    const dispatch = jest.fn<void, [CarouselAction]>();
    const detach = attachVisibilityGate({ dispatch });

    document.dispatchEvent(new Event("visibilitychange"));
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "GATE/SET",
        payload: expect.objectContaining({ gate: "visibilityHidden" }),
      }),
    );

    detach();
  });
});