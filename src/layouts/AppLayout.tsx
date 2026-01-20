import Navbar from "@/components/Navbar.tsx";
import { Outlet } from "react-router-dom";
import Footer from "@/components/Footer.tsx";
export default function AppLayout() {
  return (
    <div>
      <Navbar />
      <Outlet/>
      <Footer />
    </div>
  );
}
