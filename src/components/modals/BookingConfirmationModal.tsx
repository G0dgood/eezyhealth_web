"use client";

import { useState } from "react";
import {
  Calendar,
  Clock,
  User,
  MessageSquare,
  FileText,
  CheckCircle,
  XCircle,
} from "lucide-react";
import Modal from "./Modal";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

interface BookingConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string; // Add patientId prop
  bookingDetails: {
    doctorName: string;
    doctorSpecialization: string;
    patientName: string;
    date: string;
    time: string;
    channel: string;
    reason: string;
    doctorId: string;
  };
}

export default function BookingConfirmationModal({
  isOpen,
  onClose,
  patientId,
  bookingDetails,
}: BookingConfirmationModalProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);

  const handleCheckAvailability = async () => {
    try {
      setIsCheckingAvailability(true);

      // Simulate availability check (in real implementation, you would check against existing bookings)
      // For now, we'll assume the slot is available since the user was able to select it
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Check if the selected time slot is still available
      // This would typically involve checking against existing bookings in Firebase
      const isSlotAvailable = await checkSlotAvailability();

      if (isSlotAvailable) {
        toast.success("Slot is available! Redirecting to payment...");

        // Navigate to payment page with booking details
        const paymentUrl = `/nurse/patients/payment?${new URLSearchParams({
          doctorId: bookingDetails.doctorId,
          patientName: bookingDetails.patientName,
          patientId: patientId, // Use the patientId prop
          date: bookingDetails.date,
          time: bookingDetails.time,
          channel: bookingDetails.channel,
          reason: bookingDetails.reason,
        }).toString()}`;

        router.push(paymentUrl);
        onClose();
      } else {
        toast.error("Slot is no longer available", {
          description: "Please select a different time or date",
        });
      }
    } catch (error) {
      toast.error("Failed to check availability", {
        description: "Please try again",
      });
    } finally {
      setIsCheckingAvailability(false);
    }
  };

  // Function to check slot availability against existing bookings
  const checkSlotAvailability = async (): Promise<boolean> => {
    try {
      const { collection, query, where, getDocs } = await import(
        "firebase/firestore"
      );
      const { db } = await import("@/lib/firebase");

      // Check if there are any existing bookings for this doctor, date, and time
      const bookingsRef = collection(db, "Bookings");
      const q = query(
        bookingsRef,
        where("doctorId", "==", bookingDetails.doctorId),
        where("bookingDate", "==", bookingDetails.date),
        where("slot", "==", bookingDetails.time)
      );

      const querySnapshot = await getDocs(q);

      // If no existing bookings found, slot is available
      return querySnapshot.empty;
    } catch (error) {
      console.error("Error checking slot availability:", error);
      // If there's an error checking, assume slot is available to avoid blocking the user
      return true;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeSlot: string) => {
    return timeSlot
      .replace(/_/g, " ")
      .replace(/([A-Z])/g, " $1")
      .trim();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirm Your Appointment"
      size="lg">
      <div className="space-y-6">
        {/* Doctor Information */}
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <User className="w-5 h-5 text-blue-600" />
            <div>
              <h4 className="font-semibold text-blue-900">
                {bookingDetails.doctorName}
              </h4>
              <p className=" text-[10px]  md:text-[12px] text-blue-700">
                {bookingDetails.doctorSpecialization}
              </p>
            </div>
          </div>
        </div>

        {/* Patient Information */}
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <User className="w-5 h-5 text-green-600" />
            <div>
              <h4 className="font-semibold text-green-900">Patient</h4>
              <p className=" text-[10px]  md:text-[12px] text-green-700">
                {bookingDetails.patientName}
              </p>
            </div>
          </div>
        </div>

        {/* Appointment Details */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900">Appointment Details</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date */}
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Calendar className="w-5 h-5 text-gray-600" />
              <div>
                <p className=" text-[10px]  md:text-[12px] text-gray-500">Date</p>
                <p className="font-medium text-gray-900">
                  {formatDate(bookingDetails.date)}
                </p>
              </div>
            </div>

            {/* Time */}
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Clock className="w-5 h-5 text-gray-600" />
              <div>
                <p className=" text-[10px]  md:text-[12px] text-gray-500">Time</p>
                <p className="font-medium text-gray-900">
                  {formatTime(bookingDetails.time)}
                </p>
              </div>
            </div>

            {/* Communication Channel */}
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <MessageSquare className="w-5 h-5 text-gray-600" />
              <div>
                <p className=" text-[10px]  md:text-[12px] text-gray-500">Channel</p>
                <p className="font-medium text-gray-900">
                  {bookingDetails.channel}
                </p>
              </div>
            </div>
          </div>

          {/* Reason */}
          <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
            <FileText className="w-5 h-5 text-gray-600 mt-1" />
            <div className="flex-1 min-w-0">
              <p className=" text-[10px]  md:text-[12px] text-gray-500">Reason</p>
              <p className="font-medium text-gray-900 break-words whitespace-pre-wrap">
                {bookingDetails.reason || "Not specified"}
              </p>
            </div>
          </div>
        </div>

        {/* Important Notes */}
        <div className="bg-yellow-50 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div className=" text-[10px]  md:text-[12px] text-yellow-800">
              <p className="font-medium">Important Notes:</p>
              <ul className="mt-2 space-y-1 list-disc list-inside">
                <li>Please arrive 10 minutes before your appointment time</li>
                <li>Have your ID and insurance information ready</li>
                <li>Cancel at least 24 hours in advance if needed</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium">
            Cancel
          </button>

          <button
            onClick={handleCheckAvailability}
            disabled={isCheckingAvailability}
            className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center space-x-2">
            {isCheckingAvailability ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Checking...</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>Check Availability & Continue</span>
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
