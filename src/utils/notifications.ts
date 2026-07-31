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
