import React from "react";
import { X } from "lucide-react";

interface VitalsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const VitalsModal: React.FC<VitalsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#00000051] bg-opacity-50 z-40">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full z-50 relative">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Vitals</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Heart Rate:</span>
                <span className="font-semibold text-gray-900">71 bpm</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Blood Pressure:</span>
                <span className="font-semibold text-gray-900">120/90 mmHg</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Weight:</span>
                <span className="font-semibold text-gray-900">68 kg</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Temperature:</span>
                <span className="font-semibold text-gray-900">30 °C</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VitalsModal;
