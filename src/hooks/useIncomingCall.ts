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

      // Instantiate the full Call object instead of just setting the raw event call object
      const call = client.call(event.call.type, event.call.id);
      
      const custom = event.call.custom || {};
      const callerName =
        custom.callerName ||
        event.user?.name ||
        event.call.created_by?.name ||
        custom.callerId ||
        "Patient";
      const callerImage =
        custom.callerImage ||
        event.user?.image ||
        event.call.created_by?.image ||
        "";

      // Attach metadata to the call object so components can access it synchronously
      (call as any).callerName = callerName;
      (call as any).callerImage = callerImage;
      (call as any).customData = custom;
      (call as any).eventMembers = event.call.members || [];

      setIncomingCall(call);
    };

    client.on("call.ring", handleIncomingCall);

    return () => {
      client.off("call.ring", handleIncomingCall);
    };
  }, [client, currentUserId]);

  return { incomingCall, setIncomingCall };
}
