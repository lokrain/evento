import type * as React from "react";
import type { DataAttributes } from "../core/types";
import { getSlideAriaProps } from "../a11y/aria/slide-props";

export type SlideBindings = ReturnType<typeof getSlideAriaProps> & {
  readonly ref: React.Ref<HTMLElement>;
};

export type SlideBindingsProps = SlideBindings & React.HTMLAttributes<HTMLElement> & DataAttributes;

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
export function getSlideBindings(
  params: {
    readonly index: number;
    readonly total: number;
    readonly ref: React.Ref<HTMLElement>;
    readonly id?: string;
    readonly roledescription?: string | false;
  },
  user?: React.HTMLAttributes<HTMLElement> & DataAttributes,
): SlideBindingsProps {
  const aria = getSlideAriaProps({
    index: params.index,
    total: params.total,
    id: params.id,
    roledescription: params.roledescription,
  });

  const merged: SlideBindingsProps = {
    ...(user ?? {}),
    ...aria,
    ref: params.ref,
  };

  return merged;
}
