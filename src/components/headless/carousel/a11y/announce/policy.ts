export type AnnounceReason =
  | "settle"
  | "keyboard"
  | "api"
  | "autoplay"
  | "edge";

export function shouldAnnounce(params: {
  readonly enabled: boolean;
  readonly reducedMotion: boolean;
  readonly reason: AnnounceReason;
}): boolean {
  if (!params.enabled) return false;

  // Never spam during autoplay unless explicitly enabled later
  if (params.reason === "autoplay") return false;

  // Reduced motion users still want announcements
  return true;
}
