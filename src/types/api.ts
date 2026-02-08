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

export interface RegisterFinalizePayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  address: string;
}
