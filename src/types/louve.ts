export interface Product {
  id: string;
  code: string;
  name: string;
  category: string;
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
  qty: number;
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

export interface OtherProduct {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  cost: number;
  price: number;
  minStock: number;
  stock: number;
  unitType: 'unidade' | 'caixa' | 'kit';
  kitSize: number;
  image: string;
}

export interface OtherCartItem {
  productId: string;
  name: string;
  code: string;
  category: string;
  unitType: 'unidade' | 'caixa' | 'kit';
  qty: number;
  price: number;
  cost: number;
  image: string;
}

export interface OtherSaleRecord {
  id: string;
  date: string;
  client: { name: string; phone: string; email: string };
  paymentMethod: string;
  items: OtherCartItem[];
  total: number;
  totalCost: number;
}

export interface AppSettings {
  brandName: string;
  brandSubtitle: string;
  brandLogo: string | null;
  pixKey: string;
}

export type TabId =
  | 'dashboard-geral'
  | 'dashboard-camisas'
  | 'camisas-grade'
  | 'estoque-camisas'
  | 'romaneio-camisas'
  | 'financeiro-camisas'
  | 'dashboard-outros'
  | 'outros-produtos'
  | 'estoque-produtos'
  | 'romaneio-produtos'
  | 'financeiro-produtos'
  | 'financeiro-geral'
  | 'configuracoes';
