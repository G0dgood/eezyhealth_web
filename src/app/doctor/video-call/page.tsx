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
import { streamApiKey } from "@/lib/config";

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
  // Guard so effect cleanup doesn't call leave() after we've already ended/
  // navigated away (calling leave() again would re-trigger call.ended).
  const isCallEndedRef = useRef(false);

  // Always return to the chat page (once) when the call ends — never `back()`,
  // which can pop multiple entries and land on the dashboard / leave the app.
  const returnToChat = async () => {
    if (navigatedRef.current) return;
    navigatedRef.current = true;
    isCallEndedRef.current = true;

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

    // Return to the message page WITHOUT ?channelId=... in the URL.
    // The message page itself is responsible for re-opening the right
    // conversation from state; keeping the channelId out of the URL on
    // return means the browser back/forward stack doesn't carry the
    // stale ID after the call ends.
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
          res.apiKey || streamApiKey || "",
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
            callerId: user.uid,
            channelId: params.get("channelId") || ""
          },
        };

        // If the call already exists (e.g. from a previous audio call in the same channel),
        // join({ create: true }) won't update the custom data. We must explicitly update it.
        await streamCall.join({ create: true, data: callData });
        try {
          await streamCall.update({ custom: callData.custom });
        } catch (updateErr) {
          console.warn("Failed to update call details client-side (role permission limit):", updateErr);
        }

        const isAccepting = params.get("isAccepting") === "true";

        // 2. Ring and send started invite ONLY if we are NOT accepting an incoming call
        if (!isAccepting) {
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
        } else {
          // If we are accepting, send accepted message to chat channel
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
                text: `📹 Video call accepted`,
                call_id: callId,
                call_type: "video",
                call_status: "accepted",
              } as any);
            } catch (chatErr) {
              console.error("Failed to send accepted chat message:", chatErr);
            }
          }
        }

        streamCall.on("call.accepted", async () => {
          setWaiting(false);
          await streamCall.camera.enable();
          await streamCall.microphone.enable();
        });

        streamCall.on("call.ended", () => returnToChat());
        streamCall.on("call.rejected", () => returnToChat());

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
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900 text-white rounded-2xl overflow-hidden shadow-xl" style={{ height: "80vh" }}>
        Connecting…
      </div>
    );
  }

  return (
    <StreamVideo client={client}>
      <StreamCall call={call}>
        <StreamTheme>
          <div className="w-full rounded-2xl overflow-hidden shadow-xl" style={{ height: "80vh" }}>
            <VideoCallScreen
              patientName={patientName}
              onLeave={handleEnd}
              isWaitingForAcceptance={waiting}
              callDuration={duration}
              formatDuration={formatTime} />
          </div>
        </StreamTheme>
      </StreamCall>
    </StreamVideo>
  );
}

