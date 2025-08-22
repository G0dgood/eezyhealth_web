"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { useNotifications } from "@/contexts/NotificationContext";
import NotificationPanel from "./NotificationPanel";

interface NotificationBellProps {
  className?: string;
}

export default function NotificationBell({
  className = "",
}: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, clearAll } =
    useNotifications();

  const handleMarkAsRead = (id: string) => {
    markAsRead(id);
  };

  const handleClearAll = () => {
    clearAll();
    setIsOpen(false);
  };

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setIsOpen(true)}
          className={`relative p-2 text-gray-600 hover:text-gray-800 transition-colors cursor-pointer ${className}`}>
          <Bell className="w-6 h-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>
      </div>

      <NotificationPanel
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        notifications={notifications}
        onMarkAsRead={handleMarkAsRead}
        onClearAll={handleClearAll}
      />
    </>
  );
}
