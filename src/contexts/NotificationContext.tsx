"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { useAuth } from "./AuthContext";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  limit,
  Timestamp,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { db, realtimeDb } from "@/lib/firebase";
import { ref as rtdbRef, onChildAdded } from "firebase/database";
import { toastNotification } from "@/utils/toastWithSound";
import { useFCMToken } from "@/hooks/useFcmToken";
import NotificationDetailModal from "@/components/modals/NotificationDetailModal";

interface Notification {
  id: string;
  type: "info" | "warning" | "success" | "error";
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
  category:
  | "newPatientBooking"
  | "appointmentReminder"
  | "patientMessage"
  | "cancellation"
  | "general";
  data?: Record<string, unknown>; // Additional data for the notification
}

interface NotificationPreferences {
  newPatientBookings: boolean;
  appointmentReminders: boolean;
  patientMessages: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  notificationPrefs: NotificationPreferences;
  selectedNotification: Notification | null;
  openNotificationModal: (notification: Notification) => void;
  closeNotificationModal: () => void;
  updateNotificationPrefs: (prefs: Partial<NotificationPreferences>) => void;
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
  const { user } = useAuth();

  // Initialize FCM Token management
  useFCMToken();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const toastedNotificationIds = useRef<Set<string>>(new Set());
  const isInitialLoadRef = useRef<boolean>(true);
  const [notificationPrefs, setNotificationPrefs] =
    useState<NotificationPreferences>({
      newPatientBookings: true,
      appointmentReminders: true,
      patientMessages: true,
    });

  // Memoize notificationPrefs to prevent infinite re-renders
  const memoizedNotificationPrefs = useMemo(() => notificationPrefs, [
    notificationPrefs.newPatientBookings,
    notificationPrefs.appointmentReminders,
    notificationPrefs.patientMessages,
  ]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Load notification preferences from Firebase on mount
  useEffect(() => {
    const loadNotificationPrefs = async () => {
      if (!user?.uid) {
        setIsLoading(false);
        return;
      }

      try {
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          const firebasePrefs = userData.notification_preferences;

          if (firebasePrefs) {
            setNotificationPrefs({
              newPatientBookings:
                firebasePrefs.newPatientBookings !== undefined
                  ? firebasePrefs.newPatientBookings
                  : true,
              appointmentReminders:
                firebasePrefs.appointmentReminders !== undefined
                  ? firebasePrefs.appointmentReminders
                  : true,
              patientMessages:
                firebasePrefs.patientMessages !== undefined
                  ? firebasePrefs.patientMessages
                  : true,
            });
          }
        }
      } catch (error) {
        console.error("Error loading notification preferences:", error);
      }
    };

    loadNotificationPrefs();
  }, [user?.uid]);

  // Firebase integration for real-time notifications
  useEffect(() => {
    if (!user?.uid) {
      setIsLoading(false);
      return;
    }

    const doctorId = user.uid;
    const unsubscribes: (() => void)[] = [];
    isInitialLoadRef.current = true;

    // 1. PERSISTED NOTIFICATIONS - the SAME Firestore `notifications` collection
    // the mobile app reads, so both platforms show the same list. Doctors get
    // notifications where doctorId == their uid (matches the mobile query). This
    // is authoritative and persisted (survives reloads and syncs across devices),
    // unlike the previous ephemeral 5-second-window derivation from Bookings.
    const notificationsQuery = query(
      collection(db, "notifications"),
      where("doctorId", "==", doctorId)
    );

    const toMillis = (t: unknown): number => {
      if (!t) return 0;
      if (typeof t === "string") return new Date(t).getTime() || 0;
      if (typeof t === "object" && t !== null) {
        const obj = t as { toDate?: () => Date; seconds?: number };
        if (typeof obj.toDate === "function") return obj.toDate().getTime();
        if (typeof obj.seconds === "number") return obj.seconds * 1000;
      }
      return 0;
    };

    const unsubscribeNotifications = onSnapshot(
      notificationsQuery,
      (snapshot) => {
        // Record all existing notification IDs on initial snapshot load so historical items don't trigger toasts
        if (isInitialLoadRef.current) {
          snapshot.docs.forEach((docSnap) => {
            toastedNotificationIds.current.add(docSnap.id);
          });
          isInitialLoadRef.current = false;
        } else {
          // On real-time updates (e.g. appointment booking from mobile app), fire toast + sound for newly added items
          snapshot.docChanges().forEach((change) => {
            if (change.type === "added") {
              const docId = change.doc.id;
              const raw = change.doc.data() as Record<string, any>;
              if (!raw.deleted && !toastedNotificationIds.current.has(docId)) {
                toastedNotificationIds.current.add(docId);
                const t = String(raw.type || "");
                const title = raw.title || "New Notification";
                const description = raw.description || raw.message || "";
                const uiType: "info" | "success" | "warning" | "error" =
                  t.includes("cancellation") || t.includes("error")
                    ? "warning"
                    : t.includes("booking") || t.includes("success") || t.includes("accepted")
                      ? "info"
                      : "info";
                toastNotification(title, description, uiType);
              }
            }
          });
        }

        const persisted: Notification[] = snapshot.docs
          .map((d) => ({ id: d.id, raw: d.data() as Record<string, any> }))
          .filter(({ raw }) => !raw.deleted)
          .sort((a, b) => toMillis(b.raw.createdAt) - toMillis(a.raw.createdAt))
          .map(({ id, raw }) => {
            const t = String(raw.type || "");
            const category: Notification["category"] =
              t === "appointment_booking"
                ? "newPatientBooking"
                : t === "appointment_cancellation"
                  ? "cancellation"
                  : t === "appointment_reminder"
                    ? "appointmentReminder"
                    : "general";
            const uiType: Notification["type"] = t.includes("cancellation")
              ? "warning"
              : "info";
            return {
              id,
              type: uiType,
              title: raw.title || "Notification",
              description: raw.description || raw.message || "",
              timestamp: formatTimestamp(raw.createdAt),
              isRead: !!raw.isRead,
              category,
              data: raw.data || {},
            };
          });

        // Keep any purely-derived, web-only items (reminders/cancellations) that
        // are not part of the persisted collection; the collection is the source
        // of truth for everything else.
        setNotifications((prev) => {
          const persistedIds = new Set(persisted.map((n) => n.id));
          const ephemeral = prev.filter(
            (n) =>
              !persistedIds.has(n.id) &&
              (n.id.startsWith("reminder_") || n.id.startsWith("cancellation_"))
          );
          return [...persisted, ...ephemeral];
        });
        setIsLoading(false);
      },
      (error) => {
        console.warn("Snapshot error in notificationsQuery:", error);
        setIsLoading(false);
      }
    );

    unsubscribes.push(unsubscribeNotifications);

    // 2. APPOINTMENT REMINDERS - Check for upcoming appointments
    if (memoizedNotificationPrefs.appointmentReminders) {
      const now = new Date();
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      const upcomingAppointmentsQuery = query(
        collection(db, "Bookings"),
        where("doctorId", "==", doctorId),
        where("bookingDate", ">=", now),
        where("bookingDate", "<=", tomorrow),
        orderBy("bookingDate", "asc")
      );

      const unsubscribeReminders = onSnapshot(
        upcomingAppointmentsQuery,
        (snapshot) => {
          const reminderNotifications: Notification[] = [];

          snapshot.docs.forEach((doc) => {
            const appointmentData = doc.data();
            const appointmentId = doc.id;
            const appointmentTime = appointmentData.bookingDate?.toDate?.();

            if (appointmentTime) {
              const timeUntilAppointment =
                appointmentTime.getTime() - now.getTime();
              const hoursUntilAppointment =
                timeUntilAppointment / (1000 * 60 * 60);

              // Create reminder if appointment is within 2 hours
              if (hoursUntilAppointment <= 2 && hoursUntilAppointment > 0) {
                const notification: Notification = {
                  id: `reminder_${appointmentId}`,
                  type: "warning",
                  title: "Upcoming Appointment Reminder",
                  description: `You have an appointment with ${appointmentData.patientName || "a patient"
                    } in ${Math.round(hoursUntilAppointment * 60)} minutes`,
                  timestamp: formatTimestamp(now.toISOString()),
                  isRead: false,
                  category: "appointmentReminder",
                  data: {
                    bookingId: appointmentId,
                    patientName: appointmentData.patientName,
                    bookingDate: appointmentData.bookingDate,
                    slot: appointmentData.slot || appointmentData.timeSlot,
                    timeUntilAppointment: hoursUntilAppointment,
                  },
                };

                reminderNotifications.push(notification);
              }
            }
          });

          if (reminderNotifications.length > 0) {
            setNotifications((prev) => {
              // Remove old reminders for the same appointment
              const filteredPrev = prev.filter(
                (n) =>
                  !(
                    n.category === "appointmentReminder" &&
                    reminderNotifications.some(
                      (rn) => rn.data?.bookingId === n.data?.bookingId
                    )
                  )
              );
              return [...reminderNotifications, ...filteredPrev];
            });
          }
        }
      );

      unsubscribes.push(unsubscribeReminders);
    }

    // 3. PATIENT MESSAGES - Listen for new messages (if you have a messages collection)
    if (memoizedNotificationPrefs.patientMessages) {
      // This would depend on your message system structure
      // For now, we'll create a placeholder that could be connected to your messaging system
      const messagesQuery = query(
        collection(db, "Messages"), // Assuming you have a Messages collection
        where("doctorId", "==", doctorId),
        where("sender", "==", "patient"),
        orderBy("timestamp", "desc"),
        limit(10)
      );

      const unsubscribeMessages = onSnapshot(
        messagesQuery,
        (snapshot) => {
          const messageNotifications: Notification[] = [];

          snapshot.docChanges().forEach((change) => {
            if (change.type === "added") {
              const messageData = change.doc.data();
              const messageId = change.doc.id;

              // Only create notification for new messages (not initial load)
              const isNewMessage =
                Date.now() - messageData.timestamp?.toDate?.()?.getTime() <
                5000;

              if (isNewMessage) {
                const notification: Notification = {
                  id: `message_${messageId}`,
                  type: "info",
                  title: "New Patient Message",
                  description: `${messageData.patientName || "A patient"
                    } sent you a message: "${messageData.content?.substring(
                      0,
                      50
                    )}${messageData.content?.length > 50 ? "..." : ""}"`,
                  timestamp: formatTimestamp(messageData.timestamp),
                  isRead: false,
                  category: "patientMessage",
                  data: {
                    messageId,
                    patientName: messageData.patientName,
                    content: messageData.content,
                    conversationId: messageData.conversationId,
                  },
                };

                messageNotifications.push(notification);
              }
            }
          });

          if (messageNotifications.length > 0) {
            setNotifications((prev) => [...messageNotifications, ...prev]);
          }
        },
        (error) => {
          console.warn("Snapshot error in messagesQuery:", error);
          // Handle case where Messages collection doesn't exist yet
        }
      );

      unsubscribes.push(unsubscribeMessages);
    }

    // 4. APPOINTMENT CANCELLATIONS - Listen for cancellation requests
    const cancellationsQuery = query(
      collection(db, "Bookings"),
      where("doctorId", "==", doctorId),
      // where("cancellationRequest", "!=", null) removed to avoid inequality/orderBy conflict
      // orderBy implicitly filters out documents where the field is missing
      orderBy("cancellationRequest.requestedAt", "desc"),
      limit(10)
    );

    const unsubscribeCancellations = onSnapshot(
      cancellationsQuery,
      (snapshot) => {
        const cancellationNotifications: Notification[] = [];

        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            const cancellationData = change.doc.data();
            const cancellationId = change.doc.id;

            const notification: Notification = {
              id: `cancellation_${cancellationId}`,
              type: "warning",
              title: "Appointment Cancellation Request",
              description: `${cancellationData.patientName || "A patient"
                } requested to cancel their appointment. Reason: ${cancellationData.cancellationRequest?.reasonForCancellation ||
                "No reason provided"
                }`,
              timestamp: formatTimestamp(
                cancellationData.cancellationRequest?.requestedAt
              ),
              isRead: false,
              category: "cancellation",
              data: {
                bookingId: cancellationId,
                patientName: cancellationData.patientName,
                reason:
                  cancellationData.cancellationRequest?.reasonForCancellation,
                bookingDate: cancellationData.bookingDate,
              },
            };

            cancellationNotifications.push(notification);
          }
        });

        if (cancellationNotifications.length > 0) {
          setNotifications((prev) => [...cancellationNotifications, ...prev]);
        }
      },
      (error) => {
        console.warn("Snapshot error in cancellationsQuery:", error);
      }
    );

    unsubscribes.push(unsubscribeCancellations);

    setIsLoading(false);

    return () => {
      unsubscribes.forEach((unsubscribe) => unsubscribe());
    };
  }, [user?.uid, memoizedNotificationPrefs]);

  // Realtime Database WebSockets Integration for instant alerts
  useEffect(() => {
    if (!user?.uid) return;

    const listenerAttachTime = Date.now();
    const userNotificationsRef = rtdbRef(realtimeDb, `notifications/${user.uid}`);

    const unsubscribe = onChildAdded(userNotificationsRef, (snapshot) => {
      try {
        const key = snapshot.key;
        if (key && toastedNotificationIds.current.has(key)) return;

        const data = snapshot.val();
        if (!data) return;

        // Skip historical notifications loaded initially (or older than 2 minutes)
        const createdAtTime = data.createdAt ? new Date(data.createdAt).getTime() : 0;
        if (createdAtTime > 0 && listenerAttachTime - createdAtTime > 120000) return;

        if (key) {
          toastedNotificationIds.current.add(key);
        }

        // Toast (with sound) only — the Firestore `notifications` collection
        // listener (above) is the source of truth for the list, so we do NOT add
        // to state here (that would double the entry). This channel just fires
        // the instant toast + notification chime when a notification arrives.
        const uiType =
          data.type === "error" ||
          data.type === "warning" ||
          data.type === "success"
            ? data.type
            : "info";
        toastNotification(data.title || "New Update", data.description || "", uiType);
      } catch (err) {
        console.error("Error handling RTDB real-time event:", err);
      }
    });

    return () => unsubscribe();
  }, [user?.uid]);

  // Helper function to format Firebase timestamps
  const formatTimestamp = (
    timestamp:
      | string
      | { toDate: () => Date }
      | { seconds: number; nanoseconds: number }
  ): string => {
    if (!timestamp) return "Just now";

    let date: Date | null = null;
    if (typeof timestamp === "object" && "toDate" in timestamp) {
      date = timestamp.toDate();
    } else if (typeof timestamp === "object" && "seconds" in timestamp) {
      date = new Date(timestamp.seconds * 1000);
    } else if (typeof timestamp === "string") {
      const parsed = new Date(timestamp);
      if (!isNaN(parsed.getTime())) date = parsed;
    }

    if (date) {
      const now = new Date();
      const diffInMinutes = Math.floor(
        (now.getTime() - date.getTime()) / (1000 * 60)
      );

      if (diffInMinutes < 1) return "Just now";
      if (diffInMinutes < 60)
        return `${diffInMinutes} min${diffInMinutes > 1 ? "s" : ""} ago`;
      if (diffInMinutes < 1440)
        return `${Math.floor(diffInMinutes / 60)} hour${Math.floor(diffInMinutes / 60) > 1 ? "s" : ""
          } ago`;
      return `${Math.floor(diffInMinutes / 1440)} day${Math.floor(diffInMinutes / 1440) > 1 ? "s" : ""
        } ago`;
    }

    return "Just now";
  };

  // Function to update notification preferences
  const updateNotificationPrefs = useCallback(
    async (prefs: Partial<NotificationPreferences>) => {
      // Update local state
      setNotificationPrefs((prev) => ({ ...prev, ...prefs }));

      // Save to Firebase if user is logged in
      if (user?.uid) {
        try {
          const userRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userRef);

          if (userDoc.exists()) {
            // Get current notification preferences
            const currentData = userDoc.data();
            const currentPrefs = currentData.notification_preferences || {
              newPatientBookings: true,
              appointmentReminders: true,
              patientMessages: true,
            };

            // Update with new preferences
            const updatedPrefs = { ...currentPrefs, ...prefs };

            // Save to Firebase
            await updateDoc(userRef, {
              notification_preferences: updatedPrefs,
              updatedAt: Timestamp.now(),
            });


          }
        } catch (error) {
          console.error("Error saving notification preferences to Firebase:", error);
        }
      }
    },
    [user?.uid]
  );

  const addNotification = useCallback(
    (notification: Omit<Notification, "id" | "timestamp" | "isRead">) => {
      const newNotification: Notification = {
        ...notification,
        id: Date.now().toString(),
        timestamp: "Just now",
        isRead: false,
        category: notification.category || "general",
      };

      setNotifications((prev) => [newNotification, ...prev]);
    },
    []
  );

  // True for persisted `notifications` collection docs (real Firestore ids),
  // false for the web-only derived reminder_/cancellation_ items.
  const isPersisted = (id: string) =>
    !id.startsWith("reminder_") && !id.startsWith("cancellation_");

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id
          ? { ...notification, isRead: true }
          : notification
      )
    );
    // Persist so it sticks across the live snapshot and syncs to mobile
    if (isPersisted(id)) {
      updateDoc(doc(db, "notifications", id), { isRead: true }).catch(() => {});
    }
  }, []);

  const openNotificationModal = useCallback((notification: Notification) => {
    setSelectedNotification(notification);
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
  }, [markAsRead]);

  const closeNotificationModal = useCallback(() => {
    setSelectedNotification(null);
  }, []);

  const markAllAsRead = useCallback(() => {
    const idsToPersist = notifications
      .filter((n) => !n.isRead && isPersisted(n.id))
      .map((n) => n.id);
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, isRead: true }))
    );
    idsToPersist.forEach((id) => {
      updateDoc(doc(db, "notifications", id), { isRead: true }).catch(() => {});
    });
  }, [notifications]);

  const clearAll = useCallback(() => {
    const idsToDelete = notifications.filter((n) => isPersisted(n.id)).map((n) => n.id);
    setNotifications([]);
    // Soft-delete so cleared items don't reappear on the next snapshot (matches mobile)
    idsToDelete.forEach((id) => {
      updateDoc(doc(db, "notifications", id), { deleted: true }).catch(() => {});
    });
  }, [notifications]);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
    if (isPersisted(id)) {
      updateDoc(doc(db, "notifications", id), { deleted: true }).catch(() => {});
    }
  }, []);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    isLoading,
    notificationPrefs,
    selectedNotification,
    openNotificationModal,
    closeNotificationModal,
    updateNotificationPrefs,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
    removeNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationDetailModal
        notification={selectedNotification}
        isOpen={!!selectedNotification}
        onClose={closeNotificationModal}
        onMarkAsRead={markAsRead}
      />
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
