import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Package, ChevronRight, ShoppingBag } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchMyOrdersThunk } from "@/store/slices/orderSlice";

const statusColorMap: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-700",
    CONFIRMED: "bg-blue-100 text-blue-700",
    PROCESSING: "bg-purple-100 text-purple-700",
    SHIPPED: "bg-indigo-100 text-indigo-700",
    COMPLETED: "bg-green-100 text-green-700",
    CANCELLED: "bg-red-100 text-red-700",
};

export default function OrderListPage() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { orders, loading, error } = useAppSelector((s) => s.orders);

    useEffect(() => {
        dispatch(fetchMyOrdersThunk());
    }, [dispatch]);

    if (loading) {
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

    const orderList = Array.isArray(orders) ? orders : [];
    if (orderList.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-green-50/30 to-white pt-24">
                <div className="max-w-xl mx-auto px-4 text-center">
                    <div className="bg-white rounded-3xl shadow-lg p-10">
                        <ShoppingBag className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">
                            Bạn chưa có đơn hàng nào
                        </h2>
                        <p className="text-gray-600 mb-6">
                            Hãy mua sắm để tạo đơn hàng đầu tiên của bạn.
                        </p>
                        <button
                            onClick={() => navigate("/product")}
                            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-semibold"
                        >
                            Mua sắm ngay
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-green-50/30 to-white pt-24 pb-12">
            <div className="max-w-5xl mx-auto px-4">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Đơn hàng của tôi</h1>

                <div className="space-y-4">
                    {orderList.map((order) => (
                        <div
                            key={order.orderId}
                            onClick={() => navigate(`/orders/${order.orderId}`)}
                            className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 flex flex-col sm:flex-row sm:items-center gap-4 cursor-pointer hover:shadow-lg transition"
                        >
                            <div className="flex items-center gap-4 flex-1">
                                <div className="w-12 h-12 bg-green-100 text-green-700 rounded-xl flex items-center justify-center font-bold">
                                    <Package className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                        <span className="font-semibold text-gray-900">
                                            Đơn #{order.orderId.slice(0, 8)}
                                        </span>
                                        <span
                                            className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColorMap[order.status]}`}
                                        >
                                            {order.status}
                                        </span>
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {new Date(order.createdAt).toLocaleString("vi-VN")}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-56">
                                <div className="font-bold text-green-700 text-lg">
                                    {order.totalAmount.toLocaleString("vi-VN")} ₫
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-400" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
