'use client';

import { useLouveStore } from '@/store/louve-store';
import { Printer, MessageCircle, Receipt, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

function waitForImages(container: HTMLDivElement): Promise<void> {
  const imgs = Array.from(container.querySelectorAll('img'));
  if (imgs.length === 0) return Promise.resolve();
  return Promise.all(
    imgs.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete) {
            resolve();
          } else {
            img.onload = () => resolve();
            img.onerror = () => resolve();
            setTimeout(resolve, 3000);
          }
        })
    )
  ).then(() => {});
}

async function canvasToPDF(canvas: HTMLCanvasElement, filename: string) {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const imgWidth = 190;
  const pageHeight = 277;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  if (imgHeight <= pageHeight) {
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 10, 10, imgWidth, imgHeight);
  } else {
    const totalPages = Math.ceil(imgHeight / pageHeight);
    for (let i = 0; i < totalPages; i++) {
      if (i > 0) pdf.addPage();
      const srcY = (i * pageHeight / imgHeight) * canvas.height;
      const srcH = Math.min((pageHeight / imgHeight) * canvas.height, canvas.height - srcY);
      const slice = document.createElement('canvas');
      slice.width = canvas.width;
      slice.height = srcH;
      const ctx = slice.getContext('2d');
      if (ctx) {
        ctx.drawImage(canvas, 0, srcY, canvas.width, srcH, 0, 0, canvas.width, srcH);
      }
      const sliceImgH = (srcH * imgWidth) / canvas.width;
      pdf.addImage(slice.toDataURL('image/png'), 'PNG', 10, 10, imgWidth, sliceImgH);
    }
  }
  pdf.save(filename);
}

async function renderHtmlToPDF(html: string, filename: string) {
  try {
    const container = document.createElement('div');
    container.style.cssText = 'position:fixed;left:-9999px;top:0;width:700px;padding:24px;background:white;font-family:sans-serif;z-index:-1;';
    container.innerHTML = html;
    document.body.appendChild(container);
    await waitForImages(container);
    await new Promise<void>((r) => setTimeout(r, 400));
    const canvas = await html2canvas(container, { scale: 2, useCORS: true, allowTaint: true, logging: false });
    document.body.removeChild(container);
    await canvasToPDF(canvas, filename);
  } catch (err) {
    console.error('PDF error:', err);
    alert('Erro ao gerar PDF. Tente novamente.');
  }
}

export function RomaneioTab() {
  const { sales, settings } = useLouveStore();

  const sendWhatsApp = () => {
    window.open('https://wa.me/', '_blank');
  };

  const exportPDF = (saleId: string) => {
    const sale = sales.find((s) => s.id === saleId);
    if (!sale) return;

    const logoSrc = settings.brandLogo || '/logo.jpeg';
    const itemsHtml = sale.items.map((i, idx) =>
      '<tr style="background-color:' + (idx % 2 === 0 ? '#fff' : '#f8fafc') + ';">' +
        '<td style="padding:10px;border-bottom:1px solid #e2e8f0;"><div style="display:flex;align-items:center;gap:8px;">' +
          (i.image ? '<img src="' + i.image + '" style="width:36px;height:36px;border-radius:8px;object-fit:cover;" />' : '') +
          '<div><div style="font-weight:bold;">' + i.name + '</div><div style="font-size:9px;color:#94a3b8;">' + i.code + '</div></div>' +
        '</div></td>' +
        '<td style="padding:10px;border-bottom:1px solid #e2e8f0;">' + i.print + ' (' + i.color + ')</td>' +
        '<td style="padding:10px;border-bottom:1px solid #e2e8f0;text-align:center;font-weight:bold;">' + i.size + '</td>' +
        '<td style="padding:10px;border-bottom:1px solid #e2e8f0;text-align:center;font-weight:bold;">' + i.qty + '</td>' +
        '<td style="padding:10px;border-bottom:1px solid #e2e8f0;text-align:right;">R$ ' + i.price.toFixed(2) + '</td>' +
        '<td style="padding:10px;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:bold;">R$ ' + (i.price * i.qty).toFixed(2) + '</td>' +
      '</tr>'
    ).join('');

    const html = '<div style="font-family:sans-serif;padding:24px;border:2px solid #d97706;border-radius:16px;">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #d97706;padding-bottom:12px;">' +
        '<div style="display:flex;align-items:center;gap:12px;">' +
          '<img src="' + logoSrc + '" style="width:48px;height:48px;border-radius:10px;object-fit:cover;" />' +
          '<div><h1 style="font-size:20px;font-weight:bold;margin:0;color:#1e293b;">' + settings.brandName + '</h1><p style="font-size:11px;color:#64748b;margin:2px 0 0 0;">' + settings.brandSubtitle + '</p></div>' +
        '</div>' +
        '<div style="text-align:right;"><h2 style="font-size:18px;color:#d97706;margin:0;">' + sale.id + '</h2><span style="font-size:11px;color:#64748b;">Data: ' + sale.date + '</span></div>' +
      '</div>' +
      '<div style="margin:18px 0;font-size:12px;line-height:1.8;background:#f8fafc;padding:12px;border-radius:10px;">' +
        '<strong>Cliente:</strong> ' + sale.client.name + '<br/>' +
        '<strong>WhatsApp:</strong> ' + sale.client.phone + ' | <strong>E-mail:</strong> ' + sale.client.email + '<br/>' +
        '<strong>Forma de Pagamento:</strong> ' + sale.paymentMethod +
      '</div>' +
      '<table style="width:100%;border-collapse:collapse;margin-top:12px;font-size:11px;"><thead><tr style="background-color:#d97706;color:white;"><th style="padding:10px;text-align:left;">Produto</th><th style="padding:10px;text-align:left;">Estampa & Cor</th><th style="padding:10px;text-align:center;">Tam.</th><th style="padding:10px;text-align:center;">Qtd.</th><th style="padding:10px;text-align:right;">Valor Unit.</th><th style="padding:10px;text-align:right;">Subtotal</th></tr></thead><tbody>' + itemsHtml + '</tbody></table>' +
      '<div style="margin-top:24px;text-align:right;background:linear-gradient(135deg,#fffbeb,#fef3c7);padding:16px;border-radius:12px;border:1px solid #fde68a;">' +
        '<span style="font-size:13px;color:#92400e;">Valor Total a Pagar:</span><br/>' +
        '<h2 style="font-size:28px;font-weight:bold;margin:4px 0 0 0;color:#0f172a;">R$ ' + sale.total.toFixed(2) + '</h2>' +
        '<p style="font-size:11px;color:#64748b;margin-top:6px;">Chave PIX: <strong>' + settings.pixKey + '</strong></p>' +
      '</div>' +
    '</div>';

    renderHtmlToPDF(html, 'Romaneio_' + sale.id + '_' + sale.client.name.replace(/\s+/g, '_') + '.pdf');
  };

  const exportAllPDF = () => {
    const logoSrc = settings.brandLogo || '/logo.jpeg';
    const salesHtml = sales.map((s) => {
      const itemsRows = s.items.map((i, idx) =>
        '<tr style="background:' + (idx % 2 === 0 ? '#fff' : '#f8fafc') + ';">' +
          '<td style="padding:6px;"><div style="display:flex;align-items:center;gap:6px;">' +
            (i.image ? '<img src="' + i.image + '" style="width:28px;height:28px;border-radius:6px;object-fit:cover;" />' : '') +
            '<span>' + i.name + '</span></div></td>' +
          '<td style="padding:6px;text-align:center;">' + i.size + '</td>' +
          '<td style="padding:6px;text-align:center;">' + i.qty + '</td>' +
          '<td style="padding:6px;text-align:right;font-weight:bold;">R$ ' + (i.price * i.qty).toFixed(2) + '</td>' +
        '</tr>'
      ).join('');

      return '<div style="border:1px solid #e2e8f0;border-radius:12px;margin-bottom:16px;overflow:hidden;">' +
        '<div style="background:#f8fafc;padding:10px 14px;display:flex;justify-content:space-between;border-bottom:1px solid #e2e8f0;">' +
          '<div><span style="font-weight:bold;color:#1e293b;">' + s.id + '</span><span style="color:#64748b;margin-left:8px;">' + s.date + '</span></div>' +
          '<div style="font-weight:bold;color:#1e293b;">R$ ' + s.total.toFixed(2) + '</div>' +
        '</div>' +
        '<div style="padding:10px 14px;font-size:11px;">' +
          '<div style="margin-bottom:6px;"><strong>Cliente:</strong> ' + s.client.name + ' | ' + s.client.phone + '</div>' +
          '<div style="margin-bottom:8px;"><strong>Pagamento:</strong> ' + s.paymentMethod + '</div>' +
          '<table style="width:100%;border-collapse:collapse;font-size:10px;"><tr style="background:#f1f5f9;"><th style="padding:6px;text-align:left;">Produto</th><th style="text-align:center;">Tam.</th><th style="text-align:center;">Qtd</th><th style="text-align:right;">Subtotal</th></tr>' + itemsRows + '</table>' +
        '</div></div>';
    }).join('');

    const html = '<div style="font-family:sans-serif;padding:24px;">' +
      '<div style="display:flex;align-items:center;gap:12px;border-bottom:3px solid #d97706;padding-bottom:12px;margin-bottom:16px;">' +
        '<img src="' + logoSrc + '" style="width:48px;height:48px;border-radius:10px;object-fit:cover;" />' +
        '<div><h1 style="font-size:20px;font-weight:bold;margin:0;color:#1e293b;">' + settings.brandName + '</h1><p style="font-size:11px;color:#64748b;">Painel de Romaneios & Vendas</p></div>' +
      '</div>' +
      '<p style="font-size:11px;color:#64748b;margin-bottom:16px;">Gerado em: ' + new Date().toLocaleDateString('pt-BR') + ' | Total: ' + sales.length + ' romaneio(s)</p>' +
      salesHtml +
    '</div>';

    renderHtmlToPDF(html, 'Todos_Romaneios_' + settings.brandName.replace(/\s+/g, '_') + '.pdf');
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <span className="text-xs text-slate-500">{sales.length} romaneio(s) emitido(s)</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={sendWhatsApp} className="gap-2 text-xs">
            <MessageCircle className="w-4 h-4" /> Abrir WhatsApp
          </Button>
          <Button variant="secondary" size="sm" onClick={exportAllPDF} className="gap-2 text-xs">
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
              {sales.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
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
                    <td className="p-3.5">
                      <div className="text-[11px] font-medium text-slate-700">{s.items.reduce((sum, i) => sum + i.qty, 0)} peca(s)</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-xs">
                        {s.items.map((i) => i.name + ' [' + i.size + ' x' + i.qty + ']').join(', ')}
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-semibold text-[10px]">{s.paymentMethod}</span>
                    </td>
                    <td className="p-3.5 text-right font-extrabold text-slate-900">R$ {s.total.toFixed(2)}</td>
                    <td className="p-3.5 text-center">
                      <button onClick={() => exportPDF(s.id)} className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg cursor-pointer" title="Gerar PDF">
                        <Printer className="w-4 h-4" />
                      </button>
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
