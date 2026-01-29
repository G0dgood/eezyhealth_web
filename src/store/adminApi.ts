import { api } from "./baseApi";

export const adminApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // ===== ADMIN DASHBOARD =====
    getAdminDashboard: builder.query({
      query: (params) => ({
        url: "/getAdminDashboard",
        params,
      }),
    }),
  }),
});

export const { useGetAdminDashboardQuery } = adminApi;


