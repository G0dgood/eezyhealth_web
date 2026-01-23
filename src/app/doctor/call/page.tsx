"use client";

import { useEffect, useState } from "react";
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
import { getStreamChatInfo } from "@/lib/streamChat";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// Wrapper component to handle the call logic once provider is set up
const CallScreenContent = () => {
  const router = useRouter();
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const videoClient = useStreamVideoClient();

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

  // Initialize Stream Chat
  useEffect(() => {
    const initializeChat = async () => {
      try {
        const chatInfo = getStreamChatInfo();
        if (!chatInfo) return;

        const { chatApiKey, chatUserId, chatUserToken } = chatInfo;
        const streamClient = StreamChat.getInstance(chatApiKey);

        if (!streamClient.userID) {
          await streamClient.connectUser(
            {
              id: chatUserId,
              name: "Doctor", // You might want to get actual name
            },
            chatUserToken
          );
        }

        setChatClient(streamClient);

        if (channelId) {
          const channel = streamClient.channel("messaging", channelId);
          await channel.watch();
          setChatChannel(channel);
        }
      } catch (error) {
        console.error("Error initializing chat:", error);
      }
    };

    initializeChat();
  }, [channelId]);

  // Handle outgoing call creation or incoming call acceptance
  useEffect(() => {
    let myCall: Call | undefined;

    if (!videoClient || !callId || !user) return;

    const setupCall = async () => {
      try {
        const call = videoClient.call("default", callId);
        myCall = call;
        
        if (!isAccepting) {
            // Initiate the call
            await call.getOrCreate({
                ring: true,
                data: {
                    members: [{ user_id: user.uid }, { user_id: callId }], // Assuming callId matches other user ID pattern or adjust
                    custom: {
                        bookingId: bookingId,
                        callerName: "Doctor",
                        callType: callType || 'video',
                    }
                }
            });
        } else {
            // Join existing call
            await call.join();
        }

        setStreamCall(call);
      } catch (error) {
        console.error("Error setting up call:", error);
        toast.error("Failed to start/join call");
      }
    };

    setupCall();

    return () => {
      if (myCall) {
        myCall.leave().catch((error) => console.error("Error leaving call:", error));
      }
    };
  }, [videoClient, callId, user, isAccepting, bookingId, callType, patientId]);

  // Listen for call acceptance (if we initiated)
  useEffect(() => {
    if (!streamCall || isAccepting) return;

    const unsubscribe = streamCall.on("call.accepted", () => {
      setIsWaitingForAcceptance(false);
      setIsCallAccepted(true);
    });

    return () => {
      unsubscribe();
    };
  }, [streamCall, isAccepting]);

  // Listen for chat messages (rejection/acceptance signals if sent via chat)
  useEffect(() => {
    if (!chatChannel) return;

    const handleNewMessage = (event: any) => {
      if (event.message.text === "Call Rejected") {
        toast.info("Patient rejected the call");
        router.back();
      }
    };

    chatChannel.on("message.new", handleNewMessage);

    return () => {
      chatChannel.off("message.new", handleNewMessage);
    };
  }, [chatChannel, router]);


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

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleEndCall = async () => {
      if (streamCall) {
          await streamCall.endCall();
      }
      router.back();
  };

  if (!streamCall) {
      return (
          <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
              <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                  <p>Initializing secure connection...</p>
              </div>
          </div>
      );
  }

  return (
    <StreamCall call={streamCall}>
      <div className="relative h-screen w-full bg-gray-900 overflow-hidden">
         {/* Custom Call UI Layout */}
         <div className="absolute inset-0">
             <StreamTheme>
                 <SpeakerLayout participantsBarPosition="bottom" />
                 <CallControls onLeave={handleEndCall} />
                 {/* <CallParticipantsList /> */}
             </StreamTheme>
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

         {/* Duration Indicator */}
         {isCallAccepted && (
             <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-mono z-40">
                 {formatDuration(callDuration)}
             </div>
         )}
      </div>
    </StreamCall>
  );
};

// Main Page Component that provides the StreamVideo provider
const DoctorCallPage = () => {
    const { user } = useAuth();
    const [client, setClient] = useState<StreamVideoClient | null>(null);

    useEffect(() => {
        const init = async () => {
            const chatInfo = getStreamChatInfo();
            if (!chatInfo || !user) return;

            const { chatApiKey, chatUserToken, chatUserId, chatUserName } = chatInfo;
            
            const _client = new StreamVideoClient({
                apiKey: chatApiKey,
                user: {
                    id: chatUserId,
                    name: user.displayName || chatUserName || "Doctor",
                    image: user.photoURL || undefined,
                },
                token: chatUserToken,
            });

            setClient(_client);
        };

        init();
    }, [user]);

    if (!client) return null;

    return (
        <StreamVideo client={client}>
            <CallScreenContent />
        </StreamVideo>
    );
};

export default DoctorCallPage;
