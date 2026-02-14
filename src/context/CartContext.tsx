import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";

export type CartItem = {
  id: number;
  name: string;
  price: string;
  image: string;
  quantity: number;
  // Id nội bộ trong FE (dùng cho key & localStorage)
  // Ngoài ra lưu thêm id thật từ backend:
  productId: string;
  // Optional: real variant id from backend, used when creating orders.
  variantId: string;
};

type CartContextType = {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">, quantity: number) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "greenspace_cart_items";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      return stored ? (JSON.parse(stored) as CartItem[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addToCart = (item: Omit<CartItem, "quantity">, quantity: number) => {
    if (!item.variantId) {
      throw new Error("Không thể thêm sản phẩm khi chưa có variantId");
    }

    setItems((prev) => {
      const existing = prev.find(
        (i) => i.id === item.id && i.variantId === item.variantId
      );

      if (existing) {
        return prev.map((i) =>
          i.id === item.id && i.variantId === item.variantId
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }

      return [...prev, { ...item, quantity }];
    });
  };


  const removeFromCart = (id: number) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) return removeFromCart(id);
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity } : i)),
    );
  };

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const getTotalItems = () =>
    items.reduce((total, item) => total + item.quantity, 0);

  const getTotalPrice = () =>
    items.reduce((total, item) => {
      const price =
        Number(item.price.replace(/[^.\d]/g, "").replace(/\./g, "")) || 0;
      return total + price * item.quantity;
    }, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalItems,
        getTotalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
