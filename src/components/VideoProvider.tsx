"use client";

import { useEffect, useState } from "react";
import {
  StreamVideo,
  StreamVideoClient,
} from "@stream-io/video-react-sdk";

import IncomingCallModal from "@/components/IncomingCallModal";
import { useIncomingCall } from "@/hooks/useIncomingCall";
import VideoCallPage from "@/components/VideoCallPage";

type Props = {
  apiKey: string;
  token: string;
  userId: string;
  userName: string;
  children?: React.ReactNode; // Allow children to render standard app content
};

export default function VideoProvider({
  apiKey,
  token,
  userId,
  userName,
  children,
}: Props) {
  const [client, setClient] = useState<StreamVideoClient | null>(null);
  const [activeCall, setActiveCall] = useState<any>(null);

  useEffect(() => {
    if (!token || !userId) return;

    const videoClient = new StreamVideoClient({
      apiKey,
      user: { id: userId, name: userName },
      token,
    });

    setClient(videoClient);

    return () => {
      videoClient.disconnectUser();
    };
  }, [apiKey, token, userId, userName]);

  const { incomingCall, setIncomingCall } = useIncomingCall(client);

  const acceptCall = async () => {
    if (!incomingCall) return;
    try {
        await incomingCall.join();
        setActiveCall(incomingCall);
        setIncomingCall(null);
    } catch (error) {
        console.error("Error accepting call:", error);
    }
  };

  const rejectCall = async () => {
    if (!incomingCall) return;
    try {
        await incomingCall.leave();
        setIncomingCall(null);
    } catch (error) {
        console.error("Error rejecting call:", error);
    }
  };

  // If a call is active, show the Call Page (Fullscreen)
  if (activeCall && client) {
    return (
      <VideoCallPage
        callId={activeCall.id}
        userId={userId}
        userName={userName}
        token={token}
        apiKey={apiKey}
        isCaller={false}
        client={client}
      />
    );
  }

  // Otherwise, render the app content + incoming call listener
  // Note: We wrap children in StreamVideo so they can access video context if needed,
  // but mostly to support the IncomingCallModal which needs context (sometimes).
  // Actually, IncomingCallModal just takes props, so strictly speaking StreamVideo wrapper 
  // isn't needed for the modal itself if it doesn't use hooks, but useIncomingCall DOES use client.
  
  if (!client) return <>{children}</>;

  return (
    <StreamVideo client={client}>
      {children}
      {incomingCall && (
        <IncomingCallModal
          call={incomingCall}
          onAccept={acceptCall}
          onReject={rejectCall}
        />
      )}
    </StreamVideo>
  );
}
