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
  try {

    const res = await axiosInstance.get<ApiResponse<User[]> | User[]>("/Users");

    const body = res.data;

    // Helper function to map API response to User interface
    const mapToUser = (item: any): User => ({
      ...item,
      id: item.userId || item.id || item.UserId || "",
      userId: item.userId || item.id || "",
      firstName: item.firstName || "",
      lastName: item.lastName || "",
      fullName: item.fullName || `${item.firstName || ""} ${item.lastName || ""}`.trim() || item.email?.split("@")[0] || "Unknown",
      phoneNumber: item.phoneNumber || null,
      address: item.address || null,
      editAddress: item.address || item.editAddress || "",
      additionalAddress: item.additionalAddress || "",
      role: item.role || "CUSTOMER",
      createdAt: item.createdAt || null,
      updatedAt: item.updatedAt || null,
      birthday: item.birthday || null,
      status: item.status || null,
      isActive: item.isActive ?? true,
    });

    // Case 1: API trả về chuẩn { data: User[] }
    if (
      body &&
      typeof body === "object" &&
      "data" in body &&
      Array.isArray(body.data)
    ) {
      return body.data.map(mapToUser);
    }

    // Case 2: API trả thẳng User[]
    if (Array.isArray(body)) {
      return body.map(mapToUser);
    }

    console.warn("getUsers: unexpected response shape", body);
    return [];
  } catch (error) {
    console.error("Error in getUsers:", error);
    throw error;
  }
};

/**
 * Lấy chi tiết một user theo id
 * API: GET /api/Users/{id}
 */
export const getUserById = async (
  userId: string,
): Promise<User | null> => {
  console.log(`Calling GET /Users/${userId}`);
  const res = await axiosInstance.get<ApiResponse<User> | User>(
    `/Users/${userId}`,
  );
  console.log("getUserById response:", res.data);
  const body = res.data;

  // Helper function to map API response to User interface
  const mapToUser = (item: any): User => ({
    ...item,
    id: item.userId || item.id || item.UserId || "",
    userId: item.userId || item.id || "",
    firstName: item.firstName || "",
    lastName: item.lastName || "",
    fullName: item.fullName || `${item.firstName || ""} ${item.lastName || ""}`.trim() || "Unknown",
    phoneNumber: item.phoneNumber || null,
    address: item.address || null,
    editAddress: item.address || item.editAddress || "",
    additionalAddress: item.additionalAddress || "",
    role: item.role || "CUSTOMER",
    createdAt: item.createdAt || null,
    updatedAt: item.updatedAt || null,
    birthday: item.birthday || null,
    status: item.status || null,
    isActive: item.isActive ?? true,
  });

  // Case 1: { data: User }
  if (
    body &&
    typeof body === "object" &&
    "data" in body &&
    body.data
  ) {
    return mapToUser(body.data);
  }

  // Case 2: User
  if (body && typeof body === "object") {
    return mapToUser(body);
  }

  console.warn("getUserById: unexpected response shape", body);
  return null;
};

/**
 * Tạo user mới
 * API: POST /api/Users
 */
export const createUser = async (payload: CreateUserPayload): Promise<User> => {
  const res = await axiosInstance.post("/Users", payload);
  const body = res.data;

  // Helper function to map API response to User interface
  const mapToUser = (item: any): User => ({
    ...item,
    id: item.userId || item.id || item.UserId || "",
    userId: item.userId || item.id || "",
    firstName: item.firstName || "",
    lastName: item.lastName || "",
    fullName: item.fullName || `${item.firstName || ""} ${item.lastName || ""}`.trim() || "Unknown",
    phoneNumber: item.phoneNumber || null,
    address: item.address || null,
    editAddress: item.address || item.editAddress || "",
    additionalAddress: item.additionalAddress || "",
    role: item.role || "CUSTOMER",
    createdAt: item.createdAt || null,
    updatedAt: item.updatedAt || null,
    birthday: item.birthday || null,
    status: item.status || null,
    isActive: item.isActive ?? true,
  });

  if (body && typeof body === "object" && "data" in body) {
    return mapToUser(body.data);
  }
  return mapToUser(body);
};

/**
 * Cập nhật user
 * API: PUT /api/Users/{id}
 */
export const updateUser = async (id: string, payload: UpdateUserPayload): Promise<User> => {
  const res = await axiosInstance.put(`/Users/${id}`, payload);
  const body = res.data;

  // Helper function to map API response to User interface
  const mapToUser = (item: any): User => ({
    ...item,
    id: item.userId || item.id || item.UserId || "",
    userId: item.userId || item.id || "",
    firstName: item.firstName || "",
    lastName: item.lastName || "",
    fullName: item.fullName || `${item.firstName || ""} ${item.lastName || ""}`.trim() || "Unknown",
    phoneNumber: item.phoneNumber || null,
    address: item.address || null,
    editAddress: item.address || item.editAddress || "",
    additionalAddress: item.additionalAddress || "",
    role: item.role || "CUSTOMER",
    createdAt: item.createdAt || null,
    updatedAt: item.updatedAt || null,
    birthday: item.birthday || null,
    status: item.status || null,
    isActive: item.isActive ?? true,
  });

  if (body && typeof body === "object" && "data" in body) {
    return mapToUser(body.data);
  }
  return mapToUser(body);
};

/**
 * Xóa user
 * API: DELETE /api/Users/{id}
 */
export const deleteUser = async (id: string): Promise<void> => {
  console.log(`Calling DELETE /Users/${id}`);
  await axiosInstance.delete(`/Users/${id}`);
};
