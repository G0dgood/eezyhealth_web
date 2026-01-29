import { api } from "./baseApi";

export const authApi = api.injectEndpoints({
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
          const { updateFirebaseDocument, setFirebaseDocument, getFirebaseInstance } = await import(
            "@/lib/firebase-rtk"
          );
          const { collection, query, where, getDocs, updateDoc } = await import(
            "firebase/firestore"
          );

          // 1. Update users collection (Always)
          // Use setFirebaseDocument (upsert) to create the document if it doesn't exist
          await setFirebaseDocument("users", userId, userData);

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
          console.error("Error updating user profile:", error);
          return {
            error: {
              status: "CUSTOM_ERROR",
              error:
                error instanceof Error ? error.message : "Failed to update profile",
            },
          };
        }
      },
      invalidatesTags: (result, error, { userId }) => [
        { type: "User", id: userId },
      ],
    }),

    updateUserProfile: builder.mutation({
      async queryFn({ userId, ...userData }) {
        try {
          const { updateFirebaseDocument, setFirebaseDocument, getFirebaseInstance } = await import(
            "@/lib/firebase-rtk"
          );
          const { collection, query, where, getDocs, updateDoc, doc, getDoc } = await import(
            "firebase/firestore"
          );

          // Remove undefined values from userData to prevent Firestore errors
          const cleanUserData = Object.entries(userData).reduce((acc, [key, value]) => {
            if (value !== undefined) {
              acc[key] = value;
            }
            return acc;
          }, {} as Record<string, any>);

          // 1. Update users collection (Always)
          // Use setFirebaseDocument (upsert) to create the document if it doesn't exist
          await setFirebaseDocument("users", userId, cleanUserData);

          // 2. Handle Role Specific Updates
          const db = getFirebaseInstance();
          let role = cleanUserData.role;

          // If role is not provided, try to fetch it from the user document
          if (!role) {
            try {
              const userDocRef = doc(db, "users", userId);
              const userSnap = await getDoc(userDocRef);
              if (userSnap.exists()) {
                role = userSnap.data().role;
              }
            } catch (err) {
              console.warn("Could not fetch user role for profile sync:", err);
            }
          }

          if (role === "nurse") {
            try {
              // Update nurseProfiles
              const q = query(
                collection(db, "nurseProfiles"),
                where("nurseId", "==", userId)
              );
              const querySnapshot = await getDocs(q);

              if (!querySnapshot.empty) {
                const updatePromises = querySnapshot.docs.map((doc) =>
                  updateDoc(doc.ref, cleanUserData)
                );
                await Promise.all(updatePromises);
              }
            } catch (err) {
              console.error("Error updating nurse profile:", err);
              // Don't fail the whole request if role update fails
            }
          } else if (role === "doctor") {
            try {
              // Update doctorProfiles
              const q = query(
                collection(db, "doctorProfiles"),
                where("doctorId", "==", userId)
              );
              const querySnapshot = await getDocs(q);

              if (!querySnapshot.empty) {
                const updatePromises = querySnapshot.docs.map((doc) =>
                  updateDoc(doc.ref, cleanUserData)
                );
                await Promise.all(updatePromises);
              }
            } catch (err) {
              console.error("Error updating doctor profile:", err);
              // Don't fail the whole request if role update fails
            }
          }

          return { data: { userId, ...cleanUserData } };
        } catch (error) {
          console.error("Error updating user profile:", error);
          return {
            error: {
              status: "CUSTOM_ERROR",
              error:
                error instanceof Error ? error.message : "Failed to update profile",
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
  }),
});

export const {
  useGenerateTokenForUserMutation,
  useCreateUserMutation,
  useGetUserByIdQuery,
  useUpdateUserMutation,
  useUpdateUserProfileMutation,
  useGetUsersQuery,
  useGetUsersByRoleQuery,
  useEmailVerificationMutation,
  useSendPasswordResetLinkMutation,
  useSendWelcomeEmailMutation,
  useGetProfileImageUrlQuery,
} = authApi;


