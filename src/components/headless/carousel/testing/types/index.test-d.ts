// index.test-d.ts
import { expectType } from "tsd";

import type {
  CarouselReturn,
  Controlled,
  Uncontrolled,
} from "../../engine/types-public";

// -------------------------------------------------------------------------------------------------
// Capability aliases (keep consistent with STRICT.md)
// -------------------------------------------------------------------------------------------------

type UIndex = Uncontrolled<number>;

type RWIndex = {
  mode: "controlled";
  value: number;
  onChange: (next: number) => void;
};

type ROIndex = {
  mode: "controlled";
  value: number;
  readonly: true;
  onChange?: never;
};

type UPlaying = Uncontrolled<boolean>;

type RWPlaying = {
  mode: "controlled";
  value: boolean;
  onChange: (next: boolean) => void;
};

type ROPlaying = {
  mode: "controlled";
  value: boolean;
  readonly: true;
  onChange?: never;
};

// -------------------------------------------------------------------------------------------------
// Index capability: writable exposes navigation commands
// -------------------------------------------------------------------------------------------------

{
  const result = {} as CarouselReturn<UIndex, UPlaying>;
  expectType<(index: number, opts?: { transitionDurationMs?: number }) => void>(result.engine.goTo);
  expectType<(opts?: { transitionDurationMs?: number }) => void>(result.engine.next);
  expectType<(opts?: { transitionDurationMs?: number }) => void>(result.engine.prev);
}

{
  const result = {} as CarouselReturn<RWIndex, UPlaying>;
  expectType<(index: number, opts?: { transitionDurationMs?: number }) => void>(result.engine.goTo);
  expectType<(opts?: { transitionDurationMs?: number }) => void>(result.engine.next);
  expectType<(opts?: { transitionDurationMs?: number }) => void>(result.engine.prev);
}

// -------------------------------------------------------------------------------------------------
// Index capability: readonly removes navigation commands (must be never)
// -------------------------------------------------------------------------------------------------

{
  const result = {} as CarouselReturn<ROIndex, UPlaying>;
  expectType<never>(result.engine.goTo);
  expectType<never>(result.engine.next);
  expectType<never>(result.engine.prev);
}

// -------------------------------------------------------------------------------------------------
// Autoplay playing capability: writable exposes play controls
// -------------------------------------------------------------------------------------------------

{
  const result = {} as CarouselReturn<UIndex, UPlaying>;
  expectType<() => void>(result.engine.autoplay.play);
  expectType<() => void>(result.engine.autoplay.pause);
  expectType<() => void>(result.engine.autoplay.toggle);
}

{
  const result = {} as CarouselReturn<UIndex, RWPlaying>;
  expectType<() => void>(result.engine.autoplay.play);
  expectType<() => void>(result.engine.autoplay.pause);
  expectType<() => void>(result.engine.autoplay.toggle);
}

// -------------------------------------------------------------------------------------------------
// Autoplay playing capability: readonly removes play controls (must be never)
// -------------------------------------------------------------------------------------------------

{
  const result = {} as CarouselReturn<UIndex, ROPlaying>;
  expectType<never>(result.engine.autoplay.play);
  expectType<never>(result.engine.autoplay.pause);
  expectType<never>(result.engine.autoplay.toggle);
}

// -------------------------------------------------------------------------------------------------
// Orthogonality (mixed cases): index and playing capabilities are independent
// -------------------------------------------------------------------------------------------------

// 1) Readonly index + writable playing => navigation removed, autoplay controls present
{
  const result = {} as CarouselReturn<ROIndex, RWPlaying>;
  expectType<never>(result.engine.goTo);
  expectType<never>(result.engine.next);
  expectType<never>(result.engine.prev);

  expectType<() => void>(result.engine.autoplay.play);
  expectType<() => void>(result.engine.autoplay.pause);
  expectType<() => void>(result.engine.autoplay.toggle);
}

// 2) Writable index + readonly playing => navigation present, autoplay controls removed
{
  const result = {} as CarouselReturn<RWIndex, ROPlaying>;
  expectType<(index: number, opts?: { transitionDurationMs?: number }) => void>(result.engine.goTo);
  expectType<(opts?: { transitionDurationMs?: number }) => void>(result.engine.next);
  expectType<(opts?: { transitionDurationMs?: number }) => void>(result.engine.prev);

  expectType<never>(result.engine.autoplay.play);
  expectType<never>(result.engine.autoplay.pause);
  expectType<never>(result.engine.autoplay.toggle);
}
