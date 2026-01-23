"use client";

import { useState, useEffect } from "react";
import { Send, MoreVertical, FileText, Video, Phone, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import ConversationList, { PatientData } from "@/components/nurse/ConversationList";
import { useAuth } from "@/contexts/AuthContext";
import { showError, showInfo } from "@/utils/toast";
import { useGetFirebaseBookingsQuery } from "@/store/bookingApi";
import { useGenerateTokenForUserMutation, useAddMemberToChannelMutation } from "@/store/streamChatApi";
import { useNurseChat } from "@/hooks/useNurseChat";
import moment from "moment";
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
import { getStreamChatInfo, storeStreamChatInfo, StreamChatInfo } from "@/lib/streamChat";

interface Conversation {
  id: string;
  patientName: string;
  lastMessage: string;
  timestamp: string;
  isActive: boolean;
  isOnline: boolean;
  profilePicture: string;
}

export default function NurseMessagePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [generateTokenForUser] = useGenerateTokenForUserMutation();
  const [addMemberToChannel] = useAddMemberToChannelMutation();
  const { connectAsPatient, disconnect: disconnectProxy, loading: isNurseProxyLoading } = useNurseChat();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");
  
  // Stream Chat states
  const [chatClient, setChatClient] = useState<StreamChat | null>(null);
  const [activeChannel, setActiveChannel] = useState<StreamChannel | null>(null);
  const [isChatLoading, setIsChatLoading] = useState(true);
  const [videoClient, setVideoClient] = useState<StreamVideoClient | null>(null);
  const [incomingCall, setIncomingCall] = useState<Call | null>(null);

  // Fetch bookings using RTK Query
  const { data: bookingsData, error, isLoading } = useGetFirebaseBookingsQuery({});

  // Show error toast when there's an error
  useEffect(() => {
    if (error) {
      showError("Error", "Failed to load bookings. Please try again.");
    }
  }, [error]);
  console.log('bookingsData',bookingsData)

  // Map bookings to patients, ensuring uniqueness
  const uniquePatients: PatientData[] = bookingsData
    ? [
        ...new Map(
          bookingsData
            .filter((booking: any) => booking.userId) // Ensure userId exists
            .map((booking: any) => [
              booking.userId,
              {
                id: booking.userId,
                uid: booking.userId,
                patientName: booking.patientName || booking.first_name || "Unknown Patient",
                photo_url: booking.photo_url || booking.patientImage,
                lastMessage: booking.lastMessage || "No messages yet",
                isOnline: booking.isOnline || false,
                timestamp: booking.date || "",
                bookingId: booking.bookingId || booking.id, // Add bookingId for channel creation
                doctorId: booking.doctorId, // Add doctorId
              },
            ])
        ).values(),
      ]
    : [];

  // Filter patients based on search term
  const filteredPatients = uniquePatients.filter(patient => 
    patient.patientName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Initialize Stream Chat client
  useEffect(() => {
    const initChat = async () => {
      try {
        let chatInfo = getStreamChatInfo();
        
        // If chatInfo is missing or belongs to a different user, generate a new token
        if (user && (!chatInfo || chatInfo.chatUserId !== user.uid)) {
            console.log("Chat info mismatch or missing, generating new token for", user.uid);
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
          setIsChatLoading(false);
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
        setIsChatLoading(false);
      } catch (error) {
        console.error("Error connecting to Stream Chat:", error);
        setIsChatLoading(false);
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
  const handlePatientSelect = async (patient: PatientData, index: number) => {
    setSelectedConversation(`patient-${index}`);
    
    if (!chatClient || !user) {
      showError("Error", "Chat not initialized. Please login again.");
      return;
    }

    // Determine the other user's ID (patient's ID)
    const otherUserId = patient.uid || patient.id;
    const bookingId = patient.bookingId;
    
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
        
        if (!proxyClient) {
            throw new Error("Failed to initialize proxy client");
        }

        setChatClient(proxyClient);

        // Initialize Video Client for Patient to receive calls
        if (token && userId) {
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
            setVideoClient(_videoClient);
        }

        // Create/Get channel using bookingId as ID
        // Since we are now "the patient" (proxy), we can access the channel if it exists
        // or create it with correct members (Patient + Doctor)
        if (bookingId && patient.doctorId) {
            const channelId = `${bookingId}`;
            
            // Define members: Patient (proxy user) and Doctor
            // Note: proxyClient.userID is the patient's ID
            const members = [proxyClient.userID!, patient.doctorId];
            
            const channel = proxyClient.channel('messaging', channelId, {
                members,
            });

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
  const handleStartCall = (callType: 'video' | 'audio') => {
    if (!activeChannel || !chatClient?.userID) return;
    
    // Find the other member (patient)
    const members = Object.values(activeChannel.state.members);
    const otherMember = members.find(m => m.user_id !== chatClient.userID);
    const patientName = otherMember?.user?.name || "Patient";
    
    // Use channel ID as call ID
    const callId = activeChannel.id; 

    const params = new URLSearchParams({
      callId: callId || "",
      callType,
      patientName,
      isAccepting: "false", // Nurse initiates call
      channelId: activeChannel.id || "",
    });

    // Navigate to nurse call page
    router.push(`/nurse/call?${params.toString()}`);
  };

  // Listen for incoming calls
  useEffect(() => {
    if (!videoClient) return;

    const unsubscribeCreated = videoClient.on('call.created', (event) => {
        console.log("Call created:", event);
        setIncomingCall(event.call);
    });

    const unsubscribeRing = videoClient.on('call.ring', (event) => {
        console.log("Call ringing:", event);
        setIncomingCall(event.call);
    });

    return () => {
        unsubscribeCreated();
        unsubscribeRing();
        // Don't disconnect here to avoid disrupting active flow, but ideally should cleanup on unmount
    };
  }, [videoClient]);

  // Try to find active conversation based on selection
  const selectedPatient = selectedConversation
    ? uniquePatients.find((p, i) => `patient-${i}` === selectedConversation)
    : null;

  const activeConversation = selectedPatient
    ? {
        id: selectedConversation,
        patientName: selectedPatient.patientName,
        photo_url: selectedPatient.photo_url,
        lastMessage: "",
        timestamp: "",
        isActive: true,
        isOnline: false,
      }
    : null;

  return (
    <div className="h-full flex">
      {/* Central Column - Messages/Chat List */}
      {chatClient && activeChannel ? (
        <div className="w-auto lg:w-80 bg-white border-r border-gray-200 p-4">
          <button 
            onClick={() => {
              setSelectedConversation(null);
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
        isLoading={isLoading}
        filteredPatients={filteredPatients}
        handlePatientSelect={handlePatientSelect}
        selectedConversation={selectedConversation}
      />
      )}

      {/* Right Column - Active Chat Interface */}
      <div className={`flex-1 bg-white flex flex-col h-full ${selectedConversation ? 'flex' : 'hidden lg:flex'}`}>
        {chatClient && activeChannel ? (
          <div className="h-full stream-chat-wrapper">
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
              <p className="text-sm">Choose a patient to start messaging</p>
            </div>
          </div>
        )}
      </div>

      {/* Incoming Call Alert */}
      {incomingCall && (
        <div className="fixed bottom-4 right-4 w-80 bg-white p-6 shadow-2xl rounded-xl border border-gray-200 z-50 animate-in slide-in-from-bottom-5 duration-300">
            <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center animate-pulse">
                    <Phone className="w-6 h-6 text-green-600" />
                </div>
                <div>
                    <h3 className="font-bold text-lg">Incoming Call</h3>
                    <p className="text-sm text-gray-500">Doctor is calling...</p>
                </div>
            </div>
            <div className="flex gap-3">
                <button 
                    onClick={() => {
                        if (incomingCall) {
                            const callId = incomingCall.id;
                            const params = new URLSearchParams({
                                callId,
                                callType: 'video', 
                                patientName: "Patient", 
                                isAccepting: "true",
                                channelId: activeChannel?.id || "",
                            });
                            router.push(`/nurse/call?${params.toString()}`);
                        }
                    }} 
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-medium transition-colors"
                >
                    Accept
                </button>
                <button 
                    onClick={async () => {
                        if (incomingCall) {
                            try {
                                await incomingCall.leave();
                            } catch (e) {
                                console.error("Error rejecting call", e);
                            }
                            setIncomingCall(null);
                        }
                    }} 
                    className="flex-1 bg-red-100 hover:bg-red-200 text-red-600 py-2 rounded-lg font-medium transition-colors"
                >
                    Decline
                </button>
            </div>
        </div>
      )}
    </div>
  );
}
