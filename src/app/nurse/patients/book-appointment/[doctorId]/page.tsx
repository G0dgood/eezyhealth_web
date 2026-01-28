"use client";

import { useState, useEffect, use } from "react";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  MapPin,
  User,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import Breadcrumb from "@/components/Breadcrumb";
import { useSearchParams } from "next/navigation";
import { useGetFirebaseDoctorProfileByIdQuery } from "@/store/doctorFirebaseApi";
import { toast } from "sonner";
import { communicationChannels, renderStars } from "@/components/Options";
import { getErrorMessage } from "@/app/utils/helper";
import { BookingConfirmationModal } from "@/components/modals";
import { DoctorBookingSkeleton } from "@/components/ui/doctor-booking-skeleton";
import Textarea from "@/components/Textarea";
import Dropdown from "@/components/Dropdown";

interface Doctor {
  id: string;
  display_name?: string;
  first_name?: string;
  last_name?: string;
  title?: string;
  specialization?: string;
  experience_yrs?: string;
  rating?: number;
  email: string;
  phone_number?: string;
  isTop?: boolean;
  isActive?: boolean;
  isVerify?: boolean;
  address?: string;
  hospital?: string;
  about?: string;
  availability?: {
    [day: string]: {
      [time: string]: string;
    };
  };
  createdTime?: Date | string;
  date_of_birth?: Date | string;
  doctorId?: string;
  photo_url?: string;
  image?: string;
}

export default function DoctorBookingPage({
  params,
}: {
  params: Promise<{ doctorId: string }>;
}) {
  const { doctorId } = use(params);
  const searchParams = useSearchParams();
  const patientName = searchParams.get("patient");
  const patientId = searchParams.get("patientId");

  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedChannel, setSelectedChannel] = useState("");
  const [consultationReason, setConsultationReason] = useState("");
  const [selectedDayAvailability, setSelectedDayAvailability] = useState<{
    [key: string]: string;
  } | null>(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);

  // Fetch doctor data using RTK
  const {
    data: doctorData,
    isLoading,
    error,
    isError,
  } = useGetFirebaseDoctorProfileByIdQuery(doctorId, {
    skip: !doctorId,
  });

  // Type assertion to ensure proper typing
  const doctor = doctorData as Doctor | undefined;

  const errorMessage = getErrorMessage(error);

  useEffect(() => {
    if (isError) {
      toast.warning(errorMessage);
    }
  }, [isError, errorMessage]);

  // Get day name from date
  const getDayName = (date: Date): string => {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    return days[date.getDay()];
  };

  // Check if a date has availability
  const hasAvailability = (date: Date): boolean => {
    if (!doctor?.availability) return false;
    const dayName = getDayName(date);
    return (
      doctor.availability[dayName] &&
      Object.keys(doctor.availability[dayName]).length > 0
    );
  };

  // Get availability for a specific day
  const getDayAvailability = (date: Date): { [key: string]: string } | null => {
    if (!doctor?.availability) return null;
    const dayName = getDayName(date);
    return doctor.availability[dayName] || null;
  };

  // Calendar functions
  const getDaysInMonth = (
    date: Date
  ): Array<{
    date: Date;
    day: number;
    currentMonth: boolean;
    selected: boolean | null;
    hasAvailability: boolean;
  }> => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add previous month's days
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({
        date: prevDate,
        day: prevDate.getDate(),
        currentMonth: false,
        selected: false,
        hasAvailability: hasAvailability(prevDate),
      });
    }

    // Add current month's days
    for (let i = 1; i <= daysInMonth; i++) {
      const currentDate = new Date(year, month, i);
      days.push({
        date: currentDate,
        day: i,
        currentMonth: true,
        selected:
          selectedDate &&
          selectedDate.getDate() === i &&
          selectedDate.getMonth() === month &&
          selectedDate.getFullYear() === year,
        hasAvailability: hasAvailability(currentDate),
      });
    }

    // Add next month's days to complete the grid
    const remainingDays = 42 - days.length; // 6 rows * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      const nextDate = new Date(year, month + 1, i);
      days.push({
        date: nextDate,
        day: nextDate.getDate(),
        currentMonth: false,
        selected: false,
        hasAvailability: hasAvailability(nextDate),
      });
    }

    return days;
  };

  const goToPreviousMonth = (): void => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
  };

  const goToNextMonth = (): void => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
  };

  const handleDateSelect = (date: Date): void => {
    setSelectedDate(date);
    const availability = getDayAvailability(date);
    setSelectedDayAvailability(availability);
    setSelectedTime(""); // Reset time selection when date changes
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  const handleContinue = (): void => {
    if (!selectedDate || !selectedTime || !selectedChannel) {
      toast.error("Please select date, time, and communication channel");
      return;
    }

    // Show confirmation modal
    setShowConfirmationModal(true);
  };

  const handleCloseModal = (): void => {
    setShowConfirmationModal(false);
  };

  if (isLoading) {
    return <DoctorBookingSkeleton />;
  }

  if (isError || !doctor) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Error Loading Doctor
        </h2>
        <p className="text-gray-600 mb-6">{String(errorMessage)}</p>
        <Link
          href="/nurse/patients/doctors"
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors">
          Back to Doctors
        </Link>
      </div>
    );
  }

  const calendarDays = getDaysInMonth(currentMonth);
  const doctorName =
    doctor.display_name ||
    `${doctor.first_name || ""} ${doctor.last_name || ""}`.trim() ||
    "Unknown Doctor";

  // Prepare booking details for modal
  const bookingDetails = {
    doctorName: doctorName,
    doctorSpecialization: doctor.specialization || "General Practitioner",
    patientName: patientName || "Unknown Patient",
    date: selectedDate?.toISOString() || "",
    time: selectedTime,
    channel: selectedChannel,
    reason: consultationReason,
    doctorId: doctorId,
  };

  return (
    <div>
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: "Nurse Dashboard", href: "/nurse" },
          { label: "Patients", href: "/nurse/patients" },
          { label: "Doctors", href: "/nurse/patients/doctors" },
          { label: "Book Appointment" },
        ]}
      />

      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <Link
          href="/nurse/patients/doctors"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Book Appointment</h1>
          <p className="text-gray-600">
            Schedule appointment for{" "}
            {patientName ? `Patient: ${patientName}` : "Patient"} with{" "}
            {doctorName}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Panel - Doctor's Profile */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="text-center">
            {/* Profile Picture */}
            <div className="w-32 h-32 mx-auto mb-4">
              <Image
                src={
                  doctor.photo_url || doctor.image || "/api/placeholder/128/128"
                }
                alt={doctorName}
                width={128}
                height={128}
                className="w-full h-full rounded-full object-cover border-4 border-gray-200"
              />
            </div>

            {/* Doctor Info */}
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {doctor.title || "Dr."} {doctorName}
            </h2>
            <p className="text-[14px] md:text-[16px] text-gray-600 mb-2">
              {doctor.specialization || "General Practitioner"}
            </p>
            <p className="text-gray-500 mb-3">
              {doctor.experience_yrs
                ? `${doctor.experience_yrs} years experience`
                : "Experience not specified"}
            </p>

            {/* Rating */}
            <div className="flex justify-center space-x-1 mb-4">
              {renderStars(doctor.rating || 0)}
            </div>

            {/* Contact Info */}
            <div className="space-y-2 text-left mb-4">
              <div className="flex items-center  !text-[10px]  !md:text-[12px] text-gray-800">
                <Mail className="w-4 h-4 mr-2" />
                <span className="truncate">{doctor.email}</span>
              </div>
              {doctor.phone_number && (
                <div className="flex items-center  !text-[10px]  !md:text-[12px] text-gray-800">
                  <Phone className="w-4 h-4 mr-2" />
                  <span>{doctor.phone_number}</span>
                </div>
              )}
              {doctor.hospital && (
                <div className="flex items-center  !text-[10px]  !md:text-[12px] text-gray-800">
                  <User className="w-4 h-4 mr-2" />
                  <span className="truncate">{doctor.hospital}</span>
                </div>
              )}
              {doctor.address && (
                <div className="flex items-center  !text-[10px]  !md:text-[12px] text-gray-800">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span className="truncate">{doctor.address}</span>
                </div>
              )}
            </div>

            {/* About Section */}
            {doctor.about && (
              <div className="text-left">
                <h3 className="font-semibold text-gray-900 mb-2">About</h3>
                <p className="text-gray-600  !text-[10px]  !md:text-[12px] leading-relaxed">
                  {doctor.about}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Appointment Booking */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-[16px] md:text-[18px] font-semibold text-gray-900 mb-6">
            Book Appointment
          </h3>

          {/* Communication Channel */}
          <div className="mb-6">
            <label className="block  !text-[10px]  !md:text-[12px] font-medium text-gray-700 mb-2">
              Communication Channel
            </label>
            <Dropdown
              value={selectedChannel}
              onChange={(value) => setSelectedChannel(value)}
              options={[
                { value: "", label: "Select Channel" },
                ...(communicationChannels?.map((channel) => ({
                  value: channel,
                  label: channel
                })) || [])
              ]}
              placeholder="Select Channel"
              className="w-full"
              variant="default"
            />
          </div>

          {/* Available Date */}
          <div className="mb-6">
            <label className="block  !text-[10px]  !md:text-[12px] font-medium text-gray-700 mb-2">
              Select Available Date
            </label>
            <div className="border border-gray-200 rounded-lg p-4">
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={goToPreviousMonth}
                  className="p-1 hover:bg-gray-100 rounded cursor-pointer">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h4 className="font-semibold text-gray-900">
                  {formatDate(currentMonth)}
                </h4>
                <button
                  onClick={goToNextMonth}
                  className="p-1 hover:bg-gray-100 rounded cursor-pointer">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Days of Week */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                  <div
                    key={day}
                    className="text-center text-xs font-medium text-gray-500 py-1">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((dayData, index) => (
                  <button
                    key={index}
                    onClick={() => handleDateSelect(dayData.date)}
                    className={`p-2  !text-[10px]  !md:text-[12px] rounded-lg transition-colors cursor-pointer ${dayData.selected
                      ? "bg-green-500 text-white"
                      : dayData.currentMonth
                        ? dayData.hasAvailability
                          ? "hover:bg-green-100 text-green-700 border-2 border-green-300"
                          : "hover:bg-gray-100 text-gray-900"
                        : "text-gray-400"
                      }`}>
                    {dayData.day}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Show availability for selected day */}
          {selectedDayAvailability && (
            <div className="mb-6">
              <label className="block  !text-[10px]  !md:text-[12px] font-medium text-gray-700 mb-2">
                Available Times for{" "}
                {selectedDate ? getDayName(selectedDate) : ""}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(selectedDayAvailability).map(
                  ([timeSlot, status]) => (
                    <button
                      key={timeSlot}
                      onClick={() => setSelectedTime(timeSlot)}
                      disabled={status !== "available"}
                      className={`p-2  !text-[10px]  !md:text-[12px] rounded-lg border transition-colors cursor-pointer ${selectedTime === timeSlot
                        ? "bg-green-500 text-white border-green-500"
                        : status === "available"
                          ? "bg-white text-gray-700 border-gray-300 hover:bg-green-50"
                          : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                        }`}>
                      {timeSlot
                        .replace(/_/g, " ")
                        .replace(/([A-Z])/g, " $1")
                        .trim()}
                    </button>
                  )
                )}
              </div>
            </div>
          )}

          {/* Reason for Consultation */}
          <div className="mb-6">
            <label className="block  !text-[10px]  !md:text-[12px] font-medium text-gray-700 mb-2">
              Reason for consultation
            </label>
            <Textarea
              value={consultationReason}
              onChange={(e) => setConsultationReason(e.target.value)}
              placeholder="Reason for consultation"
              rows={3}
              maxLength={500}
              fullWidth
              className="resize-none"
            />
            <div className="text-right  !text-[10px]  !md:text-[12px] text-gray-500 mt-1">
              {consultationReason?.length}/500
            </div>
          </div>

          {/* Continue Button */}
          <button
            onClick={handleContinue}
            disabled={!selectedDate || !selectedTime || !selectedChannel}
            className={`w-full py-3 px-6 rounded-lg transition-colors font-medium cursor-pointer ${selectedDate && selectedTime && selectedChannel
              ? "bg-green-600 text-white hover:bg-green-700"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}>
            Continue
          </button>
        </div>
      </div>

      {/* Booking Confirmation Modal */}
      <BookingConfirmationModal
        isOpen={showConfirmationModal}
        onClose={handleCloseModal}
        patientId={patientId || ""}
        bookingDetails={bookingDetails}
      />
    </div>
  );
}
