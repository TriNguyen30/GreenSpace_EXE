import React from "react";
import { ShoppingCart, X, Minus, Plus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";

export default function CartDropdown() {
  const [open, setOpen] = React.useState(false);
  const {
    items,
    removeFromCart,
    updateQuantity,
    getTotalItems,
    getTotalPrice,
  } = useCart();
  const navigate = useNavigate();

  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  const formatPrice = (price: number) => {
    return price.toLocaleString("vi-VN") + " ₫";
  };

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {/* Cart Button */}
      <button className="relative p-3 rounded-full hover:bg-gray-100 bg-gray-200 transition-colors">
        <ShoppingCart className="w-5 h-5 text-gray-400" />
        {totalItems > 0 && (
          <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {totalItems > 99 ? "99+" : totalItems}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full right-0 pt-2 w-96 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-gray-900">
                  Giỏ hàng của bạn
                </h3>
                <span className="text-sm text-gray-600">
                  {totalItems} sản phẩm
                </span>
              </div>
            </div>

            {/* Cart Items */}
            <div className="max-h-96 overflow-y-auto">
              {items.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium mb-1">
                    Giỏ hàng trống
                  </p>
                  <p className="text-sm text-gray-400">
                    Thêm sản phẩm để bắt đầu mua sắm
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {items.map((item) => {
                    const itemPrice =
                      Number(
                        item.price.replace(/[^.\d]/g, "").replace(/\./g, ""),
                      ) || 0;

                    return (
                      <div
                        key={item.id}
                        className="px-4 py-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex gap-3">
                          {/* Image */}
                          <div className="flex-shrink-0">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-20 h-20 object-cover rounded-lg"
                            />
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2">
                              {item.name}
                            </h4>
                            <div className="text-sm font-bold text-green-700 mb-2">
                              {item.price}
                            </div>

                            {/* Quantity Controls */}
                            <div className="flex items-center gap-2">
                              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateQuantity(item.id, item.quantity - 1);
                                  }}
                                  className="px-2 py-1 hover:bg-gray-100 transition-colors"
                                  aria-label="Giảm số lượng"
                                >
                                  <Minus className="w-3 h-3 text-gray-600" />
                                </button>
                                <div className="px-3 py-1 text-xs font-bold bg-gray-50 min-w-[32px] text-center">
                                  {item.quantity}
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateQuantity(item.id, item.quantity + 1);
                                  }}
                                  className="px-2 py-1 hover:bg-gray-100 transition-colors"
                                  aria-label="Tăng số lượng"
                                >
                                  <Plus className="w-3 h-3 text-gray-600" />
                                </button>
                              </div>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeFromCart(item.id);
                                }}
                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                aria-label="Xóa sản phẩm"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Subtotal */}
                        <div className="mt-2 text-right">
                          <span className="text-xs text-gray-500">Tổng: </span>
                          <span className="text-sm font-bold text-gray-900">
                            {formatPrice(itemPrice * item.quantity)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="px-4 py-4 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-base font-bold text-gray-900">
                    Tổng cộng:
                  </span>
                  <span className="text-xl font-black text-green-700">
                    {formatPrice(totalPrice)}
                  </span>
                </div>

                <button
                  onClick={() => {
                    setOpen(false);
                    navigate("/checkout");
                  }}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition-colors shadow-lg hover:shadow-xl"
                >
                  Thanh toán ngay
                </button>

                <button
                  onClick={() => {
                    setOpen(false);
                    navigate("/cart");
                  }}
                  className="w-full mt-2 border-2 border-green-600 text-green-600 hover:bg-green-50 py-2.5 rounded-lg font-semibold transition-colors"
                >
                  Xem giỏ hàng
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
