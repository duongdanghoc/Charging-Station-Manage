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
  token?: string;
  user_metadata?: {
    avatar_url?: string;
  };
}

// ============================================
// Request Types
// ============================================

interface LoginCredentials {
  email: string;
  password: string;
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

interface UpdateCustomerProfileRequest {
  userId: number;
  name: string;
  phone: string;
}

interface UpdateVendorProfileRequest {
  legalEntity: string;
  address: string;
  representative: string;
  verified?: boolean;
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
  type?: string;     // "Bearer"
  email: string;
  name: string;
  role: "CUSTOMER" | "VENDOR";
}

interface ValidationErrorResponse {
  message: string;
  errors?: Record<string, string>;
}

interface AuthResponse {
  user: User | null;
  error?: string | null;
}

interface LogoutResponse {
  message: string;
}

interface ResetPasswordResponse {
  message: string;
}

interface UserInfoResponse {
  id: number;
  email: string;
  name: string;
  role: "CUSTOMER" | "VENDOR";
}

interface UpdateProfileResponse {
  message: string;
  user: User;
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
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
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
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch {
          // Continue even if API call fails
        } finally {
          // Always clear localStorage and reset cache
          localStorage.removeItem("authToken");
          localStorage.removeItem("user");
          
          // Reset the entire auth API cache
          dispatch(authApi.util.resetApiState());
        }
      },
      invalidatesTags: ["Auth", "User"],
    }),

    /** 🧠 Get current session using JWT token */
    /** 🧠 Get current session using JWT token (calls /auth/me on backend)
     *  If backend call fails, falls back to localStorage-stored user/token.
     */
    getSession: builder.query<AuthResponse, void>({
      async queryFn(_arg, _queryApi, _extraOptions, fetchWithBQ) {
        // Try server session first (returns 200 + user body when token is valid)
        const result = await fetchWithBQ({ url: "/api/auth/me", method: "GET" });
        if (result.error) {
          // If server returns an error (401/403 or network error), fall back to localStorage
          const storedUser = localStorage.getItem("user");
          const storedToken = localStorage.getItem("authToken");
          if (storedUser && storedToken) {
            try {
              const parsedUser = JSON.parse(storedUser) as User;
              return {
                data: { user: { ...parsedUser, token: storedToken }, error: null },
              };
            } catch (e) {
              console.error("Failed to parse stored user:", e);
            }
          }
          return { error: result.error as FetchBaseQueryError };
        }

        // On success, map server response to AuthResponse
        const resp = result.data as UserInfoResponse | null;
        if (resp && resp.id) {
          return {
            data: {
              user: {
                id: resp.id,
                name: resp.name,
                email: resp.email,
                role: resp.role,
                phone: "",
              },
              error: null,
            },
          };
        }

        // If server response is unexpected, fallback to localStorage
        const storedUser = localStorage.getItem("user");
        const storedToken = localStorage.getItem("authToken");
        if (storedUser && storedToken) {
          try {
            const parsedUser = JSON.parse(storedUser) as User;
            return {
              data: { user: { ...parsedUser, token: storedToken }, error: null },
            };
          } catch (e) {
            console.error("Failed to parse stored user:", e);
          }
        }
        return { data: { user: null, error: null } };
      },
      providesTags: ["Auth"],
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

    /** 📝 Update customer profile */
    updateCustomerProfile: builder.mutation<UpdateProfileResponse, UpdateCustomerProfileRequest>({
      query: ({ userId, ...body }) => ({
        url: `/api/customer/${userId}`,
        method: "PUT",
        body,
      }),
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          // Update localStorage with new user data
          if (data.user) {
            localStorage.setItem("user", JSON.stringify(data.user));
          }
        } catch (error) {
          console.error("Failed to update customer profile:", error);
        }
      },
      invalidatesTags: ["Auth", "User"],
    }),

    /** 📝 Update vendor profile */
    updateVendorProfile: builder.mutation<UpdateProfileResponse, UpdateVendorProfileRequest>({
      query: (body) => ({
        url: "/api/vendor/profile",
        method: "PUT",
        body,
      }),
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          // Update localStorage with new user data
          if (data.user) {
            localStorage.setItem("user", JSON.stringify(data.user));
          }
        } catch (error) {
          console.error("Failed to update vendor profile:", error);
        }
      },
      invalidatesTags: ["Auth", "User"],
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
  useUpdateCustomerProfileMutation,
  useUpdateVendorProfileMutation,
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
  UpdateCustomerProfileRequest,
  UpdateVendorProfileRequest,
  UpdateProfileResponse,
};

// ============================================
// Export type guards for components
// ============================================

export { isFetchBaseQueryError, isErrorWithData };