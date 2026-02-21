/**
 * healthStore.js
 * Shared localStorage store — all 3 screening pages write here,
 * Dashboard reads from here. No backend needed for the dashboard.
 */

const KEYS = {
  pcos:        'biosense_pcos_results',
  thyroid:     'biosense_thyroid_results',
  breastCancer:'biosense_breast_results',
};

// ── Write ────────────────────────────────────────────────────────
export function savePCOSResult(formData, result) {
  const entry = {
    date: new Date().toISOString(),
    type: 'PCOS Risk Assessment',
    formData,
    result, // { risk, riskLevel, topFactors, recommendations }
  };
  _append(KEYS.pcos, entry);
}

export function saveThyroidResult(formData, result) {
  const entry = {
    date: new Date().toISOString(),
    type: 'Thyroid Analysis',
    formData,
    result, // { condition, risk, riskLevel, confidence, hormoneData, symptoms, recommendations }
  };
  _append(KEYS.thyroid, entry);
}

export function saveBreastCancerResult(formData, result) {
  const entry = {
    date: new Date().toISOString(),
    type: 'Breast Cancer Screening',
    formData,
    result, // { risk, riskLevel, topFactors, recommendations }
  };
  _append(KEYS.breastCancer, entry);
}

// ── Read ─────────────────────────────────────────────────────────
export function getPCOSResults()        { return _load(KEYS.pcos);         }
export function getThyroidResults()     { return _load(KEYS.thyroid);      }
export function getBreastCancerResults(){ return _load(KEYS.breastCancer); }

export function getLatestPCOS()        { return _latest(KEYS.pcos);         }
export function getLatestThyroid()     { return _latest(KEYS.thyroid);      }
export function getLatestBreastCancer(){ return _latest(KEYS.breastCancer); }

/** Returns all entries across all 3 types, sorted newest-first */
export function getAllResults() {
  const all = [
    ..._load(KEYS.pcos),
    ..._load(KEYS.thyroid),
    ..._load(KEYS.breastCancer),
  ];
  return all.sort((a, b) => new Date(b.date) - new Date(a.date));
}

// ── Helpers ──────────────────────────────────────────────────────
function _load(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch {
    return [];
  }
}

function _append(key, entry) {
  const arr = _load(key);
  arr.unshift(entry); // newest first
  localStorage.setItem(key, JSON.stringify(arr.slice(0, 20))); // keep last 20
}

function _latest(key) {
  const arr = _load(key);
  return arr.length > 0 ? arr[0] : null;
}
