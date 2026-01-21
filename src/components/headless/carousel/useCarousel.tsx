import * as React from "react";
import {
  type DataAttributes,
  type HeadlessProps,
  mergeHeadlessProps,
  useControllableState,
} from "@/components/headless/core/props";
import type { SnapModel, UseCarouselOptions, UseCarouselReturn } from "./types";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";
import { clamp, invariant, mod, toEasingCss } from "./utils";

export function useCarousel(options: UseCarouselOptions): UseCarouselReturn {
  const {
    axis = "x",
    slideCount,
    copies = 5,
    align = "start",

    indexControl,
    onIndexChange,

    draggable = true,
    slidesToScroll = 1,

    autoplay = { enabled: false },

    measurement = { observeResize: true, remeasureOnNextFrame: true },
    snap = { durationMs: 320, easing: "ease-out", threshold: 0.5 },

    ariaLabel = "Carousel",
    ariaLive,
    ariaControlsId,
  } = options;

  invariant(Number.isInteger(slideCount) && slideCount > 0, "useCarousel: slideCount must be > 0");
  invariant(copies % 2 === 1 && copies >= 3, "useCarousel: copies must be an odd number >= 3");

  const prefersReducedMotion = usePrefersReducedMotion();

  const centerCopyIndex = Math.floor(copies / 2);
  const renderCount = copies * slideCount;
  const baseRenderIndex = centerCopyIndex * slideCount;

  const viewportRef = React.useRef<HTMLDivElement | null>(null);
  const trackRef = React.useRef<HTMLDivElement | null>(null);
  const slideRefs = React.useRef<(HTMLElement | null)[]>([]); // length renderCount

  // Index: real (0..slideCount-1). Controlled/uncontrolled via indexControl.
  const [index, _setIndex] = useControllableState<number>(indexControl ?? {}, 0);

  const lastNotifiedIndexRef = React.useRef<number | null>(null);
  const notifyIndexChange = React.useCallback(
    (next: number) => {
      const ri = mod(next, slideCount);
      if (lastNotifiedIndexRef.current === ri) return;
      lastNotifiedIndexRef.current = ri;
      onIndexChange?.(ri);
    },
    [onIndexChange, slideCount],
  );

  // Settling/drag state
  const [isDragging, setIsDragging] = React.useState(false);
  const [isSettling, setIsSettling] = React.useState(false);

  // Pixel-based transform position (virtual offset in infinite space)
  const [virtualOffsetPx, setVirtualOffsetPx] = React.useState(0);

  // Snap model built from measurement
  const [model, setModel] = React.useState<SnapModel | null>(null);

  const canScrollPrev = slideCount > 1;
  const canScrollNext = slideCount > 1;

  // Autoplay controllable playing state
  const autoplayEnabled = autoplay.enabled === true;
  const autoplayDelayMs = autoplayEnabled ? autoplay.delayMs : 0;
  const pauseOnHover = autoplayEnabled ? (autoplay.pauseOnHover ?? true) : false;
  const resumeAfterInteraction = autoplayEnabled ? (autoplay.resumeAfterInteraction ?? true) : true;

  const [isPlaying, setIsPlaying] = useControllableState<boolean>(
    autoplayEnabled ? (autoplay.playing ?? { defaultValue: true }) : { defaultValue: false },
    autoplayEnabled,
  );

  // Under reduced motion, force autoplay off.
  React.useEffect(() => {
    if (!prefersReducedMotion) return;
    setIsPlaying(false);
  }, [prefersReducedMotion, setIsPlaying]);

  const snapDurationMs = snap.durationMs ?? 320;
  const snapEasingCss = toEasingCss(snap.easing ?? "ease-out");
  const snapThreshold = clamp(snap.threshold ?? 0.5, 0, 1);

  const getRealIndexForRenderIndex = React.useCallback(
    (renderIndex: number) => mod(renderIndex, slideCount),
    [slideCount],
  );

  const applyTransform = React.useCallback(
    (offset: number, withTransition: boolean) => {
      const track = trackRef.current;
      if (!track) return;
      const transition = withTransition && !prefersReducedMotion
        ? `transform ${snapDurationMs}ms ${snapEasingCss}`
        : "none";
      const pos = -offset;
      const transform = axis === "x" ? `translate3d(${pos}px, 0, 0)` : `translate3d(0, ${pos}px, 0)`;

      track.style.transition = transition;
      track.style.transform = transform;
    },
    [axis, prefersReducedMotion, snapDurationMs, snapEasingCss],
  );

  React.useLayoutEffect(() => {
    applyTransform(virtualOffsetPx, isSettling && !isDragging);
  }, [applyTransform, isDragging, isSettling, virtualOffsetPx]);

  const rebuildModel = React.useCallback(() => {
    const track = trackRef.current;
    const viewport = viewportRef.current;
    if (!track || !viewport) return;

    const trackRect = track.getBoundingClientRect();
    const vpRect = viewport.getBoundingClientRect();
    const viewportLength = axis === "x" ? vpRect.width : vpRect.height;
    if (!(viewportLength > 0)) return;

    // Measure center cycle slide starts relative to the first slide of center cycle.
    const firstEl = slideRefs.current[baseRenderIndex];
    if (!firstEl) return;
    const firstRect = firstEl.getBoundingClientRect();
    const baseStartAbs =
      axis === "x" ? firstRect.left - trackRect.left : firstRect.top - trackRect.top;

    const starts: number[] = [];
    const sizes: number[] = [];

    for (let i = 0; i < slideCount; i++) {
      const el = slideRefs.current[baseRenderIndex + i];
      if (!el) return;
      const r = el.getBoundingClientRect();
      const startAbs = axis === "x" ? r.left - trackRect.left : r.top - trackRect.top;
      const size = axis === "x" ? r.width : r.height;
      starts.push(startAbs - baseStartAbs);
      sizes.push(size);
    }

    // Cycle length: end of last slide relative to first.
    const lastStart = starts[slideCount - 1] ?? 0;
    const lastSize = sizes[slideCount - 1] ?? 0;
    const cycleLength = lastStart + lastSize;
    if (!(cycleLength > 0)) return;

    // Apply alignment
    const snapOffsets = starts.map((start, i) => {
      if (align === "start") return start;
      // center align: shift so slide center aligns with viewport center
      const slideSize = sizes[i] ?? 0;
      return start - (viewportLength - slideSize) / 2;
    });

    setModel({ snapOffsets, cycleLength, viewportLength });
  }, [align, axis, baseRenderIndex, slideCount]);

  // Observe resizes / layout changes
  React.useEffect(() => {
    const track = trackRef.current;
    const viewport = viewportRef.current;
    if (!track || !viewport) return;

    if (!measurement.observeResize) {
      const raf = requestAnimationFrame(() => rebuildModel());
      return () => cancelAnimationFrame(raf);
    }

    const ro = new ResizeObserver(() => rebuildModel());
    ro.observe(viewport);
    ro.observe(track);
    // Observe center cycle slides primarily
    for (let i = 0; i < slideCount; i++) {
      const el = slideRefs.current[baseRenderIndex + i];
      if (el) ro.observe(el);
    }

    const raf = requestAnimationFrame(() => rebuildModel());
    let raf2: number | null = null;
    if (measurement.remeasureOnNextFrame) {
      raf2 = requestAnimationFrame(() => rebuildModel());
    }

    return () => {
      cancelAnimationFrame(raf);
      if (raf2 != null) cancelAnimationFrame(raf2);
      ro.disconnect();
    };
  }, [
    baseRenderIndex,
    measurement.observeResize,
    measurement.remeasureOnNextFrame,
    rebuildModel,
    slideCount,
  ]);

  // Initialize / update offset when model becomes ready or index changes externally.
    React.useLayoutEffect(() => {
    if (!model) return;
    const ri = mod(index, slideCount);
    // Anchor to center cycle; add cycleLength * centerCopyIndex to keep headroom for normalization.
    const target = model.snapOffsets[ri] + centerCopyIndex * model.cycleLength;
    // Apply immediately (no transition) to avoid visible movement on mount / controlled updates.
    applyTransform(target, false);
    setVirtualOffsetPx(target);
    setIsSettling(false);
    setIsDragging(false);
  }, [model, index, centerCopyIndex, slideCount, applyTransform]);

  // Centralized, deduped index change notifications (controlled + uncontrolled).
  React.useEffect(() => {
    notifyIndexChange(index);
  }, [index, notifyIndexChange]);

  const normalizeOffset = React.useCallback(
    (offset: number) => {
      invariant(model, "snap model not ready");
      const centerStart = centerCopyIndex * model.cycleLength;
      const local = mod(offset, model.cycleLength);
      return centerStart + local;
    },
    [centerCopyIndex, model],
  );

  const nearestRealIndexForOffset = React.useCallback(
    (offset: number) => {
      invariant(model, "snap model not ready");
      const local = mod(offset, model.cycleLength);
      let best = 0;
      let bestDist = Infinity;
      for (let i = 0; i < model.snapOffsets.length; i++) {
        const d = Math.abs(model.snapOffsets[i] - local);
        if (d < bestDist) {
          bestDist = d;
          best = i;
        }
      }
      return best;
    },
    [model],
  );

  const snapToReal = React.useCallback(
    (realIndex: number, withTransition: boolean) => {
      if (!model) return;
      const ri = mod(realIndex, slideCount);
      const target = model.snapOffsets[ri] + centerCopyIndex * model.cycleLength;
      setIsDragging(false);
      setIsSettling(withTransition);
      if (!withTransition) applyTransform(target, false);
      setVirtualOffsetPx(target);
      _setIndex(ri);
    },
    [applyTransform, centerCopyIndex, model, slideCount, _setIndex],
  );

  const scrollTo = React.useCallback(
    (next: number) => {
      snapToReal(next, true);
    },
    [snapToReal],
  );

  const scrollPrev = React.useCallback(() => {
    if (slideCount <= 1) return;
    scrollTo(index - Math.max(1, slidesToScroll));
  }, [index, scrollTo, slideCount, slidesToScroll]);

  const scrollNext = React.useCallback(() => {
    if (slideCount <= 1) return;
    scrollTo(index + Math.max(1, slidesToScroll));
  }, [index, scrollTo, slideCount, slidesToScroll]);

  const setIndex = React.useCallback(
    (next: number | ((prev: number) => number)) => {
      const nextValue = typeof next === "function" ? (next as (p: number) => number)(index) : next;
      scrollTo(nextValue);
    },
    [index, scrollTo],
  );

  // Drag handling (pointer-based, variable size)
  const pointerIdRef = React.useRef<number | null>(null);
  const dragStartPosRef = React.useRef<number>(0);
  const dragStartOffsetRef = React.useRef<number>(0);
  const lastPosRef = React.useRef<number>(0);
  const lastTimeRef = React.useRef<number>(0);
  const velocityRef = React.useRef<number>(0);
  const dragDirectionRef = React.useRef<1 | -1>(1);

  // Autoplay timer
  const timerRef = React.useRef<number | null>(null);
  const hoverPausedRef = React.useRef(false);

  const clearTimer = React.useCallback(() => {
    if (timerRef.current != null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const stopAutoplayTemporarily = React.useCallback(() => {
    if (!autoplayEnabled) return;
    clearTimer();
    if (!resumeAfterInteraction) setIsPlaying(false);
  }, [autoplayEnabled, clearTimer, resumeAfterInteraction, setIsPlaying]);

  const onPointerDown = React.useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!draggable) return;
      if (!model) return;
      if (pointerIdRef.current != null) return;

      pointerIdRef.current = e.pointerId;
      e.currentTarget.setPointerCapture(e.pointerId);

      stopAutoplayTemporarily();
      setIsDragging(true);
      setIsSettling(false);

      const pos = axis === "x" ? e.clientX : e.clientY;
      dragStartPosRef.current = pos;
      dragStartOffsetRef.current = virtualOffsetPx;
      lastPosRef.current = pos;
      lastTimeRef.current = performance.now();
      velocityRef.current = 0;
      dragDirectionRef.current = 1;

      // Ensure no transition during drag
      applyTransform(virtualOffsetPx, false);
    },
    [applyTransform, axis, draggable, model, stopAutoplayTemporarily, virtualOffsetPx],
  );

  const onPointerMove = React.useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!draggable) return;
      if (pointerIdRef.current !== e.pointerId) return;
      if (!isDragging) return;

      const pos = axis === "x" ? e.clientX : e.clientY;
      const delta = pos - dragStartPosRef.current;

      // Natural drag: dragging right should reveal previous content => offset decreases.
      const nextOffset = dragStartOffsetRef.current - delta;
      setVirtualOffsetPx(nextOffset);

      const now = performance.now();
      const dt = Math.max(1, now - lastTimeRef.current);
      const dx = pos - lastPosRef.current;
      const v = dx / dt; // px/ms pointer direction
      velocityRef.current = velocityRef.current * 0.8 + v * 0.2;
      lastPosRef.current = pos;
      lastTimeRef.current = now;

      // Track direction in offset space (negate pointer velocity)
      dragDirectionRef.current = (-v >= 0 ? 1 : -1) as 1 | -1;
    },
    [axis, draggable, isDragging],
  );

  const snapToNearestWithBias = React.useCallback(
    (offset: number) => {
      if (!model) return;
      // Find nearest snap in current cycle
      const local = mod(offset, model.cycleLength);
      const cycleBase = offset - local;

      // Find best and runner-up to apply threshold bias in drag direction
      let bestIdx = 0;
      let bestDist = Infinity;
      let _secondIdx = 0;
      let secondDist = Infinity;

      for (let i = 0; i < model.snapOffsets.length; i++) {
        const d = Math.abs(model.snapOffsets[i] - local);
        if (d < bestDist) {
          secondDist = bestDist;
          _secondIdx = bestIdx;
          bestDist = d;
          bestIdx = i;
        } else if (d < secondDist) {
          secondDist = d;
          _secondIdx = i;
        }
      }

      // Bias toward next/prev snap based on drag direction and threshold.
      // If user dragged in a direction and we are “close enough” to the adjacent snap, advance.
      const dir = dragDirectionRef.current;
      const currentIdx = bestIdx;
      const candidateIdx = mod(currentIdx + (dir === 1 ? 1 : -1), slideCount);

      const currentSnap = model.snapOffsets[currentIdx];
      const candidateSnap = model.snapOffsets[candidateIdx];
      const toward = Math.abs(candidateSnap - local);
      const away = Math.abs(currentSnap - local);

      const pick =
        toward < away &&
        toward <= snapThreshold * Math.max(1, Math.abs(candidateSnap - currentSnap))
          ? candidateIdx
          : bestIdx;

      const target = cycleBase + model.snapOffsets[pick];
      setIsSettling(true);
      setIsDragging(false);
      setVirtualOffsetPx(target);
      _setIndex(pick);
      onIndexChange?.(pick);
    },
    [model, onIndexChange, slideCount, snapThreshold, _setIndex],
  );

  const finishDrag = React.useCallback(() => {
    if (!model) return;
    if (!isDragging) return;

    setIsDragging(false);
    const local = mod(virtualOffsetPx, model.cycleLength);
    const spacing = model.cycleLength / Math.max(1, model.snapOffsets.length);
    const nearestDist = model.snapOffsets.reduce((best, snap) => {
      const d = Math.abs(snap - local);
      return d < best ? d : best;
    }, Number.POSITIVE_INFINITY);

    // If we are already close to a snap point, skip fling to avoid wrapping
    const shouldFling = nearestDist > snapThreshold * spacing;

    // Fling in offset direction (negate pointer velocity)
    const vOffset = shouldFling ? -velocityRef.current : 0; // px/ms
    // Cap fling to a portion of cycle length to avoid huge jumps
    const flingPx = clamp(vOffset * 180, -0.75 * model.cycleLength, 0.75 * model.cycleLength);
    snapToNearestWithBias(virtualOffsetPx + flingPx);
  }, [isDragging, model, snapToNearestWithBias, snapThreshold, virtualOffsetPx]);

  const onPointerUp = React.useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (pointerIdRef.current !== e.pointerId) return;
      e.currentTarget.releasePointerCapture?.(e.pointerId);
      pointerIdRef.current = null;
      finishDrag();
    },
    [finishDrag],
  );

  const onPointerCancel = React.useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (pointerIdRef.current !== e.pointerId) return;
      e.currentTarget.releasePointerCapture?.(e.pointerId);
      pointerIdRef.current = null;
      finishDrag();
    },
    [finishDrag],
  );

  const startTimer = React.useCallback(() => {
    clearTimer();
    if (!autoplayEnabled) return;
    if (prefersReducedMotion) return;
    if (!isPlaying) return;
    if (slideCount <= 1) return;
    if (hoverPausedRef.current) return;
    if (isDragging) return;

    timerRef.current = window.setTimeout(() => {
      scrollNext();
    }, autoplayDelayMs);
  }, [
    autoplayDelayMs,
    autoplayEnabled,
    clearTimer,
    isDragging,
    isPlaying,
    prefersReducedMotion,
    scrollNext,
    slideCount,
  ]);

  // When a transition ends, normalize to center band without transition and re-arm autoplay.
  React.useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const onEnd = () => {
      setIsSettling(false);
      if (!model) return;
      const normalized = normalizeOffset(virtualOffsetPx);
      if (normalized !== virtualOffsetPx) {
        applyTransform(normalized, false);
        setVirtualOffsetPx(normalized);
      }

      const ri = nearestRealIndexForOffset(normalized);
      _setIndex(ri);

      // Re-arm autoplay after motion completes to reduce drift.
      startTimer();
    };

    track.addEventListener("transitionend", onEnd);
    return () => track.removeEventListener("transitionend", onEnd);
  }, [
    applyTransform,
    model,
    nearestRealIndexForOffset,
    normalizeOffset,
    startTimer,
    virtualOffsetPx,
    _setIndex,
  ]);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    startTimer();
    return clearTimer;
  }, [startTimer, clearTimer]);

  const play = React.useCallback(() => {
    if (!autoplayEnabled) return;
    if (prefersReducedMotion) return;
    setIsPlaying(true);
  }, [autoplayEnabled, prefersReducedMotion, setIsPlaying]);

  const pause = React.useCallback(() => {
    setIsPlaying(false);
  }, [setIsPlaying]);

  const toggle = React.useCallback(() => {
    if (isPlaying) pause();
    else play();
  }, [isPlaying, pause, play]);

  // Keyboard behavior (no autoplay restart on focus)
  const onKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      const isHorizontal = axis === "x";
      const prevKey = isHorizontal ? "ArrowLeft" : "ArrowUp";
      const nextKey = isHorizontal ? "ArrowRight" : "ArrowDown";

      if (e.key === prevKey) {
        e.preventDefault();
        scrollPrev();
        stopAutoplayTemporarily();
      } else if (e.key === nextKey) {
        e.preventDefault();
        scrollNext();
        stopAutoplayTemporarily();
      } else if (e.key === "Home") {
        e.preventDefault();
        scrollTo(0);
        stopAutoplayTemporarily();
      } else if (e.key === "End") {
        e.preventDefault();
        scrollTo(slideCount - 1);
        stopAutoplayTemporarily();
      }
    },
    [axis, scrollNext, scrollPrev, scrollTo, slideCount, stopAutoplayTemporarily],
  );

  // Prop getters (USER-FIRST veto semantics via mergeProps from core/props.ts)
  const getRootProps = React.useCallback(
    <P extends React.HTMLAttributes<HTMLElement>>(user?: P) => {
      const internal: HeadlessProps<HTMLElement> & {
        role: "region";
        "aria-roledescription": "carousel";
      } = {
        role: "region",
        "aria-roledescription": "carousel",
        "aria-label": ariaLabel,
        "aria-live": ariaLive ?? (autoplayEnabled ? "polite" : undefined),
        tabIndex: 0,
        "data-axis": axis,
        "data-playing": isPlaying ? "" : undefined,
        onKeyDown,
        onMouseEnter: () => {
          if (!autoplayEnabled || !pauseOnHover) return;
          hoverPausedRef.current = true;
          clearTimer();
        },
        onMouseLeave: () => {
          if (!autoplayEnabled || !pauseOnHover) return;
          hoverPausedRef.current = false;
          startTimer();
        },
      };

      return mergeHeadlessProps(internal, user) as P & {
        role: "region";
        "aria-roledescription": "carousel";
      };
    },
    [ariaLabel, ariaLive, axis, autoplayEnabled, clearTimer, isPlaying, onKeyDown, pauseOnHover, startTimer],
  );

  const getViewportProps = React.useCallback(
    <P extends React.HTMLAttributes<HTMLDivElement>>(user?: P) => {
      const internal = {
        tabIndex: 0,
        "data-carousel-viewport": "",
        ref: (node: HTMLDivElement | null) => {
          viewportRef.current = node;
        },
      } satisfies HeadlessProps<HTMLDivElement> & {
        tabIndex: number;
        "data-carousel-viewport": "";
      };

      return mergeHeadlessProps(internal, user);
    },
    [],
  );

  const getTrackProps = React.useCallback(
    <P extends React.HTMLAttributes<HTMLDivElement>>(user?: P) => {
      const internal = {
        "data-carousel-track": "",
        ref: (node: HTMLDivElement | null) => {
          trackRef.current = node;
        },
        onPointerDown,
        onPointerMove,
        onPointerUp,
        onPointerCancel,
        style: {
          touchAction: axis === "x" ? "pan-y" : "pan-x",
          userSelect: isDragging ? "none" : undefined,
          cursor: draggable ? (isDragging ? "grabbing" : "grab") : undefined,
          willChange: "transform",
        },
      } satisfies HeadlessProps<HTMLDivElement> & { "data-carousel-track": "" };

      return mergeHeadlessProps(internal, user);
    },
    [axis, draggable, isDragging, onPointerCancel, onPointerDown, onPointerMove, onPointerUp],
  );

  const getSlideProps = React.useCallback(
    <P extends React.HTMLAttributes<HTMLElement>>(renderIndex: number, user?: P) => {
      const realIndex = getRealIndexForRenderIndex(renderIndex);
      const internal = {
        role: "group",
        "aria-roledescription": "slide",
        "aria-label": `${realIndex + 1} of ${Math.max(1, slideCount)}`,
        "data-render-index": renderIndex,
        "data-index": realIndex,
        "data-selected": realIndex === mod(index, slideCount) ? "" : undefined,
        ref: (node: HTMLElement | null) => {
          slideRefs.current[renderIndex] = node;
        },
      } satisfies HeadlessProps<HTMLElement> & {
        role: "group";
        "aria-roledescription": "slide";
        "data-render-index": number;
        "data-index": number;
      };

      return mergeHeadlessProps(internal, user);
    },
    [getRealIndexForRenderIndex, index, slideCount],
  );

  const getPrevButtonProps = React.useCallback(
    <P extends React.ButtonHTMLAttributes<HTMLButtonElement>>(user?: P) => {
      const internal = {
        type: "button",
        "aria-label": "Previous slide",
        "aria-controls": ariaControlsId,
        onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
          if (e.defaultPrevented) return;
          scrollPrev();
          stopAutoplayTemporarily();
        },
      } satisfies React.ButtonHTMLAttributes<HTMLButtonElement> &
        DataAttributes & {
          type: "button";
          "aria-label": string;
        };

      return mergeHeadlessProps(internal, user);
    },
    [scrollPrev, stopAutoplayTemporarily],
  );

  const getNextButtonProps = React.useCallback(
    <P extends React.ButtonHTMLAttributes<HTMLButtonElement>>(user?: P) => {
      const internal = {
        type: "button",
        "aria-label": "Next slide",
        "aria-controls": ariaControlsId,
        onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
          if (e.defaultPrevented) return;
          scrollNext();
          stopAutoplayTemporarily();
        },
      } satisfies React.ButtonHTMLAttributes<HTMLButtonElement> & {
        type: "button";
        "aria-label": string;
      };

      return mergeHeadlessProps(internal, user);
    },
    [scrollNext, stopAutoplayTemporarily],
  );

  const getPlayPauseButtonProps = React.useCallback(
    <P extends React.ButtonHTMLAttributes<HTMLButtonElement>>(user?: P) => {
      const disabled = !autoplayEnabled || prefersReducedMotion;
      const internal = {
        type: "button",
        disabled,
        "aria-pressed": isPlaying,
        "aria-label": isPlaying ? "Pause autoplay" : "Play autoplay",
        onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
          if (e.defaultPrevented) return;
          if (disabled) return;
          toggle();
        },
      } satisfies React.ButtonHTMLAttributes<HTMLButtonElement> & {
        type: "button";
        "aria-pressed": boolean;
        "aria-label": string;
      };

      return mergeHeadlessProps(internal, user);
    },
    [autoplayEnabled, isPlaying, prefersReducedMotion, toggle],
  );

  return {
    index: mod(index, slideCount),
    isDragging,
    isSettling,

    canScrollPrev,
    canScrollNext,

    scrollTo,
    scrollPrev,
    scrollNext,
    setIndex,

    renderCount,
    getRealIndexForRenderIndex,

    getRootProps,
    getViewportProps,
    getTrackProps,
    getSlideProps,
    getPrevButtonProps,
    getNextButtonProps,

    isPlaying: autoplayEnabled ? isPlaying : false,
    getPlayPauseButtonProps,
  };
}
