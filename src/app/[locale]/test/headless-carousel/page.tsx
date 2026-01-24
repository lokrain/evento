"use client";

import type { ComponentPropsWithRef } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { formatSlideAnnouncement } from "@/components/headless/carousel/a11y/announce/format";

import { useCarousel } from "@/components/headless/carousel/use-carousel";

const SLIDES = [
  "Alpha",
  "Bravo",
  "Charlie",
  "Delta",
  "Echo",
  "Foxtrot",
  "Golf",
  "Hotel",
  "India",
];

export default function HeadlessCarouselTestPage() {
  const [ready, setReady] = useState(false);
  const [lastAnnouncement, setLastAnnouncement] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const loopEnabled = searchParams?.get("loop") !== "0";
  const announceChanges = searchParams?.get("announce") !== "0";
  const liveModeRaw = searchParams?.get("live");
  const liveMode =
    liveModeRaw === "off" || liveModeRaw === "polite" || liveModeRaw === "assertive"
      ? liveModeRaw
      : undefined;
  const resumeParam = searchParams?.get("resume");
  const resumeAfterInteraction = resumeParam === null ? undefined : resumeParam !== "0";
  const draggable = searchParams?.get("drag") !== "0";
  const stepParam = searchParams?.get("step");
  const step =
    stepParam !== null && Number.isFinite(Number(stepParam)) ? Math.trunc(Number(stepParam)) : undefined;
  const dwellParam = searchParams?.get("dwell");
  const dwellMs =
    dwellParam !== null && Number.isFinite(Number(dwellParam))
      ? Math.max(0, Math.trunc(Number(dwellParam)))
      : undefined;
  const scrollCommitRef = useRef<number | null>(null);

  // Wait a frame so measurements have settled before tests interact.
  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const { engine, bindings } = useCarousel({
    slideCount: SLIDES.length,
    layout: { axis: "x", readingDirection: "ltr", snapTo: "center" },
    loop: { enabled: loopEnabled },
    interaction: { draggable, step },
    motion: { disabled: true },
    accessibility: {
      label: "Headless slides test",
      live: liveMode,
      announceChanges,
    },
    autoplay: { enabled: true, dwellMs: dwellMs ?? 800, resumeAfterInteraction },
    onSettle: (index) => {
      if (!announceChanges) return;
      setLastAnnouncement(
        formatSlideAnnouncement({ index, total: SLIDES.length }),
      );
    },
    debug: true,
  });

  const slides = useMemo(
    () => Array.from({ length: engine.renderCount }),
    [engine.renderCount],
  );

  useEffect(() => {
    if (!announceChanges) return;
    if (bindings.announcer.message) {
      setLastAnnouncement(bindings.announcer.message);
    }
  }, [announceChanges, bindings.announcer.message]);

  useEffect(() => {
    return () => {
      if (scrollCommitRef.current !== null) {
        window.clearTimeout(scrollCommitRef.current);
        scrollCommitRef.current = null;
      }
    };
  }, []);

  const getCenteredSlide = (viewport: HTMLElement) => {
    const vpRect = viewport.getBoundingClientRect();
    const vpCenter = vpRect.left + vpRect.width / 2;

    const slides = Array.from(
      viewport.querySelectorAll<HTMLElement>("[data-carousel-slide-index]"),
    );

    let best: { el: HTMLElement; index: number } | null = null;
    let bestDist = Number.POSITIVE_INFINITY;

    for (const el of slides) {
      const rect = el.getBoundingClientRect();
      const center = rect.left + rect.width / 2;
      const dist = Math.abs(center - vpCenter);
      if (dist < bestDist) {
        const raw = el.dataset.carouselSlideIndex ?? "";
        const value = Number(raw);
        if (!Number.isFinite(value)) continue;
        bestDist = dist;
        best = { el, index: value };
      }
    }

    return best;
  };


  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const viewport = event.currentTarget;
    const centered = getCenteredSlide(viewport);
    if (!centered) return;
    if (scrollCommitRef.current !== null) {
      window.clearTimeout(scrollCommitRef.current);
    }

    scrollCommitRef.current = window.setTimeout(() => {
      const debug = (globalThis as {
        __carouselDebug?: { commitIndex?: (index: number) => void };
      }).__carouselDebug;
      debug?.commitIndex?.(centered.index);
      scrollCommitRef.current = null;
    }, 120);
  };

  return (
    <>
      <section
        id="carousel-main"
        tabIndex={-1}
        className="flex min-h-screen items-center justify-center bg-slate-50 p-6"
      >
        <div className="space-y-4">
          <div
            {...bindings.getRootProps({
              "data-testid": "carousel-root",
              className:
                "rounded-xl border border-slate-200 bg-white p-3 shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-primary",
            })}
          >
            <div
              {...bindings.getViewportProps({
                "data-testid": "carousel-viewport",
                className: "relative overflow-x-auto overflow-y-hidden",
                style: {
                  width: 360,
                  height: 220,
                  touchAction: "pan-y",
                  WebkitTapHighlightColor: "transparent",
                },
                onScroll: handleScroll,
              })}
            >
              <div
                {...bindings.getTrackProps({
                  "data-testid": "carousel-track",
                  "data-ready": ready ? "" : undefined,
                  className: "flex h-full gap-3 p-2 select-none",
                  style: {
                    display: "flex",
                    gap: 12,
                    padding: 8,
                    height: "100%",
                    width: "max-content",
                    willChange: "transform",
                  },
                })}
              >
                {slides.map((_, renderIndex) => {
                  const realIndex = engine.realIndexFromRenderIndex(renderIndex) % SLIDES.length;
                  const slideProps = bindings.getSlideProps(renderIndex, {
                    "data-testid": `slide-${renderIndex}`,
                    className:
                      "flex h-50 w-[320px] shrink-0 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-100 text-2xl font-semibold text-slate-700",
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
                  }) as ComponentPropsWithRef<"div">;
                  return (
                    <div key={slideProps.id ?? `slide-${renderIndex}`} {...slideProps}>
                      <span data-testid={`slide-label-${renderIndex}`}>
                        {SLIDES[realIndex] ?? `Slide ${realIndex + 1}`}
                      </span>
                      <button
                        type="button"
                        data-testid={`slide-focus-${renderIndex}`}
                        className="sr-only touch-manipulation"
                      >
                        Focus slide {renderIndex + 1}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              {...bindings.getPrevButtonProps({
                "data-testid": "prev-btn",
                className:
                  "rounded border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm hover:bg-slate-50 touch-manipulation",
              })}
            >
              Prev
            </button>
            <button
              {...bindings.getNextButtonProps({
                "data-testid": "next-btn",
                className:
                  "rounded border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm hover:bg-slate-50 touch-manipulation",
              })}
            >
              Next
            </button>
            <button
              {...bindings.autoplayToggle.getButtonProps({
                "data-testid": "autoplay-toggle",
                className:
                  "rounded border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm hover:bg-slate-50 touch-manipulation",
              })}
            >
              Autoplay
            </button>
          </div>

          <div
            {...bindings.announcer.getProps({
              className: "sr-only",
              "data-testid": "announcer",
            })}
          />

          <span data-testid="announcement-latest" className="text-sm text-slate-600">
            {lastAnnouncement ?? ""}
          </span>

          <span data-testid="engine-index" className="text-sm text-slate-600">
            {engine.index}
          </span>

          <p className="text-sm text-slate-600">
            Use this page for automated browser tests of the headless carousel hook.
          </p>

          <button
            type="button"
            data-testid="outside-focus"
            className="rounded border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm hover:bg-slate-50 touch-manipulation"
          >
            Outside Focus
          </button>
        </div>
      </section>
    </>
  );
}
