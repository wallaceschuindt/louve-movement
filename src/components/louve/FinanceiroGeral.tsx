'use client';

import { useState, useRef, useEffect } from 'react';
import { useLouveStore } from '@/store/louve-store';
import { TrendingUp, DollarSign, Wallet, Download, CreditCard, BarChart3, Percent, Shirt, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { exportFinancePDF } from '@/lib/export-pdf';

const PIE_COLORS = ['#d97706', '#3b82f6'];

export function FinanceiroGeral() {
  const { sales, otherSales, settings } = useLouveStore();
  const [mounted, setMounted] = useState(false);
  const [activePeriod, setActivePeriod] = useState('all' as string);
  const lineChartRef = useRef<HTMLDivElement>(null);
  const pieChartRef = useRef<HTMLDivElement>(null);

  useEffect(function () {
    setMounted(true);
  }, []);

  const filteredCamisas =
    activePeriod === 'month'
      ? sales.filter(function (s) {
          const now = new Date();
          const saleDate = new Date(s.date);
          return saleDate.getMonth() === now.getMonth() && saleDate.getFullYear() === now.getFullYear();
        })
      : sales;

  const filteredOutros =
    activePeriod === 'month'
      ? otherSales.filter(function (s) {
          const now = new Date();
          const saleDate = new Date(s.date);
          return saleDate.getMonth() === now.getMonth() && saleDate.getFullYear() === now.getFullYear();
        })
      : otherSales;

  const totalCamisas = filteredCamisas.reduce(function (s, x) { return s + x.total; }, 0);
  const totalOutros = filteredOutros.reduce(function (s, x) { return s + x.total; }, 0);
  const totalGross = totalCamisas + totalOutros;

  const costCamisas = filteredCamisas.reduce(function (s, x) { return s + x.totalCost; }, 0);
  const costOutros = filteredOutros.reduce(function (s, x) { return s + x.totalCost; }, 0);
  const totalCost = costCamisas + costOutros;

  const netProfit = totalGross - totalCost;
  const margin = totalGross > 0 ? ((netProfit / totalGross) * 100).toFixed(1) : '0';
  const totalCount = filteredCamisas.length + filteredOutros.length;
  const ticketMedio = totalCount > 0 ? totalGross / totalCount : 0;

  const monthlyMap: Record<string, { camisas: number; outros: number }> = {};
  sales.forEach(function (s) {
    const key = s.date.substring(0, 7);
    if (!monthlyMap[key]) monthlyMap[key] = { camisas: 0, outros: 0 };
    monthlyMap[key].camisas += s.total;
  });
  otherSales.forEach(function (s) {
    const key = s.date.substring(0, 7);
    if (!monthlyMap[key]) monthlyMap[key] = { camisas: 0, outros: 0 };
    monthlyMap[key].outros += s.total;
  });
  const monthlyData = Object.entries(monthlyMap)
    .sort(function (a, b) { return a[0].localeCompare(b[0]); })
    .map(function (entry) {
      return {
        month: entry[0],
        'Receita Camisas': entry[1].camisas,
        'Receita Outros': entry[1].outros,
      };
    });

  const pieData = [
    { name: 'Camisas', value: totalCamisas },
    { name: 'Outros Produtos', value: totalOutros },
  ];

  const handleExportPDF = async function () {
    try {
      let chartImgMonthly = '';
      let chartImgPayment = '';
      try {
        if (lineChartRef.current) {
          const html2canvas = (await import('html2canvas')).default;
          const canvasLine = await html2canvas(lineChartRef.current, { backgroundColor: '#ffffff', scale: 2 });
          chartImgMonthly = canvasLine.toDataURL('image/png');
        }
        if (pieChartRef.current) {
          const html2canvasPie = (await import('html2canvas')).default;
          const canvasPie = await html2canvasPie(pieChartRef.current, { backgroundColor: '#ffffff', scale: 2 });
          chartImgPayment = canvasPie.toDataURL('image/png');
        }
      } catch (chartErr) {
        console.error('Erro ao capturar graficos:', chartErr);
      }
      await exportFinancePDF(settings, {
        totalGross: totalGross,
        totalCost: totalCost,
        netProfit: netProfit,
        margin: margin,
        ticketMedio: ticketMedio,
        salesCount: totalCount,
        chartImgMonthly: chartImgMonthly,
        chartImgPayment: chartImgPayment,
      }, 'Painel Financeiro GERAL');
    } catch (err) {
      console.error('Erro ao exportar PDF financeiro geral:', err);
    }
  };

  if (!mounted) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map(function (i) {
            return (
              <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm animate-pulse h-24" />
            );
          })}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map(function (i) {
            return (
              <div key={"mid-" + i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm animate-pulse h-20" />
            );
          })}
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
            onClick={function () { setActivePeriod('all'); }}
            className={"text-xs " + (isAll ? "bg-amber-500 hover:bg-amber-600 text-slate-950" : "")}
          >
            Geral
          </Button>
          <Button
            variant={isMonth ? 'default' : 'outline'}
            size="sm"
            onClick={function () { setActivePeriod('month'); }}
            className={"text-xs " + (isMonth ? "bg-amber-500 hover:bg-amber-600 text-slate-950" : "")}
          >
            Mes Atual
          </Button>
        </div>
        <Button variant="secondary" size="sm" onClick={handleExportPDF} className="gap-2 text-xs">
          <Download className="w-4 h-4" /> Exportar Financeiro PDF
        </Button>
      </div>

      {/* TOP 3 KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Faturamento Total Geral</p>
            <h3 className="text-xl font-bold text-slate-900">R$ {" " + totalGross.toFixed(2)}</h3>
            <span className="text-[11px] text-slate-500">{totalCount + " vendas"}</span>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Lucro Liquido Geral</p>
            <h3 className="text-xl font-bold text-emerald-600">R$ {" " + netProfit.toFixed(2)}</h3>
            <span className="text-[11px] text-slate-500">Camisas + Outros</span>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Ticket Medio Geral</p>
            <h3 className="text-xl font-bold text-slate-900">R$ {" " + ticketMedio.toFixed(2)}</h3>
            <span className="text-[11px] text-slate-500">por venda</span>
          </div>
        </div>
      </div>

      {/* MIDDLE 3 KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-amber-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
            <Shirt className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-medium">Faturamento Camisas</p>
            <h4 className="text-lg font-bold text-amber-600">R$ {" " + totalCamisas.toFixed(2)}</h4>
            <span className="text-[10px] text-slate-400">{filteredCamisas.length + " vendas"}</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-blue-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-medium">Faturamento Outros Produtos</p>
            <h4 className="text-lg font-bold text-blue-600">R$ {" " + totalOutros.toFixed(2)}</h4>
            <span className="text-[10px] text-slate-400">{filteredOutros.length + " vendas"}</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <Percent className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-medium">Margem Geral</p>
            <h4 className="text-lg font-bold text-emerald-600">{margin + "%"}</h4>
            <span className="text-[10px] text-slate-400">lucro / receita</span>
          </div>
        </div>
      </div>

      {/* LINE CHART + PIE CHART */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm" ref={lineChartRef}>
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-500" /> Receita Mensal por Segmento
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData.length > 0 ? monthlyData : [{ month: 'Sem dados', 'Receita Camisas': 0, 'Receita Outros': 0 }]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={function (value: number) { return 'R$ ' + value.toFixed(2); }}
                  contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
                />
                <Legend />
                <Line type="monotone" dataKey="Receita Camisas" stroke="#d97706" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="Receita Outros" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm" ref={pieChartRef}>
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-amber-500" /> Receita por Fonte
          </h3>
          <div className="h-72 flex items-center justify-center">
            {totalGross === 0 ? (
              <p className="text-slate-400 text-sm">Sem dados de receita</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={95}
                    paddingAngle={4}
                    dataKey="value"
                    label={function (entry) { return entry.name + ' ' + ((entry.value / totalGross) * 100).toFixed(0) + '%'; }}
                  >
                    {pieData.map(function (_, index) {
                      return <Cell key={"pie-cell-" + index} fill={PIE_COLORS[index % PIE_COLORS.length]} />;
                    })}
                  </Pie>
                  <Legend />
                  <Tooltip
                    formatter={function (value: number, name: string) { return ['R$ ' + value.toFixed(2), name]; }}
                    contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* DRE TABLE */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 mb-4">Demonstrativo de Resultados (DRE) - Consolidado</h3>
        <div className="space-y-2">
          <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl text-sm">
            <span className="text-slate-600 font-medium">(+) Receita Bruta de Vendas - Camisas</span>
            <span className="font-bold text-amber-600">R$ {totalCamisas.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl text-sm">
            <span className="text-slate-600 font-medium">(+) Receita Bruta de Vendas - Outros Produtos</span>
            <span className="font-bold text-blue-600">R$ {totalOutros.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-slate-100 rounded-xl text-sm">
            <span className="text-slate-700 font-bold">(=) Receita Bruta Total</span>
            <span className="font-bold text-slate-900">R$ {totalGross.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-rose-50 rounded-xl text-sm">
            <span className="text-rose-700 font-medium">(-) CMV - Camisas</span>
            <span className="font-bold text-rose-500">- R$ {costCamisas.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-rose-50 rounded-xl text-sm">
            <span className="text-rose-700 font-medium">(-) CMV - Outros Produtos</span>
            <span className="font-bold text-rose-500">- R$ {costOutros.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-rose-100 rounded-xl text-sm">
            <span className="text-rose-700 font-bold">(-) Custo Total (CMV)</span>
            <span className="font-bold text-rose-600">- R$ {totalCost.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-xl text-sm">
            <span className="text-emerald-700 font-bold">(=) Lucro Liquido Operacional</span>
            <span className="font-extrabold text-emerald-600 text-lg">R$ {netProfit.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-amber-50 rounded-xl text-sm">
            <span className="text-amber-700 font-medium">Margem Liquida</span>
            <span className="font-bold text-amber-600">{margin}%</span>
          </div>
        </div>
      </div>
    </section>
  );
}
