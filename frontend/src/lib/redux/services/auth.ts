import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

interface AuthResponse {
  user: any | null;
  session?: any | null;
  error?: string | null;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface SignupCredentials {
  email: string;
  password: string;
  phone: string;
}

interface ResetPasswordCredentials {
  email: string;
}

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080",
    credentials: "include", // nếu BE dùng cookie session
  }),
  tagTypes: ["Auth", "User"],
  endpoints: (builder) => ({
    /** 🔐 Login */
    login: builder.mutation<AuthResponse, LoginCredentials>({
      query: (body) => ({
        url: "/api/auth/login",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Auth", "User"],
    }),

    /** 🧾 Signup */
    signup: builder.mutation<AuthResponse, SignupCredentials>({
      query: (body) => ({
        url: "/api/auth/signup",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Auth", "User"],
    }),

    /** 📩 Reset password */
    resetPassword: builder.mutation<
      { success: boolean; error?: string | null },
      ResetPasswordCredentials
    >({
      query: (body) => ({
        url: "/api/auth/reset-password",
        method: "POST",
        body,
      }),
    }),

    /** 🚪 Logout */
    logout: builder.mutation<{ success: boolean }, void>({
      query: () => ({
        url: "/api/auth/logout",
        method: "POST",
      }),
      invalidatesTags: ["Auth", "User"],
    }),

    /** 🧠 Get current session */
    getSession: builder.query<AuthResponse, void>({
      query: () => "/api/auth/session",
      providesTags: ["Auth"],
    }),
  }),
});

export const {
  useLoginMutation,
  useSignupMutation,
  useLogoutMutation,
  useGetSessionQuery,
  useResetPasswordMutation,
} = authApi;
