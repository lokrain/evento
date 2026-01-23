import type { Dispatch } from "react";
import type { CarouselAction } from "../actions/action-types";
import { buildGateSet } from "../actions/builders/build-autoplay";

export const isPageHidden = () =>
	typeof document !== "undefined" && document.visibilityState === "hidden";

export function attachVisibilityGate(params: {
	readonly dispatch: Dispatch<CarouselAction>;
}): () => void {
	const { dispatch } = params;

	const update = () => {
		dispatch(
			buildGateSet({ gate: "visibilityHidden", value: isPageHidden(), source: "dom" }),
		);
	};

	if (typeof document === "undefined") return () => {};

	document.addEventListener("visibilitychange", update, { passive: true });
	update();

	return () => {
		document.removeEventListener("visibilitychange", update);
	};
}
