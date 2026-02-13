export interface Product {
  productId: string;
  name: string;
  description: string;
  basePrice: number;
  thumbnailUrl: string;
  categoryId: string;
  brandId: string;
  categoryName?: string;
  brandName?: string;
}

export interface CreateProductPayload {
  name: string;
  description: string;
  basePrice: number;
  thumbnailUrl: string;
  categoryId: string;
  brandId: string;
}

export interface UpdateProductPayload {
  name: string;
  description: string;
  basePrice: number;
  thumbnailUrl: string;
  categoryId: string;
  brandId: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}
