// lib/types.ts
/* eslint-disable @typescript-eslint/ban-types */

/**
 * Utility types for shadcn-style, headless components.
 *
 * Design goals:
 * - Make illegal prop combinations unrepresentable (via unions + `never`)
 * - Avoid optional-prop soup by modeling modes explicitly
 * - Provide reusable primitives for controlled/uncontrolled state, feature flags, and exclusivity
 *
 * Notes:
 * - These are compile-time utilities only (no runtime code).
 * - Prefer using `resolveProps()` in each component to normalize public props into a total internal shape.
 */

/**
 * Remove keys from T that exist in U, and forbid them (never) to enforce exclusivity.
 */
export type Without<T, U> = {
  [P in Exclude<keyof T, keyof U>]?: never;
};

/**
 * XOR: exactly one of T or U, never both.
 */
export type XOR<T extends object, U extends object> = (T & Without<U, T>) | (U & Without<T, U>);

/**
 * Forbid a set of keys in a given object shape.
 * Useful for discriminated unions where certain props must not appear in a mode.
 */
export type Disallow<K extends PropertyKey> = {
  [P in K]?: never;
};

/**
 * Controlled/uncontrolled state helper.
 *
 * Controlled:
 * - value is required
 * - onValueChange is required
 * - defaultValue is forbidden
 *
 * Uncontrolled:
 * - defaultValue optional
 * - onValueChange optional
 * - value forbidden
 */
export type Controlled<T> = {
  value: T;
  onValueChange: (value: T) => void;
  defaultValue?: never;
};

export type Uncontrolled<T> = {
  defaultValue?: T;
  onValueChange?: (value: T) => void;
  value?: never;
};

export type ControllableState<T> = Controlled<T> | Uncontrolled<T>;

/**
 * FeatureFlag:
 * Model "when enabled, require X; when disabled, forbid X".
 *
 * Example:
 * type AutoRotate = FeatureFlag<
 *   "autoRotate",
 *   { intervalMs: number },
 *   Disallow<"intervalMs">
 * >
 */
export type FeatureFlag<
  FlagKey extends string,
  Enabled extends object,
  Disabled extends object = Record<string, never>,
> = ({ [K in FlagKey]: true } & Enabled) | ({ [K in FlagKey]?: false } & Disabled);

/**
 * StrictOptional:
 * If the property exists, it cannot be `undefined`.
 * This is useful when consuming values from partially typed sources.
 *
 * Note: This does not prevent `prop?: T` from being omitted; it only narrows T.
 */
export type StrictOptional<T> = Exclude<T, undefined>;

/**
 * Exact:
 * Reject excess properties in object literals for config-like objects.
 *
 * Usage:
 * function f<T extends Shape>(x: Exact<Shape, T>) {}
 */
export type Exact<Shape extends object, T extends Shape> = Shape &
  Record<Exclude<keyof T, keyof Shape>, never>;

/**
 * NarrowKeys:
 * Derive keys from an object type as a string union (common ergonomic helper).
 */
export type NarrowKeys<T extends object> = Extract<keyof T, string>;

/**
 * Resolve:
 * Helper type for "public props -> resolved internal props" normalizers.
 */
export type Resolve<TPublic, TResolved> = (props: TPublic) => TResolved;

/**
 * Merge:
 * For composing public prop types. Kept simple; prefer explicit composition + unions.
 */
export type Merge<A extends object, B extends object> = Omit<A, keyof B> & B;
