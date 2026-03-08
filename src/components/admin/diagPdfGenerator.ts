import { CHECKLIST } from "@/data/checklist";
import { toast } from "sonner";

const CAT_HEX = ['#3B82F6','#6366F1','#10B981','#F59E0B','#EF4444','#8B5CF6','#06B6D4'];
const TOTAL_PTS = CHECKLIST.reduce((s, cat) => s + cat.items.reduce((ss, it) => ss + it.pts, 0), 0);

const SHORT_LABELS = ['Recursos', 'Gestión Integral', 'Gestión Salud', 'Peligros/Riesgos', 'Amenazas', 'Verificación', 'Mejoramiento'];

function generateRadarSVG(catVals: number[], labels: string[], width = 520, height = 380): string {
  const cx = width / 2, cy = height / 2 + 5;
  const r = Math.min(cx, cy) - 70;
  const n = catVals.length;
  const angleStep = (2 * Math.PI) / n;
  const startAngle = -Math.PI / 2;

  const getPoint = (index: number, value: number) => {
    const angle = startAngle + index * angleStep;
    const dist = (value / 100) * r;
    return { x: cx + dist * Math.cos(angle), y: cy + dist * Math.sin(angle) };
  };

  let gridLines = '';
  for (const pct of [25, 50, 75, 100]) {
    const rr = (pct / 100) * r;
    gridLines += `<circle cx="${cx}" cy="${cy}" r="${rr}" fill="none" stroke="#e5e7eb" stroke-width="0.8"/>`;
  }

  let axisLines = '';
  for (let i = 0; i < n; i++) {
    const p = getPoint(i, 100);
    axisLines += `<line x1="${cx}" y1="${cy}" x2="${p.x}" y2="${p.y}" stroke="#e5e7eb" stroke-width="0.6"/>`;
    const lp = getPoint(i, 125);
    axisLines += `<text x="${lp.x}" y="${lp.y}" text-anchor="middle" dominant-baseline="central" font-size="11" fill="#374151" font-weight="600">${labels[i]}</text>`;
  }

  const points = catVals.map((v, i) => getPoint(i, v));
  const poly = points.map(p => `${p.x},${p.y}`).join(' ');
  const dataPath = `<polygon points="${poly}" fill="rgba(59,130,246,0.12)" stroke="#3B82F6" stroke-width="2"/>`;

  const dots = points.map((p, i) =>
    `<circle cx="${p.x}" cy="${p.y}" r="6" fill="${CAT_HEX[i]}" stroke="white" stroke-width="2"/>`
  ).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <rect width="${width}" height="${height}" fill="white"/>
    ${gridLines}${axisLines}${dataPath}${dots}
  </svg>`;
}

function generateBarSVG(catVals: number[], labels: string[], width = 520, height = 340): string {
  const margin = { top: 25, right: 20, bottom: 80, left: 45 };
  const w = width - margin.left - margin.right;
  const h = height - margin.top - margin.bottom;
  const n = catVals.length;
  const barW = Math.min(w / n * 0.6, 50);
  const gap = w / n;

  let bars = '';
  for (let i = 0; i < n; i++) {
    const x = margin.left + i * gap + (gap - barW) / 2;
    const barH = (catVals[i] / 100) * h;
    const y = margin.top + h - barH;
    bars += `<rect x="${x}" y="${y}" width="${barW}" height="${barH}" fill="${CAT_HEX[i]}" rx="4"/>`;
    bars += `<text x="${x + barW/2}" y="${y - 6}" text-anchor="middle" font-size="11" fill="#374151" font-weight="700">${catVals[i]}%</text>`;
    // Rotated X label
    const lx = margin.left + i * gap + gap / 2;
    const ly = margin.top + h + 12;
    bars += `<text x="${lx}" y="${ly}" text-anchor="end" font-size="10.5" fill="#374151" font-weight="500" transform="rotate(-35 ${lx} ${ly})">${labels[i]}</text>`;
  }

  let yAxis = '';
  for (const v of [0, 25, 50, 75, 100]) {
    const y = margin.top + h - (v / 100) * h;
    yAxis += `<line x1="${margin.left}" y1="${y}" x2="${margin.left + w}" y2="${y}" stroke="#f3f4f6" stroke-width="1"/>`;
    yAxis += `<text x="${margin.left - 6}" y="${y + 3}" text-anchor="end" font-size="9" fill="#9ca3af">${v}%</text>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <rect width="${width}" height="${height}" fill="white"/>
    ${yAxis}${bars}
  </svg>`;
}

export function downloadDiagHTML(diag: any, client: any) {
  const d = diag;
  const u = client;
  const catScores = (d.cat_scores as any) || {};
  const answers = (d.answers as any) || {};
  const color = d.level === "high" ? "#059669" : d.level === "medium" ? "#D97706" : "#DC2626";
  const lvlTxt = d.level === "high" ? "Alto" : d.level === "medium" ? "Medio" : "Bajo";

  const catVals = CHECKLIST.map(c => catScores[c.id] || 0);
  const catLabels = SHORT_LABELS;

  const radarSVG = generateRadarSVG(catVals, catLabels);
  const barSVG = generateBarSVG(catVals, catLabels);

  // Color legend table
  const colorLegendHTML = `
    <div style="margin-bottom:20px">
      <div style="font-size:15px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.4px;margin-bottom:10px">Referencia de categorías</div>
      <table style="width:100%;border-collapse:collapse;border:1px solid #e5e7eb;border-radius:6px;overflow:hidden">
        <thead><tr style="background:#f8fafc">
          <th style="padding:9px 12px;font-size:14px;color:#374151;text-align:left;font-weight:700;border-bottom:1px solid #e5e7eb">Color</th>
          <th style="padding:9px 12px;font-size:14px;color:#374151;text-align:left;font-weight:700;border-bottom:1px solid #e5e7eb">Categoría</th>
          <th style="padding:9px 12px;font-size:14px;color:#374151;text-align:center;font-weight:700;border-bottom:1px solid #e5e7eb">Ítems OK</th>
          <th style="padding:9px 12px;font-size:14px;color:#374151;text-align:center;font-weight:700;border-bottom:1px solid #e5e7eb">Pts obtenidos</th>
          <th style="padding:9px 12px;font-size:14px;color:#374151;text-align:center;font-weight:700;border-bottom:1px solid #e5e7eb">Pts posibles</th>
          <th style="padding:9px 12px;font-size:14px;color:#374151;text-align:center;font-weight:700;border-bottom:1px solid #e5e7eb">Cumplimiento</th>
        </tr></thead>
        <tbody>
        ${CHECKLIST.map((cat, i) => {
          const s = catScores[cat.id] || 0;
          const sc = s >= 80 ? '#059669' : s >= 50 ? '#D97706' : '#DC2626';
          const ptsT = cat.items.reduce((a, it) => a + it.pts, 0);
          const ptsE = cat.items.filter(it => answers[it.id]).reduce((a, it) => a + it.pts, 0);
          const answered = cat.items.filter(it => answers[it.id]).length;
          return `<tr style="border-bottom:1px solid #f3f4f6">
            <td style="padding:7px 12px;text-align:center"><div style="width:16px;height:16px;border-radius:4px;background:${CAT_HEX[i]};display:inline-block"></div></td>
            <td style="padding:8px 12px;font-size:14.5px;color:#0A2540;font-weight:600">${cat.icon} ${cat.title.split('.')[1]?.trim()}</td>
            <td style="padding:8px 12px;font-size:14.5px;text-align:center;color:#374151">${answered}/${cat.items.length}</td>
            <td style="padding:8px 12px;font-size:14.5px;text-align:center;color:${sc};font-weight:700">${ptsE.toFixed(1)}</td>
            <td style="padding:8px 12px;font-size:14.5px;text-align:center;color:#6b7280">${ptsT}</td>
            <td style="padding:8px 12px;font-size:15px;text-align:center;color:${sc};font-weight:700">${s}%</td>
          </tr>`;
        }).join('')}
        </tbody>
      </table>
    </div>`;

  // Meta grid
  const metaItems = [
    ['Empresa', u?.empresa], ['Sector', u?.sector], ['Trabajadores', u?.trabajadores],
    ['Riesgo', u?.riesgo], ['ARL', u?.arl], ['Ciudad', u?.ciudad]
  ];
  const metaHTML = metaItems.map(([l, v]) =>
    `<div style="background:#f8fafc;padding:10px 14px;border-radius:6px;border:1px solid #e5e7eb">
      <div style="font-size:12.5px;color:#9ca3af;font-weight:700;text-transform:uppercase;letter-spacing:0.4px">${l}</div>
      <div style="font-size:15.5px;font-weight:700;color:#0A2540;margin-top:3px">${v || '—'}</div>
    </div>`
  ).join('');

  const catRows = CHECKLIST.map(cat => {
    const s = catScores[cat.id] || 0;
    const c = s >= 80 ? "#059669" : s >= 50 ? "#D97706" : "#DC2626";
    const ptsTotal = cat.items.reduce((a, i) => a + i.pts, 0);
    const ptsEarned = cat.items.filter(it => answers[it.id]).reduce((a, it) => a + it.pts, 0);
    const answered = cat.items.filter(it => answers[it.id]).length;
    const rows = cat.items.map(item => {
      const ok = answers[item.id];
      return `<tr style="border-bottom:1px solid #f3f4f6">
        <td style="padding:7px 12px;font-size:14px;color:#374151">${item.text}</td>
        <td style="padding:7px 12px;font-size:14.5px;text-align:center;color:${ok ? '#059669' : '#DC2626'};font-weight:700">${ok ? '✓' : '✗'}</td>
        <td style="padding:7px 12px;font-size:13.5px;text-align:center;color:#6b7280">${item.pts} pts</td>
      </tr>`;
    }).join('');
    return `<div style="margin-bottom:16px;break-inside:avoid">
      <div style="display:flex;justify-content:space-between;align-items:center;background:#f8fafc;padding:9px 14px;border-radius:5px;border-left:4px solid ${c};margin-bottom:5px">
        <span style="font-size:15.5px;font-weight:700;color:#0A2540">${cat.icon} ${cat.title}</span>
        <div style="text-align:right">
          <span style="font-size:15.5px;font-weight:700;color:${c}">${s}%</span>
          <span style="font-size:12.5px;color:#9ca3af;margin-left:8px">${answered}/${cat.items.length} ítems · ${ptsEarned.toFixed(1)}/${ptsTotal} pts</span>
        </div>
      </div>
      <table style="width:100%;border-collapse:collapse">${rows}</table>
    </div>`;
  }).join('');

  const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<title>Diagnóstico SST — ${(u?.empresa || '').replace(/</g, '&lt;')}</title>
<style>
  body{font-family:Arial,Helvetica,sans-serif;margin:0;padding:0;color:#0A2540;font-size:14.5px}
  @page{size:A4;margin:0}
  @media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
</style>
</head><body>
<div style="background:linear-gradient(135deg,#0A2540,#1E3A8A);color:white;padding:28px 40px">
  <h1 style="margin:0;font-size:24px;font-weight:700">Diagnóstico SG-SST — ${u?.empresa || ''}</h1>
  <p style="margin:6px 0 0;opacity:0.75;font-size:14.5px">${u?.nombre || ''} &nbsp;·&nbsp; ${d.fecha} &nbsp;·&nbsp; SafeWork SST Consultoría</p>
</div>
<div style="padding:28px 40px">
  <div style="text-align:center;margin-bottom:22px">
    <div style="display:inline-block;width:100px;height:100px;border-radius:50%;border:6px solid ${color};box-sizing:border-box;padding-top:16px">
      <div style="font-size:32px;font-weight:700;color:${color};line-height:1">${d.score}</div>
      <div style="font-size:12.5px;color:#6b7280">/ 100 pts</div>
      <div style="font-size:12.5px;font-weight:700;color:${color};margin-top:1px">Nivel ${lvlTxt}</div>
    </div>
  </div>
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:22px">${metaHTML}</div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px">
    <div style="background:#f8fafc;padding:14px;border-radius:8px;border:1px solid #e5e7eb;text-align:center">
      <div style="font-size:13px;color:#6b7280;font-weight:700;text-transform:uppercase;margin-bottom:10px;letter-spacing:0.4px">Radar de cumplimiento</div>
      ${radarSVG}
    </div>
    <div style="background:#f8fafc;padding:14px;border-radius:8px;border:1px solid #e5e7eb;text-align:center">
      <div style="font-size:13px;color:#6b7280;font-weight:700;text-transform:uppercase;margin-bottom:10px;letter-spacing:0.4px">Puntaje por categoría</div>
      ${barSVG}
    </div>
  </div>
  ${colorLegendHTML}
  <h3 style="font-size:17px;font-weight:700;border-bottom:2px solid #1E3A8A;padding-bottom:6px;margin-bottom:14px;color:#0A2540">Detalle por categoría</h3>
  ${catRows}
  <div style="margin-top:24px;padding:13px 16px;background:#eff6ff;border-radius:6px;border-left:4px solid #3B82F6;font-size:12px;color:#1E3A8A">
    <span style="font-size:13.5px">Informe generado por <strong>SafeWork SST Consultoría</strong> &nbsp;·&nbsp; ${new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}
    &nbsp;·&nbsp; Basado en <strong>Decreto 1072/2015</strong> y <strong>Resolución 0312/2019</strong>.</span>
  </div>
</div>
</body></html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const winUrl = URL.createObjectURL(blob);
  const win = window.open(winUrl, '_blank', 'width=1000,height=780');
  if (win) { win.onload = () => setTimeout(() => win.print(), 400); }
  else { toast.error('Permite ventanas emergentes para descargar el PDF'); }
}
