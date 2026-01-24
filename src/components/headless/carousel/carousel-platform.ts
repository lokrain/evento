import type { Axis, Px } from "./core/types";
import { scrollToPx } from "./dom/io/scroll-to";

export interface CarouselPlatform {
  /**
   * Single writer for DOM scrolling.
   *
   * Contract:
   * - Must be deterministic in tests (callable under JSDOM).
   * - Production implementation may be a direct DOM call, but the abstraction exists
   *   to preserve testability and allow future adapters.
   */
  scrollToPx(args: {
    readonly viewport: HTMLElement;
    readonly axis: Axis;
    readonly px: Px;
    readonly options: ScrollToOptions;
  }): void;
}

export interface ScrollToOptions {
  readonly behavior: ScrollBehavior;
}

export const defaultCarouselPlatform: CarouselPlatform = {
  scrollToPx: (args) => {
    scrollToPx(args);
  },
};
