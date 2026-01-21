import { Route, Routes } from "react-router-dom";
import AppLayout from "@/layouts/AppLayout";
import Home from "@/pages/Home";
import Contact from "@/pages/Contact";

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Home />} />
      </Route>
      <Route path="/contact" element={<Contact />} />
    </Routes>
  );
}
