"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  Edit,
  Save,
  X,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { timeSlots } from "@/components/Options";
import Link from "next/link";

interface AvailabilityData {
  [day: string]: {
    [slotKey: string]: string;
  };
}

const AvailabilityWidget: React.FC = () => {
  const { user, userInfo } = useAuth();
  const [availability, setAvailability] = useState<AvailabilityData>({});
  const [selectedSlots, setSelectedSlots] = useState<AvailabilityData>({});
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  // Debug logging
  console.log("AvailabilityWidget - user:", user);
  console.log("AvailabilityWidget - userInfo:", userInfo);
  console.log("AvailabilityWidget - availability:", availability);
  console.log("AvailabilityWidget - selectedSlots:", selectedSlots);

  // Load availability data (simplified for widget)
  useEffect(() => {
    const loadAvailability = async () => {
      try {
        setIsLoading(true);
        // In a real implementation, you would fetch from Firebase
        // For now, we'll use mock data or empty state
        const mockAvailability: AvailabilityData = {
          Monday: {
            morning_8am: "available",
            morning_9am: "available",
            afternoon_1pm: "available",
            afternoon_2pm: "available",
          },
          Tuesday: {
            morning_8am: "available",
            morning_9am: "available",
            afternoon_1pm: "available",
          },
          Wednesday: {
            morning_8am: "available",
            afternoon_1pm: "available",
            afternoon_2pm: "available",
          },
        };

        setAvailability(mockAvailability);
        setSelectedSlots(mockAvailability);
      } catch (error) {
        console.error("Error loading availability:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAvailability();
  }, []);

  const toggleSlot = (day: string, slotKey: string) => {
    if (!isEditing) return;

    setSelectedSlots((prev) => {
      const newSlots = { ...prev };
      if (!newSlots[day]) {
        newSlots[day] = {};
      }

      if (newSlots[day][slotKey]) {
        delete newSlots[day][slotKey];
        if (Object.keys(newSlots[day]).length === 0) {
          delete newSlots[day];
        }
      } else {
        newSlots[day][slotKey] = "available";
      }

      return newSlots;
    });
  };

  const getSlotStyle = (day: string, slotKey: string) => {
    const isExistingSlot = availability?.[day]?.[slotKey];
    const isSelectedSlot = selectedSlots[day]?.[slotKey];

    if (isExistingSlot && !isSelectedSlot) {
      return "bg-green-100 border-green-300 text-green-800"; // Existing availability
    }
    if (isSelectedSlot) {
      return "bg-green-500 border-green-600 text-white"; // Selected by user
    }
    if (!isExistingSlot && !isSelectedSlot) {
      return "bg-gray-100 border-gray-300 text-gray-500"; // Not available
    }
    return "bg-gray-50 border-gray-200 text-gray-400"; // Default
  };

  const handleSaveAvailability = () => {
    // In a real implementation, you would save to Firebase
    console.log("Saving availability:", selectedSlots);
    setAvailability(selectedSlots);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setSelectedSlots(availability);
    setIsEditing(false);
  };

  // Calculate statistics
  const totalSlots = daysOfWeek.length * timeSlots.length;
  const availableSlots = Object.values(availability).reduce(
    (total, daySlots) => total + Object.keys(daySlots).length,
    0
  );
  const availabilityPercentage =
    totalSlots > 0 ? Math.round((availableSlots / totalSlots) * 100) : 0;

  // Get days with availability
  const daysWithAvailability = Object.keys(availability).length;
  const mostAvailableDay = Object.entries(availability).reduce(
    (max, [day, slots]) => {
      const slotCount = Object.keys(slots).length;
      return slotCount > max.count ? { day, count: slotCount } : max;
    },
    { day: "None", count: 0 }
  );

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4" />
          <div className="grid grid-cols-2 gap-4 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-gray-100 rounded" />
            ))}
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-gray-100 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const statsData = [
    {
      title: "Available Slots",
      value: availableSlots,
      icon: CheckCircle,
      gradient: "from-green-500 to-emerald-600",
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
      description: "Total time slots",
      trend: "+5%",
    },
    {
      title: "Availability",
      value: `${availabilityPercentage}%`,
      icon: Calendar,
      gradient: "from-blue-500 to-indigo-600",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      description: "Weekly coverage",
      trend: "+8%",
    },
    {
      title: "Active Days",
      value: daysWithAvailability,
      icon: Clock,
      gradient: "from-purple-500 to-violet-600",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
      description: "Days with slots",
      trend: "+12%",
    },
    {
      title: "Peak Day",
      value: mostAvailableDay.day,
      icon: TrendingUp,
      gradient: "from-orange-500 to-amber-600",
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600",
      description: `${mostAvailableDay.count} slots`,
      trend: "+15%",
    },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <Calendar className="text-white" size={20} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Availability</h3>
            <p className="text-sm text-gray-500">
              Manage your appointment time slots
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <button
                onClick={handleSaveAvailability}
                className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors">
                <Save size={14} />
                Save
              </button>
              <button
                onClick={handleCancelEdit}
                className="flex items-center gap-1 px-3 py-1 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700 transition-colors">
                <X size={14} />
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors">
                <Edit size={14} />
                Edit
              </button>
              <Link
                href="/doctor/availability"
                className="text-blue-600 text-sm font-medium hover:text-blue-700">
                Manage
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {statsData.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <div
              key={index}
              className="group relative overflow-hidden bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
              {/* Gradient Background */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}></div>

              {/* Content */}
              <div className="relative p-4">
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`w-8 h-8 ${item.bgColor} rounded-lg flex items-center justify-center`}>
                    <IconComponent className={`w-4 h-4 ${item.iconColor}`} />
                  </div>
                  {item.trend && (
                    <div className="text-xs font-medium flex items-center gap-1 text-green-600">
                      ↗ {item.trend}
                    </div>
                  )}
                </div>

                <div className="mb-2">
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">
                    {item.value}
                  </h2>
                  <h3 className="text-sm font-semibold text-gray-700 mb-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-gray-500">{item.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Availability Preview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold text-gray-900">
            Weekly Overview
          </h4>
          <span className="text-sm text-gray-500">
            {availableSlots} slots available
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {daysOfWeek.slice(0, 4).map((day) => {
            const daySlots = availability[day] || {};
            const slotCount = Object.keys(daySlots).length;

            return (
              <div
                key={day}
                className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Calendar className="text-blue-600" size={14} />
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-900">{day}</h5>
                    <p className="text-sm text-gray-500">
                      {slotCount} slot{slotCount !== 1 ? "s" : ""} available
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {slotCount > 0 ? (
                    <CheckCircle className="text-green-600" size={16} />
                  ) : (
                    <XCircle className="text-gray-400" size={16} />
                  )}
                  <span className="text-sm font-medium text-gray-600">
                    {slotCount}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Slot Preview */}
        {Object.keys(availability).length > 0 && (
          <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
            <h5 className="text-sm font-semibold text-gray-900 mb-3">
              Sample Available Times
            </h5>
            <div className="flex flex-wrap gap-2">
              {Object.entries(availability)
                .slice(0, 2)
                .map(([day, slots]) =>
                  Object.keys(slots)
                    .slice(0, 3)
                    .map((slotKey) => {
                      const timeSlot = timeSlots.find(
                        (ts) => ts.key === slotKey
                      );
                      return (
                        <span
                          key={`${day}-${slotKey}`}
                          className="px-2 py-1 bg-white border border-blue-200 rounded-md text-xs text-gray-700">
                          {day.slice(0, 3)} {timeSlot?.from}
                        </span>
                      );
                    })
                )}
              {availableSlots > 6 && (
                <span className="px-2 py-1 bg-blue-100 border border-blue-200 rounded-md text-xs text-blue-700">
                  +{availableSlots - 6} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Summary Section */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Total Slots: {totalSlots}</span>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span className="text-gray-600">Available: {availableSlots}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              <span className="text-gray-600">
                Coverage: {availabilityPercentage}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvailabilityWidget;
