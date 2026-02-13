export interface User {
  id: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  editAddress: string;
  additionalAddress: string;
  status: string;
  isActive: boolean;
}

export interface CreateUserPayload {
  email: string;
  fullName: string;
  phoneNumber: string;
  editAddress: string;
  additionalAddress: string;
  status: string;
  isActive: boolean;
}

export interface UpdateUserPayload {
  email: string;
  fullName: string;
  phoneNumber: string;
  editAddress: string;
  additionalAddress: string;
  status: string;
  isActive: boolean;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}
