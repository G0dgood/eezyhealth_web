"use client";

import { useState, useEffect, useMemo } from "react";
import { Video, Phone, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import ConversationList, { PatientData } from "@/components/nurse/ConversationList";
import { useAuth } from "@/contexts/AuthContext";
import { showError, showInfo } from "@/utils/toast";
import { useGetFirebaseBookingsQuery } from "@/store/bookingApi";
import { useGenerateTokenForUserMutation, useAddMemberToChannelMutation } from "@/store/streamChatApi";
import { useNurseChat } from "@/hooks/useNurseChat";
import IncomingCallModal from "@/components/IncomingCallModal";
import { StreamChat, Channel as StreamChannel } from 'stream-chat';
import { StreamVideoClient, Call } from "@stream-io/video-react-sdk";
import {
  Chat,
  Channel,
  Window,
  ChannelHeader,
  MessageList,
  MessageInput,
  Thread,
  LoadingIndicator
} from 'stream-chat-react';
import 'stream-chat-react/dist/css/v2/index.css';
import '../../stream-chat.css';
import { getStreamChatInfo, storeStreamChatInfo } from "@/lib/streamChat";

export default function NurseMessagePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [generateTokenForUser] = useGenerateTokenForUserMutation();
  const [addMemberToChannel] = useAddMemberToChannelMutation();
  const { connectAsPatient } = useNurseChat();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);

  // Stream Chat states
  const [chatClient, setChatClient] = useState<StreamChat | null>(null);
  const [activeChannel, setActiveChannel] = useState<StreamChannel | null>(null);
  const [videoClient, setVideoClient] = useState<StreamVideoClient | null>(null);
  const [incomingCall, setIncomingCall] = useState<Call | null>(null);

  // Fetch bookings using RTK Query
  // Use undefined or a stable object to prevent infinite re-renders if passing new object literal
  const { data: bookingsData, error, isLoading } = useGetFirebaseBookingsQuery(undefined);

  // Show error toast when there's an error
  useEffect(() => {
    if (error) {
      showError("Error", "Failed to load bookings. Please try again.");
    }
  }, [error]);
  console.log('bookingsData', bookingsData)

  // Map bookings to patients, ensuring uniqueness
  const uniquePatients: PatientData[] = useMemo(() => {
    if (!bookingsData) return [];

    // Sort bookings by created time descending (Newest first) to prioritize latest messages
    const sortedBookings = [...bookingsData].sort((a: any, b: any) => {
      const dateA = new Date(a.createdAt || a.createdTime || a.bookingDate || 0).getTime();
      const dateB = new Date(b.createdAt || b.createdTime || b.bookingDate || 0).getTime();
      return dateB - dateA;
    });

    const uniqueMap = new Map();

    sortedBookings.forEach((booking: any) => {
      // Create a composite key to allow same patient with different doctors
      const compositeKey = `${booking.userId}-${booking.doctorId}`;

      if (booking.userId && booking.doctorId && !uniqueMap.has(compositeKey)) {
        uniqueMap.set(compositeKey, {
          id: compositeKey, // Use composite key as ID
          uid: booking.userId,
          patientName: booking.patientName || booking.first_name || "Unknown Patient",
          originalName: booking.patientName || booking.first_name || "Unknown Patient",
          photo_url: booking.photo_url || booking.patientImage,
          patientPhotoUrl: booking.patientPhotoUrl,
          lastMessage: booking.consultationReason || booking.reason || "No messages yet",
          isOnline: booking.isOnline || false,
          timestamp: booking.bookingDate || booking.date || "",
          bookingId: booking.bookingId, // Add bookingId for channel creation
          doctorId: booking.doctorId, // Add doctorId
          doctorName: booking.doctorName || "Doctor",
          doctorPhotoUrl: booking.doctorPhotoUrl,
          doctorPhoto: booking.doctorPhoto,
        });
      }
    });

    // Sort final list by newest timestamp first
    return Array.from(uniqueMap.values()).sort((a: any, b: any) => {
      const dateA = new Date(a.timestamp || 0).getTime();
      const dateB = new Date(b.timestamp || 0).getTime();
      return dateB - dateA;
    });
  }, [bookingsData]);

  // Filter patients based on search term
  const filteredPatients = useMemo(() => uniquePatients.filter(patient =>
    patient.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.doctorName?.toLowerCase().includes(searchTerm.toLowerCase())
  ), [uniquePatients, searchTerm]);

  // Initialize Stream Chat client
  useEffect(() => {
    const initChat = async () => {
      try {
        let chatInfo = getStreamChatInfo();

        // If chatInfo is missing or belongs to a different user, generate a new token
        if (user && (!chatInfo || chatInfo.chatUserId !== user.uid)) {
          try {
            const tokenResponse = await generateTokenForUser({
              userId: user.uid,
            }).unwrap();

            const streamToken = tokenResponse.streamToken || tokenResponse.token;
            if (streamToken) {
              chatInfo = {
                chatApiKey: "4g6sfwegs7he", // Should ideally come from env or config
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

        if (!chatInfo || !user) {
          return;
        }

        const client = StreamChat.getInstance(chatInfo.chatApiKey);

        if (!client.userID || client.userID !== chatInfo.chatUserId) {
          // Disconnect if connected as someone else
          if (client.userID) await client.disconnectUser();

          await client.connectUser(
            {
              id: chatInfo.chatUserId,
              name: user.displayName || chatInfo.chatUserName || "Patient",
              image: user.photoURL || undefined,
              role: "patient",
            },
            chatInfo.chatUserToken
          );
        }

        setChatClient(client);
      } catch (error) {
        console.error("Error connecting to Stream Chat:", error);
      }
    };

    initChat();

    return () => {
      // Don't disconnect here to keep connection alive for other pages, 
      // or handle carefully. Usually fine to disconnect on unmount.
      if (chatClient) {
        // chatClient.disconnectUser(); 
      }
    };
  }, [user, generateTokenForUser]);

  // Handle patient selection and channel creation
  const handlePatientSelect = async (patient: PatientData) => {
    setSelectedConversation(patient.id);

    if (!chatClient || !user) {
      showError("Error", "Chat not initialized. Please login again.");
      return;
    }

    // Determine the other user's ID (patient's ID)
    const otherUserId = patient.uid || patient.id;

    if (!otherUserId) {
      showError("Error", "Cannot start chat: Invalid patient ID");
      return;
    }

    // Use Nurse Proxy Logic to connect as patient
    try {
      showInfo("Connecting to chat...", "Please wait while we establish a secure connection.");
      // Use 'any' cast if TS complains about the return type change not being picked up yet
      const result = await connectAsPatient(otherUserId) as any;
      const proxyClient = result.chatClient || result; // Fallback for safety
      const token = result.token;
      const userId = result.userId;
      const isProxy = result.isProxy !== false; // Default to true if undefined

      if (!proxyClient) {
        throw new Error("Failed to initialize proxy client");
      }

      setChatClient(proxyClient);

      // Initialize Video Client for Patient to receive calls
      // ONLY if acting as proxy (if acting as Nurse, we use the Nurse's video client from CallPage context or similar)
      if (isProxy && token && userId) {
        if (videoClient) await videoClient.disconnectUser();

        const _videoClient = new StreamVideoClient({
          apiKey: "4g6sfwegs7he",
          user: {
            id: userId,
            name: patient.patientName || "Patient",
            image: patient.photo_url,
          },
          token,
        });

        // Explicitly connect user to ensure we receive events without the Provider
        await _videoClient.connectUser(
          {
            id: userId,
            name: patient.patientName || "Patient",
            image: patient.photo_url,
          },
          token
        );

        setVideoClient(_videoClient);
      }

      // Create/Get channel using composite ID (patientId-doctorId)
      if (otherUserId && patient.doctorId) {
        const channelId = `${otherUserId}-${patient.doctorId}`;

        let channel;

        if (isProxy) {
          // Proxy Mode: We ARE the patient
          const members = [proxyClient.userID!, patient.doctorId];
          channel = proxyClient.channel('messaging', channelId, {
            members,
          });
        } else {
          // Fallback Mode: We are the Nurse
          // Try to join the existing channel
          try {
            // Attempt to add ourselves to the channel via backend
            await addMemberToChannel({
              channelId,
              userId: proxyClient.userID!,
              type: 'messaging',
              doctorId: patient.doctorId
            }).unwrap();
          } catch (addErr) {
            console.warn("Failed to add nurse to channel, trying to watch anyway...", addErr);
          }

          // Watch the channel without asserting members (assumes we are now a member)
          channel = proxyClient.channel('messaging', channelId, {
            image: patient.doctorPhotoUrl || patient.doctorPhoto
          });
        }

        await channel.watch();
        setActiveChannel(channel);
        return;
      } else {
        // Fallback if no booking ID (shouldn't happen given data structure)
        // Try to find a channel between Patient and Doctor
        if (patient.doctorId) {
          const channel = proxyClient.channel('messaging', {
            members: [proxyClient.userID!, patient.doctorId],
          });
          await channel.watch();
          setActiveChannel(channel);
          return;
        }
      }
    } catch (proxyError: any) {
      console.error("Nurse proxy connection failed:", proxyError);
      showError("Connection Failed", proxyError.message || "Could not connect to patient chat.");
      setSelectedConversation(null);
      return;
    }

    /* 
    // OLD LOGIC PRESERVED FOR REFERENCE BUT BYPASSED
    */
  };

  // Handle video/audio call
  const handleStartCall = async (callType: 'video' | 'audio') => {
    if (!activeChannel || !chatClient?.userID) return;

    const callId = activeChannel.id; // Use channel ID as call ID for simplicity

    try {
      await activeChannel.sendMessage({
        text: `📞 ${callType === 'video' ? 'Video' : 'Audio'} Call`,
        custom: {
          callId,
          callType,
        },
      } as any);
    } catch (err) {
      console.error("Failed to send call invite:", err);
      showError("Error", "Failed to start call invite.");
      return;
    }

    // 2. Navigate to Call Page as Caller
    const params = new URLSearchParams({
      callId: callId || "",
      isCaller: "true",
      callType,
      // patientId is intentionally omitted so Nurse logs in as themselves
    });

    if (callType === 'audio') {
      router.push(`/nurse/audio-call?${params.toString()}`);
    } else {
      router.push(`/nurse/video-call?${params.toString()}`);
    }
  };

  // Listen for incoming calls
  useEffect(() => {
    if (!videoClient) return;

    const unsubscribeCreated = videoClient.on('call.created', (event: any) => {
      console.log("Call created:", event);
      const call = videoClient.call(event.call.type, event.call.id);
      setIncomingCall(call);
    });

    const unsubscribeRing = videoClient.on('call.ring', (event: any) => {
      console.log("Call ringing:", event);
      const call = videoClient.call(event.call.type, event.call.id);
      setIncomingCall(call);
    });

    return () => {
      unsubscribeCreated();
      unsubscribeRing();
      // Disconnect video client when component unmounts or client changes
      if (videoClient) {
        videoClient.disconnectUser();
      }
    };
  }, [videoClient]);

  // Try to find active conversation based on selection
  const selectedPatient = selectedConversation
    ? uniquePatients.find((p) => p.id === selectedConversation)
    : null;

  const activeConversation = selectedPatient
    ? {
      id: selectedConversation,
      patientName: selectedPatient.patientName,
      photo_url: selectedPatient.photo_url,
      doctorName: selectedPatient.doctorName,
      doctorPhotoUrl: selectedPatient.doctorPhotoUrl || selectedPatient.doctorPhoto,
      lastMessage: "",
      timestamp: "",
      isActive: true,
      isOnline: false,
    }
    : null;

  return (
    <div className="flex h-[calc(100vh-64px)] bg-gray-50">
      {/* Left Column - Messages List */}
      {chatClient && activeChannel ? (
        <div className="hidden lg:block w-auto lg:w-[300px] bg-white border-r border-gray-200 p-4">
          <button
            onClick={() => {
              setSelectedConversation("");
              setActiveChannel(null);
            }}
            className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </button>
        </div>
      ) : (
        <ConversationList
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filteredPatients={filteredPatients}
          handlePatientSelect={handlePatientSelect}
          selectedConversation={selectedConversation}
          isLoading={isLoading}
        />
      )}

      {/* Right Column - Active Chat Interface */}
      <div className={`flex-1 bg-white flex flex-col h-full ${selectedConversation ? 'flex' : 'hidden lg:flex'}`}>
        {chatClient && activeChannel ? (
          <div className="h-full stream-chat-wrapper flex flex-col">
            {/* Mobile Back Button */}
            <div className="lg:hidden p-4 border-b border-gray-200">
              <button
                onClick={() => {
                  setSelectedConversation(null);
                  setActiveChannel(null);
                }}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ChevronLeft className="w-5 h-5" />
                <span className="font-medium">Back</span>
              </button>
            </div>

            <div className="flex-1 min-h-0">
              <Chat client={chatClient} theme="messaging light">
                <Channel channel={activeChannel}>
                  <Window>
                    <div className="relative">
                      <ChannelHeader
                        title={activeConversation?.doctorName}
                        image={activeConversation?.doctorPhotoUrl}
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2 z-10">
                        <button
                          onClick={() => handleStartCall('audio')}
                          className="p-2 hover:bg-gray-100 rounded-full text-gray-600 hover:text-green-600 transition-colors"
                          title="Voice Call"
                        >
                          <Phone className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleStartCall('video')}
                          className="p-2 hover:bg-gray-100 rounded-full text-gray-600 hover:text-blue-600 transition-colors"
                          title="Video Call"
                        >
                          <Video className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    <MessageList />
                    <MessageInput />
                  </Window>
                  <Thread />
                </Channel>
              </Chat>
            </div>
          </div>
        ) : activeConversation ? (
          // Fallback to dummy UI if Stream Chat isn't ready but a conversation is selected
          // Or if using the old logic. But with the new logic activeChannel should be set.
          // We'll keep the old UI as a loading state or fallback
          <div className="flex-1 flex items-center justify-center">
            <LoadingIndicator />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💬</span>
              </div>
              <p className="text-lg font-medium">Select a conversation</p>
              <p className="text-[10px] md:text-[12px]">Choose a patient to start messaging</p>
            </div>
          </div>
        )}
      </div>

      {/* Incoming Call Alert */}
      {incomingCall && (
        <IncomingCallModal
          call={incomingCall}
          onAccept={() => {
            const callId = incomingCall.id;
            const customData = incomingCall.state?.custom;
            const callType = (customData?.callType as string) || 'video';

            const params = new URLSearchParams({
              callId: callId || "",
              callType,
              patientName: activeConversation?.patientName || "Patient",
              isAccepting: "true",
              channelId: activeChannel?.id || "",
            });

            if (callType === 'audio') {
              router.push(`/nurse/audio-call?${params.toString()}`);
            } else {
              router.push(`/nurse/video-call?${params.toString()}`);
            }
            setIncomingCall(null);
          }}
          onReject={async () => {
            try {
              await incomingCall.reject();
            } catch (e) {
              console.error("Error rejecting call", e);
            }
            setIncomingCall(null);
          }}
        />
      )}
    </div>
  );
}
