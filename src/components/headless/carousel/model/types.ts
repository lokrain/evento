export interface SlideRect {
	x: number;
	y: number;
	width: number;
	height: number;
}

export interface SnapModel {
	axis: "x" | "y";
	slideCount: number;
	snapPoints: number[]; // offsets in px from origin
	slideSizes: number[]; // length in axis for each slide
	viewportSize: number; // length in axis
	loop: boolean;
}