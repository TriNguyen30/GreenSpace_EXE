export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "COMPLETED"
  | "CANCELLED"
  // Some BE endpoints return PascalCase
  | "Pending"
  | "Confirmed"
  | "Processing"
  | "Shipped"
  | "Completed"
  | "Cancelled";

export type PaymentMethod = "COD" | "PayOS" | "PAYOS";

export type PaymentStatus =
  | "PENDING"
  | "PAID"
  | "CANCELLED"
  | "FAILED"
  | "Pending"
  | "Paid"
  | "Cancelled"
  | "Failed";

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  // New response shape
  variantSku?: string | null;
  priceAtPurchase?: number;
  subTotal?: number;
  variantId: string | null;

  // Legacy fields (kept optional for backward compatibility)
  thumbnailUrl?: string | null;
  imageUrl?: string | null;
  sizeOrModel?: string | null;
  color: string;
  unitPrice?: number;
  totalPrice?: number;
}

export interface Order {
  orderId: string;
  createdAt: string;
  status: OrderStatus;

  // Pricing
  subTotal?: number;
  discount?: number;
  voucherCode?: string | null;
  shippingFee?: number;
  finalAmount?: number;
  totalAmount: number;

  // Shipping
  shippingAddressId?: string | null;
  shippingAddress: string;
  recipientName: string;
  recipientPhone: string;
  note?: string;

  // Payment
  paymentMethod?: PaymentMethod | string;
  paymentStatus?: PaymentStatus | string;

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
  paymentMethod?: PaymentMethod | string;
  voucherCode?: string;
  note?: string;
  items: CreateOrderItemPayload[];
}

export interface UpdateOrderStatusPayload {
  status: OrderStatus;
}
