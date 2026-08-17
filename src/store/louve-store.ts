'use client';

import { create } from 'zustand';
import type { Product, SaleRecord, CartItem, OtherProduct, OtherSaleRecord, OtherCartItem, AppSettings, TabId } from '@/types/louve';

const STORAGE_KEY = 'LOUVE_MOVEMENT_DATA';

interface LouveState {
  isLoggedIn: boolean;
  activeTab: TabId;
  settings: AppSettings;
  products: Product[];
  sales: SaleRecord[];
  currentCart: CartItem[];
  otherProducts: OtherProduct[];
  otherSales: OtherSaleRecord[];
  otherCart: OtherCartItem[];
  productModalOpen: boolean;
  otherProductModalOpen: boolean;
  romaneioModalOpen: boolean;
  otherRomaneioModalOpen: boolean;
  editingProductId: string | null;
  editingOtherProductId: string | null;
  password: string;
  editingSaleId: string | null;

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
  addOtherProduct: (product: OtherProduct) => void;
  updateOtherProduct: (product: OtherProduct) => void;
  deleteOtherProduct: (id: string) => void;
  adjustOtherStock: (productId: string, qty: number) => void;
  openOtherProductModal: (productId?: string) => void;
  closeOtherProductModal: () => void;
  addToOtherCart: (item: OtherCartItem) => void;
  removeFromOtherCart: (index: number) => void;
  updateOtherCartItemQty: (index: number, qty: number) => void;
  clearOtherCart: () => void;
  finalizeOtherSale: (sale: OtherSaleRecord) => void;
  openOtherRomaneioModal: () => void;
  closeOtherRomaneioModal: () => void;
  deleteSale: (id: string) => void;
  updateSale: (sale: SaleRecord) => void;
  openRomaneioModalForEdit: (saleId: string) => void;
  deleteOtherSale: (id: string) => void;
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
    category: 'Oversized',
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
    category: 'Slim',
    print: 'Graca Sobre Graca Peito',
    color: 'Off-White / Bege',
    cost: 34.0,
    price: 89.9,
    minStock: 5,
    sizes: { P: 2, M: 4, G: 3, GG: 1 },
    image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=300&auto=format&fit=crop&q=60',
  },
];

const seedOtherProducts: OtherProduct[] = [
  {
    id: 'outro_1',
    code: 'LM-CN-01',
    name: 'Caneca Louve Movement',
    description: 'Caneca ceramica 350ml com logo borda dourada',
    category: 'Caneca',
    cost: 12.0,
    price: 39.9,
    minStock: 10,
    stock: 25,
    unitType: 'unidade',
    kitSize: 1,
    image: '',
  },
  {
    id: 'outro_2',
    code: 'LM-CH-01',
    name: 'Chaveiro Metal Lion',
    description: 'Chaveiro em metal banhado a ouro com logo esmaltado',
    category: 'Chaveiro',
    cost: 8.0,
    price: 24.9,
    minStock: 15,
    stock: 40,
    unitType: 'unidade',
    kitSize: 1,
    image: '',
  },
  {
    id: 'outro_3',
    code: 'LM-CT-01',
    name: 'Caneta Executive Louve',
    description: 'Caneta esferografica premium corpo preto com detalhes dourados',
    category: 'Caneta',
    cost: 5.0,
    price: 19.9,
    minStock: 20,
    stock: 60,
    unitType: 'unidade',
    kitSize: 1,
    image: '',
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

function saveToStorage(state: {
  settings: AppSettings;
  products: Product[];
  sales: SaleRecord[];
  otherProducts: OtherProduct[];
  otherSales: OtherSaleRecord[];
  password?: string;
}) {
  if (typeof window === 'undefined') return;
  try {
    const toSave: Record<string, unknown> = {
      settings: state.settings,
      products: state.products,
      sales: state.sales,
      otherProducts: state.otherProducts,
      otherSales: state.otherSales,
    };
    if (state.password) toSave.password = state.password;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch {
    // storage full
  }
}

export const useLouveStore = create<LouveState>((set, get) => {
  const saved = loadFromStorage();
  const migrateProducts = (prods: Product[]): Product[] =>
    prods.map((p) => (p.category ? p : { ...p, category: 'Oversized' }));
  const initialState = {
    isLoggedIn: false,
    activeTab: 'dashboard-geral' as TabId,
    settings: saved?.settings || defaultSettings,
    products: migrateProducts(saved?.products || seedProducts),
    sales: saved?.sales || [],
    currentCart: [] as CartItem[],
    otherProducts: saved?.otherProducts || seedOtherProducts,
    otherSales: saved?.otherSales || [],
    otherCart: [] as OtherCartItem[],
    productModalOpen: false,
    otherProductModalOpen: false,
    romaneioModalOpen: false,
    otherRomaneioModalOpen: false,
    editingProductId: null as string | null,
    editingOtherProductId: null as string | null,
    editingSaleId: null as string | null,
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
    closeRomaneioModal: () => set({ romaneioModalOpen: false, currentCart: [], editingSaleId: null }),

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

    addOtherProduct: (product) =>
      set((s) => {
        const otherProducts = [...s.otherProducts, product];
        saveToStorage({ ...s, otherProducts });
        return { otherProducts };
      }),

    updateOtherProduct: (product) =>
      set((s) => {
        const otherProducts = s.otherProducts.map((p) => (p.id === product.id ? product : p));
        saveToStorage({ ...s, otherProducts });
        return { otherProducts };
      }),

    deleteOtherProduct: (id) =>
      set((s) => {
        const otherProducts = s.otherProducts.filter((p) => p.id !== id);
        saveToStorage({ ...s, otherProducts });
        return { otherProducts };
      }),

    adjustOtherStock: (productId, qty) =>
      set((s) => {
        const otherProducts = s.otherProducts.map((p) => {
          if (p.id === productId) {
            return { ...p, stock: Math.max(0, p.stock + qty) };
          }
          return p;
        });
        saveToStorage({ ...s, otherProducts });
        return { otherProducts };
      }),

    openOtherProductModal: (productId) =>
      set({ otherProductModalOpen: true, editingOtherProductId: productId || null }),
    closeOtherProductModal: () =>
      set({ otherProductModalOpen: false, editingOtherProductId: null }),

    addToOtherCart: (item) =>
      set((s) => {
        const existing = s.otherCart.findIndex((c) => c.productId === item.productId);
        if (existing >= 0) {
          const updated = [...s.otherCart];
          updated[existing] = { ...updated[existing], qty: updated[existing].qty + item.qty };
          return { otherCart: updated };
        }
        return { otherCart: [...s.otherCart, item] };
      }),

    removeFromOtherCart: (index) =>
      set((s) => ({ otherCart: s.otherCart.filter((_, i) => i !== index) })),

    updateOtherCartItemQty: (index, qty) =>
      set((s) => {
        if (qty <= 0) return { otherCart: s.otherCart.filter((_, i) => i !== index) };
        const updated = [...s.otherCart];
        updated[index] = { ...updated[index], qty };
        return { otherCart: updated };
      }),

    clearOtherCart: () => set({ otherCart: [] }),

    finalizeOtherSale: (sale) =>
      set((s) => {
        const otherProducts = s.otherProducts.map((p) => {
          const soldItem = sale.items.find((i) => i.productId === p.id);
          if (soldItem) {
            return { ...p, stock: Math.max(0, p.stock - soldItem.qty) };
          }
          return p;
        });
        const otherSales = [sale, ...s.otherSales];
        saveToStorage({ ...s, otherProducts, otherSales });
        return { otherSales, otherProducts, otherCart: [] };
      }),

    openOtherRomaneioModal: () => set({ otherRomaneioModalOpen: true, otherCart: [] }),
    closeOtherRomaneioModal: () => set({ otherRomaneioModalOpen: false, otherCart: [] }),

    deleteSale: (id) =>
      set((s) => {
        const sales = s.sales.filter((sale) => sale.id !== id);
        saveToStorage({ ...s, sales });
        return { sales };
      }),

    updateSale: (updatedSale) =>
      set((s) => {
        const oldSale = s.sales.find((sale) => sale.id === updatedSale.id);
        if (!oldSale) return s;
        const stockDiff: Record<string, Record<string, number>> = {};
        oldSale.items.forEach((item) => {
          if (!stockDiff[item.productId]) stockDiff[item.productId] = {};
          if (!stockDiff[item.productId][item.size]) stockDiff[item.productId][item.size] = 0;
          stockDiff[item.productId][item.size] += item.qty;
        });
        updatedSale.items.forEach((item) => {
          if (!stockDiff[item.productId]) stockDiff[item.productId] = {};
          if (!stockDiff[item.productId][item.size]) stockDiff[item.productId][item.size] = 0;
          stockDiff[item.productId][item.size] -= item.qty;
        });
        const products = s.products.map((p) => {
          const diff = stockDiff[p.id];
          if (!diff) return p;
          const updatedSizes = { ...p.sizes };
          for (const size of ['P', 'M', 'G', 'GG'] as const) {
            if (diff[size]) {
              updatedSizes[size] = Math.max(0, updatedSizes[size] + diff[size]);
            }
          }
          return { ...p, sizes: updatedSizes };
        });
        const sales = s.sales.map((sale) => (sale.id === updatedSale.id ? updatedSale : sale));
        saveToStorage({ ...s, products, sales });
        return { sales, products, editingSaleId: null, currentCart: [] };
      }),

    openRomaneioModalForEdit: (saleId) =>
      set((s) => {
        const sale = s.sales.find((sale) => sale.id === saleId);
        if (!sale) return s;
        const cart: CartItem[] = sale.items.map((item) => ({ ...item }));
        return { romaneioModalOpen: true, editingSaleId: saleId, currentCart: cart };
      }),

    deleteOtherSale: (id) =>
      set((s) => {
        const otherSales = s.otherSales.filter((sale) => sale.id !== id);
        saveToStorage({ ...s, otherSales });
        return { otherSales };
      }),

    exportData: () => {
      const s = get();
      return JSON.stringify({
        settings: s.settings,
        products: s.products,
        sales: s.sales,
        otherProducts: s.otherProducts,
        otherSales: s.otherSales,
      }, null, 2);
    },

    importData: (json) => {
      try {
        const data = JSON.parse(json);
        set((s) => {
          const updated = {
            settings: data.settings || s.settings,
            products: data.products || s.products,
            sales: data.sales || s.sales,
            otherProducts: data.otherProducts || s.otherProducts,
            otherSales: data.otherSales || s.otherSales,
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
