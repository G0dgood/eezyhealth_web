"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  StreamVideo,
  StreamCall,
  StreamTheme,
  StreamVideoClient,
} from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import { useAuth } from "@/contexts/AuthContext";
import { useGenerateTokenForUserMutation } from "@/store/streamChatApi";
import VideoCallScreen from "@/components/VideoCallScreen";
import { getVideoClient } from "@/lib/streamVideo";
import { toast } from "sonner";

import { getStreamChatInfo, getStreamChatClient, connectStreamChatUser } from "@/lib/streamChat";

export default function DoctorVideoCallPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const [generateTokenForUser] = useGenerateTokenForUserMutation();

  const callId = params.get("callId")!;
  const patientId = params.get("patientId")!;
  const patientName = params.get("patientName") || "Patient";

  const [client, setClient] = useState<StreamVideoClient | null>(null);
  const [call, setCall] = useState<any>(null);
  const [waiting, setWaiting] = useState(true);
  const [duration, setDuration] = useState(0);

  const hasInit = useRef(false);
  const navigatedRef = useRef(false);

  // Always return to the chat page (once) when the call ends — never `back()`,
  // which can pop multiple entries and land on the dashboard / leave the app.
  const returnToChat = async () => {
    if (navigatedRef.current) return;
    navigatedRef.current = true;

    // Notify other participants (like mobile/nurse) via chat message that call has ended
    const chatInfo = getStreamChatInfo();
    const channelId = params.get("channelId");
    if (chatInfo && channelId) {
      try {
        const chatClient = getStreamChatClient();
        await connectStreamChatUser(
          chatInfo.chatUserId,
          chatInfo.chatUserName,
          user?.photoURL || "",
          chatInfo.chatUserToken
        );
        const channel = chatClient.channel("messaging", channelId);
        await channel.sendMessage({
          text: `📹 Video call ended`,
          call_id: callId,
          call_type: "video",
          call_status: "ended",
        } as any);
      } catch (chatErr) {
        console.error("Failed to send call ended chat message:", chatErr);
      }
    }

    router.replace("/doctor/message");
  };

  useEffect(() => {
    if (!user || hasInit.current) return;
    hasInit.current = true;

    const init = async () => {
      try {
        const res = await generateTokenForUser({ userId: user.uid }).unwrap();
        const token = res.videoToken || res.streamToken || res.token;

        const videoClient = getVideoClient(
          res.apiKey || "4g6sfwegs7he",
          {
            id: user.uid,
            name: user.displayName || "Doctor",
          },
          token
        );

        const streamCall = videoClient.call("default", callId);

        const callData = {
          members: [
            { user_id: user.uid },
            { user_id: patientId }
          ],
          custom: {
            callType: 'video',
            callerName: user.displayName || "Doctor",
            callerImage: user.photoURL || "",
            callerId: user.uid
          },
        };

        // If the call already exists (e.g. from a previous audio call in the same channel),
        // join({ create: true }) won't update the custom data. We must explicitly update it.
        await streamCall.join({ create: true, data: callData });
        await streamCall.update({ custom: callData.custom });

        await streamCall.ring();

        // Also send started invite in chat channel to notify mobile users
        const chatInfo = getStreamChatInfo();
        const channelId = params.get("channelId");
        if (chatInfo && channelId) {
          try {
            const chatClient = getStreamChatClient();
            await connectStreamChatUser(
              chatInfo.chatUserId,
              chatInfo.chatUserName,
              user.photoURL || "",
              chatInfo.chatUserToken
            );
            const channel = chatClient.channel("messaging", channelId);
            await channel.sendMessage({
              text: `📹 Video call started`,
              call_id: callId,
              call_type: "video",
              call_status: "initiated",
            } as any);
          } catch (chatErr) {
            console.error("Failed to send chat invite:", chatErr);
          }
        }

        streamCall.on("call.accepted", async () => {
          setWaiting(false);
          await streamCall.camera.enable();
          await streamCall.microphone.enable();
        });

        streamCall.on("call.ended", () => returnToChat());

        setClient(videoClient);
        setCall(streamCall);
      } catch (e: any) {
        console.error("STREAM ERROR:", e);
        toast.error(`Failed to start call: ${e?.message || 'Unknown error'}`);
        returnToChat();
      }
    };

    init();
  }, [user]);

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  //      CALL DURATION TIMER
  //   ---------------------------------- */
  useEffect(() => {
    if (!call || waiting) return;

    const interval = setInterval(() => {
      setDuration((d) => d + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [call, waiting]);

  const handleEnd = async () => {
    if (!call) return;
    try {
      await call.endCall();
    } catch (e) {
      // ignore — still return to chat
    }
    returnToChat();
  };

  if (!client || !call) {
    return <div className="h-screen flex items-center justify-center">Connecting…</div>;
  }

  return (
    <StreamVideo client={client}>
      <StreamCall call={call}>
        <StreamTheme>
          <VideoCallScreen
            patientName={patientName}
            onLeave={handleEnd}
            isWaitingForAcceptance={waiting}
            callDuration={duration}
            formatDuration={formatTime} />
        </StreamTheme>
      </StreamCall>
    </StreamVideo>
  );
}

