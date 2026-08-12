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
    "Nurse",
    "Upload",
    "AuditLog",
    "Notification",
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
      async queryFn({ userId, ...userData }) {
        try {
          const { updateFirebaseDocument, getFirebaseInstance } = await import(
            "@/lib/firebase-rtk"
          );
          const { collection, query, where, getDocs, updateDoc } = await import(
            "firebase/firestore"
          );

          // 1. Update users collection (Always)
          await updateFirebaseDocument("users", userId, userData);

          // 2. Handle Role Specific Updates
          const db = getFirebaseInstance();
          const role = userData.role;

          if (role === "nurse") {
            // Update nurseProfiles
            const q = query(
              collection(db, "nurseProfiles"),
              where("nurseId", "==", userId)
            );
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
              const updatePromises = querySnapshot.docs.map((doc) =>
                updateDoc(doc.ref, userData)
              );
              await Promise.all(updatePromises);
            }
          } else if (role === "doctor") {
            // Update doctorProfiles
            const q = query(
              collection(db, "doctorProfiles"),
              where("doctorId", "==", userId)
            );
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
              const updatePromises = querySnapshot.docs.map((doc) =>
                updateDoc(doc.ref, userData)
              );
              await Promise.all(updatePromises);
            }
          }

          return { data: { userId, ...userData } };
        } catch (error) {
          console.error("Error updating user profile (api.ts):", error);
          return {
            error: {
              status: "CUSTOM_ERROR",
              error:
                error instanceof Error
                  ? error.message
                  : "Failed to update profile",
            },
          };
        }
      },
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

    // Counts doctors for a specialization directly against Firestore instead of
    // a never-deployed Cloud Function (which 404'd and produced a CORS error).
    getDoctorsBySpecializationCount: builder.query({
      async queryFn(arg: { specializationId?: string } = {}) {
        try {
          const specializationId = arg?.specializationId;
          if (!specializationId) return { data: { count: 0 } };

          const { collection, getDocs, query, where } = await import(
            "firebase/firestore"
          );
          const { db } = await import("@/lib/firebase");

          const snapshot = await getDocs(
            query(
              collection(db, "users"),
              where("specializationId", "==", specializationId)
            )
          );

          const count = snapshot.docs.filter((d) => {
            const role = String((d.data() as { role?: string }).role || "")
              .toLowerCase();
            return role === "doctor";
          }).length;

          return { data: { count } };
        } catch (error) {
          return {
            error: {
              status: "FETCH_ERROR",
              error:
                error instanceof Error ? error.message : "Unknown error",
            },
          };
        }
      },
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
              firebaseConstraints.where("role", "==", "doctor"),
              firebaseConstraints.orderBy("rating", "desc"),
            ]);
          } catch {
            // If rating field doesn't exist or causes an error, get all doctors without ordering
            
            doctorsData = await createFirebaseQuery("users", [
              firebaseConstraints.where("role", "==", "doctor"),
            ]);
          }

        
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

    // Firebase-powered nurse profiles query
    getFirebaseNurseProfiles: builder.query({
      async queryFn() {
        try {
          const { createFirebaseQuery, firebaseConstraints } = await import(
            "@/lib/firebase-rtk"
          );

          // Get nurse profiles from Firebase users collection where role is nurse
          let nursesData;
          try {
            nursesData = await createFirebaseQuery("users", [
              firebaseConstraints.where("role", "==", "nurse"),
              firebaseConstraints.orderBy("createdTime", "desc"),
            ]);
          } catch (error) {
            // If ordering fails, get nurses without ordering
            nursesData = await createFirebaseQuery("users", [
              firebaseConstraints.where("role", "==", "nurse"),
            ]);
          }

          return { data: nursesData };
        } catch (error) {
          console.error("Error fetching Firebase nurse profiles:", error);
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
      providesTags: ["Nurse"],
    }),


    // Doctor data verification
    verifyDoctorData: builder.query({
      async queryFn(doctorId: string) {
        try {
          const { createFirebaseQuery, firebaseConstraints } = await import("@/lib/firebase-rtk");

          const verification = {
            profile: false,
            appointments: false,
            documents: false,
            availability: false,
            analytics: false,
            notifications: false,
          };

          try {
            // Check profile accessibility
            const profile = await createFirebaseQuery("users", [
              firebaseConstraints.where("uid", "==", doctorId),
              firebaseConstraints.limit(1),
            ]);
            verification.profile = profile.length > 0;

            // Check appointments accessibility
            const appointments = await createFirebaseQuery("bookings", [
              firebaseConstraints.where("doctorId", "==", doctorId),
              firebaseConstraints.limit(1),
            ]);
            verification.appointments = true; // If query succeeds, data is accessible

            // Check documents accessibility
            const documents = await createFirebaseQuery("uploads", [
              firebaseConstraints.where("doctorId", "==", doctorId),
              firebaseConstraints.limit(1),
            ]);
            verification.documents = true;

            // Check availability accessibility
            const availability = await createFirebaseQuery("doctorAvailability", [
              firebaseConstraints.where("doctorId", "==", doctorId),
              firebaseConstraints.limit(1),
            ]);
            verification.availability = true;

            // Check analytics accessibility
            const analytics = await createFirebaseQuery("analytics", [
              firebaseConstraints.where("doctorId", "==", doctorId),
              firebaseConstraints.limit(1),
            ]);
            verification.analytics = true;

            // Check notifications accessibility
            const notifications = await createFirebaseQuery("notifications", [
              firebaseConstraints.where("doctorId", "==", doctorId),
              firebaseConstraints.limit(1),
            ]);
            verification.notifications = true;

          } catch (error) {
            console.error("Error during data verification:", error);
          }

          const isFullyAccessible = Object.values(verification).every(Boolean);

          return { 
            data: { 
              doctorId,
              verification,
              isFullyAccessible,
              timestamp: new Date().toISOString(),
            } 
          };
        } catch (error) {
          console.error("Error verifying doctor data:", error);
          return {
            error: {
              status: "FETCH_ERROR",
              error: error instanceof Error ? error.message : "Unknown error occurred",
            },
          };
        }
      },
      providesTags: ["Doctor"],
    }),

    // Get audit logs
    getAuditLogs: builder.query({
      async queryFn({ doctorId, action, limit = 50 }) {
        try {
          const { createFirebaseQuery, firebaseConstraints } = await import("@/lib/firebase-rtk");

          const queryConstraints = [];
          
          if (doctorId) {
            queryConstraints.push(firebaseConstraints.where("targetId", "==", doctorId));
          }
          
          if (action) {
            queryConstraints.push(firebaseConstraints.where("action", "==", action));
          }
          
          queryConstraints.push(firebaseConstraints.orderBy("timestamp", "desc"));
          queryConstraints.push(firebaseConstraints.limit(limit));

          const auditLogs = await createFirebaseQuery("auditLogs", queryConstraints);

          return { data: auditLogs };
        } catch (error) {
          console.error("Error fetching audit logs:", error);
          return {
            error: {
              status: "FETCH_ERROR",
              error: error instanceof Error ? error.message : "Unknown error occurred",
            },
          };
        }
      },
      providesTags: ["AuditLog"],
    }),

    // Bulk doctor operations
    bulkUpdateDoctorStatus: builder.mutation({
      async queryFn({ doctorIds, status, reason, performedBy }) {
        try {
          const { updateFirebaseDocument, createFirebaseDocument } = await import("@/lib/firebase-rtk");

          const results = [];
          
          for (const doctorId of doctorIds) {
            try {
              await updateFirebaseDocument("users", doctorId, {
                isActive: status === "active",
                ...(status === "inactive" ? {
                  deactivatedAt: new Date().toISOString(),
                  deactivationReason: reason,
                  deactivatedBy: performedBy,
                } : {
                  reactivatedAt: new Date().toISOString(),
                  reactivatedBy: performedBy,
                  deactivatedAt: "",
                  deactivationReason: "",
                }),
                updatedAt: new Date().toISOString(),
              });

              // Create audit log for each doctor
              await createFirebaseDocument("auditLogs", {
                action: status === "active" ? "doctor_reactivated" : "doctor_deactivated",
                targetId: doctorId,
                performedBy: performedBy,
                reason: reason || "",
                timestamp: new Date().toISOString(),
                details: {
                  bulkOperation: true,
                  totalDoctors: doctorIds.length,
                },
              });

              results.push({ doctorId, success: true });
            } catch (error) {
              results.push({ doctorId, success: false, error: error instanceof Error ? error.message : 'Unknown error' });
            }
          }

          return { data: { results, totalProcessed: doctorIds.length } };
        } catch (error) {
          console.error("Error in bulk doctor status update:", error);
          return {
            error: {
              status: "FETCH_ERROR",
              error: error instanceof Error ? error.message : "Unknown error occurred",
            },
          };
        }
      },
      invalidatesTags: ["Doctor"],
    }),

    // Export doctor data
    exportDoctorData: builder.query({
      async queryFn(doctorId: string) {
        try {
          const { createFirebaseQuery, firebaseConstraints } = await import("@/lib/firebase-rtk");

          // Get all doctor-related data
          const [profile, appointments, documents, availability, analytics] = await Promise.all([
            createFirebaseQuery("users", [firebaseConstraints.where("uid", "==", doctorId)]),
            createFirebaseQuery("bookings", [firebaseConstraints.where("doctorId", "==", doctorId)]),
            createFirebaseQuery("uploads", [firebaseConstraints.where("doctorId", "==", doctorId)]),
            createFirebaseQuery("doctorAvailability", [firebaseConstraints.where("doctorId", "==", doctorId)]),
            createFirebaseQuery("analytics", [firebaseConstraints.where("doctorId", "==", doctorId)]),
          ]);

          const exportData = {
            doctorId,
            profile: profile[0] || null,
            appointments: appointments || [],
            documents: documents || [],
            availability: availability || [],
            analytics: analytics || [],
            exportedAt: new Date().toISOString(),
            exportType: "doctor_data_export",
          };

          return { data: exportData };
        } catch (error) {
          console.error("Error exporting doctor data:", error);
          return {
            error: {
              status: "FETCH_ERROR",
              error: error instanceof Error ? error.message : "Unknown error occurred",
            },
          };
        }
      },
      providesTags: ["Doctor"],
    }),

    // Send notification to patients
    sendPatientNotification: builder.mutation({
      async queryFn({ patientIds, title, message, type = "info", relatedData = {} }) {
        try {
          
          
          const { createFirebaseDocument } = await import("@/lib/firebase-rtk");

          const notifications = [];
          
          for (const patientId of patientIds) {
            const notificationData = {
              userId: patientId,
              title,
              message,
              type,
              isRead: false,
              createdAt: new Date().toISOString(),
              relatedData,
            };

             
            const createdNotification = await createFirebaseDocument("notifications", notificationData);
            
            
            notifications.push({
              id: createdNotification.id,
              ...notificationData
            });
          }

          
          return { data: { notifications, totalSent: patientIds.length } };
        } catch (error) {
          console.error("Error sending patient notifications:", error);
          console.error("Error details:", {
            message: error instanceof Error ? error.message : "Unknown error",
            stack: error instanceof Error ? error.stack : undefined,
            patientIds,
            title,
            notificationMessage: message
          });
          return {
            error: {
              status: "FETCH_ERROR",
              error: error instanceof Error ? error.message : "Unknown error occurred",
            },
          };
        }
      },
      invalidatesTags: ["Notification"],
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

          const collectSnapshot = (snapshot: Awaited<ReturnType<typeof getDocs>>) => {
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
              where("cancellationRequest.status", "in", cancellationRequestStatuses)
            );
            const cancellationStatusSnapshot = await getDocs(cancellationStatusQuery);
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
      async queryFn() {
        try {
          const { createFirebaseQuery } = await import("@/lib/firebase-rtk");

         
          const uploadsData = await createFirebaseQuery("uploads");
          
          
          // If no uploads found, try other possible collection names
          if (!uploadsData || uploadsData.length === 0) {
            
            
            const possibleCollections = ["Uploads", "documents", "Documents", "certifications", "Certifications"];
            
            for (const collectionName of possibleCollections) {
              try {
                const data = await createFirebaseQuery(collectionName);
              
                if (data && data.length > 0) {
                  
                  return { data: { uploads: data } };
                }
              } catch (error) {
              
              }
            }
          }

          return { data: { uploads: uploadsData || [] } };
        } catch (error) {
          console.error("Error fetching Firebase uploads:", error);
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
      providesTags: ["Upload"],
    }),

    updateUploadStatus: builder.mutation({
      async queryFn({ uploadId, doctorId, name, downloadUrl, status, comment, reviewedBy }) {
        try {
          const { doc, updateDoc, serverTimestamp, collection, query, where, getDocs, getDoc } = await import("firebase/firestore");
          const { db } = await import("@/lib/firebase");

          

          // First, find the parent document in uploads collection that contains this document
          const uploadsRef = collection(db, "uploads");
          const q = query(uploadsRef, where("doctorId", "==", doctorId));
          
          const querySnapshot = await getDocs(q);
          
           
          if (querySnapshot.empty) {
            return {
              error: {
                status: "NOT_FOUND",
                error: "No upload documents found for this doctor in database.",
              },
            };
          }

          // Find the correct parent document and update the specific document in the documents array
          let updated = false;
          const matchAttempts: Array<{
            docId: string;
            url: string;
            fileName: string;
            match: { id: boolean; url: boolean; name: boolean };
          }> = [];
          
          let uploadDocToUpdate = null;
          let finalDocIndex = -1;
          
          for (const uploadDoc of querySnapshot.docs) {
            const uploadData = uploadDoc.data();
            
            if (uploadData.documents && Array.isArray(uploadData.documents)) { 
              
              // Find the document in the documents array
              // Match by name only (as per business requirement: Document approval does not use ID, it uses name)
              const targetName = (name || "").trim().toLowerCase();
              const docIndex = uploadData.documents.findIndex((docItem: any) => {
                const itemFileName = (docItem.fileName || "").trim().toLowerCase();
                const itemName = (docItem.name || "").trim().toLowerCase();
                return itemFileName === targetName || itemName === targetName;
              });
              
              if (docIndex !== -1) {
                uploadDocToUpdate = uploadDoc;
                finalDocIndex = docIndex; 
                break; // Exit the loop once we found the document
              }
            }
          }

          if (uploadDocToUpdate && finalDocIndex !== -1) {
            const uploadData = uploadDocToUpdate.data();
          
            // Validate that documents with the same name cannot be approved
            if (status === "approved") {
              const targetName = (name || "").trim().toLowerCase();
              const duplicateExists = uploadData.documents.some((docItem: any, idx: number) => {
                if (idx === finalDocIndex) return false;
                const docName = (docItem.fileName || docItem.name || "").trim().toLowerCase();
                return docName === targetName;
              });

              if (duplicateExists) {
                return {
                  error: {
                    status: "BAD_REQUEST",
                    error: "Documents with the same name cannot be approved.",
                  },
                };
              }
            }
            
            // Update the specific document in the array
            const updatedDocuments = [...uploadData.documents];
            
            // Preserve all existing fields and only update what's needed
            const currentDoc = updatedDocuments[finalDocIndex];
            updatedDocuments[finalDocIndex] = {
              ...currentDoc,
              status: status,
              comment: comment?.trim() || currentDoc.comment || "",
              reviewedBy: reviewedBy || currentDoc.reviewedBy,
              reviewedAt: new Date().toISOString(),
            };
            
            await updateDoc(doc(db, "uploads", uploadDocToUpdate.id), {
              documents: updatedDocuments,
            });
            
            
            updated = true;
          }

          if (!updated) { 
            
            return {
              error: {
                status: "NOT_FOUND",
                error: "Document not found in database. It may have been deleted.",
              },
            };
          }

          return { data: { success: true, message: `Document ${status} successfully.` } };
        } catch (error: any) {
          console.error("Error updating document status:", error);
          console.error("Error details:", {
            message: error?.message,
            code: error?.code,
            stack: error?.stack,
            fullError: error
          });
          
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
        method: "GET",
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
  useGetFirebaseNurseProfilesQuery,
  useVerifyDoctorDataQuery,
  useGetAuditLogsQuery,
  useBulkUpdateDoctorStatusMutation,
  useExportDoctorDataQuery,
  useSendPatientNotificationMutation,
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
  useGetLatestBookingsForMessagesQuery,
} = api;
