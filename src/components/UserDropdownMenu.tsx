"use client";

import { LogOut } from "lucide-react";

interface UserDropdownMenuProps {
  isOpen: boolean;
  userRole?: string;
  authUserInfo?: any;
  user?: any;
  onSignOutClick: () => void;
}

export default function UserDropdownMenu({
  isOpen,
  userRole,
  authUserInfo,
  user,
  onSignOutClick,
}: UserDropdownMenuProps) {
  if (!isOpen) return null;

  return (
    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-2xl z-[9999] border border-gray-200 backdrop-blur-md transition-all duration-300">
      <div className="px-5 py-3 text-xs md:text-sm text-gray-700 border-b border-gray-100 bg-white rounded-t-lg">
        <p className="font-semibold text-gray-900 truncate">
          {authUserInfo?.displayName || user?.displayName || userRole}
        </p>
        <p className="text-gray-500 truncate mt-0.5">
          {authUserInfo?.email || user?.email}
        </p>
      </div>
      <button
        onClick={onSignOutClick}
        className="w-full text-left px-5 py-3 text-xs md:text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2.5 bg-white cursor-pointer rounded-b-lg font-medium transition-colors duration-150"
      >
        <LogOut className="w-4 h-4 text-red-500" />
        <span>Sign Out</span>
      </button>
    </div>
  );
}
