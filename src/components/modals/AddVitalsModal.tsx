"use client";

import { useState, useEffect } from "react";
import Modal from "./Modal";
import FormInput from "@/components/FormInput";
import { useSavePatientVitalsMutation } from "@/store/patientApi";
import { toast } from "sonner";
import Button from "@/components/Button";
import { useAuth } from "@/contexts/AuthContext";

interface AddVitalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  patientName?: string;
  bookingId?: string;
}

export default function AddVitalsModal({
  isOpen,
  onClose,
  patientId,
  patientName,
  bookingId,
}: AddVitalsModalProps) {
  const [saveVitals, { isLoading }] = useSavePatientVitalsMutation();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    heartRate: "",
    bloodPressure: "",
    weight: "",
    temperature: "",
    breathingRate: "", 
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        heartRate: "",
        bloodPressure: "",
        weight: "",
        temperature: "",
        breathingRate: "", 
      });
    }
  }, [isOpen]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      if (!patientId) {
        toast.error("Patient ID is missing");
        return;
      }

      if (!formData.heartRate && !formData.bloodPressure && !formData.weight && !formData.temperature && !formData.breathingRate) {
        toast.error("Please enter at least one vital sign");
        return;
      }

      await saveVitals({
        userId: patientId,
        doctorId: user?.uid || "",
        bookingId: bookingId || "",
        patientName: patientName || "",
        vitals: formData,
      }).unwrap();

      toast.success("Vitals recorded successfully");
      onClose();
    } catch (error) {
      console.error("Failed to add vitals:", error);
      toast.error("Failed to record vitals");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Record Vitals${patientName ? ` - ${patientName}` : ""}`}
      size="md"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormInput 
            label="Heart Rate" 
            placeholder="bpm" 
            value={formData.heartRate}
            onChange={(val) => handleChange("heartRate", val)}
          />
          <FormInput 
            label="Blood Pressure" 
            placeholder="mmHg" 
            value={formData.bloodPressure}
            onChange={(val) => handleChange("bloodPressure", val)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormInput 
            label="Weight" 
            placeholder="kg" 
            value={formData.weight}
            onChange={(val) => handleChange("weight", val)}
          />
          <FormInput 
            label="Temperature" 
            placeholder="°C" 
            value={formData.temperature}
            onChange={(val) => handleChange("temperature", val)}
          />
        </div>

        <FormInput 
          label="Breathing Rate" 
          placeholder="breaths/min" 
          value={formData.breathingRate}
          onChange={(val) => handleChange("breathingRate", val)}
        />
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
            <textarea
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#44CE2D] min-h-[80px]"
              placeholder="Add a comment"
              value={formData.comment}
              onChange={(e) => handleChange("comment", e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Recommendation</label>
            <textarea
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#44CE2D] min-h-[80px]"
              placeholder="Add a recommendation"
              value={formData.recommendation}
              onChange={(e) => handleChange("recommendation", e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            isLoading={isLoading}
          >
            Save Vitals
          </Button>
        </div>
      </div>
    </Modal>
  );
}
