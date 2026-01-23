export function readScrollOffset(element: HTMLElement | null): number {
  return element?.scrollLeft ?? 0;
}
