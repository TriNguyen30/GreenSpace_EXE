import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, Loader2, ShoppingBag } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchOrderByIdThunk } from "@/store/slices/orderSlice";

export default function PaymentResultPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const orderId = searchParams.get("orderId");

    const { currentOrder, loading } = useAppSelector((state) => state.orders);

    useEffect(() => {
        if (orderId) {
            dispatch(fetchOrderByIdThunk(orderId));
        }
    }, [orderId, dispatch]);

    if (!orderId) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md w-full">
                    <XCircle className="w-14 h-14 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 mb-2">
                        Không tìm thấy đơn hàng
                    </h2>
                    <p className="text-gray-600 mb-6">
                        Thiếu mã đơn hàng trong đường dẫn thanh toán.
                    </p>
                    <button
                        onClick={() => navigate("/")}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold"
                    >
                        Về trang chủ
                    </button>
                </div>
            </div>
        );
    }

    if (loading || !currentOrder) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md w-full">
                    <Loader2 className="w-10 h-10 animate-spin text-green-600 mx-auto mb-4" />
                    <p className="text-gray-700 font-medium">Đang xác nhận thanh toán...</p>
                </div>
            </div>
        );
    }

    const isSuccess =
        currentOrder.status === "CONFIRMED" ||
        currentOrder.status === "PROCESSING" ||
        currentOrder.status === "SHIPPED" ||
        currentOrder.status === "COMPLETED";

    return (
        <div className="min-h-screen bg-gradient-to-b from-green-50/40 to-white flex items-center justify-center px-4">
            <div className="bg-white rounded-3xl shadow-xl p-8 max-w-lg w-full text-center">
                {isSuccess ? (
                    <>
                        <CheckCircle className="w-20 h-20 text-green-600 mx-auto mb-5" />
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            Thanh toán thành công 🎉
                        </h1>
                        <p className="text-gray-600 mb-6">
                            Đơn hàng của bạn đã được ghi nhận và đang được xử lý.
                        </p>
                    </>
                ) : (
                    <>
                        <XCircle className="w-20 h-20 text-red-500 mx-auto mb-5" />
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            Thanh toán thất bại ❌
                        </h1>
                        <p className="text-gray-600 mb-6">
                            Giao dịch không thành công hoặc đã bị hủy.
                        </p>
                    </>
                )}

                {/* Order Summary */}
                <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">Mã đơn hàng</span>
                        <span className="font-semibold text-gray-900">
                            {currentOrder.orderId}
                        </span>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">Trạng thái</span>
                        <span
                            className={`font-semibold ${isSuccess ? "text-green-600" : "text-red-500"
                                }`}
                        >
                            {currentOrder.status}
                        </span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Tổng tiền</span>
                        <span className="font-bold text-gray-900">
                            {currentOrder.totalAmount.toLocaleString("vi-VN")} ₫
                        </span>
                    </div>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                    <button
                        onClick={() => navigate(`/orders/${currentOrder.orderId}`)}
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold transition"
                    >
                        Xem chi tiết đơn hàng
                    </button>

                    <button
                        onClick={() => navigate("/orders")}
                        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 rounded-xl font-semibold transition"
                    >
                        Danh sách đơn hàng
                    </button>

                    <button
                        onClick={() => navigate("/")}
                        className="w-full flex items-center justify-center gap-2 text-gray-600 hover:text-green-700 font-medium py-2"
                    >
                        <ShoppingBag className="w-5 h-5" />
                        Tiếp tục mua sắm
                    </button>
                </div>
            </div>
        </div>
    );
}
