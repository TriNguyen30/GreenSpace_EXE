export type DiscountType = "Fixed" | "Percentage";

export interface Promotion {
    promotionId: string;
    code: string;
    name: string;
    description: string;
    discountType: DiscountType;
    discountValue: number;
    maxDiscount: number | null;
    minOrderValue: number;
    maxUsage: number;
    usedCount: number;
    startDate: string;
    endDate: string;
    isActive: boolean;
    discountAmount: number | null;
}

export interface ApiResponse<T> {
    data: T;
    isSuccess: boolean;
    message: string | null;
    errors: string[] | null;
    statusCode: number;
}
