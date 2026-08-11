import { api } from "./baseApi";

export const doctorFirebaseApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Firebase-powered doctors query
    getFirebaseDoctors: builder.query({
      async queryFn() {
        try {
          const { createFirebaseQuery, firebaseConstraints } =
            await import("@/lib/firebase-rtk");

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
          const { collection, query, where, getDocs } =
            await import("firebase/firestore");
          const { db } = await import("@/lib/firebase");

          const doctorCollectionRef = collection(db, "doctorProfiles");
          const q = query(
            doctorCollectionRef,
            where("doctorId", "==", doctorId),
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
              {} as Record<string, unknown>,
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

    getFirebaseNurseProfiles: builder.query({
      async queryFn(arg: { page?: number; limit?: number; search?: string } = {}) {
        try {
          const { createFirebaseQuery, firebaseConstraints } =
            await import("@/lib/firebase-rtk");

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

          // Merge in the `nurseProfiles` doc. Fields like specialization and
          // experience_yrs live reliably on nurseProfiles (always written when a
          // nurse is created), but may be missing on the `users` doc — which made
          // the list show "N/A". Fill any missing fields from the profile.
          try {
            const profiles = await createFirebaseQuery("nurseProfiles", []);
            const profileByKey: Record<string, any> = {};
            (profiles || []).forEach((p: any) => {
              if (p.nurseId) profileByKey[p.nurseId] = p;
              if (p.uid && !profileByKey[p.uid]) profileByKey[p.uid] = p;
            });
            nursesData = (nursesData || []).map((n: any) => {
              const prof =
                profileByKey[n.uid] || profileByKey[n.id] || {};
              return {
                ...prof,
                ...n,
                // Prefer a non-empty value from either source.
                specialization: n.specialization || prof.specialization || "",
                experience_yrs: n.experience_yrs || prof.experience_yrs || "",
                hospital: n.hospital || prof.hospital || "",
                title: n.title || prof.title || "",
              };
            });
          } catch (mergeErr) {
            console.warn("Could not merge nurseProfiles into nurse list:", mergeErr);
          }

          // Apply search filter if present
          if (arg.search) {
            const searchLower = arg.search.toLowerCase();
            nursesData = nursesData.filter(
              (n: any) =>
                n.display_name?.toLowerCase().includes(searchLower) ||
                n.name?.toLowerCase().includes(searchLower) ||
                n.email?.toLowerCase().includes(searchLower) ||
                n.phone_number?.includes(searchLower)
            );
          }

          const totalCount = nursesData.length;

          // Apply page/limit slicing if provided
          let result = nursesData;
          if (arg.page && arg.limit) {
            const startIndex = (arg.page - 1) * arg.limit;
            result = nursesData.slice(startIndex, startIndex + arg.limit);
          }

          // Attach pagination properties to the array itself
          const paginatedResult = [...result] as any;
          paginatedResult.totalCount = totalCount;
          paginatedResult.totalPages = arg.limit ? Math.ceil(totalCount / arg.limit) : 1;

          return { data: paginatedResult };
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
          const { createFirebaseQuery, firebaseConstraints } =
            await import("@/lib/firebase-rtk");

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
            await createFirebaseQuery("bookings", [
              firebaseConstraints.where("doctorId", "==", doctorId),
              firebaseConstraints.limit(1),
            ]);
            verification.appointments = true; // If query succeeds, data is accessible

            // Check documents accessibility
            await createFirebaseQuery("uploads", [
              firebaseConstraints.where("doctorId", "==", doctorId),
              firebaseConstraints.limit(1),
            ]);
            verification.documents = true;

            // Check availability accessibility
            await createFirebaseQuery("doctorAvailability", [
              firebaseConstraints.where("doctorId", "==", doctorId),
              firebaseConstraints.limit(1),
            ]);
            verification.availability = true;

            // Check analytics accessibility
            await createFirebaseQuery("analytics", [
              firebaseConstraints.where("doctorId", "==", doctorId),
              firebaseConstraints.limit(1),
            ]);
            verification.analytics = true;

            // Check notifications accessibility
            await createFirebaseQuery("notifications", [
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
            },
          };
        } catch (error) {
          console.error("Error verifying doctor data:", error);
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

    // Get audit logs
    getAuditLogs: builder.query({
      async queryFn({ doctorId, action, limit = 50 }) {
        try {
          const { createFirebaseQuery, firebaseConstraints } =
            await import("@/lib/firebase-rtk");

          const queryConstraints = [];

          if (doctorId) {
            queryConstraints.push(
              firebaseConstraints.where("targetId", "==", doctorId),
            );
          }

          if (action) {
            queryConstraints.push(
              firebaseConstraints.where("action", "==", action),
            );
          }

          queryConstraints.push(
            firebaseConstraints.orderBy("timestamp", "desc"),
          );
          queryConstraints.push(firebaseConstraints.limit(limit));

          const auditLogs = await createFirebaseQuery(
            "auditLogs",
            queryConstraints,
          );

          return { data: auditLogs };
        } catch (error) {
          console.error("Error fetching audit logs:", error);
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
      providesTags: ["AuditLog"],
    }),

    // Bulk doctor operations
    bulkUpdateDoctorStatus: builder.mutation({
      async queryFn({ doctorIds, status, reason, performedBy }) {
        try {
          const { updateFirebaseDocument, createFirebaseDocument } =
            await import("@/lib/firebase-rtk");

          const results = [];

          for (const doctorId of doctorIds) {
            try {
              await updateFirebaseDocument("users", doctorId, {
                isActive: status === "active",
                ...(status === "inactive"
                  ? {
                      deactivatedAt: new Date().toISOString(),
                      deactivationReason: reason,
                      deactivatedBy: performedBy,
                    }
                  : {
                      reactivatedAt: new Date().toISOString(),
                      reactivatedBy: performedBy,
                      deactivatedAt: "",
                      deactivationReason: "",
                    }),
                updatedAt: new Date().toISOString(),
              });

              // Create audit log for each doctor
              await createFirebaseDocument("auditLogs", {
                action:
                  status === "active"
                    ? "doctor_reactivated"
                    : "doctor_deactivated",
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
              results.push({
                doctorId,
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
              });
            }
          }

          return {
            data: { results, totalProcessed: doctorIds.length },
          };
        } catch (error) {
          console.error("Error in bulk doctor status update:", error);
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
      invalidatesTags: ["Doctor"],
    }),

    // Export doctor data
    exportDoctorData: builder.query({
      async queryFn(doctorId: string) {
        try {
          const { createFirebaseQuery, firebaseConstraints } =
            await import("@/lib/firebase-rtk");

          // Get all doctor-related data
          const [profile, appointments, documents, availability, analytics] =
            await Promise.all([
              createFirebaseQuery("users", [
                firebaseConstraints.where("uid", "==", doctorId),
              ]),
              createFirebaseQuery("bookings", [
                firebaseConstraints.where("doctorId", "==", doctorId),
              ]),
              createFirebaseQuery("uploads", [
                firebaseConstraints.where("doctorId", "==", doctorId),
              ]),
              createFirebaseQuery("doctorAvailability", [
                firebaseConstraints.where("doctorId", "==", doctorId),
              ]),
              createFirebaseQuery("analytics", [
                firebaseConstraints.where("doctorId", "==", doctorId),
              ]),
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
  }),
});

export const {
  useGetFirebaseDoctorsQuery,
  useGetFirebaseDoctorProfilesQuery,
  useGetFirebaseDoctorProfileByIdQuery,
  useGetDoctorAvailabilityQuery,
  useSaveDoctorAvailabilityMutation,
  useGetFirebaseNurseProfilesQuery,
  useVerifyDoctorDataQuery,
  useGetAuditLogsQuery,
  useBulkUpdateDoctorStatusMutation,
  useExportDoctorDataQuery,
} = doctorFirebaseApi;
