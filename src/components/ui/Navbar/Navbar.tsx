import { useState, useRef, useEffect } from "react";
import { User, ChevronDown, LogOut, Package, Menu, X } from "lucide-react";
import { useNavigate, NavLink } from "react-router";
import DropdownMenu from "@/components/ui/Dropdown";
import Logo from "@/assets/image/Logo.png";
import CartDropdown from "../CartDropdown";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { logout } from "@/store/slices/authSlice";


// ─── Inject styles ────────────────────────────────────────────────────────────
const STYLES = `
  @keyframes nb-dropdown-in {
    from { opacity: 0; transform: translateY(-8px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0)    scale(1);    }
  }
  @keyframes nb-mobile-in {
    from { opacity: 0; transform: translateY(-12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes nb-avatar-ring {
    0%,100% { box-shadow: 0 0 0 0 rgba(34,197,94,.4); }
    50%      { box-shadow: 0 0 0 5px rgba(34,197,94,0); }
  }

  .nb-dropdown  { animation: nb-dropdown-in .22s cubic-bezier(.22,.68,0,1.1) both; }
  .nb-mobile-menu { animation: nb-mobile-in .25s ease both; }

  /* Frosted glass when scrolled */
  .nb-header {
    transition: background .3s ease, box-shadow .3s ease, backdrop-filter .3s ease;
  }
  .nb-header.scrolled {
    background: rgba(255,255,255,.82) !important;
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    box-shadow: 0 1px 0 rgba(0,0,0,.06), 0 4px 24px rgba(0,0,0,.06);
  }

  /* Nav link animated underline */
  .nb-navlink {
    position: relative;
    transition: color .2s;
  }
  .nb-navlink::after {
    content: '';
    position: absolute;
    bottom: -2px; left: 0;
    width: 100%; height: 2px;
    background: #16a34a;
    border-radius: 2px;
    transform: scaleX(0);
    transform-origin: left;
    transition: transform .25s cubic-bezier(.34,1.56,.64,1);
  }
  .nb-navlink:hover::after,
  .nb-navlink.active::after { transform: scaleX(1); }
  .nb-navlink:hover  { color: #16a34a; }
  .nb-navlink.active { color: #16a34a; font-weight: 600; }

  /* Login button */
  .nb-login-btn {
    background: linear-gradient(135deg, #16a34a, #22c55e);
    transition: transform .2s cubic-bezier(.34,1.56,.64,1), box-shadow .2s, filter .2s;
  }
  .nb-login-btn:hover {
    transform: translateY(-1px) scale(1.03);
    box-shadow: 0 4px 16px rgba(22,163,74,.35);
    filter: brightness(1.06);
  }
  .nb-login-btn:active { transform: scale(.97); }

  /* User avatar button */
  .nb-avatar-btn {
    transition: background .2s, transform .2s;
  }
  .nb-avatar-btn:hover { background: #f0fdf4; transform: scale(1.04); }
  .nb-avatar-btn:active { transform: scale(.96); }

  /* Avatar ring pulse when open */
  .nb-avatar-ring {
    animation: nb-avatar-ring 1.8s ease-in-out infinite;
  }

  /* Dropdown menu item */
  .nb-menu-item {
    transition: background .15s, color .15s, padding-left .15s;
  }
  .nb-menu-item:hover { padding-left: 20px; }

  /* Logo */
  .nb-logo {
    transition: transform .25s cubic-bezier(.34,1.56,.64,1), filter .2s;
  }
  .nb-logo:hover { transform: scale(1.08) rotate(-3deg); filter: drop-shadow(0 2px 8px rgba(22,163,74,.3)); }

  /* Mobile menu toggle */
  .nb-hamburger { transition: transform .2s ease; }
  .nb-hamburger:hover { transform: scale(1.1); }

  /* Chevron */
  .nb-chevron { transition: transform .25s cubic-bezier(.34,1.56,.64,1); }
  .nb-chevron.open { transform: rotate(180deg); }
`;

function injectNavStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById("nb-styles")) return;
  const tag = document.createElement("style");
  tag.id = "nb-styles";
  tag.textContent = STYLES;
  document.head.appendChild(tag);
}

// ─── Initials helper ──────────────────────────────────────────────────────────
function getInitials(name?: string, email?: string): string {
  if (name) {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return parts[0][0].toUpperCase();
  }
  return email ? email[0].toUpperCase() : "U";
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function Navbar() {
  injectNavStyles();

  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { token, user } = useAppSelector((state) => state.auth);

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);

  // Scroll detection for frosted glass
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close user menu on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Scroll to top helper
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Navigate with scroll to top
  const navigateWithScroll = (path: string) => {
    navigate(path);
    scrollToTop();
  };

  // Close mobile menu on navigate
  const goTo = (path: string) => {
    setMobileOpen(false);
    navigateWithScroll(path);
  };

  const initials = getInitials(user?.fullName, user?.email);
  const displayName = user?.fullName || user?.email || "Khách hàng";

  return (
    <header className={`nb-header bg-white fixed top-0 left-0 w-full z-50 ${scrolled ? "scrolled" : ""}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* ── Logo ── */}
          <button
            type="button"
            className="flex items-center gap-2.5 group cursor-pointer"
            onClick={() => {
              navigate("/");
              document.getElementById("home")?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            <img src={Logo} alt="Green Space" className="nb-logo w-10 h-auto" />
            <span className="font-semibold text-gray-800 text-base tracking-tight group-hover:text-green-700 transition-colors duration-200">
              Green Space
            </span>
          </button>

          {/* ── Desktop Nav ── */}
          <nav className="hidden md:flex items-center gap-8">
            <DropdownMenu
              label="Bộ sưu tập"
              items={[
                { label: "Tin tức", value: "news", onClick: () => navigateWithScroll("/news") },
                { label: "Loài hoa", value: "flowers", onClick: () => navigateWithScroll("/product") },
                { label: "Kiến thức – mẹo vặt", value: "tips", onClick: () => navigateWithScroll("/tips") },
                { label: "Khuyến mãi", value: "sale", onClick: () => navigateWithScroll("/sale") },
                { label: "Tuyển dụng", value: "jobs", onClick: () => navigateWithScroll("/jobs") },
              ]}
            />

            <NavLink
              to="/contact"
              onClick={scrollToTop}
              className={({ isActive }) => `nb-navlink text-gray-600 text-sm font-medium ${isActive ? "active" : ""}`}
            >
              Liên hệ
            </NavLink>

            <NavLink
              to="/tips"
              onClick={scrollToTop}
              className={({ isActive }) => `nb-navlink text-gray-600 text-sm font-medium ${isActive ? "active" : ""}`}
            >
              Mẹo chăm sóc
            </NavLink>
          </nav>

          {/* ── Right actions ── */}
          <div className="flex items-center gap-2">
            <CartDropdown />

            {token && user ? (
              /* User menu */
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((o) => !o)}
                  className="nb-avatar-btn flex items-center gap-2 px-2 py-1.5 rounded-xl"
                  aria-expanded={userMenuOpen}
                  aria-haspopup="true"
                >
                  {/* Avatar circle with initials */}
                  <span
                    className={`w-8 h-8 flex items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-green-600 text-white text-sm font-bold select-none shrink-0 ${userMenuOpen ? "nb-avatar-ring" : ""}`}
                  >
                    {initials}
                  </span>

                  {/* Name — hidden on small screens */}
                  <span className="hidden lg:block text-sm font-medium text-gray-700 max-w-[96px] truncate">
                    {displayName.split(" ")[0]}
                  </span>

                  <ChevronDown className={`nb-chevron w-4 h-4 text-gray-400 ${userMenuOpen ? "open" : ""}`} />
                </button>

                {/* Dropdown */}
                {userMenuOpen && (
                  <div className="nb-dropdown absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100/80 overflow-hidden z-50">
                    {/* User info header */}
                    <div className="px-4 py-3 bg-gradient-to-br from-green-50 to-white border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <span className="w-9 h-9 flex items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-green-600 text-white text-sm font-bold shrink-0">
                          {initials}
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{displayName}</p>
                          <p className="text-xs text-gray-400 truncate">{"Khách hàng"}</p>
                        </div>
                      </div>
                    </div>

                    {/* Menu items */}
                    <div className="py-1.5">
                      <button
                        type="button"
                        onClick={() => { setUserMenuOpen(false); navigateWithScroll("/profile"); }}
                        className="nb-menu-item w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 flex items-center gap-2.5"
                      >
                        <User className="w-4 h-4 opacity-60" />
                        Hồ sơ của tôi
                      </button>

                      <button
                        type="button"
                        onClick={() => { setUserMenuOpen(false); navigateWithScroll("/orders"); }}
                        className="nb-menu-item w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 flex items-center gap-2.5"
                      >
                        <Package className="w-4 h-4 opacity-60" />
                        Đơn hàng
                      </button>
                    </div>

                    <div className="border-t border-gray-100 py-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          dispatch(logout());
                          setUserMenuOpen(false);
                          navigateWithScroll("/login");
                        }}
                        className="nb-menu-item w-full px-4 py-2.5 text-left text-sm text-red-500 hover:bg-red-50 hover:text-red-600 flex items-center gap-2.5"
                      >
                        <LogOut className="w-4 h-4 opacity-70" />
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Login button */
              <button
                className="nb-login-btn text-white text-sm font-semibold px-5 py-2 rounded-xl cursor-pointer"
                onClick={() => navigateWithScroll("/login")}
              >
                Đăng nhập
              </button>
            )}

            {/* Mobile hamburger */}
            <button
              type="button"
              className="nb-hamburger md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* ── Mobile Menu ── */}
        {mobileOpen && (
          <div className="nb-mobile-menu md:hidden border-t border-gray-100 py-3 space-y-1 pb-4">
            {[
              { label: "Tin tức", path: "/news" },
              { label: "Sản phẩm", path: "/product" },
              { label: "Mẹo chăm sóc", path: "/tips" },
              { label: "Liên hệ", path: "/contact" },
              { label: "Khuyến mãi", path: "/sale" },
            ].map(({ label, path }) => (
              <button
                key={path}
                type="button"
                onClick={() => goTo(path)}
                className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-green-50 hover:text-green-700 rounded-xl transition-colors"
              >
                {label}
              </button>
            ))}

            {!token && (
              <div className="pt-2 px-4">
                <button
                  className="nb-login-btn w-full text-white text-sm font-semibold py-2.5 rounded-xl"
                  onClick={() => goTo("/login")}
                >
                  Đăng nhập / Đăng ký
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}