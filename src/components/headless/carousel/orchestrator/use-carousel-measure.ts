"use client";

import * as React from "react";

import { buildMeasureFlush } from "../actions/builders/build-measure";
import { asPx } from "../core/brands";
import { enqueueMeasure } from "../measure/flush-measure";
import { observeSlides } from "../measure/slide-observer";
import { observeViewport } from "../measure/viewport-observer";
import type { CarouselRefs } from "../dom/refs/create-refs";
import type { CarouselAction } from "../actions/action-types";
import type { CarouselState } from "../store/state";

export function useCarouselMeasure(params: {
  readonly internalRefs: CarouselRefs;
  readonly stateRef: React.MutableRefObject<CarouselState>;
  readonly dispatch: React.Dispatch<CarouselAction>;
  readonly slideCount: number;
  readonly observeResize: boolean;
  readonly remeasureOnNextFrame: boolean;
}) {
  const { internalRefs, stateRef, dispatch, slideCount, observeResize, remeasureOnNextFrame } =
    params;

  const measureNow = React.useCallback(() => {
    const viewport = internalRefs.state.viewport;
    if (!viewport) return;

    const axis = stateRef.current.axis;
    const viewportRect = viewport.getBoundingClientRect();
    const viewportMainPx = asPx(axis === "x" ? viewportRect.width : viewportRect.height);

    const nextSizes = new Map(stateRef.current.measure.slideSizeByIndex);
    const count = stateRef.current.slideCount;
    for (let i = 0; i < count; i += 1) {
      const slide = internalRefs.state.slides.get(i);
      if (!slide) continue;
      const rect = slide.getBoundingClientRect();
      const size = asPx(axis === "x" ? rect.width : rect.height);
      nextSizes.set(i, size);
    }

    dispatch(
      buildMeasureFlush({
        viewportMainPx,
        slideSizes: nextSizes,
      }),
    );
  }, [dispatch, internalRefs, stateRef]);

  const scheduleMeasure = React.useCallback(() => {
    if (remeasureOnNextFrame) {
      enqueueMeasure(measureNow);
    } else {
      measureNow();
    }
  }, [measureNow, remeasureOnNextFrame]);

  React.useEffect(() => {
    scheduleMeasure();
  }, [scheduleMeasure, slideCount]);

  React.useEffect(() => {
    if (!observeResize) return;

    const detachViewport = observeViewport(internalRefs.state.viewport, scheduleMeasure);
    const detachSlides = observeSlides(internalRefs.state.root, scheduleMeasure);

    return () => {
      detachViewport();
      detachSlides();
    };
  }, [internalRefs, observeResize, scheduleMeasure]);
}
