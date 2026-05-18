import React from "react";
import { Search } from "lucide-react";
import Input from "@/components/Input";
import FormattedDate from "@/components/FormattedDate";
import TruncatedText from "@/components/TruncatedText";

export interface PatientData {
 id: string;
 patientName: string;
 uid?: string;
 name?: string;
 display_name?: string;
 photo_url?: string;
 patientPhotoUrl?: string;
 lastMessage?: string;
 isOnline?: boolean;
 timestamp?: string;
 bookingId?: string;
 doctorId?: string;
 doctorName?: string;
 doctorPhotoUrl?: string;
 doctorPhoto?: string;
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

 // Group patients by doctorId
 const groupedPatients = React.useMemo(() => {
  const groups: { [key: string]: { doctorName: string; doctorPhotoUrl?: string; patients: PatientData[] } } = {};

  filteredPatients.forEach((patient) => {
   const doctorId = patient.doctorId || 'unknown';
   if (!groups[doctorId]) {
    groups[doctorId] = {
     doctorName: patient.doctorName || 'Unknown Doctor',
     doctorPhotoUrl: patient.doctorPhotoUrl || patient.doctorPhoto,
     patients: [],
    };
   }
   groups[doctorId].patients.push(patient);
  });

  return groups;
 }, [filteredPatients]);

 return (
  <div className={`w-full lg:w-[400px] bg-white border-r border-gray-200 flex flex-col ${selectedConversation ? 'hidden lg:flex' : 'flex'}`}>
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
    ) : filteredPatients.length === 0 ? (
     <div className="str-chat__empty-channel flex flex-col items-center justify-center h-full p-4 text-center text-gray-500 dark:text-gray-400">
      <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3">
       <span className="text-xl">💬</span>
      </div>
      <p className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">No chats found</p>
      <p className="text-sm">Try adjusting your search terms</p>
     </div>
        ) : (
          Object.entries(groupedPatients)
            .sort(([, a], [, b]) => a.doctorName.localeCompare(b.doctorName))
            .map(([doctorId, group]) => (
            <div key={doctorId} className="border-b border-gray-100 last:border-0">
       {/* Doctor Header */}
       <div className="sticky top-0 z-10 bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
         {group.doctorPhotoUrl ? (
          <img src={group.doctorPhotoUrl} alt={group.doctorName} className="w-full h-full object-cover" />
         ) : (
          <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-500">
           {getInitials(group.doctorName)}
          </div>
         )}
        </div>
        <span className="text-xs font-semibold text-gray-700 truncate">
         {group.doctorName}
        </span>
       </div>

       {/* Patients List for this Doctor */}
       {group.patients.map((patient: PatientData, i: number) => (
        <div
         key={`patient-${patient.id}-${i}`}
         onClick={() => handlePatientSelect(patient, i)}
         className={`p-4 border-b border-gray-100 last:border-0 cursor-pointer hover:bg-gray-50 transition-colors ${selectedConversation === patient.id ? "bg-blue-50" : ""
          }`}
        >
         <div className="flex items-start gap-3">
          <div className="relative">
           <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-[14px] md:text-[16px] overflow-hidden">
            {patient.photo_url || patient.patientPhotoUrl ? (
             <img
              src={patient.photo_url || patient.patientPhotoUrl}
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
            <FormattedDate
             timestamp={patient.timestamp}
             className="text-xs text-gray-500"
            />
           </div>
           <TruncatedText
            text={patient.lastMessage}
            className="text-[10px] md:text-[12px] text-gray-600 mt-1"
           />
          </div>
         </div>
        </div>
       ))}
      </div>
     ))
    )}
   </div>
  </div>
 );
};

export default ConversationList;
