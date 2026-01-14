import { api } from "./baseApi";

export const notificationApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Send notification to patients
    sendPatientNotification: builder.mutation({
      async queryFn({
        patientIds,
        title,
        message,
        type = "info",
        relatedData = {},
      }) {
        try {
          const { createFirebaseDocument } = await import(
            "@/lib/firebase-rtk"
          );

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

            const createdNotification = await createFirebaseDocument(
              "notifications",
              notificationData
            );

            notifications.push({
              id: createdNotification.id,
              ...notificationData,
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
            notificationMessage: message,
          });
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
      invalidatesTags: ["Notification"],
    }),
  }),
});

export const {
  useSendPatientNotificationMutation,
} = notificationApi;


