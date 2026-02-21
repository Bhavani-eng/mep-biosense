/**
 * pdfDownload.js
 * Opens a styled print window → user clicks "Save as PDF" in the browser print dialog.
 * Works in all browsers, no extra packages needed.
 */

function _printWindow(html, title) {
  const win = window.open('', '_blank', 'width=900,height=700');
  if (!win) {
    alert('Pop-up blocked! Please allow pop-ups for this site to download PDF reports.');
    return;
  }
  win.document.write(html);
  win.document.close();
  // Give images/fonts a moment to load, then trigger print
  win.onload = () => {
    setTimeout(() => {
      win.focus();
      win.print();
      // Close after print dialog dismissed
      win.onafterprint = () => win.close();
    }, 400);
  };
}

const BASE_STYLE = `
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Georgia, 'Times New Roman', serif; background: #fff; color: #2D2D2D; padding: 32px; font-size: 13px; line-height: 1.6; }
    @media print {
      body { padding: 0; }
      .no-print { display: none !important; }
    }
    .header { background: linear-gradient(135deg, #7B5CB0, #CDB4DB); color: white; padding: 28px 32px; border-radius: 14px; margin-bottom: 22px; }
    .header h1 { font-size: 22px; margin-bottom: 4px; font-weight: bold; }
    .header p  { font-size: 12px; opacity: 0.88; }
    .card { background: #fff; border: 1.5px solid #E5D9FF; border-radius: 12px; padding: 20px 24px; margin-bottom: 16px; }
    .card h2 { font-size: 15px; color: #7B5CB0; font-weight: bold; border-bottom: 2px solid #E5D9FF; padding-bottom: 8px; margin-bottom: 14px; }
    .risk-big { font-size: 52px; font-weight: bold; text-align: center; }
    .badge { display: inline-block; padding: 8px 22px; border-radius: 50px; font-size: 16px; font-weight: bold; color: white; margin: 6px 0; }
    .center { text-align: center; }
    .factor { margin-bottom: 12px; }
    .factor-row { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 3px; }
    .bar-bg { background: #E5D9FF; border-radius: 4px; height: 8px; }
    .bar-fill { background: linear-gradient(90deg, #B8A4E3, #7B5CB0); border-radius: 4px; height: 8px; }
    .rec-item { display: flex; gap: 10px; align-items: flex-start; margin-bottom: 10px; font-size: 13px; }
    .rec-num { background: #7B5CB0; color: white; border-radius: 50%; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold; flex-shrink: 0; margin-top: 1px; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    td, th { padding: 8px 12px; text-align: left; border-bottom: 1px solid #E5D9FF; }
    th { background: #F0E8FF; color: #7B5CB0; font-weight: bold; }
    .symptom-chip { display: inline-block; background: #F0E8FF; padding: 5px 12px; border-radius: 8px; margin: 3px; font-size: 12px; }
    .disclaimer { background: #FEF3C7; border: 1px solid #FCD34D; border-radius: 8px; padding: 12px 16px; font-size: 11px; color: #92400E; margin-top: 16px; }
    .footer { text-align: center; color: #9B7FD4; font-size: 11px; margin-top: 18px; padding-top: 10px; border-top: 1px solid #E5D9FF; }
    .print-btn { display: block; margin: 0 auto 18px; padding: 10px 28px; background: #7B5CB0; color: white; border: none; border-radius: 8px; font-size: 14px; cursor: pointer; font-weight: bold; }
    .print-btn:hover { background: #6a4d9b; }
  </style>
`;

function riskColorHex(level) {
  return { Low: '#16a34a', Medium: '#d97706', High: '#dc2626' }[level] || '#7B5CB0';
}

// ── PCOS ─────────────────────────────────────────────────────────
export function downloadPCOSPDF(entry) {
  const { formData = {}, result, date } = entry;
  const userEmail = localStorage.getItem('userEmail') || 'Patient';
  const dateStr = new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
  const rc = riskColorHex(result.riskLevel);

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>PCOS Report — BioSense</title>${BASE_STYLE}</head><body>
<button class="print-btn no-print" onclick="window.print()">🖨️ Save as PDF / Print</button>
<div class="header">
  <h1>💜 BioSense — PCOS Risk Assessment Report</h1>
  <p>Patient: ${userEmail} &nbsp;|&nbsp; Date: ${dateStr} &nbsp;|&nbsp; Age: ${formData.age || '—'} &nbsp;|&nbsp; Weight: ${formData.weight || '—'} kg &nbsp;|&nbsp; Height: ${formData.height || '—'} cm</p>
</div>

<div class="card center">
  <h2>Risk Score</h2>
  <div class="risk-big" style="color:${rc}">${result.risk}%</div>
  <div class="badge" style="background:${rc}">${result.riskLevel} Risk</div>
</div>

<div class="card">
  <h2>Top Influencing Factors</h2>
  ${(result.topFactors || []).map(f => `
    <div class="factor">
      <div class="factor-row"><span>${f.name}</span><span>${f.impact}%</span></div>
      <div class="bar-bg"><div class="bar-fill" style="width:${f.impact}%"></div></div>
    </div>`).join('')}
</div>

<div class="card">
  <h2>Personalised Recommendations</h2>
  ${(result.recommendations || []).map((r, i) => `
    <div class="rec-item"><div class="rec-num">${i + 1}</div><div>${r}</div></div>`).join('')}
</div>

<div class="disclaimer">⚠️ <strong>Medical Disclaimer:</strong> This report is for screening purposes only and does not constitute a medical diagnosis. Please consult a qualified gynaecologist or endocrinologist for professional evaluation and treatment.</div>
<div class="footer">Generated by BioSense AI Platform &nbsp;|&nbsp; ${dateStr}</div>
</body></html>`;

  _printWindow(html, 'PCOS Report');
}

// ── THYROID ───────────────────────────────────────────────────────
export function downloadThyroidPDF(entry) {
  const { formData = {}, result, date } = entry;
  const userEmail = localStorage.getItem('userEmail') || 'Patient';
  const dateStr = new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
  const condColor = { Normal: '#16a34a', Hypothyroid: '#2563eb', Hyperthyroid: '#dc2626' }[result.condition] || '#7B5CB0';
  const rc = riskColorHex(result.riskLevel);
  const RANGES = { TSH: { low: 0.4, high: 4.0 }, T3: { low: 0.9, high: 2.5 }, TT4: { low: 60, high: 150 }, FTI: { low: 60, high: 120 } };

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>Thyroid Report — BioSense</title>${BASE_STYLE}</head><body>
<button class="print-btn no-print" onclick="window.print()">🖨️ Save as PDF / Print</button>
<div class="header">
  <h1>💜 BioSense — Thyroid Analysis Report</h1>
  <p>Patient: ${userEmail} &nbsp;|&nbsp; Date: ${dateStr} &nbsp;|&nbsp; Age: ${formData.age || '—'} &nbsp;|&nbsp; Sex: ${formData.sex || '—'}</p>
</div>

<div class="card center">
  <h2>Diagnosis</h2>
  <div class="badge" style="background:${condColor}">${result.condition}</div>
  <br/><br/>
  <div style="font-size:14px; color:#555;">Risk Score: <strong style="color:${rc}">${result.risk}%</strong></div>
  <div class="badge" style="background:${rc}; font-size:13px; padding:6px 16px; margin-top:6px;">${result.riskLevel} Risk</div>
</div>

<div class="card">
  <h2>Biomarker Results</h2>
  <table>
    <tr><th>Hormone</th><th>Your Value</th><th>Normal Range</th><th>Unit</th><th>Status</th></tr>
    ${(result.hormoneData || []).map(h => {
      const r = RANGES[h.name] || { low: 0, high: 100 };
      const s = !h.value ? '—' : h.value < r.low ? '⬇ Low' : h.value > r.high ? '⬆ High' : '✓ Normal';
      return `<tr><td><strong>${h.name}</strong></td><td>${h.value || '—'}</td><td>${r.low}–${r.high}</td><td>${h.unit}</td><td>${s}</td></tr>`;
    }).join('')}
  </table>
</div>

<div class="card">
  <h2>Associated Symptoms</h2>
  ${(result.symptoms || []).map(s => `<span class="symptom-chip">${s}</span>`).join('')}
</div>

<div class="card">
  <h2>Personalised Recommendations</h2>
  ${(result.recommendations || []).map((r, i) => `
    <div class="rec-item"><div class="rec-num">${i + 1}</div><div>${r}</div></div>`).join('')}
</div>

<div class="disclaimer">⚠️ <strong>Medical Disclaimer:</strong> This report is for screening purposes only and does not constitute a medical diagnosis. Please consult a qualified endocrinologist for professional evaluation and treatment.</div>
<div class="footer">Generated by BioSense AI Platform &nbsp;|&nbsp; ${dateStr}</div>
</body></html>`;

  _printWindow(html, 'Thyroid Report');
}

// ── BREAST CANCER ─────────────────────────────────────────────────
export function downloadBreastPDF(entry) {
  const { formData = {}, result, date } = entry;
  const userEmail = localStorage.getItem('userEmail') || 'Patient';
  const dateStr = new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
  const rc = riskColorHex(result.riskLevel);

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>Breast Cancer Report — BioSense</title>${BASE_STYLE}</head><body>
<button class="print-btn no-print" onclick="window.print()">🖨️ Save as PDF / Print</button>
<div class="header">
  <h1>💜 BioSense — Breast Cancer Risk Screening Report</h1>
  <p>Patient: ${userEmail} &nbsp;|&nbsp; Date: ${dateStr} &nbsp;|&nbsp; Age: ${formData.age || '—'}</p>
</div>

<div class="card center">
  <h2>Risk Assessment</h2>
  <div class="risk-big" style="color:${rc}">${result.risk}%</div>
  <div class="badge" style="background:${rc}">${result.riskLevel} Risk</div>
</div>

<div class="card">
  <h2>Top Contributing Factors</h2>
  ${(result.topFactors || []).map(f => `
    <div class="factor">
      <div class="factor-row"><span>${f.name}</span><span>${f.impact}%</span></div>
      <div class="bar-bg"><div class="bar-fill" style="width:${f.impact}%"></div></div>
    </div>`).join('')}
</div>

<div class="card">
  <h2>Personalised Recommendations</h2>
  ${(result.recommendations || []).map((r, i) => `
    <div class="rec-item"><div class="rec-num">${i + 1}</div><div>${r}</div></div>`).join('')}
</div>

<div class="disclaimer">⚠️ <strong>Medical Disclaimer:</strong> This screening report is for educational purposes only and does not constitute a medical diagnosis. Please consult a qualified healthcare professional for proper evaluation.</div>
<div class="footer">Generated by BioSense AI Platform &nbsp;|&nbsp; ${dateStr}</div>
</body></html>`;

  _printWindow(html, 'Breast Cancer Report');
}

// ── ALL REPORTS ───────────────────────────────────────────────────
export function downloadAllPDFs(allResults) {
  allResults.forEach((entry, i) => {
    setTimeout(() => {
      if (entry.type === 'PCOS Risk Assessment') downloadPCOSPDF(entry);
      else if (entry.type === 'Thyroid Analysis') downloadThyroidPDF(entry);
      else if (entry.type === 'Breast Cancer Screening') downloadBreastPDF(entry);
    }, i * 1200); // stagger so windows don't collide
  });
}

// ── ALL IN ONE PDF ────────────────────────────────────────────────
export function downloadCombinedPDF(allResults) {
  if (!allResults || allResults.length === 0) {
    alert('No screening results found. Please complete at least one screening first.');
    return;
  }

  const userEmail = localStorage.getItem('userEmail') || 'Patient';
  const date = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
  const RANGES = { TSH: { low: 0.4, high: 4.0 }, T3: { low: 0.9, high: 2.5 }, TT4: { low: 60, high: 150 }, FTI: { low: 60, high: 120 } };

  function rc(level) { return { Low: '#16a34a', Medium: '#d97706', High: '#dc2626' }[level] || '#7B5CB0'; }

  function sectionPCOS(entry) {
    const { formData = {}, result, date: d } = entry;
    const dateStr = new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const c = rc(result.riskLevel);
    return `
      <div class="section-header" style="background:linear-gradient(135deg,#F9A8D4,#FDA4AF)">
        💗 PCOS Risk Assessment &nbsp;|&nbsp; ${dateStr}
      </div>
      <div class="result-row">
        <div class="result-box">
          <div class="big-num" style="color:${c}">${result.risk}%</div>
          <div class="badge" style="background:${c}">${result.riskLevel} Risk</div>
          <p style="margin-top:8px;font-size:12px;color:#555">Age: ${formData.age || '—'} | Weight: ${formData.weight || '—'} kg | Height: ${formData.height || '—'} cm</p>
        </div>
        <div class="factors-box">
          <p class="mini-title">Top Factors</p>
          ${(result.topFactors || []).map(f => `
            <div class="factor">
              <div class="f-row"><span>${f.name}</span><span>${f.impact}%</span></div>
              <div class="bar-bg"><div class="bar-fill" style="width:${f.impact}%"></div></div>
            </div>`).join('')}
        </div>
      </div>
      <div class="recs-box">
        <p class="mini-title">Recommendations</p>
        ${(result.recommendations || []).map((r, i) => `<div class="rec-item"><div class="rec-num">${i + 1}</div><div>${r}</div></div>`).join('')}
      </div>`;
  }

  function sectionThyroid(entry) {
    const { formData = {}, result, date: d } = entry;
    const dateStr = new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const condColor = { Normal: '#16a34a', Hypothyroid: '#2563eb', Hyperthyroid: '#dc2626' }[result.condition] || '#7B5CB0';
    const c = rc(result.riskLevel);
    return `
      <div class="section-header" style="background:linear-gradient(135deg,#C4B5FD,#A78BFA)">
        🔬 Thyroid Analysis &nbsp;|&nbsp; ${dateStr}
      </div>
      <div class="result-row">
        <div class="result-box">
          <div class="badge" style="background:${condColor};font-size:18px;padding:10px 20px">${result.condition}</div>
          <br/><br/>
          <div style="font-size:13px;color:#555">Risk: <strong style="color:${c}">${result.risk}%</strong></div>
          <div class="badge" style="background:${c};font-size:12px;padding:5px 14px;margin-top:6px">${result.riskLevel} Risk</div>
          <p style="margin-top:8px;font-size:12px;color:#555">Age: ${formData.age || '—'} | Sex: ${formData.sex || '—'}</p>
        </div>
        <div class="factors-box">
          <p class="mini-title">Biomarkers</p>
          <table class="bio-table">
            <tr><th>Test</th><th>Value</th><th>Range</th><th>Status</th></tr>
            ${(result.hormoneData || []).map(h => {
              const r = RANGES[h.name] || { low: 0, high: 100 };
              const s = !h.value ? '—' : h.value < r.low ? '⬇ Low' : h.value > r.high ? '⬆ High' : '✓ OK';
              return `<tr><td>${h.name}</td><td>${h.value || '—'}</td><td>${r.low}–${r.high}</td><td>${s}</td></tr>`;
            }).join('')}
          </table>
        </div>
      </div>
      <div class="recs-box">
        <p class="mini-title">Recommendations</p>
        ${(result.recommendations || []).map((r, i) => `<div class="rec-item"><div class="rec-num">${i + 1}</div><div>${r}</div></div>`).join('')}
      </div>`;
  }

  function sectionBreast(entry) {
    const { formData = {}, result, date: d } = entry;
    const dateStr = new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const c = rc(result.riskLevel);
    return `
      <div class="section-header" style="background:linear-gradient(135deg,#A5B4FC,#818CF8)">
        🩺 Breast Cancer Screening &nbsp;|&nbsp; ${dateStr}
      </div>
      <div class="result-row">
        <div class="result-box">
          <div class="big-num" style="color:${c}">${result.risk}%</div>
          <div class="badge" style="background:${c}">${result.riskLevel} Risk</div>
          <p style="margin-top:8px;font-size:12px;color:#555">Age: ${formData.age || '—'}</p>
        </div>
        <div class="factors-box">
          <p class="mini-title">Top Factors</p>
          ${(result.topFactors || []).map(f => `
            <div class="factor">
              <div class="f-row"><span>${f.name}</span><span>${f.impact}%</span></div>
              <div class="bar-bg"><div class="bar-fill" style="width:${f.impact}%"></div></div>
            </div>`).join('')}
        </div>
      </div>
      <div class="recs-box">
        <p class="mini-title">Recommendations</p>
        ${(result.recommendations || []).map((r, i) => `<div class="rec-item"><div class="rec-num">${i + 1}</div><div>${r}</div></div>`).join('')}
      </div>`;
  }

  const sectionsHTML = allResults.map(entry => {
    if (entry.type === 'PCOS Risk Assessment')    return sectionPCOS(entry);
    if (entry.type === 'Thyroid Analysis')         return sectionThyroid(entry);
    if (entry.type === 'Breast Cancer Screening')  return sectionBreast(entry);
    return '';
  }).join('<div class="page-break"></div>');

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>BioSense Combined Health Report</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Georgia, serif; background: #fff; color: #2D2D2D; padding: 30px; font-size: 13px; line-height: 1.5; }
  @media print { body { padding: 0; } .no-print { display: none !important; } .page-break { page-break-after: always; } }
  .print-btn { display: block; margin: 0 auto 20px; padding: 10px 28px; background: #7B5CB0; color: white; border: none; border-radius: 8px; font-size: 14px; cursor: pointer; font-weight: bold; }
  .master-header { background: linear-gradient(135deg, #7B5CB0, #CDB4DB); color: white; padding: 28px 32px; border-radius: 14px; margin-bottom: 24px; }
  .master-header h1 { font-size: 24px; margin-bottom: 4px; }
  .master-header p { font-size: 12px; opacity: 0.88; }
  .toc { background: #F8F4FF; border: 1.5px solid #E5D9FF; border-radius: 10px; padding: 16px 20px; margin-bottom: 22px; }
  .toc h2 { font-size: 14px; color: #7B5CB0; margin-bottom: 10px; }
  .toc-item { display: flex; justify-content: space-between; font-size: 13px; padding: 4px 0; border-bottom: 1px dashed #E5D9FF; }
  .section-header { color: white; padding: 12px 18px; border-radius: 10px; font-size: 15px; font-weight: bold; margin-bottom: 14px; margin-top: 10px; }
  .result-row { display: flex; gap: 16px; margin-bottom: 14px; }
  .result-box { background: #F8F4FF; border: 1.5px solid #E5D9FF; border-radius: 10px; padding: 16px; text-align: center; min-width: 160px; flex-shrink: 0; }
  .big-num { font-size: 44px; font-weight: bold; }
  .badge { display: inline-block; padding: 7px 18px; border-radius: 50px; font-size: 14px; font-weight: bold; color: white; margin: 4px 0; }
  .factors-box { flex: 1; background: #F8F4FF; border: 1.5px solid #E5D9FF; border-radius: 10px; padding: 14px; }
  .mini-title { font-size: 11px; font-weight: bold; color: #7B5CB0; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 10px; }
  .factor { margin-bottom: 10px; }
  .f-row { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 3px; }
  .bar-bg { background: #E5D9FF; border-radius: 4px; height: 7px; }
  .bar-fill { background: linear-gradient(90deg, #B8A4E3, #7B5CB0); border-radius: 4px; height: 7px; }
  .recs-box { background: #F8F4FF; border: 1.5px solid #E5D9FF; border-radius: 10px; padding: 14px; margin-bottom: 6px; }
  .rec-item { display: flex; gap: 10px; align-items: flex-start; margin-bottom: 8px; font-size: 12px; }
  .rec-num { background: #7B5CB0; color: white; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: bold; flex-shrink: 0; margin-top: 1px; }
  .bio-table { width: 100%; border-collapse: collapse; font-size: 12px; }
  .bio-table td, .bio-table th { padding: 6px 8px; border-bottom: 1px solid #E5D9FF; text-align: left; }
  .bio-table th { background: #EDE9FE; color: #7B5CB0; font-weight: bold; }
  .disclaimer { background: #FEF3C7; border: 1px solid #FCD34D; border-radius: 8px; padding: 12px 16px; font-size: 11px; color: #92400E; margin-top: 20px; }
  .footer { text-align: center; color: #9B7FD4; font-size: 11px; margin-top: 16px; padding-top: 10px; border-top: 1px solid #E5D9FF; }
  .page-break { height: 2px; background: #E5D9FF; margin: 20px 0; }
</style></head><body>
<button class="print-btn no-print" onclick="window.print()">🖨️ Save as PDF / Print</button>

<div class="master-header">
  <h1>💜 BioSense — Combined Health Screening Report</h1>
  <p>Patient: ${userEmail} &nbsp;|&nbsp; Generated: ${date} &nbsp;|&nbsp; Total Screenings: ${allResults.length}</p>
</div>

<div class="toc">
  <h2>📋 Contents</h2>
  ${allResults.map((e, i) => `
    <div class="toc-item">
      <span>${i + 1}. ${e.type}</span>
      <span>${new Date(e.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} — ${e.result?.riskLevel || e.result?.condition || '—'} Risk</span>
    </div>`).join('')}
</div>

${sectionsHTML}

<div class="disclaimer">⚠️ <strong>Medical Disclaimer:</strong> This combined report is for screening purposes only and does not constitute a medical diagnosis. Please consult qualified healthcare professionals for evaluation and treatment.</div>
<div class="footer">Generated by BioSense AI Platform &nbsp;|&nbsp; ${date} &nbsp;|&nbsp; All information is confidential</div>
</body></html>`;

  _printWindow(html, 'BioSense Combined Report');
}
