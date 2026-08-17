import type { Metadata } from "next";
import "./globals.css";
import { getProducts, getOtherProducts } from "@/actions/product.actions";
import { getSales, getOtherSales } from "@/actions/sale.actions";
import { getSettings } from "@/actions/settings.actions";
import { StoreHydrator } from "@/components/louve/StoreHydrator";

export const metadata: Metadata = {
  title: "Louve Movement - Controle Financeiro e de Estoque",
  description: "Sistema de gestao financeira e estoque para vestuario - Louve Movement",
  icons: {
    icon: "/logo.jpeg",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch initial data
  const [products, otherProducts, sales, otherSales, settings] = await Promise.all([
    getProducts(),
    getOtherProducts(),
    getSales(),
    getOtherSales(),
    getSettings()
  ]);

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="antialiased bg-slate-50 text-slate-800">
        <StoreHydrator data={{ products, sales, otherProducts, otherSales, settings }} />
        {children}
      </body>
    </html>
  );
}
