export interface User {
  id: string; // Mapped from userId for compatibility
  userId: string; // Original backend field
  email: string;
  fullName: string; // Computed: firstName + lastName
  firstName: string;
  lastName: string;
  phoneNumber: string | null;
  address: string | null; // Mapped from backend address
  editAddress: string | null; // Keep for compatibility if needed, or map
  additionalAddress: string | null;
  role: string;
  status: string | null;
  isActive: boolean;
  birthday: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface CreateUserPayload {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  editAddress: string;
  additionalAddress: string;
  isActive: boolean;
}

export interface UpdateUserPayload {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  editAddress: string;
  additionalAddress: string;
  isActive: boolean;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}
