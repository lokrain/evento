import type * as React from "react";
import { getRootAriaProps } from "../a11y/aria/root-props";
import type { DataAttributes } from "../core/types";

export interface RootBindings {
  readonly role: "region";
  readonly tabIndex: number;
  readonly "aria-roledescription"?: string;
  readonly "aria-label": string;
}

export type RootBindingsProps = RootBindings &
  React.HTMLAttributes<HTMLElement> &
  DataAttributes & { readonly ref: React.Ref<HTMLElement> };

export function getRootBindings(
  params: {
    readonly label: string;
    readonly ref: React.Ref<HTMLElement>;
    readonly id?: string;
    readonly roledescription?: string | false;
    readonly tabIndex?: number;
  },
  user?: React.HTMLAttributes<HTMLElement> & DataAttributes,
): RootBindingsProps {
  const aria = getRootAriaProps({
    label: params.label,
    id: params.id,
    roledescription: params.roledescription,
    tabIndex: params.tabIndex,
  });
  const base: RootBindings & { readonly ref: React.Ref<HTMLElement> } = {
    ...aria,
    ref: params.ref,
  };

  const merged: RootBindingsProps = {
    ...(user ?? {}),
    ...base,
  };

  return merged;
}
