import "./App.css";
import AppRoute from "@/routes/Router";
import { BrowserRouter } from "react-router-dom";
import { CartProvider } from "@/context/CartContext";
function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <AppRoute />
      </CartProvider>
    </BrowserRouter>
  );
}

export default App;
