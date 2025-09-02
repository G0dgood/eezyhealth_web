import React, { useState } from "react";
import { Calendar, Clock } from "lucide-react";
import Modal from "./Modal";
import SearchInput from "../SearchInput";
import { AppointmentData } from "@/types";

interface AddAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (appointmentData: AppointmentData) => void;
}

const AddAppointmentModal: React.FC<AddAppointmentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState({
    patientName: "",
    date: "",
    time: "",
    reason: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Appointment" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search Patient Name
          </label>
          <SearchInput
            value={formData.patientName}
            onChange={(value) => handleInputChange("patientName", value)}
            placeholder="Search patient name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="dd/mm/yy"
              value={formData.date}
              onChange={(e) => handleInputChange("date", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#44CE2D] focus:border-[#44CE2D]"
            />
            <Calendar className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Time
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Select Time"
              value={formData.time}
              onChange={(e) => handleInputChange("time", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#44CE2D] focus:border-[#44CE2D]"
            />
            <Clock className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reason for consultation
          </label>
          <textarea
            rows={3}
            placeholder="Enter reason for consultation"
            value={formData.reason}
            onChange={(e) => handleInputChange("reason", e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#44CE2D] focus:border-[#44CE2D]"
          />
        </div>

        <button
          type="submit"
          className="w-full px-4 py-2 bg-[#44CE2D] text-white rounded-lg hover:bg-[#3bb025] transition-colors cursor-pointer">
          Schedule Appointment
        </button>
      </form>
    </Modal>
  );
};

export default AddAppointmentModal;
