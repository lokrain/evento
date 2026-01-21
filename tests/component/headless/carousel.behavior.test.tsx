// tests/component/headless/carousel.behavior.test.tsx
import { act, fireEvent, render, screen } from "@testing-library/react";
import * as React from "react";
import { useCarousel } from "@/components/headless/carousel";

type Rect = { left: number; top: number; width: number; height: number };
type PointerType = "mouse" | "touch" | "pen";

const mockRect = (element: Element, rect: Rect): void => {
  const { left, top, width, height } = rect;

  const value: DOMRect = {
    x: left,
    y: top,
    left,
    top,
    width,
    height,
    right: left + width,
    bottom: top + height,
    toJSON: () => value,
  } as DOMRect;

  Object.defineProperty(element, "getBoundingClientRect", {
    value: () => value,
  });
};

const setReducedMotion = (matches: boolean): void => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string): MediaQueryList => {
      const mql: MediaQueryList = {
        matches,
        media: query,
        onchange: null,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
        // deprecated
        addListener: jest.fn(),
        removeListener: jest.fn(),
      } as unknown as MediaQueryList;
      return mql;
    },
  });
};

const originalRequestAnimationFrame = globalThis.requestAnimationFrame;
const originalCancelAnimationFrame = globalThis.cancelAnimationFrame;

const ensurePointerEvent = (): void => {
  // Avoid “implements PointerEvent” typing issues across TS/lib.dom versions.
  // We only need runtime support for pointerId/pointerType/isPrimary.
  if ("PointerEvent" in globalThis) return;

  class MockPointerEvent extends MouseEvent {
    pointerId: number;
    pointerType: string;
    isPrimary: boolean;

    constructor(type: string, props: PointerEventInit) {
      super(type, props);
      this.pointerId = props.pointerId ?? 1;
      this.pointerType = props.pointerType ?? "mouse";
      this.isPrimary = props.isPrimary ?? true;
    }
  }

  (globalThis as unknown as { PointerEvent: unknown }).PointerEvent = MockPointerEvent;
};

type AutoplayOff = { enabled: false };
type AutoplayOn = { enabled: true; delayMs: number; pauseOnHover?: boolean; resumeAfterInteraction?: boolean };
type AutoplayConfig = AutoplayOn | AutoplayOff;

type DragPointerArgs = {
  fromX: number;
  toX: number;
  pointerId?: number;
  pointerType?: PointerType;
  y?: number;
};

const pointerDownInit = (args: Required<Pick<DragPointerArgs, "fromX" | "pointerId" | "pointerType" | "y">>): PointerEventInit =>
  ({
    pointerId: args.pointerId,
    pointerType: args.pointerType,
    isPrimary: true,
    clientX: args.fromX,
    clientY: args.y,
    button: 0,
    buttons: 1,
  }) satisfies PointerEventInit;

const pointerMoveInit = (args: Required<Pick<DragPointerArgs, "toX" | "pointerId" | "pointerType" | "y">>): PointerEventInit =>
  ({
    pointerId: args.pointerId,
    pointerType: args.pointerType,
    isPrimary: true,
    clientX: args.toX,
    clientY: args.y,
    buttons: 1,
  }) satisfies PointerEventInit;

const pointerUpInit = (args: Required<Pick<DragPointerArgs, "toX" | "pointerId" | "pointerType" | "y">>): PointerEventInit =>
  ({
    pointerId: args.pointerId,
    pointerType: args.pointerType,
    isPrimary: true,
    clientX: args.toX,
    clientY: args.y,
    button: 0,
  }) satisfies PointerEventInit;

/**
 * Your hook uses React state for isDragging + virtualOffsetPx.
 * To make finishDrag() see the updated offset, we must allow a commit boundary
 * between MOVE and UP. In practice, that means async act() gaps.
 */
const dragPointer = async (el: Element, args: DragPointerArgs): Promise<void> => {
  const pointerId = args.pointerId ?? 1;
  const pointerType = args.pointerType ?? "mouse";
  const y = args.y ?? 0;

  act(() => {
    fireEvent.pointerDown(el, pointerDownInit({ fromX: args.fromX, pointerId, pointerType, y }));
  });
  await act(async () => { });

  act(() => {
    fireEvent.pointerMove(el, pointerMoveInit({ toX: args.toX, pointerId, pointerType, y }));
  });
  await act(async () => { });

  act(() => {
    fireEvent.pointerUp(el, pointerUpInit({ toX: args.toX, pointerId, pointerType, y }));
  });
  await act(async () => { });
};

describe("headless carousel behavior", () => {
  beforeAll(() => {
    ensurePointerEvent();
    setReducedMotion(false);

    globalThis.requestAnimationFrame = (cb: FrameRequestCallback) =>
      setTimeout(() => cb(performance.now()), 0) as unknown as number;
    globalThis.cancelAnimationFrame = (id: number) => clearTimeout(id);

    Object.defineProperty(HTMLElement.prototype, "setPointerCapture", { value: jest.fn() });
    Object.defineProperty(HTMLElement.prototype, "releasePointerCapture", { value: jest.fn() });
  });

  afterAll(() => {
    globalThis.requestAnimationFrame = originalRequestAnimationFrame;
    globalThis.cancelAnimationFrame = originalCancelAnimationFrame;
  });

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  const TestCarousel = ({ autoplay, onIndexChange }: { autoplay?: AutoplayConfig; onIndexChange?: (n: number) => void }) => {
    const {
      renderCount,
      getRootProps,
      getViewportProps,
      getTrackProps,
      getSlideProps,
      getPrevButtonProps,
      getNextButtonProps,
    } = useCarousel({
      slideCount: 3,
      copies: 3,
      snap: { threshold: 1 },
      autoplay: autoplay ?? { enabled: false },
      measurement: { observeResize: false, remeasureOnNextFrame: false },
      onIndexChange,
    });

    React.useLayoutEffect(() => {
      const viewport = document.querySelector("[data-testid='viewport']") as HTMLDivElement | null;
      const track = document.querySelector("[data-testid='track']") as HTMLDivElement | null;
      if (!viewport || !track) return;

      const slideWidth = 100;
      const slideHeight = 100;

      mockRect(viewport, { left: 0, top: 0, width: 300, height: 100 });
      mockRect(track, {
        left: 0,
        top: 0,
        width: renderCount * slideWidth,
        height: slideHeight,
      });

      const slides = Array.from(document.querySelectorAll("[data-testid^='slide-']"));
      slides.forEach((node, index) => {
        mockRect(node, {
          left: index * slideWidth,
          top: 0,
          width: slideWidth,
          height: slideHeight,
        });
      });
    }, [renderCount]);

    return (
      <div {...getRootProps()} data-testid="root">
        <div {...getViewportProps()} data-testid="viewport">
          <div {...getTrackProps()} data-testid="track">
            {Array.from({ length: renderCount }).map((_, renderIndex) => (
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: render indices are stable here.
                key={renderIndex}
                {...getSlideProps(renderIndex)}
                data-testid={`slide-${renderIndex}`}
              >
                Slide {renderIndex}
              </div>
            ))}
          </div>
        </div>

        <button {...getPrevButtonProps()} data-testid="prev">
          Prev
        </button>
        <button {...getNextButtonProps()} data-testid="next">
          Next
        </button>
      </div>
    );
  };

  const getSelectedIndices = (): number[] =>
    screen
      .getAllByTestId(/slide-/)
      .filter((node) => node.getAttribute("data-selected") === "")
      .map((node) => Number(node.getAttribute("data-index")));

  const getSelectedIndex = (): number => {
    const indices = Array.from(new Set(getSelectedIndices()));
    return indices[0] ?? 0;
  };

  const flushTimers = (): void => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
  };

  const flushUntilModelReady = (): void => {
    // rebuildModel is scheduled with rAF; commit state between timer flushes.
    flushTimers();
    act(() => { });
    flushTimers();
    act(() => { });
  };

  test("onIndexChange dedupes notifications", () => {
    const onIndexChange = jest.fn();

    render(<TestCarousel autoplay={{ enabled: false }} onIndexChange={onIndexChange} />);
    flushUntilModelReady();

    // Initial notify for index 0 happens once.
    expect(onIndexChange).toHaveBeenCalledTimes(1);
    expect(onIndexChange).toHaveBeenLastCalledWith(0);

    fireEvent.click(screen.getByTestId("next"));
    expect(onIndexChange).toHaveBeenCalledTimes(2);
    expect(onIndexChange).toHaveBeenLastCalledWith(1);

    fireEvent.click(screen.getByTestId("next"));
    expect(onIndexChange).toHaveBeenCalledTimes(3);
    expect(onIndexChange).toHaveBeenLastCalledWith(2);
  });

  test("ArrowRight advances to next slide", () => {
    render(<TestCarousel />);
    flushUntilModelReady();

    expect(getSelectedIndex()).toBe(0);

    const root = screen.getByTestId("root");
    act(() => {
      root.focus();
      fireEvent.keyDown(root, { key: "ArrowRight" });
    });

    expect(getSelectedIndex()).toBe(1);
  });

  test("next/prev buttons update selected slide", () => {
    render(<TestCarousel />);
    flushUntilModelReady();

    fireEvent.click(screen.getByTestId("next"));
    expect(getSelectedIndex()).toBe(1);

    fireEvent.click(screen.getByTestId("prev"));
    expect(getSelectedIndex()).toBe(0);
  });

  test("autoplay advances and sets aria-live (deterministic)", () => {
    let timeoutCb: (() => void) | null = null;

    jest.spyOn(window, "setTimeout").mockImplementation(((cb: TimerHandler) => {
      const fn: () => void = typeof cb === "function" ? (cb as () => void) : () => { };
      timeoutCb = fn;
      return 1 as unknown as number;
    }) as typeof window.setTimeout);

    jest.spyOn(window, "clearTimeout").mockImplementation(() => { });

    render(<TestCarousel autoplay={{ enabled: true, delayMs: 1000 }} />);
    flushUntilModelReady();

    const root = screen.getByTestId("root");
    expect(root).toHaveAttribute("aria-live", "polite");

    expect(getSelectedIndex()).toBe(0);
    expect(timeoutCb).not.toBeNull();

    act(() => {
      timeoutCb?.();
    });

    expect(getSelectedIndex()).toBe(1);
  });

  test("ArrowLeft, Home, and End update the index", () => {
    render(<TestCarousel />);
    flushUntilModelReady();

    const root = screen.getByTestId("root");
    act(() => {
      root.focus();
      fireEvent.keyDown(root, { key: "End" });
    });
    expect(getSelectedIndex()).toBe(2);

    act(() => {
      fireEvent.keyDown(root, { key: "Home" });
    });
    expect(getSelectedIndex()).toBe(0);

    act(() => {
      fireEvent.keyDown(root, { key: "ArrowLeft" });
    });
    expect(getSelectedIndex()).toBe(2);
  });

  test("autoplay pauses on hover and resumes on leave (deterministic)", () => {
    const callbacks: Array<() => void> = [];

    jest.spyOn(window, "setTimeout").mockImplementation(((cb: TimerHandler) => {
      const fn: () => void = typeof cb === "function" ? (cb as () => void) : () => { };
      callbacks.push(fn);
      return callbacks.length as unknown as number;
    }) as typeof window.setTimeout);

    const clearSpy = jest.spyOn(window, "clearTimeout").mockImplementation(() => { });

    render(<TestCarousel autoplay={{ enabled: true, delayMs: 1000, pauseOnHover: true }} />);
    flushUntilModelReady();

    const root = screen.getByTestId("root");
    expect(getSelectedIndex()).toBe(0);
    expect(callbacks.length).toBeGreaterThanOrEqual(1);

    fireEvent.mouseEnter(root);
    expect(clearSpy).toHaveBeenCalled();

    // We do NOT invoke the callback while paused; a cleared timeout must not fire.
    expect(getSelectedIndex()).toBe(0);

    fireEvent.mouseLeave(root);
    expect(callbacks.length).toBeGreaterThanOrEqual(2);

    act(() => {
      callbacks[callbacks.length - 1]?.();
    });

    expect(getSelectedIndex()).toBe(1);
  });

  test("autoplay re-arms via transitionend using setTimeout", () => {
    const timeouts: Array<() => void> = [];

    jest.spyOn(window, "setTimeout").mockImplementation(((cb: TimerHandler) => {
      const fn: () => void = typeof cb === "function" ? (cb as () => void) : () => { };
      timeouts.push(fn);
      return timeouts.length as unknown as number;
    }) as typeof window.setTimeout);

    jest.spyOn(window, "clearTimeout").mockImplementation(() => { });

    render(<TestCarousel autoplay={{ enabled: true, delayMs: 500 }} />);
    flushUntilModelReady();

    expect(timeouts.length).toBeGreaterThanOrEqual(1);

    const track = screen.getByTestId("track");
    act(() => {
      track.dispatchEvent(new Event("transitionend"));
    });

    expect(timeouts.length).toBeGreaterThanOrEqual(2);
  });

  test("reduced motion disables autoplay and transitions", () => {
    setReducedMotion(true);
    render(<TestCarousel autoplay={{ enabled: true, delayMs: 1000 }} />);
    flushUntilModelReady();

    const track = screen.getByTestId("track");
    fireEvent.click(screen.getByTestId("next"));

    expect(track.style.transition).toBe("none");
    expect(getSelectedIndex()).toBe(1);

    setReducedMotion(false);
  });

  test("dragging advances one slide", async () => {
    render(<TestCarousel />);
    flushUntilModelReady();

    expect(getSelectedIndex()).toBe(0);

    const track = screen.getByTestId("track");
    expect(track.style.transform).not.toBe("");

    await dragPointer(track, { fromX: 200, toX: -200 });

    flushTimers();
    expect(getSelectedIndex()).toBe(1);
  });

  test("dragging sets and releases pointer capture", async () => {
    const spc = HTMLElement.prototype.setPointerCapture as unknown as jest.Mock;
    const rpc = HTMLElement.prototype.releasePointerCapture as unknown as jest.Mock;

    render(<TestCarousel />);
    flushUntilModelReady();

    const track = screen.getByTestId("track");
    await dragPointer(track, { fromX: 200, toX: -200 });

    expect(spc).toHaveBeenCalled();
    expect(rpc).toHaveBeenCalled();
  });
});
