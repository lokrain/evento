import { useLayoutEffect, useRef } from "react";

// Single-writer hook to apply transform/transition to the track element.
// Consumers call setTransform / setTransition; we batch via refs and flush in layout effect.
export function useTrackTransform() {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const nextTransform = useRef<string | null>(null);
  const nextTransition = useRef<string | null>(null);

  useLayoutEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    if (nextTransform.current !== null) {
      el.style.transform = nextTransform.current;
      nextTransform.current = null;
    }
    if (nextTransition.current !== null) {
      el.style.transition = nextTransition.current;
      nextTransition.current = null;
    }
  });

  return {
    trackRef,
    setTransform: (value: string) => {
      nextTransform.current = value;
    },
    setTransition: (value: string) => {
      nextTransition.current = value;
    },
    clearTransition: () => {
      nextTransition.current = "";
    },
  };
}