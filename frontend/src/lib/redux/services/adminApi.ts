import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../store';

// 👇 1. KHAI BÁO CÁC INTERFACE BỊ THIẾU (Dựa trên DTO Java)
export interface RegisterRequest {
  name: string;
  email: string;
  phone: string;
  password?: string; // Tạm thời để optional vì Admin tự tạo
  role: 'CUSTOMER' | 'VENDOR';
}

export interface RegisterResponse {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: 'CUSTOMER' | 'VENDOR';
  message: string;
}
// --------------------------------------------------------------------

export interface UserFilterParams {
  keyword?: string;
  role?: 'CUSTOMER' | 'VENDOR' | 'ADMIN';
  status?: 0 | 1;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export const adminApi = createApi({
  reducerPath: 'adminApi',
  tagTypes: ['Users', 'Stats'],
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL + '/api/admin',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    // 1. Lấy thống kê
    getDashboardStats: builder.query<any, void>({
      query: () => '/stats',
      providesTags: ['Stats'],
    }),

    // 2. Lấy danh sách user
    getUsers: builder.query<any, UserFilterParams>({
      query: (params) => ({
        url: '/users',
        params: params,
      }),
      providesTags: (result) =>
        result?.data?.content
          ? [
              ...result.data.content.map(({ id }: any) => ({ type: 'Users', id } as const)),
              { type: 'Users', id: 'LIST' },
            ]
          : [{ type: 'Users', id: 'LIST' }],
    }),

    // 3. Xóa user
    deleteUser: builder.mutation<any, number>({
      query: (id) => ({
        url: `/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Users', 'Stats'],
    }),

    // 4. Tạo user
    createUser: builder.mutation<RegisterResponse, RegisterRequest>({
      query: (body) => ({
        url: `/users`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Users', 'Stats'],
    }),
  }),
});

// 👇 5. SỬA LỖI CÚ PHÁP: THÊM DẤU PHẨY
export const {
  useGetDashboardStatsQuery,
  useGetUsersQuery,
  useDeleteUserMutation, // <--- DẤU PHẨY ĐÃ ĐƯỢC THÊM
  useCreateUserMutation
} = adminApi;
