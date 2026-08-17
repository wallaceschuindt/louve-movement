import type { Product, SaleRecord } from '@/types/louve';
import type { AppSettings } from '@/types/louve';

const LOGO_FALLBACK = '/logo.jpeg';

function getLogo(settings: AppSettings): string {
  return settings.brandLogo || LOGO_FALLBACK;
}

function imgToHtml(src: string, w: number, h: number, radius = 8): string {
  if (!src) return `<div style="width:${w}px;height:${h}px;border-radius:${radius}px;background:#e2e8f0;display:flex;align-items:center;justify-content:center;color:#94a3b8;font-size:${Math.floor(w/3)}px;">SEM</div>`;
  return `<img src="${src}" style="width:${w}px;height:${h}px;border-radius:${radius}px;object-fit:cover;" />`;
}

function renderAndDownload(html: string, filename: string) {
  Promise.all([import('jspdf'), import('html2canvas')]).then(([{ jsPDF }, { default: html2canvas }]) => {
    const container = document.createElement('div');
    container.style.cssText = 'position:fixed;left:-9999px;top:0;width:700px;padding:24px;background:white;font-family:sans-serif;';
    container.innerHTML = html;
    document.body.appendChild(container);
    html2canvas(container, { scale: 2, useCORS: true, allowTaint: true }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      if (imgHeight <= 287) {
        pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      } else {
        const pageH = 277;
        let srcY = 0;
        let dstY = 10;
        const totalPages = Math.ceil(imgHeight / pageH);
        for (let p = 0; p < totalPages; p++) {
          if (p > 0) pdf.addPage();
          pdf.addImage(imgData, 'PNG', 10, dstY, imgWidth, imgHeight, undefined, 'FAST', p === 0 ? 0 : -(pageH * p + 10 * p));
        }
      }
      pdf.save(filename);
      document.body.removeChild(container);
    });
  });
}

export function exportDashboardPDF(settings: AppSettings, kpis: { label: string; value: string; sub: string }[], chartImgSales: string, chartImgSizes: string, recentSales: SaleRecord[]) {
  const logo = getLogo(settings);
  const html = `
    <div style="font-family:sans-serif;padding:24px;">
      <div style="display:flex;align-items:center;gap:12px;border-bottom:3px solid #d97706;padding-bottom:12px;margin-bottom:16px;">
        ${imgToHtml(logo, 48, 48, 10)}
        <div>
          <h1 style="font-size:20px;font-weight:bold;margin:0;color:#1e293b;">${settings.brandName}</h1>
          <p style="font-size:11px;color:#64748b;margin:2px 0 0 0;">Dashboard Geral - Relatorio Completo</p>
        </div>
        <div style="margin-left:auto;text-align:right;font-size:10px;color:#94a3b8;">${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}</div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px;">
        ${kpis.map(k => `
          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px;">
            <div style="font-size:10px;color:#64748b;">${k.label}</div>
            <div style="font-size:22px;font-weight:bold;color:#0f172a;margin:4px 0 0 0;">${k.value}</div>
            <div style="font-size:10px;color:#94a3b8;">${k.sub}</div>
          </div>
        `).join('')}
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px;">
        <div style="border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
          <div style="background:#f8fafc;padding:8px 12px;font-size:11px;font-weight:bold;color:#334155;border-bottom:1px solid #e2e8f0;">Faturamento vs Lucro</div>
          ${chartImgSales ? `<img src="${chartImgSales}" style="width:100%;height:200px;object-fit:contain;background:white;" />` : '<div style="height:200px;display:flex;align-items:center;justify-content:center;color:#cbd5e1;font-size:12px;">Sem dados</div>'}
        </div>
        <div style="border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
          <div style="background:#f8fafc;padding:8px 12px;font-size:11px;font-weight:bold;color:#334155;border-bottom:1px solid #e2e8f0;">Distribuicao por Tamanhos</div>
          ${chartImgSizes ? `<img src="${chartImgSizes}" style="width:100%;height:200px;object-fit:contain;background:white;" />` : '<div style="height:200px;display:flex;align-items:center;justify-content:center;color:#cbd5e1;font-size:12px;">Sem dados</div>'}
        </div>
      </div>

      ${recentSales.length > 0 ? `
        <div style="border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
          <div style="background:#f8fafc;padding:8px 12px;font-size:11px;font-weight:bold;color:#334155;border-bottom:1px solid #e2e8f0;">Ultimas Vendas</div>
          <table style="width:100%;border-collapse:collapse;font-size:10px;">
            <tr style="background:#f1f5f9;"><th style="padding:8px;text-align:left;">Romaneio</th><th style="padding:8px;">Data</th><th style="padding:8px;text-align:left;">Cliente</th><th style="padding:8px;">Pecas</th><th style="padding:8px;text-align:right;">Total</th></tr>
            ${recentSales.slice(0, 10).map((s, idx) => `
              <tr style="background:${idx % 2 === 0 ? '#fff' : '#f8fafc'};">
                <td style="padding:8px;font-weight:bold;">${s.id}</td>
                <td style="padding:8px;text-align:center;">${s.date}</td>
                <td style="padding:8px;">${s.client.name}</td>
                <td style="padding:8px;text-align:center;">${s.items.reduce((sum, i) => sum + i.qty, 0)}</td>
                <td style="padding:8px;text-align:right;font-weight:bold;">R$ ${s.total.toFixed(2)}</td>
              </tr>
            `).join('')}
          </table>
        </div>
      ` : ''}
    </div>
  `;
  renderAndDownload(html, `Dashboard_${settings.brandName.replace(/\s+/g, '_')}.pdf`);
}

export function exportProductsPDF(settings: AppSettings, products: Product[]) {
  const logo = getLogo(settings);
  const html = `
    <div style="font-family:sans-serif;padding:24px;">
      <div style="display:flex;align-items:center;gap:12px;border-bottom:3px solid #d97706;padding-bottom:12px;margin-bottom:16px;">
        ${imgToHtml(logo, 48, 48, 10)}
        <div>
          <h1 style="font-size:20px;font-weight:bold;margin:0;color:#1e293b;">${settings.brandName}</h1>
          <p style="font-size:11px;color:#64748b;margin:2px 0 0 0;">Catalogo de Produtos com Grade</p>
        </div>
        <div style="margin-left:auto;text-align:right;font-size:10px;color:#94a3b8;">Gerado em: ${new Date().toLocaleDateString('pt-BR')}</div>
      </div>
      ${products.map((p, idx) => {
        const total = p.sizes.P + p.sizes.M + p.sizes.G + p.sizes.GG;
        const profit = p.price - p.cost;
        const margin = p.price > 0 ? ((profit / p.price) * 100).toFixed(0) : '0';
        return `
          <div style="border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;margin-bottom:14px;${idx % 2 === 0 ? '' : 'page-break-inside:avoid;'}">
            <div style="display:flex;gap:14px;padding:14px;background:#f8fafc;">
              <div style="flex-shrink:0;">${imgToHtml(p.image, 72, 72, 10)}</div>
              <div style="flex:1;">
                <div style="font-weight:bold;font-size:13px;color:#0f172a;">${p.name}</div>
                <div style="font-size:10px;color:#64748b;">${p.code} | ${p.print} | ${p.color}</div>
                <div style="margin-top:8px;display:flex;gap:16px;font-size:11px;">
                  <div><span style="color:#64748b;">Custo:</span> <strong>R$ ${p.cost.toFixed(2)}</strong></div>
                  <div><span style="color:#64748b;">Venda:</span> <strong style="color:#d97706;">R$ ${p.price.toFixed(2)}</strong></div>
                  <div><span style="color:#64748b;">Lucro:</span> <strong style="color:#10b981;">R$ ${profit.toFixed(2)} (${margin}%)</strong></div>
                </div>
              </div>
              <div style="text-align:center;flex-shrink:0;">
                <div style="font-size:10px;color:#94a3b8;">Estoque Total</div>
                <div style="font-size:20px;font-weight:bold;color:#0f172a;">${total}</div>
                <div style="font-size:9px;color:#94a3b8;">unidades</div>
              </div>
            </div>
            <div style="display:flex;justify-content:space-around;padding:10px;background:white;">
              ${(['P','M','G','GG'] as const).map(s => `
                <div style="text-align:center;">
                  <div style="font-weight:bold;font-size:12px;color:#334155;">${s}</div>
                  <div style="font-size:18px;font-weight:bold;color:${p.sizes[s] <= (p.minStock||5) ? '#dc2626' : '#0f172a'};">${p.sizes[s]}</div>
                </div>
              `).join('<div style="width:1px;background:#e2e8f0;"></div>')}
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
  renderAndDownload(html, `Catalogo_Produtos_${settings.brandName.replace(/\s+/g, '_')}.pdf`);
}

export function exportStockPDF(settings: AppSettings, products: Product[]) {
  const logo = getLogo(settings);
  const html = `
    <div style="font-family:sans-serif;padding:24px;">
      <div style="display:flex;align-items:center;gap:12px;border-bottom:3px solid #d97706;padding-bottom:12px;margin-bottom:16px;">
        ${imgToHtml(logo, 48, 48, 10)}
        <div>
          <h1 style="font-size:20px;font-weight:bold;margin:0;color:#1e293b;">${settings.brandName}</h1>
          <p style="font-size:11px;color:#64748b;margin:2px 0 0 0;">Relatorio de Inventario e Estoque</p>
        </div>
        <div style="margin-left:auto;text-align:right;font-size:10px;color:#94a3b8;">Gerado em: ${new Date().toLocaleDateString('pt-BR')}</div>
      </div>
      <table style="width:100%;border-collapse:collapse;font-size:10px;">
        <thead>
          <tr style="background:#d97706;color:white;">
            <th style="padding:10px;text-align:left;">Produto</th>
            <th style="padding:10px;text-align:center;">P</th>
            <th style="padding:10px;text-align:center;">M</th>
            <th style="padding:10px;text-align:center;">G</th>
            <th style="padding:10px;text-align:center;">GG</th>
            <th style="padding:10px;text-align:center;">Total</th>
            <th style="padding:10px;text-align:center;">Min.</th>
            <th style="padding:10px;text-align:center;">Status</th>
          </tr>
        </thead>
        <tbody>
          ${products.map((p, idx) => {
            const total = p.sizes.P + p.sizes.M + p.sizes.G + p.sizes.GG;
            const isLow = total <= (p.minStock || 5);
            return `
              <tr style="background:${idx%2===0?'#fff':'#f8fafc'};">
                <td style="padding:8px;display:flex;align-items:center;gap:8px;">
                  ${imgToHtml(p.image, 28, 28, 6)}
                  <div><div style="font-weight:bold;">${p.name}</div><div style="color:#94a3b8;font-size:9px;">${p.code} | ${p.color}</div></div>
                </td>
                <td style="padding:8px;text-align:center;font-weight:bold;">${p.sizes.P}</td>
                <td style="padding:8px;text-align:center;font-weight:bold;">${p.sizes.M}</td>
                <td style="padding:8px;text-align:center;font-weight:bold;">${p.sizes.G}</td>
                <td style="padding:8px;text-align:center;font-weight:bold;">${p.sizes.GG}</td>
                <td style="padding:8px;text-align:center;font-weight:bold;color:${isLow?'#dc2626':'#0f172a'};">${total}</td>
                <td style="padding:8px;text-align:center;">${p.minStock}</td>
                <td style="padding:8px;text-align:center;"><span style="padding:2px 8px;border-radius:99px;font-size:9px;font-weight:bold;color:white;background:${isLow?'#dc2626':'#10b981'};">${isLow?'BAIXO':'OK'}</span></td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;
  renderAndDownload(html, `Inventario_Estoque_${settings.brandName.replace(/\s+/g, '_')}.pdf`);
}

export function exportFinancePDF(settings: AppSettings, data: { totalGross: number; totalCost: number; netProfit: number; margin: string; ticketMedio: number; salesCount: number; chartImgMonthly: string; chartImgPayment: string }) {
  const logo = getLogo(settings);
  const html = `
    <div style="font-family:sans-serif;padding:24px;">
      <div style="display:flex;align-items:center;gap:12px;border-bottom:3px solid #d97706;padding-bottom:12px;margin-bottom:16px;">
        ${imgToHtml(logo, 48, 48, 10)}
        <div>
          <h1 style="font-size:20px;font-weight:bold;margin:0;color:#1e293b;">${settings.brandName}</h1>
          <p style="font-size:11px;color:#64748b;margin:2px 0 0 0;">Relatorio Financeiro - DRE Completo</p>
        </div>
        <div style="margin-left:auto;text-align:right;font-size:10px;color:#94a3b8;">Gerado em: ${new Date().toLocaleDateString('pt-BR')}</div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:20px;">
        <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:14px;text-align:center;">
          <div style="font-size:10px;color:#92400e;">Faturamento Bruto</div>
          <div style="font-size:20px;font-weight:bold;color:#d97706;">R$ ${data.totalGross.toFixed(2)}</div>
        </div>
        <div style="background:#ecfdf5;border:1px solid #a7f3d0;border-radius:10px;padding:14px;text-align:center;">
          <div style="font-size:10px;color:#065f46;">Lucro Liquido</div>
          <div style="font-size:20px;font-weight:bold;color:#10b981;">R$ ${data.netProfit.toFixed(2)}</div>
        </div>
        <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:10px;padding:14px;text-align:center;">
          <div style="font-size:10px;color:#0c4a6e;">Ticket Medio</div>
          <div style="font-size:20px;font-weight:bold;color:#0284c7;">R$ ${data.ticketMedio.toFixed(2)}</div>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px;">
        <div style="border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
          <div style="background:#f8fafc;padding:8px 12px;font-size:11px;font-weight:bold;color:#334155;border-bottom:1px solid #e2e8f0;">Evolucao Mensal</div>
          ${data.chartImgMonthly ? `<img src="${data.chartImgMonthly}" style="width:100%;height:220px;object-fit:contain;background:white;" />` : '<div style="height:220px;display:flex;align-items:center;justify-content:center;color:#cbd5e1;">Sem dados</div>'}
        </div>
        <div style="border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
          <div style="background:#f8fafc;padding:8px 12px;font-size:11px;font-weight:bold;color:#334155;border-bottom:1px solid #e2e8f0;">Formas de Pagamento</div>
          ${data.chartImgPayment ? `<img src="${data.chartImgPayment}" style="width:100%;height:220px;object-fit:contain;background:white;" />` : '<div style="height:220px;display:flex;align-items:center;justify-content:center;color:#cbd5e1;">Sem dados</div>'}
        </div>
      </div>

      <div style="border:2px solid #e2e8f0;border-radius:12px;overflow:hidden;">
        <div style="background:#1e293b;color:white;padding:12px 16px;font-size:13px;font-weight:bold;">Demonstrativo de Resultados (DRE)</div>
        <div style="padding:4px 0;">
          <div style="display:flex;justify-content:space-between;padding:14px 16px;border-bottom:1px solid #f1f5f9;font-size:12px;">
            <span style="color:#334155;">(+) Receita Bruta de Vendas</span><span style="font-weight:bold;">R$ ${data.totalGross.toFixed(2)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;padding:14px 16px;border-bottom:1px solid #f1f5f9;font-size:12px;background:#fef2f2;">
            <span style="color:#991b1b;">(-) Custo das Mercadorias (CMV)</span><span style="font-weight:bold;color:#dc2626;">- R$ ${data.totalCost.toFixed(2)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;padding:14px 16px;font-size:12px;background:#ecfdf5;">
            <span style="font-weight:bold;color:#065f46;">(=) Lucro Liquido Operacional</span><span style="font-weight:bold;font-size:16px;color:#059669;">R$ ${data.netProfit.toFixed(2)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;padding:14px 16px;font-size:12px;background:#fffbeb;border-radius:0 0 10px 10px;">
            <span style="font-weight:bold;color:#92400e;">Margem Liquida</span><span style="font-weight:bold;font-size:16px;color:#d97706;">${data.margin}%</span>
          </div>
        </div>
      </div>
    </div>
  `;
  renderAndDownload(html, `Relatorio_Financeiro_${settings.brandName.replace(/\s+/g, '_')}.pdf`);
}
