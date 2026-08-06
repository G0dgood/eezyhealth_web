import React, { useState, useEffect } from "react";
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import Modal from "./Modal";
import Input from "../Input";
import { useGetFirebaseDoctorProfileByIdQuery } from "@/store/doctorFirebaseApi";
import { useGetBookingsByDoctorIdQuery } from "@/store/bookingApi";
import { convertSlotToTime } from "../Options";

interface RescheduleModalProps {
 isOpen: boolean;
 onClose: () => void;
 onSubmit: (rescheduleData: { date: string; time: string }) => void;
 currentDate?: string;
 currentTime?: string;
 doctorId?: string;
}

interface Doctor {
 id: string;
 display_name?: string;
 first_name?: string;
 last_name?: string;
 availability?: {
  [day: string]: {
   [time: string]: string;
  };
 };
}

const RescheduleModal: React.FC<RescheduleModalProps> = ({
 isOpen,
 onClose,
 onSubmit,
 currentDate = "",
 currentTime = "",
 doctorId = "",
}) => {
 // Calendar states
 const [selectedDate, setSelectedDate] = useState<Date | null>(
  currentDate ? new Date(currentDate) : new Date()
 );
 const [currentMonth, setCurrentMonth] = useState(new Date());
 const [selectedTime, setSelectedTime] = useState(currentTime);
 const [selectedDayAvailability, setSelectedDayAvailability] = useState<{
  [key: string]: string;
 } | null>(null);

 // Fallback states if doctorId is missing
 const [fallbackDate, setFallbackDate] = useState(currentDate);
 const [fallbackTime, setFallbackTime] = useState(currentTime);

 // Fetch doctor data using RTK
 const { data: doctorData, isLoading: isDoctorLoading } =
  useGetFirebaseDoctorProfileByIdQuery(doctorId, {
   skip: !doctorId,
  });

 // Fetch bookings to show busy slots
 const { data: bookingsData } = useGetBookingsByDoctorIdQuery(doctorId, {
  skip: !doctorId,
 });

 const doctor = doctorData as Doctor | undefined;

 // Initialize availability when selectedDate changes or doctor profile loads
 useEffect(() => {
  if (selectedDate && doctor) {
   const availability = getDayAvailability(selectedDate);
   setSelectedDayAvailability(availability);
  }
 }, [selectedDate, doctorData]);

 // Reset selected states when modal opens
 useEffect(() => {
  if (isOpen) {
   const parsedDate = currentDate ? new Date(currentDate) : new Date();
   setSelectedDate(parsedDate);
   setCurrentMonth(parsedDate);
   setSelectedTime(currentTime);
   setFallbackDate(currentDate);
   setFallbackTime(currentTime);
  }
 }, [isOpen, currentDate, currentTime]);

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

 const hasAvailability = (date: Date): boolean => {
  if (!doctor?.availability) return false;
  const dayName = getDayName(date);
  return (
   doctor.availability[dayName] &&
   Object.keys(doctor.availability[dayName]).length > 0
  );
 };

 const getDayAvailability = (date: Date): { [key: string]: string } | null => {
  if (!doctor?.availability) return null;
  const dayName = getDayName(date);
  return doctor.availability[dayName] || null;
 };

 const parseBookingDate = (bookingDate: any): Date | null => {
  if (!bookingDate) return null;
  if (typeof bookingDate === "string") {
   return new Date(bookingDate);
  }
  if (typeof bookingDate === "object") {
   if (typeof bookingDate.seconds === "number") {
    return new Date(bookingDate.seconds * 1000);
   }
   if (typeof bookingDate._seconds === "number") {
    return new Date(bookingDate._seconds * 1000);
   }
  }
  return null;
 };

 const isSlotBooked = (timeSlot: string): boolean => {
  if (!selectedDate || !bookingsData) return false;
  const targetDay = selectedDate.getDate();
  const targetMonth = selectedDate.getMonth();
  const targetYear = selectedDate.getFullYear();

  const data = Array.isArray(bookingsData) ? bookingsData : (bookingsData as any)?.bookings || [];
  return data.some((booking: any) => {
   if (booking.bookingStatus === "Cancelled" || booking.status === "Cancelled") {
    return false;
   }
   const bDate = parseBookingDate(booking.bookingDate || booking.date);
   if (!bDate || isNaN(bDate.getTime())) return false;

   const isSameDay =
    bDate.getDate() === targetDay &&
    bDate.getMonth() === targetMonth &&
    bDate.getFullYear() === targetYear;
   if (!isSameDay) return false;

   return String(booking.slot || "").trim().toLowerCase() === String(timeSlot).trim().toLowerCase();
  });
 };

  const isSlotPassed = (timeSlot: string): boolean => {
    if (!selectedDate) return false;
    const today = new Date();
    
    const d1 = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
    const d2 = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    if (d1 < d2) return true;
    if (d1 > d2) return false;

    // Same day, check time slot
    const timeStr = convertSlotToTime(timeSlot);
    const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!match) return false;

    const [_, hoursStr, minutesStr, ampm] = match;
    let hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr, 10);

    if (ampm.toUpperCase() === "PM" && hours !== 12) {
      hours += 12;
    } else if (ampm.toUpperCase() === "AM" && hours === 12) {
      hours = 0;
    }

    const currentHours = today.getHours();
    const currentMinutes = today.getMinutes();

    if (hours < currentHours) return true;
    if (hours === currentHours && minutes <= currentMinutes) return true;
    return false;
  };

 const getBookingsCountForDate = (date: Date): number => {
  if (!bookingsData) return 0;
  const targetDay = date.getDate();
  const targetMonth = date.getMonth();
  const targetYear = date.getFullYear();

  const data = Array.isArray(bookingsData) ? bookingsData : (bookingsData as any)?.bookings || [];
  return data.filter((booking: any) => {
   if (booking.bookingStatus === "Cancelled" || booking.status === "Cancelled") {
    return false;
   }
   const bDate = parseBookingDate(booking.bookingDate || booking.date);
   return (
    bDate &&
    bDate.getDate() === targetDay &&
    bDate.getMonth() === targetMonth &&
    bDate.getFullYear() === targetYear
   );
  }).length;
 };

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
  const remainingDays = 42 - days.length;
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
  setSelectedTime("");
 };

 const formatDate = (date: Date): string => {
  return date.toLocaleDateString("en-US", {
   month: "long",
   year: "numeric",
  });
 };

 const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  if (doctorId) {
   if (selectedDate && selectedTime) {
    const formattedDate = selectedDate.toLocaleDateString("en-CA"); // YYYY-MM-DD
    onSubmit({ date: formattedDate, time: selectedTime });
    onClose();
   }
  } else {
   if (fallbackDate && fallbackTime) {
    onSubmit({ date: fallbackDate, time: fallbackTime });
    onClose();
   }
  }
 };

 const calendarDays = getDaysInMonth(currentMonth);

 return (
  <Modal isOpen={isOpen} onClose={onClose} title="Reschedule Appointment" size={doctorId ? "lg" : "md"}>
   <form onSubmit={handleSubmit} className="space-y-6">
    {doctorId ? (
     <div className="space-y-6">
      {/* Calendar Selection View */}
      <div>
       <label className="block text-sm font-medium text-gray-700 mb-2">
        Select Available Date
       </label>
       <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-4">
         <button
          type="button"
          onClick={goToPreviousMonth}
          className="p-1.5 hover:bg-gray-200 rounded-lg cursor-pointer transition-colors"
         >
          <ChevronLeft className="w-5 h-5 text-gray-700" />
         </button>
         <h4 className="font-semibold text-gray-900">
          {formatDate(currentMonth)}
         </h4>
         <button
          type="button"
          onClick={goToNextMonth}
          className="p-1.5 hover:bg-gray-200 rounded-lg cursor-pointer transition-colors"
         >
          <ChevronRight className="w-5 h-5 text-gray-700" />
         </button>
        </div>

        {/* Days of Week */}
        <div className="grid grid-cols-7 gap-1 mb-2">
         {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
          <div
           key={day}
           className="text-center text-xs font-semibold text-gray-500 py-1"
          >
           {day}
          </div>
         ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1.5">
         {calendarDays.map((dayData, index) => {
          const bookingsCount = getBookingsCountForDate(dayData.date);
          const isSelected = dayData.selected;
          return (
           <button
            type="button"
            key={index}
            onClick={() => handleDateSelect(dayData.date)}
            className={`p-2.5 text-xs md:text-sm rounded-lg transition-colors cursor-pointer relative font-medium h-10 w-full flex items-center justify-center ${isSelected
              ? "bg-green-500 text-white shadow-sm"
              : dayData.currentMonth
               ? dayData.hasAvailability
                ? bookingsCount > 0
                 ? "bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100"
                 : "bg-green-50 text-green-700 border border-green-200 hover:bg-green-100"
                : "hover:bg-gray-200 text-gray-900 bg-white"
               : "text-gray-400 bg-transparent"
             }`}
           >
            {dayData.day}
            {bookingsCount > 0 && !isSelected && (
             <span className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full" />
            )}
           </button>
          );
         })}
        </div>
       </div>
      </div>

      {/* Time Slot Selection */}
      {selectedDayAvailability && (
       <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
         Available Times for {selectedDate ? getDayName(selectedDate) : ""}
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {Object.entries(selectedDayAvailability).map(
           ([timeSlot, status]) => {
            const booked = isSlotBooked(timeSlot);
            const passed = isSlotPassed(timeSlot);
            return (
             <button
              type="button"
              key={timeSlot}
              onClick={() => setSelectedTime(timeSlot)}
              disabled={booked || passed || status !== "available"}
              className={`p-2.5 text-xs md:text-sm rounded-lg border transition-colors cursor-pointer font-medium ${booked
                ? "bg-blue-50 text-blue-700 border-blue-200 cursor-not-allowed"
                : passed
                 ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed line-through"
                 : selectedTime === timeSlot
                  ? "bg-green-500 text-white border-green-500 shadow-sm"
                  : status === "available"
                   ? "bg-white text-gray-700 border-gray-300 hover:bg-green-50"
                   : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
               }`}
             >
              {timeSlot
               .replace(/_/g, " ")
               .replace(/([A-Z])/g, " $1")
               .trim()}
              {booked && " (Booked)"}
              {passed && " (Passed)"}
             </button>
            );
           }
          )}
        </div>
       </div>
      )}
     </div>
    ) : (
     /* Fallback simple inputs if doctorId is missing */
     <div className="space-y-4">
      <div>
       <Input
        label="New Date"
        type="date"
        value={fallbackDate}
        onChange={(e) => setFallbackDate(e.target.value)}
        icon={<CalendarIcon className="w-4 h-4 text-gray-400" />}
        required
        fullWidth
       />
      </div>

      <div>
       <Input
        label="New Time"
        type="time"
        value={fallbackTime}
        onChange={(e) => setFallbackTime(e.target.value)}
        icon={<Clock className="w-4 h-4 text-gray-400" />}
        required
        fullWidth
       />
      </div>
     </div>
    )}

    <div className="flex justify-end space-x-3 pt-2">
     <button
      type="button"
      onClick={onClose}
      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
     >
      Cancel
     </button>
     <button
      type="submit"
      disabled={doctorId ? (!selectedDate || !selectedTime) : (!fallbackDate || !fallbackTime)}
      className="px-5 py-2 bg-[#44CE2D] text-white rounded-lg hover:bg-[#3bb025] transition-colors cursor-pointer disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed shadow-sm font-medium"
     >
      Reschedule
     </button>
    </div>
   </form>
  </Modal>
 );
};

export default RescheduleModal;
