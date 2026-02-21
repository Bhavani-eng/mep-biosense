import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Activity, AlertCircle, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ToggleSwitch from '../components/ToggleSwitch';
import LoadingSpinner from '../components/LoadingSpinner';
import BackgroundBlobs from '../components/BackgroundBlobs';
import { saveThyroidResult } from '../services/healthStore';
import { downloadThyroidPDF } from '../services/pdfDownload';

// ── Rule-based thyroid engine (runs in browser, no backend needed) ──
const RANGES = {
  TSH:  { low: 0.4,  high: 4.0,  mid: 2.2,  unit: 'mIU/L'  },
  T3:   { low: 0.9,  high: 2.5,  mid: 1.7,  unit: 'nmol/L'  },
  TT4:  { low: 60,   high: 150,  mid: 105,  unit: 'nmol/L'  },
  FTI:  { low: 60,   high: 120,  mid: 90,   unit: 'index'   },
};

function analyzeThyroid(formData) {
  const tsh = parseFloat(formData.tsh) || null;
  const t3  = parseFloat(formData.t3)  || null;
  const tt4 = parseFloat(formData.tt4) || null;
  const fti = parseFloat(formData.fti) || null;
  const goitre = formData.goitre === true || formData.goitre === 'true';
  const tumor  = formData.tumor  === true || formData.tumor  === 'true';

  let hypoScore  = 0;
  let hyperScore = 0;
  let totalWeight = 0;

  // TSH — most sensitive marker (weight = 3)
  if (tsh !== null) {
    totalWeight += 3;
    if (tsh > RANGES.TSH.high)      hypoScore  += 3;
    else if (tsh < RANGES.TSH.low)  hyperScore += 3;
  }
  // T3 — weight 2
  if (t3 !== null) {
    totalWeight += 2;
    if (t3 < RANGES.T3.low)         hypoScore  += 2;
    else if (t3 > RANGES.T3.high)   hyperScore += 2;
  }
  // TT4 — weight 2
  if (tt4 !== null) {
    totalWeight += 2;
    if (tt4 < RANGES.TT4.low)       hypoScore  += 2;
    else if (tt4 > RANGES.TT4.high) hyperScore += 2;
  }
  // FTI — weight 1
  if (fti !== null) {
    totalWeight += 1;
    if (fti < RANGES.FTI.low)       hypoScore  += 1;
    else if (fti > RANGES.FTI.high) hyperScore += 1;
  }
  // Clinical flags
  if (goitre) hypoScore  += 0.5;
  if (tumor)  hypoScore  += 0.5;

  let condition, confidence;
  if (totalWeight === 0) {
    condition  = 'Normal';
    confidence = 70;
  } else {
    const hypoPct  = hypoScore  / totalWeight;
    const hyperPct = hyperScore / totalWeight;
    if (hypoPct >= 0.5) {
      condition  = 'Hypothyroid';
      confidence = Math.min(Math.round(hypoPct * 100), 97);
    } else if (hyperPct >= 0.5) {
      condition  = 'Hyperthyroid';
      confidence = Math.min(Math.round(hyperPct * 100), 97);
    } else {
      condition  = 'Normal';
      confidence = Math.max(Math.round((1 - Math.max(hypoPct, hyperPct)) * 100), 65);
    }
  }

  // Hormone data for chart
  const hormoneData = [
    { name: 'TSH',  value: tsh  ?? 0, normal: RANGES.TSH.mid,  unit: 'mIU/L'  },
    { name: 'T3',   value: t3   ?? 0, normal: RANGES.T3.mid,   unit: 'nmol/L' },
    { name: 'TT4',  value: tt4  ?? 0, normal: RANGES.TT4.mid,  unit: 'nmol/L' },
    { name: 'FTI',  value: fti  ?? 0, normal: RANGES.FTI.mid,  unit: 'index'  },
  ];

  // Dynamic symptoms
  const symptomsMap = {
    Normal:      ['No significant symptoms expected', 'Maintain regular check-ups', 'Balanced energy levels', 'Stable weight'],
    Hypothyroid: ['Fatigue and weakness', 'Weight changes', 'Temperature sensitivity', 'Mood changes'],
    Hyperthyroid:['Rapid heartbeat', 'Unexplained weight loss', 'Anxiety or nervousness', 'Heat intolerance'],
  };

  // Risk % and riskLevel
  let risk = 10;
  if (condition !== 'Normal') {
    const abnormalPct = Math.max(hypoScore, hyperScore) / (totalWeight || 1);
    risk = Math.min(Math.round(abnormalPct * 100), 97);
  }
  const riskLevel = risk < 30 ? 'Low' : risk < 60 ? 'Medium' : 'High';

  // Dynamic recommendations based on actual inputs
  const recommendations = buildThyroidRecs(condition, formData, { tsh, t3, tt4, fti });

  return { condition, confidence, risk, riskLevel, hormoneData, symptoms: symptomsMap[condition], recommendations };
}

function buildThyroidRecs(condition, form, vals) {
  const recs = [];
  const goitre = form.goitre === true || form.goitre === 'true';
  const tumor  = form.tumor  === true || form.tumor  === 'true';
  const { tsh, t3, tt4, fti } = vals;

  if (condition === 'Normal') {
    recs.push('Your thyroid levels appear normal — maintain annual thyroid function tests.');
    if (goitre) recs.push('You reported goitre — get an ultrasound to rule out nodules even with normal hormone levels.');
    if (tumor)  recs.push('You reported a thyroid tumor — follow up with your specialist regardless of hormone levels.');
    recs.push('Ensure adequate iodine intake through iodised salt and seafood.');
    recs.push('Continue healthy lifestyle and schedule a recheck in 12 months.');

  } else if (condition === 'Hypothyroid') {
    recs.push('Consult an endocrinologist for comprehensive thyroid evaluation and possible thyroxine therapy.');
    if (tsh && tsh > 10)
      recs.push(`Your TSH is significantly elevated (${tsh} mIU/L) — medication may be required promptly.`);
    else if (tsh && tsh > 4)
      recs.push(`Your TSH is mildly elevated (${tsh} mIU/L) — early intervention can prevent progression.`);
    if (t3 && t3 < RANGES.T3.low)
      recs.push(`Low T3 (${t3} nmol/L) detected — ensure adequate selenium and zinc in your diet.`);
    if (goitre) recs.push('Goitre present — an ultrasound is essential to assess thyroid size and nodules.');
    recs.push('Schedule repeat thyroid function tests every 6–8 weeks until stable.');
    recs.push('Avoid large amounts of raw cruciferous vegetables (broccoli, kale) as they can suppress thyroid.');
    recs.push('Monitor symptoms: fatigue, weight gain, cold sensitivity, dry skin, constipation.');

  } else {
    recs.push('Seek urgent endocrinologist referral — hyperthyroidism requires prompt medical attention.');
    if (tsh !== null && tsh < 0.1)
      recs.push(`Very suppressed TSH (${tsh} mIU/L) — this indicates significant overactivity.`);
    if (t3 && t3 > RANGES.T3.high)
      recs.push(`Elevated T3 (${t3} nmol/L) — antithyroid medication may be needed.`);
    recs.push('Avoid iodine supplements and iodine-rich foods until evaluated.');
    recs.push('Monitor for heart rhythm irregularities — hyperthyroidism can affect the heart.');
    if (goitre) recs.push('Goitre with hyperthyroidism may indicate Graves\' disease — discuss with specialist.');
    recs.push('Manage stress and avoid caffeine and stimulants which worsen symptoms.');
  }
  return recs;
}

// ── PDF Download ──────────────────────────────────────────────────
function downloadReport(formData, result) {
  const userEmail = localStorage.getItem('userEmail') || 'Patient';
  const date = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });

  const conditionColors = { Normal: '#16a34a', Hypothyroid: '#2563eb', Hyperthyroid: '#dc2626' };
  const color = conditionColors[result.condition] || '#7B5CB0';

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<title>BioSense Thyroid Report</title>
<style>
  body { font-family: Georgia, serif; background: #F8F4FF; margin: 0; padding: 30px; color: #2D2D2D; }
  .header { background: linear-gradient(135deg,#7B5CB0,#CDB4DB); color: white; padding: 30px; border-radius: 16px; margin-bottom: 24px; }
  .header h1 { margin: 0 0 4px; font-size: 28px; }
  .header p  { margin: 0; opacity: 0.85; font-size: 14px; }
  .card { background: white; border-radius: 12px; padding: 24px; margin-bottom: 18px; box-shadow: 0 2px 12px rgba(123,92,176,0.1); }
  .card h2 { margin: 0 0 16px; color: #7B5CB0; font-size: 18px; border-bottom: 2px solid #E5D9FF; padding-bottom: 8px; }
  .condition-badge { display:inline-block; padding: 10px 24px; border-radius: 50px; font-size: 20px; font-weight: bold; color: white; background: ${color}; margin: 8px 0; }
  .confidence { color: #7B5CB0; font-size: 16px; margin-top: 8px; }
  table { width: 100%; border-collapse: collapse; }
  td, th { padding: 10px 14px; text-align: left; border-bottom: 1px solid #E5D9FF; font-size: 14px; }
  th { background: #F0E8FF; color: #7B5CB0; font-weight: 600; }
  .rec { display: flex; gap: 12px; align-items: flex-start; margin-bottom: 12px; }
  .rec-num { background: #7B5CB0; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 12px; flex-shrink: 0; margin-top: 2px; }
  .symptom { background: #F0E8FF; padding: 8px 14px; border-radius: 8px; margin: 4px; display: inline-block; font-size: 14px; }
  .disclaimer { background: #FEF3C7; border: 1px solid #FCD34D; border-radius: 8px; padding: 14px; font-size: 12px; color: #92400E; margin-top: 18px; }
  .footer { text-align: center; color: #9B7FD4; font-size: 12px; margin-top: 20px; }
</style>
</head>
<body>
<div class="header">
  <h1>💜 BioSense — Thyroid Analysis Report</h1>
  <p>Patient: ${userEmail} &nbsp;|&nbsp; Date: ${date} &nbsp;|&nbsp; Age: ${formData.age} &nbsp;|&nbsp; Sex: ${formData.sex}</p>
</div>

<div class="card" style="text-align:center">
  <h2>Diagnosis</h2>
  <div class="condition-badge">${result.condition}</div>
  <div class="confidence">Confidence: ${result.confidence}%</div>
</div>

<div class="card">
  <h2>Biomarker Results</h2>
  <table>
    <tr><th>Hormone</th><th>Your Value</th><th>Normal Range</th><th>Unit</th><th>Status</th></tr>
    ${result.hormoneData.map(h => {
      const r = RANGES[h.name];
      const status = h.value === 0 ? '—' : h.value < r.low ? '⬇ Low' : h.value > r.high ? '⬆ High' : '✓ Normal';
      return `<tr><td><strong>${h.name}</strong></td><td>${h.value || '—'}</td><td>${r.low}–${r.high}</td><td>${h.unit}</td><td>${status}</td></tr>`;
    }).join('')}
  </table>
</div>

<div class="card">
  <h2>Associated Symptoms</h2>
  ${result.symptoms.map(s => `<span class="symptom">${s}</span>`).join('')}
</div>

<div class="card">
  <h2>Personalised Recommendations</h2>
  ${result.recommendations.map((r, i) => `<div class="rec"><div class="rec-num">${i+1}</div><div>${r}</div></div>`).join('')}
</div>

<div class="disclaimer">
  ⚠️ <strong>Medical Disclaimer:</strong> This report is for screening purposes only and does not constitute a medical diagnosis. Please consult a qualified endocrinologist for professional evaluation and treatment.
</div>
<div class="footer">Generated by BioSense AI Platform &nbsp;|&nbsp; ${date}</div>
</body></html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `BioSense_Thyroid_Report_${Date.now()}.html`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Component ─────────────────────────────────────────────────────
const ThyroidPrediction = () => {
  const [formData, setFormData] = useState({
    age: '', sex: '', goitre: false, tumor: false,
    tsh: '', t3: '', tt4: '', fti: '',
  });
  const [loading, setLoading]   = useState(false);
  const [result,  setResult]    = useState(null);
  const [errors,  setErrors]    = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.age || formData.age < 1 || formData.age > 120) newErrors.age = 'Age must be between 1 and 120';
    if (!formData.sex)  newErrors.sex  = 'Please select sex';
    if (!formData.tsh || formData.tsh < 0) newErrors.tsh = 'TSH value is required';
    if (!formData.t3  || formData.t3  < 0) newErrors.t3  = 'T3 value is required';
    if (!formData.tt4 || formData.tt4 < 0) newErrors.tt4 = 'TT4 value is required';
    if (!formData.fti || formData.fti < 0) newErrors.fti = 'FTI value is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    const res = analyzeThyroid(formData);
    saveThyroidResult(formData, res);
    setResult(res);
    setLoading(false);
  };

  const getConditionColor = (condition) => ({
    Normal:      'text-green-600 bg-green-50 border-green-200',
    Hypothyroid: 'text-blue-600 bg-blue-50 border-blue-200',
    Hyperthyroid:'text-red-600 bg-red-50 border-red-200',
  }[condition] || 'text-green-600 bg-green-50 border-green-200');

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <BackgroundBlobs />
      <div className="container mx-auto max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
            Thyroid Function <span className="gradient-text">Analysis</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Enter your thyroid biomarker levels for comprehensive analysis
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {!result ? (
            <motion.form key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onSubmit={handleSubmit} className="glass-card rounded-3xl p-8 shadow-card">

              {/* Basic Information */}
              <div className="mb-8">
                <h2 className="text-2xl font-display font-semibold mb-6 text-gray-800">Basic Information</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Age (years)</label>
                    <input type="number" name="age" value={formData.age} onChange={handleChange}
                      className="input-field" placeholder="e.g., 35" />
                    {errors.age && <p className="text-red-500 text-sm mt-1">{errors.age}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sex</label>
                    <select name="sex" value={formData.sex} onChange={handleChange} className="input-field">
                      <option value="">Select...</option>
                      <option value="female">Female</option>
                      <option value="male">Male</option>
                    </select>
                    {errors.sex && <p className="text-red-500 text-sm mt-1">{errors.sex}</p>}
                  </div>
                </div>
              </div>

              {/* Clinical Symptoms */}
              <div className="mb-8">
                <h2 className="text-2xl font-display font-semibold mb-6 text-gray-800">Clinical Symptoms</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <ToggleSwitch label="Goitre (Enlarged Thyroid)" name="goitre" checked={formData.goitre} onChange={handleChange} />
                  <ToggleSwitch label="Thyroid Tumor" name="tumor" checked={formData.tumor} onChange={handleChange} />
                </div>
              </div>

              {/* Thyroid Biomarkers */}
              <div className="mb-8">
                <h2 className="text-2xl font-display font-semibold mb-6 text-gray-800">Thyroid Biomarkers</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      TSH (mIU/L) <span className="text-gray-500 text-xs ml-2">Normal: 0.4–4.0</span>
                    </label>
                    <input type="number" step="0.1" name="tsh" value={formData.tsh} onChange={handleChange}
                      className="input-field" placeholder="e.g., 2.5" />
                    {errors.tsh && <p className="text-red-500 text-sm mt-1">{errors.tsh}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      T3 (nmol/L) <span className="text-gray-500 text-xs ml-2">Normal: 0.9–2.5</span>
                    </label>
                    <input type="number" step="0.1" name="t3" value={formData.t3} onChange={handleChange}
                      className="input-field" placeholder="e.g., 1.8" />
                    {errors.t3 && <p className="text-red-500 text-sm mt-1">{errors.t3}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      TT4 (nmol/L) <span className="text-gray-500 text-xs ml-2">Normal: 60–150</span>
                    </label>
                    <input type="number" step="0.1" name="tt4" value={formData.tt4} onChange={handleChange}
                      className="input-field" placeholder="e.g., 95" />
                    {errors.tt4 && <p className="text-red-500 text-sm mt-1">{errors.tt4}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      FTI (Index) <span className="text-gray-500 text-xs ml-2">Normal: 60–120</span>
                    </label>
                    <input type="number" step="0.1" name="fti" value={formData.fti} onChange={handleChange}
                      className="input-field" placeholder="e.g., 85" />
                    {errors.fti && <p className="text-red-500 text-sm mt-1">{errors.fti}</p>}
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <button type="submit" disabled={loading}
                  className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-4">
                  {loading ? 'Analyzing...' : 'Analyze Thyroid Function'}
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </motion.form>
          ) : (
            <motion.div key="results" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }} className="space-y-6">

              {/* Condition Card */}
              <div className="glass-card rounded-3xl p-8 shadow-card text-center">
                <h2 className="text-2xl font-display font-semibold mb-6 text-gray-800">Thyroid Analysis Results</h2>
                <div className={`inline-flex items-center gap-2 px-8 py-4 rounded-full border-2 font-semibold text-lg mb-4 ${getConditionColor(result.condition)}`}>
                  <Activity className="w-6 h-6" />
                  {result.condition}
                </div>
                <div className="flex flex-col items-center gap-2 mt-2">
                  <p className="text-gray-600 text-lg font-semibold">
                    Risk Score: <span className="text-lavender-600">{result.risk}%</span>
                  </p>
                  <span className={`px-4 py-1 rounded-full text-sm font-semibold border ${{
                    Low:    'text-green-600 bg-green-50 border-green-200',
                    Medium: 'text-amber-600 bg-amber-50 border-amber-200',
                    High:   'text-red-600 bg-red-50 border-red-200',
                  }[result.riskLevel] || 'text-amber-600 bg-amber-50 border-amber-200'}`}>
                    {result.riskLevel} Risk
                  </span>
                </div>
              </div>

              {/* Hormone Chart */}
              <div className="glass-card rounded-3xl p-8 shadow-card">
                <h3 className="text-xl font-display font-semibold mb-6 text-gray-800">Hormone Level Comparison</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={result.hormoneData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5D9FF" />
                      <XAxis dataKey="name" stroke="#7B5CB0" />
                      <YAxis stroke="#7B5CB0" />
                      <Tooltip contentStyle={{ backgroundColor:'rgba(255,255,255,0.95)', border:'2px solid #CDB4DB', borderRadius:'12px', padding:'12px' }} />
                      <Bar dataKey="value"  fill="#B8A4E3" radius={[8,8,0,0]} name="Your Value" />
                      <Bar dataKey="normal" fill="#CDB4DB" radius={[8,8,0,0]} name="Normal Mid" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-6 mt-4">
                  <div className="flex items-center gap-2"><div className="w-4 h-4 bg-[#B8A4E3] rounded" /><span className="text-sm text-gray-600">Your Values</span></div>
                  <div className="flex items-center gap-2"><div className="w-4 h-4 bg-[#CDB4DB] rounded" /><span className="text-sm text-gray-600">Normal Range</span></div>
                </div>
              </div>

              {/* Symptoms */}
              <div className="glass-card rounded-3xl p-8 shadow-card">
                <h3 className="text-xl font-display font-semibold mb-6 flex items-center gap-2">
                  <AlertCircle className="w-6 h-6 text-lavender-600" /> Common Symptoms
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {result.symptoms.map((symptom, index) => (
                    <motion.div key={index} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }} className="flex items-center gap-3 p-4 bg-lavender-50 rounded-xl">
                      <div className="w-2 h-2 bg-lavender-500 rounded-full" />
                      <span className="text-gray-700">{symptom}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div className="glass-card rounded-3xl p-8 shadow-card">
                <h3 className="text-xl font-display font-semibold mb-6 text-gray-800">Medical Recommendations</h3>
                <div className="space-y-3">
                  {result.recommendations.map((rec, index) => (
                    <motion.div key={index} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }} className="flex items-start gap-3 p-4 bg-lavender-50 rounded-xl">
                      <div className="w-6 h-6 rounded-full bg-lavender-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-sm font-semibold">{index + 1}</span>
                      </div>
                      <p className="text-gray-700 leading-relaxed">{rec}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 justify-center">
                <button onClick={() => setResult(null)} className="btn-secondary">New Analysis</button>
                <button onClick={() => downloadThyroidPDF({ formData, result, date: new Date().toISOString(), type: 'Thyroid Analysis' })}
                  className="btn-primary inline-flex items-center gap-2">
                  <Download className="w-4 h-4" /> Download Report
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {loading && (
          <div className="fixed inset-0 bg-lavender-900/20 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="glass-card rounded-3xl p-12 shadow-glow">
              <LoadingSpinner size="lg" message="Analyzing thyroid biomarkers..." />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ThyroidPrediction;
