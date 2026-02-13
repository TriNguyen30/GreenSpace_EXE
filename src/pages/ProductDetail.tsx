import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ChevronLeft,
  Heart,
  ShoppingCart,
  Star,
  Check,
  Truck,
  Shield,
  RefreshCw,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { getProductById } from "@/services/product.service";
import type { Product as ApiProduct } from "@/types/api";
import { getActivePromotions } from "@/services/promotion.service";
import type { Promotion } from "@/types/promotion";

type Product = {
  id: number;
  name: string;
  description: string;
  price: string;
  image: string;
  isNew?: boolean;
  type: string;
  size: "small" | "medium" | "large";
  careDifficulty: string;
  care?: string[];
  specs?: Record<string, string>;
};

// Lightweight mock-data (keeps UI fast and consistent with `Product.tsx`)
const MOCK_PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Tùng La Hán Dáng Văn Nhân",
    description:
      "Cây nội thất, cây phong thủy — thân gọn, dễ bài trí ở không gian làm việc.",
    price: "425.000 ₫",
    image:
      "https://images.unsplash.com/photo-1463320726281-696a485928c7?w=1200&h=900&fit=crop",
    isNew: true,
    type: "drought",
    size: "medium",
    careDifficulty: "easy",
    care: ["Ánh sáng: bán nắng", "Tưới: mỗi 7–10 ngày", "Đất: thoát nước tốt"],
    specs: { "Chiều cao": "30–45 cm", "Màu lá": "xanh đậm", Mùa: "cả năm" },
  },
  {
    id: 2,
    name: "Cây Trầu Bà Vàng",
    description: "Lá vàng điểm xuyết — phù hợp cho kệ, bàn làm việc nhỏ.",
    price: "220.000 ₫",
    image:
      "https://images.unsplash.com/photo-1466781783364-36c955e42a7f?w=1200&h=900&fit=crop",
    isNew: true,
    type: "tabletop",
    size: "small",
    careDifficulty: "easy",
    care: ["Ánh sáng: gián tiếp", "Tưới: giữ ẩm vừa phải"],
    specs: { "Chiều cao": "20–30 cm", "Màu lá": "xanh/vàng" },
  },
  {
    id: 3,
    name: "Cây Monstera",
    description: "Phong cách hiện đại — lá lớn, đường vân ấn tượng.",
    price: "650.000 ₫",
    image:
      "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=1200&h=900&fit=crop",
    type: "indoor",
    size: "large",
    careDifficulty: "medium",
    care: ["Ánh sáng: gián tiếp sáng", "Tưới: mỗi 7–12 ngày"],
    specs: { "Chiều cao": "60–120 cm", "Màu lá": "xanh" },
  },
  {
    id: 4,
    name: "Cây Sen Đá",
    description: "Nhỏ xinh, dễ chăm — lý tưởng cho góc bàn làm việc.",
    price: "150.000 ₫",
    image:
      "https://images.unsplash.com/photo-1509937528035-ad76254b0356?w=1200&h=900&fit=crop",
    isNew: false,
    type: "tabletop",
    size: "small",
    careDifficulty: "easy",
    care: ["Ánh sáng: nhiều nắng", "Tưới: rất ít, để khô giữa các lần tưới"],
    specs: { "Chiều cao": "10–20 cm", "Màu lá": "xanh/đỏ" },
  },
];

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const productId = Number(id) || MOCK_PRODUCTS[0].id;

  const product = useMemo(
    () => MOCK_PRODUCTS.find((p) => p.id === productId) ?? MOCK_PRODUCTS[0],
    [productId],
  );

  const [apiProduct, setApiProduct] = useState<ApiProduct | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [mainImage, setMainImage] = useState(product.image);
  const [quantity, setQuantity] = useState(1);
  const [quantityInput, setQuantityInput] = useState("1");
  const [liked, setLiked] = useState(false);
  const [promotions, setPromotions] = useState<Promotion[]>([]);


  useEffect(() => {
    if (!id) {
      setError("Không tìm thấy sản phẩm");
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        const result = await getProductById(id);
        if (cancelled) return;

        if (!result) {
          setError("Không tìm thấy sản phẩm");
          return;
        }

        setApiProduct(result);
        setMainImage(result.thumbnailUrl || product.image);
      } catch {
        if (!cancelled) {
          setError("Không thể tải sản phẩm");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [id, product.image]);

  const displayedName = apiProduct?.name ?? product.name;
  const displayedDescription = apiProduct?.description ?? product.description;
  const displayedPrice = apiProduct
    ? `${apiProduct.basePrice.toLocaleString()} đ`
    : product.price;
  const basePriceNumber = apiProduct?.basePrice ??
    Number(product.price.replace(/[^\d]/g, ""));

  const validPromotions = promotions.filter(
    (p) =>
      p.isActive &&
      basePriceNumber >= p.minOrderValue &&
      new Date(p.endDate) > new Date()
  );

  const bestPromotion = validPromotions[0];

  let discountAmount = 0;

  if (bestPromotion) {
    if (bestPromotion.discountType === "Fixed") {
      discountAmount = bestPromotion.discountValue;
    } else {
      discountAmount = (basePriceNumber * bestPromotion.discountValue) / 100;

      if (
        bestPromotion.maxDiscount &&
        discountAmount > bestPromotion.maxDiscount
      ) {
        discountAmount = bestPromotion.maxDiscount;
      }
    }
  }

  const finalPrice = basePriceNumber - discountAmount;
  const displayedCategory = apiProduct?.categoryName ?? product.type;
  const displayedBrand = apiProduct?.brandName ?? "Đang cập nhật";
  const skuSource = apiProduct?.productId ?? product.id;

  const related = useMemo(
    () =>
      MOCK_PRODUCTS.filter(
        (p) => p.id !== product.id && p.type === product.type,
      ).slice(0, 4),
    [product],
  );

  function changeQuantity(delta: number) {
    setQuantity((q) => {
      const next = Math.max(1, q + delta);
      setQuantityInput(String(next));
      return next;
    });
  }

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


  function handleAddToCart() {
    const cartItem = apiProduct
      ? (() => {
        // Tạm thời chọn biến thể đầu tiên làm default
        const firstVariant = apiProduct.variants?.[0];

        // Một số sản phẩm có thể trả về variantId = Guid.Empty (all zeros)
        // → coi như KHÔNG có variant thực sự để tránh gửi sai lên backend.
        const rawVariantId = firstVariant?.variantId ?? null;
        const safeVariantId =
          rawVariantId === "00000000-0000-0000-0000-000000000000"
            ? null
            : rawVariantId;

        return {
          id: Array.from(apiProduct.productId)
            .slice(0, 8)
            .reduce((sum, ch) => sum + ch.charCodeAt(0), 0),
          name: apiProduct.name,
          // Nếu có variant thì dùng giá của variant, fallback về basePrice
          price: `${(firstVariant?.price ?? apiProduct.basePrice).toLocaleString()} đ`,
          image: apiProduct.thumbnailUrl,
          // Lưu lại id thực tế từ backend để gửi lên khi tạo order
          productId: apiProduct.productId,
          // Lưu lại variantId thực tế (nếu có, không phải Guid.Empty)
          variantId: safeVariantId,
        };
      })()
      : {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
      };

    addToCart(cartItem, quantity);

    // Show success message
    const productName = apiProduct?.name ?? product.name;
    const message = `Đã thêm ${quantity} ${productName} vào giỏ hàng!`;

    // Create toast notification (optional - you can use a toast library)
    const toast = document.createElement("div");
    toast.className =
      "fixed top-20 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-xl z-50 animate-slide-in";
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3000);
  }

  if (loading && !apiProduct) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-700">Đang tải sản phẩm...</p>
      </div>
    );
  }

  if ((error && !apiProduct) || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <p className="text-gray-700 mb-4">
          {error ?? "Không tìm thấy sản phẩm"}
        </p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
        >
          Quay lại
        </button>
      </div>
    );
  }

  return (
    <React.Fragment>
      <div className="min-h-screen bg-gradient-to-b from-green-50/30 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <div className="mb-8">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-green-700 transition-colors group"
              aria-label="Quay lại danh sách sản phẩm"
            >
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Quay lại danh sách
            </button>
          </div>

          <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 p-6 lg:p-10">
              {/* Gallery Section */}
              <div className="space-y-4">
                {/* Main Image */}
                <div className="relative rounded-2xl overflow-hidden bg-gray-50 group">
                  {product.isNew && (
                    <div className="absolute top-4 left-4 z-10 bg-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                      MỚI
                    </div>
                  )}
                  <img
                    src={mainImage}
                    alt={product.name}
                    className="w-full h-[500px] object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* Thumbnail Gallery */}
                <div className="grid grid-cols-4 gap-3">
                  {[
                    product.image,
                    ...MOCK_PRODUCTS.filter((p) => p.id !== product.id).map(
                      (p) => p.image,
                    ),
                  ]
                    .slice(0, 4)
                    .map((src, i) => (
                      <button
                        key={i}
                        onClick={() => setMainImage(src)}
                        className={`rounded-xl overflow-hidden transition-all duration-200 ${mainImage === src
                          ? "ring-3 ring-green-500 scale-95"
                          : "ring-1 ring-gray-200 hover:ring-green-300 hover:scale-95"
                          }`}
                        aria-label={`Xem ảnh ${i + 1}`}
                      >
                        <img
                          src={src}
                          alt={`thumbnail-${i}`}
                          className="w-full h-24 object-cover"
                        />
                      </button>
                    ))}
                </div>

                {/* Care Tips Card */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-100 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-bold text-green-900">
                      Mẹo chăm sóc nhanh
                    </h3>
                  </div>
                  <ul className="space-y-2">
                    {(product.care ?? []).map((c, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 text-sm text-green-800"
                      >
                        <span className="text-green-600 mt-0.5">•</span>
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Product Details Section */}
              <div className="flex flex-col">
                {/* Header */}
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div className="flex-1">
                    <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight mb-3">
                      {displayedName}
                    </h1>
                    <p className="text-base text-gray-600 leading-relaxed">
                      {displayedDescription}
                    </p>

                    {/* Rating */}
                    <div className="flex items-center gap-2 mt-4">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className="w-4 h-4 fill-yellow-400 text-yellow-400"
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">
                        (128 đánh giá)
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setLiked((s) => !s)}
                    className={`p-3 rounded-xl transition-all shadow-sm ${liked
                      ? "bg-pink-100 text-pink-600 scale-110"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    title={liked ? "Đã yêu thích" : "Thêm vào yêu thích"}
                  >
                    <Heart className={`w-6 h-6 ${liked ? "fill-current" : ""}`} />
                  </button>
                </div>

                {/* Price Section */}
                <div className="text-4xl font-black text-green-700 mb-2">
                  {finalPrice.toLocaleString()} đ
                </div>

                {discountAmount > 0 && (
                  <>
                    <div className="text-lg text-gray-400 line-through">
                      {basePriceNumber.toLocaleString()} đ
                    </div>

                    <div className="mt-2 text-sm text-red-600 font-semibold">
                      🎉 Áp dụng mã: {bestPromotion?.code} (-{discountAmount.toLocaleString()} đ)
                    </div>
                  </>
                )}


                {/* Quantity & Actions */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-8">
                  <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden bg-white">
                    <button
                      onClick={() => changeQuantity(-1)}
                      className="px-4 py-3 text-gray-600 hover:bg-gray-50 transition-colors font-medium"
                      aria-label="Giảm số lượng"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min={1}
                      value={quantityInput}
                      onChange={(e) => {
                        const raw = e.target.value;
                        if (!/^\d*$/.test(raw)) return;
                        setQuantityInput(raw);

                        if (raw === "") return;

                        const next = Number(raw);
                        if (Number.isNaN(next)) return;

                        const safe = Math.max(1, next);
                        setQuantity(safe);
                      }}
                      onBlur={() => {
                        setQuantityInput((current) => {
                          if (current && Number(current) >= 1) {
                            return current;
                          }
                          const fallback = String(Math.max(1, quantity));
                          return fallback;
                        });
                      }}
                      className="w-16 px-2 py-3 bg-gray-50 text-base font-bold text-center border-0 focus:outline-none focus:ring-0 appearance-none [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      aria-label="Số lượng"
                    />
                    <button
                      onClick={() => changeQuantity(1)}
                      className="px-4 py-3 text-gray-600 hover:bg-gray-50 transition-colors font-medium"
                      aria-label="Tăng số lượng"
                    >
                      +
                    </button>
                  </div>

                  <div className="flex gap-3 flex-1">
                    <button
                      onClick={handleAddToCart}
                      className="flex-1 inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all font-semibold"
                      aria-label="Thêm vào giỏ hàng"
                    >
                      <ShoppingCart className="w-5 h-5" /> Thêm vào giỏ
                    </button>

                    <button
                      onClick={() => {
                        handleAddToCart();
                        navigate("/checkout");
                      }}
                      className="px-6 py-3.5 border-2 border-green-600 text-green-600 rounded-xl hover:bg-green-50 transition-colors font-semibold"
                    >
                      Mua ngay
                    </button>
                  </div>
                </div>

                {/* Trust Badges */}
                <div className="grid grid-cols-3 gap-4 mb-8 pb-8 border-b border-gray-200">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Shield className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="text-xs font-medium text-gray-700">
                      Cam kết chất lượng
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Truck className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="text-xs font-medium text-gray-700">
                      Giao hàng nhanh
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <RefreshCw className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="text-xs font-medium text-gray-700">
                      Đổi trả dễ dàng
                    </div>
                  </div>
                </div>

                {/* Product Info Grid */}
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="bg-gray-50 rounded-xl p-5">
                    <h3 className="text-sm font-bold text-gray-900 mb-4">
                      Thông tin chi tiết
                    </h3>
                    <ul className="space-y-3 text-sm">
                      <li className="flex justify-between">
                        <span className="text-gray-600">Loại:</span>
                        <span className="font-semibold text-gray-900">
                          {displayedCategory}
                        </span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-gray-600">Thương hiệu:</span>
                        <span className="font-semibold text-gray-900">
                          {displayedBrand}
                        </span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-gray-600">Độ khó:</span>
                        <span className="font-semibold text-gray-900">
                          {product.careDifficulty}
                        </span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-gray-600">SKU:</span>
                        <span className="font-semibold text-gray-900">
                          GS-{String(skuSource).padStart(4, "0")}
                        </span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-5">
                    <h3 className="text-sm font-bold text-gray-900 mb-4">
                      Thông số
                    </h3>
                    <div className="space-y-3 text-sm">
                      {product.specs ? (
                        Object.entries(product.specs).map(([k, v]) => (
                          <div key={k} className="flex justify-between">
                            <span className="text-gray-600">{k}</span>
                            <span className="font-semibold text-gray-900">
                              {v}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="text-gray-500">Không có thông số</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Description & Care Guide */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3">
                      Mô tả sản phẩm
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      {displayedDescription}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-gray-900 mb-3">
                      Hướng dẫn chăm sóc
                    </h4>
                    <ol className="space-y-2.5">
                      <li className="flex gap-3 text-sm text-gray-700">
                        <span className="font-bold text-green-600 min-w-[24px]">
                          1.
                        </span>
                        <span>Đặt cây ở nơi có ánh sáng gián tiếp sáng.</span>
                      </li>
                      <li className="flex gap-3 text-sm text-gray-700">
                        <span className="font-bold text-green-600 min-w-[24px]">
                          2.
                        </span>
                        <span>
                          Kiểm tra độ ẩm đất trước khi tưới — tránh tưới quá
                          nhiều.
                        </span>
                      </li>
                      <li className="flex gap-3 text-sm text-gray-700">
                        <span className="font-bold text-green-600 min-w-[24px]">
                          3.
                        </span>
                        <span>
                          Bón phân loãng 1–2 lần / tháng vào mùa sinh trưởng.
                        </span>
                      </li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>

            {/* Related Products */}
            <div className="bg-gradient-to-b from-gray-50 to-white px-6 lg:px-10 py-10 border-t border-gray-100">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-gray-900">
                  Có thể bạn sẽ thích
                </h3>
                <button
                  onClick={() => navigate("/product")}
                  className="text-sm font-semibold text-green-700 hover:text-green-800 hover:underline transition-colors"
                >
                  Xem tất cả →
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
                {related.length > 0 ? (
                  related.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => navigate(`/product/${p.id}`)}
                      className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 hover:-translate-y-1"
                    >
                      <div className="relative overflow-hidden">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        {p.isNew && (
                          <div className="absolute top-2 right-2 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                            MỚI
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <div className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2">
                          {p.name}
                        </div>
                        <div className="text-lg text-green-700 font-bold">
                          {p.price}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center text-gray-500 py-8">
                    Không tìm thấy sản phẩm liên quan.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}
