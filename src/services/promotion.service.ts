import { axiosInstance } from "@/lib/axios";
import type { Promotion, ApiResponse } from "@/types/promotion";

export const getActivePromotions = async (): Promise<Promotion[]> => {
    const res = await axiosInstance.get<ApiResponse<Promotion[]>>(
        "/Promotions/active"
    );

    if (!res.data.isSuccess) {
        throw new Error(res.data.message || "Không thể tải khuyến mãi");
    }

    return res.data.data;
};
