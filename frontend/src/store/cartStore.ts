import { create } from 'zustand';
import { CartItem, Product, SaleUnit } from '../types';

interface CartStore {
  items: CartItem[];
  addItem: (product: Product, quantity: number, saleUnit: SaleUnit) => void;
  removeItem: (productId: string, saleUnit: SaleUnit) => void;
  updateQuantity: (productId: string, saleUnit: SaleUnit, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],

  addItem: (product: Product, quantity: number, saleUnit: SaleUnit) => {
    const { items } = get();
    const existingItem = items.find((item) => item.productId === product.id && item.saleUnit === saleUnit);

    // Determina o preço baseado no tipo de venda
    const price = saleUnit === 'pacote' ? (product.packagePrice || product.price) : product.price;

    if (existingItem) {
      // Atualiza a quantidade se o item já existe (mesmo produto, mesma unidade)
      set({
        items: items.map((item) =>
          item.productId === product.id && item.saleUnit === saleUnit
            ? {
                ...item,
                quantity: item.quantity + quantity,
                subtotal: (item.quantity + quantity) * item.price,
              }
            : item
        ),
      });
    } else {
      // Adiciona novo item
      const newItem: CartItem = {
        productId: product.id,
        productName: product.name,
        price: price,
        quantity,
        subtotal: price * quantity,
        saleUnit,
      };
      set({ items: [...items, newItem] });
    }
  },

  removeItem: (productId: string, saleUnit: SaleUnit) => {
    set((state) => ({
      items: state.items.filter((item) => !(item.productId === productId && item.saleUnit === saleUnit)),
    }));
  },

  updateQuantity: (productId: string, saleUnit: SaleUnit, quantity: number) => {
    if (quantity <= 0) {
      get().removeItem(productId, saleUnit);
      return;
    }

    set((state) => ({
      items: state.items.map((item) =>
        item.productId === productId && item.saleUnit === saleUnit
          ? {
              ...item,
              quantity,
              subtotal: quantity * item.price,
            }
          : item
      ),
    }));
  },

  clearCart: () => {
    set({ items: [] });
  },

  getTotal: () => {
    const { items } = get();
    return items.reduce((sum, item) => sum + item.subtotal, 0);
  },

  getItemCount: () => {
    const { items } = get();
    return items.reduce((sum, item) => sum + item.quantity, 0);
  },
}));

