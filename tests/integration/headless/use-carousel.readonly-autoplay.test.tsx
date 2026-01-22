import * as React from "react";
import { useCarousel } from "@/components/headless/carousel";
import type { Controlled, Uncontrolled } from "@/components/headless/carousel";

import { renderIntoDocument } from "../../_helpers/dom";

type ROIndex = Controlled<number> & { readonly: true };
type RWPlaying = Controlled<boolean>;
type UPlaying = Uncontrolled<boolean>;

describe("use-carousel integration (readonly index + autoplay capabilities)", () => {
  test("readonly index + readonly autoplay exposes no play controls at runtime", () => {
    const readonlyIndex: ROIndex = { mode: "controlled", value: 1, readonly: true };
    const readonlyPlaying: Controlled<boolean> & { readonly: true } = {
      mode: "controlled",
      value: false,
      readonly: true,
    };

    let captured: ReturnType<typeof useCarousel<ROIndex, Controlled<boolean>>> | null = null;

    function Harness() {
      const ret = useCarousel<ROIndex, Controlled<boolean>>({
        slideCount: 3,
        index: readonlyIndex,
        autoplay: { enabled: true, playing: readonlyPlaying },
      });
      React.useEffect(() => {
        captured = ret;
      }, [ret]);

      const { bindings } = ret;
      return (
        <div {...bindings.getRootProps()}>
          <div {...bindings.getViewportProps()}>
            <div {...bindings.getTrackProps()}>
              {Array.from({ length: bindings.pagination.count }, (_, i) => (
                <div key={i} {...bindings.getSlideProps(i)} />
              ))}
            </div>
          </div>
        </div>
      );
    }

    const { unmount } = renderIntoDocument(<Harness />);

    expect(captured).not.toBeNull();
    expect(captured!.engine.index).toBe(1);
    // Capability-stripped at runtime => play/pause/toggle are undefined (never)
    expect(captured!.engine.autoplay.play).toBeUndefined();
    expect(captured!.engine.autoplay.pause).toBeUndefined();
    expect(captured!.engine.autoplay.toggle).toBeUndefined();

    // Gates still accessible
    expect(captured!.engine.autoplay.getGates()).toBeDefined();

    unmount();
  });

  test("writable/uncontrolled autoplay exposes play controls at runtime", () => {
    const readonlyIndex: ROIndex = { mode: "controlled", value: 0, readonly: true };
    const playing: UPlaying = { mode: "uncontrolled", defaultValue: false };

    let captured: ReturnType<typeof useCarousel<ROIndex, UPlaying>> | null = null;

    function Harness() {
      const ret = useCarousel<ROIndex, UPlaying>({
        slideCount: 2,
        index: readonlyIndex,
        autoplay: { enabled: true, playing },
      });
      React.useEffect(() => {
        captured = ret;
      }, [ret]);

      const { bindings } = ret;
      return (
        <div {...bindings.getRootProps()}>
          <div {...bindings.getViewportProps()}>
            <div {...bindings.getTrackProps()}>
              {Array.from({ length: bindings.pagination.count }, (_, i) => (
                <div key={i} {...bindings.getSlideProps(i)} />
              ))}
            </div>
          </div>
        </div>
      );
    }

    const { unmount } = renderIntoDocument(<Harness />);

    expect(captured).not.toBeNull();
    expect(typeof captured!.engine.autoplay.play).toBe("function");
    expect(typeof captured!.engine.autoplay.pause).toBe("function");
    expect(typeof captured!.engine.autoplay.toggle).toBe("function");

    unmount();
  });
});
