"use client";

import { useEffect, useState } from "react";
import {
  StreamVideo,
  StreamVideoClient,
} from "@stream-io/video-react-sdk";
import { getVideoClient } from "@/lib/streamVideo";
import { useRouter } from "next/navigation";

import IncomingCallModal from "@/components/IncomingCallModal";
import { useIncomingCall } from "@/hooks/useIncomingCall";

type Props = {
  apiKey: string;
  token: string;
  userId: string;
  userName: string;
  userRole?: string; // 'nurse' | 'doctor' | 'patient'
  children?: React.ReactNode;
};

export default function VideoProvider({
  apiKey,
  token,
  userId,
  userName,
  userRole,
  children,
}: Props) {
  const [client, setClient] = useState<StreamVideoClient | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!token || !userId) return;

    const videoClient = getVideoClient(
      apiKey,
      { id: userId, name: userName },
      token
    );

    setClient(videoClient);

    return () => {
      // Do not disconnect singleton client
      // videoClient.disconnectUser();
    };
  }, [apiKey, token, userId, userName]);

  const { incomingCall, setIncomingCall } = useIncomingCall(client, userId);

  // Ringtone logic
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const audio = new Audio("/ringtone.mp3");
    audio.loop = true;

    if (incomingCall) {
      audio.play().catch((err) => console.warn("Ringtone playback failed:", err));
    }

    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, [incomingCall]);

  const acceptCall = async () => {
    if (!incomingCall) return;

    const callId = incomingCall.id;
    const rawType = (incomingCall.state?.custom?.callType as string | undefined) || (incomingCall as any).customData?.callType;

    // Stream's backend sometimes holds stale custom data (like 'audio') if the room was ever used.
    // However, our new Call IDs explicitly contain the current intent (e.g., "-video-" or "-audio-").
    // We should give highest precedence to the embedded ID.
    const isVideoFromString = callId.includes('-video-');
    const isAudioFromString = callId.includes('-audio-');

    const callType = isVideoFromString ? 'video' : isAudioFromString ? 'audio' : (rawType || 'audio');
    
    const members = incomingCall.state?.members || (incomingCall as any).eventMembers || [];
    const patientId = members.find((m: any) => m.user_id !== userId)?.user_id;

    // Navigate to the appropriate call page
    const rolePath = userRole || 'nurse'; // Default to nurse if not specified, but should be passed

    // Construct query params
    const params = new URLSearchParams({
      callId,
      isAccepting: "true",
      callType: callType as string,
    });

    if (patientId) {
      params.append('patientId', patientId);
    }

    if (callType === 'audio') {
      router.push(`/${rolePath}/audio-call?${params.toString()}`);
    } else {
      router.push(`/${rolePath}/video-call?${params.toString()}`);
    }
    setIncomingCall(null);
  };

  const rejectCall = async () => {
    if (!incomingCall) return;
    try {
      await incomingCall.leave({ reject: true });
      setIncomingCall(null);
    } catch (error) {
      console.error("Error rejecting call:", error);
    }
  };

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
