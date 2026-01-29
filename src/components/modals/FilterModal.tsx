"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import Input from "@/components/Input";

interface FilterData {
  status: "pending" | "completed" | "cancelled" | "";
  channel: "chat" | "videoCall" | "voiceCall" | "";
}

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: FilterData) => void;
  onClear: () => void;
  initialFilters?: FilterData;
}

export default function FilterModal({
  isOpen,
  onClose,
  onApply,
  onClear,
  initialFilters = { status: "pending", channel: "chat" },
}: FilterModalProps) {
  const [filters, setFilters] = useState<FilterData>(initialFilters);

  useEffect(() => {
    if (isOpen) {
      setFilters(initialFilters);
    }
  }, [isOpen, initialFilters]);

  const handleStatusChange = (value: FilterData["status"]) => {
    setFilters((prev) => ({ ...prev, status: value }));
  };

  const handleChannelChange = (value: FilterData["channel"]) => {
    setFilters((prev) => ({ ...prev, channel: value }));
  };

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const handleClear = () => {
    const clearedFilters: FilterData = { status: "", channel: "" };
    setFilters(clearedFilters);
    onClear();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-[14px] md:text-[16px] font-semibold text-gray-900">Filter</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Content */}
        <div className="p-6 space-y-6">
          {/* Status Section */}
          <div>
            <h4 className=" text-[10px]  md:text-[12px] font-medium text-gray-900 mb-3">Status</h4>
            <div className="space-y-3">
              <label className="flex items-center space-x-3 cursor-pointer">
                <Input
                  type="radio"
                  name="status"
                  value="pending"
                  checked={filters.status === "pending"}
                  onChange={() => handleStatusChange("pending")}
                  fullWidth={false}
                />
                <span className=" text-[10px]  md:text-[12px] text-gray-700">Pending</span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <Input
                  type="radio"
                  name="status"
                  value="completed"
                  checked={filters.status === "completed"}
                  onChange={() => handleStatusChange("completed")}
                  fullWidth={false}
                />
                <span className=" text-[10px]  md:text-[12px] text-gray-700">Completed</span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <Input
                  type="radio"
                  name="status"
                  value="cancelled"
                  checked={filters.status === "cancelled"}
                  onChange={() => handleStatusChange("cancelled")}
                  fullWidth={false}
                />
                <span className=" text-[10px]  md:text-[12px] text-gray-700">Cancelled</span>
              </label>
            </div>
          </div>

          {/* Channel Section */}
          <div>
            <h4 className=" text-[10px]  md:text-[12px] font-medium text-gray-900 mb-3">Channel</h4>
            <div className="space-y-3">
              <label className="flex items-center space-x-3 cursor-pointer">
                <Input
                  type="radio"
                  name="channel"
                  value="chat"
                  checked={filters.channel === "chat"}
                  onChange={() => handleChannelChange("chat")}
                  fullWidth={false}
                />
                <span className=" text-[10px]  md:text-[12px] text-gray-700">Chat</span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <Input
                  type="radio"
                  name="channel"
                  value="videoCall"
                  checked={filters.channel === "videoCall"}
                  onChange={() => handleChannelChange("videoCall")}
                  fullWidth={false}
                />
                <span className=" text-[10px]  md:text-[12px] text-gray-700">Video Call</span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <Input
                  type="radio"
                  name="channel"
                  value="voiceCall"
                  checked={filters.channel === "voiceCall"}
                  onChange={() => handleChannelChange("voiceCall")}
                  fullWidth={false}
                />
                <span className=" text-[10px]  md:text-[12px] text-gray-700">Voice Call</span>
              </label>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <button
            onClick={handleClear}
            className="px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition-colors">
            Clear All
          </button>
          <button
            onClick={handleApply}
            className="px-4 py-2 bg-[#44CE2D] text-white rounded-lg hover:opacity-90 transition-opacity">
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
