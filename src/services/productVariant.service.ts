import { api } from "@/config/axios.config";
import { ProductVariant, CreateProductVariantPayload, UpdateProductVariantPayload, UpdateStockPayload } from "@/types/productVariant";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export const getProductVariants = async (productId: string): Promise<ProductVariant[]> => {
  try {
    console.log("Fetching variants for product:", productId);
    console.log("API URL:", `${API_BASE_URL}/products/${productId}/variants`);
    
    const response = await api.get(`${API_BASE_URL}/products/${productId}/variants`);
    console.log("API Response:", response.data);
    console.log("Response data type:", typeof response.data);
    console.log("Response structure:", {
      hasData: 'data' in response.data,
      hasIsSuccess: 'isSuccess' in response.data,
      dataType: typeof response.data.data
    });
    
    // Xử lý response structure từ Swagger: { data: [...], isSuccess: true, ... }
    let variants: ProductVariant[] = [];
    
    if (response.data && response.data.data && Array.isArray(response.data.data)) {
      variants = response.data.data;
      console.log("Extracted variants from response.data.data:", variants);
    } else if (Array.isArray(response.data)) {
      variants = response.data;
      console.log("Using response.data directly as array:", variants);
    } else {
      console.warn("Unexpected response structure:", response.data);
    }
    
    console.log("Final variants array:", variants);
    console.log("Variants count:", variants.length);
    return variants;
  } catch (error: any) {
    console.error("Error fetching product variants:", error);
    
    // Xử lý chi tiết các loại lỗi
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      
      console.error("Response status:", status);
      console.error("Response data:", data);
      
      if (status === 401) {
        throw new Error("Authentication failed. Please check your login status.");
      } else if (status === 403) {
        throw new Error("You don't have permission to perform this action.");
      } else if (status === 404) {
        throw new Error("Product not found.");
      } else if (status === 400) {
        const message = data?.message || "Invalid data provided.";
        throw new Error(`Validation error: ${message}`);
      }
    }
    
    // Nếu là lỗi network hoặc không có response
    if (!error.response) {
      throw new Error("Network error. Please check your connection.");
    }
    
    throw error;
  }
};

export const getProductVariantById = async (productId: string, variantId: string): Promise<ProductVariant> => {
  try {
    console.log(`Fetching variant: productId=${productId}, variantId=${variantId}`);
    const response = await api.get(`${API_BASE_URL}/products/${productId}/variants/${variantId}`);
    console.log("Variant detail response:", response.data);
    console.log("Response structure:", {
      hasData: 'data' in response.data,
      hasIsSuccess: 'isSuccess' in response.data,
      dataType: typeof response.data.data
    });
    
    // Xử lý response structure từ Swagger: { data: {...}, isSuccess: true, ... }
    if (response.data && response.data.data) {
      console.log("Extracted variant from response.data.data:", response.data.data);
      return response.data.data;
    } else if (response.data) {
      console.log("Using response.data directly:", response.data);
      return response.data;
    } else {
      throw new Error("No variant data found in response");
    }
  } catch (error: any) {
    console.error("Error fetching product variant:", error);
    
    // Xử lý chi tiết các loại lỗi
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      
      console.error("Response status:", status);
      console.error("Response data:", data);
      
      if (status === 401) {
        throw new Error("Authentication failed. Please check your login status.");
      } else if (status === 403) {
        throw new Error("You don't have permission to perform this action.");
      } else if (status === 404) {
        throw new Error("Product or variant not found.");
      } else if (status === 400) {
        const message = data?.message || "Invalid data provided.";
        throw new Error(`Validation error: ${message}`);
      }
    }
    
    // Nếu là lỗi network hoặc không có response
    if (!error.response) {
      throw new Error("Network error. Please check your connection.");
    }
    
    throw error;
  }
};

export const createProductVariant = async (productId: string, payload: CreateProductVariantPayload): Promise<ProductVariant> => {
  try {
    console.log("Creating variant:", payload);
    console.log("Product ID:", productId);
    console.log("API URL:", `${API_BASE_URL}/products/${productId}/variants`);
    
    const response = await api.post(`${API_BASE_URL}/products/${productId}/variants`, payload);
    console.log("Create response status:", response.status);
    console.log("Create response data:", response.data);
    console.log("Create response headers:", response.headers);
    
    return response.data;
  } catch (error: any) {
    console.error("Error creating product variant:", error);
    
    // Xử lý chi tiết các loại lỗi
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      
      console.error("Response status:", status);
      console.error("Response data:", data);
      
      if (status === 401) {
        throw new Error("Authentication failed. Please check your login status.");
      } else if (status === 403) {
        throw new Error("You don't have permission to perform this action.");
      } else if (status === 404) {
        throw new Error("Product or variant not found.");
      } else if (status === 400) {
        const message = data?.message || "Invalid data provided.";
        throw new Error(`Validation error: ${message}`);
      }
    }
    
    // Nếu là lỗi network hoặc không có response
    if (!error.response) {
      throw new Error("Network error. Please check your connection.");
    }
    
    throw error;
  }
};

export const updateProductVariant = async (productId: string, variantId: string, payload: UpdateProductVariantPayload): Promise<ProductVariant> => {
  try {
    console.log("Updating variant:", payload);
    console.log("Product ID:", productId);
    console.log("Variant ID:", variantId);
    console.log("API URL:", `${API_BASE_URL}/products/${productId}/variants/${variantId}`);
    
    const response = await api.put(`${API_BASE_URL}/products/${productId}/variants/${variantId}`, payload);
    console.log("Update response status:", response.status);
    console.log("Update response data:", response.data);
    console.log("Update response headers:", response.headers);
    
    return response.data;
  } catch (error: any) {
    console.error("Error updating product variant:", error);
    
    // Xử lý chi tiết các loại lỗi
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      
      console.error("Response status:", status);
      console.error("Response data:", data);
      
      if (status === 401) {
        throw new Error("Authentication failed. Please check your login status.");
      } else if (status === 403) {
        throw new Error("You don't have permission to perform this action.");
      } else if (status === 404) {
        throw new Error("Product or variant not found.");
      } else if (status === 400) {
        const message = data?.message || "Invalid data provided.";
        throw new Error(`Validation error: ${message}`);
      }
    }
    
    // Nếu là lỗi network hoặc không có response
    if (!error.response) {
      throw new Error("Network error. Please check your connection.");
    }
    
    throw error;
  }
};

export const deleteProductVariant = async (productId: string, variantId: string): Promise<void> => {
  try {
    console.log("Deleting variant:");
    console.log("Product ID:", productId);
    console.log("Variant ID:", variantId);
    console.log("API URL:", `${API_BASE_URL}/products/${productId}/variants/${variantId}`);
    
    const response = await api.delete(`${API_BASE_URL}/products/${productId}/variants/${variantId}`);
    console.log("Delete response status:", response.status);
    console.log("Delete response data:", response.data);
    console.log("Delete response headers:", response.headers);
    
    return response.data;
  } catch (error: any) {
    console.error("Error deleting product variant:", error);
    
    // Xử lý chi tiết các loại lỗi
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      
      console.error("Response status:", status);
      console.error("Response data:", data);
      
      if (status === 401) {
        throw new Error("Authentication failed. Please check your login status.");
      } else if (status === 403) {
        throw new Error("You don't have permission to perform this action.");
      } else if (status === 404) {
        throw new Error("Product or variant not found.");
      } else if (status === 400) {
        const message = data?.message || "Invalid data provided.";
        throw new Error(`Validation error: ${message}`);
      }
    }
    
    // Nếu là lỗi network hoặc không có response
    if (!error.response) {
      throw new Error("Network error. Please check your connection.");
    }
    
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
