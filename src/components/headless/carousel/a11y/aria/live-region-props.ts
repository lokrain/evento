export type LiveMode = "off" | "polite" | "assertive";

export function getLiveRegionProps(params: {
  readonly mode: LiveMode;
  readonly text: string | null;
}) {
  return {
    "aria-live": params.mode,
    "aria-atomic": true as const,
    children: params.text,
  };
}
