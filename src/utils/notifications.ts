import { collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

/**
 * Log a missed call for the patient. Writes an in-app notification directly to
 * Firestore (the `notifications` collection is world-writable per rules), so it
 * shows in the patient's bell + list, mirrors to RTDB for a real-time toast, and
 * counts toward the unread badge — no FCM token or Admin SDK required.
 */
export const notifyMissedCall = async (params: {
  calleeId: string; // the patient (recipient)
  callerName: string; // the doctor
  callId: string;
  callType: string; // "audio" | "video"
  callerId?: string; // the doctor's uid — used for "request callback"
}) => {
  const { calleeId, callerName, callId, callType, callerId } = params;
  if (!calleeId) return;

  try {
    const label = callType === "audio" ? "voice" : "video";
    await addDoc(collection(db, "notifications"), {
      userId: calleeId,
      patientId: calleeId,
      doctorId: null, // stays out of the doctor's own list
      title: "Missed Call",
      description: `You missed a ${label} call from ${callerName}. You can request a callback.`,
      type: "missed_call",
      isRead: false,
      isReadByNurse: false,
      isReadByAdmin: false,
      createdAt: new Date().toISOString(),
      data: {
        type: "missed_call",
        callId: callId || "",
        callType,
        doctorId: callerId || null,
        callerName,
      },
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error notifying missed call:", error);
  }
};

/**
 * Notify the patient (and their doctor) that a refund has been finance-completed
 * — the admin's final "Completed" sign-off. Writes to the `notifications`
 * collection; the `onNotificationCreated` cloud function mirrors it to RTDB so
 * it also surfaces as a real-time push in the mobile app.
 */
export const notifyRefundFinanceCompleted = async (params: {
  patientId?: string;
  doctorId?: string;
  patientName?: string;
  amount?: number | string;
  bookingId?: string;
}) => {
  const { patientId, doctorId, patientName, amount, bookingId } = params;

  const numeric = Number(String(amount ?? "").replace(/[^\d.]/g, "")) || 0;
  const amountText = numeric ? `₦${numeric.toLocaleString()}` : "";

  const nowIso = new Date().toISOString();
  const base = {
    title: "Refund Completed",
    type: "refund_update",
    isRead: false,
    isReadByNurse: false,
    isReadByAdmin: false,
    createdAt: nowIso,
    updatedAt: nowIso,
    data: {
      type: "refund_update",
      bookingId: bookingId || "",
      financeStatus: "completed",
    },
  };

  const writes: Promise<unknown>[] = [];

  if (patientId) {
    writes.push(
      addDoc(collection(db, "notifications"), {
        ...base,
        userId: patientId,
        patientId,
        doctorId: null,
        description: `Your refund${
          amountText ? ` of ${amountText}` : ""
        } has been completed and processed by our finance team.`,
      })
    );
  }

  if (doctorId) {
    writes.push(
      addDoc(collection(db, "notifications"), {
        ...base,
        userId: doctorId,
        doctorId,
        patientId: null,
        description: `The refund for ${patientName || "a patient"}${
          amountText ? ` (${amountText})` : ""
        } has been completed by finance.`,
      })
    );
  }

  try {
    await Promise.all(writes);
  } catch (error) {
    console.error("Error notifying refund finance completion:", error);
  }
};
