import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
    Sun, Droplets, Leaf, Scissors,
    Sprout, Bug, ThermometerSun, BookOpen, ArrowRight,
} from "lucide-react";

// ─── Data ─────────────────────────────────────────────────────────────────────
const tips = [
    { icon: Sun, title: "Ánh sáng", description: "Bonsai cần ánh sáng gián tiếp, tránh nắng gắt buổi trưa. Đặt gần cửa sổ hướng Đông hoặc Nam, xoay chậu định kỳ để cây phát triển đều." },
    { icon: Droplets, title: "Tưới nước", description: "Tưới khi mặt đất hơi khô (ấn nhẹ ngón tay). Tưới đẫm cho đến khi nước chảy ra lỗ thoát, tránh để úng. Mùa hè có thể tưới 1–2 lần/ngày, mùa đông giảm tần suất." },
    { icon: Leaf, title: "Đất và thay chậu", description: "Dùng đất thoát nước tốt (đất bonsai trộn đá perlite, đá trân châu). Thay chậu 2–3 năm/lần với cây non, 4–5 năm với cây già; tốt nhất vào đầu xuân." },
    { icon: Scissors, title: "Tỉa cành và tạo dáng", description: "Tỉa cành dài, lá dày để giữ dáng. Dùng kéo sắc, cắt chéo để vết thương mau lành. Buộc dây (wire) nhẹ nhàng để tạo thế, tránh siết quá gây tổn thương vỏ." },
    { icon: Sprout, title: "Bón phân", description: "Bón phân NPK cân đối hoặc phân hữu cơ pha loãng 2–4 tuần/lần trong mùa sinh trưởng (xuân–hè). Giảm hoặc ngưng bón vào thu–đông khi cây nghỉ." },
    { icon: Bug, title: "Sâu bệnh", description: "Kiểm tra lá và thân thường xuyên. Rệp, nhện đỏ: rửa lá nhẹ bằng nước hoặc dùng thuốc trừ sâu sinh học. Đảm bảo thông thoáng, tránh ẩm ướt kéo dài gây nấm." },
    { icon: ThermometerSun, title: "Nhiệt độ và mùa", description: "Đa số bonsai thích 15–28°C. Tránh gió lạnh, máy lạnh thổi trực tiếp. Mùa đông có thể đưa vào nơi mát, sáng; một số loài cần lạnh nhẹ để ngủ đông." },
];

// ─── Styles ───────────────────────────────────────────────────────────────────
const CSS = `
  @keyframes tp-fade-up {
    from { opacity:0; transform:translateY(20px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes tp-slide-left {
    from { opacity:0; transform:translateX(-20px); }
    to   { opacity:1; transform:translateX(0); }
  }
  @keyframes tp-scale-in {
    from { opacity:0; transform:scale(.9); }
    to   { opacity:1; transform:scale(1); }
  }
  @keyframes tp-icon-spin {
    from { transform:rotate(0deg) scale(1); }
    to   { transform:rotate(360deg) scale(1); }
  }

  .tp-e1 { animation: tp-fade-up .5s ease .04s both; }
  .tp-e2 { animation: tp-fade-up .5s ease .12s both; }

  /* Scroll-reveal: cards start hidden, JS adds .tp-visible */
  .tp-card {
    opacity:0;
    transform:translateY(24px);
    transition: opacity .5s ease, transform .5s cubic-bezier(.22,.68,0,1), box-shadow .25s ease;
  }
  .tp-card.tp-visible {
    opacity:1;
    transform:translateY(0);
  }
  .tp-card:hover {
    box-shadow: 0 10px 30px rgba(0,0,0,.09);
    transform: translateY(-3px);
  }
  .tp-card.tp-visible:hover {
    transform: translateY(-3px);
  }

  /* Icon */
  .tp-icon {
    transition: background .2s, transform .3s cubic-bezier(.34,1.56,.64,1);
  }
  .tp-card:hover .tp-icon {
    background: #dcfce7;
    transform: scale(1.12) rotate(-6deg);
  }

  /* Number chip */
  .tp-num {
    transition: background .2s, color .2s, transform .2s;
  }
  .tp-card:hover .tp-num {
    background: #16a34a;
    color: #fff;
    transform: scale(1.1);
  }

  /* Description reveal on hover */
  .tp-desc {
    transition: color .2s;
  }
  .tp-card:hover .tp-desc { color: #374151; }

  /* CTA card */
  .tp-cta {
    transition: box-shadow .25s ease, transform .25s ease;
  }
  .tp-cta:hover {
    box-shadow: 0 10px 32px rgba(0,0,0,.07);
    transform: translateY(-2px);
  }

  /* CTA button */
  .tp-cta-btn {
    transition: background .2s, transform .2s cubic-bezier(.34,1.56,.64,1), box-shadow .2s;
  }
  .tp-cta-btn:hover {
    background: #f0fdf4;
    transform: translateY(-2px) scale(1.03);
    box-shadow: 0 4px 14px rgba(22,163,74,.2);
  }
  .tp-cta-btn:active { transform: scale(.97); }

  /* Left accent bar */
  .tp-accent {
    transition: height .3s ease;
    height: 40%;
  }
  .tp-card:hover .tp-accent { height: 70%; }
`;

function injectStyles() {
    if (typeof document === "undefined") return;
    if (document.getElementById("tp-styles")) return;
    const el = document.createElement("style");
    el.id = "tp-styles";
    el.textContent = CSS;
    document.head.appendChild(el);
}

// ─── Scroll-reveal hook ───────────────────────────────────────────────────────
function useScrollReveal(deps: unknown[] = []) {
    useEffect(() => {
        const els = document.querySelectorAll<HTMLElement>(".tp-card");
        if (!els.length) return;
        const observer = new IntersectionObserver(
            (entries) => entries.forEach((e) => {
                if (e.isIntersecting) {
                    const el = e.target as HTMLElement;
                    const delay = el.dataset.delay ?? "0";
                    setTimeout(() => el.classList.add("tp-visible"), Number(delay));
                    observer.unobserve(el);
                }
            }),
            { threshold: 0.12 }
        );
        els.forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, deps);
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function Tips() {
    injectStyles();
    useScrollReveal([]);

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-16">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* ── Header ── */}
                <div className="tp-e1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
                    <div className="px-7 py-7 sm:px-10 sm:py-8">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-green-700">
                                <BookOpen className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-bold text-green-600 tracking-widest uppercase">Mẹo chăm sóc</span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 leading-snug">
                            Cách chăm sóc Bonsai
                        </h1>
                        <p className="text-gray-500 text-sm leading-relaxed max-w-xl">
                            Bonsai là nghệ thuật thu nhỏ cây cảnh. Chỉ cần chú ý ánh sáng, nước, đất và tỉa tạo dáng đúng cách, cây sẽ sống lâu và đẹp bền.
                        </p>
                    </div>
                    {/* Progress bar decoration */}
                    <div className="h-1 bg-gray-100">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: "100%" }} />
                    </div>
                </div>

                {/* ── Tips list ── */}
                <div className="space-y-4">
                    {tips.map((tip, index) => {
                        const Icon = tip.icon;
                        return (
                            <article
                                key={tip.title}
                                className="tp-card bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
                                data-delay={index * 60}
                            >
                                <div className="flex">
                                    {/* Left accent bar */}
                                    <div className="w-1 bg-green-100 relative flex items-center justify-center shrink-0">
                                        <div className="tp-accent w-full bg-green-500 rounded-full absolute" />
                                    </div>

                                    <div className="flex gap-4 sm:gap-5 p-5 sm:p-6 flex-1 min-w-0">
                                        {/* Icon */}
                                        <div className="tp-icon w-11 h-11 rounded-xl bg-green-100 text-green-700 flex items-center justify-center shrink-0">
                                            <Icon className="w-5 h-5" />
                                        </div>

                                        {/* Content */}
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2 mb-1.5">
                                                <span className="tp-num text-xs font-bold text-green-700 bg-green-50 border border-green-100 w-6 h-6 rounded-full flex items-center justify-center shrink-0">
                                                    {index + 1}
                                                </span>
                                                <h2 className="text-base font-bold text-gray-900">{tip.title}</h2>
                                            </div>
                                            <p className="tp-desc text-sm text-gray-500 leading-relaxed">{tip.description}</p>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>

                {/* ── CTA ── */}
                <div
                    className="tp-card tp-cta mt-8 bg-white rounded-2xl border-2 border-green-100 shadow-sm p-7 sm:p-8 text-center"
                    data-delay={tips.length * 60 + 80}
                >
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                        <Leaf className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-gray-900 mb-2">Cần tư vấn cụ thể?</h3>
                    <p className="text-sm text-gray-500 mb-5 max-w-sm mx-auto leading-relaxed">
                        Mỗi loài bonsai có nhu cầu khác nhau — hãy hỏi chúng tôi khi mua để được tư vấn cụ thể.
                    </p>
                    <Link
                        to="/contact"
                        className="tp-cta-btn inline-flex items-center justify-center gap-2 rounded-xl border-2 border-green-600 text-green-700 px-6 py-2.5 font-semibold text-sm"
                    >
                        Liên hệ tư vấn <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

            </div>
        </div>
    );
}