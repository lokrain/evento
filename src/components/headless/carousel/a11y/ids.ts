export interface CarouselA11yIds {
  readonly root: string;
  readonly viewport: string;
  readonly track: string;
  readonly liveRegion: string;
  readonly prevButton: string;
  readonly nextButton: string;
  readonly slide: (index: number) => string;
}

export function createCarouselA11yIds(baseId: string): CarouselA11yIds {
  const normalized = baseId.replaceAll(":", "").replaceAll(" ", "");
  return {
    root: `${normalized}-root`,
    viewport: `${normalized}-viewport`,
    track: `${normalized}-track`,
    liveRegion: `${normalized}-live`,
    prevButton: `${normalized}-prev`,
    nextButton: `${normalized}-next`,
    slide: (index: number) => `${normalized}-slide-${Math.max(0, Math.trunc(index))}`,
  };
}