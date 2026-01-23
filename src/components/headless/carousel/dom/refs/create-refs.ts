import type * as React from "react";

export interface CarouselRefState {
  root: HTMLElement | null;
  viewport: HTMLElement | null;
  track: HTMLElement | null;
  slides: Map<number, HTMLElement | null>;
}

/**
 * Creates ref setters + tracked ref state.
 *
 * Notes:
 * - This is "dumb plumbing": no decisions, no derived state.
 * - Slides are addressed by logical index.
 */
export function createRefs() {
  const state: CarouselRefState = {
    root: null,
    viewport: null,
    track: null,
    slides: new Map<number, HTMLElement | null>(),
  };

  const root: React.RefCallback<HTMLElement> = (node) => {
    state.root = node;
  };

  const viewport: React.RefCallback<HTMLElement> = (node) => {
    state.viewport = node;
  };

  const track: React.RefCallback<HTMLElement> = (node) => {
    state.track = node;
  };

  const slide = (index: number): React.RefCallback<HTMLElement> => {
    const i = Math.trunc(index);
    return (node) => {
      state.slides.set(i, node);
    };
  };

  return { state, root, viewport, track, slide };
}
