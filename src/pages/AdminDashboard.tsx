import React, { useState } from "react";
import {
  LogOut,
  Boxes,
  Package,
  User,
  Menu,
  X,
  Store,
  ChevronDown,
  Tag,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/slices/authSlice";
import UserManagement from "./UserManagement";
import ProductManagement from "./ProductManagement";
import CategoryManagement from "./CategoryManagement";

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
  hasDropdown?: boolean;
  dropdownItems?: { id: string; label: string; icon?: React.ReactNode }[];
  onDropdownClick?: (id: string) => void;
  productDropdownOpen?: boolean;
  setProductDropdownOpen?: (open: boolean) => void;
  activeSection?: string;
}

function SidebarItem({ 
  icon, 
  label, 
  isActive,
  onClick, 
  hasDropdown, 
  dropdownItems, 
  onDropdownClick,
  productDropdownOpen,
  setProductDropdownOpen,
  activeSection
}: SidebarItemProps) {
  return (
    <div>
      <button
        onClick={() => {
          if (hasDropdown) {
            setProductDropdownOpen?.(!productDropdownOpen);
          } else {
            onClick();
          }
        }}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all ${
          isActive
            ? "bg-green-100 text-green-700 font-medium"
            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        }`}
      >
        <div className="flex items-center gap-3">
          {icon}
          <span>{label}</span>
        </div>
        {hasDropdown && (
          <ChevronDown 
            className={`w-4 h-4 transition-transform ${
              productDropdownOpen ? 'rotate-180' : ''
            }`} 
          />
        )}
      </button>
      
      {hasDropdown && productDropdownOpen && dropdownItems && (
        <div className="ml-6 mt-1 space-y-1">
          {dropdownItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onDropdownClick?.(item.id);
              }}
              className={`w-full text-left px-4 py-2 text-sm rounded-lg transition-colors flex items-center gap-3 ${
                activeSection === item.id ? 'bg-green-50 text-green-700' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {item.icon && <span className="w-4 h-4">{item.icon}</span>}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState("categories");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [productDropdownOpen, setProductDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state: any) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const menuItems = [
    { id: "categories", label: "Danh mục", icon: <Boxes className="w-5 h-5" /> },
    { 
      id: "products", 
      label: "Sản phẩm và biến thể", 
      icon: <Package className="w-5 h-5" />,
      hasDropdown: true,
      dropdownItems: [
        { id: "products", label: "Sản phẩm", icon: <Package className="w-4 h-4" /> },
        { id: "variants", label: "Biến thể", icon: <Tag className="w-4 h-4" /> }
      ]
    },
    { id: "users", label: "Người dùng", icon: <User className="w-5 h-5" /> },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case "categories":
        return <CategoryManagement />;
      case "products":
        return <ProductManagement />;
      case "variants":
        return (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Quản lý biến thể</h3>
            </div>
            <p className="text-gray-500">Chức năng quản lý biến thể sẽ được phát triển sau.</p>
          </div>
        );
      case "users":
        return <UserManagement />;
      default:
        return <CategoryManagement />;
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
              activeSection={activeSection}
              onClick={() => {
                if (item.hasDropdown) {
                  setProductDropdownOpen(!productDropdownOpen);
                } else {
                  setProductDropdownOpen(false);
                  setActiveSection(item.id);
                }
              }}
              hasDropdown={item.hasDropdown}
              dropdownItems={item.dropdownItems}
              onDropdownClick={(id) => setActiveSection(id)}
              productDropdownOpen={productDropdownOpen}
              setProductDropdownOpen={setProductDropdownOpen}
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


