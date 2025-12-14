import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./auth"; 
import { CreatePriceRequest, PriceResponse, UpdatePriceRequest } from "@/components/profile/types";

// 👇 1. KHAI BÁO TRỰC TIẾP INTERFACE NÀY ĐỂ TRÁNH LỖI IMPORT
export interface BaseApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export const priceApi = createApi({
  reducerPath: "priceApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Prices"],
  endpoints: (builder) => ({
    // 1. Lấy danh sách giá theo Trụ sạc
    getPricesByPole: builder.query<BaseApiResponse<PriceResponse[]>, number>({
      query: (poleId) => ({
        url: `/api/vendor/prices/pole/${poleId}`,
        method: "GET",
      }),
      // 👇 2. SỬA LỖI TYPESCRIPT Ở ĐÂY
      providesTags: (result) => {
        // Kiểm tra xem có result và result.data không
        if (result && result.data) {
          return [
            // Map từng phần tử, TypeScript sẽ tự hiểu item là PriceResponse
            ...result.data.map((item) => ({ type: "Prices" as const, id: item.id })),
            { type: "Prices", id: "LIST" },
          ];
        }
        return [{ type: "Prices", id: "LIST" }];
      },
    }),

    // 2. Tạo giá mới
    createPrice: builder.mutation<BaseApiResponse<PriceResponse>, CreatePriceRequest>({
      query: (body) => ({
        url: "/api/vendor/prices",
        method: "POST",
        body,
      }),
      // Thêm mới xong thì load lại danh sách
      invalidatesTags: [{ type: "Prices", id: "LIST" }],
    }),

    // 3. Cập nhật giá
    updatePrice: builder.mutation<
      BaseApiResponse<PriceResponse>,
      { id: number; body: UpdatePriceRequest }
    >({
      query: ({ id, body }) => ({
        url: `/api/vendor/prices/${id}`,
        method: "PUT",
        body,
      }),
      // Cập nhật xong thì load lại danh sách để đồng bộ dữ liệu
      invalidatesTags: [{ type: "Prices", id: "LIST" }],
    }),

    // 4. Xóa giá
    deletePrice: builder.mutation<BaseApiResponse<void>, number>({
      query: (id) => ({
        url: `/api/vendor/prices/${id}`,
        method: "DELETE",
      }),
      // Xóa xong cũng load lại danh sách
      invalidatesTags: [{ type: "Prices", id: "LIST" }],
    }),
  }),
});

export const {
  useGetPricesByPoleQuery,
  useCreatePriceMutation,
  useUpdatePriceMutation,
  useDeletePriceMutation,
} = priceApi;