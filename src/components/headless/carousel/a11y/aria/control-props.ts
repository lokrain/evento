export type DisabledSemantics =
  | "disabled-only"
  | "aria-disabled-only"
  | "both";

function disabledProps(semantics: DisabledSemantics) {
  switch (semantics) {
    case "disabled-only":
      return { disabled: true };
    case "aria-disabled-only":
      return { "aria-disabled": true };
    default:
      return { disabled: true, "aria-disabled": true };
  }
}

export function getControlProps(params: {
  readonly label: string;
  readonly controlsId: string;
  readonly enabled: boolean;
  readonly disabledSemantics?: DisabledSemantics;
  readonly keyShortcuts?: string;
  readonly id?: string;
}) {
  const semantics = params.disabledSemantics ?? "both";

  return {
    type: "button" as const,
    ...(params.id ? { id: params.id } : {}),
    "aria-label": params.label,
    "aria-controls": params.controlsId,
    ...(params.keyShortcuts ? { "aria-keyshortcuts": params.keyShortcuts } : {}),
    ...(params.enabled ? {} : disabledProps(semantics)),
  };
}
