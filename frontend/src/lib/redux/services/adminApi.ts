import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../store';

// --- 1. ĐỊNH NGHĨA CÁC INTERFACE (Types) ---

// Response chuẩn từ Backend (BaseApiResponse)
export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

// Response phân trang từ Backend (Page)
export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

export interface RegisterRequest {
  name: string;
  email: string;
  phone: string;
  password?: string;
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

export interface UserFilterParams {
  keyword?: string;
  role?: 'CUSTOMER' | 'VENDOR' | 'ADMIN';
  status?: 0 | 1;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

// 👇 Interface cho dữ liệu Dashboard & Biểu đồ
export interface ChartData {
  name: string;
  value: number;
}

export interface DashboardStats {
  totalUsers: number;
  totalVendors: number;
  totalCustomers: number;
  totalStations: number;
  totalSessions: number;
  totalRevenue: number;
  revenueChartData: ChartData[];
  sessionChartData: ChartData[];
}

// 👇 Interface cho Trạm Cứu Hộ (Nên định nghĩa rõ thay vì dùng any)
export interface RescueStationRequest {
    name: string;
    phone: string;
    email?: string;
    addressDetail: string;
    province: string;
    openTime: string; // HH:mm
    closeTime: string; // HH:mm
    latitude?: number;
    longitude?: number;
}

export interface ChargingSessionFilterParams {
  page?: number;
  size?: number;
  customerId?: number;
  stationId?: number;
  status?: string;
  startTimeFrom?: string;
  startTimeTo?: string;
  customerName?: string;
  stationName?: string;
  licensePlate?: string;
}

export interface TransactionFilterParams {
  page?: number;
  size?: number;
  customerId?: number;
  stationId?: number;
  paymentStatus?: string;
  paymentMethod?: string;
  paymentTimeFrom?: string;
  paymentTimeTo?: string;
  amountFrom?: number;
  amountTo?: number;
  customerName?: string;
  stationName?: string;
}
// ----------------------------------------------------

// --- 2. CẤU HÌNH API ---

export const adminApi = createApi({
  reducerPath: 'adminApi',
  tagTypes: ['Users', 'Stats', 'Rescue'],
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
    // 1. Lấy thống kê đơn giản
    getDashboardStats: builder.query<ApiResponse<any>, void>({
      query: () => '/stats',
      providesTags: ['Stats'],
    }),

    // 2. Lấy thống kê Dashboard Chi tiết
    getDashboardOverview: builder.query<ApiResponse<DashboardStats>, void>({
      query: () => '/dashboard-stats',
      providesTags: ['Stats'],
    }),

    // 3. Lấy danh sách user
    getUsers: builder.query<ApiResponse<PageResponse<any>>, UserFilterParams>({
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

    // 4. Xóa user
    deleteUser: builder.mutation<ApiResponse<any>, number>({
      query: (id) => ({
        url: `/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Users', 'Stats'],
    }),

    // 5. Tạo user mới
    createUser: builder.mutation<ApiResponse<RegisterResponse>, RegisterRequest>({
      query: (body) => ({
        url: `/users`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Users', 'Stats'],
    }),

    // 6. Lấy danh sách Trạm sạc của Vendor
    getVendorStations: builder.query<ApiResponse<PageResponse<any>>, { id: number; page?: number }>({
      query: ({ id, page }) => ({
        url: `/vendors/${id}/stations`,
        params: { page: page ?? 0, size: 5 }
      }),
    }),

    // 7. Lấy danh sách Xe của Customer
    getCustomerVehicles: builder.query<ApiResponse<PageResponse<any>>, { id: number; page?: number }>({
      query: ({ id, page }) => ({
        url: `/customers/${id}/vehicles`,
        params: { page: page ?? 0, size: 5 }
      }),
    }),

 // 1. Get List (Có Search & Page)
    getRescueStations: builder.query<ApiResponse<PageResponse<any>>, { page?: number, keyword?: string }>({
      query: ({ page, keyword }) => ({
        url: '/rescue-stations',
        params: { page: page ?? 0, size: 6, keyword: keyword ?? '' }
      }),
      providesTags: ['Rescue'],
    }),

    // 2. Create
    createRescueStation: builder.mutation<ApiResponse<any>, RescueStationRequest>({
      query: (body) => ({
        url: '/rescue-stations',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Rescue'],
    }),

    // 3. Update (QUAN TRỌNG: Bạn cần đoạn này để có hook useUpdate...)
    updateRescueStation: builder.mutation<ApiResponse<any>, { id: number, data: RescueStationRequest }>({
      query: ({ id, data }) => ({
        url: `/rescue-stations/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Rescue'],
    }),

    // 4. Delete
    deleteRescueStation: builder.mutation<ApiResponse<any>, number>({
      query: (id) => ({
        url: `/rescue-stations/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Rescue'],
    }),

    getChargingSessions: builder.query({
      query: (params: ChargingSessionFilterParams) => ({
        url: '/admin/charging-sessions',
        params
      })
    }),
    
    getTransactions: builder.query({
      query: (params: TransactionFilterParams) => ({
        url: '/admin/transactions',
        params
      })
    }),

  }),
});
// --- 3. EXPORT HOOKS ---
export const {
  useGetDashboardStatsQuery,
  useGetUsersQuery,
  useDeleteUserMutation,
  useCreateUserMutation,
  useGetVendorStationsQuery,
  useGetCustomerVehiclesQuery,
  useGetDashboardOverviewQuery, // 👈 Đã thêm dấu phẩy ở đây (Code cũ bị thiếu)
  useGetRescueStationsQuery,
  useCreateRescueStationMutation,
  useDeleteRescueStationMutation,
  useUpdateRescueStationMutation,
  useGetChargingSessionsQuery,
  useGetTransactionsQuery,
} = adminApi;
