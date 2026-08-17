export interface Product {
  id: string;
  code: string;
  name: string;
  print: string;
  color: string;
  cost: number;
  price: number;
  minStock: number;
  sizes: { P: number; M: number; G: number; GG: number };
  image: string;
}

export interface CartItem {
  productId: string;
  name: string;
  code: string;
  print: string;
  color: string;
  size: 'P' | 'M' | 'G' | 'GG';
  price: number;
  cost: number;
  image: string;
}

export interface SaleRecord {
  id: string;
  date: string;
  client: { name: string; phone: string; email: string };
  paymentMethod: string;
  items: CartItem[];
  total: number;
  totalCost: number;
}

export interface AppSettings {
  brandName: string;
  brandSubtitle: string;
  brandLogo: string | null;
  pixKey: string;
}

export type TabId = 'dashboard' | 'produtos' | 'estoque' | 'romaneio' | 'financeiro' | 'configuracoes';
