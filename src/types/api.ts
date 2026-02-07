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

export interface RegisterPayload {
  email: string;
  password: string;
}

export interface RegisterResponseData {
  userId: string;
  email: string;
  fullName: string;
  role: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}
