import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Trash2, Plus, Minus, ArrowLeft, ShoppingBag,
  Tag, Truck, Shield, CreditCard, Package, ShoppingCart,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import Modal from "@/components/ui/Modal";

// ─── Styles ───────────────────────────────────────────────────────────────────
const CSS = `
  @keyframes cp-fade-up {
    from { opacity:0; transform:translateY(20px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes cp-fade-in {
    from { opacity:0; }
    to   { opacity:1; }
  }
  @keyframes cp-item-in {
    from { opacity:0; transform:translateX(-16px); }
    to   { opacity:1; transform:translateX(0); }
  }
  @keyframes cp-empty-in {
    from { opacity:0; transform:scale(.94); }
    to   { opacity:1; transform:scale(1); }
  }
  @keyframes cp-remove-out {
    to { opacity:0; transform:translateX(32px) scale(.95); max-height:0; margin:0; padding:0; }
  }
  @keyframes cp-bag-bounce {
    0%,100% { transform:translateY(0) rotate(0deg); }
    30%     { transform:translateY(-8px) rotate(-6deg); }
    60%     { transform:translateY(-4px) rotate(4deg); }
  }
  @keyframes cp-progress-fill {
    from { width:0; }
  }
  @keyframes cp-spinner {
    to { transform:rotate(360deg); }
  }

  /* Page sections */
  .cp-enter-1 { animation: cp-fade-up .45s ease .04s both; }
  .cp-enter-2 { animation: cp-fade-up .45s ease .12s both; }
  .cp-enter-3 { animation: cp-fade-up .45s ease .22s both; }
  .cp-enter-4 { animation: cp-fade-up .45s ease .3s both; }

  /* Cart items stagger */
  .cp-item { animation: cp-item-in .4s ease both; overflow:hidden; }
  .cp-item-removing { animation: cp-remove-out .3s ease forwards; }

  /* Empty state */
  .cp-empty { animation: cp-empty-in .5s cubic-bezier(.22,.68,0,1) both; }
  .cp-bag-anim { animation: cp-bag-bounce 2.4s ease-in-out infinite 1s; }

  /* Back / nav buttons */
  .cp-back { transition: color .2s, transform .2s; }
  .cp-back:hover { color:#16a34a; transform:translateX(-3px); }
  .cp-back-icon { transition: transform .2s; }
  .cp-back:hover .cp-back-icon { transform: translateX(-3px); }

  .cp-orders-btn { transition: color .2s; }
  .cp-orders-btn:hover { color:#16a34a; }
  .cp-orders-btn:hover .cp-orders-icon { transform: scale(1.15); }
  .cp-orders-icon { transition: transform .2s; }

  /* Clear all */
  .cp-clear-btn { transition: color .2s, transform .2s; }
  .cp-clear-btn:hover { color:#dc2626; transform:scale(1.04); }

  /* Cart item card */
  .cp-card {
    transition: box-shadow .25s ease, transform .25s ease;
  }
  .cp-card:hover {
    box-shadow: 0 8px 28px rgba(0,0,0,.09);
    transform: translateY(-1px);
  }

  /* Item image */
  .cp-item-img {
    transition: transform .4s ease;
  }
  .cp-card:hover .cp-item-img { transform: scale(1.04); }

  /* Remove button */
  .cp-remove {
    transition: background .15s, color .15s, transform .2s;
  }
  .cp-remove:hover { background:#fee2e2; color:#dc2626; transform:scale(1.1); }
  .cp-remove:active { transform:scale(.93); }

  /* Qty controls */
  .cp-qty-btn {
    transition: background .15s, color .15s, transform .15s;
  }
  .cp-qty-btn:hover { background:#f0fdf4; color:#16a34a; }
  .cp-qty-btn:active { transform:scale(.88); }

  /* Checkout CTA */
  .cp-checkout-btn {
    background: linear-gradient(135deg, #16a34a, #22c55e);
    transition: transform .2s cubic-bezier(.34,1.56,.64,1), box-shadow .2s, filter .2s;
  }
  .cp-checkout-btn:hover {
    transform: translateY(-2px) scale(1.01);
    box-shadow: 0 8px 24px rgba(22,163,74,.35);
    filter: brightness(1.05);
  }
  .cp-checkout-btn:active { transform: scale(.97); }

  /* Continue shopping */
  .cp-continue-btn {
    transition: background .2s, border-color .2s, transform .2s;
  }
  .cp-continue-btn:hover { background:#f0fdf4; border-color:#16a34a; color:#16a34a; transform:translateY(-1px); }
  .cp-continue-btn:active { transform:scale(.97); }

  /* Trust badges */
  .cp-trust { transition: transform .2s ease, box-shadow .2s; }
  .cp-trust:hover { transform:translateY(-3px); box-shadow:0 6px 18px rgba(0,0,0,.07); }

  /* Info card (bottom row) */
  .cp-info-card { transition: transform .25s ease, box-shadow .25s ease; }
  .cp-info-card:hover { transform:translateY(-4px); box-shadow:0 12px 28px rgba(0,0,0,.08); }

  /* Shipping progress bar */
  .cp-ship-bar { animation: cp-progress-fill .8s cubic-bezier(.22,.68,0,1) .4s both; }

  /* Subtotal flash on qty change */
  @keyframes cp-price-flash {
    0%   { color:#16a34a; }
    100% { color:#111827; }
  }
  .cp-price-flash { animation: cp-price-flash .5s ease; }
`;

function injectCartStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById("cp-styles")) return;
  const el = document.createElement("style");
  el.id = "cp-styles";
  el.textContent = CSS;
  document.head.appendChild(el);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatPrice = (price: number) => price.toLocaleString("vi-VN") + " ₫";

// ─── Component ────────────────────────────────────────────────────────────────
export default function CartPage() {
  injectCartStyles();

  const navigate = useNavigate();
  const { items, removeFromCart, updateQuantity, getTotalPrice, clearCart } = useCart();
  const [quantityInputs, setQuantityInputs] = useState<Record<number, string>>({});
  const [clearAllModalOpen, setClearAllModalOpen] = useState(false);
  const [removingIds, setRemovingIds] = useState<Set<number>>(new Set());

  const totalPrice = getTotalPrice();
  const shippingFee = totalPrice > 500000 ? 0 : 30000;
  const discount = 0;
  const finalTotal = totalPrice + shippingFee - discount;
  const shipProgress = Math.min(100, (totalPrice / 500000) * 100);

  // Animated remove
  function handleRemove(id: number) {
    setRemovingIds((s) => new Set(s).add(id));
    setTimeout(() => {
      removeFromCart(id);
      setRemovingIds((s) => { const n = new Set(s); n.delete(id); return n; });
    }, 280);
  }

  function handleCheckout() {
    if (items.length === 0) return;
    navigate("/checkout");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50/40 to-white pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Header ── */}
        <div className="mb-8 cp-enter-1">
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <button
              onClick={() => navigate("/product")}
              className="cp-back inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 cursor-pointer"
            >
              <ArrowLeft className="cp-back-icon w-4 h-4" />
              Tiếp tục mua sắm
            </button>
            <span className="text-gray-300">|</span>
            <button
              onClick={() => navigate("/orders")}
              className="cp-orders-btn inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 cursor-pointer"
            >
              <Package className="cp-orders-icon w-4 h-4" />
              Đơn hàng của tôi
            </button>
          </div>

          <div className="flex items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-1">
                Giỏ hàng
              </h1>
              <p className="text-gray-500 text-sm">
                {items.length > 0
                  ? <><span className="font-semibold text-gray-700">{items.length}</span> sản phẩm đang chờ bạn</>
                  : "Giỏ hàng của bạn đang trống"}
              </p>
            </div>
            {items.length > 0 && (
              <button
                onClick={() => setClearAllModalOpen(true)}
                className="cp-clear-btn inline-flex items-center gap-1.5 text-sm font-medium text-gray-400"
              >
                <Trash2 className="w-4 h-4" />
                Xóa tất cả
              </button>
            )}
          </div>
        </div>

        {/* ── Empty state ── */}
        {items.length === 0 ? (
          <div className="cp-empty bg-white rounded-3xl shadow-sm border border-gray-100 p-16 text-center max-w-lg mx-auto">
            <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="cp-bag-anim w-12 h-12 text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Giỏ hàng trống</h2>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">
              Hãy khám phá các sản phẩm tuyệt vời của chúng tôi và thêm vào giỏ hàng!
            </p>
            <button
              onClick={() => navigate("/product")}
              className="cp-checkout-btn inline-flex items-center gap-2 text-white px-8 py-3 rounded-xl font-semibold text-sm cu"
            >
              <ShoppingCart className="w-4 h-4" />
              Khám phá sản phẩm
            </button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">

            {/* ── Cart items ── */}
            <div className="lg:col-span-2 space-y-4 cp-enter-2">
              {items.map((item, idx) => {
                const itemPrice = Number(item.price.replace(/[^.\d]/g, "").replace(/\./g, "")) || 0;
                const subtotal = itemPrice * item.quantity;
                const isRemoving = removingIds.has(item.id);

                return (
                  <div
                    key={item.id}
                    className={`cp-item cp-card bg-white rounded-2xl border border-gray-100 p-5 ${isRemoving ? "cp-item-removing" : ""}`}
                    style={{ animationDelay: `${0.1 + idx * 0.06}s` }}
                  >
                    <div className="flex gap-5">
                      {/* Image */}
                      <div className="flex-shrink-0 w-28 h-28 rounded-xl overflow-hidden bg-gray-50">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="cp-item-img w-full h-full object-cover"
                        />
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-900 leading-snug line-clamp-2 mb-1">
                              {item.name}
                            </h3>
                            <span className="inline-flex items-center gap-1 text-xs text-gray-400 font-mono">
                              <Tag className="w-3 h-3" />
                              GS-{item.id.toString().padStart(4, "0")}
                            </span>
                          </div>
                          <button
                            onClick={() => handleRemove(item.id)}
                            className="cp-remove p-1.5 rounded-lg text-gray-300"
                            aria-label="Xóa"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Price row */}
                        <div className="flex items-end justify-between gap-4 mt-3">
                          <div>
                            <p className="text-xs text-gray-400 mb-0.5">Đơn giá</p>
                            <p className="text-base font-bold text-green-700">{item.price}</p>
                          </div>

                          {/* Qty control */}
                          <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-white">
                            <button
                              onClick={() => {
                                const n = Math.max(1, item.quantity - 1);
                                updateQuantity(item.id, n);
                                setQuantityInputs((p) => ({ ...p, [item.id]: String(n) }));
                              }}
                              className="cp-qty-btn px-3 py-2 text-gray-400"
                              aria-label="Giảm"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <input
                              type="number"
                              min={1}
                              value={quantityInputs[item.id] ?? String(item.quantity)}
                              onChange={(e) => {
                                const r = e.target.value;
                                if (!/^\d*$/.test(r)) return;
                                setQuantityInputs((p) => ({ ...p, [item.id]: r }));
                                if (!r) return;
                                const n = Number(r);
                                if (isNaN(n)) return;
                                updateQuantity(item.id, Math.max(1, n));
                              }}
                              onBlur={() =>
                                setQuantityInputs((p) => {
                                  const c = p[item.id];
                                  return c && Number(c) >= 1 ? p : { ...p, [item.id]: String(Math.max(1, item.quantity)) };
                                })
                              }
                              className="w-12 py-2 bg-gray-50 text-sm font-bold text-center border-0 outline-none [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                            />
                            <button
                              onClick={() => {
                                const n = item.quantity + 1;
                                updateQuantity(item.id, n);
                                setQuantityInputs((p) => ({ ...p, [item.id]: String(n) }));
                              }}
                              className="cp-qty-btn px-3 py-2 text-gray-400"
                              aria-label="Tăng"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Subtotal */}
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                          <span className="text-xs text-gray-400">Tạm tính</span>
                          <span className="text-sm font-bold text-gray-800">{formatPrice(subtotal)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── Order Summary ── */}
            <div className="lg:col-span-1 cp-enter-3">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-24">
                <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-green-600" />
                  Tóm tắt đơn hàng
                </h2>

                {/* Breakdown */}
                <div className="space-y-3 mb-5 pb-5 border-b border-gray-100 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Tạm tính ({items.length} sp)</span>
                    <span className="font-semibold text-gray-800">{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span className="flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5" /> Vận chuyển
                    </span>
                    <span className={`font-semibold ${shippingFee === 0 ? "text-green-600" : "text-gray-800"}`}>
                      {shippingFee === 0 ? "Miễn phí" : formatPrice(shippingFee)}
                    </span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span className="flex items-center gap-1.5"><Tag className="w-3.5 h-3.5" /> Giảm giá</span>
                      <span className="font-semibold">-{formatPrice(discount)}</span>
                    </div>
                  )}
                </div>

                {/* Total */}
                <div className="flex items-center justify-between mb-5">
                  <span className="font-bold text-gray-900">Tổng cộng</span>
                  <span className="text-2xl font-black text-green-700">{formatPrice(finalTotal)}</span>
                </div>

                {/* Free shipping nudge */}
                {totalPrice < 500000 && (
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-3.5 mb-5">
                    <div className="flex items-start gap-2.5">
                      <Truck className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                      <div className="text-xs text-blue-800 flex-1">
                        <p className="font-semibold mb-2">
                          Mua thêm <span className="text-blue-600">{formatPrice(500000 - totalPrice)}</span> để miễn phí vận chuyển
                        </p>
                        <div className="w-full bg-blue-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="cp-ship-bar bg-blue-500 h-1.5 rounded-full"
                            style={{ width: `${shipProgress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* CTAs */}
                <button onClick={handleCheckout} className="cp-checkout-btn w-full text-white py-3.5 rounded-xl font-bold text-sm mb-3 cursor-pointer">
                  Tiến hành thanh toán →
                </button>
                <button onClick={() => navigate("/product")} className="cp-continue-btn w-full border-2 border-gray-200 text-gray-600 py-3 rounded-xl font-semibold text-sm transition-colors cursor-pointer">
                  Tiếp tục mua sắm
                </button>

                {/* Trust mini-badges */}
                <div className="mt-5 pt-5 border-t border-gray-100 space-y-2.5">
                  {[
                    { icon: <Shield className="w-4 h-4 text-green-600" />, bg: "bg-green-100", text: "Thanh toán an toàn & bảo mật" },
                    { icon: <Truck className="w-4 h-4 text-blue-600" />, bg: "bg-blue-100", text: "Giao hàng nhanh 2–3 ngày" },
                    { icon: <CreditCard className="w-4 h-4 text-violet-600" />, bg: "bg-violet-100", text: "Nhiều phương thức thanh toán" },
                  ].map(({ icon, bg, text }) => (
                    <div key={text} className="cp-trust flex items-center gap-3 text-xs text-gray-500 bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100 cursor-default">
                      <div className={`w-7 h-7 ${bg} rounded-lg flex items-center justify-center shrink-0`}>{icon}</div>
                      {text}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Info cards ── */}
        {items.length > 0 && (
          <div className="mt-10 grid md:grid-cols-3 gap-5 cp-enter-4">
            {[
              { icon: <Truck className="w-5 h-5 text-green-600" />, bg: "bg-green-100", title: "Giao hàng miễn phí", desc: "Đơn hàng từ 500.000₫ được miễn phí vận chuyển" },
              { icon: <Shield className="w-5 h-5 text-blue-600" />, bg: "bg-blue-100", title: "Thanh toán an toàn", desc: "Bảo mật thông tin thanh toán 100%" },
              { icon: <Tag className="w-5 h-5 text-violet-600" />, bg: "bg-violet-100", title: "Đổi trả dễ dàng", desc: "Đổi trả trong vòng 7 ngày nếu không hài lòng" },
            ].map(({ icon, bg, title, desc }) => (
              <div key={title} className="cp-info-card bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className={`w-11 h-11 ${bg} rounded-xl flex items-center justify-center shrink-0`}>{icon}</div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm mb-1">{title}</h3>
                    <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Confirm clear modal ── */}
        <Modal
          open={clearAllModalOpen}
          onClose={() => setClearAllModalOpen(false)}
          title="Xóa tất cả"
          size="sm"
        >
          <p className="text-gray-500 text-sm mb-6 leading-relaxed">
            Bạn có chắc muốn xóa toàn bộ sản phẩm trong giỏ hàng? Hành động này không thể hoàn tác.
          </p>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setClearAllModalOpen(false)}
              className="px-4 py-2.5 rounded-xl font-semibold text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={() => { clearCart(); setClearAllModalOpen(false); }}
              className="px-4 py-2.5 rounded-xl font-semibold text-sm text-white bg-red-600 hover:bg-red-700 transition-colors inline-flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Xóa tất cả
            </button>
          </div>
        </Modal>
      </div>
    </div>
  );
}