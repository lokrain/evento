import type { CarouselAction } from "../actions/action-types";
import { attachReducedMotionGate } from "./reduced-motion";

describe("attachReducedMotionGate", () => {
  it("dispatches when media query changes", () => {
    const dispatch = jest.fn<void, [CarouselAction]>();

    const listeners = new Set<(event: MediaQueryListEvent) => void>();
    const mql: MediaQueryList = {
      matches: false,
      media: "(prefers-reduced-motion: reduce)",
      onchange: null,
      addEventListener: (_type, listener) => {
        listeners.add(listener as (event: MediaQueryListEvent) => void);
      },
      removeEventListener: (_type, listener) => {
        listeners.delete(listener as (event: MediaQueryListEvent) => void);
      },
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => true,
    };

    const originalMatchMedia = window.matchMedia;
    window.matchMedia = () => mql;

    const detach = attachReducedMotionGate({ dispatch });
    const listener = Array.from(listeners)[0];
    listener?.({ matches: true } as MediaQueryListEvent);

    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "GATE/SET",
        payload: expect.objectContaining({ gate: "reducedMotion" }),
      }),
    );

    detach();
    window.matchMedia = originalMatchMedia;
  });
});