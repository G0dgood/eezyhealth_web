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
import DoctorBookingDetailModal from "@/components/modals/DoctorBookingDetailModal";
import Breadcrumb from "@/components/Breadcrumb";
import Title from "@/components/Title";
import SearchInput from "@/components/SearchInput";
import { useAuth } from "@/contexts/AuthContext";
import { getDaySuffix, getDayName } from "@/utils/dateUtils";
import { CalendarSkeleton } from "@/components/ui/calendar-skeleton";
import { showError } from "@/utils/toast";
import { timeSlots, monthNames, convertSlotToTime } from "@/components/Options";
import { useBookingsByDoctorId } from "@/hooks/useBookingsByDoctorId";

interface Booking {
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
    weekStart: Date = new Date()
  ) => {
    const weekBookings: DayBooking[] = [];

    // Create 7 days starting from weekStart
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(weekStart);
      currentDate.setDate(weekStart.getDate() + i);

      const dayName = getDayName(currentDate);
      const dayNumber = currentDate.getDate();

      // Format date as YYYY-MM-DD in local timezone to avoid timezone shift issues
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const day = String(currentDate.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;

      // Filter bookings for this specific date
      const dayBookings: Booking[] = [];
      if (bookings && bookings.length > 0) {
        bookings.forEach((booking) => {
          if (typeof booking === "object" && booking !== null) {
            const bookingObj = booking as Record<string, unknown>;

            // Handle Firestore timestamp conversion
            let bookingDate: string;
            if (
              bookingObj.bookingDate &&
              typeof bookingObj.bookingDate === "object" &&
              bookingObj.bookingDate !== null
            ) {
              const timestamp = bookingObj.bookingDate as {
                seconds: number;
                nanoseconds: number;
              };
              const date = new Date(timestamp.seconds * 1000);

              // Format date as YYYY-MM-DD in local timezone to avoid timezone shift issues
              const year = date.getFullYear();
              const month = String(date.getMonth() + 1).padStart(2, '0');
              const dayStr = String(date.getDate()).padStart(2, '0');
              bookingDate = `${year}-${month}-${dayStr}`; // Format as YYYY-MM-DD
            } else {
              bookingDate = String(
                bookingObj.bookingDate || bookingObj.date || ""
              );
            }

            if (bookingDate === dateString) {
              // Transform API data to match our Booking interface
              const transformedBooking: Booking = {
                id: String(bookingObj.id || bookingObj.bookingId || ""),
                patientName:
                  String(bookingObj.patientName || "") ||
                  (typeof bookingObj.patient === "object" &&
                    bookingObj.patient !== null &&
                    "name" in bookingObj.patient
                    ? String(
                      (bookingObj.patient as Record<string, unknown>).name ||
                      ""
                    )
                    : "") ||
                  "Unknown Patient",
                date: dateString,
                time: convertSlotToTime(
                  String(bookingObj.slot || bookingObj.time || "")
                ),
                type:
                  bookingObj.bookingChannel === "physical"
                    ? "Physical Booking"
                    : "Online Booking",
                status: (() => {
                  const status = String(
                    bookingObj.bookingStatus || ""
                  ).toLowerCase();
                  return status === "confirmed" || status === "cancelled"
                    ? status
                    : "pending";
                })(),
                channel: (() => {
                  const channel = String(bookingObj.bookingChannel || "");
                  // Convert numeric channel codes to string values
                  if (channel === "1" || channel === "videoCall")
                    return "videoCall";
                  if (channel === "2" || channel === "chat") return "chat";
                  if (channel === "3" || channel === "voiceCall")
                    return "voiceCall";
                  if (channel === "4" || channel === "physical")
                    return "physical";
                  return "videoCall";
                })(),
                patientAge:
                  Number(bookingObj.patientAge) ||
                  (typeof bookingObj.patient === "object" &&
                    bookingObj.patient !== null &&
                    "age" in bookingObj.patient
                    ? Number(
                      (bookingObj.patient as Record<string, unknown>).age
                    ) || 0
                    : 0),
                reason: String(
                  bookingObj.reason ||
                  bookingObj.description ||
                  "No reason provided"
                ),
                contactNumber:
                  String(bookingObj.contactNumber || "") ||
                  (typeof bookingObj.patient === "object" &&
                    bookingObj.patient !== null &&
                    "phone" in bookingObj.patient
                    ? String(
                      (bookingObj.patient as Record<string, unknown>).phone ||
                      ""
                    )
                    : "") ||
                  "No contact",
              };
              dayBookings.push(transformedBooking);
            }
          }
        });
      }

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
    generateWeekBookingsFromData([], currentWeekStart)
  );

  const getBookingColor = (channel: string) => {
    switch (channel) {
      case "videoCall":
        return "bg-green-500";
      case "chat":
        return "bg-blue-500";
      case "voiceCall":
        return "bg-purple-500";
      case "physical":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

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
      weekStart
    );
    setWeekBookings(newWeekBookings);
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case "videoCall":
        return <Video className="w-3 h-3" />;
      case "chat":
        return <MessageCircle className="w-3 h-3" />;
      case "voiceCall":
        return <Phone className="w-3 h-3" />;
      case "physical":
        return <User className="w-3 h-3" />;
      default:
        return <Calendar className="w-3 h-3" />;
    }
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
        currentWeekStart
      );
      setWeekBookings(newWeekBookings);
    }
  }, [bookingsData, isLoading, currentWeekStart]);

  // Auto-navigate to current week when bookings are loaded
  useEffect(() => {
    if (bookingsData && !isLoading && bookingsData.length > 0 && !hasNavigatedToCurrentWeek.current) {
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
              <p className="text-sm text-gray-500">
                {currentWeekStart.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}{" "}
                -{" "}
                {new Date(
                  currentWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000
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
                className="px-3 py-1 text-sm bg-[#44CE2D] text-white rounded-lg hover:bg-[#3bb025] transition-colors">
                Today
              </button>
              <div className="flex gap-3">
                <button
                  onClick={() => navigateWeek("prev")}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <ChevronLeft className="w-4 h-4 text-gray-600" />
                </button>
                <button
                  onClick={() => navigateWeek("next")}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
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
                <div className="p-3 text-sm font-medium text-gray-500 bg-gray-50"></div>
                {weekBookings?.map((day) => (
                  <div
                    key={day.date}
                    className="p-3 text-sm font-medium text-gray-900 bg-gray-50 text-center">
                    <div className="font-semibold">{day.dayName}</div>
                    <div className="text-xs text-gray-500">{day.dayNumber}</div>
                  </div>
                ))}
              </div>

              {/* Time Slots */}
              {timeSlots?.map((time) => (
                <div
                  key={time.key}
                  className="grid grid-cols-8 border-b border-gray-200 last:border-b-0 whitespace-nowrap">
                  {/* Time Label */}
                  <div className="p-3 text-sm text-gray-600 bg-gray-50 flex items-center justify-center border-r border-gray-200">
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
                          }`}>
                        {booking && (
                          <div
                            onClick={() => handleBookingClick(booking)}
                            className={`${getBookingColor(
                              booking.channel
                            )} text-white p-2 rounded-lg text-xs h-full flex flex-col justify-between`}>
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
      <DoctorBookingDetailModal
        isOpen={isDetailModalOpen}
        booking={selectedBooking}
        onClose={closeDetailModal}
      />
    </div>
  );
}
