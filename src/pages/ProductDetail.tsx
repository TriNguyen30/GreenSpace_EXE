import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ChevronLeft, Heart, ShoppingCart, Star, Check,
  Truck, Shield, RefreshCw, Package, Minus, Plus,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { getProductById } from "@/services/product.service";
import type { Product as ApiProduct, ProductVariant } from "@/types/api";
import { getActivePromotions } from "@/services/promotion.service";
import type { Promotion } from "@/types/promotion";

// ─── Styles ───────────────────────────────────────────────────────────────────
const CSS = `
  @keyframes pd-fade-up {
    from { opacity:0; transform:translateY(20px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes pd-fade-in {
    from { opacity:0; }
    to   { opacity:1; }
  }
  @keyframes pd-img-in {
    from { opacity:0; transform:scale(.96); }
    to   { opacity:1; transform:scale(1); }
  }
  @keyframes pd-heart-pop {
    0%  { transform:scale(1); }
    40% { transform:scale(1.35); }
    100%{ transform:scale(1); }
  }
  @keyframes pd-badge-in {
    from { opacity:0; transform:scale(.7) rotate(-6deg); }
    to   { opacity:1; transform:scale(1) rotate(0deg); }
  }
  @keyframes pd-toast-in {
    from { opacity:0; transform:translateX(calc(100% + 24px)) scale(.92); }
    60%  { transform:translateX(-6px) scale(1.02); }
    to   { opacity:1; transform:translateX(0) scale(1); }
  }
  @keyframes pd-toast-out {
    to { opacity:0; transform:translateX(calc(100% + 24px)) scale(.92); }
  }
  @keyframes pd-toast-bar {
    from { width:100%; }
    to   { width:0; }
  }
  @keyframes pd-spinner {
    to { transform:rotate(360deg); }
  }

  /* Page enter */
  .pd-enter-1 { animation: pd-fade-up .5s ease .05s both; }
  .pd-enter-2 { animation: pd-fade-up .5s ease .12s both; }
  .pd-enter-3 { animation: pd-fade-up .5s ease .2s  both; }

  /* Main image */
  .pd-main-img { animation: pd-img-in .55s cubic-bezier(.22,.68,0,1) both; }
  .pd-main-img img { transition: transform .6s ease; }
  .pd-main-img:hover img { transform: scale(1.04); }

  /* Thumbnail */
  .pd-thumb {
    transition: ring .2s, transform .2s, box-shadow .2s;
  }
  .pd-thumb:hover { transform:scale(.96); }

  /* Badge */
  .pd-new-badge { animation: pd-badge-in .4s cubic-bezier(.34,1.56,.64,1) .35s both; }

  /* Heart */
  .pd-heart.liked { animation: pd-heart-pop .35s ease; }

  /* Variant chip */
  .pd-variant {
    transition: border-color .18s, background .18s, transform .18s, box-shadow .18s;
  }
  .pd-variant:not(:disabled):hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(22,163,74,.18);
  }
  .pd-variant:not(:disabled):active { transform:scale(.96); }

  /* Qty buttons */
  .pd-qty-btn {
    transition: background .15s, color .15s, transform .15s;
  }
  .pd-qty-btn:hover { background:#f0fdf4; color:#16a34a; }
  .pd-qty-btn:active { transform:scale(.9); }

  /* Primary CTA */
  .pd-cta-primary {
    background: linear-gradient(135deg, #16a34a, #22c55e);
    transition: transform .2s cubic-bezier(.34,1.56,.64,1), box-shadow .2s, filter .2s;
  }
  .pd-cta-primary:hover {
    transform: translateY(-2px) scale(1.02);
    box-shadow: 0 8px 24px rgba(22,163,74,.35);
    filter: brightness(1.05);
  }
  .pd-cta-primary:active { transform:scale(.97); }

  /* Secondary CTA */
  .pd-cta-secondary {
    transition: background .2s, border-color .2s, transform .2s;
  }
  .pd-cta-secondary:hover {
    background: #f0fdf4;
    transform: translateY(-1px);
  }
  .pd-cta-secondary:active { transform:scale(.97); }

  /* Trust badge */
  .pd-trust {
    transition: transform .2s ease, box-shadow .2s;
  }
  .pd-trust:hover { transform:translateY(-3px); box-shadow:0 6px 18px rgba(0,0,0,.07); }

  /* Related card */
  .pd-related {
    transition: transform .3s cubic-bezier(.34,1.56,.64,1), box-shadow .3s ease;
  }
  .pd-related:hover { transform:translateY(-6px); box-shadow:0 16px 36px rgba(0,0,0,.1); }
  .pd-related img { transition: transform .5s ease; }
  .pd-related:hover img { transform:scale(1.08); }

  /* Back button */
  .pd-back { transition: color .2s, transform .2s; }
  .pd-back:hover { color:#16a34a; transform:translateX(-3px); }
  .pd-back:hover .pd-back-icon { transform:translateX(-3px); }
  .pd-back-icon { transition:transform .2s; }

  /* Care tip row */
  .pd-care-row {
    transition: padding-left .2s, color .2s;
  }
  .pd-care-row:hover { padding-left:4px; color:#166534; }

  /* Spec row */
  .pd-spec-row { transition: background .15s; }
  .pd-spec-row:hover { background:#f0fdf4; border-radius:6px; }

  /* Toast */
  .pd-toast-enter { animation: pd-toast-in .45s cubic-bezier(.34,1.56,.64,1) forwards; }
  .pd-toast-exit  { animation: pd-toast-out .3s ease forwards; }
  .pd-toast-bar   { animation: pd-toast-bar linear forwards; }

  /* Loading spinner */
  .pd-spinner {
    width:40px; height:40px;
    border:3px solid rgba(22,163,74,.2);
    border-top-color:#16a34a;
    border-radius:50%;
    animation:pd-spinner .8s linear infinite;
  }
`;

function injectPDStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById("pd-styles")) return;
  const el = document.createElement("style");
  el.id = "pd-styles";
  el.textContent = CSS;
  document.head.appendChild(el);
}

// ─── Toast helper ─────────────────────────────────────────────────────────────
function showToast(message: string) {
  const container = (() => {
    let c = document.getElementById("pd-toast-container") as HTMLDivElement | null;
    if (!c) {
      c = document.createElement("div");
      c.id = "pd-toast-container";
      c.style.cssText = "position:fixed;top:80px;right:16px;z-index:9999;display:flex;flex-direction:column;gap:8px;pointer-events:none;";
      document.body.appendChild(c);
    }
    return c;
  })();

  const wrap = document.createElement("div");
  wrap.style.cssText = "pointer-events:auto;overflow:hidden;";

  const toast = document.createElement("div");
  toast.className = "pd-toast-enter";
  toast.style.cssText = `
    position:relative; display:flex; align-items:center; gap:12px;
    min-width:300px; max-width:380px; padding:14px 16px;
    border-radius:14px; overflow:hidden; color:#fff; cursor:default;
    background:#16a34a;
    border:1px solid rgba(255,255,255,.15);
    box-shadow:0 4px 6px rgba(0,0,0,.07),0 10px 30px rgba(0,0,0,.18),inset 0 1px 0 rgba(255,255,255,.15);
  `;

  const icon = document.createElement("div");
  icon.style.cssText = "font-size:22px;line-height:1;width:32px;height:32px;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,.18);border-radius:8px;flex-shrink:0;color:#fff;";
  icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>`;

  const textBlock = document.createElement("div");
  textBlock.style.cssText = "flex:1;min-width:0;";
  const lbl = document.createElement("p");
  lbl.style.cssText = "font-size:11px;font-weight:700;letter-spacing:.04em;margin:0 0 2px;opacity:.75;text-transform:uppercase;";
  lbl.textContent = "Thành công";
  const msg = document.createElement("p");
  msg.style.cssText = "font-size:14px;font-weight:500;margin:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;";
  msg.textContent = message;
  textBlock.append(lbl, msg);

  const closeBtn = document.createElement("button");
  closeBtn.style.cssText = "flex-shrink:0;background:rgba(255,255,255,.15);border:none;color:rgba(255,255,255,.8);width:24px;height:24px;border-radius:6px;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;padding:0;";
  closeBtn.innerHTML = `<svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M1 1l10 10M11 1L1 11" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`;

  const track = document.createElement("div");
  track.style.cssText = "position:absolute;bottom:0;left:0;right:0;height:3px;background:rgba(255,255,255,.15);border-radius:0 0 14px 14px;overflow:hidden;";
  const bar = document.createElement("div");
  bar.className = "pd-toast-bar";
  bar.style.cssText = "height:100%;background:rgba(255,255,255,.5);border-radius:inherit;animation-duration:3000ms;";
  track.appendChild(bar);

  toast.append(icon, textBlock, closeBtn, track);
  wrap.appendChild(toast);
  container.appendChild(wrap);

  let dismissed = false;
  const dismiss = () => {
    if (dismissed) return;
    dismissed = true;
    toast.className = "pd-toast-exit";
    setTimeout(() => wrap.remove(), 320);
  };

  closeBtn.addEventListener("click", dismiss);
  const t = setTimeout(dismiss, 3000);
  toast.addEventListener("mouseenter", () => { bar.style.animationPlayState = "paused"; clearTimeout(t); });
  toast.addEventListener("mouseleave", () => { bar.style.animationPlayState = "running"; setTimeout(dismiss, 800); });
}

// ─── Types & mock data ────────────────────────────────────────────────────────
type Product = {
  id: number; name: string; description: string; price: string;
  image: string; isNew?: boolean; type: string; size: "small" | "medium" | "large";
  careDifficulty: string; care?: string[]; specs?: Record<string, string>;
};

const MOCK_PRODUCTS: Product[] = [
  { id: 1, name: "Tùng La Hán Dáng Văn Nhân", description: "Cây nội thất, cây phong thủy — thân gọn, dễ bài trí ở không gian làm việc.", price: "425.000 ₫", image: "https://images.unsplash.com/photo-1463320726281-696a485928c7?w=1200&h=900&fit=crop", isNew: true, type: "drought", size: "medium", careDifficulty: "easy", care: ["Ánh sáng: bán nắng", "Tưới: mỗi 7–10 ngày", "Đất: thoát nước tốt"], specs: { "Chiều cao": "30–45 cm", "Màu lá": "xanh đậm", "Mùa": "cả năm" } },
  { id: 2, name: "Cây Trầu Bà Vàng", description: "Lá vàng điểm xuyết — phù hợp cho kệ, bàn làm việc nhỏ.", price: "220.000 ₫", image: "https://images.unsplash.com/photo-1466781783364-36c955e42a7f?w=1200&h=900&fit=crop", isNew: true, type: "tabletop", size: "small", careDifficulty: "easy", care: ["Ánh sáng: gián tiếp", "Tưới: giữ ẩm vừa phải"], specs: { "Chiều cao": "20–30 cm", "Màu lá": "xanh/vàng" } },
  { id: 3, name: "Cây Monstera", description: "Phong cách hiện đại — lá lớn, đường vân ấn tượng.", price: "650.000 ₫", image: "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=1200&h=900&fit=crop", type: "indoor", size: "large", careDifficulty: "medium", care: ["Ánh sáng: gián tiếp sáng", "Tưới: mỗi 7–12 ngày"], specs: { "Chiều cao": "60–120 cm", "Màu lá": "xanh" } },
  { id: 4, name: "Cây Sen Đá", description: "Nhỏ xinh, dễ chăm — lý tưởng cho góc bàn làm việc.", price: "150.000 ₫", image: "https://images.unsplash.com/photo-1509937528035-ad76254b0356?w=1200&h=900&fit=crop", type: "tabletop", size: "small", careDifficulty: "easy", care: ["Ánh sáng: nhiều nắng", "Tưới: rất ít, để khô giữa các lần tưới"], specs: { "Chiều cao": "10–20 cm", "Màu lá": "xanh/đỏ" } },
];

// ─── Star rating ──────────────────────────────────────────────────────────────
function Stars({ count = 5, rating = 5 }: { count?: number; rating?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} className={`w-4 h-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"}`} />
      ))}
    </div>
  );
}

// ─── Section heading ──────────────────────────────────────────────────────────
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider flex items-center gap-2">
      <span className="w-3 h-3 rounded-full bg-green-500 inline-block" />
      {children}
    </h3>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function ProductDetail() {
  injectPDStyles();

  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const productId = Number(id) || MOCK_PRODUCTS[0].id;
  const product = useMemo(() => MOCK_PRODUCTS.find((p) => p.id === productId) ?? MOCK_PRODUCTS[0], [productId]);

  const [apiProduct, setApiProduct] = useState<ApiProduct | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [mainImage, setMainImage] = useState(product.image);
  const [quantity, setQuantity] = useState(1);
  const [quantityInput, setQuantityInput] = useState("1");
  const [liked, setLiked] = useState(false);
  const [likedAnimating, setLikedAnimating] = useState(false);
  const [promotions, setPromotions] = useState<Promotion[]>([]);

  useEffect(() => {
    if (!id) { setError("Không tìm thấy sản phẩm"); return; }
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        const result = await getProductById(id);
        if (cancelled || !result) { if (!cancelled) setError("Không tìm thấy sản phẩm"); return; }
        setApiProduct(result);
        setMainImage(result.thumbnailUrl || product.image);
        const active = result.variants?.filter((v) => v.isActive) ?? [];
        setSelectedVariant(active.find((v) => v.stockQuantity > 0) ?? active[0] ?? null);
      } catch { if (!cancelled) setError("Không thể tải sản phẩm"); }
      finally { if (!cancelled) setLoading(false); }
    };
    load();
    return () => { cancelled = true; };
  }, [id, product.image]);

  useEffect(() => {
    getActivePromotions().then(setPromotions).catch(console.error);
  }, []);

  const basePriceNumber = selectedVariant?.price ?? apiProduct?.basePrice ?? Number(product.price.replace(/[^\d]/g, ""));
  const displayedName = apiProduct?.name ?? product.name;
  const displayedDescription = apiProduct?.description ?? product.description;
  const displayedCategory = apiProduct?.categoryName ?? product.type;
  const displayedBrand = apiProduct?.brandName ?? "Đang cập nhật";
  const skuSource = selectedVariant?.sku ?? apiProduct?.productId ?? product.id;
  const activeVariants = apiProduct?.variants?.filter((v) => v.isActive) ?? [];

  const validPromotions = promotions.filter((p) => p.isActive && basePriceNumber >= p.minOrderValue && new Date(p.endDate) > new Date());
  const bestPromotion = validPromotions[0];
  let discountAmount = 0;
  if (bestPromotion) {
    discountAmount = bestPromotion.discountType === "Fixed" ? bestPromotion.discountValue : Math.min(bestPromotion.maxDiscount ?? Infinity, (basePriceNumber * bestPromotion.discountValue) / 100);
  }
  const finalPrice = basePriceNumber - discountAmount;

  const related = useMemo(() => MOCK_PRODUCTS.filter((p) => p.id !== product.id && p.type === product.type).slice(0, 4), [product]);

  function changeQuantity(delta: number) {
    setQuantity((q) => { const n = Math.max(1, q + delta); setQuantityInput(String(n)); return n; });
  }

  function handleLike() {
    setLiked((v) => !v);
    setLikedAnimating(true);
    setTimeout(() => setLikedAnimating(false), 400);
  }

  function handleAddToCart() {
    if (activeVariants.length > 0 && !selectedVariant) { showToast("Vui lòng chọn phiên bản sản phẩm"); return; }
    if (selectedVariant?.stockQuantity === 0) { showToast("Phiên bản này đã hết hàng"); return; }
    const cartItem = apiProduct
      ? { id: Array.from(apiProduct.productId).slice(0, 8).reduce((s, c) => s + c.charCodeAt(0), 0), name: selectedVariant?.sizeOrModel ? `${apiProduct.name} - ${selectedVariant.sizeOrModel}` : apiProduct.name, price: `${basePriceNumber.toLocaleString()} đ`, image: selectedVariant?.imageUrl ?? apiProduct.thumbnailUrl, productId: apiProduct.productId, variantId: selectedVariant?.variantId ?? null }
      : { id: product.id, name: product.name, price: product.price, image: product.image };
    addToCart(cartItem, quantity);
    showToast(`Đã thêm ${quantity} ${cartItem.name} vào giỏ hàng!`);
  }

  // ── Loading state ──
  if (loading && !apiProduct) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <div className="pd-spinner mx-auto" />
          <p className="text-gray-500 text-sm">Đang tải sản phẩm...</p>
        </div>
      </div>
    );
  }

  if ((error && !apiProduct) || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
        <p className="text-gray-700">{error ?? "Không tìm thấy sản phẩm"}</p>
        <button onClick={() => navigate(-1)} className="px-5 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700 transition-colors">Quay lại</button>
      </div>
    );
  }

  const thumbnails = [product.image, ...MOCK_PRODUCTS.filter((p) => p.id !== product.id).map((p) => p.image)].slice(0, 4);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50/40 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">

        {/* Breadcrumb */}
        <div className="mb-6 pd-enter-1">
          <button onClick={() => navigate(-1)} className="pd-back inline-flex items-center gap-1.5 text-sm text-gray-500 font-medium">
            <ChevronLeft className="pd-back-icon w-4 h-4" />
            Quay lại danh sách
          </button>
        </div>

        {/* Main card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden pd-enter-2">
          <div className="grid lg:grid-cols-2 gap-0">

            {/* ── Gallery ── */}
            <div className="p-6 lg:p-10 lg:border-r border-gray-100">

              {/* Main image */}
              <div className="pd-main-img relative rounded-2xl overflow-hidden bg-gray-50 mb-4 aspect-[4/3]">
                {product.isNew && (
                  <div className="pd-new-badge absolute top-4 left-4 z-10 bg-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
                    MỚI
                  </div>
                )}
                <img src={mainImage} alt={displayedName} className="w-full h-full object-cover" />

                {/* Like button overlay */}
                <button
                  onClick={handleLike}
                  className={`pd-heart absolute top-4 right-4 z-10 w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-all ${liked ? "bg-pink-500 text-white liked" : "bg-white/90 text-gray-400 hover:text-pink-500"} ${likedAnimating ? "liked" : ""}`}
                >
                  <Heart className={`w-5 h-5 ${liked ? "fill-current" : ""}`} />
                </button>
              </div>

              {/* Thumbnails */}
              <div className="grid grid-cols-4 gap-2 mb-6">
                {thumbnails.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setMainImage(src)}
                    className={`pd-thumb rounded-xl overflow-hidden aspect-square ${mainImage === src ? "ring-2 ring-green-500 ring-offset-1" : "ring-1 ring-gray-200 hover:ring-green-300"}`}
                  >
                    <img src={src} alt={`thumb-${i}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>

              {/* Care tips card */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50/60 border border-green-100 rounded-2xl p-5">
                <SectionTitle>Mẹo chăm sóc nhanh</SectionTitle>
                <ul className="space-y-2">
                  {(product.care ?? []).map((c, idx) => (
                    <li key={idx} className="pd-care-row flex items-start gap-2.5 text-sm text-green-800 rounded-lg px-1 py-0.5 cursor-default">
                      <Check className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" />
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* ── Product Info ── */}
            <div className="p-6 lg:p-10 flex flex-col">

              {/* Name + rating */}
              <div className="mb-5">
                <span className="inline-block text-xs font-semibold text-green-700 bg-green-100 px-3 py-1 rounded-full mb-3">
                  {displayedCategory}
                </span>
                <h1 className="text-3xl font-bold text-gray-900 leading-snug mb-2">{displayedName}</h1>
                <p className="text-gray-500 text-sm leading-relaxed mb-3">{displayedDescription}</p>
                <div className="flex items-center gap-2">
                  <Stars />
                  <span className="text-sm text-gray-400">(128 đánh giá)</span>
                </div>
              </div>

              {/* Price block */}
              <div className="bg-gray-50 rounded-2xl p-4 mb-5 border border-gray-100">
                <div className="flex items-end gap-3">
                  <span className="text-3xl font-black text-green-700">{finalPrice.toLocaleString()} ₫</span>
                  {discountAmount > 0 && (
                    <span className="text-base text-gray-400 line-through mb-0.5">{basePriceNumber.toLocaleString()} ₫</span>
                  )}
                  {discountAmount > 0 && (
                    <span className="text-xs font-bold text-white bg-red-500 px-2 py-0.5 rounded-full mb-1">
                      -{Math.round((discountAmount / basePriceNumber) * 100)}%
                    </span>
                  )}
                </div>
                {bestPromotion && (
                  <p className="text-xs text-green-700 font-medium mt-1.5">
                    🎉 Mã <span className="font-mono font-bold">{bestPromotion.code}</span> — giảm {discountAmount.toLocaleString()} ₫
                  </p>
                )}
              </div>

              {/* Variants */}
              {activeVariants.length > 0 && (
                <div className="mb-5 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="flex items-center gap-2 mb-3">
                    <Package className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-semibold text-gray-700">Phiên bản <span className="text-red-500">*</span></span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {activeVariants.map((v) => {
                      const isSelected = selectedVariant?.variantId === v.variantId;
                      const oos = v.stockQuantity === 0;
                      return (
                        <button
                          key={v.variantId}
                          onClick={() => !oos && setSelectedVariant(v)}
                          disabled={oos}
                          className={`pd-variant relative px-4 py-2 rounded-xl border-2 text-sm font-medium
                            ${isSelected ? "border-green-500 bg-green-50 text-green-700 shadow-sm"
                              : oos ? "border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed"
                                : "border-gray-200 bg-white text-gray-700 hover:border-green-300"}`}
                        >
                          {v.sizeOrModel ?? v.sku}
                          {oos && <span className="ml-1 text-xs text-gray-300">(hết)</span>}
                          {isSelected && (
                            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                              <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  {selectedVariant && (
                    <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between text-xs">
                      <span className="text-gray-400 font-mono">SKU: {selectedVariant.sku}</span>
                      <span className={`font-semibold ${selectedVariant.stockQuantity > 10 ? "text-green-600" : selectedVariant.stockQuantity > 0 ? "text-orange-500" : "text-red-500"}`}>
                        {selectedVariant.stockQuantity > 0 ? `Còn ${selectedVariant.stockQuantity}` : "Hết hàng"}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Qty + Actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
                {/* Qty */}
                <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden bg-white shrink-0 w-fit">
                  <button onClick={() => changeQuantity(-1)} className="pd-qty-btn px-3 py-2.5 text-gray-500">
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="number" min={1} value={quantityInput}
                    onChange={(e) => { const r = e.target.value; if (!/^\d*$/.test(r)) return; setQuantityInput(r); if (r) setQuantity(Math.max(1, Number(r))); }}
                    onBlur={() => setQuantityInput((c) => (c && Number(c) >= 1 ? c : String(Math.max(1, quantity))))}
                    className="w-12 py-2.5 bg-transparent text-sm font-bold text-center border-0 outline-none [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  />
                  <button onClick={() => changeQuantity(1)} className="pd-qty-btn px-3 py-2.5 text-gray-500">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* CTAs */}
                <div className="flex gap-2 flex-1">
                  <button onClick={handleAddToCart} className="pd-cta-primary flex-1 inline-flex items-center justify-center gap-2 text-white px-5 py-2.5 rounded-xl font-semibold text-sm">
                    <ShoppingCart className="w-4 h-4" /> Thêm vào giỏ
                  </button>
                  <button onClick={() => { handleAddToCart(); navigate("/checkout"); }} className="pd-cta-secondary px-5 py-2.5 border-2 border-green-600 text-green-700 rounded-xl font-semibold text-sm">
                    Mua ngay
                  </button>
                </div>
              </div>

              {/* Trust badges */}
              <div className="grid grid-cols-3 gap-3 mb-6 pb-6 border-b border-gray-100">
                {[
                  { icon: <Shield className="w-5 h-5 text-green-600" />, bg: "bg-green-100", label: "Cam kết chất lượng" },
                  { icon: <Truck className="w-5 h-5 text-blue-600" />, bg: "bg-blue-100", label: "Giao hàng nhanh" },
                  { icon: <RefreshCw className="w-5 h-5 text-violet-600" />, bg: "bg-violet-100", label: "Đổi trả dễ dàng" },
                ].map(({ icon, bg, label }) => (
                  <div key={label} className="pd-trust text-center bg-gray-50 rounded-xl p-3 border border-gray-100 cursor-default">
                    <div className={`w-10 h-10 ${bg} rounded-full flex items-center justify-center mx-auto mb-1.5`}>{icon}</div>
                    <p className="text-xs font-medium text-gray-600 leading-tight">{label}</p>
                  </div>
                ))}
              </div>

              {/* Detail + Specs */}
              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <SectionTitle>Thông tin</SectionTitle>
                  <ul className="space-y-2 text-sm">
                    {[
                      ["Loại", displayedCategory],
                      ["Thương hiệu", displayedBrand],
                      ["Độ khó", product.careDifficulty],
                      ["SKU", selectedVariant?.sku ?? `GS-${String(skuSource).padStart(4, "0")}`],
                    ].map(([k, v]) => (
                      <li key={k} className="pd-spec-row flex justify-between px-1 py-0.5">
                        <span className="text-gray-500">{k}</span>
                        <span className="font-semibold text-gray-800 font-mono text-xs">{v}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <SectionTitle>Thông số</SectionTitle>
                  <ul className="space-y-2 text-sm">
                    {product.specs ? Object.entries(product.specs).map(([k, v]) => (
                      <li key={k} className="pd-spec-row flex justify-between px-1 py-0.5">
                        <span className="text-gray-500">{k}</span>
                        <span className="font-semibold text-gray-800">{v}</span>
                      </li>
                    )) : <li className="text-gray-400 text-xs">Không có thông số</li>}
                  </ul>
                </div>
              </div>

              {/* Care steps */}
              <div>
                <SectionTitle>Hướng dẫn chăm sóc</SectionTitle>
                <ol className="space-y-2.5">
                  {[
                    "Đặt cây ở nơi có ánh sáng gián tiếp sáng.",
                    "Kiểm tra độ ẩm đất trước khi tưới — tránh tưới quá nhiều.",
                    "Bón phân loãng 1–2 lần / tháng vào mùa sinh trưởng.",
                  ].map((text, i) => (
                    <li key={i} className="flex gap-3 text-sm text-gray-600">
                      <span className="w-5 h-5 rounded-full bg-green-100 text-green-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                      {text}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>

          {/* Related products */}
          <div className="border-t border-gray-100 bg-gray-50/60 px-6 lg:px-10 py-10 pd-enter-3">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Có thể bạn sẽ thích</h3>
              <button onClick={() => navigate("/product")} className="text-sm font-semibold text-green-700 hover:text-green-800 hover:underline transition-colors">
                Xem tất cả →
              </button>
            </div>

            {related.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {related.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => navigate(`/product/${p.id}`)}
                    className="pd-related text-left bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm"
                  >
                    <div className="relative overflow-hidden aspect-[4/3]">
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                      {p.isNew && (
                        <div className="absolute top-2 right-2 bg-green-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">MỚI</div>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2 leading-snug">{p.name}</p>
                      <p className="text-base font-bold text-green-700">{p.price}</p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-400 py-8 text-sm">Không tìm thấy sản phẩm liên quan.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}