"use client";

import { Info } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useNotifications } from "@/contexts/NotificationContext";

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
  const router = useRouter();
  const pathname = usePathname();
  const { openNotificationModal } = useNotifications();

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Route to the notifications page for the current role section (e.g. /doctor)
  const roleBase = pathname?.split("/")[1] || "doctor";
  const viewAll = () => {
    onClose();
    router.push(`/${roleBase}/notifications`);
  };

  const handleNotificationClick = (notification: any) => {
    onClose();
    openNotificationModal(notification);
  };

  return (
    <div className="absolute right-0 mt-2 w-80 bg-[var(--card)] text-[var(--foreground)] rounded-md shadow-2xl py-1 z-[9999] border border-[var(--border)]">
      {/* Header */}
      <div className="px-4 py-2  text-[10px]  md:text-[12px] text-[var(--foreground)] border-b border-[var(--border)]">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Notifications</h3>
          <button
            onClick={onClearAll}
            className="text-xs text-[#3bb025] hover:opacity-80 font-medium cursor-pointer">
            Clear All
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-64 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="px-4 py-6 text-center text-[var(--muted-foreground)]">
            <Info className="w-8 h-8 mx-auto mb-2 text-[var(--muted-foreground)] opacity-60" />
            <p className=" text-[10px]  md:text-[12px]">No notifications</p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`px-4 py-3 border-l-2 hover:bg-[var(--muted)] transition-colors cursor-pointer ${!notification.isRead
                  ? "bg-[var(--muted)] border-l-[#44CE2D]"
                  : "border-l-transparent"
                  }`}
                onClick={() => handleNotificationClick(notification)}>
                <div className="flex items-start space-x-3">
                  {/* Icon */}
                  <div className="w-6 h-6 bg-[var(--muted)] rounded-full flex items-center justify-center flex-shrink-0">
                    <Info className="w-3 h-3 text-[var(--muted-foreground)]" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h4 className=" text-[10px]  md:text-[12px] font-medium text-[var(--foreground)] mb-1">
                      {notification.title}
                    </h4>
                    <p className="text-xs text-[var(--muted-foreground)] mb-2 line-clamp-2">
                      {notification.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[var(--muted-foreground)]">
                        {notification.timestamp}
                      </span>
                      {!notification.isRead && (
                        <span className="text-xs text-[#3bb025] font-medium">
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
      <div className="border-t border-[var(--border)]">
        {notifications.length > 0 && (
          <div className="px-4 py-2 bg-[var(--muted)] flex items-center justify-between text-xs text-[var(--muted-foreground)]">
            <span>{unreadCount} unread</span>
            <span>{notifications.length} total</span>
          </div>
        )}
        <button
          onClick={viewAll}
          className="w-full px-4 py-2 text-xs font-medium text-[#3bb025] hover:bg-[var(--muted)] transition-colors cursor-pointer text-center">
          View all notifications
        </button>
      </div>
    </div>
  );
}
