export function getRootAriaProps(params: {
  readonly label: string;
  readonly id?: string;
  readonly roledescription?: string | false;
}) {
  return {
    ...(params.id ? { id: params.id } : {}),
    role: "region" as const,
    tabIndex: 0 as const,
    ...(params.roledescription === false
      ? {}
      : { "aria-roledescription": params.roledescription ?? "carousel" }),
    "aria-label": params.label,
  };
}
