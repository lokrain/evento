import type * as React from "react";
import type { DataAttributes } from "../core/types";

export interface ViewportBindings {
  readonly role: "group";
  readonly tabIndex: -1;
  readonly "aria-live": "off";
}

export type ViewportBindingsProps = ViewportBindings &
  React.HTMLAttributes<HTMLElement> &
  DataAttributes & { readonly ref: React.Ref<HTMLElement> };

export function getViewportBindings(
  params: {
    readonly ref: React.Ref<HTMLElement>;
  },
  user?: React.HTMLAttributes<HTMLElement> & DataAttributes,
): ViewportBindingsProps {
  const base: ViewportBindings & { readonly ref: React.Ref<HTMLElement> } = {
    role: "group",
    tabIndex: -1,
    "aria-live": "off", // live region handled separately
    ref: params.ref,
  };

  const merged: ViewportBindingsProps = {
    ...(user ?? {}),
    ...base,
  };

  return merged;
}
