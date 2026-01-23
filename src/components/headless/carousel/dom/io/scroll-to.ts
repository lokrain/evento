import type { Axis, Px } from "../../core/types";

/**
 * Imperative scroll writer.
 * Boundary-only: callers should invoke this from navigation/measure boundaries,
 * never from the raw scroll event.
 */

export interface ScrollToOptions {
  readonly behavior: ScrollBehavior;
}

export function scrollToPx(params: {
  readonly viewport: HTMLElement;
  readonly axis: Axis;
  readonly px: Px;
  readonly options: ScrollToOptions;
}): void {
  const el = params.viewport;
  const behavior = params.options.behavior;
  const v = params.px as unknown as number;

  if (params.axis === "x") {
    el.scrollTo({ left: v, behavior });
  } else {
    el.scrollTo({ top: v, behavior });
  }
}
