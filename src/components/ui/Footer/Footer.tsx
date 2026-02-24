import "./Color.css";
import { Mail, MapPin, Phone } from "lucide-react";
import Logo from "@/assets/image/Logo.png";

// ─── Inline SVG social icons (no extra dep needed) ───────────────────────────
function FacebookIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function YoutubeIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.4a2.78 2.78 0 0 0 1.95-1.97A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
      <polygon fill="#1a2e1a" points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
    </svg>
  );
}

// ─── Decorative leaf SVG ──────────────────────────────────────────────────────
function DecorLeaf({ className, size = 80 }: { className?: string; size?: number }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 8-8 8C11.82 10 10 9.1 9 8H7c0 2.5 1.5 5 4 7.1V17h2v-1.9c2.5 1.8 4 4.4 4 6.9h2c0-3-1.5-6.5-4-8.5C16.5 11.5 17 8 17 8z" />
    </svg>
  );
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const EXPLORE_LINKS = [
  { label: "Bộ sưu tập Bonsai", href: "/product" },
  { label: "Cây để bàn văn phòng", href: "/product" },
  { label: "Dụng cụ chăm sóc", href: "/product" },
  { label: "Phụ kiện trang trí", href: "/product" },
];

const SUPPORT_LINKS = [
  { label: "Hướng dẫn mua hàng", href: "#" },
  { label: "Chính sách vận chuyển", href: "#" },
  { label: "Bảo hành & đổi trả", href: "#" },
  { label: "Câu hỏi thường gặp", href: "#" },
];

const SOCIAL = [
  {
    label: "Facebook",
    href: "https://facebook.com",
    icon: <FacebookIcon />,
    hoverColor: "#1877f2",
  },
  {
    label: "YouTube",
    href: "https://youtube.com",
    icon: <YoutubeIcon />,
    hoverColor: "#ff0000",
  },
];

// ─── Inject styles ────────────────────────────────────────────────────────────
const CSS = `
  @keyframes ft-float-a {
    0%,100% { transform: translateY(0)   rotate(-8deg); opacity:.07; }
    50%      { transform: translateY(-18px) rotate(-2deg); opacity:.12; }
  }
  @keyframes ft-float-b {
    0%,100% { transform: translateY(0)  rotate(14deg); opacity:.05; }
    50%      { transform: translateY(14px) rotate(8deg);  opacity:.1; }
  }
  @keyframes ft-float-c {
    0%,100% { transform: translateY(0)   rotate(-4deg); opacity:.06; }
    50%      { transform: translateY(-10px) rotate(4deg); opacity:.11; }
  }

  .ft-leaf-a { animation: ft-float-a 9s  ease-in-out infinite; }
  .ft-leaf-b { animation: ft-float-b 12s ease-in-out infinite 2s; }
  .ft-leaf-c { animation: ft-float-c 7s  ease-in-out infinite 4s; }

  /* Footer link hover */
  .ft-link {
    position: relative;
    transition: color .2s, padding-left .2s;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  .ft-link::before {
    content: '';
    display: inline-block;
    width: 0; height: 2px;
    background: #4ade80;
    border-radius: 2px;
    transition: width .22s cubic-bezier(.34,1.56,.64,1);
    flex-shrink: 0;
  }
  .ft-link:hover { color: #fff; padding-left: 4px; }
  .ft-link:hover::before { width: 8px; }

  /* Social icon btn */
  .ft-social {
    transition: transform .2s cubic-bezier(.34,1.56,.64,1), background .2s, color .2s, box-shadow .2s;
  }
  .ft-social:hover {
    transform: translateY(-3px) scale(1.12);
    box-shadow: 0 4px 16px rgba(0,0,0,.3);
  }

  /* Logo */
  .ft-logo {
    transition: transform .25s cubic-bezier(.34,1.56,.64,1), filter .2s;
  }
  .ft-logo:hover {
    transform: scale(1.08) rotate(-3deg);
    filter: drop-shadow(0 2px 8px rgba(74,222,128,.4));
  }

  /* Contact row */
  .ft-contact-row {
    transition: color .2s, transform .2s;
  }
  .ft-contact-row:hover {
    color: #fff;
    transform: translateX(3px);
  }

  /* Bottom border glow */
  .ft-divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(74,222,128,.3), transparent);
  }
`;

function injectFooterStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById("ft-styles")) return;
  const tag = document.createElement("style");
  tag.id = "ft-styles";
  tag.textContent = CSS;
  document.head.appendChild(tag);
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function Footer() {
  injectFooterStyles();

  return (
    <footer
      className="relative overflow-hidden"
      style={{
        background: "linear-gradient(160deg, #0f1f0f 0%, #1a2e1a 60%, #0d1f0d 100%)",
        color: "#e5e7eb",
      }}
    >

      {/* Subtle radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 60% 50% at 80% 50%, rgba(34,197,94,.06) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">

        {/* ── Main grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 mb-12">

          {/* Brand column */}
          <div className="sm:col-span-2 md:col-span-1">
            <a href="/" className="inline-flex items-center gap-2 mb-5 group">
              <img src={Logo} alt="Green Space" className="ft-logo w-12 h-auto" />
              <span className="text-lg font-bold text-white tracking-tight">Green Space</span>
            </a>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Kiến tạo không gian sống xanh, thân thiện với thiên nhiên — mỗi góc nhỏ trong nhà bạn thành một khu vườn bình yên.
            </p>

            {/* Social icons */}
            <div className="flex items-center gap-3">
              {SOCIAL.map(({ label, href, icon, hoverColor }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="ft-social w-9 h-9 rounded-xl flex items-center justify-center text-gray-400"
                  style={{ background: "rgba(255,255,255,.08)" }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = hoverColor;
                    (e.currentTarget as HTMLElement).style.color = "#fff";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,.08)";
                    (e.currentTarget as HTMLElement).style.color = "";
                  }}
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Explore links */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-5 tracking-wide uppercase">
              Khám phá
            </h3>
            <ul className="space-y-3">
              {EXPLORE_LINKS.map(({ label, href }) => (
                <li key={label}>
                  <a href={href} className="ft-link text-gray-400 text-sm">{label}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support links */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-5 tracking-wide uppercase">
              Hỗ trợ
            </h3>
            <ul className="space-y-3">
              {SUPPORT_LINKS.map(({ label, href }) => (
                <li key={label}>
                  <a href={href} className="ft-link text-gray-400 text-sm">{label}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-5 tracking-wide uppercase">
              Liên hệ
            </h3>
            <ul className="space-y-3.5">
              {[
                { icon: <MapPin className="w-4 h-4 shrink-0 text-green-400" />, text: "Thủ Đức, Q9, TP HCM" },
                { icon: <Phone className="w-4 h-4 shrink-0 text-green-400" />, text: "0902 345 678" },
                { icon: <Mail className="w-4 h-4 shrink-0 text-green-400" />, text: "hello@greenspace.vn" },
              ].map(({ icon, text }) => (
                <li key={text} className="ft-contact-row flex items-start gap-2.5 text-gray-400 text-sm cursor-default">
                  <span className="mt-0.5">{icon}</span>
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Divider ── */}
        <div className="ft-divider mb-6" />

        {/* ── Bottom bar ── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-gray-500 text-xs">
            © 2025 Green Space Store. Bảo lưu mọi quyền.
          </p>
          <p className="text-gray-600 text-xs italic">
            Designed for Zen living 🌿
          </p>
        </div>

      </div>
    </footer>
  );
}