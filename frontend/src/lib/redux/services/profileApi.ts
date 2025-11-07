import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// --- Interfaces ---
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

// --- API Slice ---
export const profileApi = createApi({
  reducerPath: "profileApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080",
    credentials: "include",
  }),
  tagTypes: ["Profile", "Project"],

  endpoints: (builder) => ({
    // 🔹 Get user profile
    getProfile: builder.query<DbProfile, string>({
      query: (userId) => `/api/profile/${userId}`,
      providesTags: (result) =>
        result ? [{ type: "Profile", id: result.id }] : [],
    }),

    // 🔹 Update profile
    updateProfile: builder.mutation<DbProfile, Partial<DbProfile> & { id: string }>({
      query: ({ id, ...body }) => ({
        url: `/api/profile/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, arg) =>
        arg ? [{ type: "Profile", id: arg.id }] : [],
    }),

    // 🔹 Upload avatar
    uploadAvatar: builder.mutation<{ path: string; publicUrl: string }, { file: File }>({
      query: ({ file }) => {
        const formData = new FormData();
        formData.append("file", file);
        return {
          url: `/api/profile/avatar`,
          method: "POST",
          body: formData,
        };
      },
    }),

    // 🔹 Get all projects
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

    // 🔹 Get project by user ID
    getProject: builder.query<DbProject, string>({
      query: (userId) => `/api/projects/user/${userId}`,
      providesTags: (result, error, userId) =>
        userId ? [{ type: "Project", id: userId }] : [],
    }),

    // 🔹 Get project by project ID
    getProjectById: builder.query<ProjectWithFounder, string>({
      query: (projectId) => `/api/projects/${projectId}`,
      providesTags: (result, error, id) =>
        id ? [{ type: "Project", id }] : [],
    }),

    // 🔹 Get profile overview
    getProfileOverview: builder.query<ProfileOverview, string>({
      query: (userId) => `/api/profile/${userId}/overview`,
      providesTags: (result, error, userId) =>
        userId
          ? [
              { type: "Profile", id: userId },
              { type: "Project", id: userId },
            ]
          : [],
    }),

    // 🔹 Update project basics
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

    // 🔹 Update contact info
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

    // 🔹 Update funding info
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

    // 🔹 Update about
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
  }),
});

export const {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useUploadAvatarMutation,
  useGetProfileOverviewQuery,
  useGetAllProjectsQuery,
  useGetProjectQuery,
  useGetProjectByIdQuery,
  useUpdateProjectBasicsMutation,
  useUpdateProjectContactMutation,
  useUpdateProjectFundingMutation,
  useUpdateProjectAboutMutation,
} = profileApi;
