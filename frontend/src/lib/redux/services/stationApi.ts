import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface ChargingConnector {
  id: number;
  connectorType: string; // TYPE1, TYPE2, CCS...
  maxPower: number;
  status: "AVAILABLE" | "INUSE" | "OUTOFSERVICE";
}

export interface ChargingPole {
  id: number;
  manufacturer: string;
  maxPower: number;
  connectorCount: number;
  installDate: string;
  connectors: ChargingConnector[];
}

export interface Station {
  id: number;
  name: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  openTime: string; // "HH:mm:ss"
  closeTime: string;
  status: number; // 1: Active, 0: Inactive
  type: "CAR" | "MOTORBIKE" | "BICYCLE";
  vendorName?: string;
  poles?: ChargingPole[];
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

export interface StationFilterParams {
  page: number;
  size: number;
  search?: string;
  status?: number; // 1 | 0
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

export const stationApi = createApi({
  reducerPath: "stationApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("authToken");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Stations"],
  endpoints: (builder) => ({
    // Lấy danh sách trạm của Vendor (API /me vừa tạo)
    getMyStations: builder.query<PageResponse<Station>, StationFilterParams>({
      query: (params) => {
        // Build query string
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

    createStation: builder.mutation<Station, CreateStationRequest>({
      query: (body) => ({
        url: "/api/stations",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Stations"],
    }),

    updateStation: builder.mutation<Station, { id: number; data: UpdateStationRequest }>({
      query: ({ id, data }) => ({
        url: `/api/stations/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Stations"],
    }),

    deleteStation: builder.mutation<void, number>({
      query: (id) => ({
        url: `/api/stations/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Stations"],
    }),
  }),
});

export const {
  useGetMyStationsQuery,
  useCreateStationMutation,
  useUpdateStationMutation,
  useDeleteStationMutation,
} = stationApi;
