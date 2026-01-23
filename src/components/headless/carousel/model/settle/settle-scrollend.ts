/**
 * scrollend wiring helper.
 *
 * This is a thin subscription utility:
 * - It does not own settle state
 * - It does not decide anything
 * - It only delivers "scroll ended" signal when the event exists
 *
 * Note: 'scrollend' is not supported in all browsers, so callers must
 * still rely on RAF sampling as the portable fallback.
 */

export type Unsubscribe = () => void;

export function subscribeScrollEnd(viewport: HTMLElement, onScrollEnd: () => void): Unsubscribe {
  // Feature-detect: some environments may not recognize the event at all.
  // We still attach using string type; if unsupported, it simply never fires.
  const handler = () => {
    onScrollEnd();
  };

  viewport.addEventListener("scrollend", handler as EventListener, { passive: true });

  return () => {
    viewport.removeEventListener("scrollend", handler as EventListener);
  };
}
