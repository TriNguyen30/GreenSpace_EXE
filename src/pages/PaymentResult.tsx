import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
    CheckCircle,
    XCircle,
    Loader2,
    ArrowRight,
    ShoppingBag,
} from "lucide-react";
import { useAppDispatch } from "@/store/hooks";
import { fetchOrderByIdThunk } from "@/store/slices/orderSlice";
import { useCart } from "@/context/CartContext";

type PaymentStatus = "success" | "failed" | "cancelled" | "pending";

export default function PaymentResultPage() {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { clearCart } = useCart();
    const [params] = useSearchParams();

    const orderId = params.get("orderId");

    const [loading, setLoading] = useState(true);
    const [orderStatus, setOrderStatus] =
        useState<PaymentStatus>("pending");

    useEffect(() => {
        if (!orderId) {
            setOrderStatus("failed");
            setLoading(false);
            return;
        }

        const loadOrder = async () => {
            try {
                const order = await dispatch(
                    fetchOrderByIdThunk(orderId)
                ).unwrap();

                // ✅ Lấy trạng thái từ backend (không tin query param)
                if (order.paymentStatus === "Paid") {
                    clearCart();
                    setOrderStatus("success");
                } else if (order.paymentStatus === "Cancelled") {
                    setOrderStatus("cancelled");
                } else {
                    setOrderStatus("failed");
                }
            } catch {
                setOrderStatus("failed");
            } finally {
                setLoading(false);
            }
        };

        loadOrder();
    }, [dispatch, orderId, clearCart]);

    // 🔁 Auto redirect sau 3 giây nếu thành công
    useEffect(() => {
        if (orderStatus === "success") {
            const timer = setTimeout(() => {
                navigate("/orders");
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [orderStatus, navigate]);

    /* ================= UI ================= */

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-green-50/30 to-white">
                <Loader2 className="w-12 h-12 text-green-600 animate-spin mb-4" />
                <p className="text-gray-600 font-medium">
                    Đang xác nhận thanh toán...
                </p>
            </div>
        );
    }

    const isSuccess = orderStatus === "success";

    return (
        <div className="min-h-screen bg-gradient-to-b from-green-50/30 to-white flex items-center justify-center px-4">
            <div className="max-w-lg w-full bg-white rounded-3xl shadow-xl p-10 text-center border border-gray-100">
                {isSuccess ? (
                    <>
                        <CheckCircle className="w-20 h-20 text-green-600 mx-auto mb-6" />
                        <h1 className="text-2xl font-bold text-gray-900 mb-3">
                            Thanh toán thành công 🎉
                        </h1>
                        <p className="text-gray-600 mb-6">
                            Đơn hàng của bạn đã được xác nhận.
                        </p>
                        <p className="text-sm text-gray-400 mb-6">
                            Tự động chuyển về trang đơn hàng sau 3 giây...
                        </p>

                        <div className="space-y-3">
                            <button
                                onClick={() => navigate(`/orders/${orderId}`)}
                                className="w-full py-3 rounded-xl font-semibold bg-green-600 hover:bg-green-700 text-white transition"
                            >
                                Xem chi tiết đơn hàng
                            </button>

                            <button
                                onClick={() => navigate("/products")}
                                className="w-full py-3 rounded-xl font-semibold bg-gray-100 hover:bg-gray-200 text-gray-800 transition flex items-center justify-center gap-2"
                            >
                                <ShoppingBag className="w-4 h-4" />
                                Tiếp tục mua sắm
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <XCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />
                        <h1 className="text-2xl font-bold text-gray-900 mb-3">
                            Thanh toán thất bại ❌
                        </h1>
                        <p className="text-gray-600 mb-8">
                            Thanh toán không thành công hoặc đã bị huỷ.
                        </p>

                        <div className="space-y-3">
                            {orderId && (
                                <button
                                    onClick={() =>
                                        navigate(`/checkout?retryOrderId=${orderId}`)
                                    }
                                    className="w-full py-3 rounded-xl font-semibold bg-green-600 hover:bg-green-700 text-white transition flex items-center justify-center gap-2"
                                >
                                    Thử thanh toán lại
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            )}

                            <button
                                onClick={() => navigate("/cart")}
                                className="w-full py-3 rounded-xl font-semibold bg-gray-100 hover:bg-gray-200 text-gray-800 transition"
                            >
                                Quay lại giỏ hàng
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
