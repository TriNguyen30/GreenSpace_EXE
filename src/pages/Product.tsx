import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getProducts } from '@/services/product.service';
import type { Product as ApiProduct } from '@/types/api';
import { useSearch } from "@/context/SearchContext";
import SearchBox from "@/components/ui/Search";

type ProductItem = ApiProduct & { isNew?: boolean };

export default function Product() {
  const [sortBy, setSortBy] = useState<'newest' | 'price-low' | 'price-high'>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const productsPerPage = 20;
  const { keyword } = useSearch();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const apiProducts = await getProducts();
        const safeProducts = Array.isArray(apiProducts) ? apiProducts : [];
        const mappedProducts: ProductItem[] = safeProducts.map(
          (p: ApiProduct, index: number) => ({
            ...p,
            isNew: index < 5,
          }),
        );
        setProducts(mappedProducts);
        setError(null);
      } catch (err) {
        console.error(err);
        setError('Không tải được danh sách sản phẩm. Vui lòng thử lại sau.');
      } finally {
        setIsLoading(false);
      }
    };

    void fetchProducts();
  }, []);

  // Các loại cây (category) lấy từ API
  const categories = useMemo(
    () =>
      Array.from(
        new Set(
          products
            .map((p) => p.categoryName)
            .filter((name): name is string => Boolean(name)),
        ),
      ),
    [products],
  );

  // Lọc theo loại cây (categoryName)
  const categoryFilteredProducts = useMemo(() => {
    if (selectedCategories.length === 0) return products;
    return products.filter((product) =>
      selectedCategories.includes(product.categoryName),
    );
  }, [products, selectedCategories]);

  /* ================= SEARCH FILTER ================= */
  const searchedProducts = useMemo(() => {
    const base = categoryFilteredProducts;

    if (!keyword.trim()) return base;

    const q = keyword.toLowerCase();
    return base.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q),
    );
  }, [categoryFilteredProducts, keyword]);

  // Sắp xếp theo giá / mặc định
  const sortedProducts = useMemo(() => {
    const cloned = [...searchedProducts];

    if (sortBy === 'price-low') {
      return cloned.sort((a, b) => a.basePrice - b.basePrice);
    }

    if (sortBy === 'price-high') {
      return cloned.sort((a, b) => b.basePrice - a.basePrice);
    }

    // 'newest' hoặc giá trị khác: giữ nguyên thứ tự API
    return cloned;
  }, [searchedProducts, sortBy]);

  useEffect(() => {
    setCurrentPage(1);
  }, [keyword]);

  // Pagination
  const totalPages = Math.ceil(sortedProducts.length / productsPerPage) || 1;
  const startIndex = (currentPage - 1) * productsPerPage;
  const paginatedProducts = sortedProducts.slice(
    startIndex,
    startIndex + productsPerPage,
  );

  return (
    <div className="min-h-screen bg-gray-50 py-19">
      {/* Hero Banner Section */}
      <section className="bg-green-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-green-800 mb-3">
            Khám Phá Bộ Sưu Tập Cây Cảnh
          </h1>
          <p className="text-gray-700 text-lg">
            Mang thiên nhiên vào không gian sống của bạn với những tác phẩm nghệ thuật xanh.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar - Filters */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-6">
                <SlidersHorizontal className="w-5 h-5 text-green-700" />
                <h2 className="text-xl font-bold text-gray-900">Bộ lọc</h2>
              </div>

              {/* Plant Type Filter (categoryName) */}
              <div className="mb-8">
                <h3 className="font-semibold text-gray-900 mb-4">LOẠI CÂY</h3>
                <div className="space-y-3">
                  {categories.map((category) => {
                    const checked = selectedCategories.includes(category);
                    return (
                      <label
                        key={category}
                        className="flex items-center cursor-pointer select-none"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {
                            setCurrentPage(1);
                            setSelectedCategories((prev) => {
                              if (prev.includes(category)) {
                                return prev.filter((c) => c !== category);
                              }
                              return [...prev, category];
                            });
                          }}
                          className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-600"
                        />
                        <span className="ml-3 text-gray-700">{category}</span>
                      </label>
                    );
                  })}

                  {categories.length === 0 && (
                    <p className="text-sm text-gray-500">Chưa có dữ liệu loại cây.</p>
                  )}
                </div>
              </div>

              {/* Price Sort */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">MỨC GIÁ</h3>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setCurrentPage(1);
                    setSortBy(e.target.value as 'newest' | 'price-low' | 'price-high');
                  }}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-green-600"
                >
                  <option value="newest">Mặc định</option>
                  <option value="price-low">Giá: Thấp đến Cao</option>
                  <option value="price-high">Giá: Cao đến Thấp</option>
                </select>
              </div>
            </div>
          </aside>

          {/* Products Section */}
          <div className="flex-1">
            {/* Info Bar */}
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-700">
                Hiển thị {paginatedProducts.length} / {sortedProducts.length} sản phẩm
              </p>
            </div>

            <div className="mb-6">
              <SearchBox />
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {isLoading && (
                <p className="col-span-full text-center text-gray-600">Đang tải sản phẩm...</p>
              )}

              {!isLoading && error && (
                <p className="col-span-full text-center text-red-600">{error}</p>
              )}

              {!isLoading && !error && paginatedProducts.length === 0 && (
                <p className="col-span-full text-center text-gray-600">
                  Không có sản phẩm phù hợp.
                </p>
              )}

              {!isLoading &&
                !error &&
                paginatedProducts.map((product: ProductItem) => (
                  <Link
                    key={product.productId}
                    to={`/product/${product.productId}`}
                    className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow block"
                    aria-label={`Xem chi tiết ${product.name}`}
                  >
                    <div className="relative">
                      <img
                        src={product.thumbnailUrl}
                        alt={product.name}
                        className="w-full h-64 object-cover"
                      />
                      {product.isNew && (
                        <div className="absolute top-2 left-2 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded">
                          MỚI VỀ
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                      <p className="text-lg font-bold text-green-600">
                        {product.basePrice.toLocaleString('vi-VN')} ₫
                      </p>
                    </div>
                  </Link>
                ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                if (i === 4 && currentPage < totalPages - 2) {
                  return (
                    <React.Fragment key="ellipsis">
                      <span className="px-3">...</span>
                      <button
                        onClick={() => setCurrentPage(totalPages)}
                        className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100"
                      >
                        {totalPages}
                      </button>
                    </React.Fragment>
                  );
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-4 py-2 rounded-lg border ${currentPage === pageNum
                      ? 'bg-green-800 text-white border-green-800'
                      : 'border-gray-300 hover:bg-gray-100'
                      }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
