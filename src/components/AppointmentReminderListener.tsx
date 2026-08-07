"use client";

import React, { useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { collection, query, where, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";

export default function AppointmentReminderListener() {
  const { user, userInfo } = useAuth();
  const triggeredReminders = useRef<Record<string, boolean>>({});

  useEffect(() => {
    if (!user || !userInfo) return;

    const role = (userInfo.role || "").toLowerCase();
    const userId = user.uid;

    // Define Firestore bookings query based on role
    let bookingsQuery;
    if (role === "doctor") {
      bookingsQuery = query(collection(db, "Bookings"), where("doctorId", "==", userId));
    } else if (role === "patient") {
      bookingsQuery = query(collection(db, "Bookings"), where("userId", "==", userId));
    } else {
      // Nurse / Admin sees all bookings for the day
      bookingsQuery = query(collection(db, "Bookings"));
    }

    const parseAppointmentTime = (bookingDate: any, slot: string): Date | null => {
      if (!bookingDate || !slot) return null;
      let dateStr = "";
      if (typeof bookingDate === "object") {
        if (bookingDate._seconds) dateStr = new Date(bookingDate._seconds * 1000).toISOString().split("T")[0];
        else if (bookingDate.seconds) dateStr = new Date(bookingDate.seconds * 1000).toISOString().split("T")[0];
      } else {
        dateStr = new Date(bookingDate).toISOString().split("T")[0];
      }
      
      const match = slot.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (!match) return null;
      
      let hours = parseInt(match[1], 10);
      const minutes = parseInt(match[2], 10);
      const period = match[3].toUpperCase();
      
      if (period === "PM" && hours !== 12) hours += 12;
      if (period === "AM" && hours === 12) hours = 0;
      
      const [y, m, d] = dateStr.split("-").map(Number);
      return new Date(y, m - 1, d, hours, minutes, 0, 0);
    };

    const unsubscribe = onSnapshot(bookingsQuery, (snapshot) => {
      const bookings = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as any[];

      const checkReminders = async () => {
        const now = new Date();
        const todayStr = now.toISOString().split("T")[0];

        for (const booking of bookings) {
          const status = (booking.bookingStatus || "").toLowerCase();
          if (status !== "accepted" && status !== "confirmed") continue;

          // Resolve booking date string
          let bookingDateStr = "";
          if (booking.bookingDate) {
            if (typeof booking.bookingDate === "object") {
              if (booking.bookingDate._seconds) bookingDateStr = new Date(booking.bookingDate._seconds * 1000).toISOString().split("T")[0];
              else if (booking.bookingDate.seconds) bookingDateStr = new Date(booking.bookingDate.seconds * 1000).toISOString().split("T")[0];
            } else {
              bookingDateStr = new Date(booking.bookingDate).toISOString().split("T")[0];
            }
          }

          // Only remind for today's bookings
          if (bookingDateStr !== todayStr) continue;

          const apptTime = parseAppointmentTime(booking.bookingDate, booking.slot || "");
          if (!apptTime) continue;

          const diffMs = apptTime.getTime() - now.getTime();
          const diffMins = Math.round(diffMs / 60000);

          // Check if appointment is starting in ~30 mins (28-30) or ~10 mins (8-10)
          let mark: 30 | 10 | null = null;
          if (diffMins >= 28 && diffMins <= 30) {
            mark = 30;
          } else if (diffMins >= 8 && diffMins <= 10) {
            mark = 10;
          }

          if (mark) {
            const key = `${booking.id}_reminder_${mark}`;
            if (triggeredReminders.current[key]) continue;
            triggeredReminders.current[key] = true;

            const patientName = booking.patientName || "Patient";
            const doctorName = booking.doctorName || "Doctor";
            
            let messageText = "";
            let notifTitle = "Appointment Reminder";

            if (role === "doctor") {
              messageText = `You have an appointment with ${patientName} in ${mark} minutes.`;
            } else if (role === "patient") {
              messageText = `Your appointment with Dr. ${doctorName} is in ${mark} minutes.`;
            } else {
              // Nurse / Admin
              messageText = `Appointment between Dr. ${doctorName} and ${patientName} starts in ${mark} minutes.`;
            }

            // Show Toast Banner
            toast.warning(notifTitle, {
              description: messageText,
              duration: 10000,
            });

            // Write notification document to Firestore
            try {
              await addDoc(collection(db, "notifications"), {
                userId: userId,
                bookingId: booking.id,
                title: notifTitle,
                description: messageText,
                type: `reminder_${mark}`,
                isRead: false,
                isReadByNurse: false,
                isReadByAdmin: false,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                deleted: false,
                deletedByNurse: false,
                deletedByAdmin: false,
              });
            } catch (err) {
              console.error("Failed to write reminder notification:", err);
            }
          }
        }
      };

      // Run check immediately
      checkReminders();

      // Check every 30 seconds
      const interval = setInterval(checkReminders, 30000);
      return () => clearInterval(interval);
    });

    return () => unsubscribe();
  }, [user, userInfo]);

  return null;
}
