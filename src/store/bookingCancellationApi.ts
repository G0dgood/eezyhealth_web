import { api } from "./baseApi";

export const bookingCancellationApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // ===== BOOKING CANCELLATION =====
    getBookingCancellations: builder.query({
      async queryFn() {
        try {
          const { collection, query, where, getDocs } = await import(
            "firebase/firestore"
          );
          const { db } = await import("@/lib/firebase");

          const bookingsCollectionRef = collection(db, "Bookings");

          // Debug: Try different status values 

          // Create a query to filter documents where bookingStatus is "cancelled" (lowercase)
          const bookingsQuery = query(
            bookingsCollectionRef,
            where("bookingStatus", "==", "cancelled")
          );

          // Fetch the documents that match the query
          const snapshot = await getDocs(bookingsQuery);
          

          // If no results, try with different casing
          if (snapshot.size === 0) {
             
            // Try "Cancelled" (capitalized)
            const cancelledQuery = query(
              bookingsCollectionRef,
              where("bookingStatus", "==", "Cancelled")
            );
            const cancelledSnapshot = await getDocs(cancelledQuery);
             

            if (cancelledSnapshot.size > 0) {
              const firebaseRtk = await import("@/lib/firebase-rtk");
              const serializeFirebaseData = firebaseRtk.serializeFirebaseData;

              const bookingsData = cancelledSnapshot.docs.map((doc) => {
                const docData = doc.data();
                const serializedData = serializeFirebaseData(
                  docData
                ) as Record<string, unknown>;

                return {
                  id: doc.id,
                  ...serializedData,
                };
              });

              return { data: bookingsData };
            }
          }

          // Extract the data from the documents and convert Firestore Timestamps to ISO strings
          const firebaseRtk = await import("@/lib/firebase-rtk");
          const serializeFirebaseData = firebaseRtk.serializeFirebaseData;

          const bookingsData = snapshot.docs.map((doc) => {
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

          return { data: bookingsData };
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


