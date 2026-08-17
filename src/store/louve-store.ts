'use client';

import { create } from 'zustand';
import {
  createProduct,
  updateProduct as updateProductAction,
  deleteProduct as deleteProductAction,
  createOtherProduct,
  updateOtherProduct as updateOtherProductAction,
  deleteOtherProduct as deleteOtherProductAction,
  adjustProductStock,
  adjustOtherProductStock,
} from '@/actions/product.actions';
import {
  createSale as createSaleAction,
  deleteSale as deleteSaleAction,
  createOtherSale as createOtherSaleAction,
  deleteOtherSale as deleteOtherSaleAction,
} from '@/actions/sale.actions';
import { updateSettings as updateSettingsAction } from '@/actions/settings.actions';
import type { Product, SaleRecord, CartItem, OtherProduct, OtherSaleRecord, OtherCartItem, AppSettings, TabId } from '@/types/louve';

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
  hydrate: (data: {
    products: Product[];
    sales: SaleRecord[];
    otherProducts: OtherProduct[];
    otherSales: OtherSaleRecord[];
    settings: AppSettings;
  }) => void;
}

const defaultSettings: AppSettings = {
  brandName: 'Louve Movement',
  brandSubtitle: 'Controle Financeiro e de Estoque',
  brandLogo: null,
  pixKey: 'financeiro@louvemovement.com',
};

export const useLouveStore = create<LouveState>((set, get) => {
  const initialState = {
    isLoggedIn: false,
    activeTab: 'dashboard-geral' as TabId,
    settings: defaultSettings,
    products: [] as Product[],
    sales: [] as SaleRecord[],
    currentCart: [] as CartItem[],
    otherProducts: [] as OtherProduct[],
    otherSales: [] as OtherSaleRecord[],
    otherCart: [] as OtherCartItem[],
    productModalOpen: false,
    otherProductModalOpen: false,
    romaneioModalOpen: false,
    otherRomaneioModalOpen: false,
    editingProductId: null as string | null,
    editingOtherProductId: null as string | null,
    editingSaleId: null as string | null,
    password: '123456',
  };

  return {
    ...initialState,

    hydrate: (data) => set({
      products: data.products,
      sales: data.sales,
      otherProducts: data.otherProducts,
      otherSales: data.otherSales,
      settings: data.settings,
    }),

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
      return true;
    },

    logout: () => set({ isLoggedIn: false }),
    setActiveTab: (tab) => set({ activeTab: tab }),

    setSettings: (newSettings) =>
      set((s) => {
        const updated = { settings: { ...s.settings, ...newSettings } };
        updateSettingsAction(newSettings).catch(console.error);
        return updated;
      }),

    // ---- PRODUCTS ----
    addProduct: (product) => {
      // Optimistic update: show in UI immediately
      set((s) => ({ products: [...s.products, product] }));
      // Persist to database
      createProduct(product).catch((err) => {
        console.error('Failed to create product:', err);
      });
    },

    updateProduct: (product) => {
      set((s) => ({ products: s.products.map((p) => (p.id === product.id ? product : p)) }));
      updateProductAction(product).catch((err) => {
        console.error('Failed to update product:', err);
      });
    },

    deleteProduct: (id) => {
      set((s) => ({ products: s.products.filter((p) => p.id !== id) }));
      deleteProductAction(id).catch((err) => {
        console.error('Failed to delete product:', err);
      });
    },

    adjustStock: (productId, size, qty) => {
      set((s) => ({
        products: s.products.map((p) => {
          if (p.id === productId) {
            return { ...p, sizes: { ...p.sizes, [size]: p.sizes[size] + qty } };
          }
          return p;
        }),
      }));
      adjustProductStock(productId, size, qty).catch((err) => {
        console.error('Failed to adjust stock:', err);
      });
    },

    // ---- CART ----
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

    // ---- SALES ----
    finalizeSale: (sale) => {
      // Optimistic update
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
        return { sales: [sale, ...s.sales], products, currentCart: [] };
      });
      // Persist to database
      createSaleAction(sale).catch((err) => {
        console.error('Failed to create sale:', err);
      });
    },

    deleteSale: (id) => {
      set((s) => ({ sales: s.sales.filter((sale) => sale.id !== id) }));
      deleteSaleAction(id).catch((err) => {
        console.error('Failed to delete sale:', err);
      });
    },

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
        return { sales, products, editingSaleId: null, currentCart: [] };
      }),

    openRomaneioModalForEdit: (saleId) =>
      set((s) => {
        const sale = s.sales.find((sale) => sale.id === saleId);
        if (!sale) return s;
        const cart: CartItem[] = sale.items.map((item) => ({ ...item }));
        return { romaneioModalOpen: true, editingSaleId: saleId, currentCart: cart };
      }),

    // ---- MODALS ----
    openProductModal: (productId) =>
      set({ productModalOpen: true, editingProductId: productId || null }),
    closeProductModal: () =>
      set({ productModalOpen: false, editingProductId: null }),
    openRomaneioModal: () => set({ romaneioModalOpen: true, currentCart: [] }),
    closeRomaneioModal: () => set({ romaneioModalOpen: false, currentCart: [], editingSaleId: null }),

    // ---- OTHER PRODUCTS ----
    addOtherProduct: (product) => {
      set((s) => ({ otherProducts: [...s.otherProducts, product] }));
      createOtherProduct(product).catch((err) => {
        console.error('Failed to create other product:', err);
      });
    },

    updateOtherProduct: (product) => {
      set((s) => ({ otherProducts: s.otherProducts.map((p) => (p.id === product.id ? product : p)) }));
      updateOtherProductAction(product).catch((err) => {
        console.error('Failed to update other product:', err);
      });
    },

    deleteOtherProduct: (id) => {
      set((s) => ({ otherProducts: s.otherProducts.filter((p) => p.id !== id) }));
      deleteOtherProductAction(id).catch((err) => {
        console.error('Failed to delete other product:', err);
      });
    },

    adjustOtherStock: (productId, qty) => {
      set((s) => ({
        otherProducts: s.otherProducts.map((p) => {
          if (p.id === productId) {
            return { ...p, stock: Math.max(0, p.stock + qty) };
          }
          return p;
        }),
      }));
      adjustOtherProductStock(productId, qty).catch((err) => {
        console.error('Failed to adjust other stock:', err);
      });
    },

    // ---- OTHER CART ----
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

    // ---- OTHER SALES ----
    finalizeOtherSale: (sale) => {
      set((s) => {
        const otherProducts = s.otherProducts.map((p) => {
          const soldItem = sale.items.find((i) => i.productId === p.id);
          if (soldItem) {
            return { ...p, stock: Math.max(0, p.stock - soldItem.qty) };
          }
          return p;
        });
        return { otherSales: [sale, ...s.otherSales], otherProducts, otherCart: [] };
      });
      createOtherSaleAction(sale).catch((err) => {
        console.error('Failed to create other sale:', err);
      });
    },

    deleteOtherSale: (id) => {
      set((s) => ({ otherSales: s.otherSales.filter((sale) => sale.id !== id) }));
      deleteOtherSaleAction(id).catch((err) => {
        console.error('Failed to delete other sale:', err);
      });
    },

    openOtherProductModal: (productId) =>
      set({ otherProductModalOpen: true, editingOtherProductId: productId || null }),
    closeOtherProductModal: () =>
      set({ otherProductModalOpen: false, editingOtherProductId: null }),
    openOtherRomaneioModal: () => set({ otherRomaneioModalOpen: true, otherCart: [] }),
    closeOtherRomaneioModal: () => set({ otherRomaneioModalOpen: false, otherCart: [] }),

    // ---- EXPORT/IMPORT ----
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
        set((s) => ({
          settings: data.settings || s.settings,
          products: data.products || s.products,
          sales: data.sales || s.sales,
          otherProducts: data.otherProducts || s.otherProducts,
          otherSales: data.otherSales || s.otherSales,
        }));
      } catch {
        alert('Erro ao importar dados. Arquivo invalido.');
      }
    },
  };
});
