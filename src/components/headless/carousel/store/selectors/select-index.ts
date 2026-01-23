// src/components/headless/carousel/store/selectors/select-index.ts

import type { CarouselState } from "../state";

export function selectIndex(state: CarouselState): number {
  return state.index as unknown as number;
}
