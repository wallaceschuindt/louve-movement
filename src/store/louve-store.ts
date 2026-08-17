'use client';

import { create } from 'zustand';
import type { Product, SaleRecord, CartItem, AppSettings, TabId } from '@/types/louve';

const STORAGE_KEY = 'LOUVE_MOVEMENT_DATA';

interface LouveState {
  isLoggedIn: boolean;
  activeTab: TabId;
  settings: AppSettings;
  products: Product[];
  sales: SaleRecord[];
  currentCart: CartItem[];
  productModalOpen: boolean;
  romaneioModalOpen: boolean;
  editingProductId: string | null;
  password: string;

  login: (email: string, pass: string) => boolean;
  changePassword: (oldPass: string, newPass: string) => boolean;
  logout: () => void;
  setActiveTab: (tab: TabId) => void;
  setSettings: (settings: Partial<AppSettings>) => void;
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  addToCart: (item: CartItem) => void;
  removeFromCart: (index: number) => void;
  updateCartItemQty: (index: number, qty: number) => void;
  clearCart: () => void;
  finalizeSale: (sale: SaleRecord) => void;
  openProductModal: (productId?: string) => void;
  closeProductModal: () => void;
  openRomaneioModal: () => void;
  closeRomaneioModal: () => void;
  adjustStock: (productId: string, size: 'P' | 'M' | 'G' | 'GG', qty: number) => void;
  exportData: () => string;
  importData: (json: string) => void;
}

const defaultSettings: AppSettings = {
  brandName: 'Louve Movement',
  brandSubtitle: 'Controle Financeiro e de Estoque',
  brandLogo: null,
  pixKey: 'financeiro@louvemovement.com',
};

const seedProducts: Product[] = [
  {
    id: 'prod_1',
    code: 'LM-ST-01',
    name: 'Camisa Oversized Lion of Judah',
    print: 'Leao de Juda Floral Costas',
    color: 'Preto Mineral',
    cost: 38.0,
    price: 99.9,
    minStock: 6,
    sizes: { P: 5, M: 8, G: 12, GG: 4 },
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=300&auto=format&fit=crop&q=60',
  },
  {
    id: 'prod_2',
    code: 'LM-ST-02',
    name: 'Camisa Minimalist Grace',
    print: 'Graca Sobre Graca Peito',
    color: 'Off-White / Bege',
    cost: 34.0,
    price: 89.9,
    minStock: 5,
    sizes: { P: 2, M: 4, G: 3, GG: 1 },
    image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=300&auto=format&fit=crop&q=60',
  },
];

function loadFromStorage() {
  if (typeof window === 'undefined') return null;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

function saveToStorage(state: { settings: AppSettings; products: Product[]; sales: SaleRecord[]; password?: string }) {
  if (typeof window === 'undefined') return;
  try {
    const toSave: Record<string, unknown> = {
      settings: state.settings,
      products: state.products,
      sales: state.sales,
    };
    if (state.password) toSave.password = state.password;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch {
    // storage full
  }
}

export const useLouveStore = create<LouveState>((set, get) => {
  const saved = loadFromStorage();
  const initialState = {
    isLoggedIn: false,
    activeTab: 'dashboard' as TabId,
    settings: saved?.settings || defaultSettings,
    products: saved?.products || seedProducts,
    sales: saved?.sales || [],
    currentCart: [] as CartItem[],
    productModalOpen: false,
    romaneioModalOpen: false,
    editingProductId: null as string | null,
    password: (saved as Record<string, unknown>)?.password as string || '123456',
  };

  if (!saved) {
    saveToStorage(initialState);
  }

  return {
    ...initialState,

    login: (email, pass) => {
      const s = get();
      if (email === 'islainefloth@hotmail.com' && pass === s.password) {
        set({ isLoggedIn: true });
        return true;
      }
      return false;
    },

    changePassword: (oldPass, newPass) => {
      const s = get();
      if (oldPass !== s.password) return false;
      set({ password: newPass });
      saveToStorage({ ...s, password: newPass });
      return true;
    },

    logout: () => set({ isLoggedIn: false }),
    setActiveTab: (tab) => set({ activeTab: tab }),

    setSettings: (newSettings) =>
      set((s) => {
        const updated = { settings: { ...s.settings, ...newSettings } };
        saveToStorage({ ...s, ...updated });
        return updated;
      }),

    addProduct: (product) =>
      set((s) => {
        const products = [...s.products, product];
        saveToStorage({ ...s, products });
        return { products };
      }),

    updateProduct: (product) =>
      set((s) => {
        const products = s.products.map((p) => (p.id === product.id ? product : p));
        saveToStorage({ ...s, products });
        return { products };
      }),

    deleteProduct: (id) =>
      set((s) => {
        const products = s.products.filter((p) => p.id !== id);
        saveToStorage({ ...s, products });
        return { products };
      }),

    addToCart: (item) =>
      set((s) => {
        const existing = s.currentCart.findIndex(
          (c) => c.productId === item.productId && c.size === item.size
        );
        if (existing >= 0) {
          const updated = [...s.currentCart];
          updated[existing] = { ...updated[existing], qty: updated[existing].qty + item.qty };
          return { currentCart: updated };
        }
        return { currentCart: [...s.currentCart, item] };
      }),

    removeFromCart: (index) =>
      set((s) => ({ currentCart: s.currentCart.filter((_, i) => i !== index) })),

    updateCartItemQty: (index, qty) =>
      set((s) => {
        if (qty <= 0) return { currentCart: s.currentCart.filter((_, i) => i !== index) };
        const updated = [...s.currentCart];
        updated[index] = { ...updated[index], qty };
        return { currentCart: updated };
      }),

    clearCart: () => set({ currentCart: [] }),

    finalizeSale: (sale) =>
      set((s) => {
        const products = s.products.map((p) => {
          const updatedSizes = { ...p.sizes };
          sale.items.forEach((item) => {
            if (item.productId === p.id) {
              updatedSizes[item.size] = Math.max(0, updatedSizes[item.size] - item.qty);
            }
          });
          return { ...p, sizes: updatedSizes };
        });
        const sales = [sale, ...s.sales];
        saveToStorage({ ...s, products, sales });
        return { sales, products, currentCart: [] };
      }),

    openProductModal: (productId) =>
      set({ productModalOpen: true, editingProductId: productId || null }),
    closeProductModal: () =>
      set({ productModalOpen: false, editingProductId: null }),
    openRomaneioModal: () => set({ romaneioModalOpen: true, currentCart: [] }),
    closeRomaneioModal: () => set({ romaneioModalOpen: false, currentCart: [] }),

    adjustStock: (productId, size, qty) =>
      set((s) => {
        const products = s.products.map((p) => {
          if (p.id === productId) {
            return { ...p, sizes: { ...p.sizes, [size]: p.sizes[size] + qty } };
          }
          return p;
        });
        saveToStorage({ ...s, products });
        return { products };
      }),

    exportData: () => {
      const s = get();
      return JSON.stringify({ settings: s.settings, products: s.products, sales: s.sales }, null, 2);
    },

    importData: (json) => {
      try {
        const data = JSON.parse(json);
        set((s) => {
          const updated = {
            settings: data.settings || s.settings,
            products: data.products || s.products,
            sales: data.sales || s.sales,
          };
          saveToStorage({ ...s, ...updated });
          return updated;
        });
      } catch {
        alert('Erro ao importar dados. Arquivo invalido.');
      }
    },
  };
});
