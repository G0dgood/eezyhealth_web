"use client";

import { useState } from "react";
import { useNotifications } from "@/contexts/NotificationContext";
import Dropdown from "@/components/Dropdown";
import { toast } from "sonner";
import {
  Bell,
  Plus,
  CheckCircle,
  AlertCircle,
  Info,
  AlertTriangle,
} from "lucide-react";

export default function NotificationsDemoPage() {
  const { addNotification, notifications, unreadCount } = useNotifications();
  const [selectedType, setSelectedType] = useState<
    "success" | "error" | "warning" | "info"
  >("info");

  const handleAddNotification = () => {
    const titles = {
      success: "Success Notification",
      error: "Error Notification",
      warning: "Warning Notification",
      info: "Info Notification",
    };

    const descriptions = {
      success: "This is a success notification example",
      error: "This is an error notification example",
      warning: "This is a warning notification example",
      info: "This is an info notification example",
    };

    addNotification({
      type: selectedType,
      title: titles[selectedType],
      description: descriptions[selectedType],
      category: "general",
    });
  };

  const handleAddToast = () => {
    const titles = {
      success: "Success Toast",
      error: "Error Toast",
      warning: "Warning Toast",
      info: "Info Toast",
    };

    const messages = {
      success: "Operation completed successfully",
      error: "Something went wrong",
      warning: "Please review your input",
      info: "Here's some information",
    };

    // Use Sonner toast instead of custom toast
    switch (selectedType) {
      case "success":
        toast.success(titles.success, {
          description: messages.success,
        });
        break;
      case "error":
        toast.error(titles.error, {
          description: messages.error,
        });
        break;
      case "warning":
        toast.warning(titles.warning, {
          description: messages.warning,
        });
        break;
      case "info":
        toast.info(titles.info, {
          description: messages.info,
        });
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Notification System Demo
          </h1>
          <p className="text-gray-600">
            Test the notification system with different types and actions
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Bell className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-[18px] md:text-[20px] font-bold text-gray-900">
                  {notifications.length}
                </p>
                <p className="text-sm text-gray-600">Total Notifications</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-[18px] md:text-[20px] font-bold text-gray-900">
                  {unreadCount}
                </p>
                <p className="text-sm text-gray-600">Unread</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-[18px] md:text-[20px] font-bold text-gray-900">
                  {notifications.filter((n) => n.isRead).length}
                </p>
                <p className="text-sm text-gray-600">Read</p>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-[16px] md:text-[18px] font-semibold text-gray-900 mb-4">
            Add Notifications
          </h2>

          <div className="flex items-center space-x-4 mb-4">
            <label className="text-sm font-medium text-gray-700">Type:</label>
            <Dropdown
              value={selectedType}
              onChange={(value) =>
                setSelectedType(
                  value as "success" | "error" | "warning" | "info"
                )
              }
              options={[
                { value: "success", label: "Success" },
                { value: "error", label: "Error" },
                { value: "warning", label: "Warning" },
                { value: "info", label: "Info" },
              ]}
              placeholder="Select Type"
              className="w-40"
              variant="default"
            />
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handleAddNotification}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 cursor-pointer">
              <Plus className="w-4 h-4" />
              <span>Add Notification</span>
            </button>

            <button
              onClick={handleAddToast}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 cursor-pointer">
              <Plus className="w-4 h-4" />
              <span>Add Toast (Sonner)</span>
            </button>
          </div>
        </div>

        {/* Current Notifications */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-[16px] md:text-[18px] font-semibold text-gray-900 mb-4">
            Current Notifications
          </h2>

          {notifications.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No notifications yet
            </p>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border ${notification.isRead
                    ? "bg-gray-50 border-gray-200"
                    : "bg-blue-50 border-blue-200"
                    }`}>
                  <div className="flex items-start space-x-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${notification.type === "success"
                        ? "bg-green-100"
                        : notification.type === "error"
                          ? "bg-red-100"
                          : notification.type === "warning"
                            ? "bg-yellow-100"
                            : "bg-blue-100"
                        }`}>
                      {notification.type === "success" && (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      )}
                      {notification.type === "error" && (
                        <AlertCircle className="w-4 h-4 text-red-600" />
                      )}
                      {notification.type === "warning" && (
                        <AlertTriangle className="w-4 h-4 text-yellow-600" />
                      )}
                      {notification.type === "info" && (
                        <Info className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        {notification.title}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.description}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">
                          {notification.timestamp}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${notification.isRead
                            ? "bg-gray-200 text-gray-700"
                            : "bg-blue-200 text-blue-700"
                            }`}>
                          {notification.isRead ? "Read" : "Unread"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
