import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./auth";
import { BaseApiResponse } from "@/lib/redux/services/priceApi"; // Tái sử dụng type này

export const chargingPoleApi = createApi({
  reducerPath: "chargingPoleApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Stations"], // Quan trọng: Thêm/Xóa trụ sẽ làm thay đổi dữ liệu Station
  endpoints: (builder) => ({
    // 1. Thêm trụ sạc
    createChargingPole: builder.mutation<BaseApiResponse<any>, any>({
      query: (body) => ({
        url: "/api/vendor/charging-poles",
        method: "POST",
        body,
      }),
      // Thêm xong thì bắt Station load lại dữ liệu để hiện trụ mới
      invalidatesTags: ["Stations"], 
    }),

    // 2. Xóa trụ sạc
    deleteChargingPole: builder.mutation<BaseApiResponse<void>, number>({
      query: (id) => ({
        url: `/api/vendor/charging-poles/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Stations"],
    }),
  }),
});

export const { useCreateChargingPoleMutation, useDeleteChargingPoleMutation } = chargingPoleApi;