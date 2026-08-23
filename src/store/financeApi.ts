import { api } from "./baseApi";
import { BankAccount } from "@/types";

export interface ConfirmPaymentPayload {
  paymentId: string;
  bookingId?: string;
  patientId?: string;
  doctorId?: string;
  patientName?: string;
  doctorName?: string;
  amount?: number | string;
  verifiedBy?: string;
  notes?: string;
}

export interface RejectPaymentPayload {
  paymentId: string;
  bookingId?: string;
  patientId?: string;
  reason: string;
  verifiedBy?: string;
}

export interface RefundPaymentPayload {
  paymentId: string;
  bookingId?: string;
  patientId?: string;
  reason: string;
  verifiedBy?: string;
}

/**
 * Resolve the Bookings doc a payment belongs to.
 *
 * The mobile bank-transfer flow stamps `paymentId` onto the booking (the payment
 * doc itself carries no bookingId), so a direct id is often unavailable. Fall
 * back to the paymentId back-reference, then to the patient's reserved booking
 * for the SAME date + slot.
 *
 * Deliberately scoped: an unscoped "every reserved booking for this patient"
 * sweep would also confirm/cancel a second, unrelated pending booking.
 */
async function resolveBookingRef(paymentId: string, bookingId?: string) {
  const { doc, getDoc, collection, query, where, getDocs, limit } = await import(
    "firebase/firestore"
  );
  const { db } = await import("@/lib/firebase");

  // Load the payment so we can match on its date + slot.
  let payment: any = null;
  try {
    const paySnap = await getDoc(doc(db, "payments", paymentId));
    if (paySnap.exists()) payment = paySnap.data();
  } catch {
    /* non-fatal — fall through to the other strategies */
  }

  const candidateId = bookingId || payment?.bookingId;
  if (candidateId) {
    for (const coll of ["Bookings", "bookings"]) {
      try {
        const ref = doc(db, coll, candidateId);
        const snap = await getDoc(ref);
        if (snap.exists()) return { ref, data: snap.data() as any };
      } catch {
        /* try the next collection */
      }
    }
  }

  try {
    const q = query(
      collection(db, "Bookings"),
      where("paymentId", "==", paymentId),
      limit(1)
    );
    const snap = await getDocs(q);
    if (!snap.empty) return { ref: snap.docs[0].ref, data: snap.docs[0].data() as any };
  } catch (err) {
    console.warn("Booking lookup by paymentId failed:", err);
  }

  if (payment?.patientId && payment?.slot) {
    try {
      const q = query(
        collection(db, "Bookings"),
        where("patientId", "==", payment.patientId),
        where("slot", "==", payment.slot),
        limit(10)
      );
      const snap = await getDocs(q);
      const match = snap.docs.find((d) => {
        const b = d.data() as any;
        const reserved = String(b.bookingStatus || "").toLowerCase() === "reserved";
        const sameDate = !payment.bookingDate || b.bookingDate === payment.bookingDate;
        return reserved && sameDate;
      });
      if (match) return { ref: match.ref, data: match.data() as any };
    } catch (err) {
      console.warn("Booking lookup by patient+slot failed:", err);
    }
  }

  return null;
}

export const financeApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // ===== COMPANY BANK ACCOUNTS =====
    getCompanyBankAccounts: builder.query<BankAccount[], { activeOnly?: boolean } | void>({
      async queryFn(arg) {
        try {
          const { createFirebaseQuery } = await import("@/lib/firebase-rtk");
          let accounts = (await createFirebaseQuery<BankAccount>("companyBankAccounts", [])) || [];
          
          if (arg && arg.activeOnly) {
            accounts = accounts.filter((acc) => acc.isActive !== false);
          }

          // Sort by createdAt desc
          accounts.sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA;
          });

          return { data: accounts };
        } catch (error) {
          console.error("Error fetching company bank accounts:", error);
          return {
            error: {
              status: "FETCH_ERROR",
              error: error instanceof Error ? error.message : "Unknown error",
            },
          };
        }
      },
      providesTags: ["Payment"],
    }),

    createCompanyBankAccount: builder.mutation<BankAccount, Partial<BankAccount>>({
      async queryFn(accountData) {
        try {
          const { createFirebaseDocument } = await import("@/lib/firebase-rtk");
          const payload = {
            ...accountData,
            isActive: accountData.isActive ?? true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          const result = await createFirebaseDocument("companyBankAccounts", payload);
          return { data: { id: result.id, ...(result.data as BankAccount) } };
        } catch (error) {
          console.error("Error creating company bank account:", error);
          return {
            error: {
              status: "FETCH_ERROR",
              error: error instanceof Error ? error.message : "Failed to create bank account",
            },
          };
        }
      },
      invalidatesTags: ["Payment"],
    }),

    updateCompanyBankAccount: builder.mutation<BankAccount, { id: string; data: Partial<BankAccount> }>({
      async queryFn({ id, data }) {
        try {
          const { updateFirebaseDocument } = await import("@/lib/firebase-rtk");
          const payload = {
            ...data,
            updatedAt: new Date().toISOString(),
          };
          await updateFirebaseDocument("companyBankAccounts", id, payload);
          return { data: { id, ...(payload as BankAccount) } };
        } catch (error) {
          console.error("Error updating bank account:", error);
          return {
            error: {
              status: "FETCH_ERROR",
              error: error instanceof Error ? error.message : "Failed to update bank account",
            },
          };
        }
      },
      invalidatesTags: ["Payment"],
    }),

    deleteCompanyBankAccount: builder.mutation<{ success: boolean; id: string }, string>({
      async queryFn(id) {
        try {
          const { deleteFirebaseDocument } = await import("@/lib/firebase-rtk");
          await deleteFirebaseDocument("companyBankAccounts", id);
          return { data: { success: true, id } };
        } catch (error) {
          console.error("Error deleting bank account:", error);
          return {
            error: {
              status: "FETCH_ERROR",
              error: error instanceof Error ? error.message : "Failed to delete bank account",
            },
          };
        }
      },
      invalidatesTags: ["Payment"],
    }),

    // ===== PAYMENT VERIFICATION & STATUS TRANSITIONS =====
    confirmPayment: builder.mutation<{ success: boolean; message: string }, ConfirmPaymentPayload>({
      async queryFn({ paymentId, bookingId, patientId, doctorId, patientName, doctorName, amount, verifiedBy, notes }) {
        try {
          const { updateFirebaseDocument, createFirebaseDocument } = await import("@/lib/firebase-rtk");
          const { doc, getDoc, updateDoc, collection, query, where, getDocs } = await import("firebase/firestore");
          const { db } = await import("@/lib/firebase");

          const now = new Date().toISOString();

          // 1. Update Payment record
          if (paymentId) {
            await updateFirebaseDocument("payments", paymentId, {
              paymentStatus: "completed",
              status: "completed",
              verifiedAt: now,
              verifiedBy: verifiedBy || "Finance Team",
              verificationNotes: notes || "Payment verified by Finance",
              updatedAt: now,
            });
          }

          // 2. Promote THIS payment's booking to "scheduled" (slot stays held).
          // Scoped to the one matching booking — a blanket sweep over every
          // "reserved" booking for the patient would also confirm an unrelated
          // second pending booking. The onPaymentStatusChanged cloud function
          // reconciles the same transition server-side if this write is lost.
          let targetBookingId: string | null = bookingId || null;
          try {
            const found = await resolveBookingRef(paymentId, bookingId);
            if (found) {
              targetBookingId = found.ref.id;
              await updateDoc(found.ref, {
                bookingStatus: "scheduled",
                paymentStatus: "completed",
                status: "scheduled",
                updatedAt: now,
              });
            } else {
              console.warn(
                `No booking found for confirmed payment ${paymentId} — the cloud function will retry.`
              );
            }
          } catch (err) {
            console.warn("Could not update booking on confirmation:", err);
          }

          // 3. Dispatch notifications to patient and doctor
          try {
            if (patientId) {
              await createFirebaseDocument("notifications", {
                userId: patientId,
                patientId,
                doctorId: doctorId || null,
                title: "Payment Confirmed & Appointment Scheduled",
                description: `Your payment has been verified by Finance. Your appointment with ${doctorName || "your doctor"} is now confirmed and scheduled.`,
                type: "payment_confirmed",
                isRead: false,
                isReadByNurse: false,
                isReadByAdmin: false,
                createdAt: now,
                updatedAt: now,
                deleted: false,
                data: {
                  type: "payment_confirmed",
                  paymentId,
                  bookingId: targetBookingId || null,
                },
              });
            }

            if (doctorId) {
              await createFirebaseDocument("notifications", {
                userId: doctorId,
                patientId: patientId || null,
                doctorId,
                title: "New Confirmed Appointment",
                description: `Payment for ${patientName || "a patient"}'s appointment has been confirmed. The appointment is now scheduled.`,
                type: "appointment_scheduled",
                isRead: false,
                isReadByNurse: false,
                isReadByAdmin: false,
                createdAt: now,
                updatedAt: now,
                deleted: false,
                data: {
                  type: "appointment_scheduled",
                  paymentId,
                  bookingId: targetBookingId || null,
                },
              });
            }
          } catch (notifErr) {
            console.error("Failed to create confirmation notifications:", notifErr);
          }

          return { data: { success: true, message: "Payment confirmed and appointment scheduled successfully." } };
        } catch (error) {
          console.error("Error confirming payment:", error);
          return {
            error: {
              status: "CUSTOM_ERROR",
              error: error instanceof Error ? error.message : "Failed to confirm payment",
            },
          };
        }
      },
      invalidatesTags: ["Payment", "Booking", "Appointment"],
    }),

    rejectPayment: builder.mutation<{ success: boolean; message: string }, RejectPaymentPayload>({
      async queryFn({ paymentId, bookingId, patientId, reason, verifiedBy }) {
        try {
          const { updateFirebaseDocument, createFirebaseDocument } = await import("@/lib/firebase-rtk");
          const { doc, getDoc, updateDoc } = await import("firebase/firestore");
          const { db } = await import("@/lib/firebase");

          const now = new Date().toISOString();

          // 1. Update Payment record
          await updateFirebaseDocument("payments", paymentId, {
            paymentStatus: "failed",
            status: "failed",
            rejectionReason: reason,
            verifiedAt: now,
            verifiedBy: verifiedBy || "Finance Team",
            updatedAt: now,
          });

          // 2. Cancel the booking so its time slot returns to available.
          // Previously this only ran when a bookingId was passed in, so a
          // rejected payment whose booking wasn't linked left the slot blocked
          // forever. Resolve it the same way confirmation does.
          try {
            const found = await resolveBookingRef(paymentId, bookingId);
            if (found) {
              await updateDoc(found.ref, {
                bookingStatus: "cancelled",
                status: "cancelled",
                paymentStatus: "failed",
                cancellationReason: `Payment rejected by Finance: ${reason}`,
                updatedAt: now,
              });
            } else {
              console.warn(
                `No booking found for rejected payment ${paymentId} — the cloud function will retry.`
              );
            }
          } catch (err) {
            console.warn("Could not update booking status on rejection:", err);
          }

          // 3. Notify patient
          if (patientId) {
            try {
              await createFirebaseDocument("notifications", {
                userId: patientId,
                patientId,
                doctorId: null,
                title: "Payment Verification Failed",
                description: `Your payment could not be verified by Finance. Reason: ${reason}. Please re-submit a valid receipt or contact support.`,
                type: "payment_rejected",
                isRead: false,
                isReadByNurse: false,
                isReadByAdmin: false,
                createdAt: now,
                updatedAt: now,
                deleted: false,
                data: {
                  type: "payment_rejected",
                  paymentId,
                  reason,
                },
              });
            } catch (notifErr) {
              console.error("Failed to notify patient of rejection:", notifErr);
            }
          }

          return { data: { success: true, message: "Payment rejected." } };
        } catch (error) {
          console.error("Error rejecting payment:", error);
          return {
            error: {
              status: "CUSTOM_ERROR",
              error: error instanceof Error ? error.message : "Failed to reject payment",
            },
          };
        }
      },
      invalidatesTags: ["Payment", "Booking", "Appointment"],
    }),

    refundPayment: builder.mutation<{ success: boolean; message: string }, RefundPaymentPayload>({
      async queryFn({ paymentId, bookingId, patientId, reason, verifiedBy }) {
        try {
          const { updateFirebaseDocument, createFirebaseDocument } = await import("@/lib/firebase-rtk");
          const { doc, getDoc, updateDoc } = await import("firebase/firestore");
          const { db } = await import("@/lib/firebase");

          const now = new Date().toISOString();

          // 1. Update Payment
          await updateFirebaseDocument("payments", paymentId, {
            paymentStatus: "refunded",
            status: "refunded",
            refundReason: reason,
            refundedAt: now,
            refundedBy: verifiedBy || "Finance Team",
            updatedAt: now,
          });

          // 2. Update Booking
          if (bookingId) {
            try {
              const bRef = doc(db, "Bookings", bookingId);
              const bSnap = await getDoc(bRef);
              if (bSnap.exists()) {
                await updateDoc(bRef, {
                  bookingStatus: "cancelled",
                  paymentStatus: "refunded",
                  updatedAt: now,
                });
              }
            } catch (err) {}
          }

          // 3. Notify patient
          if (patientId) {
            try {
              await createFirebaseDocument("notifications", {
                userId: patientId,
                patientId,
                doctorId: null,
                title: "Payment Refunded",
                description: `A refund has been processed for your payment. Reason: ${reason}.`,
                type: "payment_refunded",
                isRead: false,
                isReadByNurse: false,
                isReadByAdmin: false,
                createdAt: now,
                updatedAt: now,
                deleted: false,
                data: {
                  type: "payment_refunded",
                  paymentId,
                  reason,
                },
              });
            } catch (e) {}
          }

          return { data: { success: true, message: "Payment marked as refunded." } };
        } catch (error) {
          console.error("Error refunding payment:", error);
          return {
            error: {
              status: "CUSTOM_ERROR",
              error: error instanceof Error ? error.message : "Failed to refund payment",
            },
          };
        }
      },
      invalidatesTags: ["Payment", "Booking", "Appointment"],
    }),
  }),
});

export const {
  useGetCompanyBankAccountsQuery,
  useCreateCompanyBankAccountMutation,
  useUpdateCompanyBankAccountMutation,
  useDeleteCompanyBankAccountMutation,
  useConfirmPaymentMutation,
  useRejectPaymentMutation,
  useRefundPaymentMutation,
} = financeApi;
