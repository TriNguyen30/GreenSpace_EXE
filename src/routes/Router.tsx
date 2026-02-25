import { Route, Routes } from "react-router-dom";
import AppLayout from "@/layouts/AppLayout";
import Home from "@/pages/Home";
import Contact from "@/pages/Contact";
import Product from "@/pages/Product";
import ProductDetail from "@/pages/ProductDetail";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import ProtectedRoute from "./ProtectedRoute";
import AdminDashboard from "@/pages/AdminDashboard";
import CategoryManagement from "@/pages/CategoryManagement";
import ProductManagement from "@/pages/ProductManagement";
import UserManagement from "@/pages/UserManagement";
import ForgotPassword from "@/pages/ForgotPassword";
import OrderList from "@/pages/OrderList";
import OrderDetail from "@/pages/OrderDetail";
import PaymentResult from "@/pages/PaymentResult";
import UserProfile from "@/pages/UserProfile";
import Tips from "@/pages/Tips";
import News from "@/pages/News";
import NewDetail from "@/pages/NewDetail";
// import Loading from "@/components/ui/Loading";
// import { Suspense } from "react";
// import RouteTransition from "./RouteTransition";

export default function AppRoutes() {
  return (
    // <Suspense fallback={<Loading />}>
    // <RouteTransition>
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/product" element={<Product />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/orders" element={<OrderList />} />
        <Route path="/orders/:id" element={<OrderDetail />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/tips" element={<Tips />} />
        <Route path="/news" element={<News />} />
        <Route path="/news/:id" element={<NewDetail />} />
      </Route>
      <Route
        path="/admin"
        element={
          <ProtectedRoute requireAdmin>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/categories"
        element={
          <ProtectedRoute requireAdmin>
            <CategoryManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/products"
        element={
          <ProtectedRoute requireAdmin>
            <ProductManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute requireAdmin>
            <UserManagement />
          </ProtectedRoute>
        }
      />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/payment-result" element={<PaymentResult />} />
    </Routes>
    // </RouteTransition>
    // </Suspense>
  );
}
