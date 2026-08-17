'use client';

import { useState } from 'react';
import { useLouveStore } from '@/store/louve-store';
import { Plus, Trash2 } from 'lucide-react';
import type { OtherCartItem, OtherSaleRecord } from '@/types/louve';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export function RomaneioProdutosModal() {
  const {
    otherRomaneioModalOpen,
    closeOtherRomaneioModal,
    otherProducts,
    otherCart,
    addToOtherCart,
    removeFromOtherCart,
    updateOtherCartItemQty,
    finalizeOtherSale,
  } = useLouveStore();

  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('PIX');
  const [saleDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [addQty, setAddQty] = useState(1);

  const selectedProd = otherProducts.find((p) => p.id === selectedProduct);
  const maxQty = selectedProd ? selectedProd.stock : 0;

  const handleAddItem = () => {
    if (!selectedProd) return;
    if (addQty <= 0) return;
    if (addQty > maxQty) {
      alert('Estoque insuficiente! Disponivel: ' + maxQty + ' ' + selectedProd.unitType + '(s) de ' + selectedProd.name);
      return;
    }
    const item: OtherCartItem = {
      productId: selectedProd.id,
      name: selectedProd.name,
      code: selectedProd.code,
      category: selectedProd.category,
      unitType: selectedProd.unitType,
      qty: addQty,
      price: selectedProd.price,
      cost: selectedProd.cost,
      image: selectedProd.image,
    };
    addToOtherCart(item);
    setAddQty(1);
  };

  const handleFinalize = () => {
    if (otherCart.length === 0) {
      alert('Adicione ao menos um produto ao romaneio!');
      return;
    }

    const saleRecord: OtherSaleRecord = {
      id: 'ROM-OP-' + String(Math.floor(100000 + Math.random() * 900000)),
      date: saleDate || new Date().toISOString().split('T')[0],
      client: {
        name: clientName || 'Cliente Geral',
        phone: clientPhone || '-',
        email: clientEmail || '-',
      },
      paymentMethod,
      items: [...otherCart],
      total: otherCart.reduce((sum, i) => sum + i.price * i.qty, 0),
      totalCost: otherCart.reduce((sum, i) => sum + i.cost * i.qty, 0),
    };

    finalizeOtherSale(saleRecord);
    closeOtherRomaneioModal();
    setClientName('');
    setClientPhone('');
    setClientEmail('');
    setPaymentMethod('PIX');
    setSelectedProduct('');
  };

  const total = otherCart.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <Dialog open={otherRomaneioModalOpen} onOpenChange={(open) => !open && closeOtherRomaneioModal()}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto rounded-3xl p-6">
        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 overflow-hidden">
              <img src="/logo.jpeg" alt="" className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-800">Novo Romaneio - Outros Produtos</h3>
              <p className="text-[11px] text-slate-400">Emissao com baixa de estoque automatica e recibo</p>
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-4 lg:col-span-1">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">1. Dados do Cliente</h4>
            <div>
              <Label className="text-xs font-semibold text-slate-700">Nome Completo</Label>
              <Input value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Ex: Lucas Gabriel" className="text-xs mt-1" />
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-700">WhatsApp</Label>
              <Input value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} placeholder="(11) 99999-9999" className="text-xs mt-1" />
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-700">E-mail</Label>
              <Input type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} placeholder="cliente@email.com" className="text-xs mt-1" />
            </div>

            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide pt-2">2. Pagamento</h4>
            <div>
              <Label className="text-xs font-semibold text-slate-700">Forma de Pagamento</Label>
              <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 mt-1 focus:outline-none">
                <option value="PIX">PIX (Instantaneo)</option>
                <option value="Cartao de Credito">Cartao de Credito</option>
                <option value="Cartao de Debito">Cartao de Debito</option>
                <option value="Dinheiro">Dinheiro</option>
              </select>
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-700">Data da Venda</Label>
              <Input type="date" value={saleDate} readOnly className="text-xs mt-1" />
            </div>
          </div>

          <div className="space-y-4 lg:col-span-2 flex flex-col">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">3. Adicionar Produtos ao Romaneio</h4>
            <div className="grid grid-cols-2 sm:grid-cols-12 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200 items-end">
              <div className="sm:col-span-7">
                <Label className="text-[11px] font-semibold text-slate-600">Produto</Label>
                <select value={selectedProduct} onChange={(e) => { setSelectedProduct(e.target.value); setAddQty(1); }} className="w-full text-xs bg-white border border-slate-200 rounded-xl p-2 mt-1 focus:outline-none">
                  <option value="">Selecione...</option>
                  {otherProducts.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} ({p.category}) - R$ {p.price.toFixed(2)} [Est: {p.stock}]</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-3">
                <Label className="text-[11px] font-semibold text-slate-600">Qtd</Label>
                <input type="number" min={1} max={maxQty || 999} value={addQty} onChange={(e) => setAddQty(Math.max(1, parseInt(e.target.value) || 1))} className="w-full text-xs bg-white border border-slate-200 rounded-xl p-2 mt-1 text-center focus:outline-none" />
              </div>
              <div className="sm:col-span-2">
                <Button type="button" onClick={handleAddItem} className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold">
                  <Plus className="w-3.5 h-3.5" /> Add
                </Button>
              </div>
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <div className="bg-slate-100 p-2.5 text-xs font-bold text-slate-700">Itens do Romaneio</div>
              <div className="max-h-52 overflow-y-auto divide-y divide-slate-100">
                {otherCart.length === 0 ? (
                  <p className="p-4 text-center text-xs text-slate-400">Nenhum item adicionado ainda.</p>
                ) : (
                  otherCart.map((item, idx) => (
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
                            Cat: <span className="font-bold text-amber-600">{item.category}</span> | Qtd: <span className="font-bold">{item.qty} {item.unitType}(s)</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-slate-900">R$ {(item.price * item.qty).toFixed(2)}</span>
                        <button onClick={() => removeFromOtherCart(idx)} className="text-rose-500 hover:text-rose-700 cursor-pointer">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between mt-4">
              <div>
                <span className="text-xs text-amber-900 font-medium">Total do Romaneio:</span>
                <h3 className="text-2xl font-extrabold text-slate-900">R$ {total.toFixed(2)}</h3>
              </div>
              <Button onClick={handleFinalize} className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow-lg shadow-amber-500/20">
                Finalizar e Baixar Estoque
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
