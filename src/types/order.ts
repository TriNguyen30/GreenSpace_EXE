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
  recipientName: string;
  recipientPhone: string;
  note?: string;
  items: OrderItem[];
}

/* ===== Payload ===== */

export interface CreateOrderItemPayload {
  // BE có thể chấp nhận productId (sản phẩm đơn giản)
  // và/hoặc variantId (khi có nhiều biến thể). FE sẽ luôn gửi productId,
  // và chỉ gửi variantId nếu thực sự có.
  variantId: string;
  quantity: number;
}

export interface CreateOrderPayload {
  // Optional for now because we don't có luồng chọn địa chỉ chi tiết.
  // Khi backend yêu cầu addressId, chúng ta sẽ truyền id thật từ sổ địa chỉ,
  // còn hiện tại thì để optional để tránh gửi "default" gây lỗi 400.
  addressId?: string | null;
  shippingAddress: string;
  recipientName: string;
  recipientPhone: string;
  voucherCode?: string;
  note?: string;
  items: CreateOrderItemPayload[];
}

export interface UpdateOrderStatusPayload {
  status: OrderStatus;
}
