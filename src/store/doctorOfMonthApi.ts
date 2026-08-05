import { api } from "./baseApi";

export const doctorOfMonthApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // ===== DOCTOR OF THE MONTH =====
    triggerDoctorOfTheMonth: builder.mutation({
      query: () => ({
        url: "/triggerDoctorOfTheMonth",
        method: "GET",
      }),
      invalidatesTags: ["Doctor"],
    }),

    // Firebase-powered doctor of the month query
    getFirebaseDoctorOfTheMonth: builder.query({
      async queryFn() {
        try {
          const { createFirebaseQuery, firebaseConstraints } = await import(
            "@/lib/firebase-rtk"
          );

          const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

          // A single equality filter avoids any composite-index requirement.
          // (Two equality filters can need a composite index; when it's missing
          // the query fails, and the web app suppresses index errors — so the
          // winner would silently never show.) The trigger clears the flag from
          // past winners, so only the current one has isDoctorOfMonth === true.
          const flagged = await createFirebaseQuery("doctors", [
            firebaseConstraints.where("isDoctorOfMonth", "==", true),
            firebaseConstraints.limit(10),
          ]);

          const raw: any =
            flagged.find((d: any) => d.awardMonth === currentMonth) ||
            flagged[0] ||
            null;
          if (!raw) return { data: null };

          // Normalize field names — the `doctors` doc uses display_name /
          // specialization / photoURL, but the UI reads name / specialty / etc.
          const normalized = {
            ...raw,
            name:
              raw.name ||
              raw.display_name ||
              [raw.first_name, raw.last_name].filter(Boolean).join(" ") ||
              "Doctor of the Month",
            specialty: raw.specialty || raw.specialization || "General",
            rating: raw.rating || 0,
            completedAppointments:
              raw.completedAppointments ||
              raw.awardCompletedBookings ||
              raw.completedBookings ||
              0,
            photo_url:
              raw.photo_url || raw.photoURL || raw.profileImage || "",
          };

          return { data: normalized };
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
  }),
});

export const {
  useTriggerDoctorOfTheMonthMutation,
  useGetFirebaseDoctorOfTheMonthQuery,
} = doctorOfMonthApi;


