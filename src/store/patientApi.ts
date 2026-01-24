import { api } from "./baseApi";

export const patientApi = api.injectEndpoints({
  endpoints: (builder) => ({
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

    // Firebase-powered patient query
    getFirebasePatients: builder.query({
      async queryFn() {
        try {
          const { createFirebaseQuery, firebaseConstraints } = await import(
            "@/lib/firebase-rtk"
          );

          const patientsData = await createFirebaseQuery("users", [
            firebaseConstraints.where("role", "==", "patient"),
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

    // Firebase-powered users query
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

    getPatientAppointments: builder.query<any[], string>({
      async queryFn(userId: string) {
        try {
          if (!userId) {
            return { data: [] };
          }
          const { collection, query, where, getDocs } = await import("firebase/firestore");
          const { db } = await import("@/lib/firebase");
          const { serializeFirebaseData } = await import("@/lib/firebase-rtk");

          const bookingsCollectionRef = collection(db, "Bookings");
          const qRef = query(bookingsCollectionRef, where("userId", "==", userId));
          const snapshot = await getDocs(qRef);

          const bookingsData = snapshot.docs.map((docSnapshot) => {
            const data = docSnapshot.data();
            const processedData = serializeFirebaseData(data);

            return {
              id: docSnapshot.id,
              ...(processedData as object),
            };
          });

          if (bookingsData.length === 0) {
            return { data: [] };
          }

          return { data: bookingsData };
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
      providesTags: (result, error, userId) => [
        { type: "PatientAppointments", id: userId },
      ],
    }),

    savePatientVitals: builder.mutation<
      { success: boolean },
      {
        userId: string;
        doctorId: string;
        bookingId?: string;
        patientName?: string;
        vitals: {
          temperature?: string;
          heartRate?: string;
          pulse?: string;
          bloodPressure?: string;
          weight?: string;
          breathingRate?: string;
          comment?: string;
          recommendation?: string;
        };
      }
    >({
      async queryFn({ userId, doctorId, bookingId = "", patientName = "", vitals }) {
        try {
          if (!userId) {
            return {
              error: { status: "FETCH_ERROR", error: "Missing userId" },
            } as any;
          }

          const { doc, getDoc, setDoc, updateDoc } = await import(
            "firebase/firestore"
          );
          const { db } = await import("@/lib/firebase");
          const { serializeFirebaseData } = await import("@/lib/firebase-rtk");
          const ensureSerializable = serializeFirebaseData;

          const vitalsRef = doc(db, "patientVitalsHistory", String(userId));
          const snapshot = await getDoc(vitalsRef);

          const entry = ensureSerializable({
            userId: String(userId),
            doctorId: String(doctorId || ""),
            bookingId: String(bookingId || ""),
            name: String(patientName || ""),
            date: new Date().toISOString(),
            vitals: [
              {
                temperature: String(vitals?.temperature || ""),
                heartRate: String(vitals?.heartRate || vitals?.pulse || ""),
                pulse: String(vitals?.pulse || vitals?.heartRate || ""),
                bloodPressure: String(vitals?.bloodPressure || ""),
                weight: String(vitals?.weight || ""),
                breathingRate: String(vitals?.breathingRate || ""),
                comment: String(vitals?.comment || ""),
                recommendation: String(vitals?.recommendation || ""),
              },
            ],
          });

          if (snapshot.exists()) {
            const current = (snapshot.data() as any)?.entries || [];
            const nextEntries = [...current, entry];
            await updateDoc(
              vitalsRef,
              ensureSerializable({
                entries: nextEntries,
                upload: { lastUpdated: new Date().toISOString() },
              }) as any
            );
          } else {
            await setDoc(
              vitalsRef,
              ensureSerializable({
                name: "",
                userId: String(userId),
                entries: [entry],
                upload: { lastUpdated: new Date().toISOString() },
              }) as any
            );
          }

          return { data: { success: true } };
        } catch (error) {
          return {
            error: {
              status: "FETCH_ERROR",
              error:
                error instanceof Error
                  ? error.message
                  : "Failed to save vitals",
            },
          };
        }
      },
      invalidatesTags: (result, error, { userId }) => [
        { type: "PatientVitals", id: userId },
      ],
    }),

    getPatientVitalsHistory: builder.query<any[], string>({
      async queryFn(userId: string) {
        try {
          if (!userId || typeof userId !== "string") {
            return { data: [] };
          }

          const { doc, getDoc } = await import("firebase/firestore");
          const { db } = await import("@/lib/firebase");
          const { serializeFirebaseData } = await import("@/lib/firebase-rtk");
          const ensureSerializable = serializeFirebaseData;

          const vitalsRef = doc(db, "patientVitalsHistory", userId);
          const docSnap = await getDoc(vitalsRef);

          if (!docSnap.exists()) {
            return { data: [] };
          }

          const data = docSnap.data() as any;
          const entries = Array.isArray(data?.entries) ? data.entries : [];

          const formatted = (entries || []).map((entry: any) => {
            const safe = ensureSerializable(entry) as any;

            let normalizedDate: string | null = null;
            const rawDate = (entry && (entry.date || entry.createdAt)) as any;
            if (rawDate) {
              const converted = ensureSerializable(rawDate) as any;
              if (typeof converted === "string") {
                normalizedDate = converted;
              } else if (converted && converted.seconds) {
                normalizedDate = new Date(converted.seconds * 1000).toISOString();
              }
            }

            return {
              ...safe,
              date: normalizedDate,
            };
          });

          return { data: formatted };
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
      providesTags: (result, error, userId) => [
        { type: "PatientVitals", id: userId },
      ],
    }),
  }),
});

export const {
  useCreatePatientProfileMutation,
  useGetPatientProfileQuery,
  useUpdatePatientProfileMutation,
  useGetAllPatientProfilesQuery,
  useGetPatientVitalsByDoctorIdQuery,
  useGetFirebasePatientsQuery,
  useGetFirebaseUsersQuery,
  useGetPatientAppointmentsQuery,
  useLazyGetPatientAppointmentsQuery,
  useGetPatientVitalsHistoryQuery,
  useSavePatientVitalsMutation,
} = patientApi;


