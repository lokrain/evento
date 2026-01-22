"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";

import { useCarousel } from "@/components/headless/carousel";
import { Card, CardContent } from "@/components/ui/card";

type AutoCarouselProps = {
  slides: number; // total slides
  reverse?: boolean;
  delayMs?: number;
  className?: string;
};

function AutoCarousel({ slides, reverse = false, delayMs = 4000, className }: AutoCarouselProps) {
  const controlsId = useId();
  const slideIds = useMemo(
    () => Array.from({ length: slides }, (_, i) => `slide-${i + 1}`),
    [slides],
  );

  const reverseTimerRef = useRef<number | null>(null);

  const {
    renderCount,
    getRootProps,
    getViewportProps,
    getTrackProps,
    getSlideProps,
    scrollPrev,
    scrollNext,
    isReady,
  } = useCarousel({
    slideCount: slides,
    axis: "y",
    ariaControlsId: controlsId,
    autoplay: reverse ? { enabled: false } : { enabled: true, delayMs },
    snap: { durationMs: 780, easing: { cubicBezier: [0.22, 0.61, 0.36, 1] } },
    debug: true
  });

  useEffect(() => {
    if (!reverse || !isReady) return;
    const arm = () => {
      reverseTimerRef.current = window.setTimeout(() => {
        scrollPrev();
        arm();
      }, delayMs);
    };
    arm();
    return () => {
      if (reverseTimerRef.current != null) {
        window.clearTimeout(reverseTimerRef.current);
        reverseTimerRef.current = null;
      }
    };
  }, [reverse, delayMs, scrollPrev, isReady]);

  const itemHeightPct = (i: number) => {
    const heights = [26, 32, 28, 30, 24];
    return heights[i % heights.length];
  };

  return (
    <div
      {...getRootProps({
        className: `relative h-full overflow-hidden ${className ?? ""}`.trim(),
        "data-orientation": "vertical",
      })}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.08),transparent_35%),radial-gradient(circle_at_70%_60%,rgba(255,255,255,0.06),transparent_30%)]" />

      <div
        {...getViewportProps({
          id: controlsId,
          className: "overflow-hidden h-full relative",
        })}
      >
        <div
          {...getTrackProps({
            className: "flex flex-col gap-4 p-3 will-change-transform",
          })}
        >
          {Array.from({ length: renderCount }).map((_, renderIndex) => {
            const realIndex = renderIndex % slides;
            const height = `${itemHeightPct(realIndex)}dvh`;
            const tone = reverse ? "from-primary/15 via-slate-900/60" : "from-indigo-400/15 via-slate-900/60";
            return (
              <div
                key={renderIndex}
                {...getSlideProps(renderIndex, {
                  className: "shrink-0",
                  style: { maxHeight: height },
                })}
              >
                <Card className="group relative overflow-hidden border border-white/10 bg-white/5 backdrop-blur shadow-2xl">
                  <div className={`absolute inset-0 bg-linear-to-br ${tone} to-transparent`} aria-hidden="true" />
                  <CardContent className="relative flex h-full items-center justify-between gap-4 p-6">
                    <div className="flex flex-col gap-1 text-left">
                      <span className="text-xs uppercase tracking-[0.25em] text-white/70">Signature</span>
                      <span className="text-4xl font-semibold text-white drop-shadow-sm">{realIndex + 1}</span>
                      <span className="text-sm text-white/70">Curated talent • Premium billing</span>
                    </div>
                    <div className="flex items-center gap-2 rounded-full border border-white/15 bg-black/30 px-3 py-1 text-xs text-white/80 backdrop-blur">
                      <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
                      {reverse ? "Upward flow" : "Downward flow"}
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </div>
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
      <AutoCarousel slides={leftCount} reverse className="max-h-[80dvh]" />
      <AutoCarousel slides={rightCount} className="max-h-[80dvh]" />
    </div>
  );
}
