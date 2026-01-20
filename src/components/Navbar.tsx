import { Leaf } from "lucide-react";

export default function Navbar() {
  return (
    <div>
      <header className="bg-white shadow-sm relative z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">
                Green Space
              </span>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <a href="#" className="text-gray-600 hover:text-gray-900">
                Bộ sưu tập
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-900">
                Về chúng tôi
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-900">
                Mẹo chăm sóc
              </a>
            </nav>
            <button className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg">
              Đăng nhập / Đăng ký
            </button>
          </div>
        </div>
      </header>
    </div>
  );
}
