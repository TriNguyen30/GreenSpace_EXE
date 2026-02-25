import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Calendar,
  Clock,
  ArrowRight,
  TrendingUp,
  Leaf,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type Article = {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  category: string;
  date: string;
  readTime: string;
  featured?: boolean;
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const CSS = `
  @keyframes news-fade-up {
    from { opacity:0; transform:translateY(16px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes news-card-in {
    from { opacity:0; transform:translateY(12px); }
    to   { opacity:1; transform:translateY(0); }
  }

  .news-e1 { animation: news-fade-up .45s ease .04s both; }
  .news-e2 { animation: news-fade-up .45s ease .12s both; }
  .news-e3 { animation: news-fade-up .45s ease .20s both; }

  /* Article card */
  .news-card {
    animation: news-card-in .4s ease both;
    transition: transform .3s cubic-bezier(.34,1.56,.64,1), box-shadow .3s ease;
  }
  .news-card:hover {
    transform: translateY(-6px);
    box-shadow: 0 16px 36px rgba(0,0,0,.1);
  }
  .news-card-img { transition: transform .5s ease; }
  .news-card:hover .news-card-img { transform: scale(1.08); }

  /* Featured card */
  .news-featured {
    transition: transform .3s cubic-bezier(.34,1.56,.64,1), box-shadow .3s ease;
  }
  .news-featured:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 40px rgba(0,0,0,.12);
  }
  .news-featured-img { transition: transform .6s ease; }
  .news-featured:hover .news-featured-img { transform: scale(1.05); }

  /* Category chip */
  .news-cat {
    transition: background .2s, color .2s, transform .2s;
  }
  .news-cat:hover {
    background: #16a34a;
    color: #fff;
    transform: translateY(-1px);
  }
  .news-cat.active {
    background: #16a34a;
    color: #fff;
  }

  /* Search input */
  .news-search {
    transition: border-color .2s, box-shadow .2s;
  }
  .news-search:focus {
    border-color: #16a34a;
    box-shadow: 0 0 0 3px rgba(22,163,74,.12);
    outline: none;
  }

  /* Read more link */
  .news-read-more {
    transition: gap .2s, color .2s;
  }
  .news-read-more:hover { gap: 8px; color: #15803d; }

  /* Pagination */
  .news-page-btn {
    transition: background .2s, border-color .2s, color .2s, transform .2s;
  }
  .news-page-btn:hover:not(:disabled) {
    background: #f0fdf4;
    border-color: #16a34a;
    transform: translateY(-1px);
  }
  .news-page-btn.active {
    background: #16a34a;
    color: #fff;
    border-color: #16a34a;
  }
  .news-page-btn:disabled {
    opacity: .3;
    cursor: not-allowed;
  }
`;

function injectStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById("news-styles")) return;
  const el = document.createElement("style");
  el.id = "news-styles";
  el.textContent = CSS;
  document.head.appendChild(el);
}

// ─── Mock data ────────────────────────────────────────────────────────────────
const CATEGORIES = [
  "Tất cả",
  "Chăm sóc cây",
  "Thiết kế vườn",
  "Mẹo hữu ích",
  "Tin tức",
];

const MOCK_ARTICLES: Article[] = [
  {
    id: "1",
    title: "7 loại cây trồng trong nhà giúp thanh lọc không khí hiệu quả",
    excerpt:
      "Khám phá những loại cây cảnh phổ biến có khả năng lọc không khí tuyệt vời, phù hợp cho không gian sống hiện đại.",
    image:
      "https://images.unsplash.com/photo-1463320726281-696a485928c7?w=800&q=80",
    category: "Chăm sóc cây",
    date: "2024-02-20",
    readTime: "5 phút đọc",
    featured: true,
  },
  {
    id: "2",
    title: "Cách tưới nước đúng cách cho cây cảnh trong mùa hè",
    excerpt:
      "Hướng dẫn chi tiết về tần suất và phương pháp tưới nước để cây luôn xanh tốt trong những tháng nóng bức.",
    image:
      "https://images.unsplash.com/photo-1466781783364-36c955e42a7f?w=800&q=80",
    category: "Mẹo hữu ích",
    date: "2024-02-18",
    readTime: "4 phút đọc",
  },
  {
    id: "3",
    title: "Thiết kế vườn nhỏ: Biến ban công thành ốc đảo xanh",
    excerpt:
      "Những ý tưởng sáng tạo để tận dụng không gian ban công nhỏ, tạo nên góc vườn xanh mát trong căn hộ chung cư.",
    image:
      "https://images.unsplash.com/photo-1558904541-efa843a96f01?w=800&q=80",
    category: "Thiết kế vườn",
    date: "2024-02-15",
    readTime: "6 phút đọc",
  },
  {
    id: "4",
    title: "Top 5 loại phân bón hữu cơ tốt nhất cho cây trồng trong chậu",
    excerpt:
      "So sánh và đánh giá các loại phân bón tự nhiên giúp cây phát triển khỏe mạnh mà không gây hại môi trường.",
    image:
      "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80",
    category: "Chăm sóc cây",
    date: "2024-02-12",
    readTime: "7 phút đọc",
  },
  {
    id: "5",
    title: "Xu hướng cây cảnh 2024: Những giống cây đang được ưa chuộng",
    excerpt:
      "Cập nhật những xu hướng mới nhất trong thế giới cây cảnh, từ các giống cây quý hiếm đến phong cách trang trí.",
    image:
      "https://images.unsplash.com/photo-1459156212016-c812468e2115?w=800&q=80",
    category: "Tin tức",
    date: "2024-02-10",
    readTime: "5 phút đọc",
  },
  {
    id: "6",
    title: "Cách nhận biết và xử lý sâu bệnh trên cây cảnh",
    excerpt:
      "Hướng dẫn chi tiết về các loại sâu bệnh phổ biến và phương pháp phòng trừ hiệu quả, an toàn cho cây.",
    image:
      "https://images.unsplash.com/photo-1588392382834-a891154bca4d?w=800&q=80",
    category: "Mẹo hữu ích",
    date: "2024-02-08",
    readTime: "8 phút đọc",
  },
  {
    id: "7",
    title: "Bí quyết chăm sóc sen đá và xương rồng cho người mới bắt đầu",
    excerpt:
      "Những điều cần biết khi trồng và chăm sóc các loại cây mọng nước, phù hợp cho người bận rộn.",
    image:
      "https://images.unsplash.com/photo-1509587584298-0f3b3a3a1797?w=800&q=80",
    category: "Chăm sóc cây",
    date: "2024-02-05",
    readTime: "4 phút đọc",
  },
  {
    id: "8",
    title: "Tạo vườn thẳng đứng: Giải pháp xanh cho không gian hẹp",
    excerpt:
      "Khám phá cách thiết kế và thực hiện vườn tường, mang thiên nhiên vào ngôi nhà của bạn một cách thông minh.",
    image:
      "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&q=80",
    category: "Thiết kế vườn",
    date: "2024-02-03",
    readTime: "6 phút đọc",
  },
];

// ─── Main component ───────────────────────────────────────────────────────────
export default function News() {
  injectStyles();

  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 6;

  // Filter articles
  const filteredArticles = MOCK_ARTICLES.filter((article) => {
    const matchesCategory =
      selectedCategory === "Tất cả" || article.category === selectedCategory;
    const matchesSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredArticle =
    filteredArticles.find((a) => a.featured) ?? filteredArticles[0];
  const regularArticles = filteredArticles.filter(
    (a) => a.id !== featuredArticle?.id,
  );

  // Pagination
  const totalPages = Math.ceil(regularArticles.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedArticles = regularArticles.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("vi-VN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ── Header ── */}
        <div className="news-e1 mb-8">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-green-700">
              <Leaf className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-green-600 tracking-widest uppercase">
              Tin tức & bài viết
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2 leading-snug">
            Khám phá thế giới cây cảnh
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed max-w-2xl">
            Cập nhật kiến thức, mẹo chăm sóc và xu hướng mới nhất về cây xanh và
            trang trí không gian sống.
          </p>
        </div>

        {/* ── Filters ── */}
        <div className="news-e2 mb-8">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            {/* Search */}
            <div className="mb-5">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Tìm kiếm bài viết..."
                  className="news-search w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl text-sm bg-white"
                />
              </div>
            </div>

            {/* Categories */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-gray-400 tracking-widest uppercase shrink-0">
                Danh mục:
              </span>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setCurrentPage(1);
                  }}
                  className={`news-cat px-3 py-1.5 rounded-lg text-xs font-semibold border ${selectedCategory === cat ? "active" : "border-gray-200 text-gray-600"}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Featured article ── */}
        {featuredArticle && (
          <div className="news-e3 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-xs font-bold text-green-600 tracking-widest uppercase">
                Bài viết nổi bật
              </span>
            </div>
            <button
              onClick={() => navigate(`/news/${featuredArticle.id}`)}
              className="news-featured w-full text-left bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
            >
              <div className="grid md:grid-cols-5 gap-0">
                <div className="md:col-span-2 relative overflow-hidden bg-gray-100 aspect-[16/10] md:aspect-auto">
                  <img
                    src={featuredArticle.image}
                    alt={featuredArticle.title}
                    className="news-featured-img w-full h-full object-cover"
                  />
                  <span className="absolute top-3 left-3 bg-green-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                    Nổi bật
                  </span>
                </div>
                <div className="md:col-span-3 p-6 lg:p-8 flex flex-col justify-center">
                  <span className="inline-block text-xs font-bold text-green-700 bg-green-100 px-2.5 py-1 rounded-full mb-3 w-fit">
                    {featuredArticle.category}
                  </span>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3 leading-snug">
                    {featuredArticle.title}
                  </h2>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">
                    {featuredArticle.excerpt}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(featuredArticle.date)}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {featuredArticle.readTime}
                    </div>
                  </div>
                  <div className="news-read-more inline-flex items-center gap-2 text-sm font-semibold text-green-700 w-fit">
                    Đọc tiếp <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </button>
          </div>
        )}

        {/* ── Article grid ── */}
        <div className="news-e3">
          {paginatedArticles.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {paginatedArticles.map((article, i) => (
                <button
                  key={article.id}
                  onClick={() => navigate(`/news/${article.id}`)}
                  className="news-card text-left bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
                  style={{ animationDelay: `${i * 0.06}s` }}
                >
                  <div className="relative overflow-hidden bg-gray-100 aspect-[16/10]">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="news-card-img w-full h-full object-cover"
                    />
                    <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-semibold px-2.5 py-1 rounded-full">
                      {article.category}
                    </span>
                  </div>
                  <div className="p-5">
                    <h3 className="text-base font-bold text-gray-900 mb-2 leading-snug line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed mb-4 line-clamp-2">
                      {article.excerpt}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-gray-400 mb-3 pb-3 border-b border-gray-100">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(article.date)}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {article.readTime}
                      </div>
                    </div>
                    <div className="news-read-more inline-flex items-center gap-2 text-sm font-semibold text-green-700">
                      Đọc tiếp <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-gray-500 font-medium mb-1">
                Không tìm thấy bài viết
              </p>
              <p className="text-sm text-gray-400">
                Thử tìm kiếm với từ khóa khác
              </p>
            </div>
          )}

          {/* ── Pagination ── */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="news-page-btn px-4 py-2 border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-600"
              >
                Trước
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`news-page-btn w-10 h-10 border-2 rounded-xl text-sm font-bold ${currentPage === page ? "active" : "border-gray-200 text-gray-600"}`}
                  >
                    {page}
                  </button>
                ),
              )}

              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="news-page-btn px-4 py-2 border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-600"
              >
                Sau
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
