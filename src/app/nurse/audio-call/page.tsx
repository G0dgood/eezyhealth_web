"use client";

import { useEffect, useState, useRef } from "react";
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
import { getVideoClient } from "@/lib/streamVideo";
import { getStreamChatInfo, getStreamChatClient, connectStreamChatUser } from "@/lib/streamChat";
import { notifyMissedCall } from "@/utils/notifications";
import AudioCallScreen from "@/components/AudioCallScreen";
import { toast } from "sonner";
import { streamApiKey } from "@/lib/config";

export default function NurseAudioCallPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [generateTokenForUser] = useGenerateTokenForUserMutation();

  const callId = searchParams.get("callId") || "";
  const patientName = searchParams.get("patientName") || "Patient";
  const isCaller = searchParams.get("isCaller") === "true";
  const patientId = searchParams.get("patientId");
  const isAccepting = searchParams.get("isAccepting") === "true";

  const [client, setClient] = useState<StreamVideoClient | null>(null);
  const [call, setCall] = useState<any>(null);
  const [waiting, setWaiting] = useState(isCaller);
  const [duration, setDuration] = useState(0);

  const hasJoined = useRef(false);
  const hasRungRef = useRef(false);
  const navigatedRef = useRef(false);

  // Return to the chat page once when the call ends.
  const returnToChat = async () => {
    if (navigatedRef.current) return;
    navigatedRef.current = true;

    // Notify other participants (like mobile/nurse) via chat message that call has ended
    const chatInfo = getStreamChatInfo();
    const channelId = searchParams.get("channelId");
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
          text: `📞 Voice call ended`,
          call_id: callId,
          call_type: "voice",
          call_status: "ended",
        } as any);
      } catch (chatErr) {
        console.error("Failed to send call ended chat message:", chatErr);
      }
    }

    // Return to the exact chat we came from (not the chat list), mirroring mobile.
    const returnChannelId = searchParams.get("channelId");
    router.replace(
      returnChannelId
        ? `/nurse/message?channelId=${encodeURIComponent(returnChannelId)}`
        : "/nurse/message"
    );
  };

  const handleCancelCall = async () => {
    if (call) {
      // 1. Explicitly stop camera/mic
      try {
        await call.camera.disable();
        await call.microphone.disable();
      } catch (e) {
        console.warn("Failed to disable devices", e);
      }

      // Notify missed call before ending only if call was not accepted yet
      if (waiting && patientId) {
        notifyMissedCall({
          calleeId: patientId,
          callerName: user?.displayName || "Nurse",
          callId,
          callType: 'audio',
          callerId: user?.uid,
        }).catch(err => console.error("Failed to notify missed call", err));
      }
      try {
        await call.endCall();
      } catch (e) {
        // ignore
      }
    }
    returnToChat();
  };

  /* ----------------------------------
     INIT STREAM VIDEO CLIENT
  ---------------------------------- */
  useEffect(() => {
    if (!user || !callId || hasJoined.current) return;
    hasJoined.current = true;

    const init = async () => {
      try {
        const response = await generateTokenForUser({ userId: user.uid }).unwrap();
        const token = response.videoToken || response.streamToken || response.token;
        const apiKey = response.apiKey || streamApiKey || process.env.NEXT_PUBLIC_STREAM_API_KEY!;

        const videoClient = getVideoClient(
          apiKey,
          { id: user.uid, name: user.displayName || "Nurse", image: user.photoURL || undefined },
          token
        );

        const streamCall = videoClient.call("default", callId);

        // Ensure we join the call properly with members before trying to accept
        const callData = {
          members: patientId ? [{ user_id: user.uid }, { user_id: patientId }] : [{ user_id: user.uid }],
          custom: {
            callType: 'audio',
            callerName: user.displayName || "Nurse",
            callerImage: user.photoURL || "",
            callerId: user.uid,
            channelId: searchParams.get("channelId") || ""
          }
        };

        await streamCall.join({ create: true, data: callData });
        await streamCall.update({ custom: callData.custom });

        // Ring and send started invite ONLY if we are NOT accepting an incoming call
        if (!isAccepting) {
          if (!hasRungRef.current) {
            await streamCall.ring();
            hasRungRef.current = true;
          }

          // Also send started invite in chat channel to notify mobile users
          const chatInfo = getStreamChatInfo();
          const channelId = searchParams.get("channelId");
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
                text: `📞 Voice call started`,
                call_id: callId,
                call_type: "voice",
                call_status: "initiated",
              } as any);
            } catch (chatErr) {
              console.error("Failed to send chat invite:", chatErr);
            }
          }
        } else {
          // Only accept if we are responding to an incoming call
          await streamCall.accept();
          try {
            const chatInfo = getStreamChatInfo();
            if (chatInfo && user) {
              const chatClient = getStreamChatClient();
              await connectStreamChatUser(
                chatInfo.chatUserId,
                chatInfo.chatUserName,
                user.photoURL || "",
                chatInfo.chatUserToken
              );
              const channel = chatClient.channel("messaging", callId);
              await channel.sendMessage({
                text: `📞 Call accepted`,
                call_id: callId,
                call_type: "voice",
                call_status: "accepted",
              } as any);
            }
          } catch (chatErr) {
            console.error("Failed to send accepted chat message:", chatErr);
          }
        }

        await streamCall.microphone.enable();
        await streamCall.camera.disable();

        streamCall.on("call.accepted", () => setWaiting(false));
        streamCall.on("call.ended", () => returnToChat());
        streamCall.on("call.rejected", () => returnToChat());

        setClient(videoClient);
        setCall(streamCall);
      } catch (e: any) {
        console.error("Error joining audio call as nurse:", e);
        toast.error(`Unable to start call: ${e?.message || 'Unknown error'}`);
        returnToChat();
      }
    };

    init();
  }, [user, callId, generateTokenForUser]);

  /* ----------------------------------
     AUTO-CANCEL TIMEOUT
  ---------------------------------- */
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (waiting) {
      timeout = setTimeout(() => {
        toast.info("No answer, call timed out.");
        handleCancelCall();
      }, 45000); // 45s timeout
    }
    return () => clearTimeout(timeout);
  }, [waiting, handleCancelCall]);

  /* ----------------------------------
     CALL DURATION TIMER
  ---------------------------------- */
  useEffect(() => {
    if (!call || waiting) return;

    const interval = setInterval(() => {
      setDuration((d) => d + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [call, waiting]);

  if (!client || !call) {
    return (
      <div className="h-screen bg-black text-white flex items-center justify-center">
        <h2>Connecting...</h2>
      </div>
    );
  }

  return (
    <StreamVideo client={client}>
      <StreamCall call={call}>
        <StreamTheme>
          <div className="h-screen bg-black text-white flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md h-[80vh]">
              <AudioCallScreen
                name={patientName}
                isConnected={!waiting}
                duration={duration}
                onEnd={handleCancelCall}
                call={call}
              />
            </div>
          </div>
        </StreamTheme>
      </StreamCall>
    </StreamVideo>
  );
}
