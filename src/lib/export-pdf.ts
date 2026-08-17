'use client';

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { Product, SaleRecord, OtherProduct, OtherSaleRecord, AppSettings } from '@/types/louve';

const LOGO_FALLBACK = '/logo.jpeg';

function getLogo(settings: AppSettings): string {
  return settings.brandLogo || LOGO_FALLBACK;
}

function imgToHtml(src: string, w: number, h: number, radius = 8): string {
  if (!src) return '<div style="width:' + w + 'px;height:' + h + 'px;border-radius:' + radius + 'px;background:#e2e8f0;display:flex;align-items:center;justify-content:center;color:#94a3b8;font-size:' + Math.floor(w / 3) + 'px;">SEM</div>';
  return '<img src="' + src + '" crossorigin="anonymous" style="width:' + w + 'px;height:' + h + 'px;border-radius:' + radius + 'px;object-fit:cover;" />';
}

function waitForImages(container: HTMLDivElement): Promise<void> {
  const imgs = Array.from(container.querySelectorAll('img'));
  if (imgs.length === 0) return Promise.resolve();
  return Promise.all(
    imgs.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete && img.naturalWidth > 0) {
            resolve();
          } else {
            const onDone = () => {
              img.removeEventListener('load', onDone);
              img.removeEventListener('error', onError);
              resolve();
            };
            const onError = () => {
              img.removeEventListener('load', onDone);
              img.removeEventListener('error', onError);
              img.style.display = 'none';
              const ph = document.createElement('div');
              ph.style.cssText = 'width:100%;height:100%;background:#e2e8f0;display:flex;align-items:center;justify-content:center;color:#94a3b8;font-size:10px;';
              ph.textContent = 'SEM IMAGEM';
              img.parentNode?.replaceChild(ph, img);
              resolve();
            };
            img.addEventListener('load', onDone);
            img.addEventListener('error', onError);
            setTimeout(onError, 4000);
          }
        })
    )
  ).then(() => {});
}

async function renderHTMLToCanvas(html: string): Promise<HTMLCanvasElement> {
  const container = document.createElement('div');
  container.style.cssText = 'position:fixed;left:-9999px;top:0;width:700px;background:white;font-family:Arial,Helvetica,sans-serif;z-index:99999;';
  container.innerHTML = html;
  document.body.appendChild(container);

  try {
    await waitForImages(container);
    await new Promise<void>((r) => setTimeout(r, 500));

    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      windowWidth: 700,
      backgroundColor: '#ffffff',
    });
    return canvas;
  } finally {
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  }
}

function canvasToPDF(canvas: HTMLCanvasElement): jsPDF {
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
  return pdf;
}

async function renderAndDownload(html: string, filename: string) {
  try {
    const canvas = await renderHTMLToCanvas(html);
    const pdf = canvasToPDF(canvas);
    pdf.save(filename);
  } catch (err) {
    console.error('PDF export error:', err);
    alert('Erro ao gerar PDF. Tente novamente.');
  }
}

async function renderToBlob(html: string, filename: string): Promise<Blob | null> {
  try {
    const canvas = await renderHTMLToCanvas(html);
    const pdf = canvasToPDF(canvas);
    return pdf.output('blob');
  } catch (err) {
    console.error('PDF blob error:', err);
    return null;
  }
}

export async function sharePDFWhatsApp(
  settings: AppSettings,
  sale: SaleRecord | OtherSaleRecord,
  isOther: boolean
) {
  const html = buildRomaneioHtml(settings, sale, isOther);
  const filename = 'Romaneio_' + sale.id + '_' + sale.client.name.replace(/\s+/g, '_') + '.pdf';

  const blob = await renderToBlob(html, filename);
  if (!blob) {
    alert('Erro ao gerar PDF para WhatsApp. Tente exportar o PDF primeiro.');
    return;
  }

  const phone = sale.client.phone.replace(/\D/g, '');
  const baseMsg = 'Ola ' + sale.client.name + '! Segue seu romaneio ' + sale.id + ' - Total: R$ ' + sale.total.toFixed(2);

  if (navigator.share && navigator.canShare) {
    const file = new File([blob], filename, { type: 'application/pdf' });
    const shareData = {
      title: 'Romaneio ' + sale.id,
      text: baseMsg,
      files: [file],
    };
    if (navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        return;
      } catch (e) {
        if ((e as DOMException).name === 'AbortError') return;
      }
    }
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 10000);

  const waMsg = baseMsg + '\n\n*PDF do romaneio foi salvo no seu dispositivo. Por favor, anexe o arquivo PDF ao enviar esta mensagem.*';
  const waUrl = phone
    ? 'https://wa.me/' + phone + '?text=' + encodeURIComponent(waMsg)
    : 'https://wa.me/?text=' + encodeURIComponent(waMsg);
  window.open(waUrl, '_blank');
}

function buildRomaneioHtml(settings: AppSettings, sale: SaleRecord | OtherSaleRecord, isOther: boolean): string {
  const logo = getLogo(settings);
  let itemsHtml = '';
  if (!isOther) {
    const s = sale as SaleRecord;
    itemsHtml = s.items.map((i, idx) =>
      '<tr style="background-color:' + (idx % 2 === 0 ? '#fff' : '#f8fafc') + ';">' +
        '<td style="padding:10px;border-bottom:1px solid #e2e8f0;"><div style="display:flex;align-items:center;gap:8px;">' +
          (i.image ? '<img src="' + i.image + '" crossorigin="anonymous" style="width:36px;height:36px;border-radius:8px;object-fit:cover;" />' : '') +
          '<div><div style="font-weight:bold;">' + i.name + '</div><div style="font-size:9px;color:#94a3b8;">' + i.code + '</div></div>' +
        '</div></td>' +
        '<td style="padding:10px;border-bottom:1px solid #e2e8f0;">' + i.print + ' (' + i.color + ')</td>' +
        '<td style="padding:10px;border-bottom:1px solid #e2e8f0;text-align:center;font-weight:bold;">' + i.size + '</td>' +
        '<td style="padding:10px;border-bottom:1px solid #e2e8f0;text-align:center;font-weight:bold;">' + i.qty + '</td>' +
        '<td style="padding:10px;border-bottom:1px solid #e2e8f0;text-align:right;">R$ ' + i.price.toFixed(2) + '</td>' +
        '<td style="padding:10px;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:bold;">R$ ' + (i.price * i.qty).toFixed(2) + '</td>' +
      '</tr>'
    ).join('');
  } else {
    const s = sale as OtherSaleRecord;
    itemsHtml = s.items.map((i, idx) =>
      '<tr style="background-color:' + (idx % 2 === 0 ? '#fff' : '#f8fafc') + ';">' +
        '<td style="padding:10px;border-bottom:1px solid #e2e8f0;"><div style="display:flex;align-items:center;gap:8px;">' +
          (i.image ? '<img src="' + i.image + '" crossorigin="anonymous" style="width:36px;height:36px;border-radius:8px;object-fit:cover;" />' : '') +
          '<div><div style="font-weight:bold;">' + i.name + '</div><div style="font-size:9px;color:#94a3b8;">' + i.code + '</div></div>' +
        '</div></td>' +
        '<td style="padding:10px;border-bottom:1px solid #e2e8f0;">' + i.category + '</td>' +
        '<td style="padding:10px;border-bottom:1px solid #e2e8f0;text-align:center;">' + i.unitType + '</td>' +
        '<td style="padding:10px;border-bottom:1px solid #e2e8f0;text-align:center;font-weight:bold;">' + i.qty + '</td>' +
        '<td style="padding:10px;border-bottom:1px solid #e2e8f0;text-align:right;">R$ ' + i.price.toFixed(2) + '</td>' +
        '<td style="padding:10px;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:bold;">R$ ' + (i.price * i.qty).toFixed(2) + '</td>' +
      '</tr>'
    ).join('');
  }

  return '<div style="font-family:Arial,Helvetica,sans-serif;padding:24px;border:2px solid #d97706;border-radius:16px;">' +
    '<div style="display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #d97706;padding-bottom:12px;">' +
      '<div style="display:flex;align-items:center;gap:12px;">' +
        imgToHtml(logo, 48, 48, 10) +
        '<div><h1 style="font-size:20px;font-weight:bold;margin:0;color:#1e293b;">' + settings.brandName + '</h1><p style="font-size:11px;color:#64748b;margin:2px 0 0 0;">' + settings.brandSubtitle + '</p></div>' +
      '</div>' +
      '<div style="text-align:right;"><h2 style="font-size:18px;color:#d97706;margin:0;">' + sale.id + '</h2><span style="font-size:11px;color:#64748b;">Data: ' + sale.date + '</span></div>' +
    '</div>' +
    '<div style="margin:18px 0;font-size:12px;line-height:1.8;background:#f8fafc;padding:12px;border-radius:10px;">' +
      '<strong>Cliente:</strong> ' + sale.client.name + '<br/>' +
      '<strong>WhatsApp:</strong> ' + sale.client.phone + ' | <strong>E-mail:</strong> ' + sale.client.email + '<br/>' +
      '<strong>Forma de Pagamento:</strong> ' + sale.paymentMethod +
    '</div>' +
    '<table style="width:100%;border-collapse:collapse;margin-top:12px;font-size:11px;"><thead><tr style="background-color:#d97706;color:white;">' +
      (!isOther
        ? '<th style="padding:10px;text-align:left;">Produto</th><th style="padding:10px;text-align:left;">Estampa & Cor</th><th style="padding:10px;text-align:center;">Tam.</th><th style="padding:10px;text-align:center;">Qtd.</th><th style="padding:10px;text-align:right;">Valor Unit.</th><th style="padding:10px;text-align:right;">Subtotal</th>'
        : '<th style="padding:10px;text-align:left;">Produto</th><th style="padding:10px;text-align:left;">Categoria</th><th style="padding:10px;text-align:center;">Tipo</th><th style="padding:10px;text-align:center;">Qtd.</th><th style="padding:10px;text-align:right;">Valor Unit.</th><th style="padding:10px;text-align:right;">Subtotal</th>')
      + '</tr></thead><tbody>' + itemsHtml + '</tbody></table>' +
    '<div style="margin-top:24px;text-align:right;background:linear-gradient(135deg,#fffbeb,#fef3c7);padding:16px;border-radius:12px;border:1px solid #fde68a;">' +
      '<span style="font-size:13px;color:#92400e;">Valor Total a Pagar:</span><br/>' +
      '<h2 style="font-size:28px;font-weight:bold;margin:4px 0 0 0;color:#0f172a;">R$ ' + sale.total.toFixed(2) + '</h2>' +
      '<p style="font-size:11px;color:#64748b;margin-top:6px;">Chave PIX: <strong>' + settings.pixKey + '</strong></p>' +
    '</div>' +
  '</div>';
}

export async function exportDashboardPDF(
  settings: AppSettings,
  kpis: { label: string; value: string; sub: string; color: string }[],
  chartImgSales: string,
  chartImgSizes: string,
  recentSales: SaleRecord[],
  title: string
) {
  const logo = getLogo(settings);
  const kpiHtml = kpis.map((k) =>
    '<div style="background:' + k.color + ';border:1px solid #e2e8f0;border-radius:10px;padding:14px;">' +
      '<div style="font-size:10px;color:#64748b;">' + k.label + '</div>' +
      '<div style="font-size:22px;font-weight:bold;color:#0f172a;margin:4px 0 0 0;">' + k.value + '</div>' +
      '<div style="font-size:10px;color:#94a3b8;">' + k.sub + '</div>' +
    '</div>'
  ).join('');

  let salesHtml = '';
  if (recentSales.length > 0) {
    const rows = recentSales.slice(0, 10).map((s, idx) =>
      '<tr style="background:' + (idx % 2 === 0 ? '#fff' : '#f8fafc') + ';"><td style="padding:8px;font-weight:bold;">' + s.id + '</td><td style="padding:8px;text-align:center;">' + s.date + '</td><td style="padding:8px;">' + s.client.name + '</td><td style="padding:8px;text-align:center;">' + s.items.reduce((sum, i) => sum + i.qty, 0) + '</td><td style="padding:8px;text-align:right;font-weight:bold;">R$ ' + s.total.toFixed(2) + '</td></tr>'
    ).join('');
    salesHtml = '<div style="border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;"><div style="background:#f8fafc;padding:8px 12px;font-size:11px;font-weight:bold;color:#334155;border-bottom:1px solid #e2e8f0;">Ultimas Vendas</div><table style="width:100%;border-collapse:collapse;font-size:10px;"><tr style="background:#f1f5f9;"><th style="padding:8px;text-align:left;">Romaneio</th><th style="padding:8px;">Data</th><th style="padding:8px;text-align:left;">Cliente</th><th style="padding:8px;">Pecas</th><th style="padding:8px;text-align:right;">Total</th></tr>' + rows + '</table></div>';
  }

  const html = '<div style="font-family:Arial,Helvetica,sans-serif;padding:24px;">' +
    '<div style="display:flex;align-items:center;gap:12px;border-bottom:3px solid #d97706;padding-bottom:12px;margin-bottom:16px;">' +
      imgToHtml(logo, 48, 48, 10) +
      '<div><h1 style="font-size:20px;font-weight:bold;margin:0;color:#1e293b;">' + settings.brandName + '</h1><p style="font-size:11px;color:#64748b;margin:2px 0 0 0;">' + title + '</p></div>' +
      '<div style="margin-left:auto;text-align:right;font-size:10px;color:#94a3b8;">' + new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR') + '</div>' +
    '</div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px;">' + kpiHtml + '</div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px;">' +
      '<div style="border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;"><div style="background:#f8fafc;padding:8px 12px;font-size:11px;font-weight:bold;color:#334155;border-bottom:1px solid #e2e8f0;">Faturamento vs Lucro</div>' + (chartImgSales ? '<img src="' + chartImgSales + '" style="width:100%;height:200px;object-fit:contain;background:white;" />' : '<div style="height:200px;display:flex;align-items:center;justify-content:center;color:#cbd5e1;font-size:12px;">Sem dados</div>') + '</div>' +
      '<div style="border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;"><div style="background:#f8fafc;padding:8px 12px;font-size:11px;font-weight:bold;color:#334155;border-bottom:1px solid #e2e8f0;">Distribuicao por Tamanhos</div>' + (chartImgSizes ? '<img src="' + chartImgSizes + '" style="width:100%;height:200px;object-fit:contain;background:white;" />' : '<div style="height:200px;display:flex;align-items:center;justify-content:center;color:#cbd5e1;font-size:12px;">Sem dados</div>') + '</div>' +
    '</div>' +
    salesHtml +
  '</div>';

  await renderAndDownload(html, title.replace(/\s+/g, '_') + '_' + settings.brandName.replace(/\s+/g, '_') + '.pdf');
}

export async function exportProductsPDF(settings: AppSettings, products: Product[], title: string) {
  const logo = getLogo(settings);
  const productsHtml = products.map((p) => {
    const total = p.sizes.P + p.sizes.M + p.sizes.G + p.sizes.GG;
    const profit = p.price - p.cost;
    const margin = p.price > 0 ? ((profit / p.price) * 100).toFixed(0) : '0';
    const sizesHtml = ['P', 'M', 'G', 'GG'].map((s) =>
      '<div style="text-align:center;"><div style="font-weight:bold;font-size:12px;color:#334155;">' + s + '</div><div style="font-size:18px;font-weight:bold;color:' + (p.sizes[s as keyof typeof p.sizes] <= (p.minStock || 5) ? '#dc2626' : '#0f172a') + ';">' + p.sizes[s as keyof typeof p.sizes] + '</div></div>'
    ).join('<div style="width:1px;background:#e2e8f0;"></div>');

    return '<div style="border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;margin-bottom:14px;">' +
      '<div style="display:flex;gap:14px;padding:14px;background:#f8fafc;">' +
        '<div style="flex-shrink:0;">' + imgToHtml(p.image, 72, 72, 10) + '</div>' +
        '<div style="flex:1;">' +
          '<div style="font-weight:bold;font-size:13px;color:#0f172a;">' + p.name + '</div>' +
          '<div style="font-size:10px;color:#64748b;">' + p.code + ' | ' + p.print + ' | ' + p.color + '</div>' +
          '<div style="margin-top:8px;display:flex;gap:16px;font-size:11px;">' +
            '<div><span style="color:#64748b;">Custo:</span> <strong>R$ ' + p.cost.toFixed(2) + '</strong></div>' +
            '<div><span style="color:#64748b;">Venda:</span> <strong style="color:#d97706;">R$ ' + p.price.toFixed(2) + '</strong></div>' +
            '<div><span style="color:#64748b;">Lucro:</span> <strong style="color:#10b981;">R$ ' + profit.toFixed(2) + ' (' + margin + '%)</strong></div>' +
          '</div>' +
        '</div>' +
        '<div style="text-align:center;flex-shrink:0;"><div style="font-size:10px;color:#94a3b8;">Estoque Total</div><div style="font-size:20px;font-weight:bold;color:#0f172a;">' + total + '</div><div style="font-size:9px;color:#94a3b8;">unidades</div></div>' +
      '</div>' +
      '<div style="display:flex;justify-content:space-around;padding:10px;background:white;">' + sizesHtml + '</div>' +
    '</div>';
  }).join('');

  const html = '<div style="font-family:Arial,Helvetica,sans-serif;padding:24px;">' +
    '<div style="display:flex;align-items:center;gap:12px;border-bottom:3px solid #d97706;padding-bottom:12px;margin-bottom:16px;">' +
      imgToHtml(logo, 48, 48, 10) +
      '<div><h1 style="font-size:20px;font-weight:bold;margin:0;color:#1e293b;">' + settings.brandName + '</h1><p style="font-size:11px;color:#64748b;margin:2px 0 0 0;">' + title + '</p></div>' +
      '<div style="margin-left:auto;text-align:right;font-size:10px;color:#94a3b8;">Gerado em: ' + new Date().toLocaleDateString('pt-BR') + '</div>' +
    '</div>' +
    productsHtml +
  '</div>';

  await renderAndDownload(html, title.replace(/\s+/g, '_') + '.pdf');
}

export async function exportStockPDF(settings: AppSettings, products: Product[], title: string) {
  const logo = getLogo(settings);
  const rowsHtml = products.map((p, idx) => {
    const total = p.sizes.P + p.sizes.M + p.sizes.G + p.sizes.GG;
    const isLow = total <= (p.minStock || 5);
    return '<tr style="background:' + (idx % 2 === 0 ? '#fff' : '#f8fafc') + ';"><td style="padding:8px;"><div style="display:flex;align-items:center;gap:8px;">' + imgToHtml(p.image, 28, 28, 6) + '<div><div style="font-weight:bold;">' + p.name + '</div><div style="color:#94a3b8;font-size:9px;">' + p.code + ' | ' + p.color + '</div></div></div></td><td style="padding:8px;text-align:center;font-weight:bold;">' + p.sizes.P + '</td><td style="padding:8px;text-align:center;font-weight:bold;">' + p.sizes.M + '</td><td style="padding:8px;text-align:center;font-weight:bold;">' + p.sizes.G + '</td><td style="padding:8px;text-align:center;font-weight:bold;">' + p.sizes.GG + '</td><td style="padding:8px;text-align:center;font-weight:bold;color:' + (isLow ? '#dc2626' : '#0f172a') + ';">' + total + '</td><td style="padding:8px;text-align:center;">' + p.minStock + '</td><td style="padding:8px;text-align:center;"><span style="padding:2px 8px;border-radius:99px;font-size:9px;font-weight:bold;color:white;background:' + (isLow ? '#dc2626' : '#10b981') + ';">' + (isLow ? 'BAIXO' : 'OK') + '</span></td></tr>';
  }).join('');

  const html = '<div style="font-family:Arial,Helvetica,sans-serif;padding:24px;">' +
    '<div style="display:flex;align-items:center;gap:12px;border-bottom:3px solid #d97706;padding-bottom:12px;margin-bottom:16px;">' +
      imgToHtml(logo, 48, 48, 10) +
      '<div><h1 style="font-size:20px;font-weight:bold;margin:0;color:#1e293b;">' + settings.brandName + '</h1><p style="font-size:11px;color:#64748b;margin:2px 0 0 0;">' + title + '</p></div>' +
      '<div style="margin-left:auto;text-align:right;font-size:10px;color:#94a3b8;">Gerado em: ' + new Date().toLocaleDateString('pt-BR') + '</div>' +
    '</div>' +
    '<table style="width:100%;border-collapse:collapse;font-size:10px;"><thead><tr style="background:#d97706;color:white;"><th style="padding:10px;text-align:left;">Produto</th><th style="padding:10px;text-align:center;">P</th><th style="padding:10px;text-align:center;">M</th><th style="padding:10px;text-align:center;">G</th><th style="padding:10px;text-align:center;">GG</th><th style="padding:10px;text-align:center;">Total</th><th style="padding:10px;text-align:center;">Min.</th><th style="padding:10px;text-align:center;">Status</th></tr></thead><tbody>' + rowsHtml + '</tbody></table>' +
  '</div>';

  await renderAndDownload(html, title.replace(/\s+/g, '_') + '.pdf');
}

export async function exportFinancePDF(
  settings: AppSettings,
  data: {
    totalGross: number;
    totalCost: number;
    netProfit: number;
    margin: string;
    ticketMedio: number;
    salesCount: number;
    chartImgMonthly: string;
    chartImgPayment: string;
  },
  title: string
) {
  const logo = getLogo(settings);
  const html = '<div style="font-family:Arial,Helvetica,sans-serif;padding:24px;">' +
    '<div style="display:flex;align-items:center;gap:12px;border-bottom:3px solid #d97706;padding-bottom:12px;margin-bottom:16px;">' +
      imgToHtml(logo, 48, 48, 10) +
      '<div><h1 style="font-size:20px;font-weight:bold;margin:0;color:#1e293b;">' + settings.brandName + '</h1><p style="font-size:11px;color:#64748b;margin:2px 0 0 0;">' + title + '</p></div>' +
      '<div style="margin-left:auto;text-align:right;font-size:10px;color:#94a3b8;">Gerado em: ' + new Date().toLocaleDateString('pt-BR') + '</div>' +
    '</div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:20px;">' +
      '<div style="background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:14px;text-align:center;"><div style="font-size:10px;color:#92400e;">Faturamento Bruto</div><div style="font-size:20px;font-weight:bold;color:#d97706;">R$ ' + data.totalGross.toFixed(2) + '</div></div>' +
      '<div style="background:#ecfdf5;border:1px solid #a7f3d0;border-radius:10px;padding:14px;text-align:center;"><div style="font-size:10px;color:#065f46;">Lucro Liquido</div><div style="font-size:20px;font-weight:bold;color:#10b981;">R$ ' + data.netProfit.toFixed(2) + '</div></div>' +
      '<div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:10px;padding:14px;text-align:center;"><div style="font-size:10px;color:#0c4a6e;">Ticket Medio</div><div style="font-size:20px;font-weight:bold;color:#0284c7;">R$ ' + data.ticketMedio.toFixed(2) + '</div></div>' +
    '</div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px;">' +
      '<div style="border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;"><div style="background:#f8fafc;padding:8px 12px;font-size:11px;font-weight:bold;color:#334155;border-bottom:1px solid #e2e8f0;">Evolucao Mensal</div>' + (data.chartImgMonthly ? '<img src="' + data.chartImgMonthly + '" style="width:100%;height:220px;object-fit:contain;background:white;" />' : '<div style="height:220px;display:flex;align-items:center;justify-content:center;color:#cbd5e1;">Sem dados</div>') + '</div>' +
      '<div style="border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;"><div style="background:#f8fafc;padding:8px 12px;font-size:11px;font-weight:bold;color:#334155;border-bottom:1px solid #e2e8f0;">Formas de Pagamento</div>' + (data.chartImgPayment ? '<img src="' + data.chartImgPayment + '" style="width:100%;height:220px;object-fit:contain;background:white;" />' : '<div style="height:220px;display:flex;align-items:center;justify-content:center;color:#cbd5e1;">Sem dados</div>') + '</div>' +
    '</div>' +
    '<div style="border:2px solid #e2e8f0;border-radius:12px;overflow:hidden;">' +
      '<div style="background:#1e293b;color:white;padding:12px 16px;font-size:13px;font-weight:bold;">Demonstrativo de Resultados (DRE)</div>' +
      '<div style="padding:4px 0;">' +
        '<div style="display:flex;justify-content:space-between;padding:14px 16px;border-bottom:1px solid #f1f5f9;font-size:12px;"><span style="color:#334155;">(+) Receita Bruta de Vendas</span><span style="font-weight:bold;">R$ ' + data.totalGross.toFixed(2) + '</span></div>' +
        '<div style="display:flex;justify-content:space-between;padding:14px 16px;border-bottom:1px solid #f1f5f9;font-size:12px;background:#fef2f2;"><span style="color:#991b1b;">(-) Custo das Mercadorias (CMV)</span><span style="font-weight:bold;color:#dc2626;">- R$ ' + data.totalCost.toFixed(2) + '</span></div>' +
        '<div style="display:flex;justify-content:space-between;padding:14px 16px;font-size:12px;background:#ecfdf5;"><span style="font-weight:bold;color:#065f46;">(=) Lucro Liquido Operacional</span><span style="font-weight:bold;font-size:16px;color:#059669;">R$ ' + data.netProfit.toFixed(2) + '</span></div>' +
        '<div style="display:flex;justify-content:space-between;padding:14px 16px;font-size:12px;background:#fffbeb;border-radius:0 0 10px 10px;"><span style="font-weight:bold;color:#92400e;">Margem Liquida</span><span style="font-weight:bold;font-size:16px;color:#d97706;">' + data.margin + '%</span></div>' +
      '</div>' +
    '</div>' +
  '</div>';

  await renderAndDownload(html, title.replace(/\s+/g, '_') + '.pdf');
}

export async function exportOtherProductsPDF(settings: AppSettings, products: OtherProduct[]) {
  const logo = getLogo(settings);
  const productsHtml = products.map((p) => {
    const profit = p.price - p.cost;
    const margin = p.price > 0 ? ((profit / p.price) * 100).toFixed(0) : '0';
    const isLow = p.stock <= p.minStock;
    return '<div style="border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;margin-bottom:14px;">' +
      '<div style="display:flex;gap:14px;padding:14px;background:#f8fafc;">' +
        '<div style="flex-shrink:0;">' + imgToHtml(p.image, 72, 72, 10) + '</div>' +
        '<div style="flex:1;">' +
          '<div style="font-weight:bold;font-size:13px;color:#0f172a;">' + p.name + '</div>' +
          '<div style="font-size:10px;color:#64748b;">' + p.code + ' | ' + p.category + ' | ' + p.description + '</div>' +
          '<div style="margin-top:6px;display:flex;gap:16px;font-size:11px;">' +
            '<div><span style="color:#64748b;">Custo:</span> <strong>R$ ' + p.cost.toFixed(2) + '</strong></div>' +
            '<div><span style="color:#64748b;">Venda:</span> <strong style="color:#d97706;">R$ ' + p.price.toFixed(2) + '</strong></div>' +
            '<div><span style="color:#64748b;">Lucro:</span> <strong style="color:#10b981;">R$ ' + profit.toFixed(2) + ' (' + margin + '%)</strong></div>' +
          '</div>' +
          '<div style="margin-top:6px;font-size:10px;color:#64748b;">Unidade: ' + p.unitType + (p.unitType === 'caixa' || p.unitType === 'kit' ? ' (' + p.kitSize + ' un)' : '') + '</div>' +
        '</div>' +
        '<div style="text-align:center;flex-shrink:0;"><div style="font-size:10px;color:#94a3b8;">Estoque</div><div style="font-size:20px;font-weight:bold;color:' + (isLow ? '#dc2626' : '#0f172a') + ';">' + p.stock + '</div><div style="font-size:9px;color:#94a3b8;">' + p.unitType + '(s)</div></div>' +
      '</div>' +
    '</div>';
  }).join('');

  const html = '<div style="font-family:Arial,Helvetica,sans-serif;padding:24px;">' +
    '<div style="display:flex;align-items:center;gap:12px;border-bottom:3px solid #d97706;padding-bottom:12px;margin-bottom:16px;">' +
      imgToHtml(logo, 48, 48, 10) +
      '<div><h1 style="font-size:20px;font-weight:bold;margin:0;color:#1e293b;">' + settings.brandName + '</h1><p style="font-size:11px;color:#64748b;margin:2px 0 0 0;">Catalogo de Outros Produtos</p></div>' +
      '<div style="margin-left:auto;text-align:right;font-size:10px;color:#94a3b8;">Gerado em: ' + new Date().toLocaleDateString('pt-BR') + '</div>' +
    '</div>' +
    productsHtml +
  '</div>';

  await renderAndDownload(html, 'Catalogo_Outros_Produtos.pdf');
}

export async function exportOtherStockPDF(settings: AppSettings, products: OtherProduct[]) {
  const logo = getLogo(settings);
  const rowsHtml = products.map((p, idx) => {
    const isLow = p.stock <= p.minStock;
    return '<tr style="background:' + (idx % 2 === 0 ? '#fff' : '#f8fafc') + ';"><td style="padding:8px;"><div style="display:flex;align-items:center;gap:8px;">' + imgToHtml(p.image, 28, 28, 6) + '<div><div style="font-weight:bold;">' + p.name + '</div><div style="color:#94a3b8;font-size:9px;">' + p.code + ' | ' + p.category + '</div></div></div></td><td style="padding:8px;text-align:center;">' + p.unitType + '</td><td style="padding:8px;text-align:center;font-weight:bold;">' + p.stock + '</td><td style="padding:8px;text-align:center;">' + p.minStock + '</td><td style="padding:8px;text-align:right;font-weight:bold;">R$ ' + p.price.toFixed(2) + '</td><td style="padding:8px;text-align:center;"><span style="padding:2px 8px;border-radius:99px;font-size:9px;font-weight:bold;color:white;background:' + (isLow ? '#dc2626' : '#10b981') + ';">' + (isLow ? 'BAIXO' : 'OK') + '</span></td></tr>';
  }).join('');

  const html = '<div style="font-family:Arial,Helvetica,sans-serif;padding:24px;">' +
    '<div style="display:flex;align-items:center;gap:12px;border-bottom:3px solid #d97706;padding-bottom:12px;margin-bottom:16px;">' +
      imgToHtml(logo, 48, 48, 10) +
      '<div><h1 style="font-size:20px;font-weight:bold;margin:0;color:#1e293b;">' + settings.brandName + '</h1><p style="font-size:11px;color:#64748b;margin:2px 0 0 0;">Estoque de Outros Produtos</p></div>' +
      '<div style="margin-left:auto;text-align:right;font-size:10px;color:#94a3b8;">Gerado em: ' + new Date().toLocaleDateString('pt-BR') + '</div>' +
    '</div>' +
    '<table style="width:100%;border-collapse:collapse;font-size:10px;"><thead><tr style="background:#d97706;color:white;"><th style="padding:10px;text-align:left;">Produto</th><th style="padding:10px;text-align:center;">Tipo</th><th style="padding:10px;text-align:center;">Estoque</th><th style="padding:10px;text-align:center;">Min.</th><th style="padding:10px;text-align:right;">Preco</th><th style="padding:10px;text-align:center;">Status</th></tr></thead><tbody>' + rowsHtml + '</tbody></table>' +
  '</div>';

  await renderAndDownload(html, 'Estoque_Outros_Produtos.pdf');
}

export async function exportRomaneioPDF(settings: AppSettings, sale: SaleRecord | OtherSaleRecord, isOther: boolean) {
  const html = buildRomaneioHtml(settings, sale, isOther);
  await renderAndDownload(html, 'Romaneio_' + sale.id + '_' + sale.client.name.replace(/\s+/g, '_') + '.pdf');
}

export async function exportAllRomaneiosPDF(settings: AppSettings, sales: (SaleRecord | OtherSaleRecord)[], isOther: boolean, title: string) {
  const logo = getLogo(settings);
  const salesHtml = sales.map((s) => {
    let itemsRows = '';
    if (!isOther) {
      const sale = s as SaleRecord;
      itemsRows = sale.items.map((i, idx) =>
        '<tr style="background:' + (idx % 2 === 0 ? '#fff' : '#f8fafc') + ';">' +
          '<td style="padding:6px;"><div style="display:flex;align-items:center;gap:6px;">' +
            (i.image ? '<img src="' + i.image + '" crossorigin="anonymous" style="width:28px;height:28px;border-radius:6px;object-fit:cover;" />' : '') +
            '<span>' + i.name + '</span></div></td>' +
          '<td style="padding:6px;text-align:center;">' + i.size + '</td>' +
          '<td style="padding:6px;text-align:center;">' + i.qty + '</td>' +
          '<td style="padding:6px;text-align:right;font-weight:bold;">R$ ' + (i.price * i.qty).toFixed(2) + '</td>' +
        '</tr>'
      ).join('');
    } else {
      const sale = s as OtherSaleRecord;
      itemsRows = sale.items.map((i, idx) =>
        '<tr style="background:' + (idx % 2 === 0 ? '#fff' : '#f8fafc') + ';">' +
          '<td style="padding:6px;"><span>' + i.name + '</span></td>' +
          '<td style="padding:6px;text-align:center;">' + i.category + '</td>' +
          '<td style="padding:6px;text-align:center;">' + i.qty + '</td>' +
          '<td style="padding:6px;text-align:right;font-weight:bold;">R$ ' + (i.price * i.qty).toFixed(2) + '</td>' +
        '</tr>'
      ).join('');
    }

    return '<div style="border:1px solid #e2e8f0;border-radius:12px;margin-bottom:16px;overflow:hidden;">' +
      '<div style="background:#f8fafc;padding:10px 14px;display:flex;justify-content:space-between;border-bottom:1px solid #e2e8f0;">' +
        '<div><span style="font-weight:bold;color:#1e293b;">' + s.id + '</span><span style="color:#64748b;margin-left:8px;">' + s.date + '</span></div>' +
        '<div style="font-weight:bold;color:#1e293b;">R$ ' + s.total.toFixed(2) + '</div>' +
      '</div>' +
      '<div style="padding:10px 14px;font-size:11px;">' +
        '<div style="margin-bottom:6px;"><strong>Cliente:</strong> ' + s.client.name + ' | ' + s.client.phone + '</div>' +
        '<div style="margin-bottom:8px;"><strong>Pagamento:</strong> ' + s.paymentMethod + '</div>' +
        '<table style="width:100%;border-collapse:collapse;font-size:10px;"><tr style="background:#f1f5f9;"><th style="padding:6px;text-align:left;">Produto</th>' +
          (!isOther ? '<th style="text-align:center;">Tam.</th>' : '<th style="text-align:center;">Cat.</th>') +
          '<th style="text-align:center;">Qtd</th><th style="text-align:right;">Subtotal</th></tr>' + itemsRows + '</table>' +
      '</div></div>';
  }).join('');

  const html = '<div style="font-family:Arial,Helvetica,sans-serif;padding:24px;">' +
    '<div style="display:flex;align-items:center;gap:12px;border-bottom:3px solid #d97706;padding-bottom:12px;margin-bottom:16px;">' +
      imgToHtml(logo, 48, 48, 10) +
      '<div><h1 style="font-size:20px;font-weight:bold;margin:0;color:#1e293b;">' + settings.brandName + '</h1><p style="font-size:11px;color:#64748b;">' + title + '</p></div>' +
    '</div>' +
    '<p style="font-size:11px;color:#64748b;margin-bottom:16px;">Gerado em: ' + new Date().toLocaleDateString('pt-BR') + ' | Total: ' + sales.length + ' romaneio(s)</p>' +
    salesHtml +
  '</div>';

  await renderAndDownload(html, title.replace(/\s+/g, '_') + '.pdf');
}