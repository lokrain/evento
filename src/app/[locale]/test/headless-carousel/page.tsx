"use client";

import { useEffect, useMemo, useState } from "react";

import { useCarousel } from "@/components/headless/carousel";

const SLIDES = ["Alpha", "Bravo", "Charlie"];

export default function HeadlessCarouselTestPage() {
  const [ready, setReady] = useState(false);

  // Wait a frame so measurements have settled before tests interact.
  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const {
    renderCount,
    getRealIndexForRenderIndex,
    getRootProps,
    getViewportProps,
    getTrackProps,
    getSlideProps,
    getPrevButtonProps,
    getNextButtonProps,
    getPlayPauseButtonProps,
  } = useCarousel({
    slideCount: SLIDES.length,
    copies: 5,
    slidesToScroll: 1,
    autoplay: { enabled: true, delayMs: 800, pauseOnHover: true, resumeAfterInteraction: true },
    snap: { durationMs: 200, threshold: 0.5 },
    measurement: { observeResize: true, remeasureOnNextFrame: true },
    ariaLabel: "Headless carousel test",
  });

  const slides = useMemo(() => Array.from({ length: renderCount }), [renderCount]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="space-y-4">
        <div
          {...getRootProps({
            "data-testid": "carousel-root",
            className:
              "rounded-xl border border-slate-200 bg-white p-3 shadow-sm outline-none focus:ring-2 focus:ring-primary",
          })}
        >
          <div
            {...getViewportProps({
              "data-testid": "carousel-viewport",
              className: "relative overflow-hidden",
              style: { width: 360, height: 220 },
            })}
          >
            <div
              {...getTrackProps({
                "data-testid": "carousel-track",
                "data-ready": ready ? "" : undefined,
                className: "flex h-full gap-3 p-2",
                style: {
                  display: "flex",
                  gap: 12,
                  padding: 8,
                  height: "100%",
                  touchAction: "pan-y",
                  willChange: "transform",
                },
              })}
            >
              {slides.map((_, renderIndex) => {
                const realIndex = getRealIndexForRenderIndex(renderIndex);
                return (
                  <div
                    key={renderIndex}
                    {...getSlideProps(renderIndex, {
                      "data-testid": `slide-${renderIndex}`,
                      className:
                        "flex h-[200px] w-[320px] shrink-0 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-100 text-2xl font-semibold text-slate-700",
                      style: {
                        width: 320,
                        height: 200,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "1px dashed rgb(203 213 225)",
                        borderRadius: 12,
                        background: "rgb(241 245 249)",
                      },
                    })}
                  >
                    <span data-testid={`slide-label-${renderIndex}`}>
                      {SLIDES[realIndex] ?? `Slide ${realIndex + 1}`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            {...getPrevButtonProps({
              "data-testid": "prev-btn",
              className:
                "rounded border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm hover:bg-slate-50",
            })}
          >
            Prev
          </button>
          <button
            {...getNextButtonProps({
              "data-testid": "next-btn",
              className:
                "rounded border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm hover:bg-slate-50",
            })}
          >
            Next
          </button>
          <button
            {...getPlayPauseButtonProps({
              "data-testid": "play-pause-btn",
              className:
                "rounded border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm hover:bg-slate-50",
            })}
          >
            Toggle autoplay
          </button>
        </div>

        <p className="text-sm text-slate-600">
          This page exists solely for automated browser tests of the headless carousel hook.
        </p>
      </div>
    </main>
  );
}