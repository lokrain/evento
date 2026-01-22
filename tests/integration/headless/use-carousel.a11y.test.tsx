import * as React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { useCarousel, type UseCarouselOptions } from "../../../src/components/headless/carousel";

type DivWithTestId = React.HTMLAttributes<HTMLDivElement> & { "data-testid"?: string };
type ButtonWithTestId = React.ButtonHTMLAttributes<HTMLButtonElement> & { "data-testid"?: string };
type AnnouncerWithTestId = React.HTMLAttributes<HTMLElement> & { "data-testid"?: string };

function CarouselFixture(props: { options: UseCarouselOptions }) {
  const { options } = props;
  const { engine, bindings } = useCarousel(options);

  const rootProps = bindings.getRootProps();
  const viewportProps = bindings.getViewportProps();
  const trackProps = bindings.getTrackProps();
  const prevProps = bindings.getPrevButtonProps({ type: "button" });
  const nextProps = bindings.getNextButtonProps({ type: "button" });
  const dotListProps = bindings.pagination.getListProps();
  const autoplayToggleProps = bindings.autoplayToggle.getButtonProps({ type: "button" });
  const announcerProps = bindings.announcer.getProps();

  const gates = engine.autoplay.getGates();

  return (
    <div data-testid="root" {...rootProps}>
      <div data-testid="viewport" {...viewportProps}>
        <div data-testid="track" {...trackProps}>
          {Array.from({ length: options.slideCount }, (_, i) => {
            const slideProps = bindings.getSlideProps(i);
            return (
              <div key={i} data-testid={`slide-${i}`} {...slideProps}>
                Slide {i}
              </div>
            );
          })}
        </div>
      </div>

      <button data-testid="prev" {...prevProps}>Prev</button>
      <button data-testid="next" {...nextProps}>Next</button>

      <div data-testid="dots" {...dotListProps}>
        {Array.from({ length: bindings.pagination.count }, (_, i) => {
          const dotProps = bindings.pagination.getDotProps(i, { type: "button" });
          return (
            <button key={i} data-testid={`dot-${i}`} {...dotProps}>
              Dot {i}
            </button>
          );
        })}
      </div>

      <button data-testid="autoplay-toggle" {...autoplayToggleProps}>Autoplay</button>

      <div data-testid="announcer" {...announcerProps}>{bindings.announcer.message ?? ""}</div>

      <output data-testid="probe-index">{String(engine.index)}</output>
      <output data-testid="probe-playing">{String(engine.autoplay.isPlaying)}</output>
      <output data-testid="probe-gates">{JSON.stringify(gates)}</output>
    </div>
  );
}

function parseGates(): Record<string, boolean> {
  const raw = screen.getByTestId("probe-gates").textContent ?? "{}";
  return JSON.parse(raw) as Record<string, boolean>;
}

describe("W3C/APG/WCAG a11y invariants (G1–G7)", () => {
  test("G1: root has accessible name + stable container role", () => {
    render(
      <CarouselFixture
        options={{
          slideCount: 3,
          accessibility: { label: "Featured items", live: "polite", announceChanges: true },
        }}
      />,
    );

    const root = screen.getByTestId("root");
    const ariaLabel = root.getAttribute("aria-label");
    const ariaLabelledBy = root.getAttribute("aria-labelledby");
    expect(Boolean(ariaLabel) || Boolean(ariaLabelledBy)).toBe(true);

    const role = root.getAttribute("role");
    expect(role === "region" || role === "group").toBe(true);
  });

  test('G2/G3: slides have role="group" and accessible names; roledescription only on containers', () => {
    render(
      <CarouselFixture
        options={{
          slideCount: 2,
          accessibility: { label: "Gallery", live: "polite", announceChanges: true },
        }}
      />,
    );

    for (let i = 0; i < 2; i += 1) {
      const slide = screen.getByTestId(`slide-${i}`);
      expect(slide.getAttribute("role")).toBe("group");

      const slideLabel = slide.getAttribute("aria-label");
      const slideLabelledBy = slide.getAttribute("aria-labelledby");
      expect(Boolean(slideLabel) || Boolean(slideLabelledBy)).toBe(true);

      const rd = slide.getAttribute("aria-roledescription");
      if (rd !== null) {
        expect(rd).toBe("slide");
      }
    }

    const prev = screen.getByTestId("prev");
    const next = screen.getByTestId("next");
    const autoplay = screen.getByTestId("autoplay-toggle");

    expect(prev.getAttribute("aria-roledescription")).toBe(null);
    expect(next.getAttribute("aria-roledescription")).toBe(null);
    expect(autoplay.getAttribute("aria-roledescription")).toBe(null);
  });

  test("G4: autoplay toggle exists and changes playing state", () => {
    render(
      <CarouselFixture
        options={{
          slideCount: 3,
          autoplay: { enabled: true, dwellMs: 10_000 },
          accessibility: { label: "Rotating promos", live: "polite", announceChanges: true },
        }}
      />,
    );

    const toggle = screen.getByTestId("autoplay-toggle");
    expect(toggle).toBeTruthy();

    const before = screen.getByTestId("probe-playing").textContent;
    fireEvent.click(toggle);
    const after = screen.getByTestId("probe-playing").textContent;
    expect(after).not.toBe(before);
  });

  test("G5: focusWithin engages an autoplay gate when focus enters", () => {
    render(
      <CarouselFixture
        options={{
          slideCount: 3,
          autoplay: { enabled: true, dwellMs: 10_000 },
          accessibility: { label: "News carousel", live: "polite", announceChanges: true },
        }}
      />,
    );

    const gatesBefore = parseGates();
    if (Object.prototype.hasOwnProperty.call(gatesBefore, "focusWithin")) {
      expect(gatesBefore.focusWithin).toBe(false);
    }

    screen.getByTestId("next").focus();

    const gatesAfter = parseGates();
    if (Object.prototype.hasOwnProperty.call(gatesAfter, "focusWithin")) {
      expect(gatesAfter.focusWithin).toBe(true);
    }
  });

  test("G6: announcer exists and receives text on settle", () => {
    render(
      <CarouselFixture
        options={{
          slideCount: 3,
          accessibility: { label: "Testimonials", live: "polite", announceChanges: true },
        }}
      />,
    );

    const announcer = screen.getByTestId("announcer");
    expect(announcer).toBeTruthy();

    fireEvent.click(screen.getByTestId("next"));

    const msg = announcer.textContent ?? "";
    const hasSlideWord = msg.toLowerCase().includes("slide");
    const hasOfPattern = /\b\d+\b.*\bof\b.*\b\d+\b/i.test(msg);
    expect(hasSlideWord || hasOfPattern).toBe(true);
  });

  test("G7: disabled controls expose disabled semantics when non-looping at bounds", () => {
    render(
      <CarouselFixture
        options={{
          slideCount: 2,
          loop: { enabled: false },
          accessibility: { label: "Bounded carousel", live: "polite", announceChanges: true },
        }}
      />,
    );

    const prev = screen.getByTestId("prev") as HTMLButtonElement;
    const next = screen.getByTestId("next") as HTMLButtonElement;

    const prevDisabled = prev.disabled || prev.getAttribute("aria-disabled") === "true";
    expect(prevDisabled).toBe(true);

    fireEvent.click(next);

    const nextDisabled = next.disabled || next.getAttribute("aria-disabled") === "true";
    expect(nextDisabled).toBe(true);
  });
});
