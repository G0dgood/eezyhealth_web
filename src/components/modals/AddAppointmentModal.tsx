import React, { useState } from "react";
import { Calendar, Clock } from "lucide-react";
import Modal from "./Modal";
import SearchInput from "../SearchInput";
import Input from "../Input";
import Textarea from "../Textarea";
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
          <label className="block  text-[10px]  md:text-[12px] font-medium text-gray-700 mb-2">
            Search Patient Name
          </label>
          <SearchInput
            value={formData.patientName}
            onChange={(value) => handleInputChange("patientName", value)}
            placeholder="Search patient name"
          />
        </div>

        <div>
          <Input
            label="Date"
            type="text"
            placeholder="dd/mm/yy"
            value={formData.date}
            onChange={(e) => handleInputChange("date", e.target.value)}
            icon={<Calendar className="w-4 h-4 text-gray-400" />}
            fullWidth
          />
        </div>

        <div>
          <Input
            label="Select Time"
            type="text"
            placeholder="Select Time"
            value={formData.time}
            onChange={(e) => handleInputChange("time", e.target.value)}
            icon={<Clock className="w-4 h-4 text-gray-400" />}
            fullWidth
          />
        </div>

        <div>
          <Textarea
            label="Reason for consultation"
            rows={3}
            placeholder="Enter reason for consultation"
            value={formData.reason}
            onChange={(e) => handleInputChange("reason", e.target.value)}
            fullWidth
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
