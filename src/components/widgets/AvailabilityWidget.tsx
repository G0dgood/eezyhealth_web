"use client";

import React, { useState } from "react";
import { Clock, Calendar, Trash2, Plus } from "lucide-react";
import Input from "@/components/Input";
import Dropdown from "@/components/Dropdown";

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
    <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 md:mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-[#44CE2D] to-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <Clock className="text-white" size={16} />
          </div>
          <div>
            <h3 className="text-[14px] md:text-[16px] md:text-[16px] md:text-[18px] font-bold text-gray-900">Availability Schedule</h3>
            <p className="text-xs md: text-[10px]  md:text-[12px] text-gray-500">Manage your working hours</p>
          </div>
        </div>
        <button
          onClick={() => setIsAddingSlot(!isAddingSlot)}
          className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-[#44CE2D] text-white rounded-lg hover:bg-[#3bb025] transition-colors  text-[10px]  md:text-[12px]">
          <Plus size={16} />
          <span>Add Slot</span>
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-4 md:mb-6">
        <div className="text-center p-2 md:p-3 bg-blue-50 rounded-lg">
          <div className="text-[14px] md:text-[16px] md:text-[18px] md:text-[20px] font-bold text-blue-600">{availableDays}</div>
          <div className="text-[10px] md:text-xs text-gray-600">Available Days</div>
        </div>
        <div className="text-center p-2 md:p-3 bg-green-50 rounded-lg">
          <div className="text-[14px]text-[18px] md:text-[20px]-[16px] md:text-[18px] md:text-[20px] font-bold text-green-600">{totalHours}</div>
          <div className="text-[10px] md:text-xs text-gray-600">Hours/Week</div>
        </div>
        <div className="text-center p-2 md:p-3 bg-purple-50 rounded-lg">
          <div className="text-[14px]text-[18px] md:text-[20px]-[16px] md:text-[18px] md:text-[20px] font-bold text-purple-600">
            {timeSlots.length - availableDays}
          </div>
          <div className="text-[10px] md:text-xs text-gray-600">Off Days</div>
        </div>
      </div>

      {/* Add New Slot Form */}
      {isAddingSlot && (
        <div className="mb-4 md:mb-6 p-3 md:p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="font-semibold  text-[10px]  md:text-[12px] md:text-base text-gray-900 mb-3">Add New Time Slot</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Dropdown
              value={newSlot.day}
              onChange={(value) => setNewSlot({ ...newSlot, day: value })}
              options={[
                { value: "", label: "Select Day" },
                { value: "Monday", label: "Monday" },
                { value: "Tuesday", label: "Tuesday" },
                { value: "Wednesday", label: "Wednesday" },
                { value: "Thursday", label: "Thursday" },
                { value: "Friday", label: "Friday" },
                { value: "Saturday", label: "Saturday" },
                { value: "Sunday", label: "Sunday" },
              ]}
              placeholder="Select Day"
              className="w-full"
              variant="default"
            />
            <Input
              type="time"
              value={newSlot.startTime}
              onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
              placeholder="Start Time"
              fullWidth={true}
            />
            <Input
              type="time"
              value={newSlot.endTime}
              onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
              placeholder="End Time"
              fullWidth={true}
            />
          </div>
          <div className="flex flex-col md:flex-row gap-2 mt-3">
            <button
              onClick={handleAddSlot}
              className="w-full md:w-auto px-4 py-2 bg-[#44CE2D] text-white rounded-lg hover:bg-[#3bb025] transition-colors  text-[10px]  md:text-[12px]">
              Add Slot
            </button>
            <button
              onClick={() => {
                setIsAddingSlot(false);
                setNewSlot({ day: "", startTime: "", endTime: "" });
              }}
              className="w-full md:w-auto px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors  text-[10px]  md:text-[12px]">
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
                  <p className=" text-[10px]  md:text-[12px] text-gray-600">
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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4  text-[10px]  md:text-[12px]">
          <span className="text-gray-600 text-xs md: text-[10px]  md:text-[12px]">
            Weekly Schedule: {availableDays} days available
          </span>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span className="text-gray-600 text-xs md: text-[10px]  md:text-[12px]">Available: {availableDays}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
              <span className="text-gray-600 text-xs md: text-[10px]  md:text-[12px]">Off: {timeSlots.length - availableDays}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvailabilityWidget;