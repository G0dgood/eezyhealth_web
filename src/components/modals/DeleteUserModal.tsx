import React from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";
import Modal from "./Modal";

interface UserData {
  uid: string;
  email: string;
  display_name?: string;
  role: string;
  first_name?: string;
  last_name?: string;
  deactivatedAt?: string;
  deactivationReason?: string;
}

interface DeleteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserData | null;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
}

const DeleteUserModal: React.FC<DeleteUserModalProps> = ({
  isOpen,
  onClose,
  user,
  onConfirm,
  isDeleting,
}) => {
  if (!user) return null;

  const handleConfirm = async () => {
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete User" size="md">
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
            Are you sure you want to delete this user?
          </h3>
          <p className="text-gray-600">
            This action cannot be undone. The user will be permanently removed
            from the system.
          </p>
        </div>

        {/* User Details */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
              <span className=" text-[10px]  md:text-[12px] font-medium text-gray-700">
                {user.display_name?.[0] ||
                  user.first_name?.[0] ||
                  user.email[0].toUpperCase()}
              </span>
            </div>
            <div>
              <p className="font-medium text-gray-900">
                {user.display_name ||
                  `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
                  "N/A"}
              </p>
              <p className=" text-[10px]  md:text-[12px] text-gray-600">{user.email}</p>
              <p className=" text-[10px]  md:text-[12px] text-gray-500">Role: {user.role}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center">
            <X className="h-4 w-4 mr-2" />
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isDeleting}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center">
            <Trash2 className="h-4 w-4 mr-2" />
            {isDeleting ? "Deleting..." : "Delete User"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteUserModal;
