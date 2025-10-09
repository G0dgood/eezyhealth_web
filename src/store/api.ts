import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl:
      process.env.NODE_ENV === "development"
        ? "/api" // Use local proxy in development
        : process.env.NEXT_PUBLIC_FIREBASE_CLOUD_FUNCTIONS_URL,
    prepareHeaders: (headers) => {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: [
    "Booking",
    "Appointment",
    "Patient",
    "Payment",
    "User",
    "Doctor",
    "Upload",
    "Survey",
    "BookingCancellation",
    "DoctorOfTheMonth",
    "Specialization",
  ],
  endpoints: (builder) => ({
    // ===== AUTHENTICATION & USER MANAGEMENT =====
    generateTokenForUser: builder.mutation({
      query: (credentials) => ({
        url: "/generateTokenForUser",
        method: "POST",
        body: credentials,
      }),
    }),

    createUser: builder.mutation({
      query: (userData) => ({
        url: "/createUser",
        method: "POST",
        body: userData,
      }),
      invalidatesTags: ["User"],
    }),

    getUserById: builder.query({
      query: (userId) => ({
        url: "/getUserById",
        params: { userId },
      }),
      providesTags: (result, error, userId) => [{ type: "User", id: userId }],
    }),

    updateUser: builder.mutation({
      query: ({ userId, ...userData }) => ({
        url: "/updateUser",
        method: "PUT",
        body: { userId, ...userData },
      }),
      invalidatesTags: (result, error, { userId }) => [
        { type: "User", id: userId },
      ],
    }),

    getUsers: builder.query({
      query: (params) => ({
        url: "/getUsers",
        params,
      }),
      providesTags: ["User"],
    }),

    getUsersByRole: builder.query({
      query: (role) => ({
        url: "/getUsersByRole",
        params: { role },
      }),
      providesTags: ["User"],
    }),

    emailVerification: builder.mutation({
      query: (emailData) => ({
        url: "/emailVerification",
        method: "POST",
        body: emailData,
      }),
    }),

    sendPasswordResetLink: builder.mutation({
      query: (emailData) => ({
        url: "/sendPasswordResetLink",
        method: "POST",
        body: emailData,
      }),
    }),

    sendWelcomeEmail: builder.mutation({
      query: (emailData) => ({
        url: "/sendWelcomeEmail",
        method: "POST",
        body: emailData,
      }),
    }),

    getProfileImageUrl: builder.query({
      query: (userId) => ({
        url: "/getProfileImageUrl",
        params: { userId },
      }),
      providesTags: (result, error, userId) => [{ type: "User", id: userId }],
    }),

    // ===== DOCTOR MANAGEMENT =====
    createDoctor: builder.mutation({
      query: (doctorData) => ({
        url: "/createDoctor",
        method: "POST",
        body: doctorData,
      }),
      invalidatesTags: ["Doctor"],
    }),

    getDoctorById: builder.query({
      query: (doctorId) => ({
        url: "/getDoctorById",
        params: { doctorId },
      }),
      providesTags: (result, error, doctorId) => [
        { type: "Doctor", id: doctorId },
      ],
    }),

    updateDoctor: builder.mutation({
      query: ({ doctorId, ...doctorData }) => ({
        url: "/updateDoctor",
        method: "PUT",
        body: { doctorId, ...doctorData },
      }),
      invalidatesTags: (result, error, { doctorId }) => [
        { type: "Doctor", id: doctorId },
      ],
    }),

    getDoctors: builder.query({
      query: (params) => ({
        url: "/getDoctors",
        params,
      }),
      providesTags: ["Doctor"],
    }),

    getActiveDoctors: builder.query({
      query: (params) => ({
        url: "/getActiveDoctors",
        params,
      }),
      providesTags: ["Doctor"],
    }),

    getDoctorsBySpecialization: builder.query({
      query: (specialization) => ({
        url: "/getDoctorsBySpecialization",
        params: { specialization },
      }),
      providesTags: ["Doctor"],
    }),

    getDoctorsBySpecializationCount: builder.query({
      query: (params) => ({
        url: "/getDoctorsBySpecializationCount",
        params,
      }),
      providesTags: ["Doctor"],
    }),

    updateDoctorAvailability: builder.mutation({
      query: ({ doctorId, availability }) => ({
        url: "/updateDoctorAvailability",
        method: "PUT",
        body: { doctorId, availability },
      }),
      invalidatesTags: (result, error, { doctorId }) => [
        { type: "Doctor", id: doctorId },
      ],
    }),

    rateDoctor: builder.mutation({
      query: (ratingData) => ({
        url: "/rateDoctor",
        method: "POST",
        body: ratingData,
      }),
      invalidatesTags: ["Doctor"],
    }),

    // ===== PATIENT MANAGEMENT =====
    createPatientProfile: builder.mutation({
      query: (patientData) => ({
        url: "/createPatientProfile",
        method: "POST",
        body: patientData,
      }),
      invalidatesTags: ["Patient"],
    }),

    getPatientProfile: builder.query({
      query: (patientId) => ({
        url: "/getPatientProfile",
        params: { patientId },
      }),
      providesTags: (result, error, patientId) => [
        { type: "Patient", id: patientId },
      ],
    }),

    updatePatientProfile: builder.mutation({
      query: ({ patientId, ...patientData }) => ({
        url: "/updatePatientProfile",
        method: "PUT",
        body: { patientId, ...patientData },
      }),
      invalidatesTags: (result, error, { patientId }) => [
        { type: "Patient", id: patientId },
      ],
    }),

    getAllPatientProfiles: builder.query({
      query: (params) => ({
        url: "/getAllPatientProfiles",
        params,
      }),
      providesTags: ["Patient"],
    }),

    getPatientVitalsByDoctorId: builder.query({
      query: (doctorId) => ({
        url: "/getPatientVitalsByDoctorId",
        params: { doctorId },
      }),
      providesTags: ["Patient"],
    }),

    getFirebaseUsers: builder.query({
      async queryFn() {
        try {
          const { createFirebaseQuery } = await import("@/lib/firebase-rtk");
          const usersData = await createFirebaseQuery("users");
          return { data: usersData };
        } catch (error) {
          console.error("Error fetching Firebase users:", error);
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
      providesTags: ["User"],
    }),

    // Firebase-powered patient query
    getFirebasePatients: builder.query({
      async queryFn() {
        try {
          const { createFirebaseQuery, firebaseConstraints } = await import(
            "@/lib/firebase-rtk"
          );

          const patientsData = await createFirebaseQuery("users", [
            firebaseConstraints.where("role", "==", "PATIENT"),
          ]);

          return { data: patientsData };
        } catch (error) {
          console.error("Error fetching Firebase patients:", error);
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
      providesTags: ["Patient"],
    }),

    // Firebase-powered doctors query
    getFirebaseDoctors: builder.query({
      async queryFn() {
        try {
          const { createFirebaseQuery, firebaseConstraints } = await import(
            "@/lib/firebase-rtk"
          );

          // First try to get doctors ordered by rating (if rating field exists)
          let doctorsData;
          try {
            doctorsData = await createFirebaseQuery("users", [
              firebaseConstraints.where("role", "==", "DOCTOR"),
              firebaseConstraints.orderBy("rating", "desc"),
            ]);
          } catch {
            // If rating field doesn't exist or causes an error, get all doctors without ordering
            console.log(
              "Rating field not available, fetching all doctors without ordering"
            );
            doctorsData = await createFirebaseQuery("users", [
              firebaseConstraints.where("role", "==", "DOCTOR"),
            ]);
          }

          console.log("Fetched doctors data:", doctorsData);
          return { data: doctorsData };
        } catch (error) {
          console.error("Error fetching Firebase doctors:", error);
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
      providesTags: ["Doctor"],
    }),

    // Firebase-powered doctor profiles query
    getFirebaseDoctorProfiles: builder.query({
      async queryFn() {
        try {
          const { createFirebaseQuery } = await import("@/lib/firebase-rtk");

          const doctorsData = await createFirebaseQuery("doctorProfiles");

          return { data: doctorsData };
        } catch (error) {
          console.error("Error fetching Firebase doctor profiles:", error);
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
      providesTags: ["Doctor"],
    }),

    // Firebase-powered single doctor profile query
    getFirebaseDoctorProfileById: builder.query({
      async queryFn(doctorId: string) {
        try {
          const { collection, query, where, getDocs } = await import(
            "firebase/firestore"
          );
          const { db } = await import("@/lib/firebase");

          const doctorCollectionRef = collection(db, "doctorProfiles");
          const q = query(
            doctorCollectionRef,
            where("doctorId", "==", doctorId)
          );
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            // Get the first matching document
            const doc = querySnapshot.docs[0];
            const data = doc.data();
            // Serialize the data to handle Firestore Timestamps
            const serializedData = Object.entries(data).reduce(
              (acc, [key, value]) => {
                if (
                  value &&
                  typeof value === "object" &&
                  "toDate" in value &&
                  typeof value.toDate === "function"
                ) {
                  acc[key] = value.toDate().toISOString();
                } else {
                  acc[key] = value;
                }
                return acc;
              },
              {} as Record<string, unknown>
            );

            return { data: { id: doc.id, ...serializedData } };
          } else {
            return {
              error: {
                status: 404,
                data: "Doctor not found",
              },
            };
          }
        } catch (error) {
          console.error("Error fetching Firebase doctor profile:", error);
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
        { type: "Doctor", id: doctorId },
      ],
    }),

    // Firebase-powered doctor availability management
    getDoctorAvailability: builder.query({
      async queryFn(doctorId: string) {
        try {
          const { getDoctorDetails } = await import("@/lib/availability");
          const data = await getDoctorDetails(doctorId);
          return { data };
        } catch (error) {
          console.error("Error fetching doctor availability:", error);
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
        { type: "Doctor", id: doctorId },
      ],
    }),

    saveDoctorAvailability: builder.mutation({
      async queryFn({
        doctorId,
        selectedSlots,
      }: {
        doctorId: string;
        selectedSlots: Record<string, unknown>;
      }) {
        try {
          const { saveAvailability } = await import("@/lib/availability");
          await saveAvailability(doctorId, selectedSlots);
          return { data: { success: true } };
        } catch (error) {
          console.error("Error saving doctor availability:", error);
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
      invalidatesTags: (result, error, { doctorId }) => [
        { type: "Doctor", id: doctorId },
      ],
    }),

    // Firebase-powered doctor of the month query
    getFirebaseDoctorOfTheMonth: builder.query({
      async queryFn() {
        try {
          const { createFirebaseQuery, firebaseConstraints } = await import(
            "@/lib/firebase-rtk"
          );

          const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
          const doctorData = await createFirebaseQuery("doctors", [
            firebaseConstraints.where("awardMonth", "==", currentMonth),
            firebaseConstraints.where("isDoctorOfMonth", "==", true),
            firebaseConstraints.limit(1),
          ]);

          return { data: doctorData[0] || null };
        } catch (error) {
          console.error("Error fetching Firebase doctor of the month:", error);
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
      providesTags: ["DoctorOfTheMonth"],
    }),

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

    // ===== BOOKING CANCELLATION =====
    getBookingCancellations: builder.query({
      async queryFn() {
        try {
          const { collection, query, where, getDocs } = await import(
            "firebase/firestore"
          );
          const { db } = await import("@/lib/firebase");

          const bookingsCollectionRef = collection(db, "Bookings");

          // Create a query to filter documents where:
          // - cancellationRequest exists (not null)
          const bookingsQuery = query(
            bookingsCollectionRef,
            where("cancellationRequest", "!=", null)
          );

          // Fetch the documents that match the query
          const snapshot = await getDocs(bookingsQuery);

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
            "Error fetching Firebase cancellation requests:",
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

          // Try to query from a dedicated cancellation requests collection first
          try {
            const cancellationsCollectionRef = collection(
              db,
              "CancellationRequests"
            );
            const cancellationsQuery = query(
              cancellationsCollectionRef,
              where("doctorId", "==", doctorId)
            );

            const snapshot = await getDocs(cancellationsQuery);

            if (!snapshot.empty) {
              const cancellationsData = snapshot.docs.map((doc) => {
                // Recursive function to convert Firebase timestamps
                const convertTimestamps = (obj: unknown): unknown => {
                  if (obj === null || obj === undefined) return obj;

                  if (
                    obj &&
                    typeof obj === "object" &&
                    "toDate" in obj &&
                    typeof obj.toDate === "function"
                  ) {
                    // It's a Firebase timestamp
                    return obj.toDate().toISOString();
                  }

                  if (Array.isArray(obj)) {
                    return obj.map(convertTimestamps);
                  }

                  if (typeof obj === "object" && obj !== null) {
                    const converted: Record<string, unknown> = {};
                    Object.keys(obj).forEach((key) => {
                      converted[key] = convertTimestamps(
                        (obj as Record<string, unknown>)[key]
                      );
                    });
                    return converted;
                  }

                  return obj;
                };

                return {
                  id: doc.id,
                  ...(convertTimestamps(doc.data()) as Record<string, unknown>),
                };
              });

              return { data: cancellationsData };
            }
          } catch {
            console.log(
              "CancellationRequests collection not found, trying Bookings collection..."
            );
          }

          // Fallback: Query Bookings collection by doctorId only (no index required)
          const bookingsCollectionRef = collection(db, "Bookings");
          const bookingsQuery = query(
            bookingsCollectionRef,
            where("doctorId", "==", doctorId)
          );

          const snapshot = await getDocs(bookingsQuery);

          const firebaseRtk = await import("@/lib/firebase-rtk");
          const serializeFirebaseData = firebaseRtk.serializeFirebaseData;

          const allBookingsData = snapshot.docs.map((doc) => {
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

          // Filter for bookings that have cancellation requests
          const cancellationsData = allBookingsData.filter((booking) => {
            const bookingData = booking as Record<string, unknown>;
            return (
              bookingData.cancellationRequest &&
              bookingData.cancellationRequest !== null &&
              typeof bookingData.cancellationRequest === "object"
            );
          });

          return { data: cancellationsData };
        } catch (error) {
          console.error(
            "Error fetching Firebase cancellation requests:",
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

    // ===== SURVEYS & COMMENTS =====
    submitSurvey: builder.mutation({
      query: (surveyData) => ({
        url: "/submitSurvey",
        method: "POST",
        body: surveyData,
      }),
      invalidatesTags: ["Survey"],
    }),

    makeComment: builder.mutation({
      query: (commentData) => ({
        url: "/makeComment",
        method: "POST",
        body: commentData,
      }),
    }),

    // ===== DOCUMENT & UPLOAD MANAGEMENT =====
    getUploads: builder.query({
      query: (params) => ({
        url: "/getUploads",
        params,
      }),
      providesTags: ["Upload"],
    }),

    updateUploadStatus: builder.mutation({
      async queryFn({ uploadId, doctorId, name, downloadUrl, status, comment, reviewedBy }) {
        try {
          const { doc, updateDoc, serverTimestamp, collection, query, where, getDocs } = await import("firebase/firestore");
          const { db } = await import("@/lib/firebase");

          // Try to update by ID first
          if (uploadId && uploadId.trim() !== "") {
            try {
              const docRef = doc(db, "uploads", uploadId);

              await updateDoc(docRef, {
                status,
                comment: comment.trim(),
                reviewedBy,
                reviewedAt: serverTimestamp(),
              });

              return { data: { success: true, message: `Document ${status} successfully.` } };
            } catch (idError: any) {
              console.warn("Failed to update by ID, trying query method:", idError);
            }
          }

          // Fallback: Query by doctorId and name (or other unique combination)
          const uploadsRef = collection(db, "uploads");
          const q = query(
            uploadsRef,
            where("doctorId", "==", doctorId),
            where("name", "==", name),
            where("downloadUrl", "==", downloadUrl)
          );

          const querySnapshot = await getDocs(q);

          if (querySnapshot.empty) {
            return {
              error: {
                status: "NOT_FOUND",
                error: "Document not found in database.",
              },
            };
          }

          if (querySnapshot.size > 1) {
            console.warn("Multiple matching documents found, updating the first one");
          }

          // Update the first (or only) matching document
          const docToUpdate = querySnapshot.docs[0];

          await updateDoc(docToUpdate.ref, {
            status,
            comment: comment.trim(),
            reviewedBy,
            reviewedAt: serverTimestamp(),
          });

          return { data: { success: true, message: `Document ${status} successfully.` } };
        } catch (error: any) {
          console.error("Error updating document status:", error);
          
          return {
            error: {
              status: error?.code || "CUSTOM_ERROR",
              error: error?.message || "Failed to update document",
            },
          };
        }
      },
      invalidatesTags: ["Upload"],
    }),

    // ===== ADMIN DASHBOARD =====
    getAdminDashboard: builder.query({
      query: (params) => ({
        url: "/getAdminDashboard",
        params,
      }),
    }),

    // ===== DOCTOR OF THE MONTH =====
    triggerDoctorOfTheMonth: builder.mutation({
      query: () => ({
        url: "/triggerDoctorOfTheMonth",
        method: "POST",
      }),
      invalidatesTags: ["Doctor"],
    }),

    // ===== TRIGGERED FUNCTIONS =====
    triggerSendAppointmentReminder: builder.mutation({
      query: () => ({
        url: "/triggerSendAppointmentReminder",
        method: "POST",
      }),
    }),

    // ===== SPECIALIZATION MANAGEMENT =====
    getSpecializations: builder.query({
      async queryFn() {
        try {
          const { createFirebaseQuery } = await import("@/lib/firebase-rtk");

          const specializationsData = await createFirebaseQuery(
            "specialization"
          );

          return { data: specializationsData };
        } catch (error) {
          console.error("Error fetching Firebase specializations:", error);
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
      providesTags: ["Specialization"],
    }),

    createSpecialization: builder.mutation({
      async queryFn(specializationData) {
        try {
          const { createFirebaseDocument } = await import("@/lib/firebase-rtk");

          const result = await createFirebaseDocument(
            "specialization",
            specializationData
          );

          return { data: result };
        } catch (error) {
          console.error("Error creating specialization:", error);
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
      invalidatesTags: ["Specialization"],
    }),

    updateSpecialization: builder.mutation({
      async queryFn({ id, ...specializationData }) {
        try {
          const { updateFirebaseDocument } = await import("@/lib/firebase-rtk");

          await updateFirebaseDocument(
            "specialization",
            id,
            specializationData
          );

          return { data: { id, ...specializationData } };
        } catch (error) {
          console.error("Error updating specialization:", error);
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
      invalidatesTags: ["Specialization"],
    }),

    deleteSpecialization: builder.mutation({
      async queryFn(id) {
        try {
          const { deleteFirebaseDocument } = await import("@/lib/firebase-rtk");

          await deleteFirebaseDocument("specialization", id);

          return { data: { id } };
        } catch (error) {
          console.error("Error deleting specialization:", error);
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
      invalidatesTags: ["Specialization"],
    }),

    // ===== PAYMENTS MANAGEMENT =====
    getPayments: builder.query({
      async queryFn({ limit: limitCount = 10 }) {
        try {
          const { createFirebaseQuery, firebaseConstraints } = await import(
            "@/lib/firebase-rtk"
          );

          const paymentsData = await createFirebaseQuery("payments", [
            firebaseConstraints.limit(limitCount),
          ]);

          return { data: paymentsData };
        } catch (error) {
          console.error("Error fetching Firebase payments:", error);
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
      providesTags: ["Payment"],
    }),

    getPaymentsByDoctorId: builder.query({
      async queryFn({ doctorId }) {
        try {
          const { createFirebaseQuery, firebaseConstraints } = await import(
            "@/lib/firebase-rtk"
          );

          const paymentsData = await createFirebaseQuery("payments", [
            firebaseConstraints.where("doctorId", "==", String(doctorId)),
          ]);

          if (paymentsData.length === 0) {
            return {
              data: [],
              message: "No Payment found for this user.",
            };
          }

          return { data: paymentsData };
        } catch (error) {
          console.error("Error fetching payments by doctor ID:", error);
          return {
            error: {
              status: "FETCH_ERROR",
              error:
                error instanceof Error
                  ? error.message
                  : "An error occurred while retrieving Payment.",
            },
          };
        }
      },
      providesTags: (result, error, { doctorId }) => [
        { type: "Payment", id: doctorId },
      ],
    }),

    createPayment: builder.mutation({
      async queryFn(paymentData) {
        try {
          const { createFirebaseDocument } = await import("@/lib/firebase-rtk");

          const result = await createFirebaseDocument("payments", paymentData);

          return { data: result };
        } catch (error) {
          console.error("Error creating payment:", error);
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
      invalidatesTags: ["Payment"],
    }),

    updatePayment: builder.mutation({
      async queryFn({ id, ...paymentData }) {
        try {
          const { updateFirebaseDocument } = await import("@/lib/firebase-rtk");
          await updateFirebaseDocument("payments", id, paymentData);
          return { data: { id, ...paymentData } };
        } catch (error) {
          console.error("Error updating payment:", error);
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
      invalidatesTags: ["Payment"],
    }),

    deletePayment: builder.mutation({
      async queryFn(id) {
        try {
          const { deleteFirebaseDocument } = await import("@/lib/firebase-rtk");
          await deleteFirebaseDocument("payments", id);
          return { data: { id } };
        } catch (error) {
          console.error("Error deleting payment:", error);
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
      invalidatesTags: ["Payment"],
    }),
  }),
});

// Export all hooks
export const {
  // Authentication & User Management
  useGenerateTokenForUserMutation,
  useCreateUserMutation,
  useGetUserByIdQuery,
  useUpdateUserMutation,
  useGetUsersQuery,
  useGetUsersByRoleQuery,
  useEmailVerificationMutation,
  useSendPasswordResetLinkMutation,
  useSendWelcomeEmailMutation,
  useGetProfileImageUrlQuery,

  // Doctor Management
  useCreateDoctorMutation,
  useGetDoctorByIdQuery,
  useUpdateDoctorMutation,
  useGetDoctorsQuery,
  useGetActiveDoctorsQuery,
  useGetDoctorsBySpecializationQuery,
  useGetDoctorsBySpecializationCountQuery,
  useUpdateDoctorAvailabilityMutation,
  useGetDoctorAvailabilityQuery,
  useSaveDoctorAvailabilityMutation,
  useRateDoctorMutation,

  // Patient Management
  useCreatePatientProfileMutation,
  useGetPatientProfileQuery,
  useUpdatePatientProfileMutation,
  useGetAllPatientProfilesQuery,
  useGetPatientVitalsByDoctorIdQuery,
  useGetFirebasePatientsQuery,
  useGetFirebaseDoctorsQuery,
  useGetFirebaseDoctorProfilesQuery,
  useGetFirebaseDoctorProfileByIdQuery,
  useGetFirebaseDoctorOfTheMonthQuery,
  useGetFirebaseBookingsQuery,

  // Booking & Appointment Management
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

  // Booking Cancellation
  useGetBookingCancellationsQuery,
  useGetBookingCancellationsByDoctorIdQuery,
  useBookingCancellationRequestMutation,
  useRespondToCancellationRequestMutation,

  // Payment Management
  useGetPaymentsQuery,
  useGetPaymentsByDoctorIdQuery,
  useCreatePaymentMutation,
  useUpdatePaymentMutation,
  useDeletePaymentMutation,

  // Surveys & Comments
  useSubmitSurveyMutation,
  useMakeCommentMutation,

  // Document & Upload Management
  useGetUploadsQuery,
  useUpdateUploadStatusMutation,

  // Admin Dashboard
  useGetAdminDashboardQuery,

  // Doctor of the Month
  useTriggerDoctorOfTheMonthMutation,

  // Triggered Functions
  useTriggerSendAppointmentReminderMutation,

  // Specialization Management
  useGetSpecializationsQuery,
  useCreateSpecializationMutation,
  useUpdateSpecializationMutation,
  useDeleteSpecializationMutation,
  useGetFirebaseUsersQuery,
} = api;
