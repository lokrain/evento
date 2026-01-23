import { expectType } from "tsd";
import type { CarouselReturn, Controlled, Uncontrolled } from "./index";

type ReadonlyIndex = Controlled<number> & { readonly: true };
type ReadonlyPlaying = Controlled<boolean> & { readonly: true };

type WritableIndex = Uncontrolled<number>;
type WritablePlaying = Uncontrolled<boolean>;

type ReadonlyReturn = CarouselReturn<ReadonlyIndex, ReadonlyPlaying>;
type WritableReturn = CarouselReturn<WritableIndex, WritablePlaying>;

declare const readonlyEngine: ReadonlyReturn["engine"];
declare const writableEngine: WritableReturn["engine"];
declare const writableReturn: WritableReturn;

expectType<number>(readonlyEngine.index);
expectType<boolean>(readonlyEngine.isDragging);

expectType<never>(readonlyEngine.goTo);
expectType<never>(readonlyEngine.next);
expectType<never>(readonlyEngine.prev);

expectType<never>(readonlyEngine.autoplay.play);
expectType<never>(readonlyEngine.autoplay.pause);
expectType<never>(readonlyEngine.autoplay.toggle);
expectType<(index: number, opts?: { transitionDurationMs?: number }) => void>(
  writableEngine.goTo,
);
expectType<(opts?: { transitionDurationMs?: number }) => void>(writableEngine.next);
expectType<(opts?: { transitionDurationMs?: number }) => void>(writableEngine.prev);

expectType<() => void>(writableEngine.autoplay.play);
expectType<() => void>(writableEngine.autoplay.pause);
expectType<() => void>(writableEngine.autoplay.toggle);

expectType<WritableReturn>(writableReturn); 