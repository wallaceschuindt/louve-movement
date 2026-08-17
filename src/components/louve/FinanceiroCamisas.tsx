'use client';

import { useState, useRef } from 'react';
import { useLouveStore } from '@/store/louve-store';
import { TrendingUp, DollarSign, Wallet, Download, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { exportFinancePDF } from '@/lib/export-pdf';

const PAYMENT_COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b'];

export function FinanceiroCamisas() {
  const { sales, settings } = useLouveStore();
  const [mounted, setMounted] = useState(false);
  const [activePeriod, setActivePeriod] = useState('all' as string);
  const monthlyChartRef = useRef<HTMLDivElement>(null);
  const paymentChartRef = useRef<HTMLDivElement>(null);

  const isClient = typeof window !== 'undefined';
  if (!mounted && isClient) {
    setTimeout(() => setMounted(true), 0);
  }

  const filteredSales =
    activePeriod === 'month'
      ? sales.filter((s) => {
          const now = new Date();
          const saleDate = new Date(s.date);
          return saleDate.getMonth() === now.getMonth() && saleDate.getFullYear() === now.getFullYear();
        })
      : sales;

  const totalGross = filteredSales.reduce((s, x) => s + x.total, 0);
  const totalCost = filteredSales.reduce((s, x) => s + x.totalCost, 0);
  const netProfit = totalGross - totalCost;
  const margin = totalGross > 0 ? ((netProfit / totalGross) * 100).toFixed(1) : '0';

  const payData: { name: string; value: number }[] = [];
  const payMap: Record<string, number> = {};
  filteredSales.forEach((s) => {
    payMap[s.paymentMethod] = (payMap[s.paymentMethod] || 0) + s.total;
  });
  Object.entries(payMap).forEach(([k, v]) => payData.push({ name: k, value: v }));

  const monthlyMap: Record<string, { revenue: number; profit: number }> = {};
  sales.forEach((s) => {
    const key = s.date.substring(0, 7);
    if (!monthlyMap[key]) monthlyMap[key] = { revenue: 0, profit: 0 };
    monthlyMap[key].revenue += s.total;
    monthlyMap[key].profit += s.total - s.totalCost;
  });
  const monthlyData = Object.entries(monthlyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => ({ month: k, Receita: v.revenue, Lucro: v.profit }));

  const handleExportPDF = async () => {
    try {
      let chartImgMonthly = '';
      let chartImgPayment = '';
      try {
        if (monthlyChartRef.current) {
          const html2canvas = (await import('html2canvas')).default;
          const canvas = await html2canvas(monthlyChartRef.current, { backgroundColor: '#ffffff', scale: 2 });
          chartImgMonthly = canvas.toDataURL('image/png');
        }
        if (paymentChartRef.current) {
          const html2canvas = (await import('html2canvas')).default;
          const canvas = await html2canvas(paymentChartRef.current, { backgroundColor: '#ffffff', scale: 2 });
          chartImgPayment = canvas.toDataURL('image/png');
        }
      } catch (chartErr) {
        console.error('Erro ao capturar graficos:', chartErr);
      }
      await exportFinancePDF(settings, {
        totalGross,
        totalCost,
        netProfit,
        margin,
        ticketMedio: filteredSales.length > 0 ? totalGross / filteredSales.length : 0,
        salesCount: filteredSales.length,
        chartImgMonthly,
        chartImgPayment,
      }, 'Painel Financeiro - Camisas');
    } catch (err) {
      console.error('Erro ao exportar PDF financeiro:', err);
    }
  };

  if (!mounted) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm animate-pulse h-24" />
          ))}
        </div>
      </div>
    );
  }

  const isAll = activePeriod === 'all';
  const isMonth = activePeriod === 'month';

  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex gap-2">
          <Button
            variant={isAll ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActivePeriod('all')}
            className={"text-xs " + (isAll ? "bg-amber-500 hover:bg-amber-600 text-slate-950" : "")}
          >
            Geral
          </Button>
          <Button
            variant={isMonth ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActivePeriod('month')}
            className={"text-xs " + (isMonth ? "bg-amber-500 hover:bg-amber-600 text-slate-950" : "")}
          >
            Mes Atual
          </Button>
        </div>
        <Button variant="secondary" size="sm" onClick={handleExportPDF} className="gap-2 text-xs">
          <Download className="w-4 h-4" /> Exportar Financeiro PDF
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0"><DollarSign className="w-6 h-6" /></div>
          <div><p className="text-xs text-slate-500 font-medium">Faturamento Bruto</p><h3 className="text-xl font-bold text-slate-900">R$ {totalGross.toFixed(2)}</h3><span className="text-[11px] text-slate-500">{filteredSales.length} vendas</span></div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0"><Wallet className="w-6 h-6" /></div>
          <div><p className="text-xs text-slate-500 font-medium">Lucro Liquido</p><h3 className="text-xl font-bold text-emerald-600">R$ {netProfit.toFixed(2)}</h3><span className="text-[11px] text-slate-500">Margem: {margin}%</span></div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0"><CreditCard className="w-6 h-6" /></div>
          <div><p className="text-xs text-slate-500 font-medium">Ticket Medio</p><h3 className="text-xl font-bold text-slate-900">R$ {filteredSales.length > 0 ? (totalGross / filteredSales.length).toFixed(2) : '0.00'}</h3><span className="text-[11px] text-slate-500">por venda</span></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm" ref={monthlyChartRef}>
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-amber-500" /> Receita Mensal</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData.length > 0 ? monthlyData : [{ month: 'Sem dados', Receita: 0, Lucro: 0 }]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value: number) => 'R$ ' + value.toFixed(2)} contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
                <Line type="monotone" dataKey="Receita" stroke="#d97706" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="Lucro" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm" ref={paymentChartRef}>
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2"><CreditCard className="w-4 h-4 text-amber-500" /> Formas de Pagamento</h3>
          <div className="h-72 flex items-center justify-center">
            {payData.length === 0 ? (
              <p className="text-slate-400 text-sm">Sem dados de pagamento</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={payData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={4} dataKey="value" label={({ name, percent }) => name + ' ' + (percent * 100).toFixed(0) + '%'}>
                    {payData.map((_, index) => (<Cell key={"cell-" + index} fill={PAYMENT_COLORS[index % PAYMENT_COLORS.length]} />))}
                  </Pie>
                  <Legend />
                  <Tooltip formatter={(value: number, name: string) => ['R$ ' + value.toFixed(2), name]} contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 mb-4">Demonstrativo de Resultados (DRE)</h3>
        <div className="space-y-2">
          <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl text-sm"><span className="text-slate-600 font-medium">(+) Receita Bruta de Vendas</span><span className="font-bold text-slate-900">R$ {totalGross.toFixed(2)}</span></div>
          <div className="flex justify-between items-center p-3 bg-rose-50 rounded-xl text-sm"><span className="text-rose-700 font-medium">(-) Custo das Mercadorias Vendidas (CMV)</span><span className="font-bold text-rose-600">- R$ {totalCost.toFixed(2)}</span></div>
          <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-xl text-sm"><span className="text-emerald-700 font-bold">(=) Lucro Liquido Operacional</span><span className="font-extrabold text-emerald-600 text-lg">R$ {netProfit.toFixed(2)}</span></div>
          <div className="flex justify-between items-center p-3 bg-amber-50 rounded-xl text-sm"><span className="text-amber-700 font-medium">Margem Liquida</span><span className="font-bold text-amber-600">{margin}%</span></div>
        </div>
      </div>
    </section>
  );
}
