"use client";

import { useState } from "react";
import Modal from "@/components/modals/Modal";
import Textarea from "@/components/Textarea";
import Input from "@/components/Input";
import Dropdown from "@/components/Dropdown";
import { convertSlotToTime, timeSlots } from "@/components/Options";
import { useUpdateBookingStatusMutation } from "@/store/bookingApi";
import { showSuccess, showError } from "@/utils/toast";
import {
  User,
  Calendar,
  Clock,
  MessageSquare,
  FileText,
  Activity,
  AlertTriangle,
  CalendarClock,
} from "lucide-react";

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

// Turn a stored bookingDate (Firestore timestamp / string / Date) into the
// yyyy-mm-dd value a native date input expects.
const toDateInputValue = (bookingDate: any): string => {
  if (!bookingDate) return "";
  let d: Date;
  if (bookingDate?._seconds) d = new Date(bookingDate._seconds * 1000);
  else if (bookingDate?.seconds) d = new Date(bookingDate.seconds * 1000);
  else d = new Date(bookingDate);
  if (isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

type Mode = "view" | "cancel" | "reschedule";

export default function BookedSlotInfoModal({
  isOpen,
  onClose,
  booking,
  enableActions = false,
  actor = "doctor",
  onChanged,
}: {
  isOpen: boolean;
  onClose: () => void;
  booking: any | null;
  /** When true, shows Cancel + Reschedule action buttons. */
  enableActions?: boolean;
  /** Who is performing the action (stored on the booking record). */
  actor?: "doctor" | "nurse" | "admin";
  /** Called after a successful cancel/reschedule so the caller can refresh. */
  onChanged?: () => void;
}) {
  const [mode, setMode] = useState<Mode>("view");
  const [cancelReason, setCancelReason] = useState("");
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleSlot, setRescheduleSlot] = useState("");
  const [updateBookingStatus, { isLoading: isSubmitting }] =
    useUpdateBookingStatusMutation();

  if (!isOpen || !booking) return null;

  const bookingId = booking.id || booking.bookingId;
  const currentStatus = (
    booking.bookingStatus ||
    booking.status ||
    ""
  ).toString();
  const isCancelled = ["cancelled", "canceled"].includes(
    currentStatus.toLowerCase(),
  );

  const resetAndClose = () => {
    setMode("view");
    setCancelReason("");
    setRescheduleDate("");
    setRescheduleSlot("");
    onClose();
  };

  const openReschedule = () => {
    setRescheduleDate(toDateInputValue(booking.bookingDate || booking.date));
    setRescheduleSlot(String(booking.slot || ""));
    setMode("reschedule");
  };

  const handleCancel = async () => {
    if (!bookingId) {
      showError("Error", "Missing booking reference.");
      return;
    }
    try {
      await updateBookingStatus({
        bookingId,
        newStatus: "Cancelled",
        cancellationReason: cancelReason || "No reason provided",
        actor,
      }).unwrap();
      showSuccess(
        "Appointment Cancelled",
        "This appointment has been marked as cancelled.",
      );
      onChanged?.();
      resetAndClose();
    } catch (e) {
      console.error("Failed to cancel appointment:", e);
      showError("Error", "Failed to cancel the appointment. Please try again.");
    }
  };

  const handleReschedule = async () => {
    if (!bookingId) {
      showError("Error", "Missing booking reference.");
      return;
    }
    if (!rescheduleDate || !rescheduleSlot) {
      showError("Missing details", "Pick a new date and time slot.");
      return;
    }
    try {
      // Build a local Date at noon to avoid a timezone day-shift.
      const [y, m, d] = rescheduleDate.split("-").map((n) => parseInt(n, 10));
      const newDate = new Date(y, (m || 1) - 1, d || 1, 12, 0, 0);
      await updateBookingStatus({
        bookingId,
        newStatus: "Rescheduled",
        newBookingDate: newDate,
        newSlot: rescheduleSlot,
        actor,
      }).unwrap();
      showSuccess(
        "Appointment Rescheduled",
        "This appointment has been moved to the new date and time.",
      );
      onChanged?.();
      resetAndClose();
    } catch (e) {
      console.error("Failed to reschedule appointment:", e);
      showError(
        "Error",
        "Failed to reschedule the appointment. Please try again.",
      );
    }
  };

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
      value: currentStatus || "—",
    },
  ];

  const title =
    mode === "cancel"
      ? "Cancel Appointment"
      : mode === "reschedule"
        ? "Reschedule Appointment"
        : "Booking Details";

  return (
    <Modal isOpen={isOpen} onClose={resetAndClose} title={title} size="md">
      {mode === "view" && (
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

          {enableActions && !isCancelled && (
            <div className="flex justify-end gap-3 pt-5">
              <button
                type="button"
                onClick={openReschedule}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 text-[13px]"
              >
                <CalendarClock className="w-4 h-4" />
                Reschedule
              </button>
              <button
                type="button"
                onClick={() => setMode("cancel")}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 text-[13px]"
              >
                <AlertTriangle className="w-4 h-4" />
                Cancel Appointment
              </button>
            </div>
          )}
        </div>
      )}

      {mode === "cancel" && (
        <div className="px-6 py-5 space-y-5">
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </div>
          <div className="text-center">
            <h3 className="text-[15px] font-medium text-gray-900 mb-1">
              Cancel this appointment?
            </h3>
            <p className="text-[13px] text-gray-600">
              {booking.patientName || "The patient"} will be marked as cancelled
              across the doctor, nurse and admin views.
            </p>
          </div>
          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-2">
              Reason for Cancellation (Optional)
            </label>
            <Textarea
              rows={3}
              placeholder="Enter reason for cancellation..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              fullWidth
            />
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setMode("view")}
              disabled={isSubmitting}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-[13px] disabled:opacity-50"
            >
              Keep Appointment
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-[13px] disabled:opacity-50"
            >
              {isSubmitting ? "Cancelling..." : "Confirm Cancellation"}
            </button>
          </div>
        </div>
      )}

      {mode === "reschedule" && (
        <div className="px-6 py-5 space-y-4">
          <div>
            <Input
              label="New Date"
              type="date"
              value={rescheduleDate}
              onChange={(e) => setRescheduleDate(e.target.value)}
              fullWidth
            />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-2">
              New Time Slot
            </label>
            <Dropdown
              value={rescheduleSlot}
              onChange={(value) => setRescheduleSlot(value)}
              options={timeSlots.map((s) => ({
                value: s.key,
                label: `${s.from} - ${s.to}`,
              }))}
              placeholder="Select time slot"
              className="w-full shadow-none"
              variant="default"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setMode("view")}
              disabled={isSubmitting}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-[13px] disabled:opacity-50"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleReschedule}
              disabled={isSubmitting}
              className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:opacity-90 transition-colors text-[13px] disabled:opacity-50"
            >
              {isSubmitting ? "Rescheduling..." : "Confirm Reschedule"}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
