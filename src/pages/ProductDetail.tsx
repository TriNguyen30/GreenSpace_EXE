import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ChevronLeft, Heart, ShoppingCart, Star, Check,
  Truck, Shield, RefreshCw, Package, Minus, Plus,
  ZoomIn, X, ChevronRight,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { getProductById, getProducts } from "@/services/product.service";
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

  /* ── Lightbox ── */
  @keyframes pd-lb-in {
    from { opacity:0; }
    to   { opacity:1; }
  }
  @keyframes pd-lb-img-in {
    from { opacity:0; transform:scale(.86); }
    to   { opacity:1; transform:scale(1); }
  }

  .pd-lb-overlay { animation: pd-lb-in .2s ease both; }
  .pd-lb-img-enter { animation: pd-lb-img-in .3s cubic-bezier(.22,.68,0,1) both; }

  .pd-lb-nav {
    transition: background .15s, transform .2s cubic-bezier(.34,1.56,.64,1);
  }
  .pd-lb-nav:hover { background:rgba(255,255,255,.18); transform:scale(1.1); }
  .pd-lb-nav:active { transform:scale(.9); }

  .pd-lb-close {
    transition: background .15s, transform .25s cubic-bezier(.34,1.56,.64,1);
  }
  .pd-lb-close:hover { background:rgba(255,255,255,.2); transform:scale(1.12) rotate(90deg); }
  .pd-lb-close:active { transform:scale(.88); }

  .pd-lb-thumb {
    transition: opacity .18s, transform .18s, border-color .18s;
    opacity: .5;
  }
  .pd-lb-thumb:hover { opacity:.85; transform:scale(1.07); }
  .pd-lb-thumb.lb-active { opacity:1; border-color:#4ade80; transform:scale(1.1); }

  /* Page enter */
  .pd-enter-1 { animation: pd-fade-up .5s ease .05s both; }
  .pd-enter-2 { animation: pd-fade-up .5s ease .12s both; }
  .pd-enter-3 { animation: pd-fade-up .5s ease .2s  both; }

  /* Main image */
  .pd-main-img { animation: pd-img-in .55s cubic-bezier(.22,.68,0,1) both; }
  .pd-main-img img { transition: transform .6s ease; }

  /* Clickable image wrapper */
  .pd-img-wrap { cursor:zoom-in; }
  .pd-img-wrap:hover img { transform:scale(1.04); }
  .pd-zoom-hint { transition:opacity .2s; opacity:0; }
  .pd-img-wrap:hover .pd-zoom-hint { opacity:1; }

  /* Thumbnail */
  .pd-thumb { transition: transform .2s, box-shadow .2s; }
  .pd-thumb:hover { transform:scale(.96); }
  .pd-thumb-overlay { transition:opacity .15s; opacity:0; }
  .pd-thumb:hover .pd-thumb-overlay { opacity:1; }

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
  .pd-qty-btn { transition: background .15s, color .15s, transform .15s; }
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
  .pd-cta-secondary { transition: background .2s, border-color .2s, transform .2s; }
  .pd-cta-secondary:hover { background: #f0fdf4; transform: translateY(-1px); }
  .pd-cta-secondary:active { transform:scale(.97); }

  /* Trust badge */
  .pd-trust { transition: transform .2s ease, box-shadow .2s; }
  .pd-trust:hover { transform:translateY(-3px); box-shadow:0 6px 18px rgba(0,0,0,.07); }

  /* Related card */
  .pd-related { transition: transform .3s cubic-bezier(.34,1.56,.64,1), box-shadow .3s ease; }
  .pd-related:hover { transform:translateY(-6px); box-shadow:0 16px 36px rgba(0,0,0,.1); }
  .pd-related img { transition: transform .5s ease; }
  .pd-related:hover img { transform:scale(1.08); }

  /* Back button */
  .pd-back { transition: color .2s, transform .2s; }
  .pd-back:hover { color:#16a34a; transform:translateX(-3px); }
  .pd-back:hover .pd-back-icon { transform:translateX(-3px); }
  .pd-back-icon { transition:transform .2s; }

  /* Care tip row */
  .pd-care-row { transition: padding-left .2s, color .2s; }
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
  toast.style.cssText = `position:relative;display:flex;align-items:center;gap:12px;min-width:300px;max-width:380px;padding:14px 16px;border-radius:14px;overflow:hidden;color:#fff;cursor:default;background:#16a34a;border:1px solid rgba(255,255,255,.15);box-shadow:0 4px 6px rgba(0,0,0,.07),0 10px 30px rgba(0,0,0,.18),inset 0 1px 0 rgba(255,255,255,.15);`;

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

// ─── Lightbox ─────────────────────────────────────────────────────────────────
function Lightbox({ images, startIndex, onClose }: {
  images: string[]; startIndex: number; onClose: () => void;
}) {
  const [idx, setIdx] = useState(startIndex);
  const [imgKey, setImgKey] = useState(0);
  const [zoomed, setZoomed] = useState(false);

  const go = useCallback((dir: 1 | -1) => {
    setZoomed(false);
    setIdx((i) => (i + dir + images.length) % images.length);
    setImgKey((k) => k + 1);
  }, [images.length]);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", fn);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", fn);
      document.body.style.overflow = "";
    };
  }, [go, onClose]);

  return (
    <div
      className="pd-lb-overlay fixed inset-0 z-[9998] flex flex-col"
      style={{ background: "rgba(0,0,0,.93)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-3 shrink-0">
        <span className="text-white/40 text-xs font-medium tracking-widest select-none">
          {idx + 1} / {images.length}
        </span>
        <div className="flex items-center gap-3">
          <span className="text-white/30 text-xs select-none">
            {zoomed ? "Nhấn để thu nhỏ" : "Nhấn vào ảnh để phóng to"}
          </span>
          <button onClick={onClose} className="pd-lb-close w-9 h-9 rounded-full flex items-center justify-center text-white/70">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Image */}
      <div className="flex-1 flex items-center justify-center px-12 relative min-h-0">
        {images.length > 1 && (
          <button onClick={() => go(-1)} className="pd-lb-nav absolute left-3 z-10 w-11 h-11 rounded-full bg-white/10 flex items-center justify-center text-white/80">
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        <div
          key={imgKey}
          className={`pd-lb-img-enter select-none ${zoomed ? "cursor-zoom-out" : "cursor-zoom-in"}`}
          style={{ maxWidth: "min(88vw, 900px)", maxHeight: "72vh" }}
          onClick={() => setZoomed((z) => !z)}
        >
          <img
            src={images[idx]}
            alt=""
            draggable={false}
            style={{
              maxWidth: "100%",
              maxHeight: "72vh",
              objectFit: "contain",
              borderRadius: 12,
              display: "block",
              transition: "transform .4s cubic-bezier(.22,.68,0,1)",
              transform: zoomed ? "scale(2)" : "scale(1)",
            }}
          />
        </div>

        {images.length > 1 && (
          <button onClick={() => go(1)} className="pd-lb-nav absolute right-3 z-10 w-11 h-11 rounded-full bg-white/10 flex items-center justify-center text-white/80">
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="flex justify-center gap-2 py-4 px-4 overflow-x-auto shrink-0">
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => { setZoomed(false); setIdx(i); setImgKey((k) => k + 1); }}
              className={`pd-lb-thumb shrink-0 w-14 h-14 rounded-xl overflow-hidden border-2 ${i === idx ? "lb-active border-green-400" : "border-transparent"}`}
            >
              <img src={src} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Mock mẹo chăm sóc nhanh
const MOCK_CARE_TIPS: string[] = [
  "Ánh sáng: đặt cây ở nơi có ánh sáng gián tiếp, tránh nắng gắt trưa.",
  "Tưới nước: kiểm tra độ ẩm đất trước khi tưới, tránh tưới quá nhiều.",
  "Đất: dùng đất thoát nước tốt, có thể trộn thêm xơ dừa hoặc perlite.",
];

function Stars({ count = 5, rating = 5 }: { count?: number; rating?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} className={`w-4 h-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"}`} />
      ))}
    </div>
  );
}

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

  const [apiProduct, setApiProduct] = useState<ApiProduct | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [mainImage, setMainImage] = useState("");
  const [relatedProducts, setRelatedProducts] = useState<ApiProduct[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [quantityInput, setQuantityInput] = useState("1");
  const [liked, setLiked] = useState(false);
  const [likedAnimating, setLikedAnimating] = useState(false);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Scroll lên đầu trang khi vào chi tiết sản phẩm (từ Home / Product)
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    if (!id) { setError("Không tìm thấy sản phẩm"); return; }
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        const result = await getProductById(id);
        if (cancelled || !result) { if (!cancelled) setError("Không tìm thấy sản phẩm"); return; }
        setApiProduct(result);
        setMainImage(result.thumbnailUrl || "");
        const active = result.variants?.filter((v) => v.isActive) ?? [];
        setSelectedVariant(active.find((v) => v.stockQuantity > 0) ?? active[0] ?? null);
      } catch { if (!cancelled) setError("Không thể tải sản phẩm"); }
      finally { if (!cancelled) setLoading(false); }
    };
    load();
    return () => { cancelled = true; };
  }, [id]);

  useEffect(() => {
    getActivePromotions().then(setPromotions).catch(console.error);
  }, []);

  useEffect(() => {
    if (!apiProduct?.categoryName) return;
    getProducts()
      .then((all) => all.filter((p) => p.productId !== apiProduct.productId && p.categoryName === apiProduct.categoryName))
      .then((filtered) => setRelatedProducts(filtered.slice(0, 4)))
      .catch(() => setRelatedProducts([]));
  }, [apiProduct?.productId, apiProduct?.categoryName]);

  const basePriceNumber = selectedVariant?.price ?? apiProduct?.basePrice ?? 0;
  const displayedName = apiProduct?.name ?? "";
  const displayedDescription = apiProduct?.description ?? "";
  const displayedCategory = apiProduct?.categoryName ?? "";
  const displayedBrand = apiProduct?.brandName ?? "Đang cập nhật";
  const skuSource = selectedVariant?.sku ?? apiProduct?.productId ?? "";
  const activeVariants = apiProduct?.variants?.filter((v) => v.isActive) ?? [];

  const validPromotions = promotions.filter((p) => p.isActive && basePriceNumber >= p.minOrderValue && new Date(p.endDate) > new Date());
  const bestPromotion = validPromotions[0];
  let discountAmount = 0;
  if (bestPromotion) {
    discountAmount = bestPromotion.discountType === "Fixed" ? bestPromotion.discountValue : Math.min(bestPromotion.maxDiscount ?? Infinity, (basePriceNumber * bestPromotion.discountValue) / 100);
  }
  const finalPrice = basePriceNumber - discountAmount;

  const thumbnails = useMemo(() => {
    const imgs = mainImage ? [mainImage] : [];
    const variantImgs = (apiProduct?.variants ?? []).map((v) => v.imageUrl).filter((u): u is string => !!u);
    for (const u of variantImgs) {
      if (imgs.length >= 4) break;
      if (!imgs.includes(u)) imgs.push(u);
    }
    return imgs;
  }, [mainImage, apiProduct?.variants]);

  function changeQuantity(delta: number) {
    setQuantity((q) => { const n = Math.max(1, q + delta); setQuantityInput(String(n)); return n; });
  }

  function handleLike() {
    setLiked((v) => !v);
    setLikedAnimating(true);
    setTimeout(() => setLikedAnimating(false), 400);
  }

  function openLightbox(index: number) {
    setLightboxIndex(index);
    setLightboxOpen(true);
  }

  function handleAddToCart() {
    if (!apiProduct) return;
    if (activeVariants.length > 0 && !selectedVariant) { showToast("Vui lòng chọn phiên bản sản phẩm"); return; }
    if (selectedVariant?.stockQuantity === 0) { showToast("Phiên bản này đã hết hàng"); return; }
    const cartItem = {
      id: Array.from(apiProduct.productId).slice(0, 8).reduce((s, c) => s + c.charCodeAt(0), 0),
      name: selectedVariant?.sizeOrModel ? `${apiProduct.name} - ${selectedVariant.sizeOrModel}` : apiProduct.name,
      price: `${basePriceNumber.toLocaleString()} đ`,
      image: selectedVariant?.imageUrl ?? apiProduct.thumbnailUrl ?? "",
      productId: apiProduct.productId,
      variantId: selectedVariant?.variantId ?? apiProduct.productId,
    };
    addToCart(cartItem, quantity);
    showToast(`Đã thêm ${quantity} ${cartItem.name} vào giỏ hàng!`);
  }

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

  if (error && !apiProduct) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
        <p className="text-gray-700">{error ?? "Không tìm thấy sản phẩm"}</p>
        <button onClick={() => navigate(-1)} className="px-5 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700 transition-colors">Quay lại</button>
      </div>
    );
  }

  return (
    <>
      {/* Lightbox portal */}
      {lightboxOpen && thumbnails.length > 0 && (
        <Lightbox
          images={thumbnails}
          startIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}

      <div className="min-h-screen bg-gradient-to-b from-green-50/40 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">

          {/* Breadcrumb */}
          <div className="mb-6 pd-enter-1">
            <button onClick={() => navigate("/product")} className="pd-back inline-flex items-center gap-1.5 text-sm text-gray-500 font-medium">
              <ChevronLeft className="pd-back-icon w-4 h-4" />
              Quay lại danh sách
            </button>
          </div>

          {/* Main card */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden pd-enter-2">
            <div className="grid lg:grid-cols-2 gap-0">

              {/* ── Gallery ── */}
              <div className="p-6 lg:p-10 lg:border-r border-gray-100">

                {/* Main image — click to open lightbox */}
                <div
                  className="pd-main-img pd-img-wrap relative rounded-2xl overflow-hidden bg-gray-50 mb-4 aspect-[4/3]"
                  onClick={() => openLightbox(Math.max(0, thumbnails.indexOf(mainImage)))}
                >
                  <img src={mainImage} alt={displayedName} className="w-full h-full object-cover" />

                  {/* Zoom hint — fades in on hover */}
                  <div className="pd-zoom-hint absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/40 backdrop-blur-sm text-white/80 text-xs px-2.5 py-1.5 rounded-lg pointer-events-none">
                    <ZoomIn className="w-3.5 h-3.5" />
                    Nhấn để phóng to
                  </div>

                  {/* Like button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleLike(); }}
                    className={`pd-heart absolute top-4 right-4 z-10 w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-all ${liked ? "bg-pink-500 text-white liked" : "bg-white/90 text-gray-400 hover:text-pink-500"} ${likedAnimating ? "liked" : ""}`}
                  >
                    <Heart className={`w-5 h-5 ${liked ? "fill-current" : ""}`} />
                  </button>
                </div>

                {/* Thumbnails — click active thumb to open lightbox, click other thumb to switch */}
                <div className="grid grid-cols-4 gap-2 mb-6">
                  {thumbnails.map((src, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        if (mainImage === src) {
                          openLightbox(i);
                        } else {
                          setMainImage(src);
                        }
                      }}
                      className={`pd-thumb relative rounded-xl overflow-hidden aspect-square ${mainImage === src ? "ring-2 ring-green-500 ring-offset-1" : "ring-1 ring-gray-200 hover:ring-green-300"}`}
                    >
                      <img src={src} alt={`thumb-${i}`} className="w-full h-full object-cover" />
                      {/* Hover zoom icon */}
                      <div className="pd-thumb-overlay absolute inset-0 bg-black/15 flex items-center justify-center">
                        <ZoomIn className="w-4 h-4 text-white drop-shadow" />
                      </div>
                    </button>
                  ))}
                </div>

                {/* Care tips card */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50/60 border border-green-100 rounded-2xl p-5">
                  <SectionTitle>Mẹo chăm sóc nhanh</SectionTitle>
                  <ul className="space-y-2">
                    {MOCK_CARE_TIPS.map((c, idx) => (
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

                <div className="bg-gray-50 rounded-2xl p-4 mb-5 border border-gray-100">
                  <div className="flex items-end gap-3">
                    <span className="text-3xl font-black text-green-700">{finalPrice.toLocaleString()} ₫</span>
                    {discountAmount > 0 && <span className="text-base text-gray-400 line-through mb-0.5">{basePriceNumber.toLocaleString()} ₫</span>}
                    {discountAmount > 0 && <span className="text-xs font-bold text-white bg-red-500 px-2 py-0.5 rounded-full mb-1">-{Math.round((discountAmount / basePriceNumber) * 100)}%</span>}
                  </div>
                  {bestPromotion && (
                    <p className="text-xs text-green-700 font-medium mt-1.5">
                      🎉 Mã <span className="font-mono font-bold">{bestPromotion.code}</span> — giảm {discountAmount.toLocaleString()} ₫
                    </p>
                  )}
                </div>

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
                          <button key={v.variantId} onClick={() => !oos && setSelectedVariant(v)} disabled={oos}
                            className={`pd-variant relative px-4 py-2 rounded-xl border-2 text-sm font-medium ${isSelected ? "border-green-500 bg-green-50 text-green-700 shadow-sm" : oos ? "border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed" : "border-gray-200 bg-white text-gray-700 hover:border-green-300"}`}>
                            {v.sizeOrModel ?? v.sku}
                            {oos && <span className="ml-1 text-xs text-gray-300">(hết)</span>}
                            {isSelected && <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center"><Check className="w-2.5 h-2.5 text-white" strokeWidth={3} /></span>}
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

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
                  <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden bg-white shrink-0 w-fit">
                    <button onClick={() => changeQuantity(-1)} className="pd-qty-btn px-3 py-2.5 text-gray-500"><Minus className="w-4 h-4" /></button>
                    <input type="number" min={1} value={quantityInput}
                      onChange={(e) => { const r = e.target.value; if (!/^\d*$/.test(r)) return; setQuantityInput(r); if (r) setQuantity(Math.max(1, Number(r))); }}
                      onBlur={() => setQuantityInput((c) => (c && Number(c) >= 1 ? c : String(Math.max(1, quantity))))}
                      className="w-12 py-2.5 bg-transparent text-sm font-bold text-center border-0 outline-none [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    />
                    <button onClick={() => changeQuantity(1)} className="pd-qty-btn px-3 py-2.5 text-gray-500"><Plus className="w-4 h-4" /></button>
                  </div>
                  <div className="flex gap-2 flex-1">
                    <button onClick={handleAddToCart} className="pd-cta-primary flex-1 inline-flex items-center justify-center gap-2 text-white px-5 py-2.5 rounded-xl font-semibold text-sm">
                      <ShoppingCart className="w-4 h-4" /> Thêm vào giỏ
                    </button>
                    <button onClick={() => { handleAddToCart(); navigate("/checkout"); }} className="pd-cta-secondary px-5 py-2.5 border-2 border-green-600 text-green-700 rounded-xl font-semibold text-sm">
                      Mua ngay
                    </button>
                  </div>
                </div>

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

                <div className="grid sm:grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <SectionTitle>Thông tin</SectionTitle>
                    <ul className="space-y-2 text-sm">
                      {[
                        ["Loại", displayedCategory],
                        ["Thương hiệu", displayedBrand],
                        ["Độ khó", "Trung bình"],
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
                      <li className="text-gray-400 text-xs">Không có thông số</li>
                    </ul>
                  </div>
                </div>

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
                <button onClick={() => navigate("/product")} className="text-sm font-semibold text-green-700 hover:text-green-800 hover:underline transition-colors">Xem tất cả →</button>
              </div>
              {relatedProducts.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {relatedProducts.map((p) => (
                    <button key={p.productId} type="button" onClick={() => navigate(`/product/${p.productId}`)} className="pd-related text-left bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                      <div className="relative overflow-hidden aspect-[4/3]">
                        <img src={p.thumbnailUrl} alt={p.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="p-3">
                        <p className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2 leading-snug">{p.name}</p>
                        <p className="text-base font-bold text-green-700">{p.basePrice.toLocaleString("vi-VN")} ₫</p>
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
    </>
  );
}