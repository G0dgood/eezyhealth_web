import { api } from "./baseApi";

export const bookingApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Firebase-powered all bookings query
    getFirebaseBookings: builder.query({
      async queryFn() {
        try {
          const { createFirebaseQuery, firebaseConstraints } = await import(
            "@/lib/firebase-rtk"
          );

          // Try 'Bookings' first
          let bookingsData: any[] = [];
          
          try {
             bookingsData = await createFirebaseQuery("Bookings", []);
          } catch (e) {
             console.log("Failed to fetch from Bookings, trying bookings");
          }

          // If empty or failed, try 'bookings'
          if (!bookingsData || bookingsData.length === 0) {
             try {
                const fallbackData = await createFirebaseQuery("bookings", []);
                if (fallbackData && fallbackData.length > 0) {
                   bookingsData = fallbackData;
                }
             } catch (e) {
                console.log("Failed to fetch from bookings");
             }
          }

          return { data: bookingsData };
        } catch (error) {
          console.error("Error fetching Firebase bookings:", error);
          return {
            error: {
              status: 500,
              data:
                error instanceof Error
                  ? error.message
                  : "Unknown error occurred",
            },
          };
        }
      },
      providesTags: ["Booking"],
    }),

    // ===== BOOKING & APPOINTMENT MANAGEMENT =====
    bookDoctorAppointment: builder.mutation({
      query: (appointmentData) => ({
        url: "/bookDoctorAppointment",
        method: "POST",
        body: appointmentData,
      }),
      invalidatesTags: ["Booking", "Appointment"],
    }),

    getBookings: builder.query({
      query: (params) => ({
        url: "/getBookings",
        params,
      }),
      providesTags: ["Booking"],
    }),

    getBookingsByUserId: builder.query({
      query: (userId) => ({
        url: "/getBookingsByUserId",
        params: { userId },
      }),
      providesTags: ["Booking"],
    }),

    getBookingsByDoctorId: builder.query({
      async queryFn(doctorId: string) {
        try {
          const { collection, query, where, getDocs } = await import(
            "firebase/firestore"
          );
          const { db } = await import("@/lib/firebase");

          // Try fetching from 'Bookings' first
          let bookingsCollectionRef = collection(db, "Bookings");
          let q = query(
            bookingsCollectionRef,
            where("doctorId", "==", doctorId)
          );
          let snapshot = await getDocs(q);

          // If no documents found, try 'bookings' (lowercase)
          if (snapshot.empty) {
            bookingsCollectionRef = collection(db, "bookings");
            q = query(
              bookingsCollectionRef,
              where("doctorId", "==", doctorId)
            );
            snapshot = await getDocs(q);
          }

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
            "Error fetching Firebase bookings by doctor ID:",
            error
          );
          return {
            error: {
              status: 500,
              data:
                error instanceof Error
                  ? error.message
                  : "Unknown error occurred",
            },
          };
        }
      },
      providesTags: (result, error, doctorId) => [
        { type: "Booking", id: doctorId },
      ],
    }),

    getBookingById: builder.query({
      query: (bookingId) => ({
        url: "/getBookingById",
        params: { bookingId },
      }),
      providesTags: (result, error, bookingId) => [
        { type: "Booking", id: bookingId },
      ],
    }),

    getPendingBookings: builder.query({
      query: (params) => ({
        url: "/getPendingBookings",
        params,
      }),
      providesTags: ["Booking"],
    }),

    getCompletedBookings: builder.query({
      query: (params) => ({
        url: "/getCompletedBookings",
        params,
      }),
      providesTags: ["Booking"],
    }),

    updateBookingStatus: builder.mutation({
      async queryFn({
        bookingId,
        newStatus,
        cancellationReason,
        cancellationDetails,
        comment,
        recommendation,
        diagnosis,
        prescriptions,
      }) {
        try {
          const { doc, getDoc, updateDoc, serverTimestamp } = await import(
            "firebase/firestore"
          );
          const { db } = await import("@/lib/firebase");

          const bookingDocRef = doc(db, "Bookings", bookingId);

          // First, get the booking to retrieve the doctorId
          const bookingSnapshot = await getDoc(bookingDocRef);
          const bookingData = bookingSnapshot.data();
          const doctorId = bookingData?.doctorId;

          // Prepare update data
          const updateData: any = { bookingStatus: newStatus };

          // If cancelling, add cancellation details
          if (newStatus === "Cancelled") {
            updateData.cancellationReason =
              cancellationReason || "No reason provided";
            updateData.cancellationDetails = cancellationDetails || "";
            updateData.cancelledAt = serverTimestamp();
            updateData.cancelledBy = "doctor"; // or get from auth context
          }

          // Add comment and recommendation if provided
          if (comment !== undefined) {
            updateData.doctorComment = comment;
            updateData.consultationNote = comment; // Keep consultationNote in sync
          }
          if (recommendation !== undefined) {
            updateData.doctorRecommendation = recommendation;
          }
          if (diagnosis !== undefined) {
            updateData.diagnosis = diagnosis;
          }
          if (prescriptions !== undefined) {
            updateData.prescriptions = prescriptions;
          }

          // Always update the updatedAt timestamp
          updateData.updatedAt = serverTimestamp();

          await updateDoc(bookingDocRef, updateData);

          return { data: { success: true, bookingId, newStatus, doctorId } };
        } catch (error) {
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
      invalidatesTags: (result, error, { bookingId }) => {
        const tags: any[] = [
          { type: "Booking", id: bookingId },
          { type: "Booking", id: "LIST" },
        ];

        // Also invalidate the doctor's specific booking list if we have the doctorId
        if (result?.doctorId) {
          tags.push({ type: "Booking", id: result.doctorId });
        }

        return tags;
      },
    }),

    rescheduleBooking: builder.mutation({
      query: (rescheduleData) => ({
        url: "/rescheduleBooking",
        method: "PUT",
        body: rescheduleData,
      }),
      invalidatesTags: ["Booking"],
    }),

    cancelAppointment: builder.mutation({
      query: (cancellationData) => ({
        url: "/cancelAppointment",
        method: "PUT",
        body: cancellationData,
      }),
      invalidatesTags: ["Booking", "Appointment"],
    }),

    respondToBooking: builder.mutation({
      query: (responseData) => ({
        url: "/respondToBooking",
        method: "PUT",
        body: responseData,
      }),
      invalidatesTags: ["Booking"],
    }),

    checkBookingEligibility: builder.query({
      query: (params) => ({
        url: "/checkBookingEligibility",
        params,
      }),
    }),

    // Create doctor appointment booking
    createDoctorAppointment: builder.mutation({
      query: ({ patientId, doctorId, bookingData }) => ({
        url: `/bookDoctorAppointment/${patientId}/${doctorId}`,
        method: "POST",
        body: bookingData,
      }),
      invalidatesTags: ["Booking", "Appointment"],
    }),
  }),
});

export const {
  useGetFirebaseBookingsQuery,
  useBookDoctorAppointmentMutation,
  useGetBookingsQuery,
  useGetBookingsByUserIdQuery,
  useGetBookingsByDoctorIdQuery,
  useGetBookingByIdQuery,
  useGetPendingBookingsQuery,
  useGetCompletedBookingsQuery,
  useUpdateBookingStatusMutation,
  useRescheduleBookingMutation,
  useCancelAppointmentMutation,
  useRespondToBookingMutation,
  useCheckBookingEligibilityQuery,
  useCreateDoctorAppointmentMutation,
} = bookingApi;


