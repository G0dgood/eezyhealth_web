"use client";

import React from "react";
import { createPortal } from "react-dom";
import { X, Phone } from "lucide-react";
import { getBookingColor } from "@/components/Options";

export interface Booking {
  id: string;
  patientName: string;
  date: string;
  time: string;
  type: "Online Booking" | "Physical Booking";
  status: "confirmed" | "pending" | "cancelled";
  channel: "videoCall" | "chat" | "voiceCall" | "physical";
  patientAge: number;
  reason: string;
  contactNumber: string;
}

interface BookingDetailModalProps {
  isOpen: boolean;
  selectedBooking: Booking | null;
  onClose: () => void;
}

const BookingDetailModal: React.FC<BookingDetailModalProps> = ({
  isOpen,
  selectedBooking,
  onClose,
}) => {
  if (!isOpen || !selectedBooking) return null;

  return createPortal(
    <div className="fixed inset-0 bg-[#00000051] bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Booking Details
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-3 h-3 rounded-full ${getBookingColor(
                selectedBooking.channel
              )}`}
            ></div>
            <span className="text-[10px] md:text-[12px] font-medium text-gray-700">
              {selectedBooking.type}
            </span>
          </div>

          <div>
            <span className="text-[10px] md:text-[12px] font-medium text-gray-700">Patient: </span>
            <span className="text-[10px] md:text-[12px] text-gray-900">
              {selectedBooking.patientName}
            </span>
          </div>

          <div>
            <span className="text-[10px] md:text-[12px] font-medium text-gray-700">Age: </span>
            <span className="text-[10px] md:text-[12px] text-gray-900">
              {selectedBooking.patientAge} years
            </span>
          </div>

          <div>
            <span className="text-[10px] md:text-[12px] font-medium text-gray-700">Date: </span>
            <span className="text-[10px] md:text-[12px] text-gray-900">
              {selectedBooking.date}
            </span>
          </div>

          <div>
            <span className="text-[10px] md:text-[12px] font-medium text-gray-700">Time: </span>
            <span className="text-[10px] md:text-[12px] text-gray-900">
              {selectedBooking.time}
            </span>
          </div>

          <div>
            <span className="text-[10px] md:text-[12px] font-medium text-gray-700">Channel: </span>
            <span className="text-[10px] md:text-[12px] text-gray-900 capitalize">
              {selectedBooking.channel.replace("Call", " Call")}
            </span>
          </div>

          <div>
            <span className="text-[10px] md:text-[12px] font-medium text-gray-700">Contact: </span>
            <span className="text-[10px] md:text-[12px] text-gray-900">
              {selectedBooking.contactNumber}
            </span>
          </div>

          <div>
            <span className="text-[10px] md:text-[12px] font-medium text-gray-700">Reason: </span>
            <span className="text-[10px] md:text-[12px] text-gray-900">
              {selectedBooking.reason}
            </span>
          </div>

          <div className="flex gap-3 pt-4">
            {/* <button className="flex-1 px-4 py-2 bg-[#44CE2D] text-white rounded-lg hover:bg-[#3bb025] transition-colors flex items-center justify-center gap-2">
                    <Video className="w-4 h-4" />
                    Start Session
                  </button> */}
            <button className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
              <Phone className="w-4 h-4" />
              Contact
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default BookingDetailModal;
