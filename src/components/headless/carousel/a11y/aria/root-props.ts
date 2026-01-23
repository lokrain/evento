export function getRootAriaProps(params: {
  readonly label: string;
  readonly id?: string;
}) {
  return {
    ...(params.id ? { id: params.id } : {}),
    role: "region" as const,
    tabIndex: 0 as const,
    "aria-roledescription": "carousel",
    "aria-label": params.label,
  };
}
