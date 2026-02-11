import React, { useState } from "react";
import { 
  Package, 
  LogOut,
  Menu,
  X,
  Store,
  Boxes
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout } from "@/store/slices/authSlice";

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

function SidebarItem({ icon, label, isActive, onClick }: SidebarItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
        isActive
          ? "bg-green-100 text-green-700 font-medium"
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState("categories");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const menuItems = [
    { id: "categories", label: "Danh mục", icon: <Boxes className="w-5 h-5" /> },
    { id: "products", label: "Sản phẩm", icon: <Package className="w-5 h-5" /> },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case "categories":
        return <CategoriesContent />;
      case "products":
        return <ProductsContent />;
      default:
        return <CategoriesContent />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? "w-64" : "w-20"} bg-white shadow-lg transition-all duration-300 flex flex-col`}>
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className={`flex items-center gap-3 ${!sidebarOpen && "justify-center"}`}>
              <Store className="w-8 h-8 text-green-600" />
              {sidebarOpen && (
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Green Space</h1>
                  <p className="text-xs text-gray-500">Admin Panel</p>
                </div>
              )}
            </div>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <SidebarItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              isActive={activeSection === item.id}
              onClick={() => setActiveSection(item.id)}
            />
          ))}
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-gray-200">
          <div className="mb-4 px-4">
            <p className="text-sm font-medium text-gray-900">{user?.email}</p>
            <p className="text-xs text-gray-500">Administrator</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-all"
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span>Đăng xuất</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-900">
              {menuItems.find(item => item.id === activeSection)?.label}
            </h2>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">
                Chào mừng trở lại, {user?.fullName || "Admin"}
              </span>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-8">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

// Categories Content Component
function CategoriesContent() {
  const navigate = useNavigate();
  
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Quản lý danh mục</h3>
        <button
          onClick={() => navigate("/admin/categories")}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          Quản lý danh mục
        </button>
      </div>
      <p className="text-gray-500">Nhấn vào nút trên để truy cập trang quản lý danh mục đầy đủ.</p>
    </div>
  );
}

// Products Content Component
function ProductsContent() {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quản lý sản phẩm</h3>
      <p className="text-gray-500">Tính năng quản lý sản phẩm sẽ được triển khai sau.</p>
    </div>
  );
}
