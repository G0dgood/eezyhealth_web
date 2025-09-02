"use client";

import { useState, useEffect } from "react";
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
import Breadcrumb from "@/components/Breadcrumb";
import Title from "@/components/Title";
import SearchInput from "@/components/SearchInput";

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
  const [currentMonth, setCurrentMonth] = useState("September, 2023");
  const [currentWeekStart, setCurrentWeekStart] = useState(
    new Date(2023, 8, 1)
  ); // Sep 1, 2023
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Sample booking data
  const [weekBookings, setWeekBookings] = useState<DayBooking[]>([
    {
      date: "2023-09-01",
      dayName: "FRI",
      dayNumber: "1st",
      bookings: [
        {
          id: "BK-001",
          patientName: "Sarah Johnson",
          date: "2023-09-01",
          time: "09:00 AM",
          type: "Online Booking",
          status: "confirmed",
          channel: "videoCall",
          patientAge: 28,
          reason: "Follow-up consultation for anxiety management",
          contactNumber: "+234 801 234 5678",
        },
        {
          id: "BK-002",
          patientName: "Michael Chen",
          date: "2023-09-01",
          time: "02:00 PM",
          type: "Online Booking",
          status: "confirmed",
          channel: "chat",
          patientAge: 35,
          reason: "Initial consultation for stress-related issues",
          contactNumber: "+234 802 345 6789",
        },
      ],
    },
    {
      date: "2023-09-02",
      dayName: "SAT",
      dayNumber: "2nd",
      bookings: [
        {
          id: "BK-003",
          patientName: "Emily Davis",
          date: "2023-09-02",
          time: "10:00 AM",
          type: "Physical Booking",
          status: "confirmed",
          channel: "physical",
          patientAge: 42,
          reason: "Physical examination and consultation",
          contactNumber: "+234 803 456 7890",
        },
      ],
    },
    {
      date: "2023-09-03",
      dayName: "SUN",
      dayNumber: "3rd",
      bookings: [
        {
          id: "BK-004",
          patientName: "David Wilson",
          date: "2023-09-03",
          time: "11:00 AM",
          type: "Online Booking",
          status: "confirmed",
          channel: "voiceCall",
          patientAge: 29,
          reason: "Weekly therapy session",
          contactNumber: "+234 804 567 8901",
        },
      ],
    },
    {
      date: "2023-09-04",
      dayName: "MON",
      dayNumber: "4th",
      bookings: [
        {
          id: "BK-005",
          patientName: "Lisa Anderson",
          date: "2023-09-04",
          time: "09:00 AM",
          type: "Online Booking",
          status: "confirmed",
          channel: "videoCall",
          patientAge: 31,
          reason: "Depression management consultation",
          contactNumber: "+234 805 678 9012",
        },
        {
          id: "BK-006",
          patientName: "Robert Taylor",
          date: "2023-09-04",
          time: "03:00 PM",
          type: "Online Booking",
          status: "confirmed",
          channel: "chat",
          patientAge: 38,
          reason: "Anxiety assessment and treatment plan",
          contactNumber: "+234 806 789 0123",
        },
      ],
    },
    {
      date: "2023-09-05",
      dayName: "TUE",
      dayNumber: "5th",
      bookings: [
        {
          id: "BK-007",
          patientName: "Jennifer Brown",
          date: "2023-09-05",
          time: "10:00 AM",
          type: "Online Booking",
          status: "confirmed",
          channel: "videoCall",
          patientAge: 26,
          reason: "Trauma therapy session",
          contactNumber: "+234 807 890 1234",
        },
        {
          id: "BK-008",
          patientName: "Thomas Garcia",
          date: "2023-09-05",
          time: "04:00 PM",
          type: "Online Booking",
          status: "confirmed",
          channel: "voiceCall",
          patientAge: 45,
          reason: "Stress management consultation",
          contactNumber: "+234 808 901 2345",
        },
      ],
    },
    {
      date: "2023-09-06",
      dayName: "WED",
      dayNumber: "6th",
      bookings: [
        {
          id: "BK-009",
          patientName: "Amanda Martinez",
          date: "2023-09-06",
          time: "11:00 AM",
          type: "Online Booking",
          status: "confirmed",
          channel: "chat",
          patientAge: 33,
          reason: "Relationship counseling session",
          contactNumber: "+234 809 012 3456",
        },
      ],
    },
    {
      date: "2023-09-07",
      dayName: "THU",
      dayNumber: "7th",
      bookings: [
        {
          id: "BK-010",
          patientName: "Christopher Lee",
          date: "2023-09-07",
          time: "02:00 PM",
          type: "Online Booking",
          status: "confirmed",
          channel: "videoCall",
          patientAge: 27,
          reason: "ADHD assessment and management",
          contactNumber: "+234 810 123 4567",
        },
      ],
    },
  ]);

  const timeSlots = [
    "12:00 AM",
    "12:30 AM",
    "01:00 AM",
    "01:30 AM",
    "02:00 AM",
    "02:30 AM",
    "03:00 AM",
    "03:30 AM",
    "04:00 AM",
    "04:30 AM",
    "05:00 AM",
    "05:30 AM",
    "06:00 AM",
    "06:30 AM",
    "07:00 AM",
    "07:30 AM",
    "08:00 AM",
    "08:30 AM",
    "09:00 AM",
    "09:30 AM",
    "10:00 AM",
    "10:30 AM",
    "11:00 AM",
    "11:30 AM",
    "12:00 PM",
    "12:30 PM",
    "01:00 PM",
    "01:30 PM",
    "02:00 PM",
    "02:30 PM",
    "03:00 PM",
    "03:30 PM",
    "04:00 PM",
    "04:30 PM",
    "05:00 PM",
    "05:30 PM",
    "06:00 PM",
    "06:30 PM",
    "07:00 PM",
    "07:30 PM",
    "08:00 PM",
    "08:30 PM",
    "09:00 PM",
    "09:30 PM",
    "10:00 PM",
    "10:30 PM",
    "11:00 PM",
    "11:30 PM",
  ];

  const navigateWeek = (direction: "prev" | "next") => {
    const newWeekStart = new Date(currentWeekStart);

    if (direction === "prev") {
      newWeekStart.setDate(newWeekStart.getDate() - 7);
    } else {
      newWeekStart.setDate(newWeekStart.getDate() + 7);
    }

    setCurrentWeekStart(newWeekStart);

    // Update the month display
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const month = monthNames[newWeekStart.getMonth()];
    const year = newWeekStart.getFullYear();
    setCurrentMonth(`${month}, ${year}`);

    // Generate new week data (you would typically fetch this from API)
    generateWeekBookings(newWeekStart);
  };

  const generateWeekBookings = (weekStart: Date) => {
    // This would typically fetch data from an API
    // For now, we'll just update the dates
    const newWeekBookings = weekBookings.map((day, index) => {
      const currentDate = new Date(weekStart);
      currentDate.setDate(weekStart.getDate() + index);

      const dayNames = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
      const dayName = dayNames[currentDate.getDay()];
      const dayNumber = currentDate.getDate();

      return {
        ...day,
        date: currentDate.toISOString().split("T")[0],
        dayName,
        dayNumber: `${dayNumber}${getDaySuffix(dayNumber)}`,
      };
    });

    setWeekBookings(newWeekBookings);
  };

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

  const getNextTime = (currentTime: string) => {
    const timeIndex = timeSlots.indexOf(currentTime);
    if (timeIndex === -1 || timeIndex === timeSlots.length - 1) {
      return currentTime;
    }
    return timeSlots[timeIndex + 1];
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

      {/* Calendar Grid */}
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
                const monthNames = [
                  "January",
                  "February",
                  "March",
                  "April",
                  "May",
                  "June",
                  "July",
                  "August",
                  "September",
                  "October",
                  "November",
                  "December",
                ];
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
            {timeSlots.map((time, timeIndex) => (
              <div
                key={time}
                className="grid grid-cols-8 border-b border-gray-200 last:border-b-0 whitespace-nowrap">
                {/* Time Label */}
                <div className="p-3 text-sm text-gray-600 bg-gray-50 flex items-center justify-center border-r border-gray-200">
                  {time} {"->"} {getNextTime(time)}
                </div>

                {/* Day Columns */}
                {weekBookings.map((day, dayIndex) => {
                  const booking = getBookingAtTime(dayIndex, time);

                  return (
                    <div
                      key={`${day.date}-${time}`}
                      className={`p-2 border-r border-gray-200 last:border-r-0 min-h-[60px] ${
                        booking
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
                            <span className="font-medium">{booking.type}</span>
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
                    Patient:{" "}
                  </span>
                  <span className="text-sm text-gray-900">
                    {selectedBooking.patientName}
                  </span>
                </div>

                <div>
                  <span className="text-sm font-medium text-gray-700">
                    Age:{" "}
                  </span>
                  <span className="text-sm text-gray-900">
                    {selectedBooking.patientAge} years
                  </span>
                </div>

                <div>
                  <span className="text-sm font-medium text-gray-700">
                    Date:{" "}
                  </span>
                  <span className="text-sm text-gray-900">
                    {selectedBooking.date}
                  </span>
                </div>

                <div>
                  <span className="text-sm font-medium text-gray-700">
                    Time:{" "}
                  </span>
                  <span className="text-sm text-gray-900">
                    {selectedBooking.time}
                  </span>
                </div>

                <div>
                  <span className="text-sm font-medium text-gray-700">
                    Channel:{" "}
                  </span>
                  <span className="text-sm text-gray-900 capitalize">
                    {selectedBooking.channel.replace("Call", " Call")}
                  </span>
                </div>

                <div>
                  <span className="text-sm font-medium text-gray-700">
                    Contact:{" "}
                  </span>
                  <span className="text-sm text-gray-900">
                    {selectedBooking.contactNumber}
                  </span>
                </div>

                <div>
                  <span className="text-sm font-medium text-gray-700">
                    Reason:{" "}
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
