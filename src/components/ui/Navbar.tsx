import { Leaf, ShoppingCart } from "lucide-react";
import { useNavigate, NavLink } from "react-router";
import DropdownMenu from "@/components/ui/Dropdown";
import Logo from "@/assets/image/Logo.png";
import CartDropdown from "./CartDropdown";

export default function Navbar() {
  const navigate = useNavigate();

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
            <button
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg"
              onClick={() => navigate("/login")}
            >
              Đăng nhập / Đăng ký
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
