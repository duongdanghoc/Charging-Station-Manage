import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";

// ============================================
// Types for Backend API
// ============================================

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: "CUSTOMER" | "VENDOR";
  user_metadata?: {
    avatar_url?: string;
  };
}

interface Session {
  token: string;
  expiresAt?: string;
}

// ============================================
// Request Types
// ============================================

interface LoginCredentials {
  email: string;
  password: string;
  role: "CUSTOMER" | "VENDOR";
}

interface SignupCredentials {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: "CUSTOMER" | "VENDOR";
}

interface ResetPasswordCredentials {
  email: string;
}

// ============================================
// Response Types
// ============================================

interface RegisterResponse {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: "CUSTOMER" | "VENDOR";
  message: string;
}

interface LoginResponse {
  token: string;
  user: User;
  message: string;
}

interface ValidationErrorResponse {
  message: string;
  errors?: Record<string, string>;
}

interface AuthResponse {
  user: User | null;
  session?: Session | null;
  error?: string | null;
}

interface LogoutResponse {
  message: string;
}

interface ResetPasswordResponse {
  message: string;
}

// ============================================
// Type Guards for Error Handling
// ============================================

function isFetchBaseQueryError(error: unknown): error is FetchBaseQueryError {
  return typeof error === "object" && error != null && "status" in error;
}

function isErrorWithData(
  error: unknown
): error is { status: number; data: ValidationErrorResponse } {
  return (
    isFetchBaseQueryError(error) &&
    typeof error.data === "object" &&
    error.data !== null &&
    "message" in error.data
  );
}

// ============================================
// API Service
// ============================================

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080",
    credentials: "include",
    prepareHeaders: (headers) => {
      // Add token from localStorage if exists
      const token = localStorage.getItem("authToken");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  tagTypes: ["Auth", "User"],
  endpoints: (builder) => ({
    /** 🔐 Login - TO BE IMPLEMENTED IN BACKEND */
    login: builder.mutation<LoginResponse, LoginCredentials>({
      query: (body) => ({
        url: "/api/auth/login",
        method: "POST",
        body,
      }),
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          // Save token and user to localStorage
          localStorage.setItem("authToken", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));
        } catch (error) {
          console.error("Login failed:", error);
        }
      },
      invalidatesTags: ["Auth", "User"],
    }),

    /** 🧾 Signup - CONNECTED TO YOUR BACKEND */
    signup: builder.mutation<RegisterResponse, SignupCredentials>({
      query: (body) => ({
        url: "/api/auth/register",
        method: "POST",
        body,
      }),
      transformErrorResponse: (
        response: FetchBaseQueryError | { status: number; data: unknown }
      ) => {
        // Type-safe error transformation
        if (
          "status" in response &&
          response.status === 400 &&
          typeof response.data === "object" &&
          response.data !== null
        ) {
          return {
            status: response.status,
            data: response.data as ValidationErrorResponse,
          };
        }
        return response;
      },
      invalidatesTags: ["Auth", "User"],
    }),

    /** 📩 Reset password - TO BE IMPLEMENTED IN BACKEND */
    resetPassword: builder.mutation<
      ResetPasswordResponse,
      ResetPasswordCredentials
    >({
      query: (body) => ({
        url: "/api/auth/reset-password",
        method: "POST",
        body,
      }),
    }),

    /** 🚪 Logout */
    logout: builder.mutation<LogoutResponse, void>({
      query: () => ({
        url: "/api/auth/logout",
        method: "POST",
      }),
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
          // Clear localStorage
          localStorage.removeItem("authToken");
          localStorage.removeItem("user");
        } catch {
          // Clear localStorage even if API call fails
          localStorage.removeItem("authToken");
          localStorage.removeItem("user");
        }
      },
      invalidatesTags: ["Auth", "User"],
    }),

    /** 🧠 Get current session - TO BE IMPLEMENTED IN BACKEND */
    getSession: builder.query<AuthResponse, void>({
      query: () => "/api/auth/register",
      providesTags: ["Auth"],
      transformResponse: (response: AuthResponse): AuthResponse => {
        // Try to get user from localStorage if API response is empty
        if (!response.user) {
          const storedUser = localStorage.getItem("user");
          const storedToken = localStorage.getItem("authToken");

          if (storedUser && storedToken) {
            try {
              const parsedUser = JSON.parse(storedUser) as User;
              return {
                user: parsedUser,
                session: { token: storedToken },
                error: null,
              };
            } catch (error) {
              console.error("Failed to parse stored user:", error);
            }
          }
        }

        return response;
      },
    }),

    /** 👤 Get current user from localStorage */
    getCurrentUser: builder.query<User | null, void>({
      queryFn: () => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser) as User;
            return { data: parsedUser };
          } catch (error) {
            console.error("Failed to parse stored user:", error);
            return { data: null };
          }
        }
        return { data: null };
      },
      providesTags: ["User"],
    }),
  }),
});

export const {
  useLoginMutation,
  useSignupMutation,
  useLogoutMutation,
  useGetSessionQuery,
  useResetPasswordMutation,
  useGetCurrentUserQuery,
} = authApi;

// ============================================
// Export types for use in components
// ============================================

export type {
  User,
  LoginCredentials,
  SignupCredentials,
  RegisterResponse,
  LoginResponse,
  ValidationErrorResponse,
  AuthResponse,
  LogoutResponse,
  ResetPasswordResponse,
};

// ============================================
// Export type guards for components
// ============================================

export { isFetchBaseQueryError, isErrorWithData };