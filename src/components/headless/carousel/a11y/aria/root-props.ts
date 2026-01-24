export function getRootAriaProps(params: {
  readonly label: string;
  readonly id?: string;
  readonly roledescription?: string | false;
  readonly tabIndex?: number;
}) {
  return {
    ...(params.id ? { id: params.id } : {}),
    role: "region" as const,
    tabIndex: params.tabIndex ?? 0,
    ...(params.roledescription === false
      ? {}
      : { "aria-roledescription": params.roledescription ?? "carousel" }),
    "aria-label": params.label,
  };
}
