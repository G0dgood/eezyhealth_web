import React, { useMemo } from "react";
import Modal from "@/components/modals/Modal";
import FormInput from "@/components/FormInput";
import Dropdown from "@/components/Dropdown";
import { useGetSpecializationsQuery } from "@/store/specializationApi";

export interface NurseFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  specialization: string;
  hospital: string;
  experience_yrs: string;
  address: string;
  password: string;
}

interface AddNurseModalProps {
  isOpen: boolean;
  isCreating: boolean;
  formData: NurseFormData;
  onChange: (field: keyof NurseFormData, value: string) => void;
  onClose: () => void;
  onSave: () => void;
}

export default function AddNurseModal({
  isOpen,
  isCreating,
  formData,
  onChange,
  onClose,
  onSave,
}: AddNurseModalProps) {
  const { data: specializationsData } = useGetSpecializationsQuery({});

  const specializationOptions = useMemo(() => {
    const defaultList = [
      "General Nursing",
      "Pediatric Nursing",
      "Critical Care / ICU",
      "Emergency Nursing",
      "Surgical / Operating Room",
      "Psychiatric / Mental Health",
      "Obstetrics & Gynecology Nursing",
      "Cardiac Care",
      "Oncology Nursing",
      "Geriatric Nursing",
      "Community / Public Health Nursing",
      "General Practitioner",
      "Cardiology",
      "Pediatrics",
      "Dermatology",
      "Neurology",
      "Orthopedics",
    ];

    const fetchedList = Array.isArray(specializationsData)
      ? specializationsData
          .map((s: any) => s.name || s.title || s.specialization)
          .filter(Boolean)
      : [];

    const merged = Array.from(new Set([...fetchedList, ...defaultList]));

    return merged.map((name) => ({
      value: name,
      label: name,
    }));
  }, [specializationsData]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Nurse" size="md">
      <div className="flex flex-col max-h-[70vh]">
        <div className="space-y-4 overflow-y-auto pr-1">
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
            label="Phone Number"
            type="tel"
            placeholder="Enter phone number"
            value={formData.phone_number}
            onChange={(value) => onChange("phone_number", value)}
            required
          />
          <div>
            <label className="block text-[10px] md:text-[12px] font-medium text-gray-700 mb-1">
              Specialization <span className="text-red-500">*</span>
            </label>
            <Dropdown
              value={formData.specialization}
              onChange={(value) => onChange("specialization", value)}
              options={specializationOptions}
              placeholder="Select Specialization"
              className="w-full"
              variant="default"
            />
          </div>
          <FormInput
            label="Hospital"
            placeholder="Enter hospital"
            value={formData.hospital}
            onChange={(value) => onChange("hospital", value)}
            required
          />
          <FormInput
            label="Years of Experience"
            placeholder="Enter years of experience (e.g. 5)"
            value={formData.experience_yrs}
            onChange={(value) => onChange("experience_yrs", value)}
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
        <div className="flex justify-end space-x-3 pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isCreating}
          >
            {isCreating ? "Creating..." : "Save"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
