export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "COMPLETED"
  | "CANCELLED";

export interface OrderItem {
  productId: string;
  productName: string;
  thumbnailUrl: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
}

export interface Order {
  orderId: string;
  createdAt: string;
  status: OrderStatus;
  totalAmount: number;
  shippingAddress: string;
  items: OrderItem[];
}

/* ===== Payload ===== */

export interface CreateOrderItemPayload {
  productId: string;
  quantity: number;
}

export interface CreateOrderPayload {
  shippingAddress: string;
  items: CreateOrderItemPayload[];
}

export interface UpdateOrderStatusPayload {
  status: OrderStatus;
}
