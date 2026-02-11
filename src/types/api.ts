export interface ApiResponse<T> {
  data: T;
  isSuccess: boolean;
  message: string;
  errors: string[] | null;
  statusCode: number;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponseData {
  userId: string;
  email: string;
  fullName: string;
  role: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

export interface RegisterInitiatePayload {
  email: string;
}

export interface RegisterVerifyPayload {
  email: string;
  otp: string;
}

export interface RegisterResendPayload {
  email: string;
}

export interface PasswordForgotPayload {
  email: string;
}

export interface PasswordResendPayload {
  email: string;
}

export interface PasswordVerifyPayload {
  email: string;
  otp: string;
}

export interface PasswordResetPayload {
  email: string;
  newPassword: string;
  confirmPassword: string;
}

export interface RegisterFinalizePayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  address: string;
}

// Product
export interface ProductVariant {
  variantId: string;
  name: string;
  price: number;
  stockQuantity: number;
}

export interface Product {
  productId: string;
  name: string;
  description: string;
  basePrice: number;
  thumbnailUrl: string;
  categoryName: string;
  brandName?: string | null;
  variants: ProductVariant[];
}