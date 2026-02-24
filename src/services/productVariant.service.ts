import axios from "axios";
import { axiosConfig } from "@/config/axios.config";
import { ProductVariant, CreateProductVariantPayload, UpdateProductVariantPayload, UpdateStockPayload } from "@/types/productVariant";

const api = axios.create(axiosConfig);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export const getProductVariants = async (productId: string): Promise<ProductVariant[]> => {
  try {
    const response = await api.get(`${API_BASE_URL}/products/${productId}/variants`);
    console.log("API Response:", response.data);
    console.log("Response data type:", typeof response.data);
    
    // Xử lý các trường hợp response khác nhau
    let variants: ProductVariant[] = [];
    
    if (Array.isArray(response.data)) {
      variants = response.data;
    } else if (response.data && typeof response.data === 'object') {
      // Nếu response là object, thử tìm property chứa mảng
      if (response.data.data && Array.isArray(response.data.data)) {
        variants = response.data.data;
      } else if (response.data.variants && Array.isArray(response.data.variants)) {
        variants = response.data.variants;
      } else {
        console.warn("Unexpected response structure:", response.data);
      }
    }
    
    console.log("Processed variants:", variants);
    return variants;
  } catch (error) {
    console.error("Error fetching product variants:", error);
    throw error;
  }
};

export const getProductVariantById = async (productId: string, variantId: string): Promise<ProductVariant> => {
  try {
    const response = await api.get(`${API_BASE_URL}/products/${productId}/variants/${variantId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching product variant:", error);
    throw error;
  }
};

export const createProductVariant = async (productId: string, payload: CreateProductVariantPayload): Promise<ProductVariant> => {
  try {
    const response = await api.post(`${API_BASE_URL}/products/${productId}/variants`, payload);
    return response.data;
  } catch (error) {
    console.error("Error creating product variant:", error);
    throw error;
  }
};

export const updateProductVariant = async (productId: string, variantId: string, payload: UpdateProductVariantPayload): Promise<ProductVariant> => {
  try {
    const response = await api.put(`${API_BASE_URL}/products/${productId}/variants/${variantId}`, payload);
    return response.data;
  } catch (error) {
    console.error("Error updating product variant:", error);
    throw error;
  }
};

export const deleteProductVariant = async (productId: string, variantId: string): Promise<void> => {
  try {
    await api.delete(`${API_BASE_URL}/products/${productId}/variants/${variantId}`);
  } catch (error) {
    console.error("Error deleting product variant:", error);
    throw error;
  }
};

export const updateVariantStock = async (productId: string, variantId: string, payload: UpdateStockPayload): Promise<void> => {
  try {
    await api.patch(`${API_BASE_URL}/products/${productId}/variants/${variantId}/stock`, payload);
  } catch (error) {
    console.error("Error updating variant stock:", error);
    throw error;
  }
};
