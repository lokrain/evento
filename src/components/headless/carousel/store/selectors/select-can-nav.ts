import type { CarouselState } from "../state";

export interface CanNav {
  readonly canPrev: boolean;
  readonly canNext: boolean;
}

/**
 * Whether prev/next are possible given current state.
 * - If loop enabled: prev/next are allowed when slideCount > 1.
 * - If loop disabled: clamp to edges.
 */
export function selectCanNav(state: CarouselState): CanNav {
  const count = state.slideCount;

  if (count <= 1) {
    return { canPrev: false, canNext: false };
  }

  if (state.loop) {
    return { canPrev: true, canNext: true };
  }

  const idx = state.index as unknown as number;
  return {
    canPrev: idx > 0,
    canNext: idx < count - 1,
  };
}
