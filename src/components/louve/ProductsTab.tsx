'use client';

import { useState, useEffect } from 'react';
import { useLouveStore } from '@/store/louve-store';
import { Plus, FileText, Edit3, Trash2, Search, Upload, Download } from 'lucide-react';
import type { Product } from '@/types/louve';
import { exportProductsPDF } from '@/lib/export-pdf';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function ProductsTab() {
  const { products, openProductModal, deleteProduct, settings } = useLouveStore();
  const [search, setSearch] = useState('');

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.print.toLowerCase().includes(search.toLowerCase()) ||
      p.color.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase())
  );

  const handleExportPDF = () => {
    exportProductsPDF(settings, products);
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
            placeholder="Buscar por nome, estampa, cor ou codigo..."
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
            onClick={() => openProductModal()}
            className="gap-2 text-xs bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold"
          >
            <Plus className="w-4 h-4" /> Cadastrar Camisa
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-3.5 text-left font-bold text-slate-600">Produto</th>
                <th className="p-3.5 text-center font-bold text-slate-600">Grade (P / M / G / GG)</th>
                <th className="p-3.5 text-right font-bold text-slate-600">Preco / Custo</th>
                <th className="p-3.5 text-right font-bold text-slate-600">Lucro</th>
                <th className="p-3.5 text-center font-bold text-slate-600">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    Nenhum produto cadastrado.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const totalStock = p.sizes.P + p.sizes.M + p.sizes.G + p.sizes.GG;
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
                          <div>
                            <div className="font-bold text-slate-800">{p.name}</div>
                            <div className="text-[11px] text-slate-400">{p.code} &bull; {p.print}</div>
                            <div className="text-[11px] text-slate-400">{p.color}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <span className="px-1.5 py-0.5 bg-slate-100 rounded">P: {p.sizes.P}</span>
                          <span className="px-1.5 py-0.5 bg-slate-100 rounded">M: {p.sizes.M}</span>
                          <span className="px-1.5 py-0.5 bg-slate-100 rounded">G: {p.sizes.G}</span>
                          <span className="px-1.5 py-0.5 bg-slate-100 rounded">GG: {p.sizes.GG}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1">Total: {totalStock} pecas</div>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="font-bold text-slate-900">R$ {p.price.toFixed(2)}</div>
                        <div className="text-[10px] text-slate-400">Custo: R$ {p.cost.toFixed(2)}</div>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="font-bold text-emerald-600">R$ {profit.toFixed(2)}</div>
                        <div className="text-[10px] text-emerald-500 font-semibold">{margin}% margem</div>
                      </td>
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openProductModal(p.id)}
                            className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg cursor-pointer"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Excluir "${p.name}"?`)) deleteProduct(p.id);
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

      <ProductModal />
    </section>
  );
}

function ProductModal() {
  const { productModalOpen, closeProductModal, editingProductId, products, addProduct, updateProduct } =
    useLouveStore();
  const [form, setForm] = useState({
    name: '',
    code: '',
    print: '',
    color: '',
    cost: '',
    price: '',
    minStock: '',
    P: '',
    M: '',
    G: '',
    GG: '',
    image: '',
  });

  const isEditing = !!editingProductId;
  const editingProduct = isEditing ? products.find((p) => p.id === editingProductId) : null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const costNum = parseFloat(form.cost);
    const priceNum = parseFloat(form.price);
    if (isNaN(costNum) || isNaN(priceNum) || !form.name) {
      alert('Preencha nome, custo e preco corretamente.');
      return;
    }

    const productData: Product = {
      id: editingProduct?.id || `prod_${Date.now()}`,
      code: form.code,
      name: form.name,
      print: form.print,
      color: form.color,
      cost: costNum,
      price: priceNum,
      minStock: parseInt(form.minStock) || 5,
      sizes: {
        P: parseInt(form.P) || 0,
        M: parseInt(form.M) || 0,
        G: parseInt(form.G) || 0,
        GG: parseInt(form.GG) || 0,
      },
      image: form.image,
    };

    if (isEditing) {
      updateProduct(productData);
    } else {
      addProduct(productData);
    }
    closeProductModal();
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

  // Populate form when dialog opens (programmatic open doesn't trigger onOpenChange)
  useEffect(() => {
    if (productModalOpen) {
      if (editingProduct) {
        setForm({
          name: editingProduct.name,
          code: editingProduct.code,
          print: editingProduct.print,
          color: editingProduct.color,
          cost: String(editingProduct.cost),
          price: String(editingProduct.price),
          minStock: String(editingProduct.minStock),
          P: String(editingProduct.sizes.P),
          M: String(editingProduct.sizes.M),
          G: String(editingProduct.sizes.G),
          GG: String(editingProduct.sizes.GG),
          image: editingProduct.image || '',
        });
      } else {
        setForm({
          name: '',
          code: `LM-ST-${String(products.length + 1).padStart(2, '0')}`,
          print: '',
          color: '',
          cost: '',
          price: '',
          minStock: '5',
          P: '0',
          M: '0',
          G: '0',
          GG: '0',
          image: '',
        });
      }
    }
  }, [productModalOpen, editingProductId]);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      closeProductModal();
    }
  };

  return (
    <Dialog open={productModalOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-slate-800">
            {isEditing ? 'Editar Camisa' : 'Cadastrar Nova Camisa'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSave} className="mt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Image Upload */}
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

            {/* Basic Info */}
            <div className="sm:col-span-2 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-[11px] font-bold text-slate-600">Codigo SKU</Label>
                  <Input
                    value={form.code}
                    onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                    className="text-xs mt-1"
                    placeholder="LM-ST-01"
                  />
                </div>
                <div>
                  <Label className="text-[11px] font-bold text-slate-600">Nome do Modelo</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className="text-xs mt-1"
                    placeholder="Camisa Oversized"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-[11px] font-bold text-slate-600">Estampa / Arte</Label>
                  <Input
                    value={form.print}
                    onChange={(e) => setForm((f) => ({ ...f, print: e.target.value }))}
                    className="text-xs mt-1"
                    placeholder="Leao de Juda Costas"
                  />
                </div>
                <div>
                  <Label className="text-[11px] font-bold text-slate-600">Cor</Label>
                  <Input
                    value={form.color}
                    onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
                    className="text-xs mt-1"
                    placeholder="Preto Mineral"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Financial Info */}
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
                  placeholder="38.00"
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
                  placeholder="99.90"
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
                  placeholder="5"
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

          {/* Size Grid */}
          <div className="bg-slate-50 rounded-2xl p-4 space-y-3">
            <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">Grade de Tamanhos (Estoque Inicial)</h4>
            <div className="grid grid-cols-4 gap-3">
              {(['P', 'M', 'G', 'GG'] as const).map((size) => (
                <div key={size}>
                  <Label className="text-[11px] font-bold text-slate-600 text-center block">Tam. {size}</Label>
                  <Input
                    type="number"
                    value={form[size]}
                    onChange={(e) => setForm((f) => ({ ...f, [size]: e.target.value }))}
                    className="text-xs mt-1 text-center"
                    placeholder="0"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" size="sm" onClick={closeProductModal}>
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
