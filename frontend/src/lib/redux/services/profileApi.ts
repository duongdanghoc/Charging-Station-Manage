import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface DbProfile {
  id: string;
  name: string | null;
  avatar_url: string | null;
  intro: string | null;
  type: string[] | null;
  role: string[] | null;
  phone?: string | null;
  updated_at?: string;
}

export interface DbProject {
  id: string;
  user_id: string;
  title: string | null;
  tags: string[] | null;
  description: string | null;
  location: string | null;
  website: string | null;
  portfolio: string | null;
  email: string | null;
  investment: string | null;
  currency: string | null;
  cofounders: string[] | null;
  partners: string[] | null;
  start_date: string | null;
  end_date: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ProjectWithFounder extends DbProject {
  profiles?: {
    name: string | null;
    role: string[] | null;
    avatar_url: string | null;
    type: string[] | null;
  } | null;
}

export interface ProfileOverview {
  profile: DbProfile | null;
  project: ProjectWithFounder | null;
}

export interface RecentActivity {
  id: string;
  type: string;
  stationName?: string;
  description?: string;
  timestamp: string;
}

export interface DashboardResponse {
  profile: DbProfile | null;
  recentActivities: RecentActivity[] | null;
}

export interface ProjectBasicsPayload {
  title: string | null;
  tags: string[];
  description?: string | null;
}

export interface ProjectContactInfoPayload {
  location: string | null;
  website: string | null;
  portfolio: string | null;
  email: string | null;
}

export interface FundingInfoPayload {
  investment: string | null;
  currency: string | null;
  cofounders: string[];
  partners: string[];
  startDate?: string | null;
  endDate?: string | null;
}

export interface ChargingHistoryResponse {
  content: ChargingHistoryItem[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number; // current page index
}

export interface ChargingHistoryItem {
  sessionId: number;
  stationName: string;
  address: string;
  vehiclePlate: string;
  startTime: string;
  endTime: string | null;
  energyKwh: number;
  totalAmount: number | null;
  sessionStatus: "PENDING" | "CHARGING" | "COMPLETED" | "CANCELLED" | "FAILED";
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED" | null;
  paymentMethod: string | null;
}

export interface TransactionHistoryItem {
  transactionId: number;
  amount: number;
  paymentMethod: string;
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  bankName: string | null;
  accountNumber: string | null;
  paymentTime: string | null;
  description: string;
}

export interface TransactionHistoryResponse {
  content: TransactionHistoryItem[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

export const profileApi = createApi({
  reducerPath: "profileApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("authToken");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      headers.set("Content-Type", "application/json");
      return headers;
    },
    credentials: "include",
  }),
  tagTypes: ["Profile", "Project"],

  endpoints: (builder) => ({
    getProfile: builder.query<DbProfile, string>({
      query: (userId) => `/api/customer/profile/${userId}`,
      providesTags: (result) =>
        result ? [{ type: "Profile", id: result.id }] : [],
    }),

    updateProfile: builder.mutation<DbProfile, Partial<DbProfile> & { id: string }>({
      query: ({ id, ...body }) => ({
        url: `/api/customer/profile/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, arg) =>
        arg ? [{ type: "Profile", id: arg.id }] : [],
    }),

    uploadAvatar: builder.mutation<{ path: string; publicUrl: string }, { file: File }>({
      query: ({ file }) => {
        const formData = new FormData();
        formData.append("file", file);
        return {
          url: `/api/customer/profile/avatar`,
          method: "POST",
          body: formData,
        };
      },
    }),

    getAllProjects: builder.query<ProjectWithFounder[], void>({
      query: () => `/api/projects`,
      providesTags: (result) =>
        result
          ? [
            ...result.map(({ id }) => ({ type: "Project" as const, id })),
            { type: "Project", id: "LIST" },
          ]
          : [{ type: "Project", id: "LIST" }],
    }),

    getProject: builder.query<DbProject, string>({
      query: (userId) => `/api/projects/user/${userId}`,
      providesTags: (result, error, userId) =>
        userId ? [{ type: "Project", id: userId }] : [],
    }),

    getProjectById: builder.query<ProjectWithFounder, string>({
      query: (projectId) => `/api/projects/${projectId}`,
      providesTags: (result, error, id) =>
        id ? [{ type: "Project", id }] : [],
    }),

    getProfileOverview: builder.query<ProfileOverview, string>({
      query: (userId) => `/api/customer/profile/${userId}/overview`,
      providesTags: (result, error, userId) =>
        userId
          ? [
            { type: "Profile", id: userId },
            { type: "Project", id: userId },
          ]
          : [],
    }),

    getDashboard: builder.query<DashboardResponse, string>({
      query: (userId) => `/api/customer/dashboard?userId=${userId}`,
      providesTags: (result, error, userId) =>
        userId ? [{ type: "Profile", id: userId }, { type: "Project", id: userId }] : [],
    }),

    updateProjectBasics: builder.mutation<
      DbProject,
      { userId: string; basics: ProjectBasicsPayload }
    >({
      query: ({ userId, basics }) => ({
        url: `/api/projects/${userId}/basics`,
        method: "PUT",
        body: basics,
      }),
      invalidatesTags: (r, e, { userId }) => [
        { type: "Project", id: userId },
        { type: "Project", id: "LIST" },
      ],
    }),

    updateProjectContact: builder.mutation<
      DbProject,
      { userId: string; contact: ProjectContactInfoPayload }
    >({
      query: ({ userId, contact }) => ({
        url: `/api/projects/${userId}/contact`,
        method: "PUT",
        body: contact,
      }),
      invalidatesTags: (r, e, { userId }) => [
        { type: "Project", id: userId },
        { type: "Project", id: "LIST" },
      ],
    }),

    updateProjectFunding: builder.mutation<
      DbProject,
      { userId: string; fundingInfo: FundingInfoPayload }
    >({
      query: ({ userId, fundingInfo }) => ({
        url: `/api/projects/${userId}/funding`,
        method: "PUT",
        body: fundingInfo,
      }),
      invalidatesTags: (r, e, { userId }) => [
        { type: "Project", id: userId },
        { type: "Project", id: "LIST" },
      ],
    }),

    updateProjectAbout: builder.mutation<
      DbProject,
      { userId: string; about: string }
    >({
      query: ({ userId, about }) => ({
        url: `/api/projects/${userId}/about`,
        method: "PUT",
        body: { about },
      }),
      invalidatesTags: (r, e, { userId }) => [
        { type: "Project", id: userId },
        { type: "Project", id: "LIST" },
      ],
    }),

    getChargingHistory: builder.query<ChargingHistoryResponse, { userId: string; page?: number; size?: number }>({
      query: ({ userId, page = 0, size = 10 }) =>
        `/api/customer/${userId}/history?page=${page}&size=${size}`,
      providesTags: (result, error, { userId }) =>
        result ? [{ type: "Profile", id: `${userId}-history` }] : [],
    }),

    getTransactions: builder.query<TransactionHistoryResponse, { userId: string; page?: number; size?: number }>({
      query: ({ userId, page = 0, size = 10 }) =>
        `/api/customer/${userId}/transactions?page=${page}&size=${size}`,
      providesTags: (result, error, { userId }) =>
        result ? [{ type: "Profile", id: `${userId}-transactions` }] : [],
    }),
  }),
});

export const {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useUploadAvatarMutation,
  useGetProfileOverviewQuery,
  useGetDashboardQuery,
  useGetAllProjectsQuery,
  useGetProjectQuery,
  useGetProjectByIdQuery,
  useUpdateProjectBasicsMutation,
  useUpdateProjectContactMutation,
  useUpdateProjectFundingMutation,
  useUpdateProjectAboutMutation,
  useGetChargingHistoryQuery,
  useGetTransactionsQuery,
} = profileApi;
