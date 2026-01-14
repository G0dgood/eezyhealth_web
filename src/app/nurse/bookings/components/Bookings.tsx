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
import { showError, showNetworkError } from "@/utils/toast";
import { toast } from "sonner";

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

export default function Bookings() {
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
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const { data: bookings, isLoading, error, refetch } = useGetBookingsQuery({});

  // Handle error state
  useEffect(() => {
    if (error) {
      console.error("Bookings API Error:", error);

      // Show appropriate error message
      if ('status' in error) {
        if (error.status === 'FETCH_ERROR' || error.status === 'TIMEOUT_ERROR') {
          showNetworkError();
        } else if (error.status === 'PARSING_ERROR') {
          showError("Data Error", "Failed to parse booking data. Please try again.");
        } else if (error.status === 'CUSTOM_ERROR') {
          showError("Booking Error", "Unable to load bookings. Please try again.");
        } else {
          showError("Booking Error", "Something went wrong while loading bookings.");
        }
      } else {
        showError("Booking Error", "Unable to load bookings. Please try again.");
      }
    }
  }, [error]);

  // Retry function for failed requests
  const handleRetry = () => {

    refetch();
  };

  // Convert raw booking data to standard format
  const standardizedBookings = useMemo(() => {
    if (!bookings?.bookings) return [];
    return convertBookingsToStandardFormat(bookings.bookings);
  }, [bookings?.bookings]);



  // Convert standardized bookings to the sample data format
  const convertedWeekBookings = useMemo(() => {
    if (!standardizedBookings || standardizedBookings.length === 0) return [];

    // Group bookings by date
    const bookingsByDate = standardizedBookings.reduce((acc, booking) => {
      const bookingDate = new Date(booking.bookingDate._seconds * 1000);

      // Format date as YYYY-MM-DD in local timezone to avoid timezone shift issues
      const year = bookingDate.getFullYear();
      const month = String(bookingDate.getMonth() + 1).padStart(2, '0');
      const day = String(bookingDate.getDate()).padStart(2, '0');
      const dateKey = `${year}-${month}-${day}`;

      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }

      // Convert slot to time format (e.g., "morning_6am" -> "06:00 AM")
      const slotToTime = (slot: string): string => {
        const slotLower = slot.toLowerCase();
        // Extract hour and period
        const hourMatch = slotLower.match(/(\d+)(am|pm)/);
        if (!hourMatch) return "06:00 AM";

        const hour = parseInt(hourMatch[1]);
        const period = hourMatch[2].toUpperCase();

        // Format as HH:MM PM/AM
        const hourFormatted = hour.toString().padStart(2, '0');
        return `${hourFormatted}:00 ${period}`;
      };

      // Map booking channel to standardized channel values
      const mapChannel = (channel: string): "videoCall" | "chat" | "voiceCall" | "physical" => {
        const channelLower = channel.toLowerCase();


        if (channelLower.includes('video') || channelLower.includes('videocall')) {

          return "videoCall";
        }
        if (channelLower.includes('chat')) {

          return "chat";
        }
        if (channelLower.includes('voice') || channelLower.includes('voicecall') || channelLower.includes('call')) {

          return "voiceCall";
        }
        if (channelLower.includes('physical') || channelLower.includes('in-person')) {

          return "physical";
        }
        // Default fallback

        return "videoCall";
      };

      // Convert to the exact sample format
      acc[dateKey].push({
        id: booking.bookingId,
        patientName: booking.patientName,
        date: dateKey,
        time: slotToTime(booking.slot),
        type: booking.bookingChannel === "Chat" ? "Online Booking" : "Physical Booking",
        status: booking.bookingStatus.toLowerCase() as "confirmed" | "pending" | "cancelled",
        channel: mapChannel(booking.bookingChannel),
        patientAge: 0, // Default value
        reason: "Consultation", // Default value
        contactNumber: "+234 000 000 0000", // Default value
      });

      return acc;
    }, {} as Record<string, Booking[]>);

    // Convert to DayBooking format
    return Object.entries(bookingsByDate).map(([date, bookings]) => {
      // Parse the date string (YYYY-MM-DD) to get day name and number
      const [year, month, day] = date.split('-').map(Number);
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
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const day = String(currentDate.getDate()).padStart(2, '0');
      const dateKey = `${year}-${month}-${day}`;

      // Find bookings for this specific date
      const dayBookings = convertedWeekBookings?.find(dayBooking =>
        dayBooking.date === dateKey
      )?.bookings || [];



      newWeekBookings.push({
        date: dateKey,
        dayName,
        dayNumber: `${dayNumber}${getDaySuffix(dayNumber)}`,
        bookings: dayBookings || [],
      });
    }


    // Debug: Log bookings for each day
    newWeekBookings.forEach(day => {
      if (day.bookings.length > 0) {

        day.bookings.forEach(booking => {

        });
      }
    });
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

  // Simulate loading for demonstration
  useEffect(() => {
    const timer = setTimeout(() => {
    }, 2000); // Show skeleton for 2 seconds

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

  const getBookingAtTime = (dayIndex: number, time: string) => {
    const day = weekBookings[dayIndex];
    if (!day) return null;

    return day.bookings.find((booking) => booking.time === time);
  };

  const getNextTime = (currentTimeSlot: {
    key: string;
    from: string;
    to: string;
  }) => {
    const timeIndex = timeSlots.findIndex(
      (slot) => slot.key === currentTimeSlot.key
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
                })}
                -
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
                {weekBookings.map((day) => (
                  <div
                    key={day.date}
                    className="p-3 text-sm font-medium text-gray-900 bg-gray-50 text-center">
                    <div className="font-semibold">{day.dayName}</div>
                    <div className="text-xs text-gray-500">{day.dayNumber}</div>
                  </div>
                ))}
              </div>

              {/* Time Slots */}
              {timeSlots.map((timeSlot, timeIndex) => (
                <div
                  key={timeSlot.key}
                  className="grid grid-cols-8 border-b border-gray-200 last:border-b-0 whitespace-nowrap">
                  {/* Time Label */}
                  <div className="p-3 text-sm text-gray-600 bg-gray-50 flex items-center justify-center border-r border-gray-200">
                    {timeSlot.from} {"->"} {getNextTime(timeSlot)}
                  </div>

                  {/* Day Columns */}
                  {weekBookings.map((day, dayIndex) => {
                    const booking = getBookingAtTime(dayIndex, timeSlot.from);

                    return (
                      <div
                        key={`${day.date}-${timeSlot.key}`}
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
      {isDetailModalOpen &&
        selectedBooking &&
        createPortal(
          <div className="fixed inset-0 bg-[#00000051] bg-opacity-50 flex items-center justify-center z-[9999]">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Booking Details
                </h3>
                <button
                  onClick={closeDetailModal}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-3 h-3 rounded-full ${getBookingColor(
                      selectedBooking.channel
                    )}`}></div>
                  <span className="text-sm font-medium text-gray-700">
                    {selectedBooking.type}
                  </span>
                </div>

                <div>
                  <span className="text-sm font-medium text-gray-700">
                    Patient:
                  </span>
                  <span className="text-sm text-gray-900">
                    {selectedBooking.patientName}
                  </span>
                </div>

                <div>
                  <span className="text-sm font-medium text-gray-700">
                    Age:
                  </span>
                  <span className="text-sm text-gray-900">
                    {selectedBooking.patientAge} years
                  </span>
                </div>

                <div>
                  <span className="text-sm font-medium text-gray-700">
                    Date:
                  </span>
                  <span className="text-sm text-gray-900">
                    {selectedBooking.date}
                  </span>
                </div>

                <div>
                  <span className="text-sm font-medium text-gray-700">
                    Time:
                  </span>
                  <span className="text-sm text-gray-900">
                    {selectedBooking.time}
                  </span>
                </div>

                <div>
                  <span className="text-sm font-medium text-gray-700">
                    Channel:
                  </span>
                  <span className="text-sm text-gray-900 capitalize">
                    {selectedBooking.channel.replace("Call", " Call")}
                  </span>
                </div>

                <div>
                  <span className="text-sm font-medium text-gray-700">
                    Contact:
                  </span>
                  <span className="text-sm text-gray-900">
                    {selectedBooking.contactNumber}
                  </span>
                </div>

                <div>
                  <span className="text-sm font-medium text-gray-700">
                    Reason:
                  </span>
                  <span className="text-sm text-gray-900">
                    {selectedBooking.reason}
                  </span>
                </div>

                <div className="flex gap-3 pt-4">
                  <button className="flex-1 px-4 py-2 bg-[#44CE2D] text-white rounded-lg hover:bg-[#3bb025] transition-colors flex items-center justify-center gap-2">
                    <Video className="w-4 h-4" />
                    Start Session
                  </button>
                  <button className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                    <Phone className="w-4 h-4" />
                    Contact
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
