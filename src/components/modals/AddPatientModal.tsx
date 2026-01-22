import React from "react";
import Modal from "@/components/modals/Modal";
import FormInput from "@/components/FormInput";
import FormSelect from "@/components/FormSelect";
import Button from "@/components/Button";

export interface PatientFormData {
  first_name: string;
  last_name: string;
  gender: string;
  dateOfBirth: string;
  phone_number: string;
  email: string;
  password: string;
  confirmPassword: string;
  address: string;
}

interface AddPatientModalProps {
  isOpen: boolean;
  isCreating: boolean;
  formData: PatientFormData;
  onChange: (field: keyof PatientFormData, value: string) => void;
  onClose: () => void;
  onSave: () => void;
}

export default function AddPatientModal({
  isOpen,
  isCreating,
  formData,
  onChange,
  onClose,
  onSave,
}: AddPatientModalProps) {
  const genderOptions = [
    { value: "Male", label: "Male" },
    { value: "Female", label: "Female" },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Patient"
      size="md"
    >
      <div className="flex flex-col max-h-[70vh]">
        <div className="space-y-4 overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="First Name"
              placeholder="Enter first name"
              value={formData.first_name}
              onChange={(value) => onChange("first_name", value)}
              required
            />
            <FormInput
              label="Last Name"
              placeholder="Enter last name"
              value={formData.last_name}
              onChange={(value) => onChange("last_name", value)}
              required
            />
          </div>

          <FormSelect
            label="Gender"
            options={genderOptions}
            placeholder="Select Gender"
            value={formData.gender}
            onChange={(value) => onChange("gender", value)}
            required
          />

          <FormInput
            label="Date of Birth"
            type="date"
            placeholder="dd/mm/yy"
            value={formData.dateOfBirth}
            onChange={(value) => onChange("dateOfBirth", value)}
            required
          />

          <FormInput
            label="Phone Number"
            type="tel"
            placeholder="Enter phone number"
            value={formData.phone_number}
            onChange={(value) => onChange("phone_number", value)}
            required
          />

          <FormInput
            label="Email Address"
            type="email"
            placeholder="Enter email address"
            value={formData.email}
            onChange={(value) => onChange("email", value)}
            required
          />

          <FormInput
            label="Password"
            type="password"
            placeholder="Enter password"
            value={formData.password}
            onChange={(value) => onChange("password", value)}
            required
          />

          <FormInput
            label="Confirm Password"
            type="password"
            placeholder="Confirm password"
            value={formData.confirmPassword}
            onChange={(value) => onChange("confirmPassword", value)}
            required
          />

          <FormInput
            label="Address"
            placeholder="Enter address"
            value={formData.address}
            onChange={(value) => onChange("address", value)}
            required
          />
        </div>

        <div className="flex justify-end space-x-3 pt-6 mt-auto bg-white border-t border-gray-100">
          <Button
            variant="outline-neutral"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={onSave}
            isLoading={isCreating}
            className="w-full sm:w-auto"
          >
            Save Patient
          </Button>
        </div>
      </div>
    </Modal>
  );
}
