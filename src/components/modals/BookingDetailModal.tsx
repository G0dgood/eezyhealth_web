import React from "react";
import { Video, Phone } from "lucide-react";
import Modal from "./Modal";

interface Booking {
  id: string;
  type: string;
  patientName: string;
  patientAge: number;
  date: string;
  time: string;
  channel: string;
  contactNumber: string;
  reason: string;
}

interface BookingDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  onStartSession: (bookingId: string) => void;
  onContact: (contactNumber: string) => void;
}

const BookingDetailModal: React.FC<BookingDetailModalProps> = ({
  isOpen,
  onClose,
  booking,
  onStartSession,
  onContact,
}) => {
  if (!booking) return null;

  const getBookingColor = (channel: string) => {
    const colors = {
      videoCall: "bg-blue-500",
      voiceCall: "bg-green-500",
      chat: "bg-purple-500",
    };
    return colors[channel as keyof typeof colors] || "bg-gray-500";
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Booking Details" size="md">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-3 h-3 rounded-full ${getBookingColor(
              booking.channel
            )}`}></div>
          <span className="text-sm font-medium text-gray-700">
            {booking.type}
          </span>
        </div>

        <div>
          <span className="text-sm font-medium text-gray-700">
            Patient:{" "}
          </span>
          <span className="text-sm text-gray-900">
            {booking.patientName}
          </span>
        </div>

        <div>
          <span className="text-sm font-medium text-gray-700">
            Age:{" "}
          </span>
          <span className="text-sm text-gray-900">
            {booking.patientAge} years
          </span>
        </div>

        <div>
          <span className="text-sm font-medium text-gray-700">
            Date:{" "}
          </span>
          <span className="text-sm text-gray-900">
            {booking.date}
          </span>
        </div>

        <div>
          <span className="text-sm font-medium text-gray-700">
            Time:{" "}
          </span>
          <span className="text-sm text-gray-900">
            {booking.time}
          </span>
        </div>

        <div>
          <span className="text-sm font-medium text-gray-700">
            Channel:{" "}
          </span>
          <span className="text-sm text-gray-900 capitalize">
            {booking.channel.replace("Call", " Call")}
          </span>
        </div>

        <div>
          <span className="text-sm font-medium text-gray-700">
            Contact:{" "}
          </span>
          <span className="text-sm text-gray-900">
            {booking.contactNumber}
          </span>
        </div>

        <div>
          <span className="text-sm font-medium text-gray-700">
            Reason:{" "}
          </span>
          <span className="text-sm text-gray-900">
            {booking.reason}
          </span>
        </div>

        <div className="flex gap-3 pt-4">
          <button 
            onClick={() => onStartSession(booking.id)}
            className="flex-1 px-4 py-2 bg-[#44CE2D] text-white rounded-lg hover:bg-[#3bb025] transition-colors flex items-center justify-center gap-2"
          >
            <Video className="w-4 h-4" />
            Start Session
          </button>
          <button 
            onClick={() => onContact(booking.contactNumber)}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <Phone className="w-4 h-4" />
            Contact
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default BookingDetailModal;
