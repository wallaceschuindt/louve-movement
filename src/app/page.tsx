'use client';

import { useEffect, useState } from 'react';
import { useLouveStore } from '@/store/louve-store';
import type { TabId } from '@/types/louve';
import { LoginScreen } from '@/components/louve/LoginScreen';
import { DashboardTab } from '@/components/louve/DashboardTab';
import { ProductsTab } from '@/components/louve/ProductsTab';
import { StockTab } from '@/components/louve/StockTab';
import { RomaneioTab } from '@/components/louve/RomaneioTab';
import { RomaneioModal } from '@/components/louve/RomaneioModal';
import { FinanceTab } from '@/components/louve/FinanceTab';
import { SettingsTab } from '@/components/louve/SettingsTab';
import {
  LayoutDashboard,
  Shirt,
  Boxes,
  Receipt,
  TrendingUp,
  Settings,
  LogOut,
  PlusCircle,
  AlertTriangle,
  Menu,
  X,
} from 'lucide-react';

const TAB_CONFIG: { id: TabId; label: string; icon: React.ReactNode; title: string; subtitle: string }[] = [
  { id: 'dashboard', label: 'Dashboard Geral', icon: <LayoutDashboard className="w-4 h-4" />, title: 'Dashboard Geral', subtitle: 'Visao integrada do estoque e faturamento' },
  { id: 'produtos', label: 'Produtos & Grade', icon: <Shirt className="w-4 h-4" />, title: 'Produtos & Grade de Tamanhos', subtitle: 'Cadastre e gerencie seus modelos' },
  { id: 'estoque', label: 'Gestao de Estoque', icon: <Boxes className="w-4 h-4" />, title: 'Gestao de Estoque', subtitle: 'Controle de inventario e alertas' },
  { id: 'romaneio', label: 'Romaneio & Vendas', icon: <Receipt className="w-4 h-4" />, title: 'Romaneio & Vendas', subtitle: 'PDV e emissao de comprovantes' },
  { id: 'financeiro', label: 'Painel Financeiro', icon: <TrendingUp className="w-4 h-4" />, title: 'Painel Financeiro', subtitle: 'DRE, graficos e metricas de lucro' },
  { id: 'configuracoes', label: 'Configuracoes & Logo', icon: <Settings className="w-4 h-4" />, title: 'Configuracoes', subtitle: 'Personalize sua marca e dados' },
];

export default function HomePage() {
  const { isLoggedIn, logout, activeTab, setActiveTab, openRomaneioModal, products, settings } = useLouveStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return <LoginScreen />;
  }

  const currentTab = TAB_CONFIG.find((t) => t.id === activeTab) || TAB_CONFIG[0];

  // Low stock count
  let lowStockCount = 0;
  products.forEach((p) => {
    const total = p.sizes.P + p.sizes.M + p.sizes.G + p.sizes.GG;
    if (total <= (p.minStock || 5)) lowStockCount++;
  });

  const handleTabChange = (tabId: TabId) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-64 bg-slate-900 text-white flex-col justify-between shrink-0 border-r border-slate-800">
        <div>
          {/* Logo */}
          <div className="p-5 flex items-center gap-3 border-b border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center overflow-hidden shrink-0 shadow-md shadow-amber-500/20">
              <img src={settings.brandLogo || '/logo.jpeg'} alt="Logo" className="w-full h-full object-cover" />
            </div>
            <div className="overflow-hidden">
              <h2 className="font-bold text-sm leading-tight truncate text-white">{settings.brandName}</h2>
              <span className="text-[10px] text-amber-400 font-medium tracking-wide uppercase">Vestuario & Gestao</span>
            </div>
          </div>

          {/* Nav */}
          <nav className="p-3 space-y-1">
            {TAB_CONFIG.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`nav-item w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer ${
                  activeTab === tab.id
                    ? 'text-amber-400 bg-slate-800/80'
                    : 'text-slate-300 hover:bg-slate-800/60'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800">
          {lowStockCount > 0 && (
            <div className="mb-3 p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{lowStockCount} produto(s) abaixo do minimo!</span>
              </div>
            </div>
          )}
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" /> Encerrar Sessao
          </button>
        </div>
      </aside>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <aside className="relative w-72 h-full bg-slate-900 text-white flex flex-col">
            <div className="p-5 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center overflow-hidden shrink-0">
                  <img src={settings.brandLogo || '/logo.jpeg'} alt="Logo" className="w-full h-full object-cover" />
                </div>
                <span className="font-bold text-sm truncate">{settings.brandName}</span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="text-slate-400 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="p-3 space-y-1 flex-1">
              {TAB_CONFIG.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer ${
                    activeTab === tab.id
                      ? 'text-amber-400 bg-slate-800/80'
                      : 'text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </nav>
            <div className="p-4 border-t border-slate-800">
              <button
                onClick={logout}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" /> Encerrar Sessao
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b border-slate-200 px-4 md:px-6 py-4 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden text-slate-600 cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg md:text-xl font-bold text-slate-800">{currentTab.title}</h1>
              <p className="text-[11px] text-slate-500 hidden sm:block">{currentTab.subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {lowStockCount > 0 && (
              <span className="hidden sm:flex items-center gap-1 px-3 py-1.5 bg-rose-50 text-rose-600 text-[11px] font-bold rounded-full">
                <AlertTriangle className="w-3.5 h-3.5" /> {lowStockCount} estoque baixo
              </span>
            )}
            <button
              onClick={openRomaneioModal}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold px-4 py-2 rounded-xl shadow-md transition cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Nova Venda / Romaneio</span>
              <span className="sm:hidden">Venda</span>
            </button>
          </div>
        </header>

        {/* Tab Content */}
        <div className="p-4 md:p-6 flex-1 overflow-y-auto">
 {activeTab === 'dashboard' && <DashboardTab />}
          {activeTab === 'produtos' && <ProductsTab />}
          {activeTab === 'estoque' && <StockTab />}
          {activeTab === 'romaneio' && <RomaneioTab />}
          {activeTab === 'financeiro' && <FinanceTab />}
          {activeTab === 'configuracoes' && <SettingsTab />}
        </div>
      </main>

      {/* Modals */}
      <RomaneioModal />
    </div>
  );
}
