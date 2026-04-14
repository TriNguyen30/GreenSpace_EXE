import "./App.css";
import AppRoute from "@/routes/Router";
import { BrowserRouter } from "react-router-dom";
import { CartProvider } from "@/context/CartContext";
import { SearchProvider } from "@/context/SearchContext";
import { Provider } from "react-redux";
import { store } from "@/store/store.ts";
import { ToastProvider } from "@/components/ui/Toast";

function App() {
  return (
    <SearchProvider>
      <ToastProvider>
      <CartProvider>
        <BrowserRouter>
          <Provider store={store}>
            <AppRoute />
          </Provider>
        </BrowserRouter>
      </CartProvider>
      </ToastProvider>
    </SearchProvider>
  );
}

export default App;
