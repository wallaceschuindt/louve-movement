'use client';

import { useState } from 'react';
import { useLouveStore } from '@/store/louve-store';
import { AlertCircle, PlusCircle, Download, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { exportOtherStockPDF } from '@/lib/export-pdf';

export function EstoqueProdutosTab() {
  const { otherProducts, adjustOtherStock, settings } = useLouveStore();
  const [filter, setFilter] = useState<'all' | 'low'>('all');
  const [adjustModal, setAdjustModal] = useState<{ open: boolean; productId: string | null }>({
    open: false,
    productId: null,
  });
  const [adjustQty, setAdjustQty] = useState('');

  let lowStockCounter = 0;
  const filtered = otherProducts.filter((p) => {
    const isLow = p.stock <= p.minStock;
    if (isLow) lowStockCounter++;
    if (filter === 'low' && !isLow) return false;
    return true;
  });

  const handleAdjust = () => {
    const qty = parseInt(adjustQty);
    if (isNaN(qty) || qty <= 0 || !adjustModal.productId) return;
    adjustOtherStock(adjustModal.productId, qty);
    setAdjustModal({ open: false, productId: null });
    setAdjustQty('');
  };

  const handleExportPDF = async () => {
    try {
      await exportOtherStockPDF(settings, otherProducts);
    } catch (err) {
      console.error(err);
      alert('Erro ao exportar inventario PDF.');
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Filter className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'all' | 'low')}
              className="text-xs bg-white border border-slate-200 rounded-xl pl-9 pr-8 py-2.5 focus:outline-none focus:border-amber-500 shadow-sm appearance-none cursor-pointer"
            >
              <option value="all">Todos os Produtos</option>
              <option value="low">Apenas Estoque Baixo</option>
            </select>
          </div>
          <span className="text-xs text-slate-500">
            {lowStockCounter} produto(s) abaixo do minimo
          </span>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleExportPDF}
          className="gap-2 text-xs"
        >
          <Download className="w-4 h-4" /> Exportar Inventario PDF
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-3.5 text-left font-bold text-slate-600">Produto</th>
                <th className="p-3.5 text-center font-bold text-slate-600">Codigo</th>
                <th className="p-3.5 text-center font-bold text-slate-600">Categoria</th>
                <th className="p-3.5 text-center font-bold text-slate-600">Tipo</th>
                <th className="p-3.5 text-center font-bold text-slate-600">Estoque</th>
                <th className="p-3.5 text-center font-bold text-slate-600">Min.</th>
                <th className="p-3.5 text-right font-bold text-slate-600">Preco</th>
                <th className="p-3.5 text-center font-bold text-slate-600">Status</th>
                <th className="p-3.5 text-center font-bold text-slate-600">Acao</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400">
                    Nenhum produto encontrado.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const isLow = p.stock <= p.minStock;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50 transition border-b border-slate-100">
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          {p.image ? (
                            <img src={p.image} className="w-10 h-10 object-cover rounded-xl border border-slate-200" alt={p.name} />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 text-[10px]">SEM FOTO</div>
                          )}
                          <div className="font-bold text-slate-800">{p.name}</div>
                        </div>
                      </td>
                      <td className="p-3.5 text-center font-mono text-slate-500">{p.code}</td>
                      <td className="p-3.5 text-center">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-semibold text-[10px]">{p.category}</span>
                      </td>
                      <td className="p-3.5 text-center text-slate-500">{p.unitType}</td>
                      <td className="p-3.5 text-center">
                        <span className={'text-xs font-extrabold ' + (isLow ? 'text-rose-600' : 'text-slate-800')}>{p.stock}</span>
                        <span className="text-[10px] text-slate-400 ml-0.5">{p.unitType}(s)</span>
                      </td>
                      <td className="p-3.5 text-center text-slate-500 font-medium">{p.minStock}</td>
                      <td className="p-3.5 text-right font-bold text-slate-900">R$ {p.price.toFixed(2)}</td>
                      <td className="p-3.5 text-center">
                        {isLow ? (
                          <span className="px-2.5 py-1 bg-rose-100 text-rose-700 text-[10px] font-bold rounded-full inline-flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> Estoque Baixo
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full">Normal</span>
                        )}
                      </td>
                      <td className="p-3.5 text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setAdjustModal({ open: true, productId: p.id });
                          }}
                          className="text-[11px] font-semibold gap-1"
                        >
                          <PlusCircle className="w-3.5 h-3.5" /> Repor
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog
        open={adjustModal.open}
        onOpenChange={(open) => !open && setAdjustModal({ open: false, productId: null })}
      >
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-sm">Repor Estoque</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <Label className="text-xs font-bold text-slate-600">Quantidade a adicionar</Label>
            <Input
              type="number"
              value={adjustQty}
              onChange={(e) => setAdjustQty(e.target.value)}
              placeholder="Ex: 10"
              className="text-sm"
              min="1"
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setAdjustModal({ open: false, productId: null })}>
                Cancelar
              </Button>
              <Button size="sm" onClick={handleAdjust} className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold">
                Confirmar Reposicao
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
