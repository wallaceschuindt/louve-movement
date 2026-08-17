'use client';

import { useState } from 'react';
import { useLouveStore } from '@/store/louve-store';
import { MessageCircle, Eye, Trash2, Printer, Download, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { exportRomaneioPDF, exportAllRomaneiosPDF, sharePDFWhatsApp } from '@/lib/export-pdf';
import type { OtherSaleRecord } from '@/types/louve';

export function RomaneioProdutosTab() {
  const { otherSales, settings, deleteOtherSale, openOtherRomaneioModal } = useLouveStore();
  const [viewSale, setViewSale] = useState<OtherSaleRecord | null>(null);

  const handleWhatsApp = async (s: OtherSaleRecord) => {
    try {
      await sharePDFWhatsApp(settings, s, true);
    } catch (err) {
      console.error('Erro ao enviar WhatsApp:', err);
    }
  };

  const handleExportPDF = async (sale: OtherSaleRecord) => {
    try {
      await exportRomaneioPDF(settings, sale, true);
    } catch (err) {
      console.error(err);
      alert('Erro ao exportar romaneio PDF.');
    }
  };

  const handleExportAllPDF = async () => {
    try {
      await exportAllRomaneiosPDF(settings, otherSales, true, 'Romaneios - Outros Produtos');
    } catch (err) {
      console.error(err);
      alert('Erro ao exportar todos os romaneios PDF.');
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Excluir este romaneio? Esta acao nao pode ser desfeita.')) {
      deleteOtherSale(id);
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <span className="text-xs text-slate-500">{otherSales.length} romaneio(s) emitido(s)</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => openOtherRomaneioModal()}
            className="gap-2 text-xs bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold"
          >
            <Receipt className="w-4 h-4" /> Novo Romaneio
          </Button>
          <Button variant="secondary" size="sm" onClick={handleExportAllPDF} className="gap-2 text-xs">
            <Download className="w-4 h-4" /> Exportar Todos PDF
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-3.5 text-left font-bold text-slate-600">Romaneio</th>
                <th className="p-3.5 text-left font-bold text-slate-600">Data</th>
                <th className="p-3.5 text-left font-bold text-slate-600">Cliente</th>
                <th className="p-3.5 text-left font-bold text-slate-600">Itens</th>
                <th className="p-3.5 text-left font-bold text-slate-600">Pagamento</th>
                <th className="p-3.5 text-right font-bold text-slate-600">Total</th>
                <th className="p-3.5 text-center font-bold text-slate-600">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {otherSales.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    <Receipt className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                    Nenhum romaneio emitido ainda.
                  </td>
                </tr>
              ) : (
                otherSales.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition border-b border-slate-100">
                    <td className="p-3.5 font-bold font-mono text-slate-800">{s.id}</td>
                    <td className="p-3.5 text-slate-500">{s.date}</td>
                    <td className="p-3.5 font-semibold text-slate-800">{s.client.name}</td>
                    <td className="p-3.5">
                      <div className="text-[11px] font-medium text-slate-700">{s.items.reduce((sum, i) => sum + i.qty, 0)} item(ns)</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-xs">
                        {s.items.map((i) => i.name + ' [' + i.category + ' x' + i.qty + ']').join(', ')}
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-semibold text-[10px]">{s.paymentMethod}</span>
                    </td>
                    <td className="p-3.5 text-right font-extrabold text-slate-900">R$ {s.total.toFixed(2)}</td>
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setViewSale(s)}
                          className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg cursor-pointer"
                          title="Visualizar detalhes"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleWhatsApp(s)}
                          className="p-1.5 hover:bg-emerald-50 text-emerald-600 rounded-lg cursor-pointer"
                          title="Enviar via WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleExportPDF(s)}
                          className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg cursor-pointer"
                          title="Gerar PDF"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(s.id)}
                          className="p-1.5 hover:bg-rose-50 text-rose-500 rounded-lg cursor-pointer"
                          title="Excluir romaneio"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={!!viewSale} onOpenChange={(open) => !open && setViewSale(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-800">
              Detalhes do Romaneio {viewSale?.id}
            </DialogTitle>
          </DialogHeader>
          {viewSale && (
            <div className="mt-4 space-y-4">
              <div className="bg-slate-50 rounded-2xl p-4 space-y-2 text-xs">
                <div className="flex justify-between"><span className="text-slate-500">Data:</span><span className="font-bold text-slate-800">{viewSale.date}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Cliente:</span><span className="font-bold text-slate-800">{viewSale.client.name}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">WhatsApp:</span><span className="font-bold text-slate-800">{viewSale.client.phone}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">E-mail:</span><span className="font-bold text-slate-800">{viewSale.client.email}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Pagamento:</span><span className="font-bold text-slate-800">{viewSale.paymentMethod}</span></div>
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <div className="bg-slate-100 p-2.5 text-xs font-bold text-slate-700">Itens do Romaneio</div>
                <div className="divide-y divide-slate-100">
                  {viewSale.items.map((item, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between hover:bg-slate-50 text-xs">
                      <div className="flex items-center gap-3">
                        {item.image ? (
                          <img src={item.image} className="w-10 h-10 rounded-lg object-cover border" alt={item.name} />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center text-slate-400 text-[10px]">SEM FOTO</div>
                        )}
                        <div>
                          <div className="font-bold text-slate-800">{item.name}</div>
                          <div className="text-[10px] text-slate-400">
                            Cat: <span className="font-bold text-amber-600">{item.category}</span> | Qtd: <span className="font-bold">{item.qty} {item.unitType}(s)</span> | R$ {item.price.toFixed(2)} un
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-slate-400">R$ {item.price.toFixed(2)} un</div>
                        <div className="font-bold text-slate-900">R$ {(item.price * item.qty).toFixed(2)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-xs text-amber-900 font-medium">Total do Romaneio:</span>
                  <h3 className="text-2xl font-extrabold text-slate-900">R$ {viewSale.total.toFixed(2)}</h3>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleWhatsApp(viewSale)}
                    className="gap-2 text-xs"
                  >
                    <MessageCircle className="w-4 h-4" /> WhatsApp
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExportPDF(viewSale)}
                    className="gap-2 text-xs"
                  >
                    <Printer className="w-4 h-4" /> PDF
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
