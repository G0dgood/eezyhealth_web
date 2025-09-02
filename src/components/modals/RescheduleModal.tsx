import React, { useState } from "react";
import { Calendar, Clock } from "lucide-react";
import Modal from "./Modal";

interface RescheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rescheduleData: { date: string; time: string }) => void;
  currentDate?: string;
  currentTime?: string;
}

const RescheduleModal: React.FC<RescheduleModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  currentDate = "",
  currentTime = "",
}) => {
  const [formData, setFormData] = useState({
    date: currentDate,
    time: currentTime,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Reschedule Appointment" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            New Date
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="dd/mm/yy"
              value={formData.date}
              onChange={(e) => handleInputChange("date", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#44CE2D] focus:border-[#44CE2D]"
              required
            />
            <Calendar className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2" />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            New Time
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Select Time"
              value={formData.time}
              onChange={(e) => handleInputChange("time", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#44CE2D] focus:border-[#44CE2D]"
              required
            />
            <Clock className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2" />
          </div>
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-[#44CE2D] text-white rounded-lg hover:bg-[#3bb025] transition-colors"
          >
            Reschedule
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default RescheduleModal;
