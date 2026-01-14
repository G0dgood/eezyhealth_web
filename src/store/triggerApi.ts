import { api } from "./baseApi";

export const triggerApi = api.injectEndpoints({
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


