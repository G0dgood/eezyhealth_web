"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
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
import { db } from "@/lib/firebase";

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
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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

    // 1. NEW PATIENT BOOKINGS - Listen for new appointments
    if (memoizedNotificationPrefs.newPatientBookings) {
      const newBookingsQuery = query(
        collection(db, "Bookings"),
        where("doctorId", "==", doctorId),
        orderBy("createdAt", "desc"),
        limit(20)
      );

      const unsubscribeNewBookings = onSnapshot(
        newBookingsQuery,
        (snapshot) => {
          const newBookingNotifications: Notification[] = [];

          snapshot.docChanges().forEach((change) => {
            if (change.type === "added") {
              const bookingData = change.doc.data();
              const bookingId = change.doc.id;

              // Only create notification for truly new bookings (not initial load)
              const isNewBooking =
                Date.now() - bookingData.createdAt?.toDate?.()?.getTime() <
                5000;

              if (isNewBooking) {
                const notification: Notification = {
                  id: `new_booking_${bookingId}`,
                  type: "info",
                  title: "New Patient Booking",
                  description: `${bookingData.patientName || "A patient"
                    } booked an appointment for ${formatDate(
                      bookingData.bookingDate
                    )} at ${bookingData.slot || bookingData.timeSlot}`,
                  timestamp: formatTimestamp(bookingData.createdAt),
                  isRead: false,
                  category: "newPatientBooking",
                  data: {
                    bookingId,
                    patientName: bookingData.patientName,
                    bookingDate: bookingData.bookingDate,
                    slot: bookingData.slot || bookingData.timeSlot,
                  },
                };

                newBookingNotifications.push(notification);
              }
            }
          });

          if (newBookingNotifications.length > 0) {
            setNotifications((prev) => [...newBookingNotifications, ...prev]);
          }
        }
      );

      unsubscribes.push(unsubscribeNewBookings);
    }

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
          // Handle case where Messages collection doesn't exist yet
        }
      );

      unsubscribes.push(unsubscribeMessages);
    }

    // 4. APPOINTMENT CANCELLATIONS - Listen for cancellation requests
    const cancellationsQuery = query(
      collection(db, "Bookings"),
      where("doctorId", "==", doctorId),
      where("cancellationRequest", "!=", null),
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
      }
    );

    unsubscribes.push(unsubscribeCancellations);

    setIsLoading(false);

    return () => {
      unsubscribes.forEach((unsubscribe) => unsubscribe());
    };
  }, [user?.uid, memoizedNotificationPrefs]);

  // Helper function to format Firebase timestamps
  const formatTimestamp = (
    timestamp:
      | string
      | { toDate: () => Date }
      | { seconds: number; nanoseconds: number }
  ): string => {
    if (!timestamp) return "Just now";

    if (timestamp && typeof timestamp === "object" && "toDate" in timestamp) {
      const date = timestamp.toDate();
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

  // Helper function to format dates for notifications
  const formatDate = (
    date:
      | string
      | { toDate: () => Date }
      | { seconds: number; nanoseconds: number }
  ): string => {
    if (!date) return "Unknown date";

    if (date && typeof date === "object" && "toDate" in date) {
      return date.toDate().toLocaleDateString();
    }

    if (typeof date === "string") {
      return new Date(date).toLocaleDateString();
    }

    return "Unknown date";
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
    isLoading,
    notificationPrefs,
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
