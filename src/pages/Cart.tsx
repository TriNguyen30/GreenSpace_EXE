import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  ShoppingBag,
  Tag,
  Truck,
  Shield,
  CreditCard,
} from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function CartPage() {
  const navigate = useNavigate();
  const { items, removeFromCart, updateQuantity, getTotalPrice, clearCart } =
    useCart();

  const totalPrice = getTotalPrice();
  const shippingFee = totalPrice > 500000 ? 0 : 30000;
  const discount = 0; // Có thể thêm logic voucher sau
  const finalTotal = totalPrice + shippingFee - discount;

  const formatPrice = (price: number) => {
    return price.toLocaleString("vi-VN") + " ₫";
  };

  const handleClearCart = () => {
    if (window.confirm("Bạn có chắc muốn xóa toàn bộ giỏ hàng?")) {
      clearCart();
    }
  };

  const handleCheckout = () => {
    if (items.length === 0) {
      alert("Giỏ hàng trống! Vui lòng thêm sản phẩm trước khi thanh toán.");
      return;
    }
    navigate("/checkout");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50/30 to-white pt-25 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-green-700 transition-colors group mb-4"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Tiếp tục mua sắm
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                Giỏ hàng của bạn
              </h1>
              <p className="text-gray-600">
                {items.length > 0 ? (
                  <>Bạn có {items.length} sản phẩm trong giỏ hàng</>
                ) : (
                  <>Giỏ hàng của bạn đang trống</>
                )}
              </p>
            </div>

            {items.length > 0 && (
              <button
                onClick={handleClearCart}
                className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-2 hover:underline"
              >
                <Trash2 className="w-4 h-4" />
                Xóa tất cả
              </button>
            )}
          </div>
        </div>

        {items.length === 0 ? (
          // Empty Cart State
          <div className="bg-white rounded-3xl shadow-lg p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="w-16 h-16 text-gray-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Giỏ hàng trống
              </h2>
              <p className="text-gray-600 mb-8">
                Hãy khám phá các sản phẩm tuyệt vời của chúng tôi và thêm vào
                giỏ hàng!
              </p>
              <button
                onClick={() => navigate("/product")}
                className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-8 py-3.5 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                <ShoppingBag className="w-5 h-5" />
                Khám phá sản phẩm
              </button>
            </div>
          </div>
        ) : (
          // Cart with Items
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => {
                const itemPrice =
                  Number(
                    item.price.replace(/[^.\d]/g, "").replace(/\./g, ""),
                  ) || 0;
                const subtotal = itemPrice * item.quantity;

                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all p-6 border border-gray-100"
                  >
                    <div className="flex gap-6">
                      {/* Image */}
                      <div className="flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-32 h-32 object-cover rounded-xl"
                        />
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                              {item.name}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span className="inline-flex items-center gap-1.5">
                                <Tag className="w-4 h-4" />
                                SKU: GS-{item.id.toString().padStart(4, "0")}
                              </span>
                            </div>
                          </div>

                          {/* Remove Button */}
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            aria-label="Xóa sản phẩm"
                            title="Xóa sản phẩm"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>

                        {/* Price & Quantity */}
                        <div className="flex items-end justify-between gap-4">
                          <div>
                            <div className="text-sm text-gray-600 mb-1">
                              Đơn giá
                            </div>
                            <div className="text-xl font-bold text-green-700">
                              {item.price}
                            </div>
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-4">
                            <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden bg-white">
                              <button
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity - 1)
                                }
                                className="px-4 py-2 hover:bg-gray-100 transition-colors"
                                aria-label="Giảm số lượng"
                              >
                                <Minus className="w-4 h-4 text-gray-600" />
                              </button>
                              <div className="px-6 py-2 bg-gray-50 font-bold text-center min-w-[60px]">
                                {item.quantity}
                              </div>
                              <button
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity + 1)
                                }
                                className="px-4 py-2 hover:bg-gray-100 transition-colors"
                                aria-label="Tăng số lượng"
                              >
                                <Plus className="w-4 h-4 text-gray-600" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Subtotal */}
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">
                              Tạm tính:
                            </span>
                            <span className="text-lg font-bold text-gray-900">
                              {formatPrice(subtotal)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Tóm tắt đơn hàng
                </h2>

                {/* Price Breakdown */}
                <div className="space-y-4 mb-6 pb-6 border-b border-gray-200">
                  <div className="flex items-center justify-between text-gray-700">
                    <span>Tạm tính ({items.length} sản phẩm)</span>
                    <span className="font-semibold">
                      {formatPrice(totalPrice)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-gray-700">
                    <span className="flex items-center gap-2">
                      <Truck className="w-4 h-4" />
                      Phí vận chuyển
                    </span>
                    <span className="font-semibold">
                      {shippingFee === 0 ? (
                        <span className="text-green-600">Miễn phí</span>
                      ) : (
                        formatPrice(shippingFee)
                      )}
                    </span>
                  </div>

                  {discount > 0 && (
                    <div className="flex items-center justify-between text-green-600">
                      <span className="flex items-center gap-2">
                        <Tag className="w-4 h-4" />
                        Giảm giá
                      </span>
                      <span className="font-semibold">
                        -{formatPrice(discount)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Total */}
                <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200">
                  <span className="text-lg font-bold text-gray-900">
                    Tổng cộng
                  </span>
                  <span className="text-2xl font-black text-green-700">
                    {formatPrice(finalTotal)}
                  </span>
                </div>

                {/* Free Shipping Notice */}
                {totalPrice < 500000 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                    <div className="flex items-start gap-3">
                      <Truck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="text-blue-900 font-medium mb-1">
                          Mua thêm {formatPrice(500000 - totalPrice)} để được
                          miễn phí vận chuyển!
                        </p>
                        <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${(totalPrice / 500000) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Checkout Button */}
                <button
                  onClick={handleCheckout}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all mb-3"
                >
                  Tiến hành thanh toán
                </button>

                <button
                  onClick={() => navigate("/product")}
                  className="w-full border-2 border-gray-200 text-gray-700 hover:bg-gray-50 py-3 rounded-xl font-semibold transition-colors"
                >
                  Tiếp tục mua sắm
                </button>

                {/* Trust Badges */}
                <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Shield className="w-5 h-5 text-green-600" />
                    </div>
                    <span>Thanh toán an toàn & bảo mật</span>
                  </div>

                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Truck className="w-5 h-5 text-blue-600" />
                    </div>
                    <span>Giao hàng nhanh chóng 2-3 ngày</span>
                  </div>

                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <CreditCard className="w-5 h-5 text-purple-600" />
                    </div>
                    <span>Hỗ trợ nhiều phương thức thanh toán</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Additional Info */}
        {items.length > 0 && (
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Truck className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">
                    Giao hàng miễn phí
                  </h3>
                  <p className="text-sm text-gray-600">
                    Đơn hàng từ 500.000₫ được miễn phí vận chuyển
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">
                    Thanh toán an toàn
                  </h3>
                  <p className="text-sm text-gray-600">
                    Bảo mật thông tin thanh toán 100%
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Tag className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">
                    Đổi trả dễ dàng
                  </h3>
                  <p className="text-sm text-gray-600">
                    Đổi trả trong vòng 7 ngày nếu không hài lòng
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
