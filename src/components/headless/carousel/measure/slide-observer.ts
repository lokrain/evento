const slideSelector = "[data-carousel-slide-index]";

export function observeSlides(root: HTMLElement | null, onResize: () => void) {
  if (!root) return () => {};

  if (typeof ResizeObserver === "undefined") {
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }

  const observer = new ResizeObserver(() => onResize());
  const slides = root.querySelectorAll<HTMLElement>(slideSelector);
  for (const slide of slides) {
    observer.observe(slide);
  }

  return () => observer.disconnect();
}
