import React, { useRef, useEffect, useState } from "react";
import { ShoppingCart, Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";

// ─── Styles ───────────────────────────────────────────────────────────────────
const CSS = `
  @keyframes cd-dropdown-in {
    from { opacity:0; transform:translateY(-10px) scale(.97); }
    to   { opacity:1; transform:translateY(0) scale(1); }
  }
  @keyframes cd-item-in {
    from { opacity:0; transform:translateX(-10px); }
    to   { opacity:1; transform:translateX(0); }
  }
  @keyframes cd-badge-pop {
    0%  { transform:scale(1); }
    40% { transform:scale(1.45); }
    100%{ transform:scale(1); }
  }
  @keyframes cd-remove-out {
    to { opacity:0; transform:translateX(20px) scale(.95); max-height:0; overflow:hidden; padding:0; margin:0; }
  }
  @keyframes cd-empty-in {
    from { opacity:0; transform:scale(.92); }
    to   { opacity:1; transform:scale(1); }
  }

  /* Dropdown panel */
  .cd-panel { animation: cd-dropdown-in .22s cubic-bezier(.22,.68,0,1.1) both; }

  /* Cart icon button */
  .cd-btn {
    transition: background .15s, transform .2s cubic-bezier(.34,1.56,.64,1);
  }
  .cd-btn:hover { background:#f0fdf4; }
  .cd-btn:active { transform:scale(.92); }
  .cd-btn.open { background:#f0fdf4; }

  /* Badge */
  .cd-badge-anim { animation: cd-badge-pop .35s ease; }

  /* Item row */
  .cd-item { animation: cd-item-in .3s ease both; }
  .cd-item-removing { animation: cd-remove-out .25s ease forwards; }
  .cd-item-img { transition:transform .35s ease; }
  .cd-item:hover .cd-item-img { transform:scale(1.06); }

  /* Qty buttons */
  .cd-qty-btn {
    transition: background .15s, color .15s, transform .15s;
  }
  .cd-qty-btn:hover { background:#f0fdf4; color:#16a34a; }
  .cd-qty-btn:active { transform:scale(.85); }

  /* Remove button */
  .cd-remove {
    transition: background .15s, color .15s, transform .18s;
  }
  .cd-remove:hover { background:#fee2e2; color:#dc2626; transform:scale(1.1); }
  .cd-remove:active { transform:scale(.9); }

  /* Checkout CTA */
  .cd-checkout {
    transition: background .2s, transform .18s cubic-bezier(.34,1.56,.64,1), box-shadow .18s;
  }
  .cd-checkout:hover {
    background:#15803d;
    transform:translateY(-1px) scale(1.01);
    box-shadow:0 6px 18px rgba(22,163,74,.3);
  }
  .cd-checkout:active { transform:scale(.97); }

  /* View cart */
  .cd-view {
    transition: background .15s, border-color .15s, color .15s, transform .18s;
  }
  .cd-view:hover { background:#f0fdf4; border-color:#16a34a; color:#16a34a; transform:translateY(-1px); }
  .cd-view:active { transform:scale(.97); }

  /* Empty state */
  .cd-empty { animation: cd-empty-in .35s cubic-bezier(.22,.68,0,1) both; }

  /* Mobile overlay */
  .cd-overlay {
    animation: cd-dropdown-in .2s ease both;
  }

  /* Scrollbar */
  .cd-scroll::-webkit-scrollbar { width:4px; }
  .cd-scroll::-webkit-scrollbar-track { background:transparent; }
  .cd-scroll::-webkit-scrollbar-thumb { background:#e5e7eb; border-radius:4px; }
  .cd-scroll::-webkit-scrollbar-thumb:hover { background:#d1d5db; }
`;

function injectStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById("cd-styles")) return;
  const el = document.createElement("style");
  el.id = "cd-styles";
  el.textContent = CSS;
  document.head.appendChild(el);
}

const formatPrice = (n: number) => n.toLocaleString("vi-VN") + " ₫";

// ─── Main component ───────────────────────────────────────────────────────────
export default function CartDropdown() {
  injectStyles();

  const { items, removeFromCart, updateQuantity, getTotalItems, getTotalQuantity, getTotalPrice } = useCart();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [removingIds, setRemovingIds] = useState<Set<number>>(new Set());
  const [prevTotal, setPrevTotal] = useState(0);
  const [badgeAnim, setBadgeAnim] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const totalItems = getTotalItems(); // Count of unique products
  const totalQuantity = getTotalQuantity(); // Sum of all quantities
  const totalPrice = getTotalPrice();

  // Animate badge when count changes
  useEffect(() => {
    if (totalItems !== prevTotal && totalItems > 0) {
      setBadgeAnim(true);
      setTimeout(() => setBadgeAnim(false), 400);
    }
    setPrevTotal(totalItems);
  }, [totalItems]);

  // Close on outside click (for mobile / click mode)
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Desktop: hover open with small delay to avoid flicker
  const onMouseEnter = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => setOpen(true), 80);
  };
  const onMouseLeave = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => setOpen(false), 160);
  };

  // Animated remove
  function handleRemove(id: number) {
    setRemovingIds((s) => new Set(s).add(id));
    setTimeout(() => {
      removeFromCart(id);
      setRemovingIds((s) => { const n = new Set(s); n.delete(id); return n; });
    }, 240);
  }

  // Scroll to top helper
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Navigate with scroll to top
  const navigateWithScroll = (path: string) => {
    navigate(path);
    scrollToTop();
  };

  return (
    <>
      {/* Mobile overlay backdrop */}
      {open && (
        <div
          className="cd-overlay fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <div
        ref={wrapRef}
        className="relative"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {/* ── Cart button ── */}
        <button
          className={`cd-btn relative p-2 rounded-xl ${open ? "open" : ""}`}
          onClick={() => navigateWithScroll("/cart")}
          aria-label="Giỏ hàng"
        >
          <ShoppingCart className="w-5 h-5 text-gray-600" />
          {totalItems > 0 && (
            <span className={`absolute -top-1 -right-1 bg-green-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center leading-none ${badgeAnim ? "cd-badge-anim" : ""}`}>
              {totalItems > 99 ? "99+" : totalItems}
            </span>
          )}
        </button>

        {/* ── Dropdown panel ── */}
        {open && (
          <div
            className="cd-panel absolute right-0 top-full pt-2.5 z-50
              w-screen max-w-[340px] sm:max-w-[380px]
              lg:w-[360px]
              fixed lg:absolute
              right-0 lg:right-0
              "
            style={{
              // Mobile: anchor to right edge of screen
              right: typeof window !== "undefined" && window.innerWidth < 1024
                ? "max(0px, calc(50vw - 190px))"
                : undefined,
            }}
          >
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">

              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-green-600" />
                  <span className="font-bold text-sm text-gray-900">Giỏ hàng</span>
                </div>
                <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                  {totalItems} sản phẩm
                </span>
              </div>

              {/* Items */}
              <div className="cd-scroll max-h-[360px] overflow-y-auto">
                {items.length === 0 ? (
                  <div className="cd-empty px-6 py-10 text-center">
                    <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <ShoppingBag className="w-7 h-7 text-gray-300" />
                    </div>
                    <p className="text-sm font-semibold text-gray-600 mb-1">Giỏ hàng trống</p>
                    <p className="text-xs text-gray-400">Thêm sản phẩm để bắt đầu</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {items.map((item, i) => {
                      const itemPrice = Number(item.price.replace(/[^.\d]/g, "").replace(/\./g, "")) || 0;
                      const isRemoving = removingIds.has(item.id);

                      return (
                        <div
                          key={item.id}
                          className={`cd-item px-4 py-3.5 ${isRemoving ? "cd-item-removing" : ""}`}
                          style={{ animationDelay: `${i * 0.04}s` }}
                        >
                          <div className="flex gap-3">
                            {/* Image */}
                            <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-50 shrink-0">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="cd-item-img w-full h-full object-cover"
                              />
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <h4 className="text-xs font-semibold text-gray-900 line-clamp-2 leading-snug flex-1">
                                  {item.name}
                                </h4>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleRemove(item.id); }}
                                  className="cd-remove p-1 rounded-lg text-gray-300 shrink-0"
                                  aria-label="Xóa"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              <p className="text-xs font-bold text-green-700 mb-2">{item.price}</p>

                              {/* Qty + subtotal */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); updateQuantity(item.id, Math.max(1, item.quantity - 1)); }}
                                    className="cd-qty-btn px-2 py-1.5 text-gray-400"
                                    aria-label="Giảm"
                                  >
                                    <Minus className="w-3 h-3" />
                                  </button>
                                  <span className="px-2.5 py-1.5 text-xs font-bold bg-gray-50 text-gray-700 min-w-[28px] text-center">
                                    {item.quantity}
                                  </span>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); updateQuantity(item.id, item.quantity + 1); }}
                                    className="cd-qty-btn px-2 py-1.5 text-gray-400"
                                    aria-label="Tăng"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </button>
                                </div>
                                <span className="text-xs font-bold text-gray-700">
                                  {formatPrice(itemPrice * item.quantity)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer */}
              {items.length > 0 && (
                <div className="px-4 py-4 border-t border-gray-100 bg-gray-50/60">
                  {/* Total */}
                  <div className="flex items-center justify-between mb-3.5">
                    <span className="text-sm font-semibold text-gray-700">Tổng cộng</span>
                    <span className="text-lg font-black text-green-700">{formatPrice(totalPrice)}</span>
                  </div>

                  {/* CTAs */}
                  <button
                    onClick={() => { setOpen(false); navigateWithScroll("/checkout"); }}
                    className="cd-checkout w-full bg-green-600 text-white py-2.5 rounded-xl font-bold text-sm mb-2 flex items-center justify-center gap-2"
                  >
                    Thanh toán ngay <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => { setOpen(false); navigateWithScroll("/cart"); }}
                    className="cd-view w-full border-2 border-gray-200 text-gray-600 py-2.5 rounded-xl font-semibold text-sm"
                  >
                    Xem giỏ hàng
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}