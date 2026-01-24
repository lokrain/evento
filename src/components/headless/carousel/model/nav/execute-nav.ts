import { buildMotionStart } from "../../actions/builders/build-motion";
import type { CarouselAction } from "../../actions/action-types";
import type { Axis, Px } from "../../core/types";
import { clampIndexNumber, computeScrollTargetPxFromDom } from "../../dom/geometry";
import { startSettleTracking, type SettleMachineState } from "../settle/settle-machine";
import type { CarouselPlatform } from "../../carousel-platform";

export interface ExecuteNavInput {
  readonly kind: "next" | "prev" | "goto";
  readonly index?: number;
  readonly source: "api" | "keyboard" | "button" | "autoplay";
}

export interface ExecuteNavDeps {
  readonly platform: CarouselPlatform;

  readonly dispatch: (action: CarouselAction) => void;

  readonly viewport: HTMLElement | null;
  readonly slides: Map<number, HTMLElement | null>;

  readonly axis: Axis;
  readonly align: "start" | "center" | "end";

  readonly loop: boolean;
  readonly slideCount: number;

  readonly currentIndex: number;

  readonly reducedMotion: boolean;
  readonly smoothScrollEnabled: boolean;

  readonly latestScrollPx: Px;

  readonly settle: SettleMachineState;
  readonly settleToken: number;
  readonly setSettle: (next: SettleMachineState) => void;
  readonly setSettleToken: (next: number) => void;

  readonly startRafSampler: () => void;
}

/**
 * Execute navigation:
 * - computes target index
 * - computes target scroll px (DOM boundary)
 * - arms settle machine
 * - performs scroll via platform
 * - starts RAF settle sampling
 *
 * Contract:
 * - No React usage.
 * - No hidden state. All state transitions flow through deps setters.
 */
export function executeNav(input: ExecuteNavInput, deps: ExecuteNavDeps): void {
  const viewport = deps.viewport;
  if (!viewport) return;

  const count = deps.slideCount;
  if (count <= 0) return;

  const current = Math.trunc(deps.currentIndex);
  const targetIdx =
    input.kind === "goto"
      ? clampIndexNumber(input.index ?? 0, count, deps.loop)
      : input.kind === "next"
        ? clampIndexNumber(current + 1, count, deps.loop)
        : clampIndexNumber(current - 1, count, deps.loop);

  const slideEl = deps.slides.get(targetIdx) ?? null;

  const targetPx = computeScrollTargetPxFromDom({
    axis: deps.axis,
    align: deps.align,
    viewport,
    slideEl,
  });

  const behavior: ScrollBehavior =
    deps.reducedMotion || !deps.smoothScrollEnabled ? "auto" : "smooth";

  deps.dispatch(buildMotionStart({ isAnimating: behavior === "smooth", reason: "nav" }));

  const nextToken = deps.settleToken + 1;
  deps.setSettleToken(nextToken);

  const armed = startSettleTracking(
    deps.settle,
    nextToken,
    deps.latestScrollPx as unknown as number,
  );
  deps.setSettle(armed);

  deps.platform.scrollToPx({ viewport, axis: deps.axis, px: targetPx, options: { behavior } });

  deps.startRafSampler();
}
