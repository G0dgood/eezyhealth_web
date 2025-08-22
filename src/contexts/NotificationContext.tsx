"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

interface Notification {
  id: string;
  type: "info" | "warning" | "success" | "error";
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (
    notification: Omit<Notification, "id" | "timestamp" | "isRead">
  ) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "info",
      title: "New Doctor Registration",
      description: "Dr. Sarah James submitted registration documents",
      timestamp: "2 mins ago",
      isRead: false,
    },
    {
      id: "2",
      type: "warning",
      title: "Appointment Canceled",
      description: "Dr. Tunde Sanni wants to cancel an appointment",
      timestamp: "2 mins ago",
      isRead: false,
    },
    {
      id: "3",
      type: "info",
      title: "New Doctor Registration",
      description: "Dr. Zainab Ali submitted registration documents",
      timestamp: "2 days ago",
      isRead: true,
    },
    {
      id: "4",
      type: "error",
      title: "Appointment Conflict",
      description:
        "Dr. Mary Temi has overlapping appointments on 11-5-2024 at 10:00 AM. Booking ID #7890 and #7891.",
      timestamp: "6 days ago",
      isRead: true,
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const addNotification = useCallback(
    (notification: Omit<Notification, "id" | "timestamp" | "isRead">) => {
      const newNotification: Notification = {
        ...notification,
        id: Date.now().toString(),
        timestamp: "Just now",
        isRead: false,
      };

      setNotifications((prev) => [newNotification, ...prev]);
    },
    []
  );

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id
          ? { ...notification, isRead: true }
          : notification
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, isRead: true }))
    );
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
  }, []);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
    removeNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
}
