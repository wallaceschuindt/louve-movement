'use client';

import { useLouveStore } from '@/store/louve-store';
import { Printer, MessageCircle, Send, Trash2, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function RomaneioTab() {
  const { sales, settings } = useLouveStore();

  const sendWhatsApp = (saleId: string) => {
    const sale = sales.find((s) => s.id === saleId);
    if (!sale) return;

    let phoneClean = sale.client.phone.replace(/\D/g, '');
    if (!phoneClean) {
      alert('Telefone invalido ou nao preenchido no romaneio.');
      return;
    }

    const itemsText = sale.items
      .map((i) => `* ${i.name} (${i.print}) - Tam: ${i.size} - R$ ${i.price.toFixed(2)}`)
      .join('\n');
    const msg = `Ola *${sale.client.name}*!\n\nAqui esta o seu *Romaneio / Pedido ${sale.id}* da *${settings.brandName}*:\n\n${itemsText}\n\n*Total:* R$ ${sale.total.toFixed(2)}\n*Forma de Pagamento:* ${sale.paymentMethod}\n*Chave PIX:* ${settings.pixKey}\n\nAgradecemos a preferencia!`;

    window.open(`https://wa.me/55${phoneClean}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const exportPDF = (saleId: string) => {
    const sale = sales.find((s) => s.id === saleId);
    if (!sale) return;

    Promise.all([import('jspdf'), import('html2canvas')]).then(([{ jsPDF }, { default: html2canvas }]) => {
      const container = document.createElement('div');
      container.style.cssText =
        'position:fixed;left:-9999px;top:0;width:700px;padding:24px;background:white;font-family:sans-serif;border-radius:12px;';
      container.innerHTML = `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 12px;">
          <div style="display:flex; justify-content:space-between; align-items:center; border-bottom: 2px solid #d97706; padding-bottom: 10px;">
            <div>
              <h1 style="font-size:20px; font-weight:bold; margin:0; color:#1e293b;">${settings.brandName}</h1>
              <p style="font-size:11px; color:#64748b; margin:2px 0 0 0;">${settings.brandSubtitle}</p>
            </div>
            <div style="text-align:right;">
              <h2 style="font-size:16px; color:#d97706; margin:0;">${sale.id}</h2>
              <span style="font-size:11px; color:#64748b;">Data: ${sale.date}</span>
            </div>
          </div>
          <div style="margin: 15px 0; font-size: 12px; line-height: 1.6;">
            <strong>Cliente:</strong> ${sale.client.name}<br/>
            <strong>WhatsApp:</strong> ${sale.client.phone} | <strong>E-mail:</strong> ${sale.client.email}<br/>
            <strong>Forma de Pagamento:</strong> ${sale.paymentMethod}
          </div>
          <table style="width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 11px;">
            <thead>
              <tr style="background-color: #f1f5f9; text-align: left;">
                <th style="padding: 8px; border-bottom: 1px solid #cbd5e1;">Item / Modelo</th>
                <th style="padding: 8px; border-bottom: 1px solid #cbd5e1;">Estampa & Cor</th>
                <th style="padding: 8px; border-bottom: 1px solid #cbd5e1; text-align:center;">Tam.</th>
                <th style="padding: 8px; border-bottom: 1px solid #cbd5e1; text-align:right;">Valor</th>
              </tr>
            </thead>
            <tbody>
              ${sale.items
                .map(
                  (i) => `<tr>
                  <td style="padding: 8px; border-bottom: 1px solid #f1f5f9;">${i.name}</td>
                  <td style="padding: 8px; border-bottom: 1px solid #f1f5f9;">${i.print} (${i.color})</td>
                  <td style="padding: 8px; border-bottom: 1px solid #f1f5f9; text-align:center; font-weight:bold;">${i.size}</td>
                  <td style="padding: 8px; border-bottom: 1px solid #f1f5f9; text-align:right;">R$ ${i.price.toFixed(2)}</td>
                </tr>`
                )
                .join('')}
            </tbody>
          </table>
          <div style="margin-top: 20px; text-align: right;">
            <span style="font-size: 12px; color: #64748b;">Valor Total a Pagar:</span>
            <h2 style="font-size: 22px; font-weight: bold; margin: 4px 0 0 0; color: #0f172a;">R$ ${sale.total.toFixed(2)}</h2>
            <p style="font-size: 10px; color: #64748b; margin-top: 5px;">Chave PIX: <strong>${settings.pixKey}</strong></p>
          </div>
        </div>
      `;
      document.body.appendChild(container);

      html2canvas(container, { scale: 2 }).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 190;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
        pdf.save(`Romaneio_${sale.id}_${sale.client.name.replace(/\s+/g, '_')}.pdf`);
        document.body.removeChild(container);
      });
    });
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs text-slate-500">{sales.length} romaneio(s) emitido(s)</span>
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
                <th className="p-3.5 text-left font-bold text-slate-600">Contato</th>
                <th className="p-3.5 text-left font-bold text-slate-600">Itens</th>
                <th className="p-3.5 text-left font-bold text-slate-600">Pagamento</th>
                <th className="p-3.5 text-right font-bold text-slate-600">Total</th>
                <th className="p-3.5 text-center font-bold text-slate-600">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {sales.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    <Receipt className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                    Nenhum romaneio emitido ainda.
                  </td>
                </tr>
              ) : (
                sales.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition border-b border-slate-100">
                    <td className="p-3.5 font-bold font-mono text-slate-800">{s.id}</td>
                    <td className="p-3.5 text-slate-500">{s.date}</td>
                    <td className="p-3.5 font-semibold text-slate-800">{s.client.name}</td>
                    <td className="p-3.5 text-[11px] text-slate-500">
                      {s.client.phone}
                      <br />
                      {s.client.email}
                    </td>
                    <td className="p-3.5">
                      <div className="text-[11px] font-medium text-slate-700">{s.items.length} peca(s)</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-xs">
                        {s.items.map((i) => `${i.name} [${i.size}]`).join(', ')}
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-semibold text-[10px]">
                        {s.paymentMethod}
                      </span>
                    </td>
                    <td className="p-3.5 text-right font-extrabold text-slate-900">R$ {s.total.toFixed(2)}</td>
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => exportPDF(s.id)}
                          className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg cursor-pointer"
                          title="Gerar PDF"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => sendWhatsApp(s.id)}
                          className="p-1.5 hover:bg-emerald-50 text-emerald-600 rounded-lg cursor-pointer"
                          title="Enviar WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4" />
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
    </section>
  );
}
