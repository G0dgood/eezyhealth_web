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
          }

          // If empty or failed, try 'bookings'
          if (!bookingsData || bookingsData.length === 0) {
             try {
                const fallbackData = await createFirebaseQuery("bookings", []);
                if (fallbackData && fallbackData.length > 0) {
                   bookingsData = fallbackData;
                }
             } catch (e) { 
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
      transformResponse: (response: any[], meta, arg: any) => {
        if (!arg || (!arg.page && !arg.limit)) {
          return response;
        }

        const { page = 1, limit = 10, search = "" } = arg;
        let result = response || [];

        // Apply filters
        if (search) {
          const s = search.toLowerCase();
          result = result.filter(
            (b: any) =>
              b.patientName?.toLowerCase().includes(s) ||
              b.doctorName?.toLowerCase().includes(s) ||
              b.bookingStatus?.toLowerCase().includes(s) ||
              b.bookingChannel?.toLowerCase().includes(s) ||
              b.specialization?.toLowerCase().includes(s)
          );
        }

        const totalCount = result.length;
        const startIndex = (page - 1) * limit;
        const sliced = result.slice(startIndex, startIndex + limit);

        // Attach properties
        const paginatedResult = [...sliced] as any;
        paginatedResult.totalCount = totalCount;
        paginatedResult.totalPages = Math.ceil(totalCount / limit);
        return paginatedResult;
      },
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

    // Paid-but-not-yet-confirmed bookings (mobile recovery layer). These are
    // appointments the patient paid for but whose booking creation failed.
    // Staff (admin/nurse/doctor) view these so they can follow up / reconcile.
    getPaidPendingBookings: builder.query({
      async queryFn() {
        try {
          const { createFirebaseQuery, firebaseConstraints } = await import(
            "@/lib/firebase-rtk"
          );
          const data = await createFirebaseQuery("pendingBookings", [
            firebaseConstraints.where("status", "==", "pending"),
          ]);
          const sorted = (data || []).sort((a: any, b: any) => {
            const at = new Date((a.createdAt as string) || 0).getTime();
            const bt = new Date((b.createdAt as string) || 0).getTime();
            return bt - at;
          });
          return { data: sorted };
        } catch (error) {
          return {
            error: {
              status: 500,
              data:
                error instanceof Error ? error.message : "Unknown error",
            },
          };
        }
      },
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
        newSlot,
        newBookingDate,
        actor,
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
          const performedBy = actor || "doctor";

          // If cancelling, add cancellation details
          if (newStatus === "Cancelled") {
            updateData.cancellationReason =
              cancellationReason || "No reason provided";
            updateData.cancellationDetails = cancellationDetails || "";
            updateData.cancelledAt = serverTimestamp();
            updateData.cancelledBy = performedBy;
          }

          // If rescheduling, move the appointment to the new slot/date and
          // keep a record of where it came from. All three dashboards
          // (doctor, nurse, admin) read this same Bookings document, so the
          // "Rescheduled" status and new time reflect everywhere.
          if (newStatus === "Rescheduled") {
            if (newBookingDate !== undefined && newBookingDate !== null) {
              updateData.previousBookingDate = bookingData?.bookingDate ?? null;
              updateData.bookingDate = newBookingDate;
            }
            if (newSlot !== undefined && newSlot !== null && newSlot !== "") {
              updateData.previousSlot = bookingData?.slot ?? null;
              updateData.slot = newSlot;
            }
            updateData.rescheduledAt = serverTimestamp();
            updateData.rescheduledBy = performedBy;
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
      async queryFn({ patientId, doctorId, bookingData }, _api, _extraOptions, baseQuery) {
        try {
          const result = await baseQuery({
            url: `/bookDoctorAppointment/${patientId}/${doctorId}`,
            method: "POST",
            body: bookingData,
          });

          if (result.error) {
            return { error: result.error };
          }

          const responseData = result.data as any;

          // Create notification in Firestore synchronously
          try {
            const { collection, addDoc, serverTimestamp } = await import("firebase/firestore");
            const { db } = await import("@/lib/firebase");

            const patientName =
              bookingData.patientName ||
              bookingData.patientDisplayName ||
              bookingData.patientFullName ||
              "A patient";

            // Readable date / slot info
            const timeLabel = bookingData.slot || "";
            const dateStr = bookingData.bookingDate || "";
            const whenText = [dateStr, timeLabel].filter(Boolean).join(" at ");
            const description = whenText
              ? `${patientName} booked an appointment on ${whenText}.`
              : `${patientName} booked an appointment.`;

            // Create notification doc for doctor (which nurse also sees via the global feed)
            await addDoc(collection(db, "notifications"), {
              userId: doctorId,
              patientId: null,
              doctorId: doctorId,
              title: "New Appointment Booked",
              description,
              type: "appointment_booking",
              isRead: false,
              isReadByNurse: false,
              isReadByAdmin: false,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
              deleted: false,
              deletedByNurse: false,
              deletedByAdmin: false,
              data: {
                type: "appointment_booking",
                bookingId: responseData?.bookingId || null,
                patientId: patientId,
                patientName,
                slot: bookingData.slot || null,
              },
            });

            // Notify patient too
            if (patientId) {
              const doctorName = bookingData.doctorName || "your doctor";
              const patientDescription = whenText
                ? `Your appointment with ${doctorName} is booked for ${whenText}. We'll let you know once it's confirmed.`
                : `Your appointment with ${doctorName} has been booked. We'll let you know once it's confirmed.`;

              await addDoc(collection(db, "notifications"), {
                userId: patientId,
                patientId: patientId,
                doctorId: null,
                title: "Appointment Booked",
                description: patientDescription,
                type: "appointment_booking",
                isRead: false,
                isReadByNurse: false,
                isReadByAdmin: false,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                deleted: false,
                deletedByNurse: false,
                deletedByAdmin: false,
                data: {
                  type: "appointment_booking",
                  bookingId: responseData?.bookingId || null,
                  doctorId: doctorId,
                  slot: bookingData.slot || null,
                },
              });
            }
          } catch (notifErr) {
            console.error("Failed to create booking notifications:", notifErr);
          }

          return { data: responseData };
        } catch (error) {
          return {
            error: {
              status: "FETCH_ERROR",
              error: error instanceof Error ? error.message : "Unknown error",
            },
          };
        }
      },
      invalidatesTags: ["Booking", "Appointment"],
    }),

    getLatestBookingsForMessages: builder.query({
      async queryFn({ userId, doctorId }: { userId?: string; doctorId?: string } = {}) {
        try {
          const { createFirebaseQuery, firebaseConstraints } = await import(
            "@/lib/firebase-rtk"
          );

          const constraints: any[] = [];
          if (userId) {
            constraints.push(firebaseConstraints.where("userId", "==", userId));
          }
          if (doctorId) {
            constraints.push(firebaseConstraints.where("doctorId", "==", doctorId));
          }

          let bookings: any[] = [];
          try {
            bookings = await createFirebaseQuery("Bookings", constraints);
          } catch (e) {
            try {
              bookings = await createFirebaseQuery("bookings", constraints);
            } catch (fallbackErr) {}
          }

          const toMillis = (t: any) => {
            if (!t) return 0;
            if (typeof t === "string") return new Date(t).getTime() || 0;
            if (typeof t === "number") return t;
            if (typeof t === "object") {
              if (typeof t.toDate === "function") return t.toDate().getTime();
              if (typeof t.seconds === "number") return t.seconds * 1000;
              if (typeof t._seconds === "number") return t._seconds * 1000;
            }
            return 0;
          };

          const latestMap = new Map();
          bookings.forEach((booking: any) => {
            let groupKey = "";
            if (userId && !doctorId) {
              groupKey = booking.doctorId;
            } else if (doctorId && !userId) {
              groupKey = booking.userId;
            } else {
              groupKey = `${booking.userId}-${booking.doctorId}`;
            }

            if (!groupKey || !booking.userId || !booking.doctorId) {
              return;
            }

            const existing = latestMap.get(groupKey);
            const bookingTime = toMillis(booking.createdAt || booking.createdTime || booking.bookingDate);

            if (!existing) {
              latestMap.set(groupKey, { booking, time: bookingTime });
            } else {
              if (bookingTime > existing.time) {
                latestMap.set(groupKey, { booking, time: bookingTime });
              }
            }
          });

          const resultBookings = Array.from(latestMap.values())
            .map((item: any) => item.booking)
            .sort((a: any, b: any) => {
              const timeA = toMillis(a.createdAt || a.createdTime || a.bookingDate);
              const timeB = toMillis(b.createdAt || b.createdTime || b.bookingDate);
              return timeB - timeA;
            });

          return { data: resultBookings };
        } catch (error) {
          console.error("Error in getLatestBookingsForMessages queryFn:", error);
          return {
            error: {
              status: 500,
              data: error instanceof Error ? error.message : "Failed to load bookings",
            },
          };
        }
      },
      providesTags: ["Booking"],
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
  useGetPaidPendingBookingsQuery,
  useGetCompletedBookingsQuery,
  useUpdateBookingStatusMutation,
  useRescheduleBookingMutation,
  useCancelAppointmentMutation,
  useRespondToBookingMutation,
  useCheckBookingEligibilityQuery,
  useCreateDoctorAppointmentMutation,
  useGetLatestBookingsForMessagesQuery,
} = bookingApi;


