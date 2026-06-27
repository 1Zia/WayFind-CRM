"use client";

import { useEffect, useRef } from "react";

import { updateCurrentUserPresence } from "@/lib/actions/presence";

const heartbeatMs = 60 * 1000;

export function PresenceHeartbeat() {
  const lastSentAt = useRef(0);

  useEffect(() => {
    let mounted = true;

    async function sendHeartbeat() {
      const now = Date.now();

      if (now - lastSentAt.current < heartbeatMs - 1000) {
        return;
      }

      lastSentAt.current = now;

      try {
        await updateCurrentUserPresence();
      } catch {
        if (mounted) {
          lastSentAt.current = 0;
        }
      }
    }

    void sendHeartbeat();
    const intervalId = window.setInterval(sendHeartbeat, heartbeatMs);

    return () => {
      mounted = false;
      window.clearInterval(intervalId);
    };
  }, []);

  return null;
}
