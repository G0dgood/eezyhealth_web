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

          const bookingsData = await createFirebaseQuery("Bookings", [
            firebaseConstraints.orderBy("createdTime", "desc"),
          ]);

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

          const bookingsCollectionRef = collection(db, "Bookings");
          const q = query(
            bookingsCollectionRef,
            where("doctorId", "==", doctorId)
          );
          const snapshot = await getDocs(q);

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
      query: ({ bookingId, status }) => ({
        url: "/updateBookingStatus",
        method: "PUT",
        body: { bookingId, status },
      }),
      invalidatesTags: (result, error, { bookingId }) => [
        { type: "Booking", id: bookingId },
      ],
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


