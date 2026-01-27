import React, { useState, useEffect } from "react";
import { User, Mail, Phone, MapPin, Calendar, Shield, Save, X } from "lucide-react";
import Modal from "./Modal";
import { toast } from "sonner";
import Input from "@/components/Input";
import Textarea from "@/components/Textarea";
import Dropdown from "@/components/Dropdown";

interface UserData {
  uid: string;
  email: string;
  display_name?: string;
  role: "admin" | "doctor" | "nurse" | "patient";
  phone_number?: string;
  address?: string;
  location?: string;
  date_of_birth?: string;
  isActive?: boolean;
  createdTime?: string;
  first_name?: string;
  last_name?: string;
  photo_url?: string;
  deactivatedAt?: string;
  deactivationReason?: string;
}

interface UserEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserData | null;
  onSave: (updatedUser: Partial<UserData>) => Promise<void>;
  isUpdating: boolean;
}

const UserEditModal: React.FC<UserEditModalProps> = ({
  isOpen,
  onClose,
  user,
  onSave,
  isUpdating,
}) => {
  const [formData, setFormData] = useState<Partial<UserData>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      setFormData({
        display_name: user.display_name || "",
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        role: user.role,
        phone_number: user.phone_number || "",
        address: user.address || "",
        location: user.location || "",
        date_of_birth: user.date_of_birth || "",
        isActive: user.isActive,
        email: user.email,
        deactivatedAt: user.deactivatedAt || "",
        deactivationReason: user.deactivationReason || "",
      });
      setErrors({});
    }
  }, [user]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email?.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.display_name?.trim() && !formData.first_name?.trim() && !formData.last_name?.trim()) {
      newErrors.display_name = "At least one name field is required";
    }

    if (formData.phone_number && !/^\+?[\d\s\-\(\)]+$/.test(formData.phone_number)) {
      newErrors.phone_number = "Phone number is invalid";
    }

    // Validate deactivation reason when user is being deactivated
    if (formData.isActive === false && !formData.deactivationReason?.trim()) {
      newErrors.deactivationReason = "Deactivation reason is required when deactivating a user";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await onSave(formData);
      toast.success("User updated successfully!");
      onClose();
    } catch (error) {
      toast.error("Failed to update user. Please try again.");
      console.error("Error updating user:", error);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };

      // If user is being reactivated (isActive changes to true), clear deactivation fields
      if (field === "isActive" && value === true) {
        newData.deactivatedAt = "";
        newData.deactivationReason = "";
      }

      // If user is being deactivated (isActive changes to false), set deactivatedAt to current timestamp
      if (field === "isActive" && value === false && !prev.deactivatedAt) {
        newData.deactivatedAt = new Date().toISOString();
      }

      return newData;
    });

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  if (!user) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit User" size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* User Header */}
        <div className="flex items-center space-x-4">
          <div className="h-16 w-16 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
            {user.photo_url ? (
              <img
                src={user.photo_url}
                alt={user.display_name || "User"}
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <User className="h-8 w-8 text-gray-600 dark:text-gray-400" />
            )}
          </div>
          <div>
            <h2 className="text-[16px] md:text-[18px] font-semibold text-gray-900">
              {user.display_name ||
                `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
                "N/A"}
            </h2>
            <p className="text-gray-600">ID: {user.uid}</p>
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-[14px] md:text-[16px] font-medium text-gray-900 flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Basic Information
            </h3>

            <div>
              <Input
                label="Display Name"
                type="text"
                value={formData.display_name || ""}
                onChange={(e) => handleInputChange("display_name", e.target.value)}
                variant={errors.display_name ? "error" : "default"}
                helperText={errors.display_name}
                placeholder="Display Name"
                fullWidth
              />
            </div>

            <div>
              <Input
                label="First Name"
                type="text"
                value={formData.first_name || ""}
                onChange={(e) => handleInputChange("first_name", e.target.value)}
                placeholder="First Name"
                fullWidth
              />
            </div>

            <div>
              <Input
                label="Last Name"
                type="text"
                value={formData.last_name || ""}
                onChange={(e) => handleInputChange("last_name", e.target.value)}
                placeholder="Last Name"
                fullWidth
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <Dropdown
                value={formData.role || "patient"}
                onChange={(value) => handleInputChange("role", value)}
                options={[
                  { value: "patient", label: "Patient" },
                  { value: "nurse", label: "Nurse" },
                  { value: "doctor", label: "Doctor" },
                  { value: "admin", label: "Admin" },
                ]}
                placeholder="Select Role"
                className="w-full"
                variant="default"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Status
              </label>
              <Dropdown
                value={formData.isActive ? "true" : "false"}
                onChange={(value) => handleInputChange("isActive", value === "true")}
                options={[
                  { value: "true", label: "Active" },
                  { value: "false", label: "Deactivated" },
                ]}
                placeholder="Select Status"
                className={`w-full ${formData.isActive === false ? "border-red-300 bg-red-50" : ""}`}
                variant="default"
              />
              {formData.isActive === false && (
                <p className="text-red-600 text-xs mt-1 flex items-center">
                  <Shield className="h-3 w-3 mr-1" />
                  Deactivating will require a reason below
                </p>
              )}
            </div>

            <div>
              <Input
                label="Date of Birth"
                type="date"
                value={formData.date_of_birth || ""}
                onChange={(e) => handleInputChange("date_of_birth", e.target.value)}
                fullWidth
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-[14px] md:text-[16px] font-medium text-gray-900 flex items-center">
              <Mail className="h-5 w-5 mr-2" />
              Contact Information
            </h3>

            <div>
              <Input
                label="Email *"
                type="email"
                value={formData.email || ""}
                onChange={(e) => handleInputChange("email", e.target.value)}
                variant={errors.email ? "error" : "default"}
                helperText={errors.email}
                placeholder="Email"
                required
                fullWidth
              />
            </div>

            <div>
              <Input
                label="Phone Number"
                type="tel"
                value={formData.phone_number || ""}
                onChange={(e) => handleInputChange("phone_number", e.target.value)}
                variant={errors.phone_number ? "error" : "default"}
                helperText={errors.phone_number}
                placeholder="Phone Number"
                fullWidth
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <Textarea
                value={formData.address || ""}
                onChange={(e) => handleInputChange("address", e.target.value)}
                placeholder="Address"
                rows={3}
                fullWidth
              />
            </div>

            <div>
              <Input
                label="Location"
                type="text"
                value={formData.location || ""}
                onChange={(e) => handleInputChange("location", e.target.value)}
                placeholder="City, Country"
                fullWidth
              />
            </div>
          </div>
        </div>

        {/* Deactivation Information - Only show if user is inactive */}
        {formData.isActive === false && (
          <div className="space-y-4 pt-6 border-t border-red-200 bg-red-50 p-4 rounded-lg">
            <h3 className="text-[14px] md:text-[16px] font-medium text-red-800 flex items-center">
              <Shield className="h-5 w-5 mr-2 text-red-600" />
              Account Deactivation
            </h3>
            <p className="text-sm text-red-700 bg-red-100 p-3 rounded-md">
              <strong>Important:</strong> You are deactivating this user account. Please provide a clear reason for this action as it will be recorded in the system audit trail.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Input
                  label="Deactivated At"
                  type="datetime-local"
                  value={formData.deactivatedAt ? new Date(formData.deactivatedAt).toISOString().slice(0, 16) : ""}
                  onChange={(e) => handleInputChange("deactivatedAt", e.target.value ? new Date(e.target.value).toISOString() : "")}
                  placeholder="Deactivation Date"
                  fullWidth
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deactivation Reason *
                </label>
                <Textarea
                  value={formData.deactivationReason || ""}
                  onChange={(e) => handleInputChange("deactivationReason", e.target.value)}
                  placeholder="Please provide a reason for deactivating this user account..."
                  rows={3}
                  fullWidth
                  required
                />

                {errors.deactivationReason && (
                  <p className="text-red-500 text-sm mt-1">{errors.deactivationReason}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center">
            <X className="h-4 w-4 mr-2" />
            Cancel
          </button>
          <button
            type="submit"
            disabled={isUpdating}
            className="px-4 py-2 bg-[#44CE2D] text-white rounded-lg hover:bg-[#3bb025] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center">
            <Save className="h-4 w-4 mr-2" />
            {isUpdating ? "Updating..." : "Save Changes"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default UserEditModal;
