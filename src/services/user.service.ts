import { axiosInstance } from "@/lib/axios";
import type {
  User,
  CreateUserPayload,
  UpdateUserPayload,
  ApiResponse,
} from "@/types/user";

/**
 * Lấy danh sách tất cả users
 * API: GET /api/Users
 */
export const getUsers = async (): Promise<User[]> => {
  const res = await axiosInstance.get<ApiResponse<User[]> | User[]>("/api/Users");
  const body = res.data;

  // Case 1: API trả về chuẩn { data: User[] }
  if (
    body &&
    typeof body === "object" &&
    "data" in body &&
    Array.isArray(body.data)
  ) {
    return body.data;
  }

  // Case 2: API trả thẳng User[]
  if (Array.isArray(body)) {
    return body;
  }

  console.warn("getUsers: unexpected response shape", body);
  return [];
};

/**
 * Lấy chi tiết một user theo id
 * API: GET /api/Users/{id}
 */
export const getUserById = async (
  userId: string,
): Promise<User | null> => {
  const res = await axiosInstance.get<ApiResponse<User> | User>(
    `/api/Users/${userId}`,
  );
  const body = res.data;

  // Case 1: { data: User }
  if (
    body &&
    typeof body === "object" &&
    "data" in body &&
    body.data
  ) {
    return body.data;
  }

  // Case 2: User
  if (body && typeof body === "object") {
    return body as User;
  }

  console.warn("getUserById: unexpected response shape", body);
  return null;
};

/**
 * Tạo user mới
 * API: POST /api/Users
 */
export const createUser = async (payload: CreateUserPayload): Promise<User> => {
  const res = await axiosInstance.post("/api/Users", payload);
  const body = res.data;
  
  if (body && typeof body === "object" && "data" in body) {
    return body.data;
  }
  return body as User;
};

/**
 * Cập nhật user
 * API: PUT /api/Users/{id}
 */
export const updateUser = async (id: string, payload: UpdateUserPayload): Promise<User> => {
  const res = await axiosInstance.put(`/api/Users/${id}`, payload);
  const body = res.data;
  
  if (body && typeof body === "object" && "data" in body) {
    return body.data;
  }
  return body as User;
};

/**
 * Xóa user
 * API: DELETE /api/Users/{id}
 */
export const deleteUser = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/api/Users/${id}`);
};
