import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  discountPrice?: number;
  image: string;
  size?: string;
  color?: string;
  quantity: number;
}

export interface CouponCode {
  code: string;
  discount: number;
  type: 'percentage' | 'fixed';
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  coupon: CouponCode | null;
  
  // Actions
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  applyCoupon: (coupon: CouponCode) => void;
  removeCoupon: () => void;
  
  // Computed
  getSubtotal: () => number;
  getDiscount: () => number;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      coupon: null,

      addItem: (item) => {
        const existingItem = get().items.find(
          (i) => i.productId === item.productId && i.size === item.size && i.color === item.color
        );

        if (existingItem) {
          set((state) => ({
            items: state.items.map((i) =>
              i.id === existingItem.id
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            ),
          }));
        } else {
          set((state) => ({
            items: [...state.items, { ...item, id: crypto.randomUUID() }],
          }));
        }
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },

      updateQuantity: (id, quantity) => {
        if (quantity < 1) {
          get().removeItem(id);
          return;
        }
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, quantity } : item
          ),
        }));
      },

      clearCart: () => {
        set({ items: [], coupon: null });
      },

      toggleCart: () => {
        set((state) => ({ isOpen: !state.isOpen }));
      },

      openCart: () => {
        set({ isOpen: true });
      },

      closeCart: () => {
        set({ isOpen: false });
      },

      applyCoupon: (coupon) => {
        set({ coupon });
      },

      removeCoupon: () => {
        set({ coupon: null });
      },

      getSubtotal: () => {
        return get().items.reduce((total, item) => {
          const price = item.discountPrice ?? item.price;
          return total + price * item.quantity;
        }, 0);
      },

      getDiscount: () => {
        const coupon = get().coupon;
        if (!coupon) return 0;

        const subtotal = get().getSubtotal();
        if (coupon.type === 'percentage') {
          return (subtotal * coupon.discount) / 100;
        }
        return Math.min(coupon.discount, subtotal);
      },

      getTotal: () => {
        return get().getSubtotal() - get().getDiscount();
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'boutique-cart',
      partialize: (state) => ({ items: state.items, coupon: state.coupon }),
    }
  )
);
