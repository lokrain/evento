## Headless Carousel Usage

Key accessibility options:

- `ariaLive`: explicit `aria-live` override for the root region. Autoplay defaults to `polite`.
- `ariaControlsId`: id of the controlled viewport/track. Nav buttons receive `aria-controls` automatically when provided.

Example:

```tsx
const VIEWPORT_ID = "carousel-viewport";

const carousel = useCarousel({
  slideCount: 5,
  ariaLive: "polite",
  ariaControlsId: VIEWPORT_ID,
});

<div {...carousel.getRootProps()}>
  <div {...carousel.getViewportProps({ id: VIEWPORT_ID })}>
    <div {...carousel.getTrackProps()}>
      {Array.from({ length: carousel.renderCount }).map((_, i) => (
        <div key={i} {...carousel.getSlideProps(i)} />
      ))}
    </div>
  </div>
  <button {...carousel.getPrevButtonProps()}>Prev</button>
  <button {...carousel.getNextButtonProps()}>Next</button>
</div>
```

Autoplay uses a re-arming `setTimeout` tied to `transitionend` to reduce drift under tab throttling.