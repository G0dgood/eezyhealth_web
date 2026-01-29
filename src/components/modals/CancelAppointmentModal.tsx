import React, { useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import Modal from "./Modal";
import Textarea from "../Textarea";

interface CancelAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  appointmentDetails?: {
    patientName: string;
    date: string;
    time: string;
  };
}

const CancelAppointmentModal: React.FC<CancelAppointmentModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  appointmentDetails,
}) => {
  const [reason, setReason] = useState("");

  const handleConfirm = () => {
    onConfirm(reason);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Cancel Appointment" size="md">
      <div className="space-y-6">
        {/* Warning Icon */}
        <div className="flex justify-center">
          <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </div>

        {/* Warning Message */}
        <div className="text-center">
          <h3 className="text-[14px] md:text-[16px] font-medium text-gray-900 mb-2">
            Are you sure you want to cancel this appointment?
          </h3>
          <p className="text-gray-600">
            This action cannot be undone. The appointment will be permanently cancelled.
          </p>
        </div>

        {/* Appointment Details */}
        {appointmentDetails && (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className=" text-[10px]  md:text-[12px]">
              <p className="font-medium text-gray-900">
                Patient: {appointmentDetails.patientName}
              </p>
              <p className="text-gray-600">
                Date: {appointmentDetails.date} at {appointmentDetails.time}
              </p>
            </div>
          </div>
        )}

        {/* Cancellation Reason */}
        <div>
          <label className="block  text-[10px]  md:text-[12px] font-medium text-gray-700 mb-2">
            Reason for Cancellation (Optional)
          </label>
          <Textarea
            rows={3}
            placeholder="Enter reason for cancellation..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            fullWidth
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
          >
            <X className="h-4 w-4 mr-2" />
            Keep Appointment
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Cancel Appointment
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default CancelAppointmentModal;
