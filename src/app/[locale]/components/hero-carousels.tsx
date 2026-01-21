"use client";

import Autoplay from "embla-carousel-autoplay";
import { useEffect, useMemo, useRef, useState } from "react";

import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

type AutoCarouselProps = {
  slides: number; // total slides
  visibleItems?: number; // max visible at once
  reverse?: boolean;
  delayMs?: number;
  className?: string;
};

function AutoCarousel({ slides, reverse = false, delayMs = 4000, className }: AutoCarouselProps) {
  const autoplay = useRef(
    Autoplay({
      delay: delayMs,
    }),
  );
  const [api, setApi] = useState<CarouselApi | null>(null);
  const slideIds = useMemo(
    () => Array.from({ length: slides }, (_, i) => `slide-${i + 1}`),
    [slides],
  );

  useEffect(() => {
    if (!api) return;
    if (reverse) {
      const id = setInterval(() => api.scrollPrev(), delayMs);
      return () => clearInterval(id);
    }
    autoplay.current?.reset();
    return () => autoplay.current?.stop();
  }, [api, reverse, delayMs]);

  const itemHeightPct = (i: number) => (i % 2) + 1 * 22;

  return (
    <Carousel
      orientation="vertical"
      opts={{ loop: true, startIndex: 0, align: "start", axis: "y", dragFree: true }}
      plugins={[autoplay.current]}
      setApi={setApi}
      className={`**:h-full ${className ?? ""}`.trim()}
    >
      <CarouselContent>
        {slideIds.map((id, index) => (
          <CarouselItem
            key={id}
            style={{
              maxHeight: `${itemHeightPct(index)}dvh`,
            }}
          >
            <Card>
              <CardContent className="flex h-full items-center justify-center p-4">
                <span className="text-4xl font-semibold">{index + 1}</span>
              </CardContent>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
}

type HeroCarouselsProps = {
  leftCount: number;
  rightCount: number;
  className?: string;
};

export function HeroCarousels({ leftCount, rightCount, className }: HeroCarouselsProps) {
  return (
    <div className={`lg:grid grid-cols-2 gap-4 ${className ?? ""}`.trim()}>
      <AutoCarousel slides={leftCount} visibleItems={3} reverse className="max-h-[80dvh]" />
      <AutoCarousel slides={rightCount} visibleItems={3} className="max-h-[80dvh]" />
    </div>
  );
}
