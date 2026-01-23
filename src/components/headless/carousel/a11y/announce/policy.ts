import { formatEdgeAnnouncement, formatSlideAnnouncement } from "./format";

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

export function buildSettleAnnouncement(params: {
  readonly enabled: boolean;
  readonly reducedMotion: boolean;
  readonly index: number;
  readonly total: number;
  readonly loop?: boolean;
  readonly prefix?: string;
  readonly edgePrefix?: string;
}): string | null {
  if (
    !shouldAnnounce({
      enabled: params.enabled,
      reducedMotion: params.reducedMotion,
      reason: "settle",
    })
  ) {
    return null;
  }

  const total = Math.max(1, Math.trunc(params.total));
  const index = Math.max(0, Math.trunc(params.index));

  if (params.loop === false && total > 0) {
    if (index === 0) {
      return formatEdgeAnnouncement({ kind: "start", prefix: params.edgePrefix ?? params.prefix });
    }
    if (index === total - 1) {
      return formatEdgeAnnouncement({ kind: "end", prefix: params.edgePrefix ?? params.prefix });
    }
  }

  return formatSlideAnnouncement({
    index,
    total,
    prefix: params.prefix,
  });
}
