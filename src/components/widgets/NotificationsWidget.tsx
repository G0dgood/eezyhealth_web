"use client";

import React from "react";
import {
  Bell,
  Info,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Trash2,
} from "lucide-react";
import { useNotifications } from "@/contexts/NotificationContext";
import Link from "next/link";

const NotificationsWidget: React.FC = () => {
  const {
    notifications,
    unreadCount,
    openNotificationModal,
    markAsRead,
    markAllAsRead,
    removeNotification,
  } = useNotifications();



  // Calculate statistics
  const totalNotifications = notifications.length;
  const readNotifications = notifications.filter((n) => n.isRead).length;
  const unreadNotifications = unreadCount;

  // Get recent notifications (last 5)
  const recentNotifications = notifications.slice(0, 5);

  // Count by type
  const notificationsByType = {
    info: notifications.filter((n) => n.type === "info").length,
    warning: notifications.filter((n) => n.type === "warning").length,
    success: notifications.filter((n) => n.type === "success").length,
    error: notifications.filter((n) => n.type === "error").length,
  };

  const hasData = totalNotifications > 0;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "info":
        return <Info size={14} className="text-blue-600" />;
      case "warning":
        return <AlertTriangle size={14} className="text-yellow-600" />;
      case "success":
        return <CheckCircle size={14} className="text-green-600" />;
      case "error":
        return <XCircle size={14} className="text-red-600" />;
      default:
        return <Info size={14} className="text-gray-600" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "info":
        return "bg-blue-100 text-blue-800";
      case "warning":
        return "bg-yellow-100 text-yellow-800";
      case "success":
        return "bg-green-100 text-green-800";
      case "error":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const statsData = [
    {
      title: "Total",
      value: totalNotifications,
      icon: Bell,
      gradient: "from-blue-500 to-indigo-600",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      description: "All notifications"
    },
    {
      title: "Unread",
      value: unreadNotifications,
      icon: Eye,
      gradient: "from-red-500 to-pink-600",
      bgColor: "bg-red-50",
      iconColor: "text-red-600",
      description: "New notifications"
    },
    {
      title: "Read",
      value: readNotifications,
      icon: CheckCircle,
      gradient: "from-green-500 to-emerald-600",
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
      description: "Viewed notifications"
    },
    {
      title: "Alerts",
      value: notificationsByType.warning + notificationsByType.error,
      icon: AlertTriangle,
      gradient: "from-orange-500 to-amber-600",
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600",
      description: "Important alerts"
    },
  ];

  if (!hasData) {
    return (
      <div className="w-full flex flex-col items-center justify-center h-96 p-6">
        <div className="w-64 h-32 mb-6 bg-gray-100 rounded-lg flex items-center justify-center">
          <Bell className="text-gray-400" size={48} />
        </div>
        <h2 className="text-[18px] md:text-[20px] font-bold mb-2 text-gray-800">
          No Notifications!
        </h2>
        <p className="mb-4 text-center text-[14px] md:text-[16px] max-w-xl text-gray-500">
          You&apos;re all caught up! No new notifications at the moment.
          <br />
          New alerts and updates will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 md:mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <Bell className="text-white" size={16} />
          </div>
          <div>
            <h3 className="text-[14px] md:text-[16px] font-bold text-gray-900">Notifications</h3>
            <p className="text-[10px] md:text-[12px] text-gray-500">
              Recent alerts and system updates
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          {unreadNotifications > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-blue-600 text-[10px] md:text-[12px] font-medium hover:text-blue-700">
              Mark All Read
            </button>
          )}
          <Link
            href="/notifications"
            className="text-blue-600 text-[10px] md:text-[12px] font-medium hover:text-blue-700">
            View All
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
        {statsData.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <div
              key={index}
              className="group relative overflow-hidden bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
              {/* Gradient Background */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}></div>

              {/* Content */}
              <div className="relative p-3 md:p-4">
                <div className="flex items-center justify-between mb-2 md:mb-3">
                  <div
                    className={`w-6 h-6 md:w-8 md:h-8 ${item.bgColor} rounded-lg flex items-center justify-center`}>
                    <IconComponent className={`w-3 h-3 md:w-4 md:h-4 ${item.iconColor}`} />
                  </div>
                </div>

                <div className="mb-1 md:mb-2">
                  <h2 className="text-[14px] md:text-[16px] font-bold text-gray-900 mb-0.5 md:mb-1">
                    {item.value}
                  </h2>
                  <h3 className="text-[10px] md:text-[12px] font-semibold text-gray-700 mb-0.5 md:mb-1">
                    {item.title}
                  </h3>
                  <p className="text-[10px] md:text-xs text-gray-500">{item.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Notifications */}
      <div className="space-y-3 md:space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-[10px] md:text-[12px]  font-semibold text-gray-900">
            Recent Notifications
          </h4>
          <span className="text-[10px] md:text-[12px] text-gray-500">
            {recentNotifications.length} notifications
          </span>
        </div>

        {recentNotifications.length === 0 ? (
          <div className="text-center py-6 md:py-8 text-gray-500">
            <Bell className="mx-auto mb-2 text-gray-300" size={24} />
            <p className="text-[10px] md:text-[12px]">No recent notifications</p>
          </div>
        ) : (
          recentNotifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => openNotificationModal(notification)}
              className={`border border-gray-100 rounded-lg p-3 md:p-4 hover:bg-gray-50 transition-colors cursor-pointer ${!notification.isRead ? "bg-blue-50 border-blue-200" : ""
                }`}>
              <div className="flex items-start justify-between mb-2 md:mb-3">
                <div className="flex items-center gap-2 md:gap-3 overflow-hidden">
                  <div className="w-6 h-6 md:w-8 md:h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                    {getTypeIcon(notification.type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-medium text-[10px] md:text-[12px] md:text-base text-gray-900 truncate">
                      {notification.title}
                    </h4>
                    <p className="text-[10px] md:text-[12px] text-gray-600 truncate">
                      {notification.timestamp}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                  <span
                    className={`px-1.5 py-0.5 md:px-2 md:py-1 text-[10px] md:text-xs font-medium rounded-full ${getTypeColor(
                      notification.type
                    )}`}>
                    {notification.type}
                  </span>
                  {!notification.isRead && (
                    <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-blue-500 rounded-full"></span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] md:text-[12px] text-gray-600 line-clamp-2">
                  {notification.description}
                </p>
              </div>

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Clock size={14} />
                  <span>{notification.timestamp}</span>
                </div>
                <div className="flex items-center gap-2">
                  {!notification.isRead && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead(notification.id);
                      }}
                      className="text-blue-600 text-xs font-medium hover:text-blue-700">
                      Mark Read
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeNotification(notification.id);
                    }}
                    className="text-red-600 text-xs font-medium hover:text-red-700">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary Section */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-[10px] md:text-[12px]">
          <span className="text-gray-600 text-[10px] md:text-[12px]">
            Total Notifications: {totalNotifications}
          </span>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
              <span className="text-gray-600">
                Unread: {unreadNotifications}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span className="text-gray-600">Read: {readNotifications}</span>
            </div>
            {(notificationsByType.warning > 0 ||
              notificationsByType.error > 0) && (
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                  <span className="text-gray-600">
                    Alerts:{" "}
                    {notificationsByType.warning + notificationsByType.error}
                  </span>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsWidget;
