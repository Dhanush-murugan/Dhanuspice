import { create } from "zustand";
import { CartItem, User, Address } from "@/types";

interface AppState {
  // Auth
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;

  // Cart
  cartItems: CartItem[];
  selectedRestaurantId: string | null;
  setSelectedRestaurantId: (id: string | null) => void;
  addToCart: (item: CartItem) => void;
  removeFromCart: (foodId: string) => void;
  updateCartItemQuantity: (foodId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;

  // Coupons
  appliedCoupon: { code: string; discount: number } | null;
  setAppliedCoupon: (coupon: { code: string; discount: number } | null) => void;

  // Address
  selectedAddress: Address | null;
  setSelectedAddress: (address: Address | null) => void;

  // UI
  isLoading: boolean;
  setIsLoading: (value: boolean) => void;
  isDarkMode: boolean;
  setIsDarkMode: (value: boolean) => void;
}

export const useStore = create<AppState>((set) => ({
  // Auth
  user: null,
  setUser: (user) => set({ user }),
  isAuthenticated: false,
  setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),

  // Cart
  cartItems: [],
  cartTotal: 0,
  selectedRestaurantId: null,
  setSelectedRestaurantId: (id) => set({ selectedRestaurantId: id }),
  addToCart: (item) =>
    set((state) => {
      const existingItem = state.cartItems.find((i) => i.foodId === item.foodId);
      const newItems = existingItem
        ? state.cartItems.map((i) =>
            i.foodId === item.foodId
              ? { ...i, quantity: i.quantity + item.quantity }
              : i
          )
        : [...state.cartItems, item];
      const newTotal = newItems.reduce(
        (sum, i) => sum + (Number(i.price) || 0) * (Number(i.quantity) || 1),
        0
      );
      return { cartItems: newItems, cartTotal: newTotal };
    }),
  removeFromCart: (foodId) =>
    set((state) => {
      const newItems = state.cartItems.filter((item) => item.foodId !== foodId);
      const newTotal = newItems.reduce(
        (sum, i) => sum + (Number(i.price) || 0) * (Number(i.quantity) || 1),
        0
      );
      return { cartItems: newItems, cartTotal: newTotal };
    }),
  updateCartItemQuantity: (foodId, quantity) =>
    set((state) => {
      const newItems = state.cartItems.map((item) =>
        item.foodId === foodId ? { ...item, quantity: Math.max(1, quantity) } : item
      );
      const newTotal = newItems.reduce(
        (sum, i) => sum + (Number(i.price) || 0) * (Number(i.quantity) || 1),
        0
      );
      return { cartItems: newItems, cartTotal: newTotal };
    }),
  clearCart: () => set({ cartItems: [], cartTotal: 0, selectedRestaurantId: null, appliedCoupon: null }),

  // Coupons
  appliedCoupon: null,
  setAppliedCoupon: (appliedCoupon) => set({ appliedCoupon }),

  // Address
  selectedAddress: null,
  setSelectedAddress: (address) => set({ selectedAddress: address }),

  // UI
  isLoading: false,
  setIsLoading: (isLoading) => set({ isLoading }),
  isDarkMode: false,
  setIsDarkMode: (isDarkMode) => set({ isDarkMode }),
}));
