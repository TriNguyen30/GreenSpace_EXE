import { axiosInstance } from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import type { Rating } from "@/types/rating";

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

/**
 * Lấy danh sách rating (review) của một sản phẩm.
 * API: GET /Ratings/product/{productId}
 */
export const getProductRatings = async (
  productId: string,
): Promise<Rating[]> => {
  const res = await axiosInstance.get(`/Ratings/product/${productId}`);
  const body = res.data as ApiResponse<Rating[]> | Rating[];

  // Backend có thể trả thẳng mảng Rating[]
  if (Array.isArray(body)) {
    return body as Rating[];
  }

  // Hoặc bọc trong ApiResponse<Rating[]>
  if (Array.isArray((body as ApiResponse<Rating[]>)?.data)) {
    return (body as ApiResponse<Rating[]>)?.data;
  }

  return [];
};

