import { axiosInstance } from "@/lib/axios";
import type {
  Product,
  CreateProductPayload,
  UpdateProductPayload,
  ProductVariant,
  CreateProductVariantPayload,
  UpdateProductVariantPayload,
  UpdateStockPayload,
  ApiResponse,
} from "@/types/product";

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

/**
 * Tạo sản phẩm mới
 * API: POST /Products
 */
export const createProduct = async (payload: CreateProductPayload): Promise<Product> => {
  const res = await axiosInstance.post("/Products", payload);
  const body = res.data;
  
  if (body && typeof body === "object" && "data" in body) {
    return body.data;
  }
  return body as Product;
};

/**
 * Cập nhật sản phẩm
 * API: PUT /Products/{id}
 */
export const updateProduct = async (id: string, payload: UpdateProductPayload): Promise<Product> => {
  const res = await axiosInstance.put(`/Products/${id}`, payload);
  const body = res.data;
  
  if (body && typeof body === "object" && "data" in body) {
    return body.data;
  }
  return body as Product;
};

/**
 * Xóa sản phẩm
 * API: DELETE /Products/{id}
 */
export const deleteProduct = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/Products/${id}`);
};

// ===== PRODUCT VARIANT MANAGEMENT =====

/**
 * Tạo variant mới cho sản phẩm
 * API: POST /api/products/{productId}/variants
 */
export const createProductVariant = async (
  productId: string,
  payload: CreateProductVariantPayload,
): Promise<ProductVariant> => {
  const res = await axiosInstance.post(`/products/${productId}/variants`, payload);
  const body = res.data;
  
  if (body && typeof body === "object" && "data" in body) {
    return body.data;
  }
  return body as ProductVariant;
};

/**
 * Lấy danh sách variants của một sản phẩm
 * API: GET /api/products/{productId}/variants
 */
export const getProductVariants = async (
  productId: string,
): Promise<ProductVariant[]> => {
  const res = await axiosInstance.get<ApiResponse<ProductVariant[]> | ProductVariant[]>(
    `/products/${productId}/variants`,
  );
  const body = res.data;

  // Case 1: API trả về chuẩn { data: ProductVariant[] }
  if (
    body &&
    typeof body === "object" &&
    "data" in body &&
    Array.isArray(body.data)
  ) {
    return body.data;
  }

  // Case 2: API trả thẳng ProductVariant[]
  if (Array.isArray(body)) {
    return body;
  }

  console.warn("getProductVariants: unexpected response shape", body);
  return [];
};

/**
 * Lấy chi tiết một variant theo productId và variantId
 * API: GET /api/products/{productId}/variants/{variantId}
 */
export const getProductVariantById = async (
  productId: string,
  variantId: string,
): Promise<ProductVariant | null> => {
  const res = await axiosInstance.get<ApiResponse<ProductVariant> | ProductVariant>(
    `/products/${productId}/variants/${variantId}`,
  );
  const body = res.data;

  // Case 1: { data: ProductVariant }
  if (
    body &&
    typeof body === "object" &&
    "data" in body &&
    body.data
  ) {
    return body.data;
  }

  // Case 2: ProductVariant
  if (body && typeof body === "object") {
    return body as ProductVariant;
  }

  console.warn("getProductVariantById: unexpected response shape", body);
  return null;
};

/**
 * Cập nhật thông tin variant
 * API: PUT /api/products/{productId}/variants/{variantId}
 */
export const updateProductVariant = async (
  productId: string,
  variantId: string,
  payload: UpdateProductVariantPayload,
): Promise<ProductVariant> => {
  const res = await axiosInstance.put(
    `/products/${productId}/variants/${variantId}`,
    payload,
  );
  const body = res.data;
  
  if (body && typeof body === "object" && "data" in body) {
    return body.data;
  }
  return body as ProductVariant;
};

/**
 * Xóa variant
 * API: DELETE /api/products/{productId}/variants/{variantId}
 */
export const deleteProductVariant = async (
  productId: string,
  variantId: string,
): Promise<void> => {
  await axiosInstance.delete(`/products/${productId}/variants/${variantId}`);
};

/**
 * Cập nhật số lượng tồn kho của variant
 * API: PATCH /api/products/{productId}/variants/{variantId}/stock
 */
export const updateVariantStock = async (
  productId: string,
  variantId: string,
  quantity: number,
): Promise<void> => {
  await axiosInstance.patch(`/products/${productId}/variants/${variantId}/stock`, {
    quantity,
  });
};
