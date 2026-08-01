import { api } from "./baseApi";

export const bookingCancellationApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // ===== BOOKING CANCELLATION =====
    getBookingCancellations: builder.query({
      async queryFn(arg: { page?: number; limit?: number; search?: string; doctorId?: string } = {}) {
        try {
          const { collection, query, where, getDocs } = await import(
            "firebase/firestore"
          );
          const { db } = await import("@/lib/firebase");

          const bookingsCollectionRef = collection(db, "Bookings");

          // Try "cancelled" (lowercase) first
          const bookingsQuery = query(
            bookingsCollectionRef,
            where("bookingStatus", "==", "cancelled")
          );
          let snapshot = await getDocs(bookingsQuery);

          // If no results, try "Cancelled" (capitalized)
          if (snapshot.size === 0) {
            const cancelledQuery = query(
              bookingsCollectionRef,
              where("bookingStatus", "==", "Cancelled")
            );
            snapshot = await getDocs(cancelledQuery);
          }

          const firebaseRtk = await import("@/lib/firebase-rtk");
          const serializeFirebaseData = firebaseRtk.serializeFirebaseData;

          let bookingsData = snapshot.docs.map((doc) => {
            const docData = doc.data();
            const serializedData = serializeFirebaseData(docData) as Record<
              string,
              unknown
            >;

            return {
              id: doc.id,
              ...serializedData,
            };
          });

          // Apply doctorId filter if present
          if (arg.doctorId) {
            bookingsData = bookingsData.filter(
              (b: any) => b.doctorId === arg.doctorId
            );
          }

          // Apply search filter if present
          if (arg.search) {
            const searchLower = arg.search.toLowerCase();
            bookingsData = bookingsData.filter(
              (b: any) =>
                b.patientName?.toLowerCase().includes(searchLower) ||
                b.doctorName?.toLowerCase().includes(searchLower) ||
                b.specialization?.toLowerCase().includes(searchLower) ||
                b.cancellationReason?.toLowerCase().includes(searchLower) ||
                b.reason?.toLowerCase().includes(searchLower)
            );
          }

          const totalCount = bookingsData.length;

          // Apply page/limit slicing if provided
          let result = bookingsData;
          if (arg.page && arg.limit) {
            const startIndex = (arg.page - 1) * arg.limit;
            result = bookingsData.slice(startIndex, startIndex + arg.limit);
          }

          // Attach pagination properties to the array itself
          const paginatedResult = [...result] as any;
          paginatedResult.totalCount = totalCount;
          paginatedResult.totalPages = arg.limit ? Math.ceil(totalCount / arg.limit) : 1;

          return { data: paginatedResult };
        } catch (error) {
          console.error(
            "Error fetching Firebase cancelled bookings:",
            error
          );
          return {
            error: {
              status: "FETCH_ERROR",
              error:
                error instanceof Error
                  ? error.message
                  : "Unknown error occurred",
            },
          };
        }
      },
      providesTags: ["BookingCancellation"],
    }),

    getBookingCancellationsByDoctorId: builder.query({
      async queryFn({ doctorId }: { doctorId: string }) {
        try {
          const { collection, query, where, getDocs } = await import(
            "firebase/firestore"
          );
          const { db } = await import("@/lib/firebase");
          const { serializeFirebaseData } = await import("@/lib/firebase-rtk");

          const bookingsCollectionRef = collection(db, "Bookings");
          const statusVariants = ["cancelled", "Cancelled", "CANCELLED"];
          const cancellationRequestStatuses = [
            "pending",
            "Pending",
            "approved",
            "Approved",
            "rejected",
            "Rejected",
            "cancelled",
            "Cancelled",
            "denied",
            "Denied",
          ];

          const combinedResults = new Map<string, Record<string, unknown>>();

          const collectSnapshot = (
            snapshot: Awaited<ReturnType<typeof getDocs>>
          ) => {
            snapshot.forEach((docSnapshot) => {
              if (combinedResults.has(docSnapshot.id)) return;
              const serializedData = serializeFirebaseData(
                docSnapshot.data()
              ) as Record<string, unknown>;
              combinedResults.set(docSnapshot.id, {
                id: docSnapshot.id,
                ...serializedData,
              });
            });
          };

          const bookingStatusQuery = query(
            bookingsCollectionRef,
            where("doctorId", "==", doctorId),
            where("bookingStatus", "in", statusVariants)
          );
          const bookingStatusSnapshot = await getDocs(bookingStatusQuery);
          collectSnapshot(bookingStatusSnapshot);

          try {
            const cancellationStatusQuery = query(
              bookingsCollectionRef,
              where("doctorId", "==", doctorId),
              where(
                "cancellationRequest.status",
                "in",
                cancellationRequestStatuses
              )
            );
            const cancellationStatusSnapshot = await getDocs(
              cancellationStatusQuery
            );
            collectSnapshot(cancellationStatusSnapshot);
          } catch (error) {
            console.warn(
              "Optional cancellationRequest.status query failed (possibly missing index):",
              error
            );
          }

          return { data: Array.from(combinedResults.values()) };
        } catch (error) {
          console.error(
            "Error fetching Firebase cancelled bookings by doctor ID:",
            error
          );
          return {
            error: {
              status: "FETCH_ERROR",
              error:
                error instanceof Error
                  ? error.message
                  : "Unknown error occurred",
            },
          };
        }
      },
      providesTags: (result, error, { doctorId }) => [
        { type: "BookingCancellation", id: doctorId },
      ],
    }),

    bookingCancellationRequest: builder.mutation({
      query: (cancellationRequest) => ({
        url: "/bookingCancellationRequest",
        method: "POST",
        body: cancellationRequest,
      }),
      invalidatesTags: ["Booking", "BookingCancellation"],
    }),

    respondToCancellationRequest: builder.mutation({
      async queryFn(responseData) {
        try {
          const { doc, updateDoc } = await import("firebase/firestore");
          const { db } = await import("@/lib/firebase");

          const { bookingId, status, adminResponse } = responseData;

          // Update the booking document with the admin response
          const bookingRef = doc(db, "Bookings", bookingId);
          await updateDoc(bookingRef, {
            "cancellationRequest.status": status,
            "cancellationRequest.adminResponse": adminResponse,
            "cancellationRequest.respondedAt": new Date().toISOString(),
            "cancellationRequest.respondedBy": "admin", // You can get this from auth context
          });

          return { data: { success: true, bookingId, status } };
        } catch (error) {
          console.error("Error responding to cancellation request:", error);
          return {
            error: {
              status: "FETCH_ERROR",
              error:
                error instanceof Error
                  ? error.message
                  : "Unknown error occurred",
            },
          };
        }
      },
      invalidatesTags: ["Booking", "BookingCancellation"],
    }),
  }),
});

export const {
  useGetBookingCancellationsQuery,
  useGetBookingCancellationsByDoctorIdQuery,
  useBookingCancellationRequestMutation,
  useRespondToCancellationRequestMutation,
} = bookingCancellationApi;


