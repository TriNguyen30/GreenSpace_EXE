import "./App.css";
import AppRoute from "@/routes/Router";
import { BrowserRouter } from "react-router-dom";
import { CartProvider } from "@/context/CartContext";
import { Provider } from "react-redux";
import { store } from "@/store/store.ts";
function App() {
  return (
    <BrowserRouter>
      <Provider store={store}>
        <CartProvider>
          <AppRoute />
        </CartProvider>
      </Provider>
    </BrowserRouter>
  );
}

export default App;
