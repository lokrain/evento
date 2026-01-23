import type * as React from "react";

export interface TrackBindings {
  readonly role: "presentation";
}

export function getTrackBindings(params: {
  readonly ref: React.Ref<HTMLElement>;
}): TrackBindings & { readonly ref: React.Ref<HTMLElement> } {
  return {
    role: "presentation",
    ref: params.ref,
  };
}
