"use client";

import {
  Info,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Bell,
  ArrowLeft,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Breadcrumb from "@/components/Breadcrumb";
import Title from "@/components/Title";
import { useNotifications } from "@/contexts/NotificationContext";

export default function AdminNotificationsPage() {
  const router = useRouter();
  const {
    notifications,
    unreadCount,
    isLoading,
    openNotificationModal,
    markAsRead,
    markAllAsRead,
    clearAll,
    removeNotification,
  } = useNotifications();

  const iconFor = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case "error":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="text-[var(--foreground)]">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1 mb-4 text-[12px] md:text-[14px] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="mb-6">
        <Breadcrumb
          homeHref="/admin"
          items={[
            { label: "Admin", href: "/admin" },
            { label: "Notifications", href: "/admin/notifications" },
          ]}
        />
      </div>

      <Title title="Notifications" />

      {/* Actions bar */}
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <p className="text-[12px] md:text-[14px] text-[var(--muted-foreground)]">
          <span className="font-medium text-[var(--foreground)]">
            {unreadCount}
          </span>{" "}
          unread {" · "}
          <span className="font-medium text-[var(--foreground)]">
            {notifications.length}
          </span>{" "}
          total
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className="px-4 py-2 text-[12px] md:text-[14px] border border-[var(--border)] text-[var(--foreground)] rounded-lg hover:bg-[var(--muted)] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Mark all as read
          </button>
          <button
            onClick={clearAll}
            disabled={notifications.length === 0}
            className="px-4 py-2 text-[12px] md:text-[14px] bg-[#44CE2D] text-white rounded-lg hover:bg-[#3bb025] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Clear all
          </button>
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-20 rounded-lg border border-[var(--border)] bg-[var(--muted)] animate-pulse"
            />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 rounded-full bg-[var(--muted)] flex items-center justify-center mb-4">
            <Bell className="w-7 h-7 text-[var(--muted-foreground)]" />
          </div>
          <h3 className="text-[14px] md:text-[16px] font-medium text-[var(--foreground)]">
            No notifications
          </h3>
          <p className="text-[12px] md:text-[14px] text-[var(--muted-foreground)] mt-1">
            New patient bookings and appointment updates will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => openNotificationModal(n)}
              className={`flex items-start gap-3 p-4 rounded-lg border transition-colors cursor-pointer hover:shadow-sm ${
                n.isRead
                  ? "bg-[var(--card)] border-[var(--border)]"
                  : "bg-[var(--muted)] border-l-4 border-l-[#44CE2D] border-[var(--border)]"
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-[var(--card)] border border-[var(--border)] flex items-center justify-center flex-shrink-0">
                {iconFor(n.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <h4 className="text-[13px] md:text-[15px] font-medium text-[var(--foreground)]">
                    {n.title}
                  </h4>
                  <span className="text-[11px] md:text-[12px] text-[var(--muted-foreground)] whitespace-nowrap flex-shrink-0">
                    {n.timestamp}
                  </span>
                </div>
                <p className="text-[12px] md:text-[14px] text-[var(--muted-foreground)] mt-1 break-words">
                  {n.description}
                </p>
                <div className="flex items-center gap-4 mt-2">
                  {!n.isRead && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead(n.id);
                      }}
                      className="text-[11px] md:text-[12px] font-medium text-[#3bb025] hover:underline cursor-pointer"
                    >
                      Mark as read
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeNotification(n.id);
                    }}
                    className="text-[11px] md:text-[12px] text-[var(--muted-foreground)] hover:text-[var(--destructive)] transition-colors cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
