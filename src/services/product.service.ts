import { axiosInstance } from "@/lib/axios";
import type { ApiResponse, Product } from "@/types/api";

/**
 * Lấy danh sách tất cả sản phẩm
 * API: GET /Products
 */
export const getProducts = async (): Promise<Product[]> => {
  const res = await axiosInstance.get<ApiResponse<Product[]> | Product[]>("/Products");
  const body = res.data;

  // Case 1: API trả về chuẩn { data: Product[] }
  if (
    body &&
    typeof body === "object" &&
    "data" in body &&
    Array.isArray(body.data)
  ) {
    return body.data;
  }

  // Case 2: API trả thẳng Product[]
  if (Array.isArray(body)) {
    return body;
  }

  console.warn("getProducts: unexpected response shape", body);
  return [];
};

/**
 * Lấy chi tiết một sản phẩm theo id
 * API: GET /Products/{id}
 */
export const getProductById = async (
  productId: string,
): Promise<Product | null> => {
  const res = await axiosInstance.get<ApiResponse<Product> | Product>(
    `/Products/${productId}`,
  );
  const body = res.data;

  // Case 1: { data: Product }
  if (
    body &&
    typeof body === "object" &&
    "data" in body &&
    body.data
  ) {
    return body.data;
  }

  // Case 2: Product
  if (body && typeof body === "object") {
    return body as Product;
  }

  console.warn("getProductById: unexpected response shape", body);
  return null;
};
