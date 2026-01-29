import { Route, Routes } from "react-router-dom";
import AppLayout from "@/layouts/AppLayout";
import Home from "@/pages/Home";
import Contact from "@/pages/Contact";
import Product from "@/pages/Product";
import Login from "@/pages/Login";
import Register from "@/pages/Register";

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/product" element={<Product />} />
      </Route>
      <Route path="/contact" element={<Contact />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  );
}
