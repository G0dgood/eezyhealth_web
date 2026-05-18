"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  User,
  Phone,
  Video,
  MessageCircle,
} from "lucide-react";
import BookingDetailModal, { Booking } from "@/components/modals/BookingDetailModal";
import Breadcrumb from "@/components/Breadcrumb";
import Title from "@/components/Title";
import SearchInput from "@/components/SearchInput";
import { useAuth } from "@/contexts/AuthContext";
import { getDaySuffix, getDayName } from "@/utils/dateUtils";
import { CalendarSkeleton } from "@/components/ui/calendar-skeleton";
import { showError } from "@/utils/toast";
import {
  timeSlots,
  monthNames,
  convertSlotToTime,
  getBookingColor,
  getChannelIcon,
} from "@/components/Options";
import { useBookingsByDoctorId } from "@/hooks/useBookingsByDoctorId";
import {
  convertBookingsToStandardFormat,
} from "@/utils/bookingDataConverter";
import { RawBookingData } from "@/types";

interface DayBooking {
  date: string;
  dayName: string;
  dayNumber: string;
  bookings: Booking[];
}

export default function DoctorBookingsPage() {
  const { user } = useAuth();
  const doctorId =
    user && typeof user === "object" && "uid" in user ? user.uid : null;

  // Initialize with current date
  const today = new Date();
  const startOfCurrentWeek = new Date(today);
  startOfCurrentWeek.setDate(today.getDate() - today.getDay());

  const [currentMonth, setCurrentMonth] = useState(() => {
    const month = monthNames[today.getMonth()];
    const year = today.getFullYear();
    return `${month}, ${year}`;
  });
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfCurrentWeek);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const hasNavigatedToCurrentWeek = useRef(false);

  // Fetch bookings using RTK Query
  const {
    data: bookingsData,
    isLoading,
    error,
  } = useBookingsByDoctorId(doctorId);


  // Generate week bookings from API data or create default structure
  const generateWeekBookingsFromData = (
    bookings: unknown[] = [],
    weekStart: Date = new Date(),
  ) => {
    // Convert all bookings to standard format first
    const rawBookings: RawBookingData[] = bookings.map((b: any) => ({
      ...b,
      bookingId: b.bookingId || b.id,
      bookingChannel: b.bookingChannel || b.channel,
      slot: b.slot || b.bookingTime || b.time || "",
      hospital: b.hospital || "",
      paymentStatus: b.paymentStatus || "",
      patientAddress: b.patientAddress || "",
      comments: b.comments || [],
      bookingDate: b.bookingDate || b.date,
    }));

    const standardBookings = convertBookingsToStandardFormat(rawBookings);
    const weekBookings: DayBooking[] = [];

    // Create 7 days starting from weekStart
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(weekStart);
      currentDate.setDate(weekStart.getDate() + i);

      const dayName = getDayName(currentDate);
      const dayNumber = currentDate.getDate();

      // Format date as YYYY-MM-DD in local timezone to avoid timezone shift issues
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, "0");
      const day = String(currentDate.getDate()).padStart(2, "0");
      const dateString = `${year}-${month}-${day}`;

      // Filter bookings for this specific date
      const dayBookings: Booking[] = standardBookings
        .filter((sb) => {
          // Convert timestamp to YYYY-MM-DD
          const date = new Date(sb.bookingDate._seconds * 1000);
          const sbYear = date.getFullYear();
          const sbMonth = String(date.getMonth() + 1).padStart(2, "0");
          const sbDay = String(date.getDate()).padStart(2, "0");
          const sbDateString = `${sbYear}-${sbMonth}-${sbDay}`;
          return sbDateString === dateString;
        })
        .map((sb) => ({
          id: sb.bookingId,
          patientName: sb.patientName || "Unknown Patient",
          date: dateString,
          time: convertSlotToTime(sb.slot),
          type:
            sb.bookingChannel === "physical"
              ? "Physical Booking"
              : "Online Booking",
          status:
            (sb.bookingStatus?.toLowerCase() as
              | "confirmed"
              | "pending"
              | "cancelled") || "pending",
          channel: (() => {
            const channel = (sb.bookingChannel || "").toLowerCase();
            if (channel.includes("video") || channel === "1")
              return "videoCall";
            if (channel.includes("chat") || channel === "2") return "chat";
            if (
              channel.includes("voice") ||
              channel.includes("call") ||
              channel === "3"
            )
              return "voiceCall";
            if (
              channel.includes("physical") ||
              channel.includes("in-person") ||
              channel === "4"
            )
              return "physical";
            return "videoCall";
          })(),
          patientAge: sb.patientAge || 0,
          reason: sb.reason || "No reason provided",
          contactNumber: sb.contactNumber || "No contact",
        }));

      weekBookings.push({
        date: dateString,
        dayName,
        dayNumber: `${dayNumber}${getDaySuffix(dayNumber)}`,
        bookings: dayBookings,
      });
    }

    return weekBookings;
  };

  // Initialize weekBookings with current week
  const [weekBookings, setWeekBookings] = useState<DayBooking[]>(() =>
    generateWeekBookingsFromData([], currentWeekStart),
  );

  const navigateWeek = (direction: "prev" | "next") => {
    const newWeekStart = new Date(currentWeekStart);

    if (direction === "prev") {
      newWeekStart.setDate(newWeekStart.getDate() - 7);
    } else {
      newWeekStart.setDate(newWeekStart.getDate() + 7);
    }

    setCurrentWeekStart(newWeekStart);

    const month = monthNames[newWeekStart.getMonth()];
    const year = newWeekStart.getFullYear();
    setCurrentMonth(`${month}, ${year}`);

    // Generate new week data (you would typically fetch this from API)
    generateWeekBookings(newWeekStart);
  };

  const generateWeekBookings = (weekStart: Date) => {
    // Generate new week bookings with current API data
    const newWeekBookings = generateWeekBookingsFromData(
      bookingsData || [],
      weekStart,
    );
    setWeekBookings(newWeekBookings);
  };

  const handleBookingClick = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedBooking(null);
  };

  // Show error toast when there's an error
  useEffect(() => {
    if (error) {
      showError("Booking Error", "Failed to load bookings. Please try again.");
    }
  }, [error]);

  // Update week bookings when API data changes
  useEffect(() => {
    if (bookingsData && !isLoading) {
      const newWeekBookings = generateWeekBookingsFromData(
        bookingsData,
        currentWeekStart,
      );
      setWeekBookings(newWeekBookings);
    }
  }, [bookingsData, isLoading, currentWeekStart]);

  // Auto-navigate to current week when bookings are loaded
  useEffect(() => {
    if (
      bookingsData &&
      !isLoading &&
      bookingsData.length > 0 &&
      !hasNavigatedToCurrentWeek.current
    ) {
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());

      setCurrentWeekStart(startOfWeek);
      const month = monthNames[today.getMonth()];
      const year = today.getFullYear();
      setCurrentMonth(`${month}, ${year}`);
      hasNavigatedToCurrentWeek.current = true;
    }
  }, [bookingsData, isLoading]);

  const getBookingAtTime = (dayIndex: number, time: string) => {
    const day = weekBookings[dayIndex];
    if (!day) return null;

    return day.bookings.find((booking) => booking.time === time);
  };

  return (
    <div>
      <div className="mb-6">
        <Breadcrumb
          homeHref="/doctor"
          items={[
            { label: "Doctor", href: "/doctor" },
            { label: "Bookings", href: "/doctor/bookings" },
          ]}
        />
      </div>

      <Title title="Bookings" />

      {/* Search and Navigation */}
      <div className="flex-1 max-w-md mb-6">
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search bookings..."
        />
      </div>
      {/* Calendar Grid */}
      {isLoading ? (
        <CalendarSkeleton />
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Calendar Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                {currentMonth}
              </h3>
              <p className="text-[10px] md:text-[12px] text-gray-500">
                {currentWeekStart.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}{" "}
                -{" "}
                {new Date(
                  currentWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000,
                ).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  const today = new Date();
                  const startOfWeek = new Date(today);
                  startOfWeek.setDate(today.getDate() - today.getDay());
                  setCurrentWeekStart(startOfWeek);
                  generateWeekBookings(startOfWeek);

                  const month = monthNames[today.getMonth()];
                  const year = today.getFullYear();
                  setCurrentMonth(`${month}, ${year}`);
                }}
                className="px-3 py-1 text-[10px] md:text-[12px] bg-[#44CE2D] text-white rounded-lg hover:bg-[#3bb025] transition-colors"
              >
                Today
              </button>
              <div className="flex gap-3">
                <button
                  onClick={() => navigateWeek("prev")}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-600" />
                </button>
                <button
                  onClick={() => navigateWeek("next")}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="overflow-x-auto">
            <div className="min-w-[1000px]">
              {/* Day Headers */}
              <div className="grid grid-cols-8 border-b border-gray-200">
                <div className="p-3 text-[10px] md:text-[12px] font-medium text-gray-500 bg-gray-50"></div>
                {weekBookings?.map((day) => (
                  <div
                    key={day.date}
                    className="p-3 text-[10px] md:text-[12px] font-medium text-gray-900 bg-gray-50 text-center"
                  >
                    <div className="font-semibold">{day.dayName}</div>
                    <div className="text-xs text-gray-500">{day.dayNumber}</div>
                  </div>
                ))}
              </div>

              {/* Time Slots */}
              {timeSlots?.map((time) => (
                <div
                  key={time.key}
                  className="grid grid-cols-8 border-b border-gray-200 last:border-b-0 whitespace-nowrap"
                >
                  {/* Time Label */}
                  <div className="p-3 text-[9px] md:text-[11px] text-gray-600 bg-gray-50 flex items-center justify-center border-r border-gray-200">
                    {time.from} {"->"} {time.to}
                  </div>

                  {/* Day Columns */}
                  {weekBookings?.map((day, dayIndex) => {
                    const booking = getBookingAtTime(dayIndex, time.from);

                    return (
                      <div
                        key={`${day.date}-${time.key}`}
                        className={`p-2 border-r border-gray-200 last:border-r-0 min-h-[60px] ${booking
                          ? "cursor-pointer hover:scale-105 transition-transform"
                          : ""
                          }`}
                      >
                        {booking && (
                          <div
                            onClick={() => handleBookingClick(booking)}
                            className={`${getBookingColor(
                              booking.channel,
                            )} text-white p-2 rounded-lg text-xs h-full flex flex-col justify-between`}
                          >
                            <div className="flex items-center gap-1 mb-1">
                              {getChannelIcon(booking.channel)}
                              <span className="font-medium">
                                {booking.type}
                              </span>
                            </div>
                            <div className="font-semibold">
                              {booking.patientName}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Booking Detail Modal */}
      <BookingDetailModal
        isOpen={isDetailModalOpen}
        selectedBooking={selectedBooking}
        onClose={closeDetailModal}
      />
    </div>
  );
}
