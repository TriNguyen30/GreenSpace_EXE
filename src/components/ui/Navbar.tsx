import { useState, useRef, useEffect } from "react";
import { User, ChevronDown } from "lucide-react";
import { useNavigate, NavLink } from "react-router";
import DropdownMenu from "@/components/ui/Dropdown";
import Logo from "@/assets/image/Logo.png";
import CartDropdown from "./CartDropdown";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { logout } from "@/store/slices/authSlice";

export default function Navbar() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { token, user } = useAppSelector((state) => state.auth);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="bg-white shadow-sm fixed top-0 left-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center cursor-pointer" onClick={() => navigate("/")}>
            <div className="flex items-center justify-center">
              <img
                src={Logo}
                alt="Logo"
                className="w-15 h-auto transition-transform hover:scale-110"
                onClick={() => navigate("/")}
              />
            </div>
            <span className="text-xm font-bold text-gray-900">Green Space</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <DropdownMenu
              label="Bộ sưu tập"
              items={[
                {
                  label: "Tin tức",
                  value: "news",
                  onClick: () => navigate("/news"),
                },
                {
                  label: "Loài hoa",
                  value: "flowers",
                  onClick: () => navigate("/product"),
                },
                {
                  label: "Kiến thức – mẹo vặt",
                  value: "tips",
                  onClick: () => navigate("/tips"),
                },
                {
                  label: "Khuyến mãi",
                  value: "sale",
                  onClick: () => navigate("/sale"),
                },
                {
                  label: "Tuyển dụng",
                  value: "jobs",
                  onClick: () => navigate("/jobs"),
                },
              ]}
            />

            <NavLink
              to="/contact"
              className="text-gray-600 hover:text-green-500 font-medium transition-colors duration-200"
            >
              Liên hệ
            </NavLink>

            <NavLink
              to="/tips"
              className="text-gray-600 hover:text-green-500 font-medium transition-colors duration-200"
            >
              Mẹo chăm sóc
            </NavLink>
          </nav>
          <div className="flex items-center gap-6">
            <CartDropdown />
            {token && user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((o) => !o)}
                  className="flex items-center gap-2 p-2 rounded-full hover:bg-gray-100 transition-colors"
                  aria-expanded={userMenuOpen}
                  aria-haspopup="true"
                >
                  <span className="w-9 h-9 flex items-center justify-center rounded-full bg-green-100 text-green-600">
                    <User className="w-5 h-5" />
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-500 transition-transform ${userMenuOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 py-1 bg-white rounded-xl shadow-lg border border-gray-100 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user.name || user.email}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false);
                        navigate("/profile");
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 hover:text-green-600 transition-colors"
                    >
                      Hồ sơ
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        dispatch(logout());
                        setUserMenuOpen(false);
                        navigate("/");
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg"
                onClick={() => navigate("/login")}
              >
                Đăng nhập / Đăng ký
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
