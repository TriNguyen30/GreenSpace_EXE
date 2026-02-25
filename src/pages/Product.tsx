import React, { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, SlidersHorizontal, Package, X } from "lucide-react";
import { Link } from "react-router-dom";
import { getProducts } from "@/services/product.service";
import { getProductAverageRating, getProductRatings } from "@/services/rating.service";
import type { Product as ApiProduct } from "@/types/api";
import { useSearch } from "@/context/SearchContext";
import SearchBox from "@/components/ui/Search";

type ProductItem = ApiProduct & {
  isNew?: boolean;
  averageRating?: number | null;
  ratingCount?: number;
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const CSS = `
  @keyframes pl-fade-up {
    from { opacity:0; transform:translateY(16px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes pl-shimmer {
    from { background-position:-200% center; }
    to   { background-position: 200% center; }
  }
  @keyframes pl-card-in {
    from { opacity:0; transform:translateY(12px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes pl-badge-pop {
    from { opacity:0; transform:scale(.7) rotate(-6deg); }
    to   { opacity:1; transform:scale(1) rotate(0deg); }
  }

  .pl-e1 { animation: pl-fade-up .45s ease .04s both; }
  .pl-e2 { animation: pl-fade-up .45s ease .10s both; }
  .pl-e3 { animation: pl-fade-up .45s ease .16s both; }
  .pl-e4 { animation: pl-fade-up .45s ease .22s both; }

  /* Skeleton */
  .pl-sk {
    background: linear-gradient(90deg,#f3f4f6 25%,#ebebeb 50%,#f3f4f6 75%);
    background-size:200% auto;
    animation: pl-shimmer 1.4s linear infinite;
    border-radius:10px;
  }

  /* Card */
  .pl-card {
    animation: pl-card-in .38s ease both;
    transition: transform .28s cubic-bezier(.34,1.56,.64,1), box-shadow .28s ease;
  }
  .pl-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 14px 36px rgba(0,0,0,.1);
  }
  .pl-card-img { transition: transform .5s ease; }
  .pl-card:hover .pl-card-img { transform: scale(1.07); }
  .pl-card-cta {
    transition: transform .2s ease, opacity .2s;
    opacity: 0;
  }
  .pl-card:hover .pl-card-cta {
    transform: translateX(4px);
    opacity: 1;
  }

  /* Badge */
  .pl-badge { animation: pl-badge-pop .4s cubic-bezier(.34,1.56,.64,1) .25s both; }

  /* Sidebar checkbox row */
  .pl-check-row {
    transition: background .15s, padding-left .15s;
    border-radius:10px;
  }
  .pl-check-row:hover { background:#f0fdf4; padding-left:6px; }

  /* Active chip */
  .pl-chip {
    transition: background .15s, transform .15s;
    animation: pl-fade-up .25s ease both;
  }
  .pl-chip:hover { background:#dcfce7; transform:scale(1.05); }

  /* Sort select */
  .pl-select { transition: border-color .18s, box-shadow .18s; }
  .pl-select:focus {
    border-color:#16a34a;
    box-shadow: 0 0 0 3px rgba(22,163,74,.12);
    outline:none;
  }

  /* Pagination */
  .pl-pg-num {
    transition: background .15s, border-color .15s, color .15s, transform .15s;
  }
  .pl-pg-num:hover:not(.pl-active) {
    background:#f0fdf4; border-color:#16a34a; color:#16a34a; transform:scale(1.06);
  }
  .pl-pg-num:active { transform:scale(.93); }
  .pl-pg-num.pl-active { background:#16a34a; border-color:#16a34a; color:#fff; }

  .pl-pg-arr {
    transition: background .15s, border-color .15s, transform .15s;
  }
  .pl-pg-arr:hover:not(:disabled) {
    background:#f0fdf4; border-color:#16a34a; transform:scale(1.08);
  }
  .pl-pg-arr:active:not(:disabled) { transform:scale(.9); }

  /* Empty */
  .pl-empty { animation: pl-fade-up .4s ease both; }
`;

function injectStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById("pl-styles")) return;
  const el = document.createElement("style");
  el.id = "pl-styles";
  el.textContent = CSS;
  document.head.appendChild(el);
}

// ─── Skeleton card ────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
      <div className="pl-sk w-full aspect-[4/3]" />
      <div className="p-4 space-y-2.5">
        <div className="pl-sk h-4 w-3/4" />
        <div className="pl-sk h-3.5 w-full" />
        <div className="pl-sk h-3.5 w-2/3" />
        <div className="pl-sk h-5 w-1/3 mt-2" />
      </div>
    </div>
  );
}

// ─── Pagination helper ────────────────────────────────────────────────────────
function buildPages(total: number, current: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const p: (number | "...")[] = [1];
  if (current > 3) p.push("...");
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) p.push(i);
  if (current < total - 2) p.push("...");
  p.push(total);
  return p;
}

// ─── Main component ───────────────────────────────────────────────────────────
const PER_PAGE = 15;

export default function Product() {
  injectStyles();

  const { keyword } = useSearch();
  const [sortBy, setSortBy] = useState<"newest" | "price-low" | "price-high">("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [gridKey, setGridKey] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const api = await getProducts();
        const safe = Array.isArray(api) ? api : [];

        // Lấy rating trung bình + số lượt đánh giá cho từng sản phẩm
        const [avgRatings, ratingLists] = await Promise.all([
          Promise.all(
            safe.map((p: ApiProduct) =>
              getProductAverageRating(p.productId).catch(() => null),
            ),
          ),
          Promise.all(
            safe.map((p: ApiProduct) =>
              getProductRatings(p.productId).catch(() => []),
            ),
          ),
        ]);

        setProducts(
          safe.map((p: ApiProduct, i: number) => ({
            ...p,
            isNew: i < 5,
            averageRating: avgRatings[i] ?? null,
            ratingCount: Array.isArray(ratingLists[i]) ? ratingLists[i].length : 0,
          })),
        );
      } catch (e) {
        console.error(e);
        setError("Không tải được danh sách sản phẩm. Vui lòng thử lại.");
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const categories = useMemo(
    () => Array.from(new Set(products.map((p) => p.categoryName).filter(Boolean) as string[])),
    [products],
  );

  const filtered = useMemo(() => {
    let base = selectedCategories.length
      ? products.filter((p) => selectedCategories.includes(p.categoryName))
      : products;
    if (keyword.trim()) {
      const q = keyword.toLowerCase();
      base = base.filter((p) => p.name?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q));
    }
    return base;
  }, [products, selectedCategories, keyword]);

  const sorted = useMemo(() => {
    const c = [...filtered];
    if (sortBy === "price-low") return c.sort((a, b) => a.basePrice - b.basePrice);
    if (sortBy === "price-high") return c.sort((a, b) => b.basePrice - a.basePrice);
    return c;
  }, [filtered, sortBy]);

  useEffect(() => { setCurrentPage(1); setGridKey((k) => k + 1); }, [keyword, selectedCategories, sortBy]);

  const totalPages = Math.ceil(sorted.length / PER_PAGE) || 1;
  const paginated = sorted.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  const toggleCat = (cat: string) =>
    setSelectedCategories((prev) => prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]);

  const hasFilters = selectedCategories.length > 0 || sortBy !== "newest";

  return (
    <div className="min-h-screen bg-gray-50 pt-16">

      {/* ── Hero ── */}
      <div className="bg-green-50 border-b border-gray-100 py-10 pl-e1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-bold text-green-600 tracking-widest uppercase mb-2">
            Cửa hàng cây cảnh
          </p>
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            Khám Phá Bộ Sưu Tập Cây Cảnh
          </h1>
          <p className="text-gray-500 text-sm max-w-lg">
            Mang thiên nhiên vào không gian sống với những tác phẩm nghệ thuật xanh được chăm chút kỹ lưỡng.
          </p>
        </div>
      </div>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-7">

          {/* ── Sidebar ── */}
          <aside className="pl-e2 lg:w-56 shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-green-600" />
                  <span className="font-bold text-sm text-gray-900">Bộ lọc</span>
                </div>
                {hasFilters && (
                  <button
                    onClick={() => { setSelectedCategories([]); setSortBy("newest"); }}
                    className="text-xs font-medium text-green-600 hover:text-green-800 flex items-center gap-1 transition-colors"
                  >
                    <X className="w-3 h-3" /> Xóa lọc
                  </button>
                )}
              </div>

              {/* Categories */}
              <div className="px-4 py-4 border-b border-gray-100">
                <p className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-3">Loại cây</p>
                {categories.length === 0
                  ? <p className="text-xs text-gray-400">Chưa có dữ liệu.</p>
                  : <div className="space-y-0.5">
                    {categories.map((cat) => {
                      const on = selectedCategories.includes(cat);
                      return (
                        <label key={cat} className="pl-check-row flex items-center gap-2.5 py-1.5 px-2 cursor-pointer">
                          <input
                            type="checkbox" checked={on} onChange={() => toggleCat(cat)}
                            className="w-4 h-4 rounded border-gray-300 accent-green-600 shrink-0"
                          />
                          <span className={`text-sm transition-colors ${on ? "text-green-700 font-semibold" : "text-gray-600"}`}>
                            {cat}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                }
              </div>

              {/* Sort */}
              <div className="px-4 py-4">
                <p className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-3">Mức giá</p>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="pl-select w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm text-gray-700 bg-white"
                >
                  <option value="newest">Mặc định</option>
                  <option value="price-low">Thấp → Cao</option>
                  <option value="price-high">Cao → Thấp</option>
                </select>
              </div>
            </div>

            {/* Active chips */}
            {selectedCategories.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {selectedCategories.map((cat) => (
                  <button key={cat} onClick={() => toggleCat(cat)}
                    className="pl-chip inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 bg-green-50 border-2 border-green-200 text-green-700 rounded-full">
                    {cat} <X className="w-3 h-3" />
                  </button>
                ))}
              </div>
            )}
          </aside>

          {/* ── Products ── */}
          <div className="flex-1 min-w-0">

            {/* Toolbar */}
            <div className="pl-e3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <p className="text-sm text-gray-500 shrink-0">
                <span className="font-semibold text-gray-800">{paginated.length}</span>
                {" "}/ <span className="font-semibold text-gray-800">{sorted.length}</span> sản phẩm
              </p>
              <div className="w-full sm:w-72">
                <SearchBox />
              </div>
            </div>

            {/* Grid */}
            <div key={gridKey} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 mb-8">
              {isLoading && Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}

              {!isLoading && error && (
                <div className="col-span-full text-center py-12 text-red-500 text-sm">{error}</div>
              )}

              {!isLoading && !error && paginated.length === 0 && (
                <div className="pl-empty col-span-full flex flex-col items-center py-16 gap-3">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                    <Package className="w-8 h-8 text-gray-300" />
                  </div>
                  <p className="font-semibold text-gray-600">Không tìm thấy sản phẩm</p>
                  <p className="text-sm text-gray-400">Thử thay đổi bộ lọc hoặc từ khoá tìm kiếm</p>
                </div>
              )}

              {!isLoading && !error && paginated.map((p, i) => (
                <Link
                  key={p.productId}
                  to={`/product/${p.productId}`}
                  className="pl-card bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm block focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
                  aria-label={`Xem chi tiết ${p.name}`}
                  style={{ animationDelay: `${i * 0.045}s` }}
                >
                  {/* Image */}
                  <div className="relative overflow-hidden aspect-[4/3] bg-gray-50">
                    <img
                      src={p.thumbnailUrl || "https://images.unsplash.com/photo-1463320726281-696a485928c7?w=400&h=300&fit=crop"}
                      alt={p.name}
                      className="pl-card-img w-full h-full object-cover"
                    />
                    {p.isNew && (
                      <span className="pl-badge absolute top-3 left-3 bg-green-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                        MỚI VỀ
                      </span>
                    )}
                    {p.categoryName && (
                      <span className="absolute bottom-3 right-3 bg-white/90 border border-gray-200 text-gray-600 text-xs font-medium px-2 py-0.5 rounded-full">
                        {p.categoryName}
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-1 line-clamp-2">
                      {p.name}
                    </h3>
                    {p.averageRating != null && (
                      <p className="text-xs font-semibold text-yellow-600 mb-1 flex items-center gap-1">
                        <span>{p.averageRating.toFixed(1)} / 5 ⭐</span>
                        {typeof p.ratingCount === "number" && (
                          <span className="text-[11px] font-normal text-gray-400">
                            ({p.ratingCount} đánh giá)
                          </span>
                        )}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 line-clamp-2 mb-3 leading-relaxed">
                      {p.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-base font-bold text-green-700">
                        {p.basePrice.toLocaleString("vi-VN")} ₫
                      </span>
                      <span className="pl-card-cta text-xs text-green-600 font-semibold flex items-center gap-0.5">
                        Chi tiết <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pl-e4 flex justify-center items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="pl-pg-arr p-2 rounded-xl border-2 border-gray-200 text-gray-500 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {buildPages(totalPages, currentPage).map((page, i) =>
                  page === "..." ? (
                    <span key={`el-${i}`} className="text-gray-400 text-sm px-1">…</span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page as number)}
                      className={`pl-pg-num w-9 h-9 rounded-xl border-2 text-sm font-semibold ${currentPage === page ? "pl-active" : "border-gray-200 text-gray-600"}`}
                    >
                      {page}
                    </button>
                  )
                )}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="pl-pg-arr p-2 rounded-xl border-2 border-gray-200 text-gray-500 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}