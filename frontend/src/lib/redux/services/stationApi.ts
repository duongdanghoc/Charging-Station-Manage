import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// --- CÁC INTERFACE DỮ LIỆU ---

export interface BaseApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export interface ChargingConnector {
  id: number;
  connectorType: string;
  maxPower: number;
  status: "AVAILABLE" | "INUSE" | "OUTOFSERVICE";
}

export interface ChargingPole {
  id: number;
  stationId?: number;
  manufacturer: string;
  maxPower: number;
  connectorCount: number;
  installDate: string;
  connectors: ChargingConnector[];
}

export interface UpdateChargingPoleRequest {
  manufacturer?: string;
  maxPower?: number;
  maxConnectors?: number;
  installDate?: string;
  connectors: ChargingConnector[];
}

export interface Station {
  id: number;
  name: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  openTime: string;
  closeTime: string;
  status: number;
  type: "CAR" | "MOTORBIKE" | "BICYCLE";
  vendorName?: string;
  poles: number;
  
  // 👇 CẬP NHẬT: Thêm 2 trường mới để hiển thị thống kê chính xác
  ports: number;       // Tổng số đầu sạc
  activePorts: number; // Số đầu sạc đang sẵn sàng
}

export interface CreateStationRequest {
  name: string;
  openTime: string;
  closeTime: string;
  type: string;
  latitude: number;
  longitude: number;
  province: string;
  addressDetail: string;
}

export interface CreateChargingPoleRequest {
  stationId: number;
  manufacturer: string;
  maxPower: number;
  maxConnectors: number;
  installDate?: string;
}

export interface CreateConnectorRequest {
  poleId: number;
  connectorType: string;
  maxPower: number;
}

export interface StationFilterParams {
  page: number;
  size: number;
  search?: string;
  status?: number;
  type?: "CAR" | "MOTORBIKE" | "BICYCLE";
}

export interface UpdateStationRequest extends Partial<CreateStationRequest> {
  status?: number;
}

interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

// --- DEFINITION API ---

export const stationApi = createApi({
  reducerPath: "stationApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    prepareHeaders: (headers) => {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("authToken");
        if (token) {
          headers.set("Authorization", `Bearer ${token}`);
        }
      }
      return headers;
    },
  }),
  tagTypes: ["Stations", "Poles"],
  endpoints: (builder) => ({

    // 1. Lấy danh sách trạm
    getMyStations: builder.query<PageResponse<Station>, StationFilterParams>({
      query: (params) => {
        const qs = new URLSearchParams();
        qs.append("page", params.page.toString());
        qs.append("size", params.size.toString());
        if (params.search) qs.append("search", params.search);
        if (params.status !== undefined) qs.append("status", params.status.toString());
        if (params.type) qs.append("type", params.type);

        return `/api/stations/me?${qs.toString()}`;
      },
      providesTags: ["Stations"],
    }),

    // 2. Tạo trạm mới
    createStation: builder.mutation<Station, CreateStationRequest>({
      query: (body) => ({
        url: "/api/stations",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Stations"],
    }),

    // 3. Cập nhật trạm
    updateStation: builder.mutation<Station, { id: number; data: UpdateStationRequest }>({
      query: ({ id, data }) => ({
        url: `/api/stations/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Stations"],
    }),

    // 4. Xóa trạm
    deleteStation: builder.mutation<void, number>({
      query: (id) => ({
        url: `/api/stations/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Stations"],
    }),

    // 5. Lấy chi tiết 1 trạm
    getStationById: builder.query<BaseApiResponse<Station>, number>({
      query: (id) => `/api/stations/${id}`,
      providesTags: (result, error, id) => [{ type: "Stations", id }],
    }),

    // --- TRỤ SẠC (POLES) ---

    // 6. Thêm trụ sạc
    createChargingPole: builder.mutation<BaseApiResponse<ChargingPole>, CreateChargingPoleRequest>({
      query: (body) => ({
        url: "/api/vendor/charging-poles",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Stations", "Poles"],
    }),

    // 7. Xóa trụ sạc
    deleteChargingPole: builder.mutation<BaseApiResponse<void>, number>({
      query: (id) => ({
        url: `/api/vendor/charging-poles/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Stations", "Poles"],
    }),

    // 8. Cập nhật trụ sạc
    updateChargingPole: builder.mutation<BaseApiResponse<ChargingPole>, { id: number; body: UpdateChargingPoleRequest }>({
      query: ({ id, body }) => ({
        url: `/api/vendor/charging-poles/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Poles"],
    }),

    // --- ĐẦU SẠC (CONNECTORS) ---

    // 9. Thêm đầu sạc
    createConnector: builder.mutation<BaseApiResponse<void>, CreateConnectorRequest>({
      query: (body) => ({
        url: "/api/vendor/connectors",
        method: "POST",
        body,
      }),
      // 👇 Quan trọng: Reload cả Poles (chi tiết) và Stations (để cập nhật số lượng connectors bên ngoài)
      invalidatesTags: ["Poles", "Stations"], 
    }),

    // 10. Xóa đầu sạc
    deleteConnector: builder.mutation<BaseApiResponse<void>, number>({
      query: (id) => ({
        url: `/api/vendor/connectors/${id}`,
        method: "DELETE",
      }),
      // 👇 Quan trọng: Reload cả Poles và Stations
      invalidatesTags: ["Poles", "Stations"],
    }),

    // 11. API Lấy danh sách trụ theo trạm
    getPolesByStationId: builder.query<BaseApiResponse<ChargingPole[]>, number>({
      query: (stationId) => `/api/stations/${stationId}/poles`,
      providesTags: (result, error, id) => [{ type: "Poles", id }],
    }),

    // Get customer's vehicles
    getCustomerVehicles: builder.query<any[], void>({
        query: () => '/api/vehicles',
    }),
  }),
});

// Export hooks
export const {
  useGetMyStationsQuery,
  useCreateStationMutation,
  useUpdateStationMutation,
  useDeleteStationMutation,
  useGetCustomerVehiclesQuery,
  useGetStationByIdQuery,

  // Hooks Trụ sạc
  useCreateChargingPoleMutation,
  useDeleteChargingPoleMutation,
  useUpdateChargingPoleMutation,

  // Hooks Đầu sạc
  useCreateConnectorMutation,
  useDeleteConnectorMutation,

  useGetPolesByStationIdQuery,
} = stationApi;