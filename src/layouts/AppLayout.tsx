import Navbar from "@/components/ui/Navbar/Navbar";
import { Outlet } from "react-router-dom";
import Footer from "@/components/ui/Footer/Footer";
import { Chatbox } from "@/components/ui/Chatbox";

export default function AppLayout() {
  return (
    <div>
      <Navbar />
      <Outlet />
      <Footer />
      <Chatbox />
    </div>
  );
}
