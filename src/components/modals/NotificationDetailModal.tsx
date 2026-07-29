"use client";

import React from "react";
import Modal from "./Modal";
import {
  Bell,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Calendar,
  User,
  Clock,
  ExternalLink,
  Check,
} from "lucide-react";
import { useRouter } from "next/navigation";

export interface NotificationDetail {
  id: string;
  type: "info" | "warning" | "success" | "error";
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
  category?: string;
  data?: Record<string, any>;
}

interface NotificationDetailModalProps {
  notification: NotificationDetail | null;
  isOpen: boolean;
  onClose: () => void;
  onMarkAsRead?: (id: string) => void;
}

export default function NotificationDetailModal({
  notification,
  isOpen,
  onClose,
  onMarkAsRead,
}: NotificationDetailModalProps) {
  const router = useRouter();

  if (!notification || !isOpen) return null;

  const type = notification.type || "info";

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-7 h-7 text-green-500" />;
      case "warning":
        return <AlertTriangle className="w-7 h-7 text-yellow-500" />;
      case "error":
        return <XCircle className="w-7 h-7 text-red-500" />;
      default:
        return <Bell className="w-7 h-7 text-blue-500" />;
    }
  };

  const getBadgeClass = () => {
    switch (type) {
      case "success":
        return "bg-green-100 text-green-800 border-green-200";
      case "warning":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "error":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  const data = notification.data || {};
  const hasExtraData =
    data.patientName || data.bookingId || data.slot || data.bookingDate || data.reason;

  const handleNavigateToAppointments = () => {
    onClose();
    router.push("/doctor/appointments");
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Notification Details" size="md">
      <div className="space-y-4 py-1">
        {/* Header Icon + Title + Category */}
        <div className="flex items-start gap-3 md:gap-4">
          <div className="w-11 h-11 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0 border border-gray-100">
            {getIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span
                className={`text-[10px] md:text-xs font-semibold px-2.5 py-0.5 rounded-full border ${getBadgeClass()}`}
              >
                {notification.category || type.toUpperCase()}
              </span>
              <span className="text-[10px] md:text-xs text-gray-400">{notification.timestamp}</span>
            </div>
            <h3 className="text-[14px] md:text-[16px] font-semibold text-gray-900 leading-snug">
              {notification.title}
            </h3>
          </div>
        </div>

        {/* Main Body Description */}
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 text-[12px] md:text-[14px] text-gray-700 leading-relaxed">
          {notification.description}
        </div>

        {/* Structured Details if available */}
        {hasExtraData && (
          <div className="space-y-2 bg-gray-50/70 rounded-xl p-4 border border-gray-100 text-[11px] md:text-[12px] text-gray-600">
            <h4 className="font-semibold text-gray-800 text-[10px] md:text-[12px] uppercase tracking-wider mb-2">
              Appointment Info
            </h4>
            {data.patientName && (
              <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
                <span className="flex items-center text-gray-500">
                  <User className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                  Patient
                </span>
                <span className="font-medium text-gray-900">{String(data.patientName)}</span>
              </div>
            )}
            {(data.slot || data.appointmentTime) && (
              <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
                <span className="flex items-center text-gray-500">
                  <Clock className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                  Time Slot
                </span>
                <span className="font-medium text-gray-900">
                  {String(data.slot || data.appointmentTime)}
                </span>
              </div>
            )}
            {data.reason && (
              <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
                <span className="flex items-center text-gray-500">Reason</span>
                <span className="font-medium text-gray-900">{String(data.reason)}</span>
              </div>
            )}
            {data.bookingId && (
              <div className="flex items-center justify-between py-1.5">
                <span className="flex items-center text-gray-500">
                  <Calendar className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                  Booking ID
                </span>
                <span className="font-mono text-gray-700 bg-gray-200 px-1.5 py-0.5 rounded text-[10px] md:text-[12px]">
                  {String(data.bookingId)}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-gray-100 flex-wrap">
          <div>
            {!notification.isRead && onMarkAsRead && (
              <button
                type="button"
                onClick={() => onMarkAsRead(notification.id)}
                className="inline-flex items-center text-[11px] md:text-[12px] font-medium text-[#3bb025] hover:text-[#32961f] transition-colors cursor-pointer"
              >
                <Check className="w-3.5 h-3.5 mr-1" />
                Mark as read
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {(data.bookingId ||
              notification.category === "newPatientBooking" ||
              notification.title.toLowerCase().includes("booking") ||
              notification.title.toLowerCase().includes("appointment")) && (
              <button
                type="button"
                onClick={handleNavigateToAppointments}
                className="px-3.5 py-2 text-[11px] md:text-[12px] font-medium bg-blue-50 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                View Appointments
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[11px] md:text-[12px] font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
