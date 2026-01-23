import "@testing-library/jest-dom";

// Jest unit test setup for jsdom environment.
if (typeof globalThis.PointerEvent === "undefined") {
	globalThis.PointerEvent = globalThis.MouseEvent as typeof PointerEvent;
}