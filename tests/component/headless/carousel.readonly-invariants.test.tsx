import * as React from "react";
import { useCarousel } from "@/components/headless/carousel";
import type { Controlled, Uncontrolled } from "@/components/headless/carousel";

import { renderIntoDocument } from "../../_helpers/dom";
import { dispatchPointer } from "../../_helpers/pointers";
import { dispatchKey } from "../../_helpers/keys";
import { flushTimers } from "../../_helpers/timers";

type ROIndex = {
  mode: "controlled";
  value: number;
  readonly: true;
  onChange?: never;
};

type UPlaying = Uncontrolled<boolean>;
type UIndex = Uncontrolled<number>;

function ReadonlyCarouselHarness(props: {
  slideCount: number;
  index: ROIndex;
  onIndexChange?: (next: number) => void;
  onSettle?: (next: number) => void;
  autoplay?: {
    enabled?: boolean;
    playing?: UPlaying;
    dwellMs?: number;
    startDelayMs?: number;
  };
  interaction?: {
    draggable?: boolean;
  };
}) {
  const { engine, bindings } = useCarousel<ROIndex, UPlaying>({
    slideCount: props.slideCount,
    index: props.index,
    onIndexChange: props.onIndexChange,
    onSettle: props.onSettle,
    autoplay: props.autoplay,
    interaction: props.interaction,
  });

  // Minimal DOM wiring through bindings. No styling needed.
  return (
    <div {...bindings.getRootProps()} data-testid="root">
      <div {...bindings.getViewportProps()} data-testid="viewport">
        <div {...bindings.getTrackProps()} data-testid="track">
          {Array.from({ length: bindings.pagination.count }, (_, i) => (
            <div key={i} {...bindings.getSlideProps(i)} data-testid={`slide-${i}`} />
          ))}
        </div>
      </div>

      <button {...bindings.getPrevButtonProps()} data-testid="prev">
        Prev
      </button>
      <button {...bindings.getNextButtonProps()} data-testid="next">
        Next
      </button>

      <div {...bindings.pagination.getListProps()} data-testid="dots">
        {Array.from({ length: bindings.pagination.count }, (_, i) => (
          <button key={i} {...bindings.pagination.getDotProps(i)} data-testid={`dot-${i}`}>
            {i}
          </button>
        ))}
      </div>

      <div {...bindings.announcer.getProps()} data-testid="announcer" />
    </div>
  );
}
