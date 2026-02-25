import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Share2,
  Facebook,
  Twitter,
  Link2,
  ChevronRight,
  Leaf,
  TrendingUp,
  Check,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type Article = {
  id: string;
  title: string;
  excerpt: string;
  content: string[];
  image: string;
  category: string;
  date: string;
  readTime: string;
  author?: string;
  tags?: string[];
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const CSS = `
  @keyframes nd-fade-up {
    from { opacity:0; transform:translateY(16px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes nd-img-in {
    from { opacity:0; transform:scale(.96); }
    to   { opacity:1; transform:scale(1); }
  }
  @keyframes nd-toast {
    0%   { opacity:0; transform:translateY(-20px) scale(.9); }
    15%  { opacity:1; transform:translateY(0) scale(1.05); }
    85%  { opacity:1; transform:translateY(0) scale(1); }
    100% { opacity:0; transform:translateY(-10px) scale(.95); }
  }

  .nd-e1 { animation: nd-fade-up .45s ease .04s both; }
  .nd-e2 { animation: nd-fade-up .45s ease .12s both; }
  .nd-e3 { animation: nd-fade-up .45s ease .20s both; }
  .nd-e4 { animation: nd-fade-up .45s ease .28s both; }

  .nd-hero-img { animation: nd-img-in .6s cubic-bezier(.22,.68,0,1) both; }

  /* Back button */
  .nd-back { transition: color .2s, transform .2s; }
  .nd-back:hover { color:#16a34a; transform:translateX(-3px); }
  .nd-back-icon { transition:transform .2s; }
  .nd-back:hover .nd-back-icon { transform:translateX(-3px); }

  /* Share button */
  .nd-share {
    transition: background .2s, border-color .2s, color .2s, transform .2s;
  }
  .nd-share:hover {
    background: #f0fdf4;
    border-color: #16a34a;
    color: #16a34a;
    transform: translateY(-1px);
  }
  .nd-share:active { transform: scale(.96); }

  /* Social buttons */
  .nd-social {
    transition: background .2s, transform .2s cubic-bezier(.34,1.56,.64,1), box-shadow .2s;
  }
  .nd-social.fb:hover { background:#1877f2; transform:translateY(-2px) scale(1.05); box-shadow:0 4px 14px rgba(24,119,242,.3); }
  .nd-social.tw:hover { background:#1da1f2; transform:translateY(-2px) scale(1.05); box-shadow:0 4px 14px rgba(29,161,242,.3); }
  .nd-social.link:hover { background:#16a34a; transform:translateY(-2px) scale(1.05); box-shadow:0 4px 14px rgba(22,163,74,.3); }
  .nd-social:active { transform:scale(.92); }

  /* Tag chip */
  .nd-tag {
    transition: background .2s, color .2s, transform .2s;
  }
  .nd-tag:hover {
    background: #16a34a;
    color: #fff;
    transform: translateY(-1px);
  }

  /* Related card */
  .nd-related {
    transition: transform .3s cubic-bezier(.34,1.56,.64,1), box-shadow .3s ease;
  }
  .nd-related:hover {
    transform: translateY(-6px);
    box-shadow: 0 16px 36px rgba(0,0,0,.1);
  }
  .nd-related-img { transition: transform .5s ease; }
  .nd-related:hover .nd-related-img { transform: scale(1.08); }

  /* Toast */
  .nd-toast {
    animation: nd-toast 2.5s ease forwards;
  }

  /* Content paragraph */
  .nd-content p {
    margin-bottom: 1.25rem;
    line-height: 1.75;
    color: #374151;
  }
  .nd-content p:last-child { margin-bottom: 0; }

  /* Tip box */
  .nd-tip { transition: box-shadow .25s ease; }
  .nd-tip:hover { box-shadow: 0 8px 24px rgba(0,0,0,.06); }
`;

function injectStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById("nd-styles")) return;
  const el = document.createElement("style");
  el.id = "nd-styles";
  el.textContent = CSS;
  document.head.appendChild(el);
}

// ─── Mock data ────────────────────────────────────────────────────────────────
const MOCK_ARTICLES: Record<string, Article> = {
  "1": {
    id: "1",
    title: "7 loại cây trồng trong nhà giúp thanh lọc không khí hiệu quả",
    excerpt:
      "Khám phá những loại cây cảnh phổ biến có khả năng lọc không khí tuyệt vời, phù hợp cho không gian sống hiện đại.",
    image:
      "https://images.unsplash.com/photo-1463320726281-696a485928c7?w=1200&q=80",
    category: "Chăm sóc cây",
    date: "2024-02-20",
    readTime: "5 phút đọc",
    author: "Green Space Team",
    tags: ["Cây trong nhà", "Lọc không khí", "Sức khỏe"],
    content: [
      "Trong thời đại ô nhiễm không khí ngày càng gia tăng, việc sử dụng cây xanh để cải thiện chất lượng không khí trong nhà đã trở thành một giải pháp được nhiều người quan tâm. Nghiên cứu của NASA đã chứng minh rằng một số loại cây có khả năng hấp thụ các chất độc hại như formaldehyde, benzene và trichloroethylene.",
      "Dưới đây là 7 loại cây được khuyên dùng để thanh lọc không khí trong nhà một cách hiệu quả nhất.",
      "**1. Cây trầu bà (Pothos)**\nCây trầu bà là một trong những loại cây dễ trồng nhất, có khả năng phát triển tốt trong điều kiện ánh sáng yếu. Cây có thể loại bỏ formaldehyde, xylene và benzene từ không khí. Đặc biệt phù hợp với những người mới bắt đầu trồng cây.",
      "**2. Cây lưỡi hổ (Snake Plant)**\nCây lưỡi hổ nổi tiếng với khả năng chuyển hóa CO2 thành O2 vào ban đêm, khác với hầu hết các loại cây khác. Đây là lựa chọn hoàn hảo cho phòng ngủ. Cây cũng có khả năng loại bỏ formaldehyde và benzene.",
      "**3. Cây môn (Peace Lily)**\nCây môn không chỉ đẹp mắt mà còn là một trong những loại cây lọc không khí tốt nhất. Có thể loại bỏ ammonia, benzene, formaldehyde và trichloroethylene. Tuy nhiên, cây cần được đặt xa tầm với của trẻ em và thú cưng vì có chứa chất độc.",
      "**4. Cây lô hội (Aloe Vera)**\nNgoài công dụng làm đẹp và chữa bỏng, cây lô hội còn có khả năng loại bỏ formaldehyde và benzene. Cây rất dễ chăm sóc và có thể phát triển tốt trong điều kiện ánh sáng gián tiếp.",
      "**5. Cây phong lộc (Spider Plant)**\nCây phong lộc có khả năng loại bỏ formaldehyde và xylene. Đây là loại cây phát triển rất nhanh và dễ nhân giống, phù hợp cho những không gian cần nhiều cây xanh.",
      "**Lưu ý khi trồng cây thanh lọc không khí:**\nĐể đạt hiệu quả tốt nhất, NASA khuyến nghị nên có ít nhất một cây với chậu đường kính 15-20cm cho mỗi 9m² diện tích. Đặt cây ở những vị trí có luồng không khí lưu thông tốt và đảm bảo chăm sóc cây đúng cách để duy trì khả năng lọc không khí.",
    ],
  },
  "2": {
    id: "2",
    title: "Cách tưới nước đúng cách cho cây cảnh trong mùa hè",
    excerpt:
      "Hướng dẫn chi tiết về tần suất và phương pháp tưới nước để cây luôn xanh tốt trong những tháng nóng bức.",
    image:
      "https://images.unsplash.com/photo-1466781783364-36c955e42a7f?w=1200&q=80",
    category: "Mẹo hữu ích",
    date: "2024-02-18",
    readTime: "4 phút đọc",
    author: "Green Space Team",
    tags: ["Tưới nước", "Mùa hè", "Chăm sóc"],
    content: [
      "Tưới nước là một trong những yếu tố quan trọng nhất trong việc chăm sóc cây cảnh, đặc biệt trong mùa hè khi nhiệt độ cao và độ ẩm thấp có thể khiến cây dễ bị thiếu nước.",
      "Dưới đây là những nguyên tắc và mẹo giúp bạn tưới nước đúng cách cho cây trong những tháng hè nóng bức.",
      "**Thời điểm tưới nước**\nTưới nước vào sáng sớm (5-7 giờ) hoặc chiều mát (sau 17 giờ) là thời điểm lý tưởng. Tránh tưới vào giữa trưa khi nắng gắt vì nước có thể làm bỏng lá và bốc hơi nhanh chóng.",
      "**Tần suất tưới**\nKiểm tra độ ẩm đất bằng cách ấn ngón tay xuống đất khoảng 2-3cm. Nếu đất khô, đã đến lúc cần tưới. Đối với cây trong chậu, có thể cần tưới 1-2 lần/ngày trong những ngày nóng đỉnh điểm.",
      "**Lượng nước**\nTưới đẫm cho đến khi nước chảy ra từ lỗ thoát nước ở đáy chậu. Điều này đảm bảo rễ cây được cung cấp đủ nước và giúp loại bỏ muối tích tụ trong đất.",
    ],
  },
};

const RELATED_ARTICLES = [
  {
    id: "2",
    title: "Cách tưới nước đúng cách cho cây cảnh trong mùa hè",
    image:
      "https://images.unsplash.com/photo-1466781783364-36c955e42a7f?w=600&q=80",
    category: "Mẹo hữu ích",
    date: "2024-02-18",
  },
  {
    id: "3",
    title: "Thiết kế vườn nhỏ: Biến ban công thành ốc đảo xanh",
    image:
      "https://images.unsplash.com/photo-1558904541-efa843a96f01?w=600&q=80",
    category: "Thiết kế vườn",
    date: "2024-02-15",
  },
  {
    id: "4",
    title: "Top 5 loại phân bón hữu cơ tốt nhất cho cây trồng trong chậu",
    image:
      "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80",
    category: "Chăm sóc cây",
    date: "2024-02-12",
  },
];

// ─── Toast notification ───────────────────────────────────────────────────────
function showToast(message: string) {
  const existing = document.getElementById("nd-toast");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.id = "nd-toast";
  toast.className =
    "nd-toast fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-green-600 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 text-sm font-semibold";
  toast.innerHTML = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg> ${message}`;
  document.body.appendChild(toast);

  setTimeout(() => toast.remove(), 2500);
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function NewsDetail() {
  injectStyles();

  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [shareOpen, setShareOpen] = useState(false);

  useEffect(() => {
    if (id && MOCK_ARTICLES[id]) {
      setArticle(MOCK_ARTICLES[id]);
      window.scrollTo(0, 0);
    } else {
      setArticle(null);
    }
  }, [id]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("vi-VN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const handleShare = (platform: "facebook" | "twitter" | "link") => {
    const url = window.location.href;
    const title = article?.title ?? "";

    if (platform === "facebook") {
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
        "_blank",
      );
    } else if (platform === "twitter") {
      window.open(
        `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
        "_blank",
      );
    } else if (platform === "link") {
      navigator.clipboard.writeText(url);
      showToast("Đã sao chép liên kết!");
      setShareOpen(false);
    }
  };

  if (!article) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
        <p className="text-gray-700">Không tìm thấy bài viết</p>
        <button
          onClick={() => navigate("/news")}
          className="px-5 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700 transition-colors"
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ── Breadcrumb ── */}
        <div className="nd-e1 mb-6">
          <button
            onClick={() => navigate("/news")}
            className="nd-back inline-flex items-center gap-1.5 text-sm text-gray-500 font-medium"
          >
            <ArrowLeft className="nd-back-icon w-4 h-4" />
            Tin tức
          </button>
        </div>

        {/* ── Article header ── */}
        <article className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
          {/* Hero image */}
          <div className="nd-hero-img relative overflow-hidden bg-gray-100 aspect-[16/9]">
            <img
              src={article.image}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Meta + title */}
          <div className="nd-e2 p-6 sm:p-8 lg:p-10">
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-block text-xs font-bold text-green-700 bg-green-100 px-2.5 py-1 rounded-full">
                {article.category}
              </span>
              <span className="text-xs text-gray-300">•</span>
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <Calendar className="w-3.5 h-3.5" />
                {formatDate(article.date)}
              </div>
              <span className="text-xs text-gray-300">•</span>
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <Clock className="w-3.5 h-3.5" />
                {article.readTime}
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 leading-tight">
              {article.title}
            </h1>

            <p className="text-lg text-gray-600 leading-relaxed mb-6">
              {article.excerpt}
            </p>

            {/* Author + share */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-sm">
                  {article.author?.[0] ?? "G"}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {article.author ?? "Green Space"}
                  </p>
                  <p className="text-xs text-gray-400">Tác giả</p>
                </div>
              </div>

              <div className="relative">
                <button
                  onClick={() => setShareOpen((o) => !o)}
                  className="nd-share inline-flex items-center gap-2 px-4 py-2 border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-600"
                >
                  <Share2 className="w-4 h-4" />
                  Chia sẻ
                </button>

                {shareOpen && (
                  <div className="absolute top-full right-0 mt-2 bg-white rounded-xl border border-gray-100 shadow-lg p-3 flex gap-2 z-10">
                    <button
                      onClick={() => handleShare("facebook")}
                      className="nd-social fb w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center"
                      aria-label="Facebook"
                    >
                      <Facebook className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleShare("twitter")}
                      className="nd-social tw w-10 h-10 rounded-lg bg-sky-50 text-sky-500 flex items-center justify-center"
                      aria-label="Twitter"
                    >
                      <Twitter className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleShare("link")}
                      className="nd-social link w-10 h-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center"
                      aria-label="Copy link"
                    >
                      <Link2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="nd-e3 nd-content px-6 sm:px-8 lg:px-10 pb-8 lg:pb-10">
            {article.content.map((paragraph, i) => (
              <p
                key={i}
                className="text-base text-gray-700 leading-relaxed mb-5 last:mb-0"
              >
                {paragraph}
              </p>
            ))}
          </div>

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="nd-e3 px-6 sm:px-8 lg:px-10 pb-8 lg:pb-10 border-t border-gray-100 pt-6">
              <p className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-3">
                Thẻ bài viết
              </p>
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    className="nd-tag inline-block px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-semibold rounded-lg cursor-pointer"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </article>

        {/* ── Green tip box ── */}
        <div className="nd-e3 nd-tip bg-white border-2 border-green-100 rounded-2xl p-6 mb-8 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-green-600 shrink-0">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 mb-2">
                Mẹo từ Green Space
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Hãy thử áp dụng những kiến thức trên vào việc chăm sóc cây của
                bạn. Nếu cần tư vấn thêm, đội ngũ chúng tôi luôn sẵn sàng hỗ
                trợ!
              </p>
            </div>
          </div>
        </div>

        {/* ── Related articles ── */}
        <div className="nd-e4">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <h2 className="text-xl font-bold text-gray-900">
              Bài viết liên quan
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {RELATED_ARTICLES.filter((a) => a.id !== article.id)
              .slice(0, 3)
              .map((rel) => (
                <button
                  key={rel.id}
                  onClick={() => navigate(`/news/${rel.id}`)}
                  className="nd-related text-left bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
                >
                  <div className="relative overflow-hidden bg-gray-100 aspect-[16/10]">
                    <img
                      src={rel.image}
                      alt={rel.title}
                      className="nd-related-img w-full h-full object-cover"
                    />
                    <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-semibold px-2.5 py-1 rounded-full">
                      {rel.category}
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-bold text-gray-900 mb-2 leading-snug line-clamp-2">
                      {rel.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(rel.date)}
                    </div>
                  </div>
                </button>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
