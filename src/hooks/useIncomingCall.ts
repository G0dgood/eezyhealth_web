"use client";

import { useEffect, useState } from "react";
import { StreamVideoClient, Call } from "@stream-io/video-react-sdk";

export function useIncomingCall(client: StreamVideoClient | null) {
  const [incomingCall, setIncomingCall] = useState<Call | null>(null);

  useEffect(() => {
    if (!client) return;

    const handleIncomingCall = (event: any) => {
      if (event.type === "call.ring") {
        setIncomingCall(event.call);
      }
    };

    client.on("call.ring", handleIncomingCall);

    return () => {
      client.off("call.ring", handleIncomingCall);
    };
  }, [client]);

  return { incomingCall, setIncomingCall };
}
