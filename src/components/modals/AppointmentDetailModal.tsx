import React from "react";
import Modal from "./Modal";

interface Appointment {
  id: string;
  patientName: string;
  date: string;
  time: string;
  status: string;
  reason?: string;
  consultationNote?: string;
}

interface AppointmentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
}

const AppointmentDetailModal: React.FC<AppointmentDetailModalProps> = ({
  isOpen,
  onClose,
  appointment,
}) => {
  if (!appointment) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Appointment Detail" size="md">
      <div className="space-y-4">
        <div>
          <span className=" text-[10px]  md:text-[12px] font-medium text-gray-700">
            Patient Name:{" "}
          </span>
          <span className=" text-[10px]  md:text-[12px] text-gray-900">
            {appointment.patientName}
          </span>
        </div>

        <div>
          <span className=" text-[10px]  md:text-[12px] font-medium text-gray-700">
            Date:{" "}
          </span>
          <span className=" text-[10px]  md:text-[12px] text-gray-900">
            {appointment.date}
          </span>
        </div>

        <div>
          <span className=" text-[10px]  md:text-[12px] font-medium text-gray-700">
            Time:{" "}
          </span>
          <span className=" text-[10px]  md:text-[12px] text-gray-900">
            {appointment.time}
          </span>
        </div>

        <div>
          <span className=" text-[10px]  md:text-[12px] font-medium text-gray-700">
            Status:{" "}
          </span>
          <span className=" text-[10px]  md:text-[12px] text-gray-900">
            {appointment.status}
          </span>
        </div>

        {appointment.reason && (
          <div>
            <span className=" text-[10px]  md:text-[12px] font-medium text-gray-700">
              Reason:{" "}
            </span>
            <span className=" text-[10px]  md:text-[12px] text-gray-900">
              {appointment.reason}
            </span>
          </div>
        )}

        {appointment.consultationNote && (
          <div>
            <span className=" text-[10px]  md:text-[12px] font-medium text-gray-700">
              Consultation Note:{" "}
            </span>
            <span className=" text-[10px]  md:text-[12px] text-gray-900">
              {appointment.consultationNote}
            </span>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default AppointmentDetailModal;
