const fs = require('fs');
const path = require('path');

const storePath = path.join(__dirname, 'src', 'store', 'louve-store.ts');
let content = fs.readFileSync(storePath, 'utf-8');

// Add imports
const imports = `
import {
  createProduct, updateProduct as updateProductAction, deleteProduct as deleteProductAction,
  createOtherProduct, updateOtherProduct as updateOtherProductAction, deleteOtherProduct as deleteOtherProductAction
} from '@/actions/product.actions';
import { createSale as createSaleAction, deleteSale as deleteSaleAction, createOtherSale as createOtherSaleAction, deleteOtherSale as deleteOtherSaleAction } from '@/actions/sale.actions';
`;

content = content.replace("import type { Product", imports + "import type { Product");

// Remove saveToStorage calls entirely. We will inject the API calls manually.
content = content.replace(/saveToStorage\([^)]+\);/g, '');

// Now we need to inject the API calls.
// Since it's complex to regex, I will just rewrite the methods.
content = content.replace(/addProduct: \(product\) =>\s+set\(\(s\) => {([^}]+)}\),/g, `addProduct: (product) => {
      set((s) => ({ products: [...s.products, product] }));
      createProduct(product).catch(console.error);
    },`);

content = content.replace(/updateProduct: \(product\) =>\s+set\(\(s\) => {([^}]+)}\),/g, `updateProduct: (product) => {
      set((s) => ({ products: s.products.map((p) => (p.id === product.id ? product : p)) }));
      updateProductAction(product).catch(console.error);
    },`);

content = content.replace(/deleteProduct: \(id\) =>\s+set\(\(s\) => {([^}]+)}\),/g, `deleteProduct: (id) => {
      set((s) => ({ products: s.products.filter((p) => p.id !== id) }));
      deleteProductAction(id).catch(console.error);
    },`);

content = content.replace(/finalizeSale: \(sale\) =>\s+set\(\(s\) => {([\s\S]*?)return { sales, products, currentCart: \[\] };\s+}\),/g, `finalizeSale: (sale) => {
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
        return { sales, products, currentCart: [] };
      });
      createSaleAction(sale).catch(console.error);
    },`);

content = content.replace(/addOtherProduct: \(product\) =>\s+set\(\(s\) => {([^}]+)}\),/g, `addOtherProduct: (product) => {
      set((s) => ({ otherProducts: [...s.otherProducts, product] }));
      createOtherProduct(product).catch(console.error);
    },`);

content = content.replace(/updateOtherProduct: \(product\) =>\s+set\(\(s\) => {([^}]+)}\),/g, `updateOtherProduct: (product) => {
      set((s) => ({ otherProducts: s.otherProducts.map((p) => (p.id === product.id ? product : p)) }));
      updateOtherProductAction(product).catch(console.error);
    },`);

content = content.replace(/deleteOtherProduct: \(id\) =>\s+set\(\(s\) => {([^}]+)}\),/g, `deleteOtherProduct: (id) => {
      set((s) => ({ otherProducts: s.otherProducts.filter((p) => p.id !== id) }));
      deleteOtherProductAction(id).catch(console.error);
    },`);

content = content.replace(/finalizeOtherSale: \(sale\) =>\s+set\(\(s\) => {([\s\S]*?)return { otherSales, otherProducts, otherCart: \[\] };\s+}\),/g, `finalizeOtherSale: (sale) => {
      set((s) => {
        const otherProducts = s.otherProducts.map((p) => {
          const soldItem = sale.items.find((i) => i.productId === p.id);
          if (soldItem) {
            return { ...p, stock: Math.max(0, p.stock - soldItem.qty) };
          }
          return p;
        });
        const otherSales = [sale, ...s.otherSales];
        return { otherSales, otherProducts, otherCart: [] };
      });
      createOtherSaleAction(sale).catch(console.error);
    },`);

content = content.replace(/deleteSale: \(id\) =>\s+set\(\(s\) => {([^}]+)}\),/g, `deleteSale: (id) => {
      set((s) => ({ sales: s.sales.filter((sale) => sale.id !== id) }));
      deleteSaleAction(id).catch(console.error);
    },`);

content = content.replace(/deleteOtherSale: \(id\) =>\s+set\(\(s\) => {([^}]+)}\),/g, `deleteOtherSale: (id) => {
      set((s) => ({ otherSales: s.otherSales.filter((sale) => sale.id !== id) }));
      deleteOtherSaleAction(id).catch(console.error);
    },`);

fs.writeFileSync(storePath, content);
console.log('Store updated');
