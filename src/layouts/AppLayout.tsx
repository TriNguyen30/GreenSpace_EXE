import Home from "@/pages/Home.tsx";
import Navbar from "@/components/Navbar.tsx";
import { Outlet } from "react-router-dom";

export default function AppLayout() {
  return (
    <div>
      <Navbar />
      <Outlet/>
    </div>
  );
}
