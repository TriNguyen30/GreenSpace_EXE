import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CreditCard,
  Truck,
  MapPin,
  CheckCircle,
  ShoppingBag,
  User,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { createOrderThunk } from "@/store/slices/orderSlice";
import { createPayOSPayment } from "@/services/payment.service";
import type { AxiosError } from "axios";
import { getActivePromotions } from "@/services/promotion.service";
import type { Promotion } from "@/types/promotion";

type PaymentMethod = "COD" | "PAYOS";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { items, getTotalPrice, clearCart } = useCart();
  const { loading } = useAppSelector((state) => state.orders);
  const authUser = useAppSelector((state) => state.auth.user);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);


  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("COD");
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    district: "",
    ward: "",
    note: "",
  });

  /* ================= Prefill ================= */

  useEffect(() => {
    if (!authUser) return;
    setFormData((prev) => ({
      ...prev,
      fullName: prev.fullName || authUser.fullName || "",
      email: prev.email || authUser.email || "",
    }));
  }, [authUser]);

  /* ================= Helpers ================= */

  const formatPrice = (price: number) =>
    price.toLocaleString("vi-VN") + " ₫";

  const buildShippingAddress = () =>
    [formData.address, formData.ward, formData.district, formData.city]
      .filter(Boolean)
      .join(", ");

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  /* ================= Submit ================= */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("🛒 CART ITEMS:", JSON.stringify(items, null, 2));
    if (!formData.fullName || !formData.phone || !formData.address) {
      alert("Vui lòng nhập đầy đủ thông tin bắt buộc");
      return;
    }

    if (items.length === 0) {
      alert("Giỏ hàng trống");
      return;
    }

    const invalidItem = items.find((item) => !item.variantId);
    if (invalidItem) {
      alert(`"${invalidItem.name}" chưa có variant hợp lệ. Vui lòng xoá và thêm lại.`);
      return;
    }
    try {
      /* ========= 1. Create Order ========= */
      const payload = {
        shippingAddress: buildShippingAddress(),
        recipientName: formData.fullName,
        recipientPhone: formData.phone,
        paymentMethod,
        voucherCode: selectedPromotion?.code || undefined,
        note: formData.note,
        items: items.map((item) => ({
          variantId: item.variantId,   // không check null nữa
          quantity: item.quantity,
        })),
      };

      console.log("📦 ORDER PAYLOAD:", JSON.stringify(payload, null, 2));

      const order = await dispatch(createOrderThunk(payload)).unwrap();
      console.log("✅ ORDER RESPONSE:", order);
      console.log("🆔 orderId:", order.orderId); // nếu undefined → đúng là parse sai
      console.log("🆔 order.orderId:", order?.orderId);


      /* ========= 2. Payment Flow ========= */
      if (paymentMethod === "COD") {
        clearCart();
        navigate(`/orders/${order.orderId}`);
        return;
      }

      const payRes = await createPayOSPayment({ orderId: order.orderId });

      if (!payRes.paymentUrl) {
        throw new Error("Không nhận được URL thanh toán");
      }

      window.location.href = payRes.paymentUrl;
    } catch (err: any) {
      console.error("❌ err:", err);
      // err bây giờ là { data: null, isSuccess: false, message: "...", statusCode: 400 }

      const apiMessage =
        err?.message ||
        (Array.isArray(err?.errors) ? err.errors.join(", ") : undefined);

      alert(apiMessage || "Đặt hàng thất bại");
    }
  };

  const calculateDiscount = (promo: Promotion, total: number) => {
    if (total < promo.minOrderValue) return 0;

    let discount = 0;

    if (promo.discountType === "Fixed") {
      discount = promo.discountValue;
    } else {
      discount = (total * promo.discountValue) / 100;

      if (promo.maxDiscount && discount > promo.maxDiscount) {
        discount = promo.maxDiscount;
      }
    }

    return discount;
  };

  const totalPrice = getTotalPrice();
  const shippingFee = totalPrice > 500_000 ? 0 : 30_000;

  const discountAmount = selectedPromotion
    ? calculateDiscount(selectedPromotion, totalPrice)
    : 0;

  const finalTotal = totalPrice + shippingFee - discountAmount;

  useEffect(() => {
    const loadPromotions = async () => {
      try {
        const data = await getActivePromotions();
        setPromotions(data);
      } catch (err) {
        console.error("Load promotions failed", err);
      }
    };

    loadPromotions();
  }, []);

  useEffect(() => {
    if (!promotions.length) return;

    // Nếu user đã chọn voucher thủ công → không auto override
    if (selectedPromotion) return;

    const total = totalPrice;

    const validPromotions = promotions.filter(
      (p) =>
        p.isActive &&
        new Date(p.endDate) > new Date() &&
        total >= p.minOrderValue
    );

    if (!validPromotions.length) {
      setSelectedPromotion(null);
      return;
    }

    const bestPromo = validPromotions.reduce((best, current) => {
      const bestDiscount = calculateDiscount(best, total);
      const currentDiscount = calculateDiscount(current, total);

      return currentDiscount > bestDiscount ? current : best;
    });

    setSelectedPromotion(bestPromo);
  }, [promotions, totalPrice]);

  /* ================= Empty Cart ================= */

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
              Vui lòng thêm sản phẩm trước khi thanh toán.
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

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50/30 to-white pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ===== Header ===== */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/cart")}
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-green-700 transition-colors mb-4"
          >
            <div className="inline-flex items-center leading-none gap-2 cursor-pointer group text-gray-700 hover:text-green-600 transition">
              <ArrowLeft className="w-4 h-4 relative bottom-[1px] group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-medium">Quay lại giỏ hàng</span>
            </div>
          </button>

          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            Thanh toán
          </h1>
          <p className="text-gray-600">Hoàn tất đơn hàng của bạn</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* ================= Left ================= */}
            <div className="lg:col-span-2 space-y-6">
              {/* ===== Contact ===== */}
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
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 outline-none"
                      placeholder="Nguyễn Văn A"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Số điện thoại <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 outline-none"
                      placeholder="0912345678"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 outline-none"
                      placeholder="email@example.com"
                    />
                  </div>
                </div>
              </div>

              {/* ===== Shipping ===== */}
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
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 outline-none"
                      placeholder="Số nhà, tên đường"
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <input
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 outline-none"
                      placeholder="Tỉnh/Thành phố"
                    />
                    <input
                      name="district"
                      value={formData.district}
                      onChange={handleInputChange}
                      className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 outline-none"
                      placeholder="Quận/Huyện"
                    />
                    <input
                      name="ward"
                      value={formData.ward}
                      onChange={handleInputChange}
                      className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 outline-none"
                      placeholder="Phường/Xã"
                    />
                  </div>

                  <textarea
                    name="note"
                    value={formData.note}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 outline-none resize-none"
                    placeholder="Ghi chú cho người giao hàng (tuỳ chọn)"
                  />
                </div>
              </div>

              {/* ===== Payment ===== */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-green-600" />
                  Phương thức thanh toán
                </h2>

                <div className="space-y-3">
                  {/* COD */}
                  <label
                    className={`flex items-start gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === "COD"
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 hover:border-green-300"
                      }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="COD"
                      checked={paymentMethod === "COD"}
                      onChange={() => setPaymentMethod("COD")}
                      className="mt-1"
                    />
                    <div>
                      <div className="font-semibold text-gray-900 mb-1">
                        Thanh toán khi nhận hàng (COD)
                      </div>
                      <div className="text-sm text-gray-600">
                        Thanh toán bằng tiền mặt khi nhận hàng
                      </div>
                    </div>
                  </label>

                  {/* PayOS */}
                  <label
                    className={`flex items-start gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === "PAYOS"
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 hover:border-green-300"
                      }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="PAYOS"
                      checked={paymentMethod === "PAYOS"}
                      onChange={() => setPaymentMethod("PAYOS")}
                      className="mt-1"
                    />
                    <div>
                      <div className="font-semibold text-gray-900 mb-1">
                        PayOS
                      </div>
                      <div className="text-sm text-gray-600">
                        Thanh toán qua PayOS (ATM, QR, Ví điện tử)
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* ================= Right ================= */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24 border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Đơn hàng của bạn
                </h2>

                {/* Products */}
                <div className="space-y-4 mb-6 pb-6 border-b border-gray-200">
                  {items.map((item) => {
                    const price =
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
                          className="w-16 h-16 object-cover rounded-lg"
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
                              {formatPrice(price * item.quantity)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* ===== Voucher ===== */}
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Mã giảm giá
                  </h3>

                  {promotions.length === 0 ? (
                    <div className="text-sm text-gray-500">
                      Không có mã khuyến mãi
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {promotions.map((promo) => (
                        <label
                          key={promo.promotionId}
                          className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition ${selectedPromotion?.promotionId === promo.promotionId
                            ? "border-green-500 bg-green-50"
                            : "border-gray-200 hover:border-green-300"
                            }`}
                        >
                          <input
                            type="radio"
                            name="voucher"
                            checked={
                              selectedPromotion?.promotionId === promo.promotionId
                            }
                            onChange={() => setSelectedPromotion(promo)}
                          />
                          <div>
                            <div className="font-semibold text-sm text-gray-900">
                              {promo.code}
                            </div>
                            <div className="text-xs text-gray-600">
                              {promo.description}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Price Summary */}
                <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                  <div className="flex items-center justify-between text-gray-700">
                    <span>Tạm tính</span>
                    <span className="font-semibold">
                      {formatPrice(totalPrice)}
                    </span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex items-center justify-between text-red-600">
                      <span>Giảm giá</span>
                      <span className="font-semibold">
                        -{formatPrice(discountAmount)}
                      </span>
                    </div>
                  )}
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
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span>Thông tin được bảo mật</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Truck className="w-5 h-5 text-blue-600" />
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
