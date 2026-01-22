import { normalizeOptions } from "@/components/headless/carousel/engine/options";
import type { Uncontrolled } from "@/components/headless/carousel/engine/types-public";

type UIndex = Uncontrolled<number>;
type UPlaying = Uncontrolled<boolean>;

describe("engine/options normalization", () => {
  const base = { slideCount: 5 } as const;

  test("throws if slideCount <= 0", () => {
    expect(() => normalizeOptions({ slideCount: 0 })).toThrow();
    expect(() => normalizeOptions({ slideCount: -1 })).toThrow();
  });

  test("applies defaults", () => {
    const n = normalizeOptions<UIndex, UPlaying>(base);
    expect(n.layout).toEqual({ axis: "x", readingDirection: "ltr", snapTo: "start" });
    expect(n.loop).toEqual({ enabled: true, buffer: "medium" });
    expect(n.interaction.draggable).toBe(true);
    expect(n.interaction.step).toBe(1);
    expect(n.interaction.commitThreshold).toEqual({ kind: "snap", value: 0.5 });
    expect(n.interaction.fling).toEqual({ enabled: true, strength: "normal" });
    expect(n.motion.transitionDurationMs).toBe(320);
    expect(n.motion.easing).toBe("ease-out");
    expect(n.motion.disabled).toBe(false);
    expect(n.measure.observeResize).toBe(true);
    expect(n.measure.remeasureOnNextFrame).toBe(true);
    expect(n.autoplay.enabled).toBe(false);
    expect(n.autoplay.mode).toBe("step");
    expect(n.autoplay.speedPxPerSec).toBe(600);
    expect(n.autoplay.resumeAfterInteraction).toBe(true);
    expect(n.autoplay.pauseWhenHidden).toBe(true);
    expect(n.accessibility.label).toBe("Carousel");
    expect(n.accessibility.live).toBe("polite");
    expect(n.accessibility.announceChanges).toBe(true);
    expect(n.debug).toBe(false);
  });
});
