"use client";

import { useState, useEffect } from "react";
import { Search, Send, MoreVertical, FileText } from "lucide-react";
import Input from "@/components/Input";
import { useAuth } from "@/contexts/AuthContext";
import { showError } from "@/utils/toast";
import { useBookingsByDoctorId } from "@/hooks/useBookingsByDoctorId";
import moment from "moment";

interface Message {
  id: string;
  sender: "patient" | "doctor";
  content: string;
  timestamp: string;
  hasAttachment?: boolean;
  attachmentName?: string;
  attachmentSize?: string;
  isTyping?: boolean;
}

interface Conversation {
  id: string;
  patientName: string;
  lastMessage: string;
  timestamp: string;
  isActive: boolean;
  isOnline: boolean;
  profilePicture: string;
}

interface BookingData {
  userId: string;
  patientName?: string;
  first_name?: string;
  photo_url?: string;
  timestamp?: string;
  lastMessage?: string;
  isOnline?: boolean;
  date?: string;
  [key: string]: unknown;
}

export default function DoctorMessagePage() {
  const { user } = useAuth();
  const doctorId =
    user && typeof user === "object" && "uid" in user ? user.uid : null;
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedConversation, setSelectedConversation] = useState<string>("");
  const [messageInput, setMessageInput] = useState("");
  // Fetch bookings using RTK Query
  const { data: bookingsData, error } = useBookingsByDoctorId(doctorId);

  // Show error toast when there's an error
  useEffect(() => {
    if (error) {
      showError("Booking Error", "Failed to load bookings. Please try again.");
    }
  }, [error]);

  // Function to categorize chats based on the date
  const getChatTimeCategory = (date: moment.MomentInput) => {
    const today = moment();
    const chatDate = moment(date, "YYYY-MM-DD");

    if (chatDate.isSame(today, "day")) return "Today";
    if (chatDate.isSame(today.clone().subtract(1, "days"), "day"))
      return "Yesterday";
    if (chatDate.isBetween(today.clone().startOf("week"), today, null, "[]"))
      return "This Week";
    if (
      chatDate.isBetween(
        today.clone().startOf("week").subtract(1, "week"),
        today.clone().startOf("week").subtract(1, "days"),
        null,
        "[]"
      )
    )
      return "Last Week";
    return "Older";
  };

  // Function to group chats by time frame
  const groupChatsByCategory = (bookings: BookingData[]) => {
    return bookings?.reduce(
      (groups: Record<string, BookingData[]>, chat: BookingData) => {
        const category = getChatTimeCategory(chat.date || "");
        if (!groups[category]) groups[category] = [];
        groups[category].push(chat);
        return groups;
      },
      {} as Record<string, BookingData[]>
    );
  };
  // Get unique patients based on userId, ensuring no duplicates
  const uniquePatients: BookingData[] = bookingsData
    ? [
      ...new Map(
        bookingsData
          .filter((item: BookingData) => item?.userId)
          .map((item: BookingData) => [item.userId, item])
      ).values(),
    ]
    : [];
  const chatGroups = groupChatsByCategory(uniquePatients);



  // Sample conversation data
  const conversations: Conversation[] = [
    {
      id: "conv-1",
      patientName: "Joy Seun",
      lastMessage:
        "You: Sure thing, I'll have a look today. They're looking great!",
      timestamp: "2min ago",
      isActive: true,
      isOnline: true,
      profilePicture: "👩",
    },
    {
      id: "conv-2",
      patientName: "Felix John",
      lastMessage:
        "Hey Olivia, Katherine sent me over the latest doc. I just have a quick question about the...",
      timestamp: "1hr ago",
      isActive: false,
      isOnline: false,
      profilePicture: "👨",
    },
    {
      id: "conv-3",
      patientName: "Wale John",
      lastMessage:
        "Hey Olivia, Katherine sent me over the latest doc. I just have a quick question about the...",
      timestamp: "Yesterday",
      isActive: false,
      isOnline: false,
      profilePicture: "👨",
    },
    {
      id: "conv-4",
      patientName: "Taiwo John",
      lastMessage:
        "Hey Olivia, Katherine sent me over the latest doc. I just have a quick question about the...",
      timestamp: "Yesterday",
      isActive: false,
      isOnline: false,
      profilePicture: "👨",
    },
    {
      id: "conv-5",
      patientName: "Abbey John",
      lastMessage:
        "Hey Olivia, Katherine sent me over the latest doc. I just have a quick question about the...",
      timestamp: "20/1/2025",
      isActive: false,
      isOnline: false,
      profilePicture: "👨",
    },
    {
      id: "conv-6",
      patientName: "Moses John",
      lastMessage:
        "Hey Olivia, Katherine sent me over the latest doc. I just have a quick question about the...",
      timestamp: "20/1/2025",
      isActive: false,
      isOnline: false,
      profilePicture: "👨",
    },
    {
      id: "conv-7",
      patientName: "Ife John",
      lastMessage:
        "Hey Olivia, Katherine sent me over the latest doc. I just have a quick question about the...",
      timestamp: "20/1/2025",
      isActive: false,
      isOnline: false,
      profilePicture: "👨",
    },
  ];

  // Sample messages for Joy Seun conversation
  const messages: Message[] = [
    {
      id: "1",
      sender: "patient",
      content: "Good morning, Dr. Ade",
      timestamp: "11:40am",
    },
    {
      id: "2",
      sender: "patient",
      content: "Just here for my annual check-up.",
      timestamp: "11:41am",
    },
    {
      id: "3",
      sender: "doctor",
      content:
        "Let's start with your blood pressure. That looks good. Have you had any changes in your health since your last consultation?",
      timestamp: "11:41am",
    },
    {
      id: "4",
      sender: "patient",
      content: "XRay 1.2 MB",
      timestamp: "11:41am",
      hasAttachment: true,
      attachmentName: "XRay",
      attachmentSize: "1.2 MB",
    },
    {
      id: "5",
      sender: "patient",
      content:
        "No, nothing significant. I've been trying to eat healthier and exercise more.",
      timestamp: "11:44am",
    },
    {
      id: "6",
      sender: "patient",
      content: "Good afternoon, Dr.",
      timestamp: "2:01pm",
    },
    {
      id: "7",
      sender: "doctor",
      content: "How may i be of help today?",
      timestamp: "Just now",
    },
    {
      id: "8",
      sender: "patient",
      content: "",
      timestamp: "",
      isTyping: true,
    },
  ];

  const activeConversation = conversations.find(
    (conv) => conv.id === selectedConversation
  );

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      // Here you would typically send the message to the backend

      setMessageInput("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-full flex">
      {/* Central Column - Messages/Chat List */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 h-[80px] border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Messages</h2>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              startIcon={<Search className="w-4 h-4 text-gray-400" />}
              fullWidth
              className="text-sm"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          {uniquePatients?.map((patient: BookingData, i: number) => (
            <div
              key={`patient-${patient.userId}-${i}`}
              onClick={() => setSelectedConversation(`patient-${i}`)}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${selectedConversation === `patient-${i}` ? "bg-blue-50" : ""
                }`}>
              <div className="flex items-start gap-3">
                <div className="relative">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-lg">
                    <img
                      src={patient.photo_url || "/default-avatar.png"}
                      alt={patient.patientName}
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  </div>
                  {patient.isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#44CE2D] rounded-full border-2 border-white"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {patient.patientName ||
                        patient.first_name ||
                        "Unknown Patient"}
                    </h3>
                    <span className="text-xs text-gray-500">
                      {patient.timestamp || "Recently"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 truncate mt-1">
                    {patient.lastMessage || "No messages yet"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Column - Active Chat Interface */}
      <div className="flex-1 bg-white flex flex-col">
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 flex items-center gap-3 h-[80px] ">
              <div className="relative">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-lg">
                  {activeConversation.profilePicture}
                </div>
                {activeConversation.isOnline && (
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-[#44CE2D] rounded-full border-2 border-white"></div>
                )}
              </div>
              <div>
                <h3 className="font-medium text-gray-900">
                  {activeConversation.patientName}
                </h3>
                {activeConversation.isOnline && (
                  <span className="text-sm text-[#44CE2D] font-medium">
                    Online
                  </span>
                )}
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === "doctor"
                    ? "justify-end"
                    : "justify-start"
                    }`}>
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.sender === "doctor"
                      ? "bg-[#44CE2D] text-white"
                      : "bg-gray-100 text-gray-900"
                      }`}>
                    {message.hasAttachment ? (
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        <span className="text-sm">
                          {message.attachmentName}
                        </span>
                        <span className="text-xs opacity-75">
                          {message.attachmentSize}
                        </span>
                      </div>
                    ) : message.isTyping ? (
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-current rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}></div>
                        <div
                          className="w-2 h-2 bg-current rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}></div>
                      </div>
                    ) : (
                      <p className="text-sm">{message.content}</p>
                    )}
                    <p
                      className={`text-xs mt-1 ${message.sender === "doctor"
                        ? "text-white opacity-75"
                        : "text-gray-500"
                        }`}>
                      {message.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input Area */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center gap-3">
                <div className="flex-1 relative">
                  <Input
                    type="text"
                    placeholder="Send a message"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    fullWidth
                  />
                </div>
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <MoreVertical className="w-5 h-5" />
                </button>
                <button
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim()}
                  className="px-6 py-3 bg-[#44CE2D] text-white rounded-lg hover:bg-[#3bb025] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  Send
                </button>
              </div>
            </div>
          </>
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
    </div>
  );
}
