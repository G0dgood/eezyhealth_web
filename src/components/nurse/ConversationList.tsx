import React from "react";
import { Search } from "lucide-react";
import Input from "@/components/Input";

export interface PatientData {
  id: string;
  patientName: string;
  uid?: string;
  name?: string;
  display_name?: string;
  photo_url?: string;
  lastMessage?: string;
  isOnline?: boolean;
  timestamp?: string;
  bookingId?: string;
  doctorId?: string;
  [key: string]: unknown;
}

interface ConversationListProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  isLoading: boolean;
  filteredPatients: PatientData[];
  handlePatientSelect: (patient: PatientData, index: number) => void;
  selectedConversation: string | null;
}

const ConversationList: React.FC<ConversationListProps> = ({
  searchTerm,
  setSearchTerm,
  isLoading,
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
    <div className={`w-full lg:w-80 bg-white border-r border-gray-200 flex flex-col ${selectedConversation ? 'hidden lg:flex' : 'flex'}`}>
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
            className=" text-[10px]  md:text-[12px]"
          />
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-center text-gray-500">Loading patients...</div>
        ) : (
          filteredPatients.map((patient: PatientData, i: number) => (
            <div
              key={`patient-${patient.id}-${i}`}
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
                        alt={patient.patientName}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-500 font-medium  text-[10px]  md:text-[12px]">
                        {getInitials(patient.patientName || "Patient")}
                      </span>
                    )}
                  </div>
                  {patient.isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#44CE2D] rounded-full border-2 border-white"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className=" text-[10px]  md:text-[12px] font-medium text-gray-900 truncate">
                      {patient.patientName}
                    </h3>
                    <span className="text-xs text-gray-500">
                      {patient.timestamp || "Recently"}
                    </span>
                  </div>
                  <p className=" text-[10px]  md:text-[12px] text-gray-600 truncate mt-1">
                    {patient.lastMessage}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ConversationList;
