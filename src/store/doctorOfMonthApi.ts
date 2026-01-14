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
  }),
});

export const {
  useTriggerDoctorOfTheMonthMutation,
  useGetFirebaseDoctorOfTheMonthQuery,
} = doctorOfMonthApi;


