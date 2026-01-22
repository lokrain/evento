export const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
export const mod = (value: number, n: number) => ((value % n) + n) % n;

export function clampIndex(index: number, slideCount: number): number {
	if (slideCount <= 0) return 0;
	return clamp(index, 0, slideCount - 1);
}

export function modIndex(index: number, slideCount: number): number {
	if (slideCount <= 0) return 0;
	return mod(index, slideCount);
}

export function clampIndexLoopAware(index: number, slideCount: number, loop: boolean): number {
	if (slideCount <= 0) return 0;
	if (loop) return modIndex(index, slideCount);
	return clampIndex(index, slideCount);
}

export function stepIndex(args: {
	index: number;
	step: number;
	slideCount: number;
	loop: boolean;
	direction: 1 | -1;
}): number {
	const { index, step, slideCount, loop, direction } = args;
	if (slideCount <= 0) return 0;

	const delta = direction * step;
	const target = index + delta;

	return clampIndexLoopAware(target, slideCount, loop);
}