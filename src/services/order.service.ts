import { axiosInstance } from "@/lib/axios";
import type {
    Order,
    CreateOrderPayload,
    UpdateOrderStatusPayload,
} from "@/types/order";

export const getMyOrders = async (): Promise<Order[]> => {
    const res = await axiosInstance.get("/api/Orders/my-orders");
    return res.data;
};

export const getOrderById = async (id: string): Promise<Order> => {
    const res = await axiosInstance.get(`/api/Orders/${id}`);
    return res.data;
};

export const createOrder = async (
    payload: CreateOrderPayload,
): Promise<Order> => {
    const res = await axiosInstance.post("/api/Orders", payload);
    return res.data;
};

export const updateOrderStatus = async (
    orderId: string,
    payload: UpdateOrderStatusPayload,
): Promise<Order> => {
    const res = await axiosInstance.patch(
        `/api/Orders/${orderId}/status`,
        payload,
    );
    return res.data;
};

export const cancelOrder = async (orderId: string): Promise<Order> => {
    const res = await axiosInstance.patch(`/api/Orders/${orderId}/status`, {
        status: "CANCELLED",
    });
    return res.data;
};
