import React, { useState } from "react";
import Modal from "@/components/modals/Modal";
import FormInput from "@/components/FormInput";
import FormSelect from "@/components/FormSelect";
import { toast } from "sonner";

interface AddPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface PatientFormData {
  name: string;
  gender: string;
  dateOfBirth: string;
  phone: string;
  email: string;
}

export default function AddPatientModal({
  isOpen,
  onClose,
  onSuccess,
}: AddPatientModalProps) {
  const [formData, setFormData] = useState<PatientFormData>({
    name: "",
    gender: "",
    dateOfBirth: "",
    phone: "",
    email: "",
  });

  const genderOptions = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
  ];

  const handleInputChange = (field: keyof PatientFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSavePatient = async () => {
    // Validate required fields
    if (
      !formData.name ||
      !formData.gender ||
      !formData.dateOfBirth ||
      !formData.phone ||
      !formData.email
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      // Show loading toast
      const loadingToast = toast.loading("Saving patient...");

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Dismiss loading and show success
      toast.dismiss(loadingToast);
      toast.success("Patient saved successfully");

      // Reset form
      setFormData({
        name: "",
        gender: "",
        dateOfBirth: "",
        phone: "",
        email: "",
      });

      // Close modal and notify parent
      onClose();
      onSuccess();
    } catch (error) {
      toast.error("Failed to save patient. Please try again.");
    }
  };

  const handleClose = () => {
    // Reset form when closing
    setFormData({
      name: "",
      gender: "",
      dateOfBirth: "",
      phone: "",
      email: "",
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add New Patient"
      size="md">
      <div className="space-y-4">
        <FormInput
          label="Name"
          placeholder="Enter patient fullname"
          value={formData.name}
          onChange={(value) => handleInputChange("name", value)}
          required
        />

        <FormSelect
          label="Gender"
          options={genderOptions}
          placeholder="Select Gender"
          value={formData.gender}
          onChange={(value) => handleInputChange("gender", value)}
          required
        />

        <FormInput
          label="Date of Birth"
          type="date"
          placeholder="dd/mm/yy"
          value={formData.dateOfBirth}
          onChange={(value) => handleInputChange("dateOfBirth", value)}
          required
        />

        <FormInput
          label="Phone Number"
          type="tel"
          placeholder="Enter patient number"
          value={formData.phone}
          onChange={(value) => handleInputChange("phone", value)}
          required
        />

        <FormInput
          label="Email Address"
          type="email"
          placeholder="Enter patient email"
          value={formData.email}
          onChange={(value) => handleInputChange("email", value)}
          required
        />

        <div className="flex justify-end space-x-3 pt-4">
          <button
            onClick={handleClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
            Cancel
          </button>
          <button
            onClick={handleSavePatient}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer">
            Save
          </button>
        </div>
      </div>
    </Modal>
  );
}
