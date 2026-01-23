import type * as React from "react";
import { getControlProps, type DisabledSemantics } from "../a11y/aria/control-props";
import type { DataAttributes } from "../core/types";

export type ControlBindings = ReturnType<typeof getControlProps> &
  React.ButtonHTMLAttributes<HTMLButtonElement> &
  DataAttributes;

/**
 * Prev/Next button prop builders.
 *
 * Responsibilities:
 * - Provide a11y-complete button props
 * - Provide disabled semantics as configured
 * - Wire aria-controls to the viewport id
 *
 * Non-responsibilities:
 * - onClick handlers (caller wires)
 * - focus management (separate policy)
 */
export function getPrevButtonBindings(
  params: {
    readonly canPrev: boolean;
    readonly controlsId: string;
    readonly label?: string;
    readonly disabledSemantics?: DisabledSemantics;
    readonly id?: string;
    readonly keyShortcuts?: string;
  },
  user?: React.ButtonHTMLAttributes<HTMLButtonElement> & DataAttributes,
): ControlBindings {
  const base = getControlProps({
    label: params.label ?? "Previous slide",
    controlsId: params.controlsId,
    enabled: params.canPrev,
    disabledSemantics: params.disabledSemantics,
    id: params.id,
    keyShortcuts: params.keyShortcuts,
  });

  return {
    ...(user ?? {}),
    ...base,
  };
}

export function getNextButtonBindings(
  params: {
    readonly canNext: boolean;
    readonly controlsId: string;
    readonly label?: string;
    readonly disabledSemantics?: DisabledSemantics;
    readonly id?: string;
    readonly keyShortcuts?: string;
  },
  user?: React.ButtonHTMLAttributes<HTMLButtonElement> & DataAttributes,
): ControlBindings {
  const base = getControlProps({
    label: params.label ?? "Next slide",
    controlsId: params.controlsId,
    enabled: params.canNext,
    disabledSemantics: params.disabledSemantics,
    id: params.id,
    keyShortcuts: params.keyShortcuts,
  });

  return {
    ...(user ?? {}),
    ...base,
  };
}
