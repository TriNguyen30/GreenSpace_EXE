export interface Category {
  categoryId: string;
  name: string;
  slug: string;
  parentId: string | null;
  parentName: string | null;
}

export interface CreateCategoryPayload {
  name: string;
  slug: string;
  parentId?: string;
}

export interface UpdateCategoryPayload {
  name: string;
  slug: string;
  parentId?: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}
