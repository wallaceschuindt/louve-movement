'use client';

import { useEffect, useState } from 'react';
import { useLouveStore } from '@/store/louve-store';
import type { TabId } from '@/types/louve';
import { LoginScreen } from '@/components/louve/LoginScreen';
import { DashboardGeral } from '@/components/louve/DashboardGeral';
import { DashboardCamisas } from '@/components/louve/DashboardCamisas';
import { CamisasGrade } from '@/components/louve/CamisasGrade';
import { EstoqueCamisas } from '@/components/louve/EstoqueCamisas';
import { RomaneioCamisas } from '@/components/louve/RomaneioCamisas';
import { RomaneioCamisasModal } from '@/components/louve/RomaneioCamisasModal';
import { FinanceiroCamisas } from '@/components/louve/FinanceiroCamisas';
import { DashboardOutros } from '@/components/louve/DashboardOutros';
import { OutrosProdutosTab } from '@/components/louve/OutrosProdutosTab';
import { EstoqueProdutosTab } from '@/components/louve/EstoqueProdutosTab';
import { RomaneioProdutosTab } from '@/components/louve/RomaneioProdutosTab';
import { RomaneioProdutosModal } from '@/components/louve/RomaneioProdutosModal';
import { FinanceiroProdutosTab } from '@/components/louve/FinanceiroProdutosTab';
import { FinanceiroGeral } from '@/components/louve/FinanceiroGeral';
import { SettingsTab } from '@/components/louve/SettingsTab';
import {
  LayoutDashboard,
  Shirt,
  Package,
  Boxes,
  Receipt,
  TrendingUp,
  Settings,
  LogOut,
  PlusCircle,
  AlertTriangle,
  Menu,
  X,
  BarChart3,
  DollarSign,
} from 'lucide-react';

interface TabDef {
  id: TabId;
  label: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  group: string;
}

const TAB_GROUPS: { group: string; label: string; tabs: TabDef[] }[] = [
  {
    group: 'geral',
    label: 'GERAL',
    tabs: [
      { id: 'dashboard-geral', label: 'Dashboard Geral', icon: <LayoutDashboard className="w-4 h-4" />, title: 'Dashboard Geral', subtitle: 'Visao unificada de toda a operacao' },
      { id: 'financeiro-geral', label: 'Financeiro GERAL', icon: <DollarSign className="w-4 h-4" />, title: 'Painel Financeiro GERAL', subtitle: 'DRE consolidado de todas as categorias' },
    ],
  },
  {
    group: 'camisas',
    label: 'CAMISAS',
    tabs: [
      { id: 'dashboard-camisas', label: 'Dashboard Camisas', icon: <BarChart3 className="w-4 h-4" />, title: 'Dashboard Camisas', subtitle: 'Metricas e indicadores de camisas' },
      { id: 'camisas-grade', label: 'Camisas e Grade', icon: <Shirt className="w-4 h-4" />, title: 'Camisas e Grade de Tamanhos', subtitle: 'Cadastre e gerencie seus modelos de camisas' },
      { id: 'estoque-camisas', label: 'Estoque Camisas', icon: <Boxes className="w-4 h-4" />, title: 'Estoque Camisas', subtitle: 'Controle de inventario de camisas' },
      { id: 'romaneio-camisas', label: 'Romaneio Vendas Camisas', icon: <Receipt className="w-4 h-4" />, title: 'Romaneio e Vendas Camisas', subtitle: 'PDV e emissao de romaneios de camisas' },
      { id: 'financeiro-camisas', label: 'Financeiro Camisa', icon: <TrendingUp className="w-4 h-4" />, title: 'Painel Financeiro Camisa', subtitle: 'DRE e metricas financeiras de camisas' },
    ],
  },
  {
    group: 'outros',
    label: 'OUTROS PRODUTOS',
    tabs: [
      { id: 'dashboard-outros', label: 'Dashboard Outros', icon: <BarChart3 className="w-4 h-4" />, title: 'Dashboard Outros Produtos', subtitle: 'Metricas de outros produtos' },
      { id: 'outros-produtos', label: 'Outros Produtos', icon: <Package className="w-4 h-4" />, title: 'Outros Produtos', subtitle: 'Cadastro de canecas, canetas, chaveiros e mais' },
      { id: 'estoque-produtos', label: 'Estoque Produtos', icon: <Boxes className="w-4 h-4" />, title: 'Estoque Produtos', subtitle: 'Controle de inventario de outros produtos' },
      { id: 'romaneio-produtos', label: 'Romaneio Produtos', icon: <Receipt className="w-4 h-4" />, title: 'Romaneio de Produtos', subtitle: 'PDV e emissao de romaneios de outros produtos' },
      { id: 'financeiro-produtos', label: 'Financeiro Produtos', icon: <TrendingUp className="w-4 h-4" />, title: 'Painel Financeiro Produtos', subtitle: 'DRE e metricas de outros produtos' },
    ],
  },
  {
    group: 'sistema',
    label: 'SISTEMA',
    tabs: [
      { id: 'configuracoes', label: 'Configuracoes', icon: <Settings className="w-4 h-4" />, title: 'Configuracoes', subtitle: 'Personalize sua marca e dados' },
    ],
  },
];

const ALL_TABS = TAB_GROUPS.flatMap((g) => g.tabs);

export default function HomePage() {
  const { isLoggedIn, logout, activeTab, setActiveTab, openRomaneioModal, openOtherRomaneioModal, products, otherProducts, settings } = useLouveStore();
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

  const currentTab = ALL_TABS.find((t) => t.id === activeTab) || ALL_TABS[0];

  let lowStockCount = 0;
  products.forEach((p) => {
    const total = p.sizes.P + p.sizes.M + p.sizes.G + p.sizes.GG;
    if (total <= (p.minStock || 5)) lowStockCount++;
  });
  otherProducts.forEach((p) => {
    if (p.stock <= p.minStock) lowStockCount++;
  });

  const handleTabChange = (tabId: TabId) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  const renderSidebarNav = (onClose?: () => void) => (
    <>
      {/* Logo */}
      <div className="p-5 flex items-center gap-3 border-b border-slate-800">
        <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center overflow-hidden shrink-0 shadow-md shadow-amber-500/20">
          <img src={settings.brandLogo || '/logo.jpeg'} alt="Logo" className="w-full h-full object-cover" />
        </div>
        <div className="overflow-hidden">
          <h2 className="font-bold text-sm leading-tight truncate text-white">{settings.brandName}</h2>
          <span className="text-[10px] text-amber-400 font-medium tracking-wide uppercase">ERP & Gestao Completa</span>
        </div>
      </div>

      {/* Nav Groups */}
      <nav className="p-3 space-y-4 flex-1 overflow-y-auto">
        {TAB_GROUPS.map((group) => (
          <div key={group.group}>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-1.5">{group.label}</div>
            <div className="space-y-0.5">
              {group.tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => { handleTabChange(tab.id); onClose?.(); }}
                  className={"nav-item w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition cursor-pointer " + (activeTab === tab.id ? 'text-amber-400 bg-slate-800/80' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-300')}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800">
        {lowStockCount > 0 && (
          <div className="mb-3 p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{lowStockCount} item(ns) abaixo do minimo!</span>
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
    </>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard-geral': return <DashboardGeral />;
      case 'dashboard-camisas': return <DashboardCamisas />;
      case 'camisas-grade': return <CamisasGrade />;
      case 'estoque-camisas': return <EstoqueCamisas />;
      case 'romaneio-camisas': return <RomaneioCamisas />;
      case 'financeiro-camisas': return <FinanceiroCamisas />;
      case 'dashboard-outros': return <DashboardOutros />;
      case 'outros-produtos': return <OutrosProdutosTab />;
      case 'estoque-produtos': return <EstoqueProdutosTab />;
      case 'romaneio-produtos': return <RomaneioProdutosTab />;
      case 'financeiro-produtos': return <FinanceiroProdutosTab />;
      case 'financeiro-geral': return <FinanceiroGeral />;
      case 'configuracoes': return <SettingsTab />;
      default: return <DashboardGeral />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-64 bg-slate-900 text-white flex-col justify-between shrink-0 border-r border-slate-800">
        {renderSidebarNav()}
      </aside>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <aside className="relative w-72 h-full bg-slate-900 text-white flex flex-col">
            <div className="p-5 flex items-center justify-between border-b border-slate-800">
              <span className="font-bold text-sm truncate">Menu</span>
              <button onClick={() => setMobileMenuOpen(false)} className="text-slate-400 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            {renderSidebarNav(() => setMobileMenuOpen(false))}
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
          <div className="flex items-center gap-2">
            {lowStockCount > 0 && (
              <span className="hidden sm:flex items-center gap-1 px-3 py-1.5 bg-rose-50 text-rose-600 text-[11px] font-bold rounded-full">
                <AlertTriangle className="w-3.5 h-3.5" /> {lowStockCount} estoque baixo
              </span>
            )}
            <button
              onClick={openRomaneioModal}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold px-3 py-2 rounded-xl shadow-md transition cursor-pointer"
              title="Nova venda de camisas"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden lg:inline">Venda Camisa</span>
            </button>
            <button
              onClick={openOtherRomaneioModal}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-md transition cursor-pointer"
              title="Nova venda de outros produtos"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden lg:inline">Venda Produto</span>
            </button>
          </div>
        </header>

        {/* Tab Content */}
        <div className="p-4 md:p-6 flex-1 overflow-y-auto">
          {renderContent()}
        </div>
      </main>

      {/* Modals */}
      <RomaneioCamisasModal />
      <RomaneioProdutosModal />
    </div>
  );
}
