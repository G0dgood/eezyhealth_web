"use client";

import Modal from "@/components/modals/Modal";
import { convertSlotToTime } from "@/components/Options";
import { User, Calendar, Clock, MessageSquare, FileText, Activity } from "lucide-react";

const formatBookingDate = (bookingDate: any): string => {
  if (!bookingDate) return "—";
  let d: Date;
  if (bookingDate?._seconds) d = new Date(bookingDate._seconds * 1000);
  else if (bookingDate?.seconds) d = new Date(bookingDate.seconds * 1000);
  else d = new Date(bookingDate);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const formatChannel = (channel: string): string => {
  const c = (channel || "").toLowerCase();
  if (c === "video" || c === "videocall") return "Video Consultation";
  if (c === "chat") return "Chat Consultation";
  if (c === "voice" || c === "voicecall") return "Voice Call";
  if (c === "in-person" || c === "physical") return "In-Person";
  return channel || "—";
};

export default function BookedSlotInfoModal({
  isOpen,
  onClose,
  booking,
}: {
  isOpen: boolean;
  onClose: () => void;
  booking: any | null;
}) {
  if (!isOpen || !booking) return null;

  const rows: { icon: React.ReactNode; label: string; value: string }[] = [
    {
      icon: <User className="w-4 h-4 text-[var(--primary)]" />,
      label: "Patient",
      value: booking.patientName || booking.patientFullName || "Unknown Patient",
    },
    {
      icon: <Calendar className="w-4 h-4 text-[var(--primary)]" />,
      label: "Date",
      value: formatBookingDate(booking.bookingDate || booking.date),
    },
    {
      icon: <Clock className="w-4 h-4 text-[var(--primary)]" />,
      label: "Time",
      value: convertSlotToTime(String(booking.slot || "")) || "—",
    },
    {
      icon: <MessageSquare className="w-4 h-4 text-[var(--primary)]" />,
      label: "Channel",
      value: formatChannel(booking.bookingChannel || booking.channel),
    },
    {
      icon: <FileText className="w-4 h-4 text-[var(--primary)]" />,
      label: "Reason",
      value: booking.reason || booking.consultationReason || "—",
    },
    {
      icon: <Activity className="w-4 h-4 text-[var(--primary)]" />,
      label: "Status",
      value: booking.bookingStatus || booking.status || "—",
    },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Booking Details" size="md">
      <div className="px-6 py-5">
        <div className="rounded-lg border border-gray-100 divide-y divide-gray-100">
          {rows.map((r) => (
            <div
              key={r.label}
              className="flex items-start justify-between gap-4 px-4 py-3"
            >
              <span className="flex items-center gap-2 text-[13px] text-gray-500">
                {r.icon}
                {r.label}
              </span>
              <span className="text-[13px] font-medium text-gray-900 text-right capitalize">
                {r.value || "—"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}
