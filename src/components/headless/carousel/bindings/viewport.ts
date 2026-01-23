import type * as React from "react";

export interface ViewportBindings {
  readonly role: "group";
  readonly tabIndex: -1;
  readonly "aria-live": "off";
}

export function getViewportBindings(params: {
  readonly ref: React.Ref<HTMLElement>;
}): ViewportBindings & { readonly ref: React.Ref<HTMLElement> } {
  return {
    role: "group",
    tabIndex: -1,
    "aria-live": "off", // live region handled separately
    ref: params.ref,
  };
}
