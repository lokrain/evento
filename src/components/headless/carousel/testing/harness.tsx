import type { ReactNode } from "react";

export function CarouselHarness({ children }: { children: ReactNode }) {
  return <div data-testid="carousel-harness">{children}</div>;
}