import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

/**
 * Admin API service for checking admin status and other admin features
 */
export const adminApi = createApi({
  reducerPath: "adminApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001", // đổi sang URL BE thật
  }),
  tagTypes: ["AdminStatus"],
  endpoints: (builder) => ({
    /**
     * Check if a user has admin access
     * @param userId - The user ID to check admin status for
     * @returns Boolean indicating if user has admin access
     */
    checkAdminStatus: builder.query<boolean, string>({
      query: (userId) => `/api/admin/status/${userId}`, // Gọi endpoint BE thay vì DB
      transformResponse: (response: { is_admin: boolean }) => response.is_admin,
      providesTags: (_result, _error, arg) =>
        arg ? [{ type: "AdminStatus" as const, id: arg }] : [],
    }),
  }),
});

// Export hooks for usage in components
export const { useCheckAdminStatusQuery } = adminApi;
