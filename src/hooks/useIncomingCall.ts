"use client";

import { useEffect, useState } from "react";
import { StreamVideoClient, Call } from "@stream-io/video-react-sdk";

export function useIncomingCall(
  client: StreamVideoClient | null,
  currentUserId?: string
) {
  const [incomingCall, setIncomingCall] = useState<Call | null>(null);

  useEffect(() => {
    if (!client) return;

    const handleIncomingCall = (event: any) => {
      if (event.type !== "call.ring") return;

      // Ignore calls the current user created — the CALLER should only see the
      // outgoing call screen, not an "answer/decline" incoming alert.
      const createdById =
        event.call?.created_by?.id || event.call?.created_by_user_id;
      if (currentUserId && createdById && createdById === currentUserId) {
        return;
      }

      setIncomingCall(event.call);
    };

    client.on("call.ring", handleIncomingCall);

    return () => {
      client.off("call.ring", handleIncomingCall);
    };
  }, [client, currentUserId]);

  return { incomingCall, setIncomingCall };
}
