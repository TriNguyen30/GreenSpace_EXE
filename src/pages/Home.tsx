import { useEffect, useMemo, useState } from "react";
import { Leaf, MapPin, Recycle, Truck, CircleCheck } from "lucide-react";
import { useNavigate } from "react-router";
import { getProducts } from "@/services/product.service";
import type { Product as ApiProduct } from "@/types/api";

export default function GreenSpaceLanding() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  type FeaturedProduct = ApiProduct & { isNew?: boolean };
  const [products, setProducts] = useState<FeaturedProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productsError, setProductsError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoadingProducts(true);
        setProductsError(null);
        const apiProducts = await getProducts();
        if (cancelled) return;

        const safeProducts = Array.isArray(apiProducts) ? apiProducts : [];
        const mapped: FeaturedProduct[] = safeProducts
          .slice(0, 8)
          .map((p: ApiProduct, idx: number) => ({
            ...p,
            isNew: idx < 4,
          }));
        setProducts(mapped);
      } catch (e) {
        if (!cancelled) {
          console.error(e);
          setProductsError(
            "Không tải được sản phẩm nổi bật. Vui lòng thử lại sau.",
          );
        }
      } finally {
        if (!cancelled) setLoadingProducts(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const formatPrice = useMemo(
    () => (price: number) => `${price.toLocaleString("vi-VN")} ₫`,
    [],
  );

  const benefits = [
    {
      icon: <Leaf className="w-6 h-6" />,
      title: "Cây khỏe mạnh",
      description:
        "Mỗi cây được chăm sóc tốt các chuyên gia thực vật hàng đầu.",
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: "Phủ hợp mọi nơi",
      description:
        "Thiết kế đa dạng tối ưu cho cả không gian nhỏ & và văn phòng.",
    },
    {
      icon: <Recycle className="w-6 h-6" />,
      title: "Thân thiện môi trường",
      description: "Quy trình đóng gói và vận chuyển giảm thiểu rác thải nhựa.",
    },
    {
      icon: <Truck className="w-6 h-6" />,
      title: "Cây khỏe mạnh",
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

  return (
    <div id="home" className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 pt-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="inline-flex items-center rounded-xl bg-green-200 px-2 py-1 text-xs font-bold text-green-400 inset-ring inset-ring-gray-400/20 mb-4">
              CHUYÊN GIA CÂY CẢNH
            </p>
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Green Space - Mang Thiên Nhiên Vào Không Gian Sống
            </h1>
            <p className="text-gray-600 mb-8">
              Cung cấp các loại cây cảnh chất lượng cao, được tuyển chọn kỹ
              lưỡng, mang lại vẻ đẹp bền vững và sự bình yên cho ngôi nhà của
              bạn.
            </p>
            <div className="flex gap-4">
              <button className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-lg font-semibold">
                Xem Cây Ngay!
              </button>
              <button className="border-2 border-gray-300 hover:border-gray-400 text-gray-700 px-5 py-2 rounded-lg font-semibold">
                Tư Vấn Miễn Phí
              </button>
            </div>
          </div>
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1509587584298-0f3b3a3a1797?w=600&h=400&fit=crop"
              alt="Bonsai tree"
              className="rounded-2xl shadow-2xl w-full"
            />
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-4">
            Giá Trị Cốt Lõi
          </h2>
          <p className="text-gray-600 text-center mb-12">
            Tại sao Green Space là lựa chọn hàng đầu cho không gian xanh của bạn
          </p>
          <div className="grid md:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="bg-gray-50 p-6 rounded-xl hover:shadow-lg transition"
              >
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-green-600 mb-4">
                  {benefit.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 text-sm">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Sản phẩm nổi bật
            </h2>
            <p className="text-gray-600">
              Những bộ phận mới nhất sống dộng được ưa chuộng nhất
            </p>
          </div>
          <button className="text-green-600 hover:text-green-700 font-semibold cursor-pointer" onClick={() => navigate('/product')}>
            Xem tất cả →
          </button>
        </div>
        <div className="grid md:grid-cols-4 gap-6">
          {loadingProducts && (
            <div className="col-span-full text-center text-gray-600">
              Đang tải sản phẩm...
            </div>
          )}

          {!loadingProducts && productsError && (
            <div className="col-span-full text-center text-red-600">
              {productsError}
            </div>
          )}

          {!loadingProducts &&
            !productsError &&
            products.map((product) => (
              <button
                key={product.productId}
                type="button"
                onClick={() => navigate(`/product/${product.productId}`)}
                className="text-left bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition"
                aria-label={`Xem chi tiết ${product.name}`}
              >
                <div className="relative">
                  <img
                    src={
                      product.thumbnailUrl ||
                      "https://images.unsplash.com/photo-1463320726281-696a485928c7?w=400&h=300&fit=crop"
                    }
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                  {product.isNew && (
                    <div className="absolute top-2 left-2 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded">
                      MỚI
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-green-600 font-bold">
                    {formatPrice(product.basePrice)}
                  </p>
                </div>
              </button>
            ))}
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Tại sao chọn Green Space?
            </h2>
            <p className="text-gray-600 mb-8">
              Chúng tôi không chỉ bán cây, chúng tôi cung cấp giải pháp sống
              xanh và vững và hỗ trợ tâm trọn đời.
            </p>
            <div className="space-y-6">
              {whyChoose.map((item, index) => (
                <div key={index} className="flex gap-4">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CircleCheck className="w-4 h-4 text-green-600"></CircleCheck>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 text-sm">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600&h=400&fit=crop"
              alt="Pink flowers"
              className="rounded-2xl shadow-2xl w-full"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-green-500 to-green-600 py-20 mx-4 sm:mx-6 lg:mx-8 rounded-3xl my-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-5xl font-bold text-white mb-6">
            Bắt đầu không gian xanh của bạn ngay hôm nay
          </h2>
          <p className="text-green-50 mb-8">
            Đăng ký nhận bản tin chăm sóc cây và nhận ưu đãi cho đơn hàng đầu
            tiên
          </p>
          <div className="flex gap-4 max-w-2xl mx-auto flex-col sm:flex-row">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Nhập email của bạn"
              className="flex-1 px-6 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-white bg-white text-gray-900"
            />
            <button className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100">
              Đăng ký ngay
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
