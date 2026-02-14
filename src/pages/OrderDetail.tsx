import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    MapPin,
    Phone,
    Package,
    XCircle,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
    fetchOrderByIdThunk,
    cancelOrderThunk,
} from "@/store/slices/orderSlice";

const statusTextMap: Record<string, string> = {
    PENDING: "Chờ xác nhận",
    CONFIRMED: "Đã xác nhận",
    PROCESSING: "Đang xử lý",
    SHIPPED: "Đang giao",
    COMPLETED: "Hoàn tất",
    CANCELLED: "Đã hủy",
};

export default function OrderDetailPage() {
    const { id } = useParams<{ id: string }>();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { currentOrder, loading, error } = useAppSelector((s) => s.orders);

    useEffect(() => {
        if (id) dispatch(fetchOrderByIdThunk(id));
    }, [dispatch, id]);

    if (loading || !currentOrder) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center text-red-600">
                {error}
            </div>
        );
    }

    const canCancel = ["PENDING", "CONFIRMED"].includes(currentOrder.status);

    return (
        <div className="min-h-screen bg-gradient-to-b from-green-50/30 to-white pt-24 pb-12">
            <div className="max-w-5xl mx-auto px-4 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between gap-4 flex-wrap">
                    <button
                        onClick={() => navigate("/orders")}
                        className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-green-700 transition-colors group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Quay lại đơn hàng
                    </button>

                    <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-sm text-gray-500">
                            Mã đơn: #{currentOrder.orderId}
                        </span>
                        <span className="text-sm text-gray-500">
                            {currentOrder.createdAt
                                ? new Date(currentOrder.createdAt).toLocaleString("vi-VN")
                                : ""}
                        </span>
                        <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-semibold">
                            {statusTextMap[currentOrder.status?.toUpperCase()] ?? currentOrder.status}
                        </span>
                    </div>
                </div>

                {/* Info Cards */}
                <div className="grid md:grid-cols-3 gap-6">
                    {/* Shipping */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-green-600" />
                            Địa chỉ giao hàng
                        </h3>
                        <div className="space-y-1 text-sm text-gray-700">
                            <div>{currentOrder.shippingAddress}</div>
                        </div>
                    </div>

                    {/* Contact - từ API GET /Orders/{id} */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Phone className="w-5 h-5 text-green-600" />
                            Người nhận
                        </h3>
                        <div className="space-y-2 text-sm text-gray-700">
                            <div>
                                <span className="text-gray-500">Tên: </span>
                                {currentOrder.recipientName ?? "—"}
                            </div>
                            <div>
                                <span className="text-gray-500">SĐT: </span>
                                {currentOrder.recipientPhone ?? "—"}
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 flex flex-col justify-between">
                        <div>
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Package className="w-5 h-5 text-green-600" />
                                Hành động
                            </h3>
                            <div className="text-sm text-gray-600 mb-4">
                                Bạn có thể theo dõi hoặc hủy đơn hàng (nếu còn cho phép).
                            </div>
                        </div>

                        {canCancel && (
                            <button
                                onClick={async () => {
                                    if (!id) return;
                                    const ok = confirm("Bạn chắc chắn muốn hủy đơn hàng này?");
                                    if (!ok) return;
                                    await dispatch(cancelOrderThunk(id));
                                }}
                                className="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white py-2 rounded-xl font-semibold transition"
                            >
                                <XCircle className="w-5 h-5" />
                                Hủy đơn hàng
                            </button>
                        )}

                        {!canCancel && (
                            <div className="text-sm text-gray-500">
                                Đơn hàng không thể hủy ở trạng thái hiện tại.
                            </div>
                        )}
                    </div>
                </div>

                {/* Items */}
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">
                        Sản phẩm đã đặt
                    </h3>

                    <div className="space-y-4">
                        {(currentOrder.items ?? []).map((item) => (
                            <div
                                key={item.productId}
                                className="flex items-center gap-4 border-b border-gray-100 pb-4 last:border-b-0 last:pb-0"
                            >
                                <img
                                    src={item.thumbnailUrl}
                                    alt={item.productName}
                                    className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-semibold text-gray-900 line-clamp-2">
                                        {item.productName}
                                    </h4>
                                    <div className="text-sm text-gray-500">
                                        SL: {item.quantity} ×{" "}
                                        {(item.unitPrice ?? 0).toLocaleString("vi-VN")} ₫
                                    </div>
                                </div>
                                <div className="font-bold text-gray-900">
                                    {(item.totalPrice ?? 0).toLocaleString("vi-VN")} ₫
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Ghi chú - từ API GET /Orders/{id} */}
                {(currentOrder.note != null && currentOrder.note !== "") && (
                    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                        <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                            Ghi chú đơn hàng
                        </h3>
                        <p className="text-sm text-gray-700">{currentOrder.note}</p>
                    </div>
                )}

                {/* Summary */}
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 flex justify-end">
                    <div className="w-full max-w-sm space-y-3">
                        <div className="flex items-center justify-between text-gray-700">
                            <span>Tạm tính</span>
                            <span className="font-semibold">
                                {(currentOrder.totalAmount ?? 0).toLocaleString("vi-VN")} ₫
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-gray-700">
                            <span>Phí vận chuyển</span>
                            <span className="font-semibold text-green-600">Miễn phí</span>
                        </div>
                        <div className="border-t border-gray-200 pt-3 flex items-center justify-between text-lg font-bold text-gray-900">
                            <span>Tổng cộng</span>
                            <span className="text-green-700">
                                {(currentOrder.totalAmount ?? 0).toLocaleString("vi-VN")} ₫
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
