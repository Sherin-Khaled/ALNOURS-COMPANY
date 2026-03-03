import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '@shared/schema';

export interface CartItem {
  id: string; // Unique ID for the cart line (productId + size)
  product: Product;
  quantity: number;
  size: string;
}

interface CartStore {
  items: CartItem[];
  addItem: (product: Product, size: string, quantity: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotals: () => { subtotal: number; shipping: number; total: number };
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (product, size, quantity) => {
        set((state) => {
          const id = `${product.id}-${size}`;
          const existing = state.items.find((i) => i.id === id);
          
          if (existing) {
            return {
              items: state.items.map((i) => 
                i.id === id ? { ...i, quantity: i.quantity + quantity } : i
              )
            };
          }
          
          return { items: [...state.items, { id, product, quantity, size }] };
        });
      },
      
      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((i) => i.id !== id)
        }));
      },
      
      updateQuantity: (id, quantity) => {
        if (quantity < 1) return;
        set((state) => ({
          items: state.items.map((i) => 
            i.id === id ? { ...i, quantity } : i
          )
        }));
      },
      
      clearCart: () => set({ items: [] }),
      
      getTotals: () => {
        const { items } = get();
        const subtotal = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
        const shipping = items.length > 0 ? 10 : 0; // Fixed 10 SAR shipping
        return {
          subtotal,
          shipping,
          total: subtotal + shipping
        };
      }
    }),
    { name: 'alnours-cart' }
  )
);
