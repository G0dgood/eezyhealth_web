"use client";

import React, { useState, useEffect } from "react";
import { Clock, Calendar, Save } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useGetDoctorAvailabilityQuery, useSaveDoctorAvailabilityMutation } from "@/store/api";
import { toast } from "sonner";
import { timeSlots as referenceTimeSlots } from "@/components/Options";

interface WidgetTimeSlot {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  originalKey: string;
}

interface DoctorProfile {
  availability?: Record<string, Record<string, unknown>>;
}

const AvailabilityWidget: React.FC = () => {
  const { user } = useAuth();
  const doctorId = user?.uid || "";

  const { data: doctorData, isLoading: isLoadingData } = useGetDoctorAvailabilityQuery(doctorId, {
    skip: !doctorId,
  });

  const [saveAvailability, { isLoading: isSaving }] = useSaveDoctorAvailabilityMutation();

  const [timeSlots, setTimeSlots] = useState<WidgetTimeSlot[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [originalAvailability, setOriginalAvailability] = useState<Record<string, Record<string, unknown>>>({});

  useEffect(() => {
    const data = doctorData as DoctorProfile;
    if (data?.availability) {
      setOriginalAvailability(data.availability);
      const loadedSlots: WidgetTimeSlot[] = [];
      Object.entries(data.availability).forEach(([day, slots]) => {
        if (slots && typeof slots === 'object') {
          Object.keys(slots).forEach((slotKey) => {
            const refSlot = referenceTimeSlots.find((s) => s.key === slotKey);
            if (refSlot) {
              loadedSlots.push({
                id: `${day}-${slotKey}`,
                day,
                startTime: refSlot.from,
                endTime: refSlot.to,
                isAvailable: true,
                originalKey: slotKey,
              });
            }
          });
        }
      });
      // Sort slots by day and time for better display
      const dayOrder = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      loadedSlots.sort((a, b) => {
        const dayDiff = dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
        if (dayDiff !== 0) return dayDiff;
        return a.startTime.localeCompare(b.startTime);
      });

      setTimeSlots(loadedSlots);
    }
  }, [doctorData]);

  const handleSaveChanges = async () => {
    if (!doctorId) return;
    try {
      // Start with a deep copy of original availability to preserve unrecognized slots
      const availabilityPayload: Record<string, Record<string, unknown>> = JSON.parse(
        JSON.stringify(originalAvailability || {})
      );

      // 1. Remove recognized slots that are no longer available (deleted or toggled off)
      Object.keys(availabilityPayload).forEach((day) => {
        const daySlots = availabilityPayload[day];
        if (daySlots && typeof daySlots === 'object') {
          Object.keys(daySlots).forEach((key) => {
            const isRecognized = referenceTimeSlots.some((s) => s.key === key);
            if (isRecognized) {
              const isStillAvailable = timeSlots.some(
                (s) => s.day === day && s.originalKey === key && s.isAvailable
              );
              if (!isStillAvailable) {
                delete (daySlots as Record<string, unknown>)[key];
              }
            }
          });

          // Remove day if empty
          if (Object.keys(daySlots).length === 0) {
            delete availabilityPayload[day];
          }
        }
      });

      // 2. Add/Update available slots from current state
      timeSlots.forEach((slot) => {
        if (slot.isAvailable) {
          if (!availabilityPayload[slot.day]) {
            availabilityPayload[slot.day] = {};
          }
          (availabilityPayload[slot.day] as Record<string, unknown>)[slot.originalKey] = "available";
        }
      });

      await saveAvailability({
        doctorId,
        selectedSlots: availabilityPayload,
      }).unwrap();

      setHasUnsavedChanges(false);
      // Update originalAvailability to match what we just saved
      setOriginalAvailability(availabilityPayload);
      toast.success("Availability saved successfully");
    } catch (error) {
      console.error("Failed to save availability:", error);
      toast.error("Failed to save availability");
    }
  };

  const handleToggleAvailability = (id: string) => {
    setTimeSlots(
      timeSlots.map((slot) =>
        slot.id === id ? { ...slot, isAvailable: !slot.isAvailable } : slot
      )
    );
    setHasUnsavedChanges(true);
  };



  const availableDays = timeSlots.filter((slot) => slot.isAvailable).length;
  const totalHours = timeSlots
    .filter((slot) => slot.isAvailable)
    .reduce((total, slot) => {
      const start = parseInt(slot.startTime.split(":")[0]);
      const end = parseInt(slot.endTime.split(":")[0]);
      return total + (end - start);
    }, 0);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 md:mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-[#44CE2D] to-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <Clock className="text-white" size={16} />
          </div>
          <div>
            <h3 className="text-sm md:text-base lg:text-lg font-bold text-gray-900">Availability Schedule</h3>
            <p className="text-xs md:text-sm text-gray-500">Manage your working hours</p>
          </div>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          {hasUnsavedChanges && (
            <button
              onClick={handleSaveChanges}
              disabled={isSaving}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs md:text-sm disabled:opacity-50"
            >
              <Save size={16} />
              <span>{isSaving ? "Saving..." : "Save Changes"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-4 md:mb-6">
        <div className="text-center p-2 md:p-3 bg-blue-50 rounded-lg">
          <div className="text-lg md:text-xl lg:text-2xl font-bold text-blue-600">{availableDays}</div>
          <div className="text-xs md:text-sm text-gray-600">Available Days</div>
        </div>
        <div className="text-center p-2 md:p-3 bg-green-50 rounded-lg">
          <div className="text-lg md:text-xl lg:text-2xl font-bold text-green-600">{totalHours}</div>
          <div className="text-xs md:text-sm text-gray-600">Hours/Week</div>
        </div>
        <div className="text-center p-2 md:p-3 bg-purple-50 rounded-lg">
          <div className="text-lg md:text-xl lg:text-2xl font-bold text-purple-600">
            {timeSlots.length - availableDays}
          </div>
          <div className="text-xs md:text-sm text-gray-600">Off Days</div>
        </div>
      </div>

      {/* Time Slots List */}
      <div className="space-y-3">
        {timeSlots.map((slot) => (
          <div
            key={slot.id}
            className={`border rounded-lg p-4 transition-colors ${slot.isAvailable
              ? "border-green-200 bg-green-50"
              : "border-gray-200 bg-gray-50"
              }`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div className="flex items-center gap-3 mb-2 md:mb-0">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${slot.isAvailable ? "bg-green-100" : "bg-gray-100"
                    }`}>
                  <Calendar
                    size={16}
                    className={slot.isAvailable ? "text-green-600" : "text-gray-600"}
                  />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{slot.day}</h4>
                  <p className="text-xs md:text-sm text-gray-600">
                    {slot.startTime} - {slot.endTime}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2 md:mt-0 justify-end w-full md:w-auto">
                <button
                  onClick={() => handleToggleAvailability(slot.id)}
                  className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${slot.isAvailable
                    ? "bg-green-100 text-green-800 hover:bg-green-200"
                    : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                    }`}>
                  {slot.isAvailable ? "Available" : "Unavailable"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Section */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs md:text-sm">
          <span className="text-gray-600 text-xs md:text-sm">
            Weekly Schedule: {availableDays} days available
          </span>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span className="text-gray-600 text-xs md:text-sm">Available: {availableDays}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
              <span className="text-gray-600 text-xs md:text-sm">Off: {timeSlots.length - availableDays}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvailabilityWidget;