import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, AlertCircle, TrendingUp, Download } from 'lucide-react';
import ToggleSwitch from '../components/ToggleSwitch';
import LoadingSpinner from '../components/LoadingSpinner';
import CircularProgress from '../components/CircularProgress';
import BackgroundBlobs from '../components/BackgroundBlobs';
import { saveBreastCancerResult } from '../services/healthStore';
import { downloadBreastPDF } from '../services/pdfDownload';

// ── Rule-based breast cancer engine (runs in browser) ────────────
function analyzeBreastCancer(form) {
  const bv = (v) => v === true || String(v).toLowerCase() === 'true';
  const age = parseFloat(form.age) || 0;
  let score = 0;
  const factors = [];

  // Age
  if (age >= 70)      { score += 20; factors.push({ name: 'Age 70+',         impact: 20 }); }
  else if (age >= 60) { score += 15; factors.push({ name: 'Age 60–69',       impact: 15 }); }
  else if (age >= 50) { score += 10; factors.push({ name: 'Age 50–59',       impact: 10 }); }
  else if (age >= 40) { score += 5;  factors.push({ name: 'Age 40–49',       impact: 5  }); }

  // Strong history factors
  if (bv(form.personalHistory)) { score += 25; factors.push({ name: 'Personal History / Prior Biopsy',    impact: 25 }); }
  if (bv(form.familyHistory))   { score += 20; factors.push({ name: 'Family History of Breast Cancer',    impact: 20 }); }

  // Breast density
  const densityPts = { d: 15, c: 10, b: 5 };
  const densityLabel = { d: 'Extremely Dense Breasts', c: 'Heterogeneously Dense Breasts', b: 'Scattered Fibroglandular Density' };
  const density = String(form.breastDensity || 'a').toLowerCase();
  if (densityPts[density]) { score += densityPts[density]; factors.push({ name: densityLabel[density], impact: densityPts[density] }); }

  // Lifestyle
  if (bv(form.hrtUse))             { score += 10; factors.push({ name: 'Hormone Replacement Therapy',  impact: 10 }); }
  if (bv(form.obesity))            { score += 8;  factors.push({ name: 'Obesity / Overweight',         impact: 8  }); }
  if (bv(form.alcohol))            { score += 7;  factors.push({ name: 'Regular Alcohol Consumption',  impact: 7  }); }
  if (bv(form.smoking))            { score += 6;  factors.push({ name: 'Smoking',                      impact: 6  }); }
  if (bv(form.oralContraceptives)) { score += 4;  factors.push({ name: 'Oral Contraceptive Use',       impact: 4  }); }
  if (!bv(form.exercise))          { score += 5;  factors.push({ name: 'Sedentary Lifestyle',          impact: 5  }); }

  // Current symptoms (high weight — need attention regardless)
  if (bv(form.breastLump))       { score += 15; factors.push({ name: 'Breast Lump / Thickening',    impact: 15 }); }
  if (bv(form.nippleDischarge))  { score += 10; factors.push({ name: 'Nipple Discharge',             impact: 10 }); }
  if (bv(form.skinChanges))      { score += 10; factors.push({ name: 'Skin Changes on Breast',       impact: 10 }); }
  if (bv(form.breastPain))       { score += 5;  factors.push({ name: 'Persistent Breast Pain',       impact: 5  }); }

  const risk = Math.min(Math.round(Math.max(score, 0)), 100);
  const riskLevel = risk < 30 ? 'Low' : risk < 60 ? 'Medium' : 'High';

  const topFactors = [...factors].sort((a, b) => b.impact - a.impact).slice(0, 4);
  const recommendations = buildBCRecs(riskLevel, form, bv);

  return { risk, riskLevel, topFactors, recommendations };
}

function buildBCRecs(riskLevel, form, bv) {
  const recs = [];
  const hasSymptoms = bv(form.breastLump) || bv(form.nippleDischarge) || bv(form.skinChanges);

  // Urgent symptoms always first
  if (hasSymptoms) {
    recs.push('⚠️ You reported physical symptoms — please see a doctor immediately for a clinical examination.');
  }

  // Risk-level specific
  if (riskLevel === 'High') {
    recs.push('Consult an oncologist or breast specialist for a comprehensive risk evaluation.');
    if (bv(form.familyHistory)) recs.push('Discuss genetic testing (BRCA1/BRCA2) with your doctor given your family history.');
    recs.push('Annual mammogram and clinical breast exam are strongly recommended for you.');
  } else if (riskLevel === 'Medium') {
    recs.push('Schedule a clinical breast exam and discuss mammogram frequency with your doctor.');
    recs.push('Perform monthly breast self-examinations to detect any changes early.');
  } else {
    recs.push('Continue routine mammograms as recommended for your age group.');
    recs.push('Perform monthly breast self-examinations to stay familiar with what is normal for you.');
  }

  // Input-specific dynamic recommendations
  if (bv(form.hrtUse))
    recs.push('Discuss the risks and benefits of continued hormone replacement therapy with your doctor.');
  if (bv(form.alcohol))
    recs.push('Limit alcohol intake to less than 1 drink per day — alcohol is a known breast cancer risk factor.');
  if (bv(form.obesity))
    recs.push('Maintaining a healthy weight, especially after menopause, significantly reduces breast cancer risk.');
  if (!bv(form.exercise))
    recs.push('Aim for at least 150 minutes of moderate exercise per week — it can reduce breast cancer risk by up to 20%.');
  if (bv(form.smoking))
    recs.push('Quitting smoking improves overall cancer risk and general health outcomes.');

  recs.push('Eat a diet rich in fruits, vegetables, and whole grains and limit processed and red meats.');
  return recs;
}

// ── PDF Download ─────────────────────────────────────────────────
function downloadReport(formData, result) {
  const userEmail = localStorage.getItem('userEmail') || 'Patient';
  const date = new Date().toLocaleDateString('en-IN', { day:'2-digit', month:'long', year:'numeric' });
  const riskColor = { Low: '#16a34a', Medium: '#d97706', High: '#dc2626' }[result.riskLevel] || '#7B5CB0';

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<title>BioSense Breast Cancer Screening Report</title>
<style>
  body { font-family: Georgia, serif; background: #F8F4FF; margin: 0; padding: 30px; color: #2D2D2D; }
  .header { background: linear-gradient(135deg,#7B5CB0,#CDB4DB); color: white; padding: 30px; border-radius: 16px; margin-bottom: 24px; }
  .header h1 { margin: 0 0 4px; font-size: 26px; }
  .header p  { margin: 0; opacity: 0.85; font-size: 14px; }
  .card { background: white; border-radius: 12px; padding: 24px; margin-bottom: 18px; box-shadow: 0 2px 12px rgba(123,92,176,0.1); }
  .card h2 { margin: 0 0 16px; color: #7B5CB0; font-size: 18px; border-bottom: 2px solid #E5D9FF; padding-bottom: 8px; }
  .risk-badge { display:inline-block; padding: 12px 30px; border-radius: 50px; font-size: 22px; font-weight: bold; color: white; background: ${riskColor}; margin: 8px 0; }
  .risk-num { font-size: 48px; font-weight: bold; color: ${riskColor}; }
  .factor { margin-bottom: 14px; }
  .factor-label { display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 14px; }
  .bar-bg { background: #E5D9FF; border-radius: 6px; height: 10px; }
  .bar-fill { background: linear-gradient(90deg,#B8A4E3,#7B5CB0); border-radius: 6px; height: 10px; }
  .rec { display: flex; gap: 12px; align-items: flex-start; margin-bottom: 12px; }
  .rec-num { background: #7B5CB0; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 12px; flex-shrink: 0; margin-top: 2px; }
  .disclaimer { background: #FEF3C7; border: 1px solid #FCD34D; border-radius: 8px; padding: 14px; font-size: 12px; color: #92400E; margin-top: 18px; }
  .footer { text-align: center; color: #9B7FD4; font-size: 12px; margin-top: 20px; }
</style>
</head>
<body>
<div class="header">
  <h1>💜 BioSense — Breast Cancer Risk Screening Report</h1>
  <p>Patient: ${userEmail} &nbsp;|&nbsp; Date: ${date} &nbsp;|&nbsp; Age: ${formData.age}</p>
</div>

<div class="card" style="text-align:center">
  <h2>Risk Assessment</h2>
  <div class="risk-num">${result.risk}%</div>
  <br/>
  <div class="risk-badge">${result.riskLevel} Risk</div>
</div>

<div class="card">
  <h2>Top Contributing Factors</h2>
  ${result.topFactors.map(f => `
    <div class="factor">
      <div class="factor-label"><span>${f.name}</span><span>${f.impact}%</span></div>
      <div class="bar-bg"><div class="bar-fill" style="width:${f.impact}%"></div></div>
    </div>`).join('')}
</div>

<div class="card">
  <h2>Personalised Recommendations</h2>
  ${result.recommendations.map((r, i) => `<div class="rec"><div class="rec-num">${i+1}</div><div style="font-size:14px">${r}</div></div>`).join('')}
</div>

<div class="disclaimer">
  ⚠️ <strong>Medical Disclaimer:</strong> This screening report is for educational purposes only and does not constitute a medical diagnosis. Please consult a qualified healthcare professional for proper evaluation.
</div>
<div class="footer">Generated by BioSense AI Platform &nbsp;|&nbsp; ${date}</div>
</body></html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `BioSense_BreastCancer_Report_${Date.now()}.html`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Component ────────────────────────────────────────────────────
const BreastCancerPrediction = () => {
  const [formData, setFormData] = useState({
    age: '',
    familyHistory: false,
    personalHistory: false,
    breastDensity: '',
    hrtUse: false,
    oralContraceptives: false,
    alcohol: false,
    smoking: false,
    obesity: false,
    exercise: false,
    breastLump: false,
    nippleDischarge: false,
    skinChanges: false,
    breastPain: false,
  });
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState(null);
  const [errors,  setErrors]  = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.age || formData.age < 18 || formData.age > 100)
      newErrors.age = 'Age must be between 18 and 100';
    if (!formData.breastDensity)
      newErrors.breastDensity = 'Please select breast density';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    const res = analyzeBreastCancer(formData);
    saveBreastCancerResult(formData, res);
    setResult(res);
    setLoading(false);
  };

  const getRiskLevelColor = (level) => ({
    Low:    'text-green-600 bg-green-50 border-green-200',
    Medium: 'text-amber-600 bg-amber-50 border-amber-200',
    High:   'text-red-600 bg-red-50 border-red-200',
  }[level] || 'text-amber-600 bg-amber-50 border-amber-200');

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <BackgroundBlobs />
      <div className="container mx-auto max-w-6xl">

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
            Breast Cancer <span className="gradient-text">Risk Screening</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Complete the screening questionnaire to receive your personalised breast cancer risk analysis
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {!result ? (
            <motion.form key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onSubmit={handleSubmit} className="glass-card rounded-3xl p-8 shadow-card">

              {/* Basic Info */}
              <div className="mb-8">
                <h2 className="text-2xl font-display font-semibold mb-6 text-gray-800">Basic Information</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Age (years)</label>
                    <input type="number" name="age" value={formData.age} onChange={handleChange}
                      className="input-field" placeholder="e.g., 45" />
                    {errors.age && <p className="text-red-500 text-sm mt-1">{errors.age}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Breast Density</label>
                    <select name="breastDensity" value={formData.breastDensity} onChange={handleChange} className="input-field">
                      <option value="">Select...</option>
                      <option value="a">A — Almost entirely fatty (lowest density)</option>
                      <option value="b">B — Scattered fibroglandular</option>
                      <option value="c">C — Heterogeneously dense</option>
                      <option value="d">D — Extremely dense (highest density)</option>
                    </select>
                    {errors.breastDensity && <p className="text-red-500 text-sm mt-1">{errors.breastDensity}</p>}
                  </div>
                </div>
              </div>

              {/* Medical & Family History */}
              <div className="mb-8">
                <h2 className="text-2xl font-display font-semibold mb-6 text-gray-800">Medical & Family History</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <ToggleSwitch label="Family History of Breast Cancer" name="familyHistory" checked={formData.familyHistory} onChange={handleChange} />
                  <ToggleSwitch label="Personal History of Breast Cancer / Biopsy" name="personalHistory" checked={formData.personalHistory} onChange={handleChange} />
                  <ToggleSwitch label="Hormone Replacement Therapy (HRT) Use" name="hrtUse" checked={formData.hrtUse} onChange={handleChange} />
                  <ToggleSwitch label="Oral Contraceptive Use" name="oralContraceptives" checked={formData.oralContraceptives} onChange={handleChange} />
                </div>
              </div>

              {/* Lifestyle */}
              <div className="mb-8">
                <h2 className="text-2xl font-display font-semibold mb-6 text-gray-800">Lifestyle</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <ToggleSwitch label="Regular Alcohol Consumption" name="alcohol" checked={formData.alcohol} onChange={handleChange} />
                  <ToggleSwitch label="Smoking" name="smoking" checked={formData.smoking} onChange={handleChange} />
                  <ToggleSwitch label="Obesity / Overweight" name="obesity" checked={formData.obesity} onChange={handleChange} />
                  <ToggleSwitch label="Regular Exercise" name="exercise" checked={formData.exercise} onChange={handleChange} />
                </div>
              </div>

              {/* Current Symptoms */}
              <div className="mb-8">
                <h2 className="text-2xl font-display font-semibold mb-6 text-gray-800">Current Symptoms</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <ToggleSwitch label="Breast Lump / Thickening" name="breastLump" checked={formData.breastLump} onChange={handleChange} />
                  <ToggleSwitch label="Nipple Discharge" name="nippleDischarge" checked={formData.nippleDischarge} onChange={handleChange} />
                  <ToggleSwitch label="Skin Changes on Breast" name="skinChanges" checked={formData.skinChanges} onChange={handleChange} />
                  <ToggleSwitch label="Persistent Breast Pain" name="breastPain" checked={formData.breastPain} onChange={handleChange} />
                </div>
              </div>

              <div className="flex justify-center">
                <button type="submit" disabled={loading}
                  className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-4">
                  {loading ? 'Analyzing...' : 'Get Risk Assessment'}
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </motion.form>
          ) : (
            <motion.div key="results" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }} className="space-y-6">

              {/* Risk Score */}
              <div className="glass-card rounded-3xl p-8 shadow-card text-center">
                <h2 className="text-2xl font-display font-semibold mb-8 text-gray-800">Your Breast Cancer Risk Assessment</h2>
                <div className="flex justify-center mb-8">
                  <CircularProgress percentage={result.risk} />
                </div>
                <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full border-2 font-semibold ${getRiskLevelColor(result.riskLevel)}`}>
                  <AlertCircle className="w-5 h-5" />
                  {result.riskLevel} Risk Level
                </div>
              </div>

              {/* Top Factors */}
              <div className="glass-card rounded-3xl p-8 shadow-card">
                <h3 className="text-xl font-display font-semibold mb-6 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-lavender-600" /> Top Influencing Factors
                </h3>
                <div className="space-y-4">
                  {result.topFactors.map((factor, index) => (
                    <motion.div key={index} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-700 font-medium">{factor.name}</span>
                        <span className="text-lavender-600 font-semibold">{factor.impact}%</span>
                      </div>
                      <div className="w-full bg-lavender-100 rounded-full h-3 overflow-hidden">
                        <motion.div className="h-full bg-gradient-to-r from-lavender-400 to-accent-purple rounded-full"
                          initial={{ width: 0 }} animate={{ width: `${factor.impact}%` }} transition={{ duration: 1, delay: index * 0.1 }} />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div className="glass-card rounded-3xl p-8 shadow-card">
                <h3 className="text-xl font-display font-semibold mb-6 text-gray-800">Personalised Recommendations</h3>
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

              {/* Actions */}
              <div className="flex flex-wrap gap-4 justify-center">
                <button onClick={() => setResult(null)} className="btn-secondary">Take Assessment Again</button>
                <button onClick={() => downloadBreastPDF({ formData, result, date: new Date().toISOString(), type: 'Breast Cancer Screening' })}
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
              <LoadingSpinner size="lg" message="Analyzing your health data..." />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BreastCancerPrediction;
