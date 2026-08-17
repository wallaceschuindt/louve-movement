'use client';

import { useState } from 'react';
import { useLouveStore } from '@/store/louve-store';
import { DollarSign, Wallet, Shirt, PackageSearch, BarChart3, PieChartIcon } from 'lucide-react';
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

const SIZE_COLORS = ['#38bdf8', '#818cf8', '#f59e0b', '#ec4899'];

export function DashboardTab() {
  const { products, sales } = useLouveStore();
  const [mounted, setMounted] = useState(false);

  // Recharts needs client-side rendering
  const isClient = typeof window !== 'undefined';
  if (!mounted && isClient) {
    // This will be called on first client render
    setTimeout(() => setMounted(true), 0);
  }

  const totalGross = sales.reduce((s, x) => s + x.total, 0);
  const totalCost = sales.reduce((s, x) => s + x.totalCost, 0);
  const netProfit = totalGross - totalCost;
  const margin = totalGross > 0 ? ((netProfit / totalGross) * 100).toFixed(1) : '0';

  let totalPieces = 0;
  let totalStockValuation = 0;
  const sizeData = [
    { name: 'P', value: 0 },
    { name: 'M', value: 0 },
    { name: 'G', value: 0 },
    { name: 'GG', value: 0 },
  ];

  products.forEach((p) => {
    const count = p.sizes.P + p.sizes.M + p.sizes.G + p.sizes.GG;
    totalPieces += count;
    totalStockValuation += count * p.cost;
    sizeData[0].value += p.sizes.P;
    sizeData[1].value += p.sizes.M;
    sizeData[2].value += p.sizes.G;
    sizeData[3].value += p.sizes.GG;
  });

  const barData = [
    {
      name: 'Totais',
      'Faturamento Bruto': totalGross,
      'Lucro Líquido': netProfit,
    },
  ];

  if (!mounted) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
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
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          icon={<DollarSign className="w-6 h-6" />}
          iconBg="bg-amber-100 text-amber-600"
          label="Faturamento Total"
          value={`R$ ${totalGross.toFixed(2)}`}
          sub={`${sales.length} vendas realizadas`}
        />
        <KPICard
          icon={<Wallet className="w-6 h-6" />}
          iconBg="bg-emerald-100 text-emerald-600"
          label="Lucro Líquido"
          value={`R$ ${netProfit.toFixed(2)}`}
          valueClass="text-emerald-600"
          sub={`Margem: ${margin}%`}
        />
        <KPICard
          icon={<Shirt className="w-6 h-6" />}
          iconBg="bg-blue-100 text-blue-600"
          label="Peças em Estoque"
          value={`${totalPieces} un`}
          sub={`${products.length} modelos cadastrados`}
        />
        <KPICard
          icon={<PackageSearch className="w-6 h-6" />}
          iconBg="bg-rose-100 text-rose-600"
          label="Patrimônio em Estoque"
          value={`R$ ${totalStockValuation.toFixed(2)}`}
          sub="Custo acumulado"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-amber-500" />
            Faturamento vs Lucro
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(value: number) => `R$ ${value.toFixed(2)}`}
                  contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
                />
                <Bar dataKey="Faturamento Bruto" fill="#d97706" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Lucro Líquido" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <PieChartIcon className="w-4 h-4 text-amber-500" />
            Distribuição por Tamanhos
          </h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sizeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {sizeData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={SIZE_COLORS[index]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip
                  formatter={(value: number, name: string) => [`${value} peças`, name]}
                  contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Sales */}
      {sales.length > 0 && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-4">Últimas Vendas</h3>
          <div className="max-h-64 overflow-y-auto space-y-2">
            {sales.slice(0, 5).map((s) => (
              <div key={s.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <div>
                  <span className="font-bold text-slate-800 text-sm font-mono">{s.id}</span>
                  <span className="text-slate-400 text-xs ml-2">{s.date}</span>
                  <p className="text-xs text-slate-500 mt-0.5">{s.client.name} — {s.items.length} peça(s)</p>
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

function KPICard({
  icon,
  iconBg,
  label,
  value,
  sub,
  valueClass = 'text-slate-900',
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: string;
  sub: string;
  valueClass?: string;
}) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>{icon}</div>
      <div>
        <p className="text-xs text-slate-500 font-medium">{label}</p>
        <h3 className={`text-xl font-bold ${valueClass}`}>{value}</h3>
        <span className="text-[11px] text-slate-500">{sub}</span>
      </div>
    </div>
  );
}
