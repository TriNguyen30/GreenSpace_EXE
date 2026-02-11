import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CreditCard,
  Truck,
  MapPin,
  Phone,
  Mail,
  User,
  CheckCircle,
  ShoppingBag,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { createOrderThunk } from "@/store/slices/orderSlice";
import { createVNPayPayment } from "@/services/payment.service";

type PaymentMethod = "cod" | "vnpay";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { items, getTotalPrice, clearCart } = useCart();
  const { loading } = useAppSelector((state) => state.orders);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    district: "",
    ward: "",
    note: "",
  });

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");

  const totalPrice = getTotalPrice();
  const shippingFee = totalPrice > 500000 ? 0 : 30000;
  const discount = 0;
  const finalTotal = totalPrice + shippingFee - discount;

  const formatPrice = (price: number) =>
    price.toLocaleString("vi-VN") + " ₫";

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const buildShippingAddress = () => {
    const parts = [
      formData.address,
      formData.ward,
      formData.district,
      formData.city,
    ].filter(Boolean);
    return parts.join(", ");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName || !formData.phone || !formData.address) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc!");
      return;
    }

    if (items.length === 0) {
      alert("Giỏ hàng trống!");
      return;
    }

    try {
      // 1️⃣ Create Order
      const orderRes = await dispatch(
        createOrderThunk({
          shippingAddress: buildShippingAddress(),
          items: items.map((item) => ({
            productId: item.id.toString(),
            quantity: item.quantity,
          })),
        }),
      ).unwrap();

      const orderId = orderRes.orderId;

      // 2️⃣ Payment Flow
      if (paymentMethod === "cod") {
        clearCart();
        // Điều hướng về trang chi tiết đơn hàng thay vì route không tồn tại
        navigate(`/orders/${orderId}`);
        return;
      }

      // VNPay
      const paymentRes = await createVNPayPayment({
        orderId,
        amount: finalTotal,
        orderDescription: `Thanh toán đơn hàng ${orderId}`,
        bankCode: "",
      });

      if (paymentRes.paymentUrl) {
        window.location.href = paymentRes.paymentUrl;
      } else {
        throw new Error("Không nhận được URL thanh toán");
      }
    } catch (err: any) {
      console.error(err);
      alert(err?.message || "Có lỗi xảy ra khi đặt hàng");
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50/30 to-white pt-20 pb-12">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="bg-white rounded-3xl shadow-lg p-12">
            <ShoppingBag className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Giỏ hàng trống
            </h2>
            <p className="text-gray-600 mb-6">
              Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh toán.
            </p>
            <button
              onClick={() => navigate("/product")}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-semibold"
            >
              Về trang sản phẩm
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50/30 to-white pt-25 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/cart")}
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-green-700 transition-colors group mb-4"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Quay lại giỏ hàng
          </button>

          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            Thanh toán
          </h1>
          <p className="text-gray-600">Hoàn tất đơn hàng của bạn</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Contact */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <User className="w-5 h-5 text-green-600" />
                  Thông tin liên hệ
                </h2>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Họ và tên <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors"
                      placeholder="Nguyễn Văn A"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Số điện thoại <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors"
                      placeholder="0912345678"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors"
                      placeholder="email@example.com"
                    />
                  </div>
                </div>
              </div>

              {/* Shipping */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-green-600" />
                  Địa chỉ giao hàng
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Địa chỉ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors"
                      placeholder="Số nhà, tên đường"
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Tỉnh/Thành phố
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors"
                        placeholder="Hồ Chí Minh"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Quận/Huyện
                      </label>
                      <input
                        type="text"
                        name="district"
                        value={formData.district}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors"
                        placeholder="Quận 1"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Phường/Xã
                      </label>
                      <input
                        type="text"
                        name="ward"
                        value={formData.ward}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors"
                        placeholder="Phường Bến Nghé"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-green-600" />
                  Phương thức thanh toán
                </h2>

                <div className="space-y-3">
                  {/* COD */}
                  <label
                    className={`flex items-start gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === "cod"
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 hover:border-green-300"
                      }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={paymentMethod === "cod"}
                      onChange={(e) =>
                        setPaymentMethod(e.target.value as PaymentMethod)
                      }
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 mb-1">
                        Thanh toán khi nhận hàng (COD)
                      </div>
                      <div className="text-sm text-gray-600">
                        Thanh toán bằng tiền mặt khi nhận hàng
                      </div>
                    </div>
                  </label>

                  {/* VNPay */}
                  <label
                    className={`flex items-start gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === "vnpay"
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 hover:border-green-300"
                      }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="vnpay"
                      checked={paymentMethod === "vnpay"}
                      onChange={(e) =>
                        setPaymentMethod(e.target.value as PaymentMethod)
                      }
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 mb-1">
                        VNPay
                      </div>
                      <div className="text-sm text-gray-600">
                        Thanh toán qua cổng VNPay
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24 border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Đơn hàng của bạn
                </h2>

                {/* Products */}
                <div className="space-y-4 mb-6 pb-6 border-b border-gray-200">
                  {items.map((item) => {
                    const itemPrice =
                      Number(
                        item.price
                          .replace(/[^.\d]/g, "")
                          .replace(/\./g, ""),
                      ) || 0;

                    return (
                      <div key={item.id} className="flex gap-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-1">
                            {item.name}
                          </h4>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">
                              SL: {item.quantity}
                            </span>
                            <span className="font-bold text-gray-900">
                              {formatPrice(itemPrice * item.quantity)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Price Summary */}
                <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                  <div className="flex items-center justify-between text-gray-700">
                    <span>Tạm tính</span>
                    <span className="font-semibold">
                      {formatPrice(totalPrice)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-gray-700">
                    <span>Phí vận chuyển</span>
                    <span className="font-semibold">
                      {shippingFee === 0 ? (
                        <span className="text-green-600">Miễn phí</span>
                      ) : (
                        formatPrice(shippingFee)
                      )}
                    </span>
                  </div>
                </div>

                {/* Total */}
                <div className="flex items-center justify-between mb-6">
                  <span className="text-lg font-bold text-gray-900">
                    Tổng cộng
                  </span>
                  <span className="text-2xl font-black text-green-700">
                    {formatPrice(finalTotal)}
                  </span>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all ${loading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700 hover:shadow-xl"
                    } text-white`}
                >
                  {loading ? "Đang xử lý..." : "Đặt hàng"}
                </button>

                {/* Trust */}
                <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span>Thông tin được bảo mật</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Truck className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <span>Giao hàng nhanh 2-3 ngày</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
