"use client";

import { useState, useEffect } from "react";
import { Video, Phone, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import ConversationList, { BookingData } from "@/components/doctor/ConversationList";
import { useAuth } from "@/contexts/AuthContext";
import { showError } from "@/utils/toast";
import { useBookingsByDoctorId } from "@/hooks/useBookingsByDoctorId";
import { StreamChat, Channel as StreamChannel } from 'stream-chat';
import { SVGLoader } from "@/components/SVGLoader";
import {
  Chat,
  Channel,
  Window,
  ChannelHeader,
  MessageList,
  MessageInput,
  Thread
} from 'stream-chat-react';
import 'stream-chat-react/dist/css/v2/index.css';
import '../../stream-chat.css';
import { getStreamChatInfo } from "@/lib/streamChat";

export default function DoctorMessagePage() {
  const router = useRouter();
  const { user } = useAuth();
  const doctorId =
    user && typeof user === "object" && "uid" in user ? user.uid : null;
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedConversation, setSelectedConversation] = useState<string>("");

  // Stream Chat states
  const [chatClient, setChatClient] = useState<StreamChat | null>(null);
  const [activeChannel, setActiveChannel] = useState<StreamChannel | null>(null);
  const [isChatLoading, setIsChatLoading] = useState(true);

  // Fetch bookings using RTK Query
  const { data: bookingsData, error } = useBookingsByDoctorId(doctorId);

  // Show error toast when there's an error
  useEffect(() => {
    if (error) {
      showError("Booking Error", "Failed to load bookings. Please try again.");
    }
  }, [error]);

  // Get unique patients based on userId, ensuring no duplicates
  const uniquePatients: BookingData[] = bookingsData
    ? Array.from(
      bookingsData.reduce((map, booking) => {
        if (booking.userId && !map.has(booking.userId)) {
          map.set(booking.userId, {
            userId: booking.userId,
            patientId: booking.patientId || booking.userId, // Explicitly add patientId
            patientName: booking.patientName || "Unknown Patient",
            photo_url: booking.photo_url,
            timestamp: booking.bookingDate || booking.date, // Use booking date as timestamp
            bookingId: booking.bookingId || booking.id, // Add bookingId for channel creation
            lastMessage: booking.consultationReason || booking.reason || "No messages yet",
          });
        }
        return map;
      }, new Map<string, any>()).values()
    )
    : [];

  // Initialize Stream Chat client
  useEffect(() => {
    const initChat = async () => {
      try {
        const chatInfo = getStreamChatInfo();
        if (!chatInfo || !user) {
          setIsChatLoading(false);
          return;
        }

        const client = StreamChat.getInstance(chatInfo.chatApiKey);

        if (!client.userID) {
          await client.connectUser(
            {
              id: chatInfo.chatUserId,
              name: chatInfo.chatUserName,
              image: user.photoURL || undefined,
              role: "doctor",
            },
            chatInfo.chatUserToken
          );
        }

        setChatClient(client);
        setIsChatLoading(false);
      } catch (error) {
        console.error("Error connecting to Stream Chat:", error);
        setIsChatLoading(false);
      }
    };

    initChat();

    return () => {
      if (chatClient) {
        chatClient.disconnectUser();
      }
    };
  }, [user]);

  // Handle patient selection and channel creation
  const handlePatientSelect = async (patient: BookingData, index: number) => {
    setSelectedConversation(`patient-${index}`);

    if (!chatClient || !user) {
      showError("Error", "Chat not initialized. Please login again.");
      return;
    }

    // Determine the other user's ID (patient's ID)
    const otherUserId = patient.patientId || patient.userId;
    const bookingId = `${patient.patientId}-${patient.doctorId}`;

    if (!otherUserId) {
      showError("Error", "Cannot start chat: Invalid patient ID");
      return;
    }

    try {
      // Check if patient exists in Stream
      const userResponse = await chatClient.queryUsers({
        id: { $in: [otherUserId] },
      });

      if (userResponse.users.length === 0) {
        showError(
          "Patient Unavailable",
          "Patient not registered for chat. Please try again later."
        );
        return;
      }

      // Create/Get channel using composite ID (patientId-doctorId)
      let channel: StreamChannel | undefined;
      if (otherUserId && user.uid) {
        const channelId = `${otherUserId}-${user.uid}`;
        channel = chatClient.channel('messaging', channelId, {
          members: [user.uid, otherUserId],
        });
      } else if (bookingId) {
        // Fallback to bookingId if for some reason IDs are missing (should not happen)
        channel = chatClient.channel('messaging', bookingId, {
          members: [user.uid, otherUserId],
        });
      } else {
        // Fallback to members-based channel if bookingId is missing
        console.warn("No booking ID found for patient, falling back to members-based channel");
        channel = chatClient.channel('messaging', {
          members: [user.uid, otherUserId],
        });
      }

      await channel.watch();
      setActiveChannel(channel);
    } catch (error) {
      console.error("Error creating channel:", error);
      showError("Error", "Failed to start conversation");
    }
  };

  // Filter conversations based on search term
  const filteredPatients = uniquePatients.filter(patient =>
    (patient.patientName || patient.first_name || "Unknown Patient").toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle video/audio call
  const handleStartCall = (callType: 'video' | 'audio') => {
    if (!activeChannel || !chatClient?.userID) return;

    let patientId = "";
    let patientName = "Patient";

    // Try getting from channel members first
    const members = Object.values(activeChannel.state.members);
    const otherMember = members.find(m => m.user_id !== chatClient.userID);

    if (otherMember) {
      patientId = otherMember.user_id || "";
      patientName = otherMember.user?.name || "Patient";
    } else {
      // Fallback: try to find from selectedConversation index
      if (selectedConversation.startsWith('patient-')) {
        const index = parseInt(selectedConversation.split('-')[1]);
        if (!isNaN(index) && uniquePatients[index]) {
          patientId = uniquePatients[index].userId;
          patientName = uniquePatients[index].patientName || "Patient";
        }
      }
    }

    if (!patientId) {
      console.error("Could not find patient ID for call");
      showError("Error", "Could not identify patient for the call");
      return;
    }

    // KEY FIX: Generate a UNIQUE call ID for every new call attempt.
    // Stream Call IDs have strict validation: max 64 characters, [a-zA-Z0-9-].
    // Since channel IDs can be long, we take a substring of it and append the timestamp.
    const shortChannelId = activeChannel.id.substring(0, 15);
    const uniqueCallId = `${shortChannelId}-${callType}-${Date.now()}`.replace(/[^a-zA-Z0-9-]/g, '');

    const params = new URLSearchParams({
      callId: uniqueCallId,
      callType,
      patientName,
      patientId,
      isCaller: "true",
      channelId: activeChannel.id || "",
    });

    if (callType === 'audio') {
      router.push(`/doctor/audio-call?${params.toString()}`);
    } else {
      router.push(`/doctor/video-call?${params.toString()}`);
    }
  };

  if (isChatLoading) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center bg-gray-50">
        <SVGLoader width={40} height={40} color="#000" />
      </div>
    );
  }

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
        />
      )}

      {/* Right Column - Active Chat Interface */}
      <div className={`flex-1 bg-white flex flex-col ${selectedConversation ? 'flex' : 'hidden lg:flex'}`}>
        {chatClient && activeChannel ? (
          <div className="h-full stream-chat-wrapper flex flex-col">
            {/* Mobile Back Button */}
            <div className="lg:hidden p-4 border-b border-gray-200">
              <button
                onClick={() => {
                  setSelectedConversation("");
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
                      <ChannelHeader />
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
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💬</span>
              </div>
              <p className="text-[14px] md:text-[16px] font-medium">Select a conversation</p>
              <p className=" !text-[10px]  !md:text-[12px]">Choose a patient to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
