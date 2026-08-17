'use client';

import { useState, useRef, useEffect } from 'react';
import { useLouveStore } from '@/store/louve-store';
import { Upload, Save, Download, UploadCloud, Trash2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export function SettingsTab() {
  const { settings, setSettings, exportData, importData } = useLouveStore();
  const [brandName, setBrandName] = useState(settings.brandName);
  const [brandSubtitle, setBrandSubtitle] = useState(settings.brandSubtitle);
  const [pixKey, setPixKey] = useState(settings.pixKey);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setSettings({ brandLogo: ev.target?.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    setSettings({ brandName, brandSubtitle, pixKey });
    alert('Configuracoes salvas com sucesso!');
  };

  const handleExport = () => {
    const json = exportData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_louve_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      importData(content);
      const { settings: s } = useLouveStore.getState();
      setBrandName(s.brandName);
      setBrandSubtitle(s.brandSubtitle);
      setPixKey(s.pixKey);
      alert('Dados importados com sucesso!');
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (confirm('Isso ira apagar TODOS os dados e restaurar os padroes. Continuar?')) {
      localStorage.removeItem('LOUVE_MOVEMENT_DATA');
      window.location.reload();
    }
  };

  return (
    <section className="space-y-6 max-w-2xl">
      {/* Brand Settings */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-amber-500" />
          Identidade da Marca
        </h3>

        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-slate-200 shrink-0 bg-amber-500 flex items-center justify-center">
            {settings.brandLogo ? (
              <img src={settings.brandLogo} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <img src="/logo.jpeg" alt="Logo" className="w-full h-full object-cover" />
            )}
          </div>
          <div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="gap-2 text-xs"
            >
              <Upload className="w-3.5 h-3.5" /> Trocar Logotipo
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />
            <p className="text-[11px] text-slate-400 mt-1">Imagem quadrada recomendada (PNG/JPG)</p>
          </div>
        </div>

        <div>
          <Label className="text-xs font-bold text-slate-600">Nome da Marca</Label>
          <Input
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            className="text-sm mt-1"
            placeholder="Louve Movement"
          />
        </div>

        <div>
          <Label className="text-xs font-bold text-slate-600">Subtitulo</Label>
          <Input
            value={brandSubtitle}
            onChange={(e) => setBrandSubtitle(e.target.value)}
            className="text-sm mt-1"
            placeholder="Controle Financeiro e de Estoque"
          />
        </div>
      </div>

      {/* Payment Settings */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-800">Configuracao de Pagamento</h3>
        <div>
          <Label className="text-xs font-bold text-slate-600">Chave PIX</Label>
          <Input
            value={pixKey}
            onChange={(e) => setPixKey(e.target.value)}
            className="text-sm mt-1"
            placeholder="financeiro@louvemovement.com"
          />
          <p className="text-[11px] text-slate-400 mt-1">Esta chave aparecera nos romaneios e recibos PDF</p>
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-800">Gerenciamento de Dados</h3>
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" onClick={handleExport} className="gap-2 text-xs">
            <Download className="w-4 h-4" /> Exportar Backup (JSON)
          </Button>
          <label className="cursor-pointer">
            <Button variant="outline" className="w-full gap-2 text-xs" asChild>
              <span>
                <UploadCloud className="w-4 h-4" /> Importar Backup
              </span>
            </Button>
            <input type="file" accept="application/json,.json" onChange={handleImport} className="hidden" />
          </label>
        </div>
        <Button
          variant="destructive"
          size="sm"
          onClick={handleReset}
          className="gap-2 text-xs"
        >
          <Trash2 className="w-3.5 h-3.5" /> Resetar Todos os Dados
        </Button>
      </div>

      <Button
        onClick={handleSave}
        className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold gap-2"
      >
        <Save className="w-4 h-4" /> Salvar Configuracoes
      </Button>
    </section>
  );
}