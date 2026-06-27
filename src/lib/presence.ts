export type PresenceStatus = "online" | "away" | "offline";

const onlineWindowMs = 2 * 60 * 1000;
const awayWindowMs = 10 * 60 * 1000;

export function getPresenceStatus(lastSeenAt: Date | string | null | undefined) {
  if (!lastSeenAt) {
    return "offline" satisfies PresenceStatus;
  }

  const lastSeenTime = new Date(lastSeenAt).getTime();

  if (Number.isNaN(lastSeenTime)) {
    return "offline" satisfies PresenceStatus;
  }

  const elapsedMs = Date.now() - lastSeenTime;

  if (elapsedMs <= onlineWindowMs) {
    return "online" satisfies PresenceStatus;
  }

  if (elapsedMs <= awayWindowMs) {
    return "away" satisfies PresenceStatus;
  }

  return "offline" satisfies PresenceStatus;
}

export function formatPresenceStatus(status: PresenceStatus) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function formatLastSeen(lastSeenAt: Date | string | null | undefined) {
  if (!lastSeenAt) {
    return "Never";
  }

  return new Intl.DateTimeFormat("en-PK", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(lastSeenAt));
}
