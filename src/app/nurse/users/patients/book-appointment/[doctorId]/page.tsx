"use client";

import { useState } from "react";
import { ArrowLeft, Star, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import Breadcrumb from "@/components/Breadcrumb";

export default function DoctorBookingPage({
  params,
}: {
  params: { doctorId: string };
}) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState("08:00");
  const [selectedChannel, setSelectedChannel] = useState("");
  const [consultationReason, setConsultationReason] = useState("");

  // Sample doctor data
  const doctor = {
    id: "D001",
    name: "Dr Mike Ede",
    specialty: "Dentist",
    experience: "5 Years Experience",
    consultationFee: "N10,000",
    rating: 5,
    image: "/api/placeholder/128/128",
    about:
      "Dr. Prosper Matt is a board-certified dermatologist with over 10 years of experience in diagnosing and treating a wide range of skin conditions. His passion for dermatology stems from a desire to help patients achieve healthy, beautiful skin and improve their overall quality of life.",
  };

  const timeSlots = [
    "08:00",
    "08:30",
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "12:00",
    "12:30",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
  ];

  const communicationChannels = [
    "Video Consultation",
    "Chat Consultation",
    "Voice Call",
    "In-Person",
  ];

  // Calendar functions
  const getDaysInMonth = (date: Date) => {
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
      });
    }

    return days;
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
  };

  const goToNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  const handleContinue = () => {
    // Handle booking continuation
    console.log("Booking details:", {
      doctor: doctor.name,
      date: selectedDate?.toLocaleDateString(),
      time: selectedTime,
      channel: selectedChannel,
      reason: consultationReason,
    });
  };

  const calendarDays = getDaysInMonth(currentMonth);

  return (
    <div>
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: "Nurse", href: "/nurse" },
          { label: "Users", href: "/nurse/users" },
          { label: "Patients", href: "/nurse/users/patients" },
          {
            label: "Book Appointment",
            href: "/nurse/users/patients/book-appointment",
          },
          { label: doctor.name },
        ]}
      />

      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <Link
          href="/nurse/users/patients/book-appointment"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Book Appointment</h1>
          <p className="text-gray-600">
            Schedule your appointment with {doctor.name}
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
                src={doctor.image}
                alt={doctor.name}
                width={128}
                height={128}
                className="w-full h-full rounded-full object-cover border-4 border-gray-200"
              />
            </div>

            {/* Doctor Info */}
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {doctor.name}
            </h2>
            <p className="text-lg text-gray-600 mb-2">{doctor.specialty}</p>
            <p className="text-gray-500 mb-3">{doctor.experience}</p>
            <p className="text-xl font-semibold text-green-600 mb-3">
              {doctor.consultationFee}
            </p>

            {/* Rating */}
            <div className="flex justify-center space-x-1 mb-4">
              {[...Array(doctor.rating)].map((_, i) => (
                <Star
                  key={i}
                  className="w-5 h-5 text-yellow-400 fill-current"
                />
              ))}
            </div>

            {/* About Section */}
            <div className="text-left">
              <h3 className="font-semibold text-gray-900 mb-2">About</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {doctor.about}
              </p>
            </div>
          </div>
        </div>

        {/* Right Panel - Appointment Booking */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            Book Appointment
          </h3>

          {/* Communication Channel */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Communication Channel
            </label>
            <select
              value={selectedChannel}
              onChange={(e) => setSelectedChannel(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent cursor-pointer">
              <option value="">Select Channel</option>
              {communicationChannels.map((channel) => (
                <option key={channel} value={channel}>
                  {channel}
                </option>
              ))}
            </select>
          </div>

          {/* Available Date */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
                    className={`p-2 text-sm rounded-lg transition-colors cursor-pointer ${
                      dayData.selected
                        ? "bg-green-500 text-white"
                        : dayData.currentMonth
                        ? "hover:bg-gray-100 text-gray-900"
                        : "text-gray-400"
                    }`}>
                    {dayData.day}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Available Time */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Available Time
            </label>
            <div className="grid grid-cols-3 gap-2">
              {timeSlots.map((time) => (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={`p-2 text-sm rounded-lg border transition-colors cursor-pointer ${
                    selectedTime === time
                      ? "bg-green-500 text-white border-green-500"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}>
                  {time}
                </button>
              ))}
            </div>
          </div>

          {/* Reason for Consultation */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for consultation
            </label>
            <textarea
              value={consultationReason}
              onChange={(e) => setConsultationReason(e.target.value)}
              placeholder="Reason for consultation"
              rows={3}
              maxLength={200}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {consultationReason.length}/200
            </div>
          </div>

          {/* Continue Button */}
          <button
            onClick={handleContinue}
            className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-medium cursor-pointer">
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
