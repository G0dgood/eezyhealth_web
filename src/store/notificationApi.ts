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
    getNotificationsByRole: builder.query({
      async queryFn({ userId, role }) {
        try {
          const { createFirebaseQuery, firebaseConstraints } = await import(
            "@/lib/firebase-rtk"
          );
          
          let queryConstraints = [];
          if (role === "nurse") {
            queryConstraints.push(firebaseConstraints.limit(100));
          } else {
            queryConstraints.push(firebaseConstraints.where("doctorId", "==", userId));
          }

          const rawNotifications = await createFirebaseQuery("notifications", queryConstraints);
          
          const notifications = [...rawNotifications].sort((a: any, b: any) => {
            const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return timeB - timeA;
          });

          return { data: notifications };
        } catch (error) {
          console.error("Error fetching notifications by role:", error);
          return {
            error: {
              status: "FETCH_ERROR",
              error: error instanceof Error ? error.message : "Unknown error occurred",
            },
          };
        }
      },
      providesTags: ["Notification"],
    }),
  }),
});

export const {
  useSendPatientNotificationMutation,
  useGetNotificationsByRoleQuery,
} = notificationApi;


