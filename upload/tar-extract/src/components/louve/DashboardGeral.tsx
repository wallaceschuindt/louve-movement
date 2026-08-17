'use client';

import { useState, useRef } from 'react';
import { useLouveStore } from '@/store/louve-store';
import {
  DollarSign,
  Wallet,
  Shirt,
  PackageSearch,
  BarChart3,
  PieChartIcon,
  Download,
  Layers,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { exportDashboardPDF } from '@/lib/export-pdf';
import html2canvas from 'html2canvas';
import type { SaleRecord } from '@/types/louve';

const PIE_COLORS = ['#d97706', '#10b981'];

export function DashboardGeral() {
  const { products, sales, otherProducts, otherSales, settings } = useLouveStore();
  const [mounted, setMounted] = useState(false);
  const barChartRef = useRef<HTMLDivElement>(null);
  const pieChartRef = useRef<HTMLDivElement>(null);

  const isClient = typeof window !== 'undefined';
  if (!mounted && isClient) {
    setTimeout(() => setMounted(true), 0);
  }

  /* ── Camisas KPIs ── */
  const camisasGross = sales.reduce((s, x) => s + x.total, 0);
  const camisasCost = sales.reduce((s, x) => s + x.totalCost, 0);
  const camisasProfit = camisasGross - camisasCost;

  /* ── Outros KPIs ── */
  const outrosGross = otherSales.reduce((s, x) => s + x.total, 0);
  const outrosCost = otherSales.reduce((s, x) => s + x.totalCost, 0);
  const outrosProfit = outrosGross - outrosCost;

  /* ── Combined ── */
  const totalGross = camisasGross + outrosGross;
  const totalProfit = camisasProfit + outrosProfit;
  const margin = totalGross > 0 ? ((totalProfit / totalGross) * 100).toFixed(1) : '0';

  let totalPieces = 0;
  let camisasStockVal = 0;
  products.forEach((p) => {
    const count = p.sizes.P + p.sizes.M + p.sizes.G + p.sizes.GG;
    totalPieces += count;
    camisasStockVal += count * p.cost;
  });

  let totalOtherUnits = 0;
  let outrosStockVal = 0;
  otherProducts.forEach((p) => {
    totalOtherUnits += p.stock;
    outrosStockVal += p.stock * p.cost;
  });

  /* ── Charts ── */
  const barData = [
    { name: 'Camisas', Faturamento: camisasGross, Lucro: camisasProfit },
    { name: 'Outros', Faturamento: outrosGross, Lucro: outrosProfit },
  ];

  const pieData = [
    { name: 'Camisas', value: camisasGross },
    { name: 'Outros', value: outrosGross },
  ];

  /* ── Combined recent sales (both types) ── */
  const allSales: Array<{ id: string; date: string; client: { name: string; phone: string; email: string }; items: Array<{ qty: number }>; total: number; type: string }> = [];
  sales.forEach((s) => {
    allSales.push({ ...s, type: 'Camisa' });
  });
  otherSales.forEach((s) => {
    allSales.push({ ...s, type: 'Outro' });
  });
  allSales.sort((a, b) => b.date.localeCompare(a.date));
  const recentSales = allSales.slice(0, 8);

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
          { label: 'Faturamento Total', value: 'R$ ' + totalGross.toFixed(2), sub: (sales.length + otherSales.length) + ' vendas realizadas', color: '#fffbeb' },
          { label: 'Lucro Liquido', value: 'R$ ' + totalProfit.toFixed(2), sub: 'Margem: ' + margin + '%', color: '#ecfdf5' },
          { label: 'Total Pecas (Camisas)', value: totalPieces + ' un', sub: products.length + ' modelos', color: '#eff6ff' },
          { label: 'Total Unidades (Outros)', value: totalOtherUnits + ' un', sub: otherProducts.length + ' produtos', color: '#fdf2f8' },
          { label: 'Patrimonio Estoque Camisas', value: 'R$ ' + camisasStockVal.toFixed(2), sub: 'Custo acumulado', color: '#f0fdf4' },
          { label: 'Patrimonio Estoque Outros', value: 'R$ ' + outrosStockVal.toFixed(2), sub: 'Custo acumulado', color: '#fef3c7' },
        ],
        chartImgBar,
        chartImgPie,
        sales.slice(0, 10) as SaleRecord[],
        'Dashboard Geral - Relatorio'
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
          <h2 className="text-lg font-bold text-slate-800">Dashboard Geral</h2>
          <p className="text-xs text-slate-500">Visao consolidada de Camisas e Outros Produtos</p>
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
          label="Faturamento Total"
          value={"R$ " + totalGross.toFixed(2)}
          sub={(sales.length + otherSales.length) + " vendas realizadas"}
        />
        <KPICard
          icon={<Wallet className="w-6 h-6" />}
          iconBg="bg-emerald-100 text-emerald-600"
          label="Lucro Liquido"
          value={"R$ " + totalProfit.toFixed(2)}
          valueClass="text-emerald-600"
          sub={"Margem: " + margin + "%"}
        />
        <KPICard
          icon={<Shirt className="w-6 h-6" />}
          iconBg="bg-blue-100 text-blue-600"
          label="Total Pecas (Camisas)"
          value={totalPieces + " un"}
          sub={products.length + " modelos cadastrados"}
        />
        <KPICard
          icon={<Layers className="w-6 h-6" />}
          iconBg="bg-pink-100 text-pink-600"
          label="Total Unidades (Outros)"
          value={totalOtherUnits + " un"}
          sub={otherProducts.length + " produtos cadastrados"}
        />
        <KPICard
          icon={<PackageSearch className="w-6 h-6" />}
          iconBg="bg-green-100 text-green-600"
          label="Patrimonio Estoque Camisas"
          value={"R$ " + camisasStockVal.toFixed(2)}
          sub="Custo acumulado"
        />
        <KPICard
          icon={<TrendingUp className="w-6 h-6" />}
          iconBg="bg-orange-100 text-orange-600"
          label="Patrimonio Estoque Outros"
          value={"R$ " + outrosStockVal.toFixed(2)}
          sub="Custo acumulado"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm" ref={barChartRef}>
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-amber-500" /> Faturamento Camisas vs Outros
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value: number) => "R$ " + value.toFixed(2)} contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
                <Bar dataKey="Faturamento" fill="#d97706" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Lucro" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm" ref={pieChartRef}>
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <PieChartIcon className="w-4 h-4 text-amber-500" /> Distribuicao por Categoria
          </h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={4} dataKey="value" label={({ name, percent }) => name + " " + (percent * 100).toFixed(0) + "%"}>
                  {pieData.map((_, index) => (
                    <Cell key={"cell-" + index} fill={PIE_COLORS[index]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip formatter={(value: number, name: string) => ["R$ " + value.toFixed(2), name]} contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Sales - Both */}
      {recentSales.length > 0 && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-4">Vendas Recentes (Todas as Categorias)</h3>
          <div className="max-h-96 overflow-y-auto space-y-2">
            {recentSales.map((s) => {
              const totalQty = s.items.reduce((sum, i) => sum + i.qty, 0);
              return (
                <div key={s.id + s.type} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className={"inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold " + (s.type === 'Camisa' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700')}>
                      {s.type}
                    </span>
                    <div>
                      <span className="font-bold text-slate-800 text-sm font-mono">{s.id}</span>
                      <span className="text-slate-400 text-xs ml-2">{s.date}</span>
                      <p className="text-xs text-slate-500 mt-0.5">{s.client.name} - {totalQty} {s.type === 'Camisa' ? 'peca(s)' : 'unidade(s)'}</p>
                    </div>
                  </div>
                  <span className="font-bold text-slate-900">R$ {s.total.toFixed(2)}</span>
                </div>
              );
            })}
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
