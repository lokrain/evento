import type * as React from "react";

export interface RootBindings {
  readonly role: "region";
  readonly tabIndex: 0;
  readonly "aria-roledescription": "carousel";
  readonly "aria-label": string;
}

export function getRootBindings(params: {
  readonly label: string;
  readonly ref: React.Ref<HTMLElement>;
}): RootBindings & { readonly ref: React.Ref<HTMLElement> } {
  return {
    role: "region",
    tabIndex: 0,
    "aria-roledescription": "carousel",
    "aria-label": params.label,
    ref: params.ref,
  };
}
