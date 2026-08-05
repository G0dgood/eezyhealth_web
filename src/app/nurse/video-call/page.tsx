"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  StreamVideo,
  StreamCall,
  Call,
  StreamVideoClient,
  StreamTheme,
} from "@stream-io/video-react-sdk";
import { getStreamChatInfo, storeStreamChatInfo, getStreamChatClient, connectStreamChatUser } from "@/lib/streamChat";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useGenerateTokenForUserMutation } from "@/store/streamChatApi";
import { notifyMissedCall } from "@/utils/notifications";
import VideoCallScreen from "@/components/VideoCallScreen";
import { getVideoClient } from "@/lib/streamVideo";
import { streamApiKey } from "@/lib/config";

export default function NurseVideoCallPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [generateTokenForUser] = useGenerateTokenForUserMutation();

  const patientName = searchParams.get("patientName") || "Patient";
  const patientId = searchParams.get("patientId");
  const callId = searchParams.get("callId");
  const isAccepting = searchParams.get("isAccepting") === "true";

  const [client, setClient] = useState<StreamVideoClient | null>(null);
  const [streamCall, setStreamCall] = useState<Call | null>(null);

  const [callDuration, setCallDuration] = useState(0);
  const [isCallAccepted, setIsCallAccepted] = useState(isAccepting);
  const [isWaitingForAcceptance, setIsWaitingForAcceptance] = useState(!isAccepting);

  const isCallEndedRef = useRef(false);
  const hasJoined = useRef(false);
  const hasRungRef = useRef(false);
  // Guards against double-navigation when user ends via button AND the call
  // event fires call.ended / call.rejected which would otherwise navigate a
  // second time and pop us past the chat onto the list/dashboard.
  const navigatedRef = useRef(false);

  // Return directly to the chat — never back() which can pop multiple stack
  // entries and land on the dashboard or messages list.
  const returnToChat = async () => {
    if (navigatedRef.current) return;
    navigatedRef.current = true;
    isCallEndedRef.current = true;

    // Send call ended message to chat channel (guarded so we don't send twice)
    if (callId && user) {
      try {
        const chatInfo = getStreamChatInfo();
        if (chatInfo) {
          const chatClient = getStreamChatClient();
          await connectStreamChatUser(
            chatInfo.chatUserId,
            chatInfo.chatUserName,
            user.photoURL || "",
            chatInfo.chatUserToken
          );
          const channel = chatClient.channel("messaging", callId);
          await channel.sendMessage({
            text: `📹 Video call ended`,
            call_id: callId,
            call_type: "video",
            call_status: "ended",
          } as any);
        }
      } catch (chatErr) {
        console.error("Failed to send call ended chat message:", chatErr);
      }
    }

    // Return to the message page WITHOUT ?channelId=... in the URL.
    // The message page itself is responsible for re-opening the right
    // conversation from state; keeping the channelId out of the URL on
    // return means the browser back/forward stack doesn't carry the
    // stale ID after the call ends.
    router.replace("/nurse/message");
  };

  // 1. Initialize Video Client
  useEffect(() => {
    if (!user) return;
    let _client: StreamVideoClient | null = null;

    const initClient = async () => {
      try {
        let chatInfo = getStreamChatInfo();

        if (!chatInfo || chatInfo.chatUserId !== user.uid) {
          const tokenResponse = await generateTokenForUser({ userId: user.uid }).unwrap();
          const streamToken = tokenResponse.streamToken || tokenResponse.token;
          if (streamToken) {
            chatInfo = {
              chatApiKey: streamApiKey || "",
              chatUserId: user.uid,
              chatUserName: user.displayName || "Nurse",
              chatUserToken: streamToken,
              userRole: 'nurse',
            };
            storeStreamChatInfo(chatInfo);
          }
        }

        if (chatInfo) {
          // Use singleton client
          _client = getVideoClient(
            chatInfo.chatApiKey,
            {
              id: chatInfo.chatUserId,
              name: chatInfo.chatUserName,
              image: user.photoURL || undefined,
            },
            chatInfo.chatUserToken
          );
          setClient(_client);
        }
      } catch (err) {
        console.error("Failed to init video client:", err);
      }
    };

    initClient();

    return () => {
      // Do NOT disconnect singleton client
      // if (_client) _client.disconnectUser();
    };
  }, [user, generateTokenForUser]);

  // 2. Initialize Call
  useEffect(() => {
    if (!client || !callId || hasJoined.current) return;

    let myCall: Call | undefined;

    const initCall = async () => {
      if (!user) return;
      hasJoined.current = true;
      const call = client.call("default", callId);
      myCall = call;

      try {
        const callData = {
          members: patientId && user?.uid ? [{ user_id: user?.uid || "" }, { user_id: patientId }] : undefined,
          custom: {
            doctorName: user?.displayName || "Nurse",
            doctorPhoto: user?.photoURL || "",
            doctorPhotoUrl: user?.photoURL || "",
            callType: 'video',
          }
        };

        //  JOIN first to ensure we are part of the call object
        await call.join({ create: true, data: callData });

        //  ACCEPT SECOND (this requires we are already added as member from join)
        if (searchParams.get("isAccepting") === "true") {
          try {
            await call.accept();
            // Send accepted message to chat channel
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
                  text: `📹 Video call accepted`,
                  call_id: callId,
                  call_type: "video",
                  call_status: "accepted",
                } as any);
              }
            } catch (chatErr) {
              console.error("Failed to send accepted chat message:", chatErr);
            }
          } catch (e) {
            console.warn("Accept call failed (non-fatal if already joined/accepted):", e);
          }
        }

        //  Enable media
        try {
          await call.camera.enable();
          await call.microphone.enable();
        } catch (e) {
          console.warn("Could not enable camera/mic", e);
        }

        setStreamCall(call);
      } catch (error) {
        console.error("Error joining call:", error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        toast.error(`Failed to join call: ${errorMessage}`);
        returnToChat();
      }
    };

    initCall();

    return () => {
      if (myCall && !isCallEndedRef.current) {
        myCall.leave().catch(err => {
          console.warn("Failed to leave call:", err);
        });
      }
    };
  }, [client, callId, isAccepting, patientId, user]);

  const handleEndCall = async () => {
    isCallEndedRef.current = true;

    if (streamCall) {
      try {
        await streamCall.camera.disable();
        await streamCall.microphone.disable();
      } catch (e) {
        console.warn("Failed to disable devices", e);
        const errorMessage = e instanceof Error ? e.message : String(e);
        toast.error(`Failed to disable devices: ${errorMessage}`);
      }
    }

    if (isWaitingForAcceptance && patientId && streamCall) {
      notifyMissedCall({
        calleeId: patientId,
        callerName: user?.displayName || "Nurse",
        callId: callId || '',
        callType: 'video',
      }).catch(err => {
        console.error("Failed to notify missed call", err);
        const errorMessage = err instanceof Error ? err.message : String(err);
        toast.error(`Failed to notify missed call: ${errorMessage}`);
      });
    }

    if (streamCall) {
      try {
        await streamCall.endCall();
      } catch (e) {
        console.error("Failed to end call", e);
        const errorMessage = e instanceof Error ? e.message : String(e);
        toast.error(`Failed to end call: ${errorMessage}`);
      }
    }

    // Send message + navigation are handled in returnToChat (dedup guarded so they only
    // run once even if call.ended fires right after endCall() resolves.
    returnToChat();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isCallAccepted) {
      interval = setInterval(() => setCallDuration(p => p + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isCallAccepted]);

  // Auto-cancel timeout
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isWaitingForAcceptance) {
      timeout = setTimeout(() => {
        toast.info("No answer, call timed out.");
        handleEndCall();
      }, 45000); // 45s timeout
    }
    return () => clearTimeout(timeout);
  }, [isWaitingForAcceptance, handleEndCall]);

  useEffect(() => {
    if (!streamCall) return;
    const unsubscribeAccepted = streamCall.on("call.accepted", () => {
      setIsCallAccepted(true);
      setIsWaitingForAcceptance(false);
    });
    const unsubscribeEnded = streamCall.on("call.ended", () => {
      toast.info("Call ended");
      returnToChat();
    });
    const unsubscribeRejected = streamCall.on("call.rejected", () => {
      toast.info("Call declined");
      returnToChat();
    });
    return () => {
      unsubscribeAccepted();
      unsubscribeEnded();
      unsubscribeRejected();
    };
  }, [streamCall, router]);

  if (!client || !streamCall) {
    return (
      <div className="flex items-center justify-center bg-gray-900 text-white rounded-2xl overflow-hidden shadow-xl" style={{ height: "80vh" }}>
        <p>Initializing video call...</p>
      </div>
    );
  }

  return (
    <StreamVideo client={client}>
      <StreamCall call={streamCall}>
        <StreamTheme>
          <div className="w-full bg-gray-900 text-white flex flex-col relative rounded-2xl overflow-hidden shadow-xl" style={{ height: "80vh" }}>
            <VideoCallScreen
              onLeave={handleEndCall}
              patientName={patientName}
              callDuration={callDuration}
              isWaitingForAcceptance={isWaitingForAcceptance}
              formatDuration={formatDuration}
            />

            {isWaitingForAcceptance && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-50">
                <div className="text-center text-white">
                  <div className="w-24 h-24 bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl">
                    {patientName.charAt(0)}
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Calling {patientName}...</h2>
                  <p className="text-gray-400 animate-pulse">Waiting for answer</p>

                  <button
                    onClick={handleEndCall}
                    className="mt-8 bg-red-500 hover:bg-red-600 text-white rounded-full p-4"
                  >
                    End Call
                  </button>
                </div>
              </div>
            )}
          </div>
        </StreamTheme>
      </StreamCall>
    </StreamVideo>
  );
}

