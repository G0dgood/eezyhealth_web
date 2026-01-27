import React from "react";
import { Search } from "lucide-react";
import Input from "@/components/Input";

export interface BookingData {
  userId: string;
  patientName?: string;
  first_name?: string;
  photo_url?: string;
  timestamp?: string;
  lastMessage?: string;
  isOnline?: boolean;
  date?: string;
  bookingId?: string;
  [key: string]: unknown;
}

interface ConversationListProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filteredPatients: BookingData[];
  handlePatientSelect: (patient: BookingData, index: number) => void;
  selectedConversation: string | null;
}

const ConversationList: React.FC<ConversationListProps> = ({
  searchTerm,
  setSearchTerm,
  filteredPatients,
  handlePatientSelect,
  selectedConversation,
}) => {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="w-full lg:w-[400px] bg-white border-r border-gray-200 flex flex-col h-full">
      <div className="p-6 h-[80px] border-b border-gray-200">
        <h2 className="text-[16px] md:text-[18px] font-semibold text-gray-900">Messages</h2>
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
            className="text-[10px] md:text-[12px]"
          />
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {filteredPatients.map((patient: BookingData, i: number) => (
          <div
            key={`patient-${patient.userId}-${i}`}
            onClick={() => handlePatientSelect(patient, i)}
            className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${selectedConversation === `patient-${i}` ? "bg-blue-50" : ""
              }`}
          >
            <div className="flex items-start gap-3">
              <div className="relative">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-[14px] md:text-[16px] overflow-hidden">
                  {patient.photo_url ? (
                    <img
                      src={patient.photo_url}
                      alt={patient.patientName || "Patient"}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-500 font-medium text-[10px] md:text-[12px]">
                      {getInitials(
                        patient.patientName ||
                        patient.first_name ||
                        "Unknown Patient"
                      )}
                    </span>
                  )}
                </div>
                {patient.isOnline && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#44CE2D] rounded-full border-2 border-white"></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] md:text-[12px] font-medium text-gray-900 truncate">
                    {patient.patientName ||
                      patient.first_name ||
                      "Unknown Patient"}
                  </h3>
                  <span className="text-xs text-gray-500">
                    {patient.timestamp || "Recently"}
                  </span>
                </div>
                <p className="text-[10px] md:text-[12px] text-gray-600 truncate mt-1">
                  {patient.lastMessage || "No messages yet"}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConversationList;
