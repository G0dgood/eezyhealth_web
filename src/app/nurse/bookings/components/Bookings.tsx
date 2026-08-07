"use client";

import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  User,
  Phone,
  Video,
  MessageCircle,
  X,
} from "lucide-react";
import SearchInput from "@/components/SearchInput";
import { CalendarSkeleton } from "@/components/ui/calendar-skeleton";
import {
  getBookingColor,
  getChannelIcon,
  monthNames,
  timeSlots,
} from "@/components/Options";
import { useGetBookingsQuery } from "@/store/bookingApi";
import { convertBookingsToStandardFormat } from "@/utils/bookingDataConverter";
import { useApiError } from "@/hooks/useApiError";
import BookingDetailModal, { Booking } from "@/components/modals/BookingDetailModal";

interface LocalBooking extends Booking {
  doctorName?: string;
  doctorId?: string;
}

interface DayBooking {
  date: string;
  dayName: string;
  dayNumber: string;
  bookings: LocalBooking[];
}

export default function Bookings({ doctorId }: { doctorId?: string } = {}) {
  // Helper function for day suffix
  const getDaySuffix = (day: number) => {
    if (day >= 11 && day <= 13) return "th";
    switch (day % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  };

  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date();
    const month = monthNames[today.getMonth()];
    const year = today.getFullYear();
    return `${month}, ${year}`;
  });
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    return startOfWeek;
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<LocalBooking | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedGroupBookings, setSelectedGroupBookings] = useState<LocalBooking[]>([]);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const { data: bookings, isLoading, error, refetch } = useGetBookingsQuery({});



  useApiError(!!error, error, "Failed to load bookings. Please try again.");

  // Retry function for failed requests
  const handleRetry = () => {
    refetch();
  };

  // Convert raw booking data to standard format
  const standardizedBookings = useMemo(() => {
    const data = Array.isArray(bookings) ? bookings : bookings?.bookings || [];
    // Optional doctor filter (used by the admin Booking page dropdown).
    const scoped = doctorId
      ? data.filter(
          (b: any) => (b.doctorId || b.doctor_id || b.doctorUid) === doctorId,
        )
      : data;
    if (!scoped || scoped.length === 0) return [];
    return convertBookingsToStandardFormat(scoped);
  }, [bookings, doctorId]);

  // Convert standardized bookings to the sample data format
  const convertedWeekBookings = useMemo(() => {
    if (!standardizedBookings || standardizedBookings.length === 0) return [];

    // Group bookings by date
    const bookingsByDate = standardizedBookings.reduce(
      (acc, booking) => {
        if (
          !booking.bookingDate ||
          typeof booking.bookingDate._seconds !== "number"
        )
          return acc;
        const bookingDate = new Date(booking.bookingDate._seconds * 1000);
        if (isNaN(bookingDate.getTime())) return acc;

        // Format date as YYYY-MM-DD in local timezone to avoid timezone shift issues
        const year = bookingDate.getFullYear();
        const month = String(bookingDate.getMonth() + 1).padStart(2, "0");
        const day = String(bookingDate.getDate()).padStart(2, "0");
        const dateKey = `${year}-${month}-${day}`;

        if (!acc[dateKey]) {
          acc[dateKey] = [];
        }

        // Convert slot to time format (e.g., "morning_6am" -> "06:00 AM")
        const slotToTime = (slot: string): string => {
          const slotLower = (slot || "").toLowerCase();
          // Extract hour and period
          const hourMatch = slotLower.match(/(\d+)(am|pm)/);
          if (!hourMatch) return "06:00 AM";

          const hour = parseInt(hourMatch[1]);
          const period = hourMatch[2].toUpperCase();

          // Format as HH:MM PM/AM
          const hourFormatted = hour.toString().padStart(2, "0");
          return `${hourFormatted}:00 ${period}`;
        };

        // Map booking channel to standardized channel values
        const mapChannel = (
          channel: string,
        ): "videoCall" | "chat" | "voiceCall" | "physical" => {
          const channelLower = (channel || "").toLowerCase();

          if (
            channelLower.includes("video") ||
            channelLower.includes("videocall")
          ) {
            return "videoCall";
          }
          if (channelLower.includes("chat")) {
            return "chat";
          }
          if (
            channelLower.includes("voice") ||
            channelLower.includes("voicecall") ||
            channelLower.includes("call")
          ) {
            return "voiceCall";
          }
          if (
            channelLower.includes("physical") ||
            channelLower.includes("in-person")
          ) {
            return "physical";
          }
          // Default fallback

          return "videoCall";
        };

        // Convert to the exact sample format
        acc[dateKey].push({
          id: booking.bookingId,
          patientName: booking.patientName || "Unknown Patient",
          doctorName: booking.doctorName || "Unknown Doctor",
          doctorId: booking.doctorId || "",
          date: dateKey,
          time: slotToTime(booking.slot),
          type:
            mapChannel(booking.bookingChannel) === "physical"
              ? "Physical Booking"
              : "Online Booking",
          status: ((s, bookingDate) => {
            const status = (s || "").toLowerCase();
            const now = new Date();
            let apptDate = null;
            if (bookingDate) {
              const bDate = bookingDate as any;
              if (typeof bDate === "object") {
                if (bDate._seconds) apptDate = new Date(bDate._seconds * 1000);
                else if (bDate.seconds) apptDate = new Date(bDate.seconds * 1000);
              } else {
                apptDate = new Date(bDate);
              }
            }
            const isPassed = apptDate && apptDate < now && status !== "completed" && status !== "cancelled" && status !== "canceled" && status !== "missed" && status !== "accepted" && status !== "confirmed";

            if (isPassed) return "passed";
            if (status === "accepted" || status === "confirmed")
              return "confirmed";
            if (status === "cancelled" || status === "rejected")
              return "cancelled";
            return "pending";
          })(booking.bookingStatus, booking.bookingDate),
          channel: mapChannel(booking.bookingChannel),
          patientAge: booking.patientAge || 0,
          reason: booking.reason || "Consultation",
          contactNumber: booking.contactNumber || "",
        });

        return acc;
      },
      {} as Record<string, LocalBooking[]>,
    );

    // Convert to DayBooking format
    return Object.entries(bookingsByDate).map(([date, bookings]) => {
      // Parse the date string (YYYY-MM-DD) to get day name and number
      const [year, month, day] = date.split("-").map(Number);
      const dateObj = new Date(year, month - 1, day);
      const dayNames = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
      const dayName = dayNames[dateObj.getDay()];
      const dayNumber = day;

      return {
        date,
        dayName,
        dayNumber: `${dayNumber}${getDaySuffix(dayNumber)}`,
        bookings,
      };
    });
  }, [standardizedBookings]);

  // Week bookings state - populated from converted data
  const [weekBookings, setWeekBookings] = useState<DayBooking[]>([]);

  // Generate initial week structure
  useEffect(() => {
    generateWeekBookings(currentWeekStart);
  }, []);

  // Update weekBookings when converted data is available
  useEffect(() => {
    // Always generate week structure, regardless of whether there are bookings
    generateWeekBookings(currentWeekStart);
  }, [convertedWeekBookings, currentWeekStart]);

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
    // Always generate a full week structure (7 days)
    const newWeekBookings: DayBooking[] = [];

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(weekStart);
      currentDate.setDate(weekStart.getDate() + i);

      const dayNames = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
      const dayName = dayNames[currentDate.getDay()];
      const dayNumber = currentDate.getDate();

      // Format date as YYYY-MM-DD in local timezone to avoid timezone shift issues
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, "0");
      const day = String(currentDate.getDate()).padStart(2, "0");
      const dateKey = `${year}-${month}-${day}`;

      // Find bookings for this specific date
      const dayBookings =
        convertedWeekBookings?.find((dayBooking) => dayBooking.date === dateKey)
          ?.bookings || [];

      newWeekBookings.push({
        date: dateKey,
        dayName,
        dayNumber: `${dayNumber}${getDaySuffix(dayNumber)}`,
        bookings: dayBookings || [],
      });
    }

    // Debug: Log bookings for each day
    newWeekBookings.forEach((day) => {
      if (day.bookings.length > 0) {
        day.bookings.forEach((booking) => { });
      }
    });
    setWeekBookings(newWeekBookings);
  };

  const handleBookingClick = (booking: LocalBooking) => {
    setSelectedBooking(booking);
    setIsDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedBooking(null);
  };

  // Simulate loading for demonstration
  useEffect(() => {
    const timer = setTimeout(() => { }, 2000); // Show skeleton for 2 seconds

    return () => clearTimeout(timer);
  }, []);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isDetailModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    // Cleanup function to restore scroll when component unmounts
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isDetailModalOpen]);

  const getBookingsAtTime = (dayIndex: number, time: string) => {
    const day = weekBookings[dayIndex];
    if (!day) return [];

    return day.bookings.filter((booking) => booking.time === time);
  };

  const getNextTime = (currentTimeSlot: {
    key: string;
    from: string;
    to: string;
  }) => {
    const timeIndex = timeSlots.findIndex(
      (slot) => slot.key === currentTimeSlot.key,
    );
    if (timeIndex === -1 || timeIndex === timeSlots.length - 1) {
      return currentTimeSlot.to;
    }
    return timeSlots[timeIndex + 1].from;
  };

  return (
    <div>
      {/* Search and Navigation */}
      <div className="flex-1 max-w-md mb-6">
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search bookings..."
        />
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="mb-6">
          <CalendarSkeleton />
        </div>
      )}

      {/* Calendar Grid */}
      {!isLoading && !error && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* Calendar Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                {currentMonth}
              </h3>
              <p className=" !text-[10px]  !md:text-[12px] text-gray-500">
                {currentWeekStart.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
                -
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
                className="px-3 py-1  !text-[10px]  !md:text-[12px] bg-[#44CE2D] text-white rounded-lg hover:bg-[#3bb025] transition-colors"
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
                <div className="p-3  !text-[10px]  !md:text-[12px] font-medium text-gray-500 bg-gray-50"></div>
                {weekBookings.map((day) => (
                  <div
                    key={day.date}
                    className="p-3  !text-[10px]  !md:text-[12px] font-medium text-gray-900 bg-gray-50 text-center"
                  >
                    <div className="font-semibold">{day.dayName}</div>
                    <div className="text-xs text-gray-500">{day.dayNumber}</div>
                  </div>
                ))}
              </div>

              {/* Time Slots */}
              {timeSlots.map((timeSlot, timeIndex) => (
                <div
                  key={timeSlot.key}
                  className="grid grid-cols-8 border-b border-gray-200 last:border-b-0 whitespace-nowrap"
                >
                  {/* Time Label */}
                  <div className="p-3  !text-[10px]  !md:text-[12px] text-gray-600 bg-gray-50 flex items-center justify-center border-r border-gray-200">
                    {timeSlot.from}
                  </div>

                  {/* Day Columns */}
                  {weekBookings.map((day, dayIndex) => {
                    const slotBookings = getBookingsAtTime(dayIndex, timeSlot.from);
                    const hasBookings = slotBookings.length > 0;

                    return (
                      <div
                        key={`${day.date}-${timeSlot.key}`}
                        className={`p-2 border-r border-gray-200 last:border-r-0 min-h-[80px] flex flex-col gap-1 justify-center ${hasBookings
                          ? "cursor-pointer"
                          : ""
                          }`}
                        onClick={() => {
                          if (slotBookings.length > 1) {
                            setSelectedGroupBookings(slotBookings);
                            setIsGroupModalOpen(true);
                          }
                        }}
                      >
                        {hasBookings && (
                          slotBookings.length === 1 ? (
                            (() => {
                              const booking = slotBookings[0];
                              return (
                                <div
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleBookingClick(booking);
                                  }}
                                  className={`${getBookingColor(
                                    booking.channel,
                                  )} text-white p-2 rounded-lg text-xs h-full flex flex-col justify-between hover:scale-105 transition-transform`}
                                >
                                  <div className="flex items-center gap-1 mb-1">
                                    {getChannelIcon(booking.channel)}
                                    <span className="font-medium text-[9px] truncate">
                                      {booking.type}
                                    </span>
                                  </div>
                                  <div className="font-semibold text-[10px] truncate">
                                    {booking.patientName}
                                  </div>
                                  <div className="text-[9px] opacity-90 truncate mt-0.5">
                                    Dr. {booking.doctorName || "Unknown"}
                                  </div>
                                </div>
                              );
                            })()
                          ) : (
                            <div className="flex flex-col gap-1 w-full">
                              {slotBookings.slice(0, 3).map((booking, idx) => (
                                <div
                                  key={booking.id || idx}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleBookingClick(booking);
                                  }}
                                  className={`${getBookingColor(
                                    booking.channel,
                                  )} text-white px-2 py-1 rounded text-[10px] flex items-center justify-between hover:scale-105 transition-transform`}
                                  title={`Patient: ${booking.patientName}, Dr. ${booking.doctorName}`}
                                >
                                  <span className="font-medium truncate max-w-[80px]">
                                    {booking.patientName}
                                  </span>
                                  <span className="opacity-95 text-[9px] truncate max-w-[80px] ml-1">
                                    Dr. {booking.doctorName?.split(" ").pop() || "Doc"}
                                  </span>
                                </div>
                              ))}
                              {slotBookings.length > 3 && (
                                <div className="text-[10px] text-center text-gray-500 font-semibold bg-gray-100 py-0.5 rounded">
                                  + {slotBookings.length - 3} more...
                                </div>
                              )}
                            </div>
                          )
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

      {/* Group Booking Modal */}
      <BookingGroupModal
        isOpen={isGroupModalOpen}
        bookings={selectedGroupBookings}
        onClose={() => setIsGroupModalOpen(false)}
        onSelectBooking={(booking) => {
          setIsGroupModalOpen(false);
          setSelectedBooking(booking);
          setIsDetailModalOpen(true);
        }}
      />
    </div>
  );
}

interface BookingGroupModalProps {
  isOpen: boolean;
  bookings: LocalBooking[];
  onClose: () => void;
  onSelectBooking: (booking: LocalBooking) => void;
}

const BookingGroupModal: React.FC<BookingGroupModalProps> = ({
  isOpen,
  bookings,
  onClose,
  onSelectBooking,
}) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-[#00000051] bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Bookings for {bookings[0]?.time} on {bookings[0]?.date}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          <p className="text-sm text-gray-500 mb-4">
            There are {bookings.length} appointments scheduled for this time slot:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                onClick={() => onSelectBooking(booking)}
                className={`p-4 border border-gray-200 rounded-lg hover:border-green-500 cursor-pointer transition-colors duration-150 flex flex-col justify-between`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                    <span className="text-xs font-semibold text-gray-700 capitalize">
                      {booking.type}
                    </span>
                  </div>
                  <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                    {booking.channel.replace("Call", " Call")}
                  </span>
                </div>
                <div className="space-y-1 mt-2">
                  <h4 className="font-semibold text-gray-900 text-sm">
                    Patient: {booking.patientName}
                  </h4>
                  <p className="text-xs text-gray-600 font-medium">
                    Doctor: {booking.doctorName || "Unknown Doctor"}
                  </p>
                  {booking.reason && (
                    <p className="text-[11px] text-gray-500 italic mt-1 line-clamp-1">
                      &quot;{booking.reason}&quot;
                    </p>
                  )}
                </div>
                <div className="mt-4 flex justify-end">
                  <button className="text-xs text-green-600 font-semibold hover:underline">
                    View Details →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
