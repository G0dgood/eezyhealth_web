"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  StreamVideo,
  StreamCall,
  useStreamVideoClient,
  Call,
  StreamVideoClient,
  SpeakerLayout,
  CallControls,
  CallParticipantsList,
  StreamTheme,
} from "@stream-io/video-react-sdk";
import { StreamChat, Channel as StreamChannel } from "stream-chat";
import { getStreamChatInfo, storeStreamChatInfo } from "@/lib/streamChat";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useGenerateTokenForUserMutation, useCreateNurseProxyTokenMutation } from "@/store/streamChatApi";

// Wrapper component to handle the call logic once provider is set up
const CallScreenContent = ({ token }: { token?: string }) => {
  const router = useRouter();
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const videoClient = useStreamVideoClient();
  const [generateTokenForUser] = useGenerateTokenForUserMutation();

  const patientName = searchParams.get("patientName") || "Patient";
  const patientId = searchParams.get("patientId");
  const callId = searchParams.get("callId");
  const callType = searchParams.get("callType"); // 'video' or 'audio'
  const channelId = searchParams.get("channelId");
  const bookingId = searchParams.get("bookingId");
  const isAccepting = searchParams.get("isAccepting") === "true";

  const [callDuration, setCallDuration] = useState(0);
  const [isCallAccepted, setIsCallAccepted] = useState(isAccepting);
  const [isWaitingForAcceptance, setIsWaitingForAcceptance] = useState(!isAccepting);
  const [streamCall, setStreamCall] = useState<Call | null>(null);
  const [chatClient, setChatClient] = useState<StreamChat | null>(null);
  const [chatChannel, setChatChannel] = useState<StreamChannel | null>(null);
  const isCallEndedRef = useRef(false);
  const hasSentStartMessage = useRef(false);

  // Initialize Stream Chat (from user snippet)
  useEffect(() => {
    const initializeChat = async () => {
      try {
        let effectiveUserId = user?.uid;
        let effectiveToken = token;
        let effectiveName = user?.displayName || "Nurse";

        // 1. Prefer token passed from parent (Proxy Mode)
        const clientUser = (videoClient as any)?.state?.currentUser || (videoClient as any)?.user;
        if (token && clientUser?.id) {
          effectiveUserId = clientUser.id;
          effectiveName = clientUser.name || effectiveName;
        }
        // 2. Fallback to existing logic if no token passed
        else {
          let chatInfo = getStreamChatInfo();

          if (user && (!chatInfo || chatInfo.chatUserId !== user.uid)) {
            try {
              const tokenResponse = await generateTokenForUser({
                userId: user.uid,
              }).unwrap();

              const streamToken = tokenResponse.streamToken || tokenResponse.token;
              if (streamToken) {
                chatInfo = {
                  chatApiKey: "4g6sfwegs7he",
                  chatUserId: user.uid,
                  chatUserName: user.displayName || "Patient",
                  chatUserToken: streamToken,
                  userRole: 'patient',
                };
                storeStreamChatInfo(chatInfo);
              }
            } catch (err) {
              console.error("Failed to generate stream token:", err);
            }
          }

          if (chatInfo) {
            effectiveUserId = chatInfo.chatUserId;
            effectiveToken = chatInfo.chatUserToken;
          }
        }

        if (!effectiveToken || !effectiveUserId) return;

        const chatApiKey = "4g6sfwegs7he";
        // Use a new instance to avoid singleton state issues
        const streamClient = new StreamChat(chatApiKey);

        // Ensure we are connected before using the client
        const connectPromise = async () => {
          // If we are acting as proxy (patientId present) but have no token yet, wait.
          // This prevents falling back to Nurse user which causes permission errors.
          if (patientId && !token) {
            return false;
          }

          if (streamClient.userID) {
            await streamClient.disconnectUser();
          }

          await streamClient.connectUser(
            {
              id: effectiveUserId,
              name: effectiveName,
            },
            effectiveToken
          );
          return true;
        };

        const connected = await connectPromise();
        if (!connected) return;

        setChatClient(streamClient);

        if (channelId) {
          const channel = streamClient.channel("messaging", channelId);
          // Only watch if we are sure the client is connected
          if (streamClient.userID) {
            await channel.watch();
            setChatChannel(channel);
          }
        }
      } catch (error) {
        console.error("Error initializing chat:", error);
      }
    };

    initializeChat();

    return () => {
      // Cleanup local instance
      setChatClient((prevClient) => {
        if (prevClient) prevClient.disconnectUser();
        return null;
      });
    };
  }, [channelId, user, generateTokenForUser, token, videoClient, patientId]);

  // Initialize Call
  useEffect(() => {
    let myCall: Call | undefined;

    const initCall = async () => {
      if (!videoClient || !callId) return;

      const call = videoClient.call("default", callId);
      myCall = call;

      try {
        const callData = {
          members: patientId && user?.uid ? [{ user_id: user.uid }, { user_id: patientId }] : undefined,
          custom: {
            doctorName: user?.displayName || "Nurse",
            doctorPhoto: user?.photoURL || "",
            doctorPhotoUrl: user?.photoURL || "",
          }
        };

        if (!isAccepting) {
          await call.join({ create: true, data: callData });
        } else {
          await call.join();
        }
        setStreamCall(call);
      } catch (error) {
        console.error("Error joining call:", error);
        toast.error("Failed to join call");
      }
    };

    initCall();

    return () => {
      if (myCall && !isCallEndedRef.current) {
        myCall.leave().catch((error) => {
          console.error("Error leaving call on cleanup:", error);
        });
      }
    };
  }, [videoClient, callId, isAccepting, user?.displayName, user?.photoURL]);

  useEffect(() => {
    const sendStartMessage = async () => {
      if (
        streamCall &&
        chatChannel &&
        !isAccepting &&
        !hasSentStartMessage.current &&
        callId
      ) {
        hasSentStartMessage.current = true;
        try {
          await chatChannel.sendMessage({
            text: `${callType === "video" ? "📹" : "📞"} Call started`,
            custom: {
              call_id: callId,
              booking_id: bookingId,
              call_type: callType,
              call_status: "started"
            }
          } as any);
        } catch (error) {
          console.error("Error sending start call message:", error);
        }
      }
    };

    sendStartMessage();
  }, [streamCall, chatChannel, isAccepting, callId, bookingId, callType]);

  // Timer for duration
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isCallAccepted) {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isCallAccepted]);

  const handleEndCall = async () => {
    isCallEndedRef.current = true;
    if (streamCall) {
      try {
        await streamCall.endCall();
      } catch (error) {
        console.error("Error ending call:", error);
      }
    }

    // Send call end message
    if (chatChannel && callId) {
      try {
        await chatChannel.sendMessage({
          text: `${callType === "video" ? "📹" : "📞"} Call ended`,
          custom: {
            call_id: callId,
            booking_id: bookingId,
            call_type: callType,
            call_status: "ended"
          }
        } as any);
      } catch (error) {
        console.error("Error sending end call message:", error);
      }
    }

    router.back();
  };

  // Listen for call status updates via chat
  useEffect(() => {
    if (!chatChannel || !chatClient) return;

    const handleMessage = (event: any) => {
      const message = event.message;
      const msgCallId = message?.call_id || message?.custom?.call_id;
      const msgCallStatus = message?.call_status || message?.custom?.call_status;

      if (
        msgCallId === callId &&
        message?.user?.id !== chatClient?.userID
      ) {
        if (msgCallStatus === "accepted") {
          setIsCallAccepted(true);
          setIsWaitingForAcceptance(false);
        }

        if (msgCallStatus === "ended") {
          toast.info(`${patientName} has ended the call.`);
          router.back();
        }

        if (msgCallStatus === "declined") {
          toast.info(`${patientName} declined the call.`);
          router.back();
        }
      }
    };

    chatChannel.on("message.new", handleMessage);

    return () => {
      chatChannel.off("message.new", handleMessage);
    };
  }, [chatChannel, callId, chatClient?.userID, patientName, router]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (!streamCall) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <p>Initializing call...</p>
      </div>
    );
  }

  return (
    <StreamCall call={streamCall}>
      <StreamTheme>
        <div className="h-screen w-full bg-gray-900 text-white flex flex-col relative">
          {/* Header / Info */}
          <div className="absolute top-0 left-0 right-0 p-4 z-10 flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent">
            <div>
              <h2 className="text-xl font-bold">{patientName}</h2>
              <p className="text-[10px] md:text-[12px] opacity-80">{isWaitingForAcceptance ? "Calling..." : formatDuration(callDuration)}</p>
            </div>
          </div>

          {/* Main Video Area */}
          <div className="flex-1 flex items-center justify-center">
            <SpeakerLayout participantsBarPosition="bottom" />
          </div>

          {/* Controls */}
          <div className="pb-8">
            <CallControls onLeave={handleEndCall} />
          </div>

          {/* Overlay for Waiting State */}
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
  );
};

export default function NurseCallPage() {
  const [client, setClient] = useState<StreamVideoClient | null>(null);
  const { user } = useAuth();
  const router = useRouter();
  const [generateTokenForUser] = useGenerateTokenForUserMutation();

  useEffect(() => {
    let _client: StreamVideoClient | null = null;

    const init = async () => {
      let chatInfo = getStreamChatInfo();

      // If chatInfo is missing or belongs to a different user, generate a new token
      if (user && (!chatInfo || chatInfo.chatUserId !== user.uid)) {
        console.log("Chat info mismatch or missing in call page, generating new token for", user.uid);
        try {
          const tokenResponse = await generateTokenForUser({
            userId: user.uid,
          }).unwrap();

          const streamToken = tokenResponse.streamToken || tokenResponse.token;
          if (streamToken) {
            chatInfo = {
              chatApiKey: "4g6sfwegs7he", // Should ideally come from env or config
              chatUserId: user.uid,
              chatUserName: user.displayName || "Nurse",
              chatUserToken: streamToken,
              userRole: 'nurse',
            };
            storeStreamChatInfo(chatInfo);
          }
        } catch (err) {
          console.error("Failed to generate stream token:", err);
        }
      }

      if (!chatInfo || !user) {
        console.error("Missing chat info or user");
        // router.push("/nurse/login"); // Or handle error
        return;
      }

      // We don't initialize client here if we want to rely on provider, 
      // but the NurseCallPage seems to be standalone or needs to handle its own client?
      // Based on the code structure, it seems we are initializing client here.

      const apiKey = "4g6sfwegs7he";
      const token = chatInfo.chatUserToken;
      const userId = chatInfo.chatUserId;
      const userName = chatInfo.chatUserName;
      const userImage = user.photoURL || undefined;

      const userObj = {
        id: userId,
        name: userName,
        image: userImage,
      };

      _client = new StreamVideoClient({ apiKey, user: userObj, token });
      await _client.connectUser(userObj, token);

      setClient(_client);
    };

    init();

    return () => {
      if (_client) {
        _client.disconnectUser();
      }
    };
  }, [user, generateTokenForUser]);

  if (!client) return (
    <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
      <p>Initializing video client...</p>
    </div>
  );

  return (
    <StreamVideo client={client}>
      <CallScreenContent />
    </StreamVideo>
  );
}
