import type { Dispatch } from "react";
import type { CarouselAction } from "../../actions/action-types";
import { buildGateSet } from "../../actions/builders/build-autoplay";
import { buildVirtualPin, buildVirtualUnpin } from "../../actions/builders/build-virtual";
import { shouldPinOnFocus, shouldUnpinOnBlur } from "../../model/virtual/focus-pin";

/**
 * Focus pinning gate.
 *
 * Responsibilities:
 * - Detect focus entering/leaving a slide
 * - Pin/unpin the logical index so virtualization never unmounts it
 * - Update focusWithin gate
 *
 * Non-responsibilities:
 * - Does NOT compute windows
 * - Does NOT touch scroll or motion
 */
export function attachFocusPinGate(params: {
  readonly root: HTMLElement;
  readonly slideIndexFromTarget: (target: EventTarget | null) => number | null;
  readonly dispatch: Dispatch<CarouselAction>;
}): () => void {
  const { root, slideIndexFromTarget, dispatch } = params;

  const onFocusIn = (e: FocusEvent) => {
    if (!shouldPinOnFocus()) return;

    const idx = slideIndexFromTarget(e.target);
    if (idx === null) return;

    dispatch(
      buildGateSet({
        gate: "focusWithin",
        value: true,
        source: "dom",
      })
    );

    dispatch(buildVirtualPin(idx, "focus"));
  };

  const onFocusOut = (e: FocusEvent) => {
    if (!shouldUnpinOnBlur()) return;

    // relatedTarget is where focus is going next
    const next = e.relatedTarget as EventTarget | null;
    const nextIdx = slideIndexFromTarget(next);

    // If focus stays within the same slide, do nothing
    const prevIdx = slideIndexFromTarget(e.target);
    if (prevIdx !== null && prevIdx === nextIdx) return;

    if (prevIdx !== null) {
      dispatch(buildVirtualUnpin(prevIdx, "focus"));
    }

    // If focus left the carousel entirely
    if (!root.contains(next as Node | null)) {
      dispatch(
        buildGateSet({
          gate: "focusWithin",
          value: false,
          source: "dom",
        })
      );
    }
  };

  root.addEventListener("focusin", onFocusIn);
  root.addEventListener("focusout", onFocusOut);

  return () => {
    root.removeEventListener("focusin", onFocusIn);
    root.removeEventListener("focusout", onFocusOut);
  };
}
