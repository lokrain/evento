"use client";

import * as React from "react";

import { attachFocusPinGate } from "../dom/gates/focus-pin";
import { attachHoverGate } from "../dom/hover";
import { createPointerGateHandler } from "../dom/listeners/on-pointer";
import { attachReducedMotionGate } from "../dom/reduced-motion";
import { attachVisibilityGate } from "../dom/visibility";
import { extractSlideIndexFromDomTarget } from "../dom/geometry";
import type { CarouselRefs } from "../dom/refs/create-refs";
import type { CarouselAction } from "../actions/action-types";
import { buildGateSet } from "../actions/builders/build-autoplay";

export function useCarouselDomGates(params: {
  readonly internalRefs: CarouselRefs;
  readonly dispatch: React.Dispatch<CarouselAction>;
  readonly isDraggable: boolean;
  readonly pauseWhenHidden: boolean;
  readonly onPointerDown?: () => void;
  readonly onFocusWithinStart?: () => void;
}) {
  const { internalRefs, dispatch, isDraggable, pauseWhenHidden, onPointerDown, onFocusWithinStart } =
    params;

  React.useEffect(() => {
    const root = internalRefs.state.root;
    if (!root) return;

    const detach = attachFocusPinGate({
      root,
      dispatch,
      slideIndexFromTarget: (target) => extractSlideIndexFromDomTarget(target),
      onFocusWithinStart,
    });

    return () => detach();
  }, [dispatch, internalRefs, onFocusWithinStart]);

  React.useEffect(() => {
    const root = internalRefs.state.root;
    if (!root) return;

    const detachHover = attachHoverGate({ root, dispatch });
    const detachReduced = attachReducedMotionGate({ dispatch });
    const detachVisibility = pauseWhenHidden ? attachVisibilityGate({ dispatch }) : null;

    return () => {
      detachHover();
      detachVisibility?.();
      detachReduced();
    };
  }, [dispatch, internalRefs, pauseWhenHidden]);

  React.useEffect(() => {
    if (pauseWhenHidden) return;
    dispatch(buildGateSet({ gate: "visibilityHidden", value: false, source: "policy" }));
  }, [dispatch, pauseWhenHidden]);

  React.useEffect(() => {
    const root = internalRefs.state.root;
    if (!root) return;

    if (!isDraggable) return;

    const handler = createPointerGateHandler({ dispatch });
    const onPointer = (event: PointerEvent) => {
      if (event.type === "pointerdown") {
        onPointerDown?.();
      }
      handler(event);
    };

    root.addEventListener("pointerdown", onPointer, { passive: true });
    root.addEventListener("pointerup", onPointer, { passive: true });
    root.addEventListener("pointercancel", onPointer, { passive: true });

    return () => {
      root.removeEventListener("pointerdown", onPointer);
      root.removeEventListener("pointerup", onPointer);
      root.removeEventListener("pointercancel", onPointer);
    };
  }, [dispatch, internalRefs, isDraggable, onPointerDown]);
}
