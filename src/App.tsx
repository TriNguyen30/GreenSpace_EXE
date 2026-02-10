import "./App.css";
import AppRoute from "@/routes/Router";
import { BrowserRouter } from "react-router-dom";
import { CartProvider } from "@/context/CartContext";
import { SearchProvider } from "@/context/SearchContext";
import { Provider } from "react-redux";
import { store } from "@/store/store.ts";
function App() {
  return (
    <SearchProvider>
      <CartProvider>
        <BrowserRouter>
          <Provider store={store}>
            <AppRoute />
          </Provider>
        </BrowserRouter>
      </CartProvider>
    </SearchProvider>
  );
}

export default App;
