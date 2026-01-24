import * as React from "react";
import { getLiveRegionProps } from "../a11y/aria/live-region-props";
import type { Axis, CarouselBindings, DataAttributes, LiveRegionPoliteness } from "../core/types";
import { getNextButtonBindings, getPrevButtonBindings } from "./controls";
import { getRootBindings } from "./root";
import { getSlideBindings } from "./slide";
import { getTrackBindings } from "./track";
import { getViewportBindings } from "./viewport";

export interface ComposeBindingsParams {
  readonly normalizedLabel: string;
  readonly rootTabIndex?: number;
  readonly controlsId: string;
  readonly ids: Readonly<{
    root: string;
    viewport: string;
    track: string;
    liveRegion: string;
    prevButton: string;
    nextButton: string;
    slide: (index: number) => string;
  }>;

  readonly rootRef: React.Ref<HTMLElement>;
  readonly viewportRef: React.Ref<HTMLElement>;
  readonly trackRef: React.Ref<HTMLElement>;
  readonly slideRefForIndex: (logicalIndex: number) => React.Ref<HTMLElement>;

  readonly canPrev: boolean;
  readonly canNext: boolean;

  readonly slideCount: number;
  readonly index: number;

  readonly canNavigate: boolean;
  readonly canControlPlaying: boolean;

  readonly axis: Axis;
  readonly isDraggable: boolean;
  readonly isDragging: boolean;

  readonly autoplayEnabled: boolean;

  readonly liveMode: LiveRegionPoliteness;
  readonly announcement: string | null;

  readonly handlePrev: (event: React.MouseEvent<HTMLButtonElement>) => void;
  readonly handleNext: (event: React.MouseEvent<HTMLButtonElement>) => void;
  readonly handleGoTo: (index: number, event: React.MouseEvent<HTMLButtonElement>) => void;
  readonly dispatchAutoplayToggle: () => void;

  readonly logicalIndexFromRenderIndex: (renderIndex: number) => number;
}

/**
 * Compose CarouselBindings.
 *
 * Contract:
 * - Pure with respect to DOM (no reads/writes).
 * - Must preserve consumer overrides (user props win where appropriate).
 */
export function composeBindings(params: ComposeBindingsParams): CarouselBindings {
  const {
    normalizedLabel,
    rootTabIndex,
    controlsId,
    ids,
    rootRef,
    viewportRef,
    trackRef,
    slideRefForIndex,

    canPrev,
    canNext,

    slideCount,
    index,

    canNavigate,
    canControlPlaying,
    axis,
    isDraggable,
    isDragging,

    autoplayEnabled,

    liveMode,
    announcement,

    handlePrev,
    handleNext,
    handleGoTo,
    dispatchAutoplayToggle,

    logicalIndexFromRenderIndex,
  } = params;

  const getRootProps = <P extends React.ComponentPropsWithRef<"div"> & DataAttributes>(user?: P) =>
    getRootBindings(
      { label: normalizedLabel, ref: rootRef, id: ids.root, tabIndex: rootTabIndex },
      user as React.HTMLAttributes<HTMLElement> & DataAttributes,
    ) as unknown as P;

  const getViewportProps = <P extends React.ComponentPropsWithRef<"div"> & DataAttributes>(user?: P) => {
    const base = { ...(user ?? {}) } as P & Record<string, unknown>;
    const baseStyle = (base.style ?? {}) as React.CSSProperties;
    const draggable = isDraggable && slideCount > 1;

    const touchAction =
      baseStyle.touchAction ?? (draggable ? (axis === "x" ? "pan-y" : "pan-x") : undefined);
    const cursor =
      baseStyle.cursor ??
      (draggable ? (isDragging ? "grabbing" : "grab") : undefined);

    const style = {
      ...baseStyle,
      ...(touchAction ? { touchAction } : {}),
      ...(cursor ? { cursor } : {}),
    };

    const userAxis = base["data-carousel-axis"] as string | undefined;
    const userDraggable = base["data-carousel-draggable"] as
      | boolean
      | string
      | number
      | undefined;
    const userDragging = base["data-carousel-dragging"] as
      | boolean
      | string
      | number
      | undefined;

    const decorated = {
      ...base,
      id: controlsId,
      style,
      "data-carousel-axis": userAxis ?? axis,
      "data-carousel-draggable": userDraggable ?? (draggable ? true : undefined),
      "data-carousel-dragging": userDragging ?? (isDragging ? true : undefined),
    } as React.HTMLAttributes<HTMLElement> & DataAttributes;

    return getViewportBindings({ ref: viewportRef }, decorated) as unknown as P;
  };

  const getTrackProps = <P extends React.ComponentPropsWithRef<"div"> & DataAttributes>(user?: P) =>
    getTrackBindings(
      { ref: trackRef },
      { ...(user ?? {}), id: ids.track } as React.HTMLAttributes<HTMLElement> & DataAttributes,
    ) as unknown as P;

  const getSlideProps = <P extends React.ComponentPropsWithRef<"div"> & DataAttributes>(
    renderIndex: number,
    user?: P,
  ) => {
    const logicalIndex = logicalIndexFromRenderIndex(renderIndex);
    return getSlideBindings(
      {
        index: logicalIndex,
        total: slideCount,
        ref: slideRefForIndex(logicalIndex),
        id: ids.slide(logicalIndex),
      },
      user as React.HTMLAttributes<HTMLElement> & DataAttributes,
    ) as unknown as P;
  };

  const getPrevButtonProps = <P extends React.ButtonHTMLAttributes<HTMLButtonElement> & DataAttributes>(user?: P) => {
    const base = getPrevButtonBindings(
      { canPrev, controlsId, id: ids.prevButton },
      user as React.ButtonHTMLAttributes<HTMLButtonElement> & DataAttributes,
    );

    return {
      ...base,
      onClick: (event: React.MouseEvent<HTMLButtonElement>) => {
        (base.onClick as undefined | ((e: React.MouseEvent<HTMLButtonElement>) => void))?.(event);
        if (!canNavigate) return;
        handlePrev(event);
      },
    } as unknown as P;
  };

  const getNextButtonProps = <P extends React.ButtonHTMLAttributes<HTMLButtonElement> & DataAttributes>(user?: P) => {
    const base = getNextButtonBindings(
      { canNext, controlsId, id: ids.nextButton },
      user as React.ButtonHTMLAttributes<HTMLButtonElement> & DataAttributes,
    );

    return {
      ...base,
      onClick: (event: React.MouseEvent<HTMLButtonElement>) => {
        (base.onClick as undefined | ((e: React.MouseEvent<HTMLButtonElement>) => void))?.(event);
        if (!canNavigate) return;
        handleNext(event);
      },
    } as unknown as P;
  };

  const getListProps = <P extends React.ComponentPropsWithRef<"div"> & DataAttributes>(user?: P) => {
    const base = { ...(user ?? {}) } as P & Record<string, unknown>;
    const baseLabel = base["aria-label"] as string | undefined;
    const baseLabelledBy = base["aria-labelledby"] as string | undefined;
    const label = baseLabel ?? (baseLabelledBy ? undefined : "Choose slide to display");

    return {
      ...base,
      role: base.role ?? "group",
      ...(label ? { "aria-label": label } : {}),
    } as P;
  };

  const getDotProps = <P extends React.ButtonHTMLAttributes<HTMLButtonElement> & DataAttributes>(
    dotIndex: number,
    user?: P,
  ) => {
    const base = { ...(user ?? {}) } as P & Record<string, unknown>;
    const baseLabel = base["aria-label"] as string | undefined;
    const baseLabelledBy = base["aria-labelledby"] as string | undefined;
    const label =
      baseLabel ?? (baseLabelledBy ? undefined : `${dotIndex + 1} of ${slideCount}`);
    return {
      ...base,
      "aria-controls": controlsId,
      "aria-label": label,
      "aria-disabled": dotIndex === index ? true : undefined,
      "aria-current": dotIndex === index ? "true" : undefined,
      onClick: (event: React.MouseEvent<HTMLButtonElement>) => {
        (base.onClick as undefined | ((e: React.MouseEvent<HTMLButtonElement>) => void))?.(event);
        if (!canNavigate) return;
        if (dotIndex === index) return;
        handleGoTo(dotIndex, event);
      },
    } as P;
  };

  const getAutoplayToggleProps = <P extends React.ButtonHTMLAttributes<HTMLButtonElement> & DataAttributes>(user?: P) => {
    const base = { ...(user ?? {}) } as P & Record<string, unknown>;
    const baseLabel = base["aria-label"] as string | undefined;
    const baseLabelledBy = base["aria-labelledby"] as string | undefined;
    const label =
      baseLabel ??
      (baseLabelledBy
        ? undefined
        : autoplayEnabled
          ? "Stop slide rotation"
          : "Start slide rotation");
    const baseDataState = base["data-autoplay-state"] as string | undefined;
    const dataState = baseDataState ?? (autoplayEnabled ? "playing" : "paused");

    return {
      ...base,
      "aria-label": label,
      "data-autoplay-state": dataState,
      onClick: (event: React.MouseEvent<HTMLButtonElement>) => {
        (base.onClick as undefined | ((e: React.MouseEvent<HTMLButtonElement>) => void))?.(event);
        if (!canControlPlaying) return;
        dispatchAutoplayToggle();
      },
    } as P;
  };

  const getAnnouncerProps = <P extends React.HTMLAttributes<HTMLElement> & DataAttributes>(user?: P) => ({
    ...getLiveRegionProps({ mode: liveMode, text: announcement }),
    ...user,
    id: ids.liveRegion,
  }) as P;

  return {
    getRootProps,
    getViewportProps,
    getTrackProps,
    getSlideProps,
    getPrevButtonProps,
    getNextButtonProps,
    pagination: {
      count: slideCount,
      index,
      getListProps,
      getDotProps,
    },
    autoplayToggle: {
      getButtonProps: getAutoplayToggleProps,
    },
    announcer: {
      message: announcement,
      getProps: getAnnouncerProps,
    },
  };
}
