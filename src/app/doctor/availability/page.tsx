"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { ChevronLeft, ChevronRight, Save } from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";
import Title from "@/components/Title";
import { useAuth } from "@/contexts/AuthContext";
import { useBookingsByDoctorId } from "@/hooks/useBookingsByDoctorId";
import {
  useGetDoctorAvailabilityQuery,
  useSaveDoctorAvailabilityMutation,
} from "@/store/doctorFirebaseApi";
import { showSuccess, showError } from "@/utils/toast";
import { useApiError } from "@/hooks/useApiError";
import { timeSlots, monthNames } from "@/components/Options";
import { CalendarSkeleton } from "@/components/ui/calendar-skeleton";
import { timeSlotToKey } from "@/utils/timeSlotUtils";
import Dropdown from "@/components/Dropdown";
import ConfirmModal from "@/components/widgets/ConfirmModal";
import BookedSlotInfoModal from "@/components/modals/BookedSlotInfoModal";

interface TimeSlot {
  time: string;
  available: boolean;
  color: "green" | "blue" | "none";
}

interface DayAvailability {
  date: string;
  dayName: string;
  timeSlots: TimeSlot[];
}

interface DoctorProfile {
  id: string;
  doctorId: string;
  availability?: Record<string, Record<string, unknown>>;
  [key: string]: unknown;
}

// Clean invalid keys from availability data
const cleanAvailability = (
  availability: Record<string, Record<string, unknown>>,
  timeSlots: { key: string; from: string; to: string }[],
) => {
  const validKeys = timeSlots.map((slot) => slot.key);
  const cleaned: Record<string, Record<string, unknown>> = {};

  Object.keys(availability).forEach((dayName) => {
    const daySlots = availability[dayName];
    const cleanedDaySlots: Record<string, unknown> = {};

    Object.keys(daySlots).forEach((slotKey) => {
      if (validKeys.includes(slotKey)) {
        cleanedDaySlots[slotKey] = daySlots[slotKey];
      } else {
        console.warn(
          `Removing invalid slot key: ${slotKey} for day: ${dayName}`,
        );
      }
    });

    if (Object.keys(cleanedDaySlots).length > 0) {
      cleaned[dayName] = cleanedDaySlots;
    }
  });

  return cleaned;
};

export default function DoctorAvailabilityPage() {
  const { user } = useAuth();
  const doctorId =
    user && typeof user === "object" && "uid" in user ? user.uid : null;

  // Initialize with current date
  const today = new Date();
  const startOfCurrentWeek = new Date(today);
  startOfCurrentWeek.setDate(today.getDate() - today.getDay());

  const [currentMonth, setCurrentMonth] = useState(() => {
    const monthName = monthNames[today.getMonth()];
    const year = today.getFullYear();
    return `${monthName}, ${year}`;
  });
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfCurrentWeek);
  const [consultationDuration, setConsultationDuration] =
    useState("30 minutes");
  const [selectedSlots, setSelectedSlots] = useState<
    Record<string, Record<string, unknown>>
  >({});
  // const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const hasInitializedAvailability = useRef(false);

  // RTK Query hooks
  const {
    data: bookingsData,
    isLoading: isLoadingBookings,
    error: bookingsError,
    refetch: refetchBookings,
  } = useBookingsByDoctorId(doctorId);

  const bookedSlots = useMemo(() => {
    if (!bookingsData) return {};
    const booked: Record<string, Record<string, any>> = {};

    bookingsData.forEach((booking: any) => {
      // Cancelled bookings free the slot again, so ignore them
      const status = (booking?.bookingStatus || "").toLowerCase();
      if (status === "cancelled" || status === "canceled") return;
      if (!booking?.slot) return;

      // Convert timestamp to Date object (handle possible Firestore shapes)
      let bookingDate: Date;
      if (booking.bookingDate?._seconds) {
        bookingDate = new Date(booking.bookingDate._seconds * 1000);
      } else if (booking.bookingDate?.seconds) {
        bookingDate = new Date(booking.bookingDate.seconds * 1000);
      } else {
        bookingDate = new Date(booking.bookingDate);
      }
      if (isNaN(bookingDate.getTime())) return;

      // Format date to match standard format
      const year = bookingDate.getFullYear();
      const month = String(bookingDate.getMonth() + 1).padStart(2, "0");
      const day = String(bookingDate.getDate()).padStart(2, "0");
      const dateKey = `${year}-${month}-${day}`; // Format: YYYY-MM-DD

      if (!booked[dateKey]) {
        booked[dateKey] = {};
      }

      // Store the whole booking so a booked slot can show its details on click
      booked[dateKey][booking.slot] = booking;
    });

    return booked;
  }, [bookingsData]);

  const {
    data: doctorDetails,
    isLoading: isLoadingDetails,
    error,
    refetch: refetchDoctorDetails,
  } = useGetDoctorAvailabilityQuery(doctorId!, {
    skip: !doctorId,
  });

  const [saveAvailability, { isLoading: isSaving }] =
    useSaveDoctorAvailabilityMutation();

  // Migration function to convert 30-minute slots to 1-hour slots
  const migrateAvailabilityToHourly = (
    availability: Record<string, Record<string, unknown>>,
  ) => {
    // If availability is empty, return as is
    if (Object.keys(availability).length === 0) {
      return availability;
    }

    // Canonical hourly slot keys — anything already matching these is kept as-is
    const validSlotKeys = new Set(timeSlots.map((slot) => slot.key));

    const migratedAvailability: Record<string, Record<string, unknown>> = {};

    Object.keys(availability).forEach((dayName) => {
      const daySlots = availability[dayName];
      migratedAvailability[dayName] = {};

      Object.keys(daySlots).forEach((slotKey) => {
        // Already a valid hourly key — keep as-is so migration is idempotent and
        // never drops already-correct slots (fixes 24h availability losing slots).
        if (validSlotKeys.has(slotKey)) {
          migratedAvailability[dayName][slotKey] = daySlots[slotKey];
          return;
        }

        // Handle different slot key formats
        if (slotKey.includes("_")) {
          // Handle format like "early_morning_1am", "morning_10am", etc.
          const parts = slotKey.split("_");
          if (parts.length >= 2) {
            const timePart = parts[1];
            const hour = parseInt(timePart.replace(/[ap]m/, ""));
            const isAM = timePart.includes("am");

            // Convert to 24-hour format
            let hour24 = hour;
            if (isAM && hour === 12) hour24 = 0;
            if (!isAM && hour !== 12) hour24 = hour + 12;

            // Create new hourly key
            let periodName: string;
            if (hour24 >= 0 && hour24 < 6) {
              periodName = "early_morning";
            } else if (hour24 >= 6 && hour24 < 12) {
              periodName = "morning";
            } else if (hour24 >= 12 && hour24 < 18) {
              periodName = "afternoon";
            } else {
              periodName = "evening";
            }

            const hourStr = hour24.toString();
            const periodSuffix = isAM ? "am" : "pm";
            const newKey = `${periodName}_${hourStr}${periodSuffix}`;

            migratedAvailability[dayName][newKey] = daySlots[slotKey];
          }
        } else if (!isNaN(Number(slotKey))) {
          // Handle numeric slot indices (0, 1, 2, etc.) - convert to hourly slots
          const slotIndex = parseInt(slotKey);
          if (slotIndex >= 0 && slotIndex < 48) {
            // Convert 30-minute slot index to hourly slot
            const hour = Math.floor(slotIndex / 2);

            // Convert to 24-hour format
            let hour24 = hour;
            if (hour === 12) hour24 = 0;
            if (hour > 12) hour24 = hour - 12;

            // Determine AM/PM
            const isAM = hour < 12;

            // Create new hourly key
            let periodName: string;
            if (hour24 >= 0 && hour24 < 6) {
              periodName = "early_morning";
            } else if (hour24 >= 6 && hour24 < 12) {
              periodName = "morning";
            } else if (hour24 >= 12 && hour24 < 18) {
              periodName = "afternoon";
            } else {
              periodName = "evening";
            }

            const hourStr = hour24.toString();
            const periodSuffix = isAM ? "am" : "pm";
            const newKey = `${periodName}_${hourStr}${periodSuffix}`;

            migratedAvailability[dayName][newKey] = daySlots[slotKey];
          }
        } else {
          // Keep other keys as is (like non-slot data)
          migratedAvailability[dayName][slotKey] = daySlots[slotKey];
        }
      });
    });

    return migratedAvailability;
  };

  const rawDoctorAvailability =
    (doctorDetails as DoctorProfile)?.availability || {};



  // Apply migration to convert 30-minute slots to 1-hour slots
  const migratedAvailability = useMemo(
    () => migrateAvailabilityToHourly(rawDoctorAvailability),
    [rawDoctorAvailability],
  );


  // Clean invalid keys from availability data
  const doctorAvailability = useMemo(
    () => cleanAvailability(migratedAvailability, timeSlots),
    [migratedAvailability, timeSlots],
  );


  // Check if we have any existing availability
  const hasExistingAvailability =
    Object.keys(doctorAvailability).length > 0 &&
    Object.values(doctorAvailability).some(
      (daySlots) => Object.keys(daySlots).length > 0,
    );

  // Initialize calendar with current week
  useEffect(() => {
    generateWeekAvailability(currentWeekStart);
  }, [currentWeekStart]);

  // Initialize selectedSlots with existing availability when doctor details are loaded
  useEffect(() => {
    if (doctorDetails && !hasInitializedAvailability.current) {
      const rawAvailability =
        (doctorDetails as DoctorProfile)?.availability || {};
      const migratedAvailability = migrateAvailabilityToHourly(rawAvailability);
      const cleanedAvailability = cleanAvailability(
        migratedAvailability,
        timeSlots,
      );

      if (Object.keys(cleanedAvailability).length > 0) {
        setSelectedSlots(cleanedAvailability);
        hasInitializedAvailability.current = true;
      }
    }
  }, [doctorDetails]);

  // Additional effect to ensure initialization happens even if doctorDetails changes
  useEffect(() => {
    if (
      doctorDetails &&
      Object.keys(doctorAvailability).length > 0 &&
      !hasInitializedAvailability.current
    ) {
      setSelectedSlots(doctorAvailability);
      hasInitializedAvailability.current = true;
    }
  }, [doctorDetails, doctorAvailability]);

  // Initialize with current date
  useEffect(() => {
    const today = new Date();
    const startOfCurrentWeek = new Date(today);
    startOfCurrentWeek.setDate(today.getDate() - today.getDay());
    const monthName = monthNames[today.getMonth()];
    const year = today.getFullYear();
    setCurrentMonth(`${monthName}, ${year}`);
    setCurrentWeekStart(startOfCurrentWeek);
  }, []);

  useApiError(!!error, error, "Failed to load availability. Please try again.");

  // Handle day expansion toggle (currently unused but kept for future accordion functionality)
  // const handlePress = (day: string) => {
  //   setExpandedDay(expandedDay === day ? null : day);
  // };

  // Toggle slot selection using day names and time slot keys
  const toggleSlot = (dayName: string, slotIndex: number) => {
    setSelectedSlots((prevSlots: Record<string, Record<string, unknown>>) => {
      const daySlots = prevSlots[dayName] || {};
      const timeSlot = timeSlots[slotIndex];
      const slotKey = timeSlotToKey(timeSlot);

      // Check if the slot is currently selected in the UI state
      const isCurrentlySelected = daySlots[slotKey];

      if (isCurrentlySelected) {
        // If the slot exists and is selected, remove it
        const newDaySlots = { ...daySlots };
        delete newDaySlots[slotKey];

        // If there are no more slots for this day, remove the day entirely
        if (Object.keys(newDaySlots).length === 0) {
          const newPrevSlots = { ...prevSlots };
          delete newPrevSlots[dayName];
          return newPrevSlots;
        }

        return {
          ...prevSlots,
          [dayName]: newDaySlots,
        };
      } else {
        // If the slot is not selected, add it to selected slots
        const newSlots = {
          ...prevSlots,
          [dayName]: {
            ...daySlots,
            [slotKey]: "available", // Mark it as available
          },
        };

        return newSlots;
      }
    });
  };

  // Get slot style based on availability and selection
  const getSlotStyle = (isExistingSlot: boolean, isSelectedSlot: unknown) => {
    // If slot exists in both existing availability and current selections
    if (isExistingSlot && isSelectedSlot) {
      return "bg-[#44CE2D] border-[#44CE2D] text-white"; // Green - Confirmed available
    }
    // If slot exists in existing availability but not in current selections
    if (isExistingSlot && !isSelectedSlot) {
      return "bg-green-100 border-green-300"; // Light Green - Already in availability
    }
    // If slot is newly selected but not in existing availability
    if (!isExistingSlot && isSelectedSlot) {
      return "bg-[#44CE2D] border-[#44CE2D] text-white"; // Green - Newly selected
    }
    // If slot is not available
    return "bg-red-100 border-red-300"; // Light Red - Not available
  };
  const [availability, setAvailability] = useState<DayAvailability[]>([]); // Remove dummy data - will be populated by generateWeekAvailability
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  const handleTimeSlotClick = (dayIndex: number, slotIndex: number) => {
    const day = availability[dayIndex];
    toggleSlot(day.dayName, slotIndex);
  };

  const handleSaveAvailability = async () => {
    if (!doctorId) {
      showError("Error", "Doctor ID not found");
      return;
    }

    setIsLoading(true);
    try {
      // Merge existing availability with new selections
      const mergedAvailability = { ...doctorAvailability, ...selectedSlots };

      await saveAvailability({
        doctorId,
        selectedSlots: mergedAvailability,
      }).unwrap();
      showSuccess("Success", "Availability saved successfully!");
      // Reset initialization flag so we can reinitialize with updated data
      hasInitializedAvailability.current = false;
      // Refresh the doctor details to get updated availability
      refetchDoctorDetails();
    } catch (error: unknown) {
      showError(
        "Error",
        error instanceof Error ? error.message : "Failed to save availability",
      );
    } finally {
      setIsLoading(false);
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

    // Update the month display

    const monthName = monthNames[newWeekStart.getMonth()];
    const year = newWeekStart.getFullYear();
    setCurrentMonth(`${monthName}, ${year}`);

    // Generate new availability data for the new week
    generateWeekAvailability(newWeekStart);
  };

  const generateWeekAvailability = (weekStart: Date) => {
    const newAvailability: DayAvailability[] = [];
    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(weekStart);
      currentDate.setDate(weekStart.getDate() + i);

      const day = currentDate.getDate();
      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];

      const newDay: DayAvailability = {
        date: `${monthNames[currentDate.getMonth()]} ${day}`,
        dayName: dayNames[currentDate.getDay()],
        timeSlots: timeSlots.map((timeSlot) => ({
          time: timeSlot.from,
          available: false,
          color: "none" as const,
        })),
      };

      newAvailability.push(newDay);
    }

    setAvailability(newAvailability);
  };

  if (isLoadingDetails) {
    return (
      <div>
        <div className="mb-6">
          <Breadcrumb
            homeHref="/doctor"
            items={[
              { label: "Doctor", href: "/doctor" },
              { label: "Availability", href: "/doctor/availability" },
            ]}
          />
        </div>
        <Title title="Set your availability" />

        {/* Header Section Skeleton */}
        <div className="border-[var(--border)] mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className=" !text-[10px]  !md:text-[12px] font-medium text-gray-700">
                  Consultation duration:
                </div>
                <div className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-100">
                  <div className="h-4 w-20 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="px-4 py-2 border border-gray-300 rounded-lg bg-gray-100">
                <div className="h-4 w-32 bg-gray-200 rounded"></div>
              </div>
              <div className="px-6 py-2 bg-gray-100 rounded-lg">
                <div className="h-4 w-24 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar Skeleton */}
        <CalendarSkeleton />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Breadcrumb
          homeHref="/doctor"
          items={[
            { label: "Doctor", href: "/doctor" },
            { label: "Availability", href: "/doctor/availability" },
          ]}
        />
      </div>

      <Title title="Set your availability" />

      {/* Header Section */}
      <div className="border-[var(--border)] mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <label className=" !text-[10px]  !md:text-[12px] font-medium text-gray-700">
                Consultation duration:
              </label>
              <Dropdown
                value={consultationDuration}
                onChange={(value) => setConsultationDuration(value)}
                options={[
                  { value: "15 minutes", label: "15 minutes" },
                  { value: "30 minutes", label: "30 minutes" },
                  { value: "45 minutes", label: "45 minutes" },
                  { value: "1 hour", label: "1 hour" },
                ]}
                placeholder="Select Duration"
                className="w-48"
                variant="default"
              />
            </div>
          </div>

          <div className="flex gap-3">
            {!hasExistingAvailability &&
              Object.keys(rawDoctorAvailability).length > 0 && (
                <div className=" !text-[10px]  !md:text-[12px] text-orange-600 bg-orange-50 px-3 py-2 rounded-lg">
                  ⚠️ Your previous consultation duration is being converted to
                  1-hour slots
                </div>
              )}
            <button
              onClick={() => setIsSaveModalOpen(true)}
              disabled={isLoading || isSaving}
              className="px-6 py-2 bg-[#44CE2D] text-white rounded-lg hover:bg-[#3bb025] transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {isLoading || isSaving ? "Saving..." : "Save Availability"}
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Calendar Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-[14px] md:text-[16px] font-medium text-gray-900">
              {currentMonth}
            </h3>
            <p className=" !text-[10px]  !md:text-[12px] text-gray-500">
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
          <div className="flex gap-2">
            <button
              onClick={() => {
                const today = new Date();
                const startOfWeek = new Date(today);
                startOfWeek.setDate(today.getDate() - today.getDay());
                setCurrentWeekStart(startOfWeek);
                generateWeekAvailability(startOfWeek);
                const monthName = monthNames[today.getMonth()];
                const year = today.getFullYear();
                setCurrentMonth(`${monthName}, ${year}`);
              }}
              className="px-3 py-1  !text-[10px]  !md:text-[12px] bg-[#44CE2D] text-white rounded-lg hover:bg-[#3bb025] transition-colors"
            >
              Today
            </button>
            <button
              onClick={() => navigateWeek("prev")}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600 cursor-pointer" />
            </button>
            <button
              onClick={() => navigateWeek("next")}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-gray-600 cursor-pointer" />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Day Headers */}
            <div className="grid grid-cols-8 border-b border-gray-200">
              <div className="p-3  !text-[10px]  !md:text-[12px] font-medium text-gray-500 bg-gray-50"></div>
              {availability?.map((day, index) => (
                <div
                  key={String(`${day.dayName}-${day.date}-${index}`)}
                  className="p-3  !text-[10px]  !md:text-[12px] font-medium text-gray-900 bg-gray-50 text-center"
                >
                  <div className="font-semibold">{day.dayName}</div>
                  <div className="text-xs text-gray-500">{day.date}</div>
                </div>
              ))}
            </div>

            {/* Time Slots */}
            {availability.length > 0 ? (
              availability[0].timeSlots.map(
                (_: TimeSlot, slotIndex: number) => {
                  const timeSlot = timeSlots[slotIndex];
                  return (
                    <div
                      key={String(timeSlot.key)}
                      className="grid grid-cols-8 border-b border-gray-200 last:border-b-0 whitespace-nowrap"
                    >
                      {/* Time Label */}
                      <div className="p-3  !text-[10px]  !md:text-[12px] text-gray-600 bg-gray-50 flex items-center justify-center border-r border-gray-200">
                        {availability[0].timeSlots[slotIndex].time}
                      </div>

                      {/* Day Columns */}
                      {availability?.map(
                        (day: DayAvailability, dayIndex: number) => {
                          const timeSlot = timeSlots[slotIndex];
                          const slotKey = timeSlotToKey(timeSlot);
                          const isExistingSlot = Boolean(
                            doctorAvailability &&
                            doctorAvailability[day?.dayName] &&
                            doctorAvailability[day?.dayName][slotKey],
                          );
                          const isSelectedSlot =
                            selectedSlots[day?.dayName] &&
                            selectedSlots[day?.dayName][slotKey];

                          // Debug logging for specific slots
                          if (day?.dayName === "Thursday" && slotIndex === 2) {
                          }

                          // Debug logging for slot 3 (should match early_morning_3am)
                          if (day?.dayName === "Thursday" && slotIndex === 3) {
                          }

                          // Check if slot is booked
                          const year = new Date(currentWeekStart).getFullYear();
                          const month = String(
                            new Date(currentWeekStart).getMonth() + 1,
                          ).padStart(2, "0");
                          // Calculate date for this specific day column
                          // day.date is in format "Month Day" e.g. "Jan 27"
                          // We need to construct YYYY-MM-DD
                          const currentDayDate = new Date(currentWeekStart);
                          currentDayDate.setDate(
                            currentWeekStart.getDate() + dayIndex,
                          );
                          const currentYear = currentDayDate.getFullYear();
                          const currentMonth = String(
                            currentDayDate.getMonth() + 1,
                          ).padStart(2, "0");
                          const currentDay = String(
                            currentDayDate.getDate(),
                          ).padStart(2, "0");
                          const dateKey = `${currentYear}-${currentMonth}-${currentDay}`;

                          const bookedBooking =
                            bookedSlots[dateKey] &&
                            bookedSlots[dateKey][slotKey];
                          const isBooked = !!bookedBooking;

                          const slotStyle = isBooked
                            ? "bg-blue-100 border-blue-300 cursor-pointer" // Booked (click for details)
                            : getSlotStyle(isExistingSlot, isSelectedSlot);

                          return (
                            <div
                              key={String(`${day.dayName}-${slotKey}`)}
                              className={`p-3 border-r border-gray-200 last:border-r-0 transition-colors hover:bg-gray-50 ${slotStyle} cursor-pointer`}
                              onClick={() =>
                                isBooked
                                  ? setSelectedBooking(bookedBooking)
                                  : handleTimeSlotClick(dayIndex, slotIndex)
                              }
                            >
                              <div className="w-full h-6 flex items-center justify-center">
                                {isBooked ? (
                                  <span className="text-xs text-blue-600 font-medium">
                                    Booked
                                  </span>
                                ) : isExistingSlot || isSelectedSlot ? (
                                  <div className="w-2 h-2 rounded-full bg-current opacity-75"></div>
                                ) : null}
                              </div>
                            </div>
                          );
                        },
                      )}
                    </div>
                  );
                },
              )
            ) : (
              <CalendarSkeleton />
            )}
          </div>
        </div>
      </div>

      {/* Booked slot details */}
      <BookedSlotInfoModal
        isOpen={!!selectedBooking}
        onClose={() => setSelectedBooking(null)}
        booking={selectedBooking}
        enableActions
        actor="doctor"
        onChanged={() => refetchBookings()}
      />

      {/* Save Availability confirmation modal */}
      <ConfirmModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        onConfirm={() => {
          setIsSaveModalOpen(false);
          handleSaveAvailability();
        }}
        title="Save Availability"
        message="Are you sure you want to save your availability? This will update the time slots patients can book."
        confirmText="Save"
        cancelText="Cancel"
      />
    </div>
  );
}
