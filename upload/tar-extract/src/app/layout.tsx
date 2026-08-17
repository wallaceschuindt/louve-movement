import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Louve Movement - Controle Financeiro e de Estoque",
  description: "Sistema de gestao financeira e estoque para vestuario - Louve Movement",
  icons: {
    icon: "/logo.jpeg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="antialiased bg-slate-50 text-slate-800">
        {children}
      </body>
    </html>
  );
}
