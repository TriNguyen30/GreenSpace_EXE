import { axiosInstance } from "@/lib/axios";

export interface CreatePayOSPayload {
    orderId: string;
}

export interface CreatePayOSResponse {
    paymentUrl: string;
}

export const createPayOSPayment = async (
    payload: CreatePayOSPayload,
): Promise<CreatePayOSResponse> => {
    const res = await axiosInstance.post("/Payments/payos/create", payload);
    return res.data.data;
};

export const getPaymentByOrderId = async (orderId: string) => {
    const res = await axiosInstance.get(`/Payments/order/${orderId}`);
    return res.data.data;
};

