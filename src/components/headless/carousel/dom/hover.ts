import type { Dispatch } from "react";
import type { CarouselAction } from "../actions/action-types";
import { buildGateSet } from "../actions/builders/build-autoplay";

export const isHovering = (root: HTMLElement | null) => {
	return Boolean(root?.matches(":hover"));
};

export function attachHoverGate(params: {
	readonly root: HTMLElement;
	readonly dispatch: Dispatch<CarouselAction>;
}): () => void {
	const { root, dispatch } = params;

	const setHover = (value: boolean) => {
		dispatch(buildGateSet({ gate: "hover", value, source: "dom" }));
	};

	const onEnter = () => setHover(true);
	const onLeave = () => setHover(false);

	root.addEventListener("pointerenter", onEnter, { passive: true });
	root.addEventListener("pointerleave", onLeave, { passive: true });

	// Initialize based on current hover state.
	setHover(isHovering(root));

	return () => {
		root.removeEventListener("pointerenter", onEnter);
		root.removeEventListener("pointerleave", onLeave);
	};
}
