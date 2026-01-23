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

export function subscribeScrollEnd(
  viewport: HTMLElement,
  onScrollEnd: () => void,
  options?: { readonly forceFallback?: boolean },
): Unsubscribe {
  // Feature-detect: some environments may not recognize the event at all.
  // We still attach using string type; if unsupported, fall back to idle-time scroll.
  const supportsScrollEnd =
    !options?.forceFallback &&
    "onscrollend" in (viewport as HTMLElement & { onscrollend?: unknown });

  if (supportsScrollEnd) {
    const handler = () => {
      onScrollEnd();
    };

    viewport.addEventListener("scrollend", handler as EventListener, { passive: true });

    return () => {
      viewport.removeEventListener("scrollend", handler as EventListener);
    };
  }

  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  const idleMs = 120;

  const handleScroll = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      timeoutId = null;
      onScrollEnd();
    }, idleMs);
  };

  viewport.addEventListener("scroll", handleScroll, { passive: true });

  return () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    viewport.removeEventListener("scroll", handleScroll);
  };
}
