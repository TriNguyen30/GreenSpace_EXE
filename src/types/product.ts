export interface Product {
  productId: string;
  name: string;
  description: string;
  basePrice: number;
  thumbnailUrl: string;
  categoryId: string;
  categoryName?: string;
}

export interface CreateProductPayload {
  name: string;
  description: string;
  basePrice: number;
  thumbnailUrl: string;
  categoryId: string;
}

export interface UpdateProductPayload {
  name: string;
  description: string;
  basePrice: number;
  thumbnailUrl: string;
  categoryId: string;
}

export interface ProductVariant {
  productId: string;
  sku: string;
  price: number;
  stockQuantity: number;
  imageUrl: string;
  color: string;
  sizeOrModel: string;
  variantId?: string;
  isActive?: boolean;
}

export interface CreateProductVariantPayload {
  productId: string;
  sku: string;
  price: number;
  stockQuantity: number;
  imageUrl: string;
  color: string;
  sizeOrModel: string;
}

export interface UpdateProductVariantPayload {
  sku: string;
  price: number;
  stockQuantity: number;
  imageUrl: string;
  color: string;
  sizeOrModel: string;
  isActive: boolean;
}

export interface UpdateStockPayload {
  quantity: number;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}
