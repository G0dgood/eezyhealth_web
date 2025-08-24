"use client";

import { useState } from "react";
import { X, Info } from "lucide-react";

interface Notification {
  id: string;
  type: "info" | "warning" | "success" | "error";
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
}

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onClearAll: () => void;
}

export default function NotificationPanel({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onClearAll,
}: NotificationPanelProps) {
  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-2xl py-1 z-[9999] border border-gray-200">
      {/* Header */}
      <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Notifications</h3>
          <button
            onClick={onClearAll}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium cursor-pointer">
            Clear All
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-64 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="px-4 py-6 text-center text-gray-500">
            <Info className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No notifications</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer ${
                  !notification.isRead ? "bg-blue-50" : ""
                }`}
                onClick={() => onMarkAsRead(notification.id)}>
                <div className="flex items-start space-x-3">
                  {/* Icon */}
                  <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                    <Info className="w-3 h-3 text-gray-600" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 mb-1">
                      {notification.title}
                    </h4>
                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                      {notification.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {notification.timestamp}
                      </span>
                      {!notification.isRead && (
                        <span className="text-xs text-blue-600 font-medium">
                          New
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>{unreadCount} unread</span>
            <span>{notifications.length} total</span>
          </div>
        </div>
      )}
    </div>
  );
}
