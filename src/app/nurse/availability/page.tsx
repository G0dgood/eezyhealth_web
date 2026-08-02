"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, Save } from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";
import Title from "@/components/Title";
import { useAuth } from "@/contexts/AuthContext";
import { useBookingsByDoctorId } from "@/hooks/useBookingsByDoctorId";
import {
  useGetFirebaseDoctorsQuery,
  useGetDoctorAvailabilityQuery,
  useSaveDoctorAvailabilityMutation,
} from "@/store/doctorFirebaseApi";
import { showSuccess, showError } from "@/utils/toast";
import { timeSlots, monthNames } from "@/components/Options";
import { CalendarSkeleton } from "@/components/ui/calendar-skeleton";
import Dropdown from "@/components/Dropdown";
import ConfirmModal from "@/components/widgets/ConfirmModal";
import BookedSlotInfoModal from "@/components/modals/BookedSlotInfoModal";
import { timeSlotToKey } from "@/utils/timeSlotUtils";

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
  timeSlots: { key: string; from: string; to: string }[]
) => {
  const validKeys = timeSlots.map((slot) => slot.key);
  const cleaned: Record<string, Record<string, unknown>> = {};

  Object.keys(availability).forEach((dayName) => {
    const daySlots = availability[dayName];
    const cleanedDaySlots: Record<string, unknown> = {};

    Object.keys(daySlots).forEach((slotKey) => {
      if (validKeys.includes(slotKey)) {
        cleanedDaySlots[slotKey] = daySlots[slotKey];
      }
    });

    if (Object.keys(cleanedDaySlots).length > 0) {
      cleaned[dayName] = cleanedDaySlots;
    }
  });

  return cleaned;
};

// Migration function to convert 30-minute slots to 1-hour slots
const migrateAvailabilityToHourly = (
  availability: Record<string, Record<string, unknown>>
) => {
  if (Object.keys(availability).length === 0) {
    return availability;
  }

  const validSlotKeys = new Set(timeSlots.map((slot) => slot.key));
  const migratedAvailability: Record<string, Record<string, unknown>> = {};

  Object.keys(availability).forEach((dayName) => {
    const daySlots = availability[dayName];
    migratedAvailability[dayName] = {};

    Object.keys(daySlots).forEach((slotKey) => {
      if (validSlotKeys.has(slotKey)) {
        migratedAvailability[dayName][slotKey] = daySlots[slotKey];
        return;
      }

      if (slotKey.includes("_")) {
        const parts = slotKey.split("_");
        if (parts.length >= 2) {
          const timePart = parts[1];
          const hour = parseInt(timePart.replace(/[ap]m/, ""));
          const isAM = timePart.includes("am");

          let hour24 = hour;
          if (isAM && hour === 12) hour24 = 0;
          if (!isAM && hour !== 12) hour24 = hour + 12;

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
      }
    });
  });

  return migratedAvailability;
};

export default function NurseAvailabilityPage() {
  const { user } = useAuth();
  // This page is reused on both the nurse and admin sides — derive the base
  // path/label from the URL so the breadcrumb reads correctly for each.
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin") ?? false;
  const roleBase = isAdmin ? "/admin" : "/nurse";
  const roleLabel = isAdmin ? "Admin" : "Nurse";
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>("");

  // Get active doctors from Firebase users collection
  const { data: doctorsData, isLoading: isLoadingDoctors } = useGetFirebaseDoctorsQuery({});

  const doctorsList = useMemo(() => {
    return (doctorsData || []) as any[];
  }, [doctorsData]);

  // Set first doctor as default once loaded
  useEffect(() => {
    if (doctorsList.length > 0 && !selectedDoctorId) {
      const firstDoc = doctorsList[0];
      setSelectedDoctorId(firstDoc.uid || firstDoc.doctorId || firstDoc.id);
    }
  }, [doctorsList, selectedDoctorId]);

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
  const [selectedSlots, setSelectedSlots] = useState<
    Record<string, Record<string, unknown>>
  >({});
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const hasInitializedAvailability = useRef(false);

  // Bookings RTK query hook
  const {
    data: bookingsData,
    refetch: refetchBookings,
  } = useBookingsByDoctorId(selectedDoctorId || null);

  const bookedSlots = useMemo(() => {
    if (!bookingsData) return {};
    const booked: Record<string, Record<string, any>> = {};

    bookingsData.forEach((booking: any) => {
      const status = (booking?.bookingStatus || "").toLowerCase();
      if (status === "cancelled" || status === "canceled") return;
      if (!booking?.slot) return;

      let bookingDate: Date;
      if (booking.bookingDate?._seconds) {
        bookingDate = new Date(booking.bookingDate._seconds * 1000);
      } else if (booking.bookingDate?.seconds) {
        bookingDate = new Date(booking.bookingDate.seconds * 1000);
      } else {
        bookingDate = new Date(booking.bookingDate);
      }
      if (isNaN(bookingDate.getTime())) return;

      const year = bookingDate.getFullYear();
      const month = String(bookingDate.getMonth() + 1).padStart(2, "0");
      const day = String(bookingDate.getDate()).padStart(2, "0");
      const dateKey = `${year}-${month}-${day}`;

      if (!booked[dateKey]) {
        booked[dateKey] = {};
      }

      booked[dateKey][booking.slot] = booking;
    });

    return booked;
  }, [bookingsData]);

  // Availability query
  const {
    data: doctorDetails,
    isLoading: isLoadingAvailability,
    refetch: refetchDoctorDetails,
  } = useGetDoctorAvailabilityQuery(selectedDoctorId, {
    skip: !selectedDoctorId,
  });

  const [saveAvailability, { isLoading: isSaving }] =
    useSaveDoctorAvailabilityMutation();

  const doctorAvailability = useMemo(() => {
    if (!doctorDetails) return {};
    const rawAvailability =
      (doctorDetails as any)?.availability ||
      (doctorDetails as any)?.data?.availability ||
      {};
    const migrated = migrateAvailabilityToHourly(rawAvailability);
    return cleanAvailability(migrated, timeSlots);
  }, [doctorDetails]);

  // Reset flag when selected doctor changes so availability is reinitialized
  useEffect(() => {
    hasInitializedAvailability.current = false;
    setSelectedSlots({});
  }, [selectedDoctorId]);

  // Prepopulate selectedSlots when doctor availability details are loaded
  useEffect(() => {
    if (doctorDetails && !hasInitializedAvailability.current) {
      const rawAvailability =
        (doctorDetails as any)?.availability ||
        (doctorDetails as any)?.data?.availability ||
        {};
      const migrated = migrateAvailabilityToHourly(rawAvailability);
      const cleaned = cleanAvailability(migrated, timeSlots);

      setSelectedSlots(cleaned);
      hasInitializedAvailability.current = true;
    }
  }, [doctorDetails]);

  // Days Availability
  const [availability, setAvailability] = useState<DayAvailability[]>([]);

  useEffect(() => {
    generateWeekAvailability(currentWeekStart);
  }, [currentWeekStart]);

  // Populate slots with db values
  useEffect(() => {
    if (!selectedDoctorId) return;

    const newAvailability = [...availability];
    let hasChanges = false;

    newAvailability.forEach((dayAvailability) => {
      const dayOfWeek = dayAvailability.dayName;

      // Parse date for booking lookup
      const dateObj = new Date(dayAvailability.date + ", " + currentWeekStart.getFullYear());
      const year = currentWeekStart.getFullYear();
      const monthNum = String(dateObj.getMonth() + 1).padStart(2, "0");
      const dayNum = String(dateObj.getDate()).padStart(2, "0");
      const dateKey = `${year}-${monthNum}-${dayNum}`;

      dayAvailability.timeSlots.forEach((slot, idx) => {
        const slotKey = timeSlots[idx].key;
        const isSlotBooked = bookedSlots[dateKey]?.[slotKey];

        let newAvailable = slot.available;
        let newColor: "green" | "blue" | "none" = "none";

        if (isSlotBooked) {
          newAvailable = true;
          newColor = "blue";
        } else {
          const tempSelected = selectedSlots[dayOfWeek]?.[slotKey];
          if (tempSelected !== undefined) {
            newAvailable = !!tempSelected;
            newColor = tempSelected ? "green" : "none";
          } else {
            newAvailable = false;
            newColor = "none";
          }
        }

        if (slot.available !== newAvailable || slot.color !== newColor) {
          slot.available = newAvailable;
          slot.color = newColor;
          hasChanges = true;
        }
      });
    });

    if (hasChanges) {
      setAvailability(newAvailability);
    }
  }, [
    doctorAvailability,
    bookedSlots,
    availability,
    currentWeekStart,
    selectedSlots,
    selectedDoctorId,
    bookingsData,
  ]);

  const toggleSlot = (dayName: string, slotIndex: number) => {
    setSelectedSlots((prevSlots: Record<string, Record<string, unknown>>) => {
      const daySlots = prevSlots[dayName] || {};
      const timeSlot = timeSlots[slotIndex];
      const slotKey = timeSlotToKey(timeSlot);

      const isCurrentlySelected = daySlots[slotKey];

      const updatedDaySlots = { ...daySlots };
      if (isCurrentlySelected) {
        delete updatedDaySlots[slotKey];
      } else {
        updatedDaySlots[slotKey] = true;
      }

      const updated = { ...prevSlots };
      if (Object.keys(updatedDaySlots).length === 0) {
        delete updated[dayName];
      } else {
        updated[dayName] = updatedDaySlots;
      }
      return updated;
    });
  };

  const handleTimeSlotClick = (dayIndex: number, slotIndex: number) => {
    const day = availability[dayIndex];
    if (day.timeSlots[slotIndex].color === "blue") return;
    toggleSlot(day.dayName, slotIndex);
  };

  const handleSaveAvailability = async () => {
    if (!selectedDoctorId) {
      showError("Error", "Doctor not selected");
      return;
    }

    setIsLoading(true);
    try {
      await saveAvailability({
        doctorId: selectedDoctorId,
        selectedSlots: selectedSlots,
      }).unwrap();

      showSuccess("Success", "Availability saved successfully!");
      hasInitializedAvailability.current = false;
      refetchDoctorDetails();
    } catch (error: unknown) {
      showError(
        "Error",
        error instanceof Error ? error.message : "Failed to save availability",
      );
    } finally {
      setIsLoading(false);
      setIsSaveModalOpen(false);
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

    const monthName = monthNames[newWeekStart.getMonth()];
    const year = newWeekStart.getFullYear();
    setCurrentMonth(`${monthName}, ${year}`);
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
      const monthNamesAbbr = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
      ];

      const newDay: DayAvailability = {
        date: `${monthNamesAbbr[currentDate.getMonth()]} ${day}`,
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

  const getDoctorName = (doc: any) => {
    if (doc.displayName) return doc.displayName;
    if (doc.name) return doc.name;
    if (doc.first_name) {
      return `${doc.title || "Dr."} ${doc.first_name} ${doc.last_name || ""}`.trim();
    }
    return doc.email || "Unknown Doctor";
  };

  const getSlotStyle = (isBooked: boolean, isExistingSlot: boolean, isSelectedSlot: boolean) => {
    if (isBooked) {
      return "bg-blue-100 border-blue-300 text-blue-600 cursor-not-allowed";
    }
    if (isExistingSlot && isSelectedSlot) {
      return "bg-[#44CE2D] border-[#44CE2D] text-white cursor-pointer";
    }
    if (isExistingSlot && !isSelectedSlot) {
      return "bg-green-100 border-green-300 text-green-700 cursor-pointer";
    }
    if (!isExistingSlot && isSelectedSlot) {
      return "bg-[#44CE2D] border-[#44CE2D] text-white cursor-pointer";
    }
    return "bg-red-100 border-red-300 text-red-700 cursor-pointer";
  };

  const hasTempChanges = useMemo(() => {
    // Determine if selectedSlots differs from doctorAvailability
    return JSON.stringify(selectedSlots) !== JSON.stringify(doctorAvailability);
  }, [selectedSlots, doctorAvailability]);

  return (
    <div className="text-[var(--foreground)]">
      <div className="mb-6">
        <Breadcrumb
          items={[
            { label: roleLabel, href: roleBase },
            { label: "Availability", href: `${roleBase}/availability` },
          ]}
        />
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <Title title="Doctor Availability & Schedule" />
          <p className="text-sm text-gray-500">
            View and manage availability calendars for doctors.
          </p>
        </div>

        {/* Doctor Selector Container - Removed shadow-sm */}
        <div className="flex items-center gap-3 bg-[var(--card)] p-3 border border-[var(--border)] rounded-lg">
          <label className="text-xs font-semibold text-gray-700 whitespace-nowrap">
            Select Doctor:
          </label>
          <Dropdown
            value={selectedDoctorId}
            onChange={(value) => setSelectedDoctorId(value)}
            options={doctorsList.map((doc) => ({
              value: doc.uid || doc.doctorId || doc.id,
              label: getDoctorName(doc),
            }))}
            placeholder={isLoadingDoctors ? "Loading doctors..." : "Select Doctor"}
            className="w-72 shadow-none"
            variant="default"
          />
        </div>
      </div>

      {isLoadingAvailability || isLoadingDoctors ? (
        <CalendarSkeleton />
      ) : (
        /* Calendar Container - Removed shadow-sm */
        <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] overflow-hidden">
          {/* Calendar Controller Header */}
          <div className="p-4 border-b border-[var(--border)] flex flex-wrap items-center justify-between gap-4 bg-[var(--muted)]">
            <div>
              <h3 className="text-sm font-semibold text-[var(--foreground)]">
                {currentMonth}
              </h3>
              <p className="text-xs text-[var(--muted-foreground)]">
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
                  const todayDate = new Date();
                  const startOfWeek = new Date(todayDate);
                  startOfWeek.setDate(todayDate.getDate() - todayDate.getDay());
                  setCurrentWeekStart(startOfWeek);
                  const monthName = monthNames[todayDate.getMonth()];
                  const year = todayDate.getFullYear();
                  setCurrentMonth(`${monthName}, ${year}`);
                }}
                className="px-3 py-1.5 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors text-gray-700 font-medium"
              >
                Today
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => navigateWeek("prev")}
                  className="p-1.5 bg-white border border-gray-300 rounded hover:bg-gray-50 text-gray-600"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => navigateWeek("next")}
                  className="p-1.5 bg-white border border-gray-300 rounded hover:bg-gray-50 text-gray-600"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {hasTempChanges && (
                <button
                  onClick={() => setIsSaveModalOpen(true)}
                  className="px-3 py-1.5 text-xs bg-[#44CE2D] text-white rounded hover:bg-[#3bb025] flex items-center gap-1.5 font-semibold transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              )}
            </div>
          </div>

          {/* Grid Layout */}
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Day Titles */}
              <div className="grid grid-cols-8 border-b border-[var(--border)] bg-[var(--muted)]">
                <div className="p-3 text-xs font-semibold text-[var(--muted-foreground)]"></div>
                {availability.map((day) => (
                  <div
                    key={day.dayName}
                    className="p-3 text-center border-l border-[var(--border)]"
                  >
                    <div className="text-xs font-semibold text-[var(--foreground)]">
                      {day.dayName.toUpperCase().slice(0, 3)}
                    </div>
                    <div className="text-[10px] text-[var(--muted-foreground)]">
                      {day.date}
                    </div>
                  </div>
                ))}
              </div>

              {/* Time Slots Rows */}
              {timeSlots.map((slot, slotIdx) => (
                <div
                  key={slot.key}
                  className="grid grid-cols-8 border-b border-[var(--border)] last:border-0 hover:bg-[var(--muted)]/20 transition-colors"
                >
                  <div className="p-3 text-xs text-[var(--muted-foreground)] font-medium flex items-center justify-center bg-[var(--muted)]/30 border-r border-[var(--border)]">
                    {slot.from}
                  </div>
                  {availability.map((day, dayIdx) => {
                    const timeSlot = timeSlots[slotIdx];
                    const slotKey = timeSlotToKey(timeSlot);

                    // Determine booked status
                    const dateObj = new Date(day.date + ", " + currentWeekStart.getFullYear());
                    const year = currentWeekStart.getFullYear();
                    const monthNum = String(dateObj.getMonth() + 1).padStart(2, "0");
                    const dayNum = String(dateObj.getDate()).padStart(2, "0");
                    const dateKey = `${year}-${monthNum}-${dayNum}`;
                    const bookedBooking = bookedSlots[dateKey]?.[slotKey];
                    const isBooked = !!bookedBooking;

                    // Check existing availability
                    const isExistingSlot =
                      doctorAvailability &&
                      doctorAvailability[day?.dayName] &&
                      !!doctorAvailability[day?.dayName][slotKey];

                    // Check selected availability
                    const isSelectedSlot =
                      selectedSlots[day?.dayName] &&
                      !!selectedSlots[day?.dayName][slotKey];

                    const colorClass = getSlotStyle(isBooked, isExistingSlot, isSelectedSlot);

                    return (
                      <div
                        key={day.dayName}
                        onClick={() =>
                          isBooked
                            ? setSelectedBooking(bookedBooking)
                            : handleTimeSlotClick(dayIdx, slotIdx)
                        }
                        className={`p-2 border-l border-[var(--border)] min-h-[48px] flex items-center justify-center transition-all duration-150 cursor-pointer ${colorClass}`}
                      >
                        {isBooked ? (
                          <span className="text-[10px] font-semibold tracking-wide uppercase px-1 py-0.5 bg-white/20 rounded">
                            Booked
                          </span>
                        ) : isExistingSlot || isSelectedSlot ? (
                          <div className="w-2 h-2 rounded-full bg-current opacity-75"></div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Save Modal */}
      <BookedSlotInfoModal
        isOpen={!!selectedBooking}
        onClose={() => setSelectedBooking(null)}
        booking={selectedBooking}
        enableActions
        actor={isAdmin ? "admin" : "nurse"}
        onChanged={() => refetchBookings()}
      />

      <ConfirmModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        onConfirm={handleSaveAvailability}
        title="Save Availability Schedule"
        message="Are you sure you want to save the modified availability schedule for this doctor? This will update their booking slots immediately."
        confirmText={isSaving ? "Saving..." : "Yes, Save"}
        cancelText="No, Keep Editing"
      />
    </div>
  );
}
