"use client";

import React, { useState } from "react";
import { Clock, Calendar, Plus, Edit, Trash2 } from "lucide-react";

interface TimeSlot {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

const AvailabilityWidget: React.FC = () => {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([
    {
      id: "1",
      day: "Monday",
      startTime: "09:00",
      endTime: "17:00",
      isAvailable: true,
    },
    {
      id: "2",
      day: "Tuesday",
      startTime: "09:00",
      endTime: "17:00",
      isAvailable: true,
    },
    {
      id: "3",
      day: "Wednesday",
      startTime: "09:00",
      endTime: "17:00",
      isAvailable: true,
    },
    {
      id: "4",
      day: "Thursday",
      startTime: "09:00",
      endTime: "17:00",
      isAvailable: true,
    },
    {
      id: "5",
      day: "Friday",
      startTime: "09:00",
      endTime: "17:00",
      isAvailable: true,
    },
    {
      id: "6",
      day: "Saturday",
      startTime: "10:00",
      endTime: "14:00",
      isAvailable: false,
    },
    {
      id: "7",
      day: "Sunday",
      startTime: "10:00",
      endTime: "14:00",
      isAvailable: false,
    },
  ]);

  const [isAddingSlot, setIsAddingSlot] = useState(false);
  const [newSlot, setNewSlot] = useState({
    day: "",
    startTime: "",
    endTime: "",
  });

  const handleAddSlot = () => {
    if (newSlot.day && newSlot.startTime && newSlot.endTime) {
      const slot: TimeSlot = {
        id: Date.now().toString(),
        day: newSlot.day,
        startTime: newSlot.startTime,
        endTime: newSlot.endTime,
        isAvailable: true,
      };
      setTimeSlots([...timeSlots, slot]);
      setNewSlot({ day: "", startTime: "", endTime: "" });
      setIsAddingSlot(false);
    }
  };

  const handleToggleAvailability = (id: string) => {
    setTimeSlots(
      timeSlots.map((slot) =>
        slot.id === id ? { ...slot, isAvailable: !slot.isAvailable } : slot
      )
    );
  };

  const handleDeleteSlot = (id: string) => {
    setTimeSlots(timeSlots.filter((slot) => slot.id !== id));
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
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-[#44CE2D] to-green-600 rounded-xl flex items-center justify-center">
            <Clock className="text-white" size={20} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Availability Schedule</h3>
            <p className="text-sm text-gray-500">Manage your working hours</p>
          </div>
        </div>
        <button
          onClick={() => setIsAddingSlot(true)}
          className="flex items-center gap-2 px-3 py-2 bg-[#44CE2D] text-white rounded-lg hover:bg-[#3bb025] transition-colors text-sm">
          <Plus size={16} />
          Add Slot
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{availableDays}</div>
          <div className="text-xs text-gray-600">Available Days</div>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{totalHours}</div>
          <div className="text-xs text-gray-600">Hours/Week</div>
        </div>
        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">
            {timeSlots.length - availableDays}
          </div>
          <div className="text-xs text-gray-600">Off Days</div>
        </div>
      </div>

      {/* Add New Slot Form */}
      {isAddingSlot && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-3">Add New Time Slot</h4>
          <div className="grid grid-cols-3 gap-3">
            <select
              value={newSlot.day}
              onChange={(e) => setNewSlot({ ...newSlot, day: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#44CE2D] focus:border-transparent">
              <option value="">Select Day</option>
              <option value="Monday">Monday</option>
              <option value="Tuesday">Tuesday</option>
              <option value="Wednesday">Wednesday</option>
              <option value="Thursday">Thursday</option>
              <option value="Friday">Friday</option>
              <option value="Saturday">Saturday</option>
              <option value="Sunday">Sunday</option>
            </select>
            <input
              type="time"
              value={newSlot.startTime}
              onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#44CE2D] focus:border-transparent"
              placeholder="Start Time"
            />
            <input
              type="time"
              value={newSlot.endTime}
              onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#44CE2D] focus:border-transparent"
              placeholder="End Time"
            />
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleAddSlot}
              className="px-4 py-2 bg-[#44CE2D] text-white rounded-lg hover:bg-[#3bb025] transition-colors text-sm">
              Add Slot
            </button>
            <button
              onClick={() => {
                setIsAddingSlot(false);
                setNewSlot({ day: "", startTime: "", endTime: "" });
              }}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Time Slots List */}
      <div className="space-y-3">
        {timeSlots.map((slot) => (
          <div
            key={slot.id}
            className={`border rounded-lg p-4 transition-colors ${slot.isAvailable
              ? "border-green-200 bg-green-50"
              : "border-gray-200 bg-gray-50"
              }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
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
                  <p className="text-sm text-gray-600">
                    {slot.startTime} - {slot.endTime}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleAvailability(slot.id)}
                  className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${slot.isAvailable
                    ? "bg-green-100 text-green-800 hover:bg-green-200"
                    : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                    }`}>
                  {slot.isAvailable ? "Available" : "Unavailable"}
                </button>
                <button
                  onClick={() => handleDeleteSlot(slot.id)}
                  className="p-1 hover:bg-red-100 rounded text-red-600 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Section */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            Weekly Schedule: {availableDays} days available
          </span>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span className="text-gray-600">Available: {availableDays}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
              <span className="text-gray-600">Off: {timeSlots.length - availableDays}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvailabilityWidget;