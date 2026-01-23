import { asPx } from "../core/brands";
import type { Px } from "../core/types";

export function mustBeFiniteNumber(value: unknown, name: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`${name} must be a finite number`);
  }
  return value;
}

export function toInt(value: unknown, name: string): number {
  const n = mustBeFiniteNumber(value, name);
  const i = Math.trunc(n);
  if (!Number.isFinite(i)) {
    throw new Error(`${name} must be an integer`);
  }
  return i;
}

export function toNonNegInt(value: unknown, name: string): number {
  const i = toInt(value, name);
  return i < 0 ? 0 : i;
}

export function toNonNegPx(value: unknown, name: string): Px {
  const n = mustBeFiniteNumber(value, name);
  const clamped = n < 0 ? 0 : n;
  return asPx(clamped);
}

export function toNullableNonNegPx(value: unknown, name: string): Px | null {
  if (value === null) return null;
  return toNonNegPx(value, name);
}

export function mustBeStringOrNull(value: unknown, name: string): string | null {
  if (value === null) return null;
  if (typeof value !== "string") {
    throw new Error(`${name} must be a string or null`);
  }
  return value;
}

export function mustBeBoolean(value: unknown, name: string): boolean {
  if (typeof value !== "boolean") {
    throw new Error(`${name} must be a boolean`);
  }
  return value;
}
