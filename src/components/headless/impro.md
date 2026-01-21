# Headless Carousel Improvement Notes

## Type safety / API ergonomics
- **Broaden `mergeProps` input types**: the current `mergeProps` signature forces repeated `as Record<string, unknown>` casts in every prop getter. Update `mergeProps` to accept `T extends object` (or `HeadlessProps<any>`) and return an intersection type so consumers don’t need `unknown` casts.
  - ✅ Removes TS error: “Conversion of type `Record<string, unknown>`...”
  - ✅ Centralizes merging logic instead of sprinkling casts.
- **Introduce a `mergeHeadlessProps` helper**: wrap `mergeProps` once and reuse for all prop getters to keep them consistently typed.

## Runtime correctness
- **Release pointer capture on end/cancel**: call `e.currentTarget.releasePointerCapture(e.pointerId)` in `onPointerUp`/`onPointerCancel` to avoid dangling capture on some browsers.
- **Avoid double `onIndexChange` calls**: emit from a single, deduped notifier keyed on the real index (e.g., effect on `index`), not from multiple sites.

## Rendering & performance (Vercel best-practices)
- **Use `useLayoutEffect` for initial measurements**: `rebuildModel` and `applyTransform` can be executed in layout phase to reduce flicker on mount (see `rendering-hydration-no-flicker`).
- **Batch style writes in `applyTransform`**: set `track.style.cssText` or use a CSS class toggle to reduce multiple style writes (see `js-batch-dom-css`).
- **Prefer `setTimeout` over `setInterval` for autoplay**: prevents drift and is friendlier to tab throttling. Schedule the next tick after each transition completes.

## Accessibility
- **Expose `aria-live` option**: allow consumers to opt into `aria-live="polite"` on the root for autoplay carousels to help SR users.
- **Add `aria-controls` for buttons**: if the track/viewport has an `id`, include `aria-controls` on prev/next to connect controls to region.

### Usage snippet (ariaControlsId)

```tsx
const VIEWPORT_ID = "carousel-viewport";

const carousel = useCarousel({
  slideCount: 5,
  ariaControlsId: VIEWPORT_ID,
  ariaLive: "polite",
});

<div {...carousel.getViewportProps({ id: VIEWPORT_ID })} />
<button {...carousel.getPrevButtonProps()}>Prev</button>
<button {...carousel.getNextButtonProps()}>Next</button>
```
