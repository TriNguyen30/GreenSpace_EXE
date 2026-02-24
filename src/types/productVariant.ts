export interface ProductVariant {
  variantId: string;
  productId: string;
  sku: string;
  price: number;
  stockQuantity: number;
  imageUrl: string;
  color: string;
  sizeOrModel: string;
  isActive?: boolean;
  productName?: string;
  productThumbnail?: string;
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
