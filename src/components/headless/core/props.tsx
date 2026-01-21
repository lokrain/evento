// src/components/headless/core/props.ts
import * as React from "react";

// ---------------------------------------------------------
// Event Protocol
// ---------------------------------------------------------

/**
 * Minimal protocol for “preventable” events.
 * Compatible with React.SyntheticEvent and DOM Event.
 */
export type PreventableEventLike = {
  defaultPrevented: boolean;
  preventDefault?: () => void;
};

export type EventHandler<E extends PreventableEventLike> = (event: E) => void;

/**
 * Compose handlers in order, short-circuiting once defaultPrevented is true.
 *
 * We use this to implement “user-first veto”: user handler runs first,
 * and if it calls preventDefault() then internal logic does not run.
 */
export function composeHandlers<E extends PreventableEventLike>(
  ...handlers: Array<EventHandler<E> | undefined>
): EventHandler<E> {
  return (event: E) => {
    for (const handler of handlers) {
      handler?.(event);
      if (event.defaultPrevented) break;
    }
  };
}

// ---------------------------------------------------------
// Policy
// ---------------------------------------------------------

export type Policy<T> =
  | { type: "allow"; values: readonly T[]; defaultValue: T }
  | { type: "deny"; values: readonly T[]; defaultValue: T };

export function applyPolicy<T>(policy: Policy<T>, value: T): T {
  const inList = policy.values.includes(value);
  if (policy.type === "allow") return inList ? value : policy.defaultValue;
  return inList ? policy.defaultValue : value;
}

// ---------------------------------------------------------
// Prop Merging (Hardened)
// ---------------------------------------------------------

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    !!value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    (value as { constructor?: unknown }).constructor === Object
  );
}

function cx(...parts: Array<string | undefined | null | false>): string | undefined {
  const out = parts.filter(Boolean).join(" ");
  return out.length ? out : undefined;
}

export function composeRefs<T>(...refs: Array<React.Ref<T> | undefined>): React.RefCallback<T> {
  return (node) => {
    for (const ref of refs) {
      if (!ref) continue;
      if (typeof ref === "function") ref(node);
      else (ref as React.MutableRefObject<T | null>).current = node;
    }
  };
}

/**
 * React DOM event handler whitelist.
 * Hardening goal: do NOT compose arbitrary domain callbacks like onNext/onIndexChange by default.
 */
const REACT_DOM_EVENT_KEYS = new Set<string>([
  // Clipboard
  "onCopy",
  "onCut",
  "onPaste",
  // Composition
  "onCompositionEnd",
  "onCompositionStart",
  "onCompositionUpdate",
  // Keyboard
  "onKeyDown",
  "onKeyPress",
  "onKeyUp",
  // Focus
  "onFocus",
  "onBlur",
  "onFocusCapture",
  "onBlurCapture",
  // Form
  "onChange",
  "onInput",
  "onInvalid",
  "onReset",
  "onSubmit",
  // Mouse
  "onClick",
  "onContextMenu",
  "onDoubleClick",
  "onDrag",
  "onDragEnd",
  "onDragEnter",
  "onDragExit",
  "onDragLeave",
  "onDragOver",
  "onDragStart",
  "onDrop",
  "onMouseDown",
  "onMouseEnter",
  "onMouseLeave",
  "onMouseMove",
  "onMouseOut",
  "onMouseOver",
  "onMouseUp",
  // Pointer
  "onPointerDown",
  "onPointerMove",
  "onPointerUp",
  "onPointerCancel",
  "onPointerEnter",
  "onPointerLeave",
  "onPointerOver",
  "onPointerOut",
  "onGotPointerCapture",
  "onLostPointerCapture",
  // Touch
  "onTouchCancel",
  "onTouchEnd",
  "onTouchMove",
  "onTouchStart",
  // UI / Wheel
  "onScroll",
  "onWheel",
  // Media
  "onAbort",
  "onCanPlay",
  "onCanPlayThrough",
  "onDurationChange",
  "onEmptied",
  "onEncrypted",
  "onEnded",
  "onError",
  "onLoadedData",
  "onLoadedMetadata",
  "onLoadStart",
  "onPause",
  "onPlay",
  "onPlaying",
  "onProgress",
  "onRateChange",
  "onSeeked",
  "onSeeking",
  "onStalled",
  "onSuspend",
  "onTimeUpdate",
  "onVolumeChange",
  "onWaiting",
  // Image
  "onLoad",
  "onErrorCapture",
  // Animation / Transition
  "onAnimationStart",
  "onAnimationEnd",
  "onAnimationIteration",
  "onTransitionEnd",
]);

export type MergePropsOptions = {
  /**
   * Additional prop keys to compose (opt-in).
   * Example: ["onNext", "onPrev"] if you intentionally treat them like preventable events.
   */
  compose?: readonly string[];

  /**
   * Custom decision fn (takes precedence over whitelist/compose).
   * Use only if you have a framework-specific reason.
   */
  shouldCompose?: (key: string) => boolean;
};

function shouldComposeHandlerKey(key: string, options?: MergePropsOptions): boolean {
  if (options?.shouldCompose) return options.shouldCompose(key);
  if (REACT_DOM_EVENT_KEYS.has(key)) return true;
  if (options?.compose?.includes(key)) return true;
  return false;
}

/**
 * Merge behavior:
 * - Event handlers (hardened): composed ONLY for vetted keys; USER-FIRST veto semantics.
 * - className: concatenated
 * - style: shallow merged (incoming wins)
 * - ref: composed
 * - everything else: incoming wins
 */
export function mergeProps<A extends object, B extends object>(
  internal: A,
  user: B,
  options?: MergePropsOptions,
): Omit<A, keyof B> & B {
  const internalRecord = internal as Record<string, unknown>
  const userRecord = user as Record<string, unknown>

  const result: Record<string, unknown> = { ...internalRecord }

  // Use own enumerable keys only (avoid prototype keys)
  for (const keyString of Object.keys(userRecord)) {
    const existing = result[keyString]
    const incoming = userRecord[keyString]

    if (keyString === "className") {
      result.className = cx(
        existing as string | undefined,
        incoming as string | undefined,
      )
      continue
    }

    if (keyString === "style") {
      // shallow merged (incoming wins) when both are plain objects,
      // otherwise incoming wins outright
      if (isPlainObject(existing) && isPlainObject(incoming)) {
        result.style = { ...existing, ...incoming }
      } else {
        result.style = incoming
      }
      continue
    }

    if (keyString === "ref") {
      // compose even if one side is missing
      result.ref = composeRefs(
        existing as React.Ref<unknown> | undefined,
        incoming as React.Ref<unknown> | undefined,
      )
      continue
    }

    if (
      typeof existing === "function" &&
      typeof incoming === "function" &&
      shouldComposeHandlerKey(keyString, options)
    ) {
      // USER-FIRST veto semantics:
      // - user handler runs first
      // - if it prevents default, internal handler does not run
      result[keyString] = composeHandlers(
        incoming as EventHandler<PreventableEventLike>,
        existing as EventHandler<PreventableEventLike>,
      )
      continue
    }

    result[keyString] = incoming
  }

  return result as Omit<A, keyof B> & B
}


/**
 * Typed helper for prop getter ergonomics.
 * Accepts any object-ish props and delegates to mergeProps.
 */
export function mergeHeadlessProps<A extends object, B extends object>(
  internal: A,
  user?: B,
  options?: MergePropsOptions,
): A & B {
  return mergeProps(internal, (user ?? {}) as B, options) as A & B;
}

// ---------------------------------------------------------
// Controllable State
// ---------------------------------------------------------

export type Controllable<T> =
  | { value: T; onChange: (next: T) => void; defaultValue?: never }
  | { defaultValue: T; onChange?: (next: T) => void; value?: never }
  | { value?: never; defaultValue?: never; onChange?: (next: T) => void };

/**
 * React-correct controllable state hook.
 * - Controlled when props.value is defined.
 * - Otherwise uses internal state initialized from defaultValue or fallback.
 */
export function useControllableState<T>(
  props: Controllable<T>,
  fallback: T,
): [T, (next: T | ((prev: T) => T)) => void] {
  const isControlled = props.value !== undefined;

  const [uncontrolled, setUncontrolled] = React.useState<T>((props.defaultValue ?? fallback) as T);

  const value = isControlled ? (props.value as T) : uncontrolled;

  const setValue = React.useCallback(
    (next: T | ((prev: T) => T)) => {
      const nextValue = typeof next === "function" ? (next as (prev: T) => T)(value) : next;

      if (!isControlled) setUncontrolled(nextValue);
      props.onChange?.(nextValue);
    },
    [isControlled, props, value],
  );

  return [value, setValue];
}

export type DataAttributes = {
  [K in `data-${string}`]?: string | number | boolean | undefined;
};

/**
 * React's HTMLAttributes<T> does not include `ref`.
 * For prop-getters we want a type that allows ref + normal HTML attrs + data-*.
 */
export type HeadlessProps<T extends HTMLElement> = React.HTMLAttributes<T> &
  React.RefAttributes<T> &
  DataAttributes;
