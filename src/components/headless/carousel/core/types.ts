// src/components/headless/carousel/core/types.ts

export type Axis = "x" | "y";
export type Dir = "ltr" | "rtl";

export type LogicalIndex = number & { readonly __brand: "LogicalIndex" };
export type Px = number & { readonly __brand: "Px" };
export type Ms = number & { readonly __brand: "Ms" };

export type WindowSize = number & { readonly __brand: "WindowSize" };

export interface ViewportSize {
  readonly main: Px;
}

export interface SlideMeasurement {
  readonly index: LogicalIndex;
  readonly size: Px;
}

export interface VirtualWindow {
  readonly start: LogicalIndex;
  readonly end: LogicalIndex;
  readonly size: WindowSize;
}
