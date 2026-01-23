// src/components/headless/carousel/core/brands.ts

import type { LogicalIndex, Ms, Px, WindowSize } from "./types";

export const asIndex = (n: number): LogicalIndex => n as LogicalIndex;
export const asPx = (n: number): Px => n as Px;
export const asMs = (n: number): Ms => n as Ms;
export const asWindowSize = (n: number): WindowSize => n as WindowSize;
