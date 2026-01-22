# Strict Types & Capability‑Typed `useCarousel`

This document defines the **exact TypeScript types** that enforce compile‑time correctness for controlled, uncontrolled, and read‑only state.

---

## Controllable State Primitives

```ts
export type Controlled<T> =
  | {
      mode: "controlled";
      value: T;
      onChange: (next: T) => void;
    }
  | {
      mode: "controlled";
      value: T;
      readonly: true;
      onChange?: never;
    };

export type Uncontrolled<T> = {
  mode: "uncontrolled";
  defaultValue?: T;
  onChange?: (next: T) => void;
};

export type Controllable<T> = Controlled<T> | Uncontrolled<T>;
```

---

## Capability Typing (Writable vs Read‑only)

```ts
export type ReadonlyIndex = { __index: "readonly" };
export type WritableIndex = { __index: "writable" };

export type CarouselCapabilities<C extends Controllable<number>> =
  C extends { mode: "controlled"; readonly: true }
    ? ReadonlyIndex
    : WritableIndex;
```

---

## Engine Type (Commands Removed When Read‑only)

```ts
export interface CarouselEngine<C extends Controllable<number>> {
  index: number;
  isReady: boolean;
  isDragging: boolean;
  isAnimating: boolean;

  renderCount: number;
  realIndexFromRenderIndex(renderIndex: number): number;

  refs: {
    root: (node: HTMLElement | null) => void;
    viewport: (node: HTMLDivElement | null) => void;
    track: (node: HTMLDivElement | null) => void;
    slide: (renderIndex: number) => (node: HTMLElement | null) => void;
  };

  autoplay: {
    enabled: boolean;
    isPlaying: boolean;
    play(): void;
    pause(): void;
    toggle(): void;
    setGate(gate: AutoplayGate, active: boolean): void;
    getGates(): Readonly<Record<AutoplayGate, boolean>>;
  };

  goTo: CarouselCapabilities<C> extends WritableIndex
    ? (index: number, opts?: { transitionDurationMs?: number }) => void
    : never;

  next: CarouselCapabilities<C> extends WritableIndex
    ? (opts?: { transitionDurationMs?: number }) => void
    : never;

  prev: CarouselCapabilities<C> extends WritableIndex
    ? (opts?: { transitionDurationMs?: number }) => void
    : never;
}
```

---

## `useCarousel` Signature

```ts
export interface UseCarouselOptions<C extends Controllable<number>> {
  slideCount: number;
  index?: C;
  // other options omitted here for brevity
}

export interface CarouselBindings {
  // prop getters, pagination, announcer, autoplay toggle
}

export interface CarouselReturn<C extends Controllable<number>> {
  engine: CarouselEngine<C>;
  bindings: CarouselBindings;
}

export function useCarousel<
  C extends Controllable<number> = Uncontrolled<number>
>(
  options: UseCarouselOptions<C>,
): CarouselReturn<C>;
```

---

## Compile‑time Guarantees

* Read‑only controlled index ⇒ `next/prev/goTo` are `never`
* Writable controlled or uncontrolled ⇒ commands are callable
* Invalid state ownership combinations are unrepresentable

This is enforced **without runtime checks**.
