import { axiosInstance } from "@/lib/axios";
import type {
  Category,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from "@/types/category";

export const getCategories = async (): Promise<Category[]> => {
  const res = await axiosInstance.get("/Categories");

  if (res.data.data && Array.isArray(res.data.data)) {
    return res.data.data;
  } else if (Array.isArray(res.data)) {
    return res.data;
  } else {
    console.error("Unexpected response structure:", res.data);
    return [];
  }
};

export const getCategoryById = async (id: string): Promise<Category> => {
  const res = await axiosInstance.get(`/Categories/${id}`);
  return res.data.data || res.data;
};

export const createCategory = async (payload: CreateCategoryPayload): Promise<Category> => {
  const res = await axiosInstance.post("/Categories", payload);
  return res.data.data;
};

export const updateCategory = async (id: string, payload: UpdateCategoryPayload): Promise<Category> => {
  const res = await axiosInstance.put(`/Categories/${id}`, payload);
  return res.data.data;
};

export const deleteCategory = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/Categories/${id}`);
};
