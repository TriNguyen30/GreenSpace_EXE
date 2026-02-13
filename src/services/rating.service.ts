import { axiosInstance } from "@/lib/axios";
import type { ApiResponse } from "@/types/api";

/**
 * Lấy điểm rating trung bình của một sản phẩm.
 * API: GET /Ratings/product/{productId}/average
 */
export const getProductAverageRating = async (
  productId: string,
): Promise<number | null> => {
  const res = await axiosInstance.get(`/Ratings/product/${productId}/average`);
  const body = res.data as ApiResponse<number> | number;

  // Trường hợp backend trả thẳng số (4.5)
  if (typeof body === "number") {
    return body;
  }

  // Trường hợp backend bọc trong ApiResponse<number>
  if (typeof (body as ApiResponse<number>).data === "number") {
    return (body as ApiResponse<number>).data;
  }

  return null;
};

