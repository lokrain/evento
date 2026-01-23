export function observeViewport(el: HTMLElement | null, onResize: () => void) {
  if (!el) return () => {};

  if (typeof ResizeObserver === "undefined") {
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }

  const observer = new ResizeObserver(() => onResize());
  observer.observe(el);

  return () => observer.disconnect();
}
