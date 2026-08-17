'use client';

import { useState, useRef } from 'react';
import { useLouveStore } from '@/store/louve-store';
import { DollarSign, Wallet, Layers, PackageSearch, Tag, Box, BarChart3, PieChartIcon, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { exportDashboardPDF } from '@/lib/export-pdf';
import html2canvas from 'html2canvas';
import type { SaleRecord } from '@/types/louve';

const TYPE_COLORS = ['#d97706', '#10b981', '#8b5cf6'];

export function DashboardOutros() {
  const { otherProducts, otherSales, settings } = useLouveStore();
  const [mounted, setMounted] = useState(false);
  const barChartRef = useRef<HTMLDivElement>(null);
  const pieChartRef = useRef<HTMLDivElement>(null);

  const isClient = typeof window !== 'undefined';
  if (!mounted && isClient) {
    setTimeout(() => setMounted(true), 0);
  }

  /* ── KPIs ── */
  const totalGross = otherSales.reduce((s, x) => s + x.total, 0);
  const totalCost = otherSales.reduce((s, x) => s + x.totalCost, 0);
  const netProfit = totalGross - totalCost;
  const margin = totalGross > 0 ? ((netProfit / totalGross) * 100).toFixed(1) : '0';

  let totalStockUnits = 0;
  let stockValuation = 0;
  const categories = new Set<string>();
  const categoryRevenue: Record<string, number> = {};

  otherProducts.forEach((p) => {
    totalStockUnits += p.stock;
    stockValuation += p.stock * p.cost;
    categories.add(p.category);
    if (!categoryRevenue[p.category]) {
      categoryRevenue[p.category] = 0;
    }
  });

  otherSales.forEach((s) => {
    s.items.forEach((item) => {
      if (!categoryRevenue[item.category]) {
        categoryRevenue[item.category] = 0;
      }
      categoryRevenue[item.category] += item.price * item.qty;
    });
  });

  /* ── Unit type distribution ── */
  const typeCount: Record<string, number> = { unidade: 0, caixa: 0, kit: 0 };
  const typeStock: Record<string, number> = { unidade: 0, caixa: 0, kit: 0 };
  otherProducts.forEach((p) => {
    typeCount[p.unitType] = (typeCount[p.unitType] || 0) + 1;
    typeStock[p.unitType] = (typeStock[p.unitType] || 0) + p.stock;
  });

  const pieData = [
    { name: 'Unidade', value: typeStock.unidade },
    { name: 'Caixa', value: typeStock.caixa },
    { name: 'Kit', value: typeStock.kit },
  ].filter((d) => d.value > 0);

  /* ── Bar chart: revenue by category ── */
  const barData = Object.entries(categoryRevenue).map(([cat, rev]) => ({
    name: cat,
    Faturamento: rev,
  }));

  /* ── Export PDF ── */
  const handleExportPDF = async () => {
    let chartImgBar = '';
    let chartImgPie = '';
    try {
      if (barChartRef.current) {
        const canvas = await html2canvas(barChartRef.current, { backgroundColor: '#ffffff', scale: 2 });
        chartImgBar = canvas.toDataURL('image/png');
      }
      if (pieChartRef.current) {
        const canvas = await html2canvas(pieChartRef.current, { backgroundColor: '#ffffff', scale: 2 });
        chartImgPie = canvas.toDataURL('image/png');
      }
    } catch (err) {
      console.error('Erro ao capturar graficos:', err);
    }
    try {
      await exportDashboardPDF(
        settings,
        [
          { label: 'Faturamento Outros', value: 'R$ ' + totalGross.toFixed(2), sub: otherSales.length + ' vendas realizadas', color: '#fffbeb' },
          { label: 'Lucro Outros', value: 'R$ ' + netProfit.toFixed(2), sub: 'Margem: ' + margin + '%', color: '#ecfdf5' },
          { label: 'Total Unidades em Estoque', value: totalStockUnits + ' un', sub: otherProducts.length + ' produtos ativos', color: '#eff6ff' },
          { label: 'Patrimonio Estoque Outros', value: 'R$ ' + stockValuation.toFixed(2), sub: 'Custo acumulado', color: '#fdf2f8' },
          { label: 'Numero de Categorias', value: '' + categories.size, sub: 'Categorias distintas', color: '#f0fdf4' },
          { label: 'Produtos Cadastrados', value: '' + otherProducts.length, sub: 'No catalogo', color: '#fef3c7' },
        ],
        chartImgBar,
        chartImgPie,
        [] as SaleRecord[],
        'Dashboard Outros Produtos - Relatorio'
      );
    } catch (err) {
      console.error('Erro ao exportar PDF:', err);
    }
  };

  if (!mounted) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm animate-pulse">
              <div className="h-16 bg-slate-100 rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Dashboard Outros Produtos</h2>
          <p className="text-xs text-slate-500">Dados exclusivos de outros produtos e acessorios</p>
        </div>
        <Button variant="secondary" size="sm" onClick={handleExportPDF} className="gap-2 text-xs">
          <Download className="w-4 h-4" /> Exportar Dashboard PDF
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <KPICard
          icon={<DollarSign className="w-6 h-6" />}
          iconBg="bg-amber-100 text-amber-600"
          label="Faturamento Outros"
          value={"R$ " + totalGross.toFixed(2)}
          sub={otherSales.length + " vendas realizadas"}
        />
        <KPICard
          icon={<Wallet className="w-6 h-6" />}
          iconBg="bg-emerald-100 text-emerald-600"
          label="Lucro Outros"
          value={"R$ " + netProfit.toFixed(2)}
          valueClass="text-emerald-600"
          sub={"Margem: " + margin + "%"}
        />
        <KPICard
          icon={<Layers className="w-6 h-6" />}
          iconBg="bg-blue-100 text-blue-600"
          label="Total Unidades em Estoque"
          value={totalStockUnits + " un"}
          sub={otherProducts.length + " produtos ativos"}
        />
        <KPICard
          icon={<PackageSearch className="w-6 h-6" />}
          iconBg="bg-pink-100 text-pink-600"
          label="Patrimonio Estoque Outros"
          value={"R$ " + stockValuation.toFixed(2)}
          sub="Custo acumulado"
        />
        <KPICard
          icon={<Tag className="w-6 h-6" />}
          iconBg="bg-green-100 text-green-600"
          label="Numero de Categorias"
          value={"" + categories.size}
          sub="Categorias distintas"
        />
        <KPICard
          icon={<Box className="w-6 h-6" />}
          iconBg="bg-orange-100 text-orange-600"
          label="Produtos Cadastrados"
          value={"" + otherProducts.length}
          sub="No catalogo"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm" ref={barChartRef}>
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-amber-500" /> Faturamento por Categoria
          </h3>
          <div className="h-64">
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(value: number) => "R$ " + value.toFixed(2)} contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
                  <Bar dataKey="Faturamento" fill="#d97706" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">Sem dados de vendas por categoria</div>
            )}
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm" ref={pieChartRef}>
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <PieChartIcon className="w-4 h-4 text-amber-500" /> Distribuicao por Tipo
          </h3>
          <div className="h-64 flex items-center justify-center">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={4} dataKey="value" label={({ name, percent }) => name + " " + (percent * 100).toFixed(0) + "%"}>
                    {pieData.map((_, index) => (
                      <Cell key={"cell-" + index} fill={TYPE_COLORS[index]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip formatter={(value: number, name: string) => [value + " unidades", name]} contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">Sem dados de tipo</div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Sales - Outros */}
      {otherSales.length > 0 && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-4">Vendas Recentes - Outros Produtos</h3>
          <div className="max-h-96 overflow-y-auto space-y-2">
            {otherSales.slice(0, 8).map((s) => (
              <div key={s.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <div>
                  <span className="font-bold text-slate-800 text-sm font-mono">{s.id}</span>
                  <span className="text-slate-400 text-xs ml-2">{s.date}</span>
                  <p className="text-xs text-slate-500 mt-0.5">{s.client.name} - {s.items.reduce((sum, i) => sum + i.qty, 0)} unidade(s)</p>
                </div>
                <span className="font-bold text-slate-900">R$ {s.total.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function KPICard(props: { icon: React.ReactNode; iconBg: string; label: string; value: string; sub: string; valueClass?: string }) {
  const { icon, iconBg, label, value, sub, valueClass } = props;
  const cls = valueClass || 'text-slate-900';
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
      <div className={"w-12 h-12 rounded-xl " + iconBg + " flex items-center justify-center shrink-0"}>{icon}</div>
      <div>
        <p className="text-xs text-slate-500 font-medium">{label}</p>
        <h3 className={"text-xl font-bold " + cls}>{value}</h3>
        <span className="text-[11px] text-slate-500">{sub}</span>
      </div>
    </div>
  );
}
