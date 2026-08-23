import { api, ALLOW_HMR_REINJECT } from "./baseApi";

export const triggerApi = api.injectEndpoints({
  overrideExisting: ALLOW_HMR_REINJECT,
  endpoints: (builder) => ({
    // ===== TRIGGERED FUNCTIONS =====
    triggerSendAppointmentReminder: builder.mutation({
      query: () => ({
        url: "/triggerSendAppointmentReminder",
        method: "POST",
      }),
    }),
  }),
});

export const {
  useTriggerSendAppointmentReminderMutation,
} = triggerApi;


