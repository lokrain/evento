import * as React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { DataAttributes } from "./core/types";
import { useCarousel } from "./use-carousel";

let scrollOffset = 0;

jest.mock("./dom/io/scroll-to", () => ({
  scrollToPx: jest.fn(({ viewport, axis, px }) => {
    const value = px as unknown as number;
    if (axis === "x") {
      viewport.scrollLeft = value;
    } else {
      viewport.scrollTop = value;
    }
    scrollOffset = value;
  }),
}));

// Track how many times sampleSettle is called for each token
const settleFrameCounts = new Map<number, number>();

jest.mock("./model/settle/settle-raf", () => ({
  createRafSettleSampler: ({ onFrame, shouldContinue }: { onFrame: () => void; shouldContinue: () => boolean }) => {
    let running = false;
    return {
      start: () => {
        running = true;
        // Simulate up to 10 frames
        let frames = 0;
        while (shouldContinue() && running && frames < 20) {
          onFrame();
          frames++;
        }
      },
      stop: () => {
        running = false;
      },
      isRunning: () => running,
    };
  },
}));

jest.mock("./model/settle/settle-machine", () => {
  const actual = jest.requireActual("./model/settle/settle-machine");
  return {
    ...actual,
    sampleSettle: (state: any) => {
      // Simulate settle after 3 frames
      if (state.pendingToken == null) return state;
      const count = settleFrameCounts.get(state.pendingToken) ?? 0;
      if (count >= 2) {
        return { ...state, settledToken: state.pendingToken };
      }
      settleFrameCounts.set(state.pendingToken, count + 1);
      return { ...state, settledToken: null };
    },
  };
});

function CarouselHarness(params: { loop: boolean; initialIndex?: number }) {
  const { engine, bindings } = useCarousel({
    slideCount: 3,
    layout: {
      axis: "x",
      readingDirection: "ltr",
      snapTo: "center",
    },
    loop: { enabled: params.loop },
    index: {
      mode: "uncontrolled",
      defaultValue: params.initialIndex,
    },
    accessibility: { label: "Carousel" },
  });

  const rootProps = bindings.getRootProps({ "data-testid": "root" } as DataAttributes);
  const prevProps = bindings.getPrevButtonProps({ "data-testid": "prev" } as DataAttributes);
  const nextProps = bindings.getNextButtonProps({ "data-testid": "next" } as DataAttributes);
  const viewportProps = bindings.getViewportProps({
    "data-testid": "viewport",
  } as DataAttributes);
  const trackProps = bindings.getTrackProps({ "data-testid": "track" } as DataAttributes);

  return (
    <div {...rootProps}>
      <button {...prevProps}>
        Prev
      </button>
      <button {...nextProps}>
        Next
      </button>
      <div {...viewportProps}>
        <div {...trackProps}>
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              {...bindings.getSlideProps(index, {
                "data-testid": `slide-${index}`,
              } as DataAttributes)}
            />
          ))}
        </div>
      </div>
      <span data-testid="index">{engine.index}</span>
    </div>
  );
}

function applyGeometry() {
  const viewport = screen.getByTestId("viewport") as HTMLElement;
  viewport.getBoundingClientRect = () => ({
    left: 0,
    top: 0,
    width: 100,
    height: 100,
    right: 100,
    bottom: 100,
    x: 0,
    y: 0,
    toJSON: () => "viewport",
  });

  for (const index of [0, 1, 2]) {
    const slide = screen.getByTestId(`slide-${index}`) as HTMLElement;
    slide.getBoundingClientRect = () => {
      const left = index * 100 - scrollOffset;
      return {
        left,
        top: 0,
        width: 100,
        height: 100,
        right: left + 100,
        bottom: 100,
        x: left,
        y: 0,
        toJSON: () => `slide-${index}`,
      };
    };
  }
}

describe("useCarousel navigation", () => {
  beforeEach(() => {
    scrollOffset = 0;
    settleFrameCounts.clear();
  });

  it("advances on keyboard navigation", async () => {
    render(<CarouselHarness loop={false} />);

    await waitFor(() => expect(screen.getByTestId("slide-0")).toBeInTheDocument(), { timeout: 1000 });
    applyGeometry();

    const root = screen.getByTestId("root");
    fireEvent.keyDown(root, { key: "ArrowRight" });

    await waitFor(() => expect(screen.getByTestId("index").textContent).toBe("1"), { timeout: 1000 });
  });

  it("wraps when looping", async () => {
    render(<CarouselHarness loop initialIndex={2} />);

    await waitFor(() => expect(screen.getByTestId("slide-0")).toBeInTheDocument(), { timeout: 1000 });
    applyGeometry();

    fireEvent.click(screen.getByTestId("next"));
    await waitFor(() => expect(screen.getByTestId("index").textContent).toBe("0"), { timeout: 1000 });
  });
});