import type { Dispatch } from "react";
import type { CarouselAction } from "../../actions/action-types";
import { buildGateSet } from "../../actions/builders/build-autoplay";

export function createPointerGateHandler(params: {
  readonly dispatch: Dispatch<CarouselAction>;
}) {
  return (event: PointerEvent) => {
    if (event.type === "pointerdown") {
      params.dispatch(
        buildGateSet({ gate: "dragging", value: true, source: "dom" }),
      );
    }

    if (event.type === "pointerup" || event.type === "pointercancel") {
      params.dispatch(
        buildGateSet({ gate: "dragging", value: false, source: "dom" }),
      );
    }
  };
}

export interface PointerDragEvent {
  readonly delta: number;
  readonly velocity: number;
  readonly total: number;
  readonly clientX: number;
  readonly clientY: number;
}

export function createPointerDragTracker(params: {
  readonly thresholdPx?: number;
  readonly onDragStart?: () => void;
  readonly onDragMove?: (event: PointerDragEvent) => void;
  readonly onDragEnd?: (event: PointerDragEvent) => void;
}) {
  const threshold = Math.max(0, params.thresholdPx ?? 0);
  let active = false;
  let started = false;
  let lastX = 0;
  let lastY = 0;
  let lastTime = 0;
  let total = 0;

  return (event: PointerEvent) => {
    const time = Number.isFinite(event.timeStamp) ? event.timeStamp : performance.now();

    if (event.type === "pointerdown") {
      active = true;
      started = false;
      total = 0;
      lastX = event.clientX;
      lastY = event.clientY;
      lastTime = time;
      return;
    }

    if (!active) return;

    if (event.type === "pointerup" || event.type === "pointercancel") {
      const delta = event.clientX - lastX;
      const dt = Math.max(1, time - lastTime);
      const velocity = delta / dt;
      const payload: PointerDragEvent = {
        delta,
        velocity,
        total,
        clientX: event.clientX,
        clientY: event.clientY,
      };

      active = false;
      if (started) params.onDragEnd?.(payload);
      return;
    }

    if (event.type === "pointermove") {
      const delta = event.clientX - lastX;
      total += delta;

      if (!started && Math.abs(total) >= threshold) {
        started = true;
        params.onDragStart?.();
      }

      if (!started) return;

      const dt = Math.max(1, time - lastTime);
      const velocity = delta / dt;
      const payload: PointerDragEvent = {
        delta,
        velocity,
        total,
        clientX: event.clientX,
        clientY: event.clientY,
      };

      params.onDragMove?.(payload);
      lastX = event.clientX;
      lastY = event.clientY;
      lastTime = time;
    }
  };
}
