import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, CreditCard, Truck, MapPin,
  CheckCircle, ShoppingBag, User, Tag, Loader2,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { createOrderThunk } from "@/store/slices/orderSlice";
import { createPayOSPayment } from "@/services/payment.service";
import { getActivePromotions } from "@/services/promotion.service";
import type { Promotion } from "@/types/promotion";

type PaymentMethod = "COD" | "PAYOS";

// ─── Styles ───────────────────────────────────────────────────────────────────
const CSS = `
  @keyframes ck-fade-up {
    from { opacity:0; transform:translateY(18px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes ck-fade-in {
    from { opacity:0; }
    to   { opacity:1; }
  }
  @keyframes ck-empty-in {
    from { opacity:0; transform:scale(.95); }
    to   { opacity:1; transform:scale(1); }
  }
  @keyframes ck-spinner {
    to { transform:rotate(360deg); }
  }
  @keyframes ck-item-in {
    from { opacity:0; transform:translateX(-12px); }
    to   { opacity:1; transform:translateX(0); }
  }

  .ck-e1 { animation: ck-fade-up .45s ease .04s both; }
  .ck-e2 { animation: ck-fade-up .45s ease .1s  both; }
  .ck-e3 { animation: ck-fade-up .45s ease .16s both; }
  .ck-e4 { animation: ck-fade-up .45s ease .22s both; }
  .ck-e5 { animation: ck-fade-up .45s ease .28s both; }

  .ck-empty { animation: ck-empty-in .5s cubic-bezier(.22,.68,0,1) both; }

  /* Back button */
  .ck-back { transition: color .2s, transform .2s; }
  .ck-back:hover { color:#16a34a; transform:translateX(-3px); }
  .ck-back-icon { transition:transform .2s; }
  .ck-back:hover .ck-back-icon { transform:translateX(-3px); }

  /* Section card */
  .ck-card {
    transition: box-shadow .25s ease;
  }
  .ck-card:hover { box-shadow: 0 6px 24px rgba(0,0,0,.07); }

  /* Input */
  .ck-input {
    transition: border-color .18s, box-shadow .18s;
  }
  .ck-input:focus {
    border-color: #16a34a;
    box-shadow: 0 0 0 3px rgba(22,163,74,.12);
    outline: none;
  }
  .ck-input:hover:not(:focus) { border-color: #9ca3af; }

  /* Payment option */
  .ck-pay-opt {
    transition: border-color .18s, background .18s, transform .15s;
  }
  .ck-pay-opt:hover { border-color: #16a34a; }
  .ck-pay-opt.selected { border-color: #16a34a; background: #f0fdf4; }
  .ck-pay-opt:active { transform: scale(.99); }

  /* Voucher option */
  .ck-voucher-opt {
    transition: border-color .18s, background .18s;
  }
  .ck-voucher-opt:hover:not(:disabled) { border-color: #16a34a; }
  .ck-voucher-opt.selected { border-color: #16a34a; background: #f0fdf4; }

  /* Order item */
  .ck-order-item { animation: ck-item-in .35s ease both; }
  .ck-order-item img {
    transition: transform .35s ease;
  }
  .ck-order-item:hover img { transform: scale(1.06); }

  /* Submit button */
  .ck-submit {
    transition: background .2s, transform .2s cubic-bezier(.34,1.56,.64,1), box-shadow .2s;
  }
  .ck-submit:hover:not(:disabled) {
    background: #15803d;
    transform: translateY(-2px) scale(1.01);
    box-shadow: 0 6px 20px rgba(22,163,74,.3);
  }
  .ck-submit:active:not(:disabled) { transform: scale(.97); }
  .ck-submit:disabled { background: #86efac; cursor: not-allowed; }

  /* Trust row */
  .ck-trust { transition: transform .2s ease; }
  .ck-trust:hover { transform: translateX(3px); }

  /* Section icon */
  .ck-section-icon {
    transition: transform .2s;
  }
  .ck-card:hover .ck-section-icon { transform: scale(1.12) rotate(-5deg); }

  /* Sticky summary card */
  .ck-summary { transition: box-shadow .25s ease; }
  .ck-summary:hover { box-shadow: 0 8px 28px rgba(0,0,0,.08); }
`;

function injectCheckoutStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById("ck-styles")) return;
  const el = document.createElement("style");
  el.id = "ck-styles";
  el.textContent = CSS;
  document.head.appendChild(el);
}

const formatPrice = (p: number) => p.toLocaleString("vi-VN") + " ₫";

// ─── Shared input component ───────────────────────────────────────────────────
function Field({
  label, required: req, children,
}: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}{req && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls = "ck-input w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm bg-white text-gray-800 placeholder-gray-400";

// ─── Section card ─────────────────────────────────────────────────────────────
function SectionCard({ icon, title, children, className = "" }: {
  icon: React.ReactNode; title: string; children: React.ReactNode; className?: string;
}) {
  return (
    <div className={`ck-card bg-white rounded-2xl border border-gray-100 shadow-sm p-6 ${className}`}>
      <h2 className="text-base font-bold text-gray-900 mb-5 flex items-center gap-2.5">
        <span className="ck-section-icon w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center text-green-600 shrink-0">
          {icon}
        </span>
        {title}
      </h2>
      {children}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function CheckoutPage() {
  injectCheckoutStyles();

  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { items, getTotalPrice, clearCart } = useCart();
  const { loading } = useAppSelector((s) => s.orders);
  const authUser = useAppSelector((s) => s.auth.user);

  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("COD");
  const [formData, setFormData] = useState({
    fullName: "", phone: "", email: "",
    address: "", city: "", district: "", ward: "", note: "",
  });

  useEffect(() => {
    if (!authUser) return;
    setFormData((p) => ({
      ...p,
      fullName: p.fullName || authUser.fullName || "",
      email: p.email || authUser.email || "",
    }));
  }, [authUser]);

  useEffect(() => {
    getActivePromotions().then(setPromotions).catch(console.error);
  }, []);

  const totalPrice = getTotalPrice();
  const shippingFee = totalPrice > 500_000 ? 0 : 30_000;

  const calcDiscount = (promo: Promotion, total: number) => {
    if (total < promo.minOrderValue) return 0;
    let d = promo.discountType === "Fixed"
      ? promo.discountValue
      : (total * promo.discountValue) / 100;
    if (promo.maxDiscount && d > promo.maxDiscount) d = promo.maxDiscount;
    return d;
  };

  useEffect(() => {
    if (!promotions.length) return;
    if (selectedPromotion && totalPrice < selectedPromotion.minOrderValue) { setSelectedPromotion(null); return; }
    if (selectedPromotion) return;
    const valid = promotions.filter((p) => p.isActive && new Date(p.endDate) > new Date() && totalPrice >= p.minOrderValue);
    if (!valid.length) { setSelectedPromotion(null); return; }
    setSelectedPromotion(valid.reduce((best, cur) => calcDiscount(cur, totalPrice) > calcDiscount(best, totalPrice) ? cur : best));
  }, [promotions, totalPrice]);

  const discountAmount = selectedPromotion ? calcDiscount(selectedPromotion, totalPrice) : 0;
  const finalTotal = totalPrice + shippingFee - discountAmount;

  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const buildAddress = () =>
    [formData.address, formData.ward, formData.district, formData.city].filter(Boolean).join(", ");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone || !formData.address) {
      alert("Vui lòng nhập đầy đủ thông tin bắt buộc"); return;
    }
    if (items.length === 0) { alert("Giỏ hàng trống"); return; }
    const invalid = items.find((i) => !i.variantId);
    if (invalid) { alert(`"${invalid.name}" chưa có variant hợp lệ.`); return; }

    try {
      const payload = {
        shippingAddress: buildAddress(),
        recipientName: formData.fullName,
        recipientPhone: formData.phone,
        paymentMethod,
        voucherCode: discountAmount > 0 && selectedPromotion ? selectedPromotion.code : undefined,
        note: formData.note,
        items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
      };
      const order = await dispatch(createOrderThunk(payload)).unwrap();
      if (paymentMethod === "COD") { clearCart(); navigate(`/orders/${order.orderId}`); return; }
      const payRes = await createPayOSPayment({ orderId: order.orderId });
      if (!payRes.paymentUrl) throw new Error("Không nhận được URL thanh toán");
      window.location.href = payRes.paymentUrl;
    } catch (err: any) {
      const msg = err?.message || (Array.isArray(err?.errors) ? err.errors.join(", ") : undefined);
      alert(msg || "Đặt hàng thất bại");
    }
  };

  // ── Empty cart ──
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-20 pb-12">
        <div className="ck-empty bg-white rounded-3xl border border-gray-100 shadow-sm p-14 text-center max-w-sm w-full mx-4">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <ShoppingBag className="w-10 h-10 text-gray-300" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Giỏ hàng trống</h2>
          <p className="text-gray-500 text-sm mb-7 leading-relaxed">Vui lòng thêm sản phẩm trước khi thanh toán.</p>
          <button
            onClick={() => navigate("/product")}
            className="ck-submit w-full bg-green-600 text-white py-3 rounded-xl font-semibold text-sm"
          >
            Về trang sản phẩm
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8 ck-e1">
          <button onClick={() => navigate("/cart")} className="ck-back inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 mb-4 cursor-pointer">
            <ArrowLeft className="ck-back-icon w-4 h-4" />
            Quay lại giỏ hàng
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Thanh toán</h1>
          <p className="text-sm text-gray-500">Hoàn tất thông tin để đặt hàng</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-7">

            {/* ── Left column ── */}
            <div className="lg:col-span-2 space-y-5">

              {/* Contact */}
              <div className="ck-e2">
                <SectionCard icon={<User className="w-4 h-4" />} title="Thông tin liên hệ">
                  <div className="grid md:grid-cols-2 gap-4">
                    <Field label="Họ và tên" required>
                      <input name="fullName" value={formData.fullName} onChange={handleInput}
                        className={inputCls} placeholder="Nguyễn Văn A" required />
                    </Field>
                    <Field label="Số điện thoại" required>
                      <input name="phone" value={formData.phone} onChange={handleInput}
                        className={inputCls} placeholder="0912 345 678" required />
                    </Field>
                    <Field label="Email" className="md:col-span-2">
                      <input name="email" type="email" value={formData.email} onChange={handleInput}
                        className={inputCls} placeholder="email@example.com" />
                    </Field>
                  </div>
                </SectionCard>
              </div>

              {/* Shipping address */}
              <div className="ck-e3">
                <SectionCard icon={<MapPin className="w-4 h-4" />} title="Địa chỉ giao hàng">
                  <div className="space-y-4">
                    <Field label="Địa chỉ" required>
                      <input name="address" value={formData.address} onChange={handleInput}
                        className={inputCls} placeholder="Số nhà, tên đường" required />
                    </Field>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { name: "city", placeholder: "Tỉnh/Thành phố" },
                        { name: "district", placeholder: "Quận/Huyện" },
                        { name: "ward", placeholder: "Phường/Xã" },
                      ].map(({ name, placeholder }) => (
                        <input key={name} name={name}
                          value={formData[name as keyof typeof formData]}
                          onChange={handleInput}
                          className={inputCls}
                          placeholder={placeholder}
                        />
                      ))}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Ghi chú</label>
                      <textarea name="note" value={formData.note} onChange={handleInput} rows={3}
                        className={`${inputCls} resize-none`}
                        placeholder="Ghi chú cho người giao hàng (tuỳ chọn)" />
                    </div>
                  </div>
                </SectionCard>
              </div>

              {/* Payment method */}
              <div className="ck-e4">
                <SectionCard icon={<CreditCard className="w-4 h-4" />} title="Phương thức thanh toán">
                  <div className="space-y-3">
                    {([
                      { value: "COD", label: "Thanh toán khi nhận hàng (COD)", desc: "Thanh toán bằng tiền mặt khi nhận hàng" },
                      { value: "PAYOS", label: "PayOS", desc: "Thanh toán qua PayOS (ATM, QR, Ví điện tử)" },
                    ] as { value: PaymentMethod; label: string; desc: string }[]).map(({ value, label, desc }) => (
                      <label
                        key={value}
                        className={`ck-pay-opt flex items-start gap-4 p-4 border-2 rounded-xl cursor-pointer ${paymentMethod === value ? "selected" : "border-gray-200"}`}
                      >
                        <input type="radio" name="payment" value={value}
                          checked={paymentMethod === value}
                          onChange={() => setPaymentMethod(value)}
                          className="mt-0.5 accent-green-600"
                        />
                        <div>
                          <p className="font-semibold text-sm text-gray-900 mb-0.5">{label}</p>
                          <p className="text-xs text-gray-500">{desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </SectionCard>
              </div>
            </div>

            {/* ── Right: order summary ── */}
            <div className="lg:col-span-1 ck-e5">
              <div className="ck-summary bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-24">

                <h2 className="text-base font-bold text-gray-900 mb-5">Đơn hàng ({items.length} sản phẩm)</h2>

                {/* Items */}
                <div className="space-y-3.5 mb-5 pb-5 border-b border-gray-100">
                  {items.map((item, i) => {
                    const price = Number(item.price.replace(/[^.\d]/g, "").replace(/\./g, "")) || 0;
                    return (
                      <div key={item.id} className="ck-order-item flex gap-3" style={{ animationDelay: `${0.28 + i * 0.05}s` }}>
                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-50 shrink-0">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug mb-1">{item.name}</p>
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>×{item.quantity}</span>
                            <span className="font-bold text-gray-800">{formatPrice(price * item.quantity)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Voucher */}
                <div className="mb-5 pb-5 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-green-600" /> Mã giảm giá
                  </p>
                  {promotions.length === 0 ? (
                    <p className="text-xs text-gray-400">Không có mã khuyến mãi</p>
                  ) : (
                    <div className="space-y-2">
                      {promotions.map((promo) => {
                        const ok = totalPrice >= promo.minOrderValue;
                        const sel = selectedPromotion?.promotionId === promo.promotionId;
                        return (
                          <label
                            key={promo.promotionId}
                            className={`ck-voucher-opt flex items-start gap-2.5 p-3 border-2 rounded-xl ${!ok ? "border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed" : sel ? "selected cursor-pointer" : "border-gray-200 cursor-pointer"}`}
                          >
                            <input type="radio" name="voucher"
                              checked={sel}
                              onChange={() => ok && setSelectedPromotion(promo)}
                              disabled={!ok}
                              className="mt-0.5 accent-green-600"
                            />
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-gray-900 font-mono">{promo.code}</p>
                              <p className="text-xs text-gray-500 leading-snug">{promo.description}</p>
                              {!ok && (
                                <p className="text-xs text-amber-500 mt-0.5">Tối thiểu {formatPrice(promo.minOrderValue)}</p>
                              )}
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Price breakdown */}
                <div className="space-y-2.5 mb-5 pb-5 border-b border-gray-100 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Tạm tính</span>
                    <span className="font-semibold text-gray-800">{formatPrice(totalPrice)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-green-700">
                      <span>Giảm giá</span>
                      <span className="font-semibold">−{formatPrice(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-600">
                    <span className="flex items-center gap-1"><Truck className="w-3.5 h-3.5" /> Vận chuyển</span>
                    <span className={`font-semibold ${shippingFee === 0 ? "text-green-600" : "text-gray-800"}`}>
                      {shippingFee === 0 ? "Miễn phí" : formatPrice(shippingFee)}
                    </span>
                  </div>
                </div>

                {/* Total */}
                <div className="flex items-center justify-between mb-5">
                  <span className="font-bold text-gray-900">Tổng cộng</span>
                  <span className="text-2xl font-black text-green-700">{formatPrice(finalTotal)}</span>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="ck-submit w-full bg-green-600 text-white py-3.5 rounded-xl font-bold text-sm mb-4 cursor-pointer"
                >
                  {loading
                    ? <span className="inline-flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Đang xử lý...</span>
                    : "Đặt hàng ngay →"}
                </button>

                {/* Trust */}
                <div className="space-y-2.5 pt-4 border-t border-gray-100">
                  {[
                    { icon: <CheckCircle className="w-4 h-4 text-green-600" />, bg: "bg-green-100", text: "Thông tin được bảo mật" },
                    { icon: <Truck className="w-4 h-4 text-blue-600" />, bg: "bg-blue-100", text: "Giao hàng nhanh 2–3 ngày" },
                  ].map(({ icon, bg, text }) => (
                    <div key={text} className="ck-trust flex items-center gap-2.5 text-xs text-gray-500">
                      <div className={`w-7 h-7 ${bg} rounded-lg flex items-center justify-center shrink-0`}>{icon}</div>
                      {text}
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
}