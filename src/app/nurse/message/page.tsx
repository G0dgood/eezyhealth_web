"use client";

import { useState, useEffect, useMemo } from "react";
import { Phone, ChevronLeft, Video, VideoOff, PhoneOff, Check, X, Bell, Clock } from "lucide-react";
import Modal from "@/components/modals/Modal";
import { useRouter } from "next/navigation";
import ConversationList, { PatientData } from "@/components/nurse/ConversationList";
import { useAuth } from "@/contexts/AuthContext";
import { showError, showInfo } from "@/utils/toast";
import { useApiError } from "@/hooks/useApiError";
import { streamApiKey } from "@/lib/config";
import { useGetLatestBookingsForMessagesQuery } from "@/store/bookingApi";
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
  LoadingIndicator,
  MessageSimple
} from 'stream-chat-react';
import 'stream-chat-react/dist/css/v2/index.css';
import '../../stream-chat.css';
import { getStreamChatInfo, storeStreamChatInfo } from "@/lib/streamChat";

const CustomMessage = (props: any) => {
  const { message } = props;
  // Stream renders non-message items (date separators, etc.) through this
  // component too, where `message` can be undefined — bail out safely.
  if (!message) {
    return <MessageSimple {...props} />;
  }
  const isMine = typeof props.isMyMessage === 'function' ? props.isMyMessage(message) : (message.user?.id === props.client?.userID);

  // Appointment reminder — render as a distinct highlighted bubble so it stands
  // out in the conversation for the doctor.
  const isReminder =
    message.custom?.type === "appointment_reminder" ||
    (typeof message.text === "string" &&
      (message.text.startsWith("⏰") ||
        message.text.toLowerCase().includes("appointment reminder")));

  if (isReminder) {
    return (
      <div className="flex justify-center my-2.5 px-4 w-full">
        <div className="flex items-start gap-2 px-4 py-2.5 rounded-2xl border bg-orange-50 text-orange-800 border-orange-200 shadow-sm text-sm max-w-[90%]">
          <Clock className="w-4 h-4 mt-0.5 shrink-0 text-orange-600" />
          <span className="font-medium">{message.text}</span>
        </div>
      </div>
    );
  }

  const callStatus = message.call_status || (message.text?.includes('ended') ? 'ended' : message.text?.includes('accepted') ? 'accepted' : message.text?.includes('declined') ? 'declined' : message.text?.includes('started') || message.text?.includes('Call') ? 'initiated' : null);
  const isVideo = message.call_type === 'video' || message.text?.includes('Video') || message.text?.includes('📹');
  const isVoice = message.call_type === 'voice' || message.call_type === 'audio' || message.text?.includes('Voice') || message.text?.includes('📞');

  if (callStatus && (isVideo || isVoice)) {
    let icon = null;
    let title = "";
    let bgColor = "";
    let textColor = "";
    let borderColor = "";

    if (callStatus === 'initiated') {
      icon = isVideo ? <Video className="w-4 h-4 mr-2 text-blue-600 animate-pulse" /> : <Phone className="w-4 h-4 mr-2 text-blue-600 animate-pulse" />;
      title = isVideo ? "Video call started" : "Voice call started";
      bgColor = "bg-blue-50";
      textColor = "text-blue-800";
      borderColor = "border-blue-200";
    } else if (callStatus === 'ended') {
      icon = isVideo ? <VideoOff className="w-4 h-4 mr-2 text-red-600" /> : <PhoneOff className="w-4 h-4 mr-2 text-red-600" />;
      title = isVideo ? "Video call ended" : "Voice call ended";
      bgColor = "bg-red-50";
      textColor = "text-red-800";
      borderColor = "border-red-200";
    } else if (callStatus === 'accepted') {
      icon = <Check className="w-4 h-4 mr-2 text-green-600" />;
      title = isVideo ? "Video call accepted" : "Voice call accepted";
      bgColor = "bg-green-50";
      textColor = "text-green-800";
      borderColor = "border-green-200";
    } else if (callStatus === 'declined') {
      icon = <X className="w-4 h-4 mr-2 text-gray-600" />;
      title = isVideo ? "Video call declined" : "Voice call declined";
      bgColor = "bg-gray-50";
      textColor = "text-gray-800";
      borderColor = "border-gray-200";
    }

    return (
      <div className="flex justify-center my-2.5 px-4 w-full">
        <div className={`flex items-center px-4 py-2 rounded-full border ${bgColor} ${textColor} ${borderColor} shadow-sm text-sm max-w-[90%]`}>
          {icon}
          <span className="font-semibold">{title}</span>
        </div>
      </div>
    );
  }

  return <MessageSimple {...props} />;
};

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
  const { data: bookingsData, error, isLoading } = useGetLatestBookingsForMessagesQuery(undefined);

  useApiError(!!error, error, "Failed to load bookings. Please try again.");

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
                chatApiKey: streamApiKey || "", // Should come from config
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

      if (token && userId) {
        storeStreamChatInfo({
          chatApiKey: streamApiKey || "",
          chatUserId: userId,
          chatUserName: patient.patientName || "Patient",
          chatUserToken: token,
          userRole: isProxy ? 'patient' : 'nurse'
        });
      }

      if (!proxyClient) {
        throw new Error("Failed to initialize proxy client");
      }

      setChatClient(proxyClient);

      // Initialize Video Client for Patient to receive calls
      // ONLY if acting as proxy (if acting as Nurse, we use the Nurse's video client from CallPage context or similar)
      if (isProxy && token && userId) {
        if (videoClient) await videoClient.disconnectUser();

        const _videoClient = new StreamVideoClient({
          apiKey: streamApiKey || "",
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

  // Appointment reminder to the doctor (posted into the active chat)
  const [showReminder, setShowReminder] = useState(false);
  const [reminderText, setReminderText] = useState("");
  const [isSendingReminder, setIsSendingReminder] = useState(false);

  const openReminder = () => {
    const patient =
      uniquePatients.find((p) => p.id === selectedConversation) || null;
    const name = patient?.patientName || "the patient";
    const when = patient?.timestamp ? ` on ${patient.timestamp}` : "";
    setReminderText(
      `⏰ Appointment Reminder: Please remember your appointment with ${name}${when}. Kindly be available at the scheduled time.`
    );
    setShowReminder(true);
  };

  const sendReminder = async () => {
    if (!activeChannel || !reminderText.trim()) return;
    setIsSendingReminder(true);
    try {
      await activeChannel.sendMessage({
        text: reminderText.trim(),
        custom: { type: "appointment_reminder" },
      } as any);
      showInfo("Reminder sent", "The doctor has been reminded in the chat.");
      setShowReminder(false);
    } catch (err) {
      console.error("Failed to send reminder:", err);
      showError("Error", "Failed to send reminder. Please try again.");
    } finally {
      setIsSendingReminder(false);
    }
  };

  // Handle video/audio call
  const handleStartCall = async (callType: 'video' | 'audio') => {
    if (!activeChannel || !chatClient?.userID) return;

    const uniqueCallId = `${activeChannel.id}-${callType}-${Date.now()}`;

    try {
      await activeChannel.sendMessage({
        text: `📞 ${callType === 'video' ? 'Video' : 'Audio'} Call`,
        custom: {
          callId: uniqueCallId,
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
      callId: uniqueCallId,
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

    const handleCallEvent = (event: any) => {
      const call = videoClient.call(event.call.type, event.call.id);

      const custom = event.call.custom || {};
      const callerName =
        custom.callerName ||
        event.user?.name ||
        event.call.created_by?.name ||
        custom.callerId ||
        "Patient";
      const callerImage =
        custom.callerImage ||
        event.user?.image ||
        event.call.created_by?.image ||
        "";

      (call as any).callerName = callerName;
      (call as any).callerImage = callerImage;
      (call as any).customData = custom;
      (call as any).eventMembers = event.call.members || [];

      setIncomingCall(call);
    };

    const unsubscribeCreated = videoClient.on('call.created', handleCallEvent);
    const unsubscribeRing = videoClient.on('call.ring', handleCallEvent);

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
              // Also drop ?channelId=... from the URL so the browser
              // history doesn't keep re-opening this conversation.
              router.replace("/nurse/message");
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
                  // Also drop ?channelId=... from the URL so the browser
                  // history doesn't keep re-opening this conversation.
                  router.replace("/nurse/message");
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
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10">
                        <button
                          onClick={openReminder}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500 text-white text-sm font-medium hover:bg-orange-600 transition-colors shadow-sm"
                          title="Remind doctor of appointment"
                        >
                          <Bell className="w-4 h-4" />
                          Remind
                        </button>
                      </div>
                      {/* <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2 z-10">
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
                      </div> */}
                    </div>
                    <MessageList Message={CustomMessage} />
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

      {/* Appointment reminder composer */}
      <Modal
        isOpen={showReminder}
        onClose={() => setShowReminder(false)}
        title="Remind Doctor"
        size="md"
      >
        <div className="px-6 py-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-full bg-orange-50 flex items-center justify-center">
              <Bell className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">
                Send an appointment reminder
              </p>
              <p className="text-xs text-gray-500">
                It will appear in this chat for{" "}
                {activeConversation?.doctorName || "the doctor"}.
              </p>
            </div>
          </div>

          <textarea
            value={reminderText}
            onChange={(e) => setReminderText(e.target.value)}
            rows={5}
            className="w-full rounded-lg border border-gray-200 text-gray-900 text-[13px] leading-relaxed p-3 outline-none focus:ring-2 focus:ring-orange-400/40 resize-y"
            placeholder="Reminder message…"
          />

          <div className="flex gap-3 mt-5">
            <button
              onClick={() => setShowReminder(false)}
              disabled={isSendingReminder}
              className="flex-1 border border-gray-200 text-gray-700 font-medium py-2.5 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={sendReminder}
              disabled={isSendingReminder || !reminderText.trim()}
              className="flex-1 flex items-center justify-center gap-1.5 bg-orange-500 text-white font-medium py-2.5 rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors"
            >
              <Bell className="w-4 h-4" />
              {isSendingReminder ? "Sending…" : "Send Reminder"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Incoming Call Alert */}
      {incomingCall && (
        <IncomingCallModal
          call={incomingCall}
          onAccept={() => {
            const callId = incomingCall.id;
            const customData = incomingCall.state?.custom || (incomingCall as any).customData;
            const rawType = (customData?.callType as string | undefined) || "";

            const isVideoFromString = callId.includes('-video-');
            const isAudioFromString = callId.includes('-audio-');
            const callType = isVideoFromString ? 'video' : isAudioFromString ? 'audio' : (rawType || 'audio');

            const members = incomingCall.state?.members || (incomingCall as any).eventMembers || [];
            const patientId = members.find((m: any) => m.user_id !== videoClient?.state.connectedUser?.id)?.user_id || "";
            const resolvedPatientName = (incomingCall as any).callerName || activeConversation?.patientName || "Patient";

            const params = new URLSearchParams({
              callId: callId || "",
              callType,
              patientName: resolvedPatientName,
              isAccepting: "true",
              channelId: activeChannel?.id || "",
            });

            if (patientId) {
              params.append("patientId", patientId);
            }

            if (callType === "audio") {
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
