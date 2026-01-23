import type * as React from "react";
import type { DataAttributes } from "../core/types";

export interface TrackBindings {
  readonly role: "presentation";
}

export type TrackBindingsProps = TrackBindings &
  React.HTMLAttributes<HTMLElement> &
  DataAttributes & { readonly ref: React.Ref<HTMLElement> };

export function getTrackBindings(
  params: {
    readonly ref: React.Ref<HTMLElement>;
  },
  user?: React.HTMLAttributes<HTMLElement> & DataAttributes,
): TrackBindingsProps {
  const base: TrackBindings & { readonly ref: React.Ref<HTMLElement> } = {
    role: "presentation",
    ref: params.ref,
  };

  const merged: TrackBindingsProps = {
    ...(user ?? {}),
    ...base,
  };

  return merged;
}
