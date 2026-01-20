import {Route, Routes} from "react-router-dom";
import AppLayout from "@/layouts/AppLayout";
import Home from "@/pages/Home";

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Home />} />
      </Route>
    </Routes>
  );
}

