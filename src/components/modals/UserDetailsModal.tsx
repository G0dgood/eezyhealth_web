import React from "react";
import { User, Mail, Phone, MapPin, Calendar, Shield } from "lucide-react";
import Modal from "./Modal";

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

interface UserDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserData | null;
}

const UserDetailsModal: React.FC<UserDetailsModalProps> = ({
  isOpen,
  onClose,
  user,
}) => {
  if (!user) return null;

  const getRoleBadge = (role: string) => {
    const roleColors = {
      admin: "bg-red-100 text-red-800",
      doctor: "bg-blue-100 text-blue-800",
      nurse: "bg-green-100 text-green-800",
      patient: "bg-gray-100 text-gray-800",
    };
    return `px-2 py-1 text-xs rounded-full font-medium ${roleColors[role as keyof typeof roleColors] || roleColors.patient}`;
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive
      ? "bg-green-100 text-green-800 px-2 py-1 text-xs rounded-full font-medium"
      : "bg-red-100 text-red-800 px-2 py-1 text-xs rounded-full font-medium";
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "Invalid Date";
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="User Details" size="lg">
      <div className="space-y-6">
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
            <h2 className="text-xl font-semibold text-gray-900">
              {user.display_name ||
                `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
                "N/A"}
            </h2>
            <p className="text-gray-600">ID: {user.uid}</p>
          </div>
        </div>

        {/* User Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Basic Information
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <span className={getRoleBadge(user.role)}>
                {user.role}
              </span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <span className={getStatusBadge(user.isActive || false)}>
                {user.isActive ? "Active" : "Inactive"}
              </span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth
              </label>
              <p className="text-gray-900 flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                {user.date_of_birth ? formatDate(user.date_of_birth) : "N/A"}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Joined
              </label>
              <p className="text-gray-900">
                {formatDate(user.createdTime)}
              </p>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Mail className="h-5 w-5 mr-2" />
              Contact Information
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <p className="text-gray-900 flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                {user.email}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <p className="text-gray-900 flex items-center">
                <Phone className="h-4 w-4 mr-2" />
                {user.phone_number || "N/A"}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <p className="text-gray-900 flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                {user.address || "N/A"}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <p className="text-gray-900 flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                {user.location || "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Deactivation Information - Only show if user is inactive */}
        {user.isActive === false && (user.deactivatedAt || user.deactivationReason) && (
          <div className="space-y-4 pt-6 border-t border-red-200 bg-red-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-red-800 flex items-center">
              <Shield className="h-5 w-5 mr-2 text-red-600" />
              Account Deactivation Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {user.deactivatedAt && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deactivated At
                  </label>
                  <p className="text-gray-900 flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    {formatDate(user.deactivatedAt)}
                  </p>
                </div>
              )}

              {user.deactivationReason && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deactivation Reason
                  </label>
                  <div className="bg-white p-3 rounded-md border border-red-200">
                    <p className="text-gray-900 text-sm leading-relaxed">
                      {user.deactivationReason}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default UserDetailsModal;
