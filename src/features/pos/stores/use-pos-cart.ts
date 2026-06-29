import { create } from 'zustand';
import { Product } from '@/features/inventory/api/inventory-api';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface PosCartState {
  cartItems: CartItem[];
  discount: number;
  taxRate: number;
  customerId: string | null;
  paymentType: 'cash' | 'due' | 'partial' | 'mobile_banking';
  cashReceived: number;

  // Actions
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  updatePrice: (productId: string, price: number) => void;
  setDiscount: (discount: number) => void;
  setTaxRate: (taxRate: number) => void;
  setCustomerId: (customerId: string | null) => void;
  setPaymentType: (type: 'cash' | 'due' | 'partial' | 'mobile_banking') => void;
  setCashReceived: (amount: number) => void;
  clearCart: () => void;
}

export const usePosCartStore = create<PosCartState>()((set) => ({
  cartItems: [],
  discount: 0,
  taxRate: 0,
  customerId: null,
  paymentType: 'cash',
  cashReceived: 0,

  addToCart: (product) => {
    set((state) => {
      const existingIdx = state.cartItems.findIndex((item) => item.product.id === product.id);

      const nextCart = [...state.cartItems];
      if (existingIdx > -1) {
        const currentQty = nextCart[existingIdx].quantity;
        if (currentQty < product.stockCount) {
          nextCart[existingIdx] = {
            ...nextCart[existingIdx],
            quantity: currentQty + 1,
          };
        }
      } else {
        if (product.stockCount > 0) {
          nextCart.push({ product, quantity: 1 });
        }
      }

      return { cartItems: nextCart };
    });
  },

  removeFromCart: (productId) => {
    set((state) => ({
      cartItems: state.cartItems.filter((item) => item.product.id !== productId),
    }));
  },

  updateQuantity: (productId, quantity) => {
    set((state) => {
      const nextCart = state.cartItems.map((item) => {
        if (item.product.id === productId) {
          const boundedQty = Math.max(1, Math.min(quantity, item.product.stockCount));
          return { ...item, quantity: boundedQty };
        }
        return item;
      });
      return { cartItems: nextCart };
    });
  },

  updatePrice: (productId, price) => {
    set((state) => {
      const nextCart = state.cartItems.map((item) => {
        if (item.product.id === productId) {
          return { ...item, product: { ...item.product, price: Math.max(0, price) } };
        }
        return item;
      });
      return { cartItems: nextCart };
    });
  },

  setDiscount: (discount) => set({ discount: Math.max(0, discount) }),

  setTaxRate: (taxRate) => set({ taxRate: Math.max(0, taxRate) }),

  setCustomerId: (customerId) => set({ customerId }),

  setPaymentType: (paymentType) => {
    set((state) => {
      const newState: Partial<PosCartState> = { paymentType };
      return newState;
    });
  },

  setCashReceived: (cashReceived) => set({ cashReceived: Math.max(0, cashReceived) }),

  clearCart: () =>
    set({
      cartItems: [],
      discount: 0,
      taxRate: 0,
      customerId: null,
      paymentType: 'cash',
      cashReceived: 0,
    }),
}));
