import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../store';

// --- 1. ĐỊNH NGHĨA CÁC INTERFACE (Types) ---

// Response chuẩn từ Backend (BaseApiResponse)
export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  pageNumber?: number;
  last?: boolean;
  first?: boolean;
  empty?: boolean;
  numberOfElements?: number;
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

export interface RescueStationRequest {
  name: string;
  phone: string;
  email?: string;
  addressDetail: string;
  province: string;
  openTime: string;
  closeTime: string;
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
  endTimeFrom?: string;
  endTimeTo?: string;
  customerName?: string;
  stationName?: string;
  licensePlate?: string;
}

export interface ChargingSessionDetailResponse {
  sessionId: number;
  id?: number;
  customerId: number;
  customerName: string;
  stationId: number;
  stationName: string;
  stationAddress?: string;
  vendorName?: string;
  licensePlate?: string;
  vehicleModel?: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  energyConsumed?: number;
  energyKwh?: number;
  power?: number;
  pricePerKwh?: number;
  totalAmount?: number;
  cost?: number;
  status: 'PENDING' | 'CHARGING' | 'COMPLETED' | 'CANCELLED' | 'FAILED';
  paymentStatus?: string;
  portId?: number;
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

export interface TransactionDetailResponse {
  id: number;
  transactionId: string;
  transactionCode?: string;
  customerId: number;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  stationId: number;
  stationName: string;
  stationAddress?: string;
  sessionId?: number;
  amount: number;
  fee?: number;
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'CANCELLED';
  paymentMethod: 'BANK_TRANSFER' | 'CREDIT_CARD' | 'E_WALLET' | 'CASH' | 'SYSTEM';
  paymentTime: string;
  createdAt: string;
  bankName?: string;
  bankAccount?: string;
  paymentReference?: string;
  note?: string;
}

export interface ChargingSessionApiResponse {
  success: boolean;
  message: string;
  data: PageResponse<ChargingSessionDetailResponse>;
  timestamp: string;
}

// ----------------------------------------------------

// --- 2. CẤU HÌNH API ---

export const adminApi = createApi({
  reducerPath: 'adminApi',
  tagTypes: ['Users', 'Stats', 'Rescue', 'ChargingSessions', 'Transactions'],
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL + '/api/admin',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;

      // 🔍 Debug logging
      console.log('🔑 Token from Redux:', token ? 'EXISTS' : 'MISSING');

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

    // 8. Get Rescue Stations
    getRescueStations: builder.query<ApiResponse<PageResponse<any>>, { page?: number, keyword?: string }>({
      query: ({ page, keyword }) => ({
        url: '/rescue-stations',
        params: { page: page ?? 0, size: 6, keyword: keyword ?? '' }
      }),
      providesTags: ['Rescue'],
    }),

    // 9. Create Rescue Station
    createRescueStation: builder.mutation<ApiResponse<any>, RescueStationRequest>({
      query: (body) => ({
        url: '/rescue-stations',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Rescue'],
    }),

    // 10. Update Rescue Station
    updateRescueStation: builder.mutation<ApiResponse<any>, { id: number, data: RescueStationRequest }>({
      query: ({ id, data }) => ({
        url: `/rescue-stations/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Rescue'],
    }),

    // 11. Delete Rescue Station
    deleteRescueStation: builder.mutation<ApiResponse<any>, number>({
      query: (id) => ({
        url: `/rescue-stations/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Rescue'],
    }),

    // 12. GET CHARGING SESSIONS - FIXED VERSION
    getChargingSessions: builder.query<
      ChargingSessionApiResponse,
      ChargingSessionFilterParams
    >({
      query: (params) => {
        // Loại bỏ các params undefined/null/empty
        const cleanParams = Object.fromEntries(
          Object.entries(params).filter(([_, v]) =>
            v !== undefined && v !== null && v !== ''
          )
        );

        console.log('📡 Fetching Charging Sessions with params:', cleanParams);

        return {
          url: '/charging-sessions',
          params: cleanParams,
        };
      },
      providesTags: (result) =>
        result?.data?.content
          ? [
              ...result.data.content.map(({ sessionId, id }) => ({
                type: 'ChargingSessions' as const,
                id: sessionId || id
              })),
              { type: 'ChargingSessions', id: 'LIST' },
            ]
          : [{ type: 'ChargingSessions', id: 'LIST' }],
      transformResponse: (response: ChargingSessionApiResponse) => {
        console.log('✅ Charging Sessions Response:', response);
        return response;
      },
      transformErrorResponse: (response: any) => {
        console.error('❌ Charging Sessions Error:', response);
        return response;
      },
    }),

    // 13. GET TRANSACTIONS - FIXED VERSION
    getTransactions: builder.query<
      PageResponse<TransactionDetailResponse>,
      TransactionFilterParams
    >({
      query: (params) => {
        const cleanParams = Object.fromEntries(
          Object.entries(params).filter(([_, v]) =>
            v !== undefined && v !== null && v !== ''
          )
        );

        console.log('📡 Fetching Transactions with params:', cleanParams);

        return {
          url: '/transactions',
          params: cleanParams,
        };
      },
      providesTags: (result) =>
        result?.content
          ? [
              ...result.content.map(({ transactionId }) => ({
                type: 'Transactions' as const,
                id: transactionId
              })),
              { type: 'Transactions', id: 'LIST' },
            ]
          : [{ type: 'Transactions', id: 'LIST' }],
      transformResponse: (response: ApiResponse<PageResponse<TransactionDetailResponse>>) => {
        console.log('✅ Transactions Response:', response);
        return response.data;
      },
      transformErrorResponse: (response: any) => {
        console.error('❌ Transactions Error:', response);
        return response;
      },
    }),

    // 14. Export transactions
    exportTransactions: builder.query({
      query: (params) => ({
        url: '/transactions/export',
        params,
        responseHandler: (response) => response.blob(),
      }),
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
  useGetDashboardOverviewQuery,
  useExportTransactionsQuery,
  useGetRescueStationsQuery,
  useCreateRescueStationMutation,
  useDeleteRescueStationMutation,
  useUpdateRescueStationMutation,
  useGetChargingSessionsQuery,
  useGetTransactionsQuery,
} = adminApi;
