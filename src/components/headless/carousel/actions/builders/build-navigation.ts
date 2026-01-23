import type { CarouselAction } from "../action-types";
import { toNonNegInt } from "../action-validate";

export function buildNavSetSlideCount(slideCount: unknown): CarouselAction {
  const count = toNonNegInt(slideCount, "slideCount");
  return {
    type: "NAV/SET_SLIDE_COUNT",
    payload: { slideCount: count },
  };
}

export function buildNavRequestNext(source: "api" | "keyboard" | "button" | "autoplay"): CarouselAction {
  return {
    type: "NAV/REQUEST",
    payload: { kind: "next", source },
  };
}

export function buildNavRequestPrev(source: "api" | "keyboard" | "button" | "autoplay"): CarouselAction {
  return {
    type: "NAV/REQUEST",
    payload: { kind: "prev", source },
  };
}

export function buildNavRequestGoto(index: unknown, source: "api" | "keyboard" | "button" | "autoplay"): CarouselAction {
  const idx = toNonNegInt(index, "index");
  return {
    type: "NAV/REQUEST",
    payload: { kind: "goto", index: idx, source },
  };
}

/**
 * Commit index only at boundary (settle/external).
 */
export function buildNavCommitIndex(params: { readonly index: unknown; readonly source: "settle" | "external" }): CarouselAction {
  const idx = toNonNegInt(params.index, "index");
  return {
    type: "NAV/COMMIT_INDEX",
    payload: { index: idx, source: params.source },
  };
}
