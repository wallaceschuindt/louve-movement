'use client';

import { useState, useEffect } from 'react';
import { useLouveStore } from '@/store/louve-store';
import { Plus, Search, Edit3, Trash2, Upload, Download, FileText } from 'lucide-react';
import type { OtherProduct } from '@/types/louve';
import { exportOtherProductsPDF } from '@/lib/export-pdf';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const CATEGORIES = ['Caneca', 'Caneta', 'Chaveiro', 'Bone', 'Mochila', 'Adesivo', 'Outro'];
const UNIT_TYPES = ['unidade', 'caixa', 'kit'] as const;

export function OutrosProdutosTab() {
  const { otherProducts, openOtherProductModal, settings } = useLouveStore();
  const [search, setSearch] = useState('');

  const filtered = otherProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase())
  );

  const handleExportPDF = async () => {
    try {
      await exportOtherProductsPDF(settings, otherProducts);
    } catch (err) {
      console.error(err);
      alert('Erro ao exportar catalogo PDF.');
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, codigo, categoria ou descricao..."
            className="text-xs bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 w-72 focus:outline-none focus:border-amber-500 shadow-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExportPDF}
            className="gap-2 text-xs"
          >
            <FileText className="w-4 h-4" /> Exportar Catalogo PDF
          </Button>
          <Button
            size="sm"
            onClick={() => openOtherProductModal()}
            className="gap-2 text-xs bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold"
          >
            <Plus className="w-4 h-4" /> Cadastrar Produto
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-3.5 text-left font-bold text-slate-600">Produto</th>
                <th className="p-3.5 text-left font-bold text-slate-600">Codigo</th>
                <th className="p-3.5 text-left font-bold text-slate-600">Categoria</th>
                <th className="p-3.5 text-left font-bold text-slate-600">Descricao</th>
                <th className="p-3.5 text-right font-bold text-slate-600">Custo</th>
                <th className="p-3.5 text-right font-bold text-slate-600">Preco</th>
                <th className="p-3.5 text-right font-bold text-slate-600">Lucro</th>
                <th className="p-3.5 text-center font-bold text-slate-600">Estoque</th>
                <th className="p-3.5 text-center font-bold text-slate-600">Tipo</th>
                <th className="p-3.5 text-center font-bold text-slate-600">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-slate-400">
                    Nenhum produto cadastrado.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const profit = p.price - p.cost;
                  const margin = p.price > 0 ? ((profit / p.price) * 100).toFixed(0) : '0';
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
                      <td className="p-3.5 font-mono text-slate-500">{p.code}</td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-semibold text-[10px]">{p.category}</span>
                      </td>
                      <td className="p-3.5 text-slate-500 max-w-xs truncate">{p.description}</td>
                      <td className="p-3.5 text-right text-slate-500">R$ {p.cost.toFixed(2)}</td>
                      <td className="p-3.5 text-right font-bold text-slate-900">R$ {p.price.toFixed(2)}</td>
                      <td className="p-3.5 text-right">
                        <div className="font-bold text-emerald-600">R$ {profit.toFixed(2)}</div>
                        <div className="text-[10px] text-emerald-500 font-semibold">{margin}% margem</div>
                      </td>
                      <td className="p-3.5 text-center font-bold">{p.stock}</td>
                      <td className="p-3.5 text-center">
                        <span className="text-[10px] text-slate-500">{p.unitType}</span>
                      </td>
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openOtherProductModal(p.id)}
                            className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg cursor-pointer"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Excluir "' + p.name + '"?')) {
                                useLouveStore.getState().deleteOtherProduct(p.id);
                              }
                            }}
                            className="p-1.5 hover:bg-rose-50 text-rose-500 rounded-lg cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <OtherProductModal />
    </section>
  );
}

function OtherProductModal() {
  const {
    otherProductModalOpen,
    closeOtherProductModal,
    editingOtherProductId,
    otherProducts,
    addOtherProduct,
    updateOtherProduct,
  } = useLouveStore();

  const [form, setForm] = useState({
    code: '',
    name: '',
    description: '',
    category: 'Caneca',
    cost: '',
    price: '',
    minStock: '',
    stock: '',
    unitType: 'unidade' as 'unidade' | 'caixa' | 'kit',
    kitSize: '',
    image: '',
  });

  const isEditing = !!editingOtherProductId;
  const editingProduct = isEditing ? otherProducts.find((p) => p.id === editingOtherProductId) : null;

  useEffect(() => {
    if (otherProductModalOpen) {
      if (editingProduct) {
        setForm({
          code: editingProduct.code,
          name: editingProduct.name,
          description: editingProduct.description,
          category: editingProduct.category,
          cost: String(editingProduct.cost),
          price: String(editingProduct.price),
          minStock: String(editingProduct.minStock),
          stock: String(editingProduct.stock),
          unitType: editingProduct.unitType,
          kitSize: String(editingProduct.kitSize),
          image: editingProduct.image || '',
        });
      } else {
        setForm({
          code: 'LM-OP-' + String(otherProducts.length + 1).padStart(2, '0'),
          name: '',
          description: '',
          category: 'Caneca',
          cost: '',
          price: '',
          minStock: '5',
          stock: '0',
          unitType: 'unidade',
          kitSize: '1',
          image: '',
        });
      }
    }
  }, [otherProductModalOpen, editingOtherProductId]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const costNum = parseFloat(form.cost);
    const priceNum = parseFloat(form.price);
    if (isNaN(costNum) || isNaN(priceNum) || !form.name) {
      alert('Preencha nome, custo e preco corretamente.');
      return;
    }

    const productData: OtherProduct = {
      id: editingProduct?.id || 'outro_' + Date.now(),
      code: form.code,
      name: form.name,
      description: form.description,
      category: form.category,
      cost: costNum,
      price: priceNum,
      minStock: parseInt(form.minStock) || 5,
      stock: isEditing ? editingProduct!.stock : (parseInt(form.stock) || 0),
      unitType: form.unitType,
      kitSize: (form.unitType === 'caixa' || form.unitType === 'kit') ? (parseInt(form.kitSize) || 1) : 1,
      image: form.image,
    };

    if (isEditing) {
      updateOtherProduct(productData);
    } else {
      addOtherProduct(productData);
    }
    closeOtherProductModal();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setForm((f) => ({ ...f, image: ev.target?.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      closeOtherProductModal();
    }
  };

  const showKitSize = form.unitType === 'caixa' || form.unitType === 'kit';

  return (
    <Dialog open={otherProductModalOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-slate-800">
            {isEditing ? 'Editar Produto' : 'Cadastrar Novo Produto'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSave} className="mt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl p-4 bg-slate-50 text-center">
              {form.image ? (
                <img src={form.image} alt="Preview" className="w-24 h-24 object-cover rounded-xl mb-2 shadow-sm" />
              ) : (
                <div className="w-24 h-24 bg-slate-100 rounded-xl mb-2 flex items-center justify-center text-slate-400 text-[10px]">SEM FOTO</div>
              )}
              <label className="cursor-pointer text-[11px] font-bold text-amber-600 hover:underline">
                <Upload className="w-3 h-3 inline mr-1" />
                {form.image ? 'Trocar Foto' : 'Carregar Foto'}
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            </div>

            <div className="sm:col-span-2 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-[11px] font-bold text-slate-600">Codigo SKU</Label>
                  <Input
                    value={form.code}
                    onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                    className="text-xs mt-1"
                    placeholder="LM-OP-01"
                  />
                </div>
                <div>
                  <Label className="text-[11px] font-bold text-slate-600">Nome do Produto</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className="text-xs mt-1"
                    placeholder="Caneca Louve Movement"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-[11px] font-bold text-slate-600">Categoria</Label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    className="w-full text-xs bg-white border border-slate-200 rounded-xl p-2.5 mt-1 focus:outline-none"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="text-[11px] font-bold text-slate-600">Tipo Unitario</Label>
                  <select
                    value={form.unitType}
                    onChange={(e) => setForm((f) => ({ ...f, unitType: e.target.value as 'unidade' | 'caixa' | 'kit' }))}
                    className="w-full text-xs bg-white border border-slate-200 rounded-xl p-2.5 mt-1 focus:outline-none"
                  >
                    {UNIT_TYPES.map((t) => (
                      <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <Label className="text-[11px] font-bold text-slate-600">Descricao</Label>
                <Input
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="text-xs mt-1"
                  placeholder="Caneca ceramica 350ml com logo borda dourada"
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 space-y-3">
            <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">Financeiro</h4>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-[11px] font-bold text-slate-600">Custo (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.cost}
                  onChange={(e) => setForm((f) => ({ ...f, cost: e.target.value }))}
                  className="text-xs mt-1"
                  placeholder="12.00"
                  required
                />
              </div>
              <div>
                <Label className="text-[11px] font-bold text-slate-600">Preco Venda (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                  className="text-xs mt-1"
                  placeholder="39.90"
                  required
                />
              </div>
              <div>
                <Label className="text-[11px] font-bold text-slate-600">Est. Minimo</Label>
                <Input
                  type="number"
                  value={form.minStock}
                  onChange={(e) => setForm((f) => ({ ...f, minStock: e.target.value }))}
                  className="text-xs mt-1"
                  placeholder="10"
                />
              </div>
            </div>
            {form.cost && form.price && (
              <div className="flex gap-4 text-[11px]">
                <span className="text-emerald-600 font-bold">
                  Lucro: R$ {(parseFloat(form.price) - parseFloat(form.cost)).toFixed(2)}
                </span>
                <span className="text-amber-600 font-bold">
                  Markup: {parseFloat(form.cost) > 0 ? ((parseFloat(form.price) / parseFloat(form.cost) - 1) * 100).toFixed(0) : 0}%
                </span>
                <span className="text-slate-500 font-semibold">
                  Margem: {parseFloat(form.price) > 0 ? ((parseFloat(form.price) - parseFloat(form.cost)) / parseFloat(form.price) * 100).toFixed(0) : 0}%
                </span>
              </div>
            )}
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 space-y-3">
            <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">Estoque Inicial</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-[11px] font-bold text-slate-600">Quantidade em Estoque</Label>
                <Input
                  type="number"
                  value={form.stock}
                  onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
                  className="text-xs mt-1"
                  placeholder="0"
                  disabled={isEditing}
                />
              </div>
              {showKitSize && (
                <div>
                  <Label className="text-[11px] font-bold text-slate-600">Itens por {form.unitType === 'caixa' ? 'Caixa' : 'Kit'}</Label>
                  <Input
                    type="number"
                    value={form.kitSize}
                    onChange={(e) => setForm((f) => ({ ...f, kitSize: e.target.value }))}
                    className="text-xs mt-1"
                    placeholder="1"
                    min="1"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" size="sm" onClick={closeOtherProductModal}>
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold"
            >
              {isEditing ? 'Salvar Alteracoes' : 'Cadastrar Produto'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
