import { axiosInstance } from "@/lib/axios";

export interface CreateVNPayPayload {
    orderId: string;
    amount: number;
    orderDescription?: string;
    bankCode?: string;
}

export interface CreatePaymentResponse {
    paymentUrl: string;
}

export const createVNPayPayment = async (
    payload: CreateVNPayPayload,
): Promise<CreatePaymentResponse> => {
    const res = await axiosInstance.post("/api/Payments/vnpay/create", payload);
    return res.data;
};

export const getPaymentById = async (id: string) => {
    const res = await axiosInstance.get(`/api/Payments/${id}`);
    return res.data;
};

export const getPaymentByOrderId = async (orderId: string) => {
    const res = await axiosInstance.get(`/api/Payments/order/${orderId}`);
    return res.data;
};
