import { useEffect } from "react";

// Listen for transitionend on track and invoke callback (e.g., to normalize offset/settle).
export function useTransition(trackRef: React.RefObject<HTMLElement>, onEnd: () => void) {
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    const handler = (event: TransitionEvent) => {
      if (event.target !== el) return;
      if (event.propertyName !== "transform") return;
      onEnd();
    };

    el.addEventListener("transitionend", handler);
    return () => {
      el.removeEventListener("transitionend", handler);
    };
  }, [trackRef, onEnd]);
}