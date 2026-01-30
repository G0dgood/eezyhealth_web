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
import { getStreamChatInfo, storeStreamChatInfo } from "@/lib/streamChat";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useGenerateTokenForUserMutation } from "@/store/streamChatApi";
import { notifyMissedCall } from "@/utils/notifications";
import AudioCallScreen from "@/components/AudioCallScreen";
import { getVideoClient } from "@/lib/streamVideo";

export default function NurseAudioCallPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [generateTokenForUser] = useGenerateTokenForUserMutation();

  const patientName = searchParams.get("patientName") || "Patient";
  const patientId = searchParams.get("patientId");
  const callId = searchParams.get("callId");
  const channelId = searchParams.get("channelId");
  const bookingId = searchParams.get("bookingId");
  const isAccepting = searchParams.get("isAccepting") === "true";

  const [client, setClient] = useState<StreamVideoClient | null>(null);
  const [streamCall, setStreamCall] = useState<Call | null>(null);

  const [isCallAccepted, setIsCallAccepted] = useState(isAccepting);
  const [isWaitingForAcceptance, setIsWaitingForAcceptance] = useState(!isAccepting);

  const isCallEndedRef = useRef(false);
  const hasJoined = useRef(false);
  const hasRungRef = useRef(false);

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
              chatApiKey: "4g6sfwegs7he",
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
          members: patientId && user?.uid ? [{ user_id: user.uid }, { user_id: patientId }] : undefined,
          custom: {
            doctorName: user?.displayName || "Nurse",
            doctorPhoto: user?.photoURL || "",
            doctorPhotoUrl: user?.photoURL || "",
            callType: 'audio',
          }
        };

        if (!isAccepting) {
          await call.join({ create: true, data: callData });

          // Ensure patient is added BEFORE ringing
          if (patientId) {
            try {
              await call.updateCallMembers({
                update_members: [{ user_id: patientId }]
              });
            } catch (e) {
              console.warn("Update members failed, trying getOrCreate fallback...", e);
              await call.getOrCreate({
                data: { members: [{ user_id: user?.uid || "" }, { user_id: patientId }] }
              });
            }

            // Ring ONLY after member exists
            try {
              if (!hasRungRef.current) {
                console.log("Attempting to ring patient:", patientId);
                await call.ring();
                hasRungRef.current = true;
              }
            } catch (e) {
              console.error("Failed to ring call:", e);
            }
          }
        } else {
          await call.join();
        }

        // Enforce audio-only mode
        try {
          await call.camera.disable();
          await call.microphone.enable();
        } catch (e) {
          console.warn("Could not set audio-only mode", e);
        }

        setStreamCall(call);
      } catch (error) {
        console.error("Error joining call:", error);
        toast.error("Failed to join call");
        router.back();
      }
    };

    initCall();

    return () => {
      if (myCall && !isCallEndedRef.current) {
        myCall.leave();
      }
    };
  }, [client, callId, isAccepting, patientId, user]);

  const handleEndCall = async () => {
    isCallEndedRef.current = true;

    if (streamCall) {
      // Explicitly stop camera/mic
      try {
        await streamCall.camera.disable();
        await streamCall.microphone.disable();
      } catch (e) {
        console.warn("Failed to disable devices", e);
      }
    }

    if (isWaitingForAcceptance && patientId && streamCall) {
      notifyMissedCall({
        calleeId: patientId,
        callerName: user?.displayName || "Nurse",
        callId: callId || '',
        callType: 'audio',
      }).catch(err => console.error("Failed to notify missed call", err));
    }

    if (streamCall) {
      await streamCall.endCall();
    }
    router.back();
  };

  useEffect(() => {
    if (!streamCall) return;
    const unsubscribeAccepted = streamCall.on("call.accepted", () => {
      setIsCallAccepted(true);
      setIsWaitingForAcceptance(false);
    });
    const unsubscribeEnded = streamCall.on("call.ended", () => {
      toast.info("Call ended");
      router.back();
    });
    return () => {
      unsubscribeAccepted();
      unsubscribeEnded();
    };
  }, [streamCall, router]);


  if (!client || !streamCall) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <p>Initializing audio call...</p>
      </div>
    );
  }

  return (
    <StreamVideo client={client}>
      <StreamCall call={streamCall}>
        <StreamTheme>
          <div className="h-screen w-full bg-gray-900 text-white flex flex-col relative">
            <AudioCallScreen onLeave={handleEndCall} />

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
