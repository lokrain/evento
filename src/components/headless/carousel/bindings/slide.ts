import type * as React from "react";
import { getSlideAriaProps } from "../a11y/aria/slide-props";

export type SlideBindings = ReturnType<typeof getSlideAriaProps> & {
  readonly ref: React.Ref<HTMLElement>;
};

/**
 * Slide prop builder.
 *
 * Responsibilities:
 * - Provide ARIA semantics for a slide
 * - Provide DOM->index bridge via data-carousel-slide-index
 * - Attach ref
 *
 * Non-responsibilities:
 * - Selection state / "current" marking (comes from higher-level policy)
 */
export function getSlideBindings(params: {
  readonly index: number;
  readonly total: number;
  readonly ref: React.Ref<HTMLElement>;
  readonly id?: string;
}): SlideBindings {
  const aria = getSlideAriaProps({
    index: params.index,
    total: params.total,
    id: params.id,
  });

  return {
    ...aria,
    ref: params.ref,
  };
}
