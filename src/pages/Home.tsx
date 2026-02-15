import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Leaf, MapPin, Recycle, Truck, CircleCheck } from "lucide-react";
import { useNavigate } from "react-router";
import { getProducts } from "@/services/product.service";
import type { Product as ApiProduct } from "@/types/api";

// ─── Inject keyframes & base animation styles ────────────────────────────────
const CSS = `
@keyframes gs-fade-up {
  from { opacity: 0; transform: translateY(40px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes gs-fade-left {
  from { opacity: 0; transform: translateX(-40px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes gs-fade-right {
  from { opacity: 0; transform: translateX(40px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes gs-scale-in {
  from { opacity: 0; transform: scale(0.88); }
  to   { opacity: 1; transform: scale(1); }
}
@keyframes gs-float {
  0%, 100% { transform: translateY(0px) rotate(-1deg); }
  50%       { transform: translateY(-14px) rotate(1deg); }
}
@keyframes gs-float2 {
  0%, 100% { transform: translateY(0px) rotate(1deg); }
  50%       { transform: translateY(-10px) rotate(-1deg); }
}
@keyframes gs-badge-pop {
  0%  { opacity: 0; transform: scale(0.6) translateX(-8px); }
  60% { transform: scale(1.08) translateX(2px); }
  100%{ opacity: 1; transform: scale(1) translateX(0); }
}
@keyframes gs-pulse-glow {
  0%, 100% { box-shadow: 0 0 0 0 rgba(34,197,94,.35); }
  50%       { box-shadow: 0 0 0 14px rgba(34,197,94,0); }
}
@keyframes gs-shimmer {
  from { background-position: -200% center; }
  to   { background-position: 200% center; }
}
@keyframes gs-leaf-spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
@keyframes gs-counter-tick {
  from { opacity: 0; transform: translateY(-8px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes gs-bg-shift {
  0%, 100% { background-position: 0% 50%; }
  50%       { background-position: 100% 50%; }
}
@keyframes gs-new-badge {
  0%   { transform: scale(1); }
  50%  { transform: scale(1.12); }
  100% { transform: scale(1); }
}

/* Scroll-reveal base — hidden until .gs-visible is added */
.gs-reveal {
  opacity: 0;
  transition: opacity .7s cubic-bezier(.22,.68,0,1), transform .7s cubic-bezier(.22,.68,0,1);
}
.gs-reveal.from-up    { transform: translateY(36px); }
.gs-reveal.from-left  { transform: translateX(-36px); }
.gs-reveal.from-right { transform: translateX(36px); }
.gs-reveal.from-scale { transform: scale(0.9); }
.gs-reveal.gs-visible {
  opacity: 1;
  transform: none;
}

/* Hero entrance (fires immediately on mount) */
.gs-hero-badge  { animation: gs-badge-pop   .55s cubic-bezier(.34,1.56,.64,1) .1s both; }
.gs-hero-h1     { animation: gs-fade-left   .65s cubic-bezier(.22,.68,0,1)   .25s both; }
.gs-hero-p      { animation: gs-fade-left   .55s ease                         .4s  both; }
.gs-hero-btns   { animation: gs-fade-up     .5s  ease                         .55s both; }
.gs-hero-img    { animation: gs-scale-in    .7s  cubic-bezier(.22,.68,0,1.1) .2s  both; }

/* Floating images */
.gs-float  { animation: gs-float  6s ease-in-out infinite; }
.gs-float2 { animation: gs-float2 7s ease-in-out infinite .8s; }

/* CTA gradient bg animation */
.gs-cta-bg {
  background: linear-gradient(135deg, #16a34a, #22c55e, #15803d, #4ade80);
  background-size: 300% 300%;
  animation: gs-bg-shift 6s ease infinite;
}

/* Product card */
.gs-card {
  transition: transform .3s cubic-bezier(.34,1.56,.64,1), box-shadow .3s ease;
}
.gs-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 20px 40px rgba(0,0,0,.12);
}
.gs-card img {
  transition: transform .5s ease;
}
.gs-card:hover img {
  transform: scale(1.07);
}
.gs-card .gs-new-badge {
  animation: gs-new-badge 2s ease-in-out infinite;
}

/* Benefit card */
.gs-benefit {
  transition: transform .25s cubic-bezier(.34,1.56,.64,1), box-shadow .25s ease;
}
.gs-benefit:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 28px rgba(0,0,0,.08);
}
.gs-benefit:hover .gs-benefit-icon {
  animation: gs-leaf-spin .6s ease;
}

/* Why choose rows */
.gs-why-row {
  transition: transform .2s ease;
}
.gs-why-row:hover {
  transform: translateX(6px);
}
.gs-why-row:hover .gs-check-circle {
  animation: gs-pulse-glow .6s ease;
}

/* CTA button */
.gs-cta-btn {
  transition: transform .2s cubic-bezier(.34,1.56,.64,1), box-shadow .2s ease;
}
.gs-cta-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 24px rgba(0,0,0,.15);
}
.gs-cta-btn:active { transform: scale(.97); }

/* Primary button */
.gs-btn-primary {
  transition: transform .2s cubic-bezier(.34,1.56,.64,1), background .2s, box-shadow .2s;
  animation: gs-pulse-glow 2.5s ease-in-out infinite;
}
.gs-btn-primary:hover {
  transform: scale(1.06) translateY(-1px);
  box-shadow: 0 6px 20px rgba(34,197,94,.4);
}
.gs-btn-primary:active { transform: scale(.96); }

/* Outline button */
.gs-btn-outline {
  transition: transform .2s ease, border-color .2s, color .2s;
}
.gs-btn-outline:hover {
  transform: translateY(-2px);
}

/* Shimmer loading */
.gs-shimmer {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% auto;
  animation: gs-shimmer 1.4s linear infinite;
  border-radius: 12px;
}

/* "Xem tất cả" link */
.gs-see-all {
  transition: transform .2s ease, color .2s;
}
.gs-see-all:hover {
  transform: translateX(4px);
  color: #15803d;
}
`;

function injectGSStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById("gs-anim")) return;
  const tag = document.createElement("style");
  tag.id = "gs-anim";
  tag.textContent = CSS;
  document.head.appendChild(tag);
}

// ─── Intersection-observer hook ───────────────────────────────────────────────
function useReveal(options?: IntersectionObserverInit) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("gs-visible");
          observer.unobserve(el);
        }
      },
      { threshold: 0.15, ...options }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return ref;
}

// ─── Staggered children reveal ────────────────────────────────────────────────
function useStaggerReveal(count: number, delayBase = 0.1) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;
    const children = Array.from(container.children) as HTMLElement[];

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          children.forEach((child, i) => {
            child.style.transitionDelay = `${delayBase * i}s`;
            child.classList.add("gs-visible");
          });
          observer.unobserve(container);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(container);
    return () => observer.disconnect();
  }, [count, delayBase]);

  return ref;
}

// ─── Shimmer skeleton ─────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-md">
      <div className="gs-shimmer w-full h-48" />
      <div className="p-4 space-y-2">
        <div className="gs-shimmer h-4 w-3/4" />
        <div className="gs-shimmer h-4 w-1/2" />
      </div>
    </div>
  );
}

// ─── Data ────────────────────────────────────────────────────────────────────
const benefits = [
  {
    icon: <Leaf className="w-6 h-6 gs-benefit-icon" />,
    title: "Cây khỏe mạnh",
    description: "Mỗi cây được chăm sóc tốt các chuyên gia thực vật hàng đầu.",
  },
  {
    icon: <MapPin className="w-6 h-6 gs-benefit-icon" />,
    title: "Phù hợp mọi nơi",
    description: "Thiết kế đa dạng tối ưu cho cả không gian nhỏ & văn phòng.",
  },
  {
    icon: <Recycle className="w-6 h-6 gs-benefit-icon" />,
    title: "Thân thiện môi trường",
    description: "Quy trình đóng gói và vận chuyển giảm thiểu rác thải nhựa.",
  },
  {
    icon: <Truck className="w-6 h-6 gs-benefit-icon" />,
    title: "Giao hàng an toàn",
    description: "Hệ thống đóng gói chuyên dụng đảm bảo cây tươi nguyên vẹn.",
  },
];

const whyChoose = [
  {
    title: "Hỗ trợ chăm sóc 24/7",
    description:
      "Đội ngũ kỹ thuật viên luôn sẵn sàng giải đáp thắc mắc về kỹ thuật chăm sóc cây.",
  },
  {
    title: "Bảo hành 30 ngày",
    description:
      "Cam kết 1 đổi 1 nếu cây có dấu hiệu suy yếu do lỗi vận chuyển hoặc kỹ thuật vườn.",
  },
  {
    title: "Nguồn gốc rõ ràng",
    description:
      "Cây được nuôi trồng bền vững tại các nhà vườn uy tín, không thuốc kích thích độc hại.",
  },
];

// ─── Main component ───────────────────────────────────────────────────────────
type FeaturedProduct = ApiProduct & { isNew?: boolean };

export default function GreenSpaceLanding() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const [products, setProducts] = useState<FeaturedProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productsError, setProductsError] = useState<string | null>(null);

  injectGSStyles();

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setLoadingProducts(true);
        setProductsError(null);
        const apiProducts = await getProducts();
        if (cancelled) return;
        const safe = Array.isArray(apiProducts) ? apiProducts : [];
        const mapped: FeaturedProduct[] = safe
          .slice(0, 8)
          .map((p: ApiProduct, idx: number) => ({ ...p, isNew: idx < 4 }));
        setProducts(mapped);
      } catch (e) {
        if (!cancelled) {
          console.error(e);
          setProductsError("Không tải được sản phẩm nổi bật. Vui lòng thử lại sau.");
        }
      } finally {
        if (!cancelled) setLoadingProducts(false);
      }
    };
    void load();
    return () => { cancelled = true; };
  }, []);

  const formatPrice = useMemo(
    () => (price: number) => `${price.toLocaleString("vi-VN")} ₫`,
    []
  );

  // Scroll-reveal refs
  const benefitsHeadRef = useReveal();
  const benefitsGridRef = useStaggerReveal(4, 0.1);
  const productsHeadRef = useReveal();
  const productsGridRef = useStaggerReveal(products.length, 0.08);
  const whyTextRef = useReveal();
  const whyImgRef = useReveal();
  const whyListRef = useStaggerReveal(whyChoose.length, 0.12);
  const ctaRef = useReveal();

  return (
    <div id="home" className="min-h-screen bg-gray-50 overflow-x-hidden">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 pt-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <div>
            <p className="gs-hero-badge inline-flex items-center rounded-xl bg-green-200 px-2 py-1 text-xs font-bold text-green-600 mb-4">
              CHUYÊN GIA CÂY CẢNH
            </p>
            <h1 className="gs-hero-h1 text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Green Space - Mang Thiên Nhiên Vào Không Gian Sống
            </h1>
            <p className="gs-hero-p text-gray-600 mb-8 leading-relaxed">
              Cung cấp các loại cây cảnh chất lượng cao, được tuyển chọn kỹ
              lưỡng, mang lại vẻ đẹp bền vững và sự bình yên cho ngôi nhà của bạn.
            </p>
            <div className="gs-hero-btns flex gap-4">
              <button
                className="gs-btn-primary bg-green-500 hover:bg-green-600 text-white px-6 py-2.5 rounded-lg font-semibold"
                onClick={() => navigate("/product")}
              >
                Xem Cây Ngay!
              </button>
              <button className="gs-btn-outline border-2 border-gray-300 hover:border-green-400 hover:text-green-700 text-gray-700 px-6 py-2.5 rounded-lg font-semibold">
                Tư Vấn Miễn Phí
              </button>
            </div>
          </div>

          {/* Right — floating image */}
          <div className="gs-hero-img relative flex items-center justify-center">
            {/* decorative blob */}
            <div
              className="absolute w-72 h-72 rounded-full bg-green-100 opacity-60 -z-10"
              style={{ filter: "blur(40px)", top: "10%", left: "10%" }}
            />
            <img
              src="https://images.unsplash.com/photo-1509587584298-0f3b3a3a1797?w=600&h=400&fit=crop"
              alt="Bonsai tree"
              className="gs-float rounded-2xl shadow-2xl w-full"
            />
            {/* floating badge */}
            <div
              className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg px-4 py-2 flex items-center gap-2 gs-float2"
              style={{ zIndex: 10 }}
            >
              <span className="text-2xl">🪴</span>
              <div>
                <p className="text-xs text-gray-400 font-medium">Đã giao hôm nay</p>
                <p className="text-sm font-bold text-gray-800">+240 cây xanh</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Benefits ─────────────────────────────────────────────────────── */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div ref={benefitsHeadRef} className="gs-reveal from-up text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Giá Trị Cốt Lõi</h2>
            <p className="text-gray-600">
              Tại sao Green Space là lựa chọn hàng đầu cho không gian xanh của bạn
            </p>
          </div>

          <div ref={benefitsGridRef} className="grid md:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="gs-reveal from-up gs-benefit bg-gray-50 p-6 rounded-xl cursor-default"
              >
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-green-600 mb-4 gs-benefit-icon-wrap">
                  {benefit.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-gray-600 text-sm">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Products ─────────────────────────────────────────────────────── */}
      <section id="products" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={productsHeadRef} className="gs-reveal from-up flex justify-between items-center mb-12">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Sản phẩm nổi bật</h2>
            <p className="text-gray-600">Những sản phẩm sinh động được ưa chuộng nhất</p>
          </div>
          <button
            className="gs-see-all text-green-600 font-semibold cursor-pointer"
            onClick={() => navigate("/product")}
          >
            Xem tất cả →
          </button>
        </div>

        {/* Skeletons while loading */}
        {loadingProducts && (
          <div className="grid md:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {!loadingProducts && productsError && (
          <div className="col-span-full text-center text-red-600 py-8">{productsError}</div>
        )}

        {!loadingProducts && !productsError && (
          <div ref={productsGridRef} className="grid md:grid-cols-4 gap-6">
            {products.map((product) => (
              <button
                key={product.productId}
                type="button"
                onClick={() => navigate(`/product/${product.productId}`)}
                className="gs-reveal from-up gs-card text-left bg-white rounded-xl overflow-hidden shadow-md"
                aria-label={`Xem chi tiết ${product.name}`}
              >
                <div className="relative overflow-hidden">
                  <img
                    src={
                      product.thumbnailUrl ||
                      "https://images.unsplash.com/photo-1463320726281-696a485928c7?w=400&h=300&fit=crop"
                    }
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                  {product.isNew && (
                    <div className="gs-new-badge absolute top-2 left-2 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded">
                      MỚI
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-green-600 font-bold">{formatPrice(product.basePrice)}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* ── Why Choose ───────────────────────────────────────────────────── */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Text */}
          <div ref={whyTextRef} className="gs-reveal from-left">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Tại sao chọn Green Space?
            </h2>
            <p className="text-gray-600 mb-8">
              Chúng tôi không chỉ bán cây, chúng tôi cung cấp giải pháp sống
              xanh bền vững và hỗ trợ tâm trọn đời.
            </p>
            <div ref={whyListRef} className="space-y-6">
              {whyChoose.map((item, index) => (
                <div key={index} className="gs-reveal from-left gs-why-row flex gap-4">
                  <div className="gs-check-circle w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CircleCheck className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                    <p className="text-gray-600 text-sm">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Image */}
          <div ref={whyImgRef} className="gs-reveal from-right relative flex items-center justify-center">
            <div
              className="absolute w-64 h-64 rounded-full bg-green-50 -z-10"
              style={{ filter: "blur(32px)", bottom: "0", right: "0" }}
            />
            <img
              src="https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600&h=400&fit=crop"
              alt="Pink flowers"
              className="gs-float2 rounded-2xl shadow-2xl w-full"
            />
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <div ref={ctaRef} className="gs-reveal from-scale px-4 sm:px-6 lg:px-8 my-16">
        <section className="gs-cta-bg py-20 rounded-3xl relative overflow-hidden">
          {/* decorative circles */}
          <div className="absolute top-0 left-0 w-48 h-48 rounded-full bg-white opacity-5 -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full bg-white opacity-5 translate-x-1/2 translate-y-1/2" />

          <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
            <h2 className="text-5xl font-bold text-white mb-6 leading-tight">
              Bắt đầu không gian xanh của bạn ngay hôm nay
            </h2>
            <p className="text-green-50 mb-8 text-lg">
              Đăng ký nhận bản tin chăm sóc cây và nhận ưu đãi cho đơn hàng đầu tiên
            </p>
            <div className="flex gap-3 max-w-2xl mx-auto flex-col sm:flex-row">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Nhập email của bạn"
                className="flex-1 px-6 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-white bg-white text-gray-900 transition-shadow"
                style={{ transition: "box-shadow .2s" }}
                onFocus={e => (e.currentTarget.style.boxShadow = "0 0 0 4px rgba(255,255,255,.3)")}
                onBlur={e => (e.currentTarget.style.boxShadow = "none")}
              />
              <button
                className="gs-cta-btn bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50"
                onClick={() => navigate("/register", { state: { prefillEmail: email } })}
              >
                Đăng ký ngay
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}