"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  StreamVideo,
  StreamVideoClient,
  StreamCall,
  StreamTheme,
  Call,
} from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useGenerateTokenForUserMutation } from "@/store/streamChatApi";
import AudioCallScreen from "@/components/AudioCallScreen";
import { notifyMissedCall } from "@/utils/notifications";
import { getVideoClient } from "@/lib/streamVideo";
import { streamApiKey } from "@/lib/config";

import { getStreamChatInfo, getStreamChatClient, connectStreamChatUser } from "@/lib/streamChat";

export default function DoctorAudioCallPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const [generateTokenForUser] = useGenerateTokenForUserMutation();

  const callId = params.get("callId")!;
  const patientName = params.get("patientName") || "Patient";
  const isCaller = params.get("isCaller") === "true";
  const patientId = params.get("patientId");
  const isAccepting = params.get("isAccepting") === "true";

  const [client, setClient] = useState<StreamVideoClient | null>(null);
  const [call, setCall] = useState<any>(null);
  const [waiting, setWaiting] = useState(isCaller);
  const [duration, setDuration] = useState(0);
  const hasJoined = useRef(false);
  const hasRungRef = useRef(false);
  const navigatedRef = useRef(false);
  // When the user ends a call explicitly (or when call.ended fires), mark the
  // call as ended so the effect cleanup knows not to call leave() again —
  // which would re-fire call.ended and cause unexpected double-redirects.
  const isCallEndedRef = useRef(false);

  // Return to the chat page once when the call ends.
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
          text: `📞 Voice call ended`,
          call_id: callId,
          call_type: "voice",
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

  const handleCancelCall = async () => {
    if (call && patientId) {
      // 1. Explicitly stop camera/mic
      try {
        await call.camera.disable();
        await call.microphone.disable();
      } catch (e) {
        console.warn("Failed to disable devices", e);
      }

      // Notify missed call before ending only if call was not accepted yet
      if (waiting) {
        notifyMissedCall({
          calleeId: patientId,
          callerName: user?.displayName || "Doctor",
          callId,
          callType: 'audio',
          callerId: user?.uid,
        }).catch(err => console.error("Failed to notify missed call", err));
      }

      // Always try endCall() to terminate the call for ALL participants
      // (this ensures the patient / nurse side also ends when the doctor hangs
      // up). If endCall is rejected (permission) we still do returnToChat via
      // navigatedRef guard so the UI can't double-navigate.
      try {
        await call.endCall();
      } catch (e) {
        try {
          await call.leave();
        } catch (_) { /* swallow */ }
      }
    }

    // Always return to chat directly — even if endCall fired call.ended, the
    // navigatedRef inside returnToChat guards against double navigation so we
    // never re-enter / replace the chat route twice.
    returnToChat();
  };

  /* ----------------------------------
     INIT STREAM VIDEO CLIENT
  ---------------------------------- */
  useEffect(() => {
    if (!user) return;

    let videoClient: StreamVideoClient;

    const init = async () => {
      if (hasJoined.current) return;
      hasJoined.current = true;

      try {
        const response = await generateTokenForUser({ userId: user.uid }).unwrap();
        // Prefer videoToken if available, otherwise fallback to streamToken/token
        const token = response.videoToken || response.streamToken || response.token;
        const apiKey = response.apiKey || streamApiKey || "";

        if (!apiKey) {
          throw new Error("API Key is missing");
        }

        // Use singleton client
        videoClient = getVideoClient(
          apiKey,
          {
            id: user.uid,
            name: user.displayName || "Doctor",
            image: user.photoURL || undefined,
          },
          token
        );

        const streamCall = videoClient.call("default", callId);

        // 1. Join call as doctor
        const callData = {
          members: [{ user_id: user.uid }, { user_id: patientId! }],
          custom: {
            callType: 'audio',
            callerName: user.displayName || "Doctor",
            callerImage: user.photoURL || "",
            callerId: user.uid,
            channelId: params.get("channelId") || ""
          }
        };

        await streamCall.join({
          create: true,
          data: callData
        });

        // Explicitly update to overwrite any existing callType on this channel/callId
        try {
          await streamCall.update({ custom: callData.custom });
        } catch (updateErr) {
          console.warn("Failed to update call details client-side (role permission limit):", updateErr);
        }

        // 2. Ring and send started invite ONLY if we are NOT accepting an incoming call
        if (!isAccepting) {
          if (!hasRungRef.current) {
            await streamCall.ring();
            hasRungRef.current = true;
          }

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
                text: `📞 Call accepted`,
                call_id: callId,
                call_type: "voice",
                call_status: "accepted",
              } as any);
            } catch (chatErr) {
              console.error("Failed to send call accepted message:", chatErr);
            }
          }
        }

        // Audio mode: disable camera, enable mic
        try {
          await streamCall.camera.disable();
          await streamCall.microphone.enable();
        } catch (e) {
          console.warn("Could not set audio-only mode", e);
        }

        streamCall.on("call.accepted", () => setWaiting(false));
        streamCall.on("call.ended", () => returnToChat());
        streamCall.on("call.rejected", () => returnToChat());

        setClient(videoClient);
        setCall(streamCall);
      } catch (err: any) {
        console.error("STREAM ERROR:", err);
        toast.error(`Unable to start call: ${err?.message || 'Unknown error'}`);
        returnToChat();
      }
    };

    init();

    return () => {
      // Only cleanly leave if we have NOT already navigated away / ended the
      // call. If navigatedRef is set, endCall() / leave() already ran and the
      // route was replaced — calling leave() AGAIN here re-fires call.ended,
      // which calls returnToChat(), which can redirect unexpectedly on the
      // next page (the chat) if it had a listener set up.
      if (call && !navigatedRef.current && !isCallEndedRef.current) {
        call.leave().catch(() => { });
      }
      // Do NOT disconnect singleton client
      // videoClient?.disconnectUser(); 
    };
  }, [user, generateTokenForUser, callId, isCaller]);

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
      <div className="flex flex-col items-center justify-center bg-black text-white rounded-2xl overflow-hidden shadow-xl"
        style={{ height: "80vh" }}>
        Connecting…
      </div>
    );
  }

  return (
    <StreamVideo client={client}>
      <StreamCall call={call}>
        <StreamTheme>
          <div className="bg-black h-full rounded-2xl overflow-hidden shadow-xl" style={{ height: "80vh" }}>
            <AudioCallScreen
              name={patientName}
              isConnected={!waiting}
              duration={duration}
              onEnd={handleCancelCall}
              call={call}
            />
          </div>
        </StreamTheme>
      </StreamCall>
    </StreamVideo>
  );
}
