import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getProducts } from '@/services/product.service';
import type { Product as ApiProduct } from '@/types/api';
import { useSearch } from "@/context/SearchContext";
import SearchBox from "@/components/ui/Search";

type ProductItem = ApiProduct & { isNew?: boolean };

export default function Product() {
  const [currentPage, setCurrentPage] = useState(1);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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


  /* ================= SEARCH FILTER ================= */
  const filteredProducts = useMemo(() => {
    if (!keyword.trim()) return products;

    const q = keyword.toLowerCase();
    return products.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q),
    );
  }, [products, keyword]);

  useEffect(() => {
    setCurrentPage(1);
  }, [keyword]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage) || 1;
  const startIndex = (currentPage - 1) * productsPerPage;
  const paginatedProducts = filteredProducts.slice(
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
        <div className="flex flex-col gap-8">
          {/* Products Section */}
          <div className="flex-1">
            {/* Info Bar */}
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-700">
                Hiển thị {paginatedProducts.length} / {filteredProducts.length}{" "} sản phẩm
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
