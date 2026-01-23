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

const IDLE_MS_DEFAULT = 120;

/**
 * Subscribes to "scrollend" event on a viewport element, with fallback to idle-time scroll detection.
 * @param viewport The scrollable element to observe.
 * @param onScrollEnd Callback invoked when scrolling ends.
 * @param options Optional settings:
 *   - forceFallback: Always use idle-time fallback, even if "scrollend" is supported.
 *   - idleMs: Fallback idle timeout in milliseconds (default: 120).
 * @returns Unsubscribe function to remove listeners.
 */
export function subscribeScrollEnd(
  viewport: HTMLElement,
  onScrollEnd: () => void,
  options?: { readonly forceFallback?: boolean; readonly idleMs?: number },
): Unsubscribe {
  // Helper for feature detection
  function supportsScrollEndEvent(el: HTMLElement): boolean {
    return "onscrollend" in (el as HTMLElement & { onscrollend?: unknown });
  }

  const useNativeScrollEnd =
    !options?.forceFallback && supportsScrollEndEvent(viewport);

  if (useNativeScrollEnd) {
    const handler: EventListener = () => {
      onScrollEnd();
    };

    viewport.addEventListener("scrollend", handler, { passive: true });

    let unsubscribed = false;
    return () => {
      if (!unsubscribed) {
        viewport.removeEventListener("scrollend", handler);
        unsubscribed = true;
      }
    };
  }

  let timeoutId: number | null = null;
  const idleMs = options?.idleMs ?? IDLE_MS_DEFAULT;

  const handleScroll: EventListener = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }

    timeoutId = window.setTimeout(() => {
      timeoutId = null;
      onScrollEnd();
    }, idleMs);
  };

  viewport.addEventListener("scroll", handleScroll, { passive: true });

  let unsubscribed = false;
  return () => {
    if (!unsubscribed) {
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }
      viewport.removeEventListener("scroll", handleScroll);
      unsubscribed = true;
    }
  };
}