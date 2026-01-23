import type { Dispatch } from "react";
import type { CarouselAction } from "../actions/action-types";
import { buildGateSet } from "../actions/builders/build-autoplay";

const mediaQuery = "(prefers-reduced-motion: reduce)";

export function attachReducedMotionGate(params: {
  readonly dispatch: Dispatch<CarouselAction>;
}): () => void {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return () => {};
  }

  const { dispatch } = params;
  const mql = window.matchMedia(mediaQuery);

  const update = () => {
    dispatch(buildGateSet({ gate: "reducedMotion", value: mql.matches, source: "dom" }));
  };

  update();

  mql.addEventListener("change", update);
  return () => {
    mql.removeEventListener("change", update);
  };
}