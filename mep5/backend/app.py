"""
BioSense Backend - Flask API with Real ML Models
Folder: mep/backend/
Run:  python app.py
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime, timedelta
import numpy as np
import joblib
import os
import warnings
warnings.filterwarnings("ignore")

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000", "http://127.0.0.1:3000"])

# ── Load ML Models ───────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

pcos_model    = joblib.load(os.path.join(BASE_DIR, "pcos_model.pkl"))
thyroid_model = joblib.load(os.path.join(BASE_DIR, "thyroid_model.pkl"))

print("✅ PCOS model loaded:", type(pcos_model).__name__)
print("✅ Thyroid model loaded:", type(thyroid_model).__name__)

# ── In-memory store ──────────────────────────────────────────────
predictions_db = []


# ════════════════════════════════════════════════════════════════
#  PCOS  — 14 features (pcos_features.txt order)
#  0  Age (in Years)
#  1  Weight (in Kg)
#  2  Height (in Cm)
#  3  After how many months do you get your periods? (1=monthly/regular)
#  4  Have you gained weight recently?               (1=Yes 0=No)
#  5  Do you have excessive body/facial hair growth? (1=Yes 0=No)
#  6  Are you noticing skin darkening recently?      (1=Yes 0=No)
#  7  Do have hair loss/hair thinning/baldness?      (1=Yes 0=No)
#  8  Do you have pimples/acne on your face/jawline? (1=Yes 0=No)
#  9  Do you eat fast food regularly?                (1=Yes 0=No)
#  10 Do you exercise on a regular basis?            (1=Yes 0=No)
#  11 Do you experience mood swings?                 (1=Yes 0=No)
#  12 Are your periods regular?                      (1=Yes 0=No)
#  13 How long does your period last? (in Days)
# ════════════════════════════════════════════════════════════════

def bool_val(v):
    if isinstance(v, bool):
        return int(v)
    if isinstance(v, (int, float)):
        return int(bool(v))
    return 1 if str(v).lower() in ("true", "1", "yes") else 0


def build_pcos_features(data):
    period_days   = float(data.get("periodFrequency") or 30)
    period_months = max(1, round(period_days / 30))

    regularity_raw = str(data.get("periodRegularity", "regular")).lower()
    period_regular = 1 if regularity_raw in ("regular", "1", "yes") else 0

    period_duration = float(data.get("periodDuration") or 5)

    return np.array([
        float(data.get("age")    or 0),       # 0
        float(data.get("weight") or 0),       # 1
        float(data.get("height") or 0),       # 2
        period_months,                         # 3
        bool_val(data.get("weightGain")),      # 4
        bool_val(data.get("hairGrowth")),      # 5
        bool_val(data.get("skinDarkening")),   # 6
        bool_val(data.get("hairThinning")),    # 7
        bool_val(data.get("acne")),            # 8
        bool_val(data.get("fastFood")),        # 9
        bool_val(data.get("exercise")),        # 10
        bool_val(data.get("moodSwings")),      # 11
        period_regular,                        # 12
        period_duration,                       # 13
    ], dtype=float).reshape(1, -1)


def compute_pcos_risk(data):
    features   = build_pcos_features(data)
    proba      = pcos_model.predict_proba(features)[0]
    risk       = round(float(proba[1]) * 100)

    risk_level = "Low" if risk < 30 else ("Medium" if risk < 60 else "High")

    top_factors    = _pcos_top_factors(features)
    recommendations = _pcos_recommendations(risk_level, data)

    return {
        "risk":            risk,
        "riskLevel":       risk_level,
        "topFactors":      top_factors,
        "recommendations": recommendations,
    }


def _pcos_top_factors(base_features):
    symptom_indices = {
        "Irregular Periods":     12,
        "Weight Gain":            4,
        "Excessive Hair Growth":  5,
        "Skin Darkening":         6,
        "Hair Thinning":          7,
        "Acne Problems":          8,
        "Frequent Fast Food":     9,
        "Mood Swings":           11,
    }
    base_prob = float(pcos_model.predict_proba(base_features)[0][1])
    factors   = []

    for label, idx in symptom_indices.items():
        toggled = base_features.copy()
        toggled[0][idx] = 1 if idx == 12 else 0
        toggled_prob = float(pcos_model.predict_proba(toggled)[0][1])
        impact = round(abs(base_prob - toggled_prob) * 100)
        if impact > 0:
            factors.append({"name": label, "impact": impact})

    factors.sort(key=lambda x: -x["impact"])

    if not factors:
        factors = [
            {"name": "Menstrual Pattern",  "impact": 35},
            {"name": "Hormonal Markers",   "impact": 28},
            {"name": "Lifestyle Factors",  "impact": 20},
            {"name": "Physical Symptoms",  "impact": 15},
        ]
    return factors[:4]


def _pcos_recommendations(risk_level, data):
    recs = []
    regularity = str(data.get("periodRegularity", "regular")).lower()

    if risk_level in ("Medium", "High"):
        recs.append("Consult with an endocrinologist or gynaecologist for a full hormonal evaluation.")
    if risk_level == "High":
        recs.append("Request a transvaginal ultrasound to check for ovarian cysts — key for PCOS diagnosis.")

    # Menstrual specific
    if regularity in ("irregular", "2"):
        recs.append("Irregular periods are a hallmark of PCOS — tracking your cycle with an app will help your doctor.")
    period_freq = float(data.get("periodFrequency") or 28)
    if period_freq > 35:
        recs.append(f"Your cycle of {round(period_freq)} days is longer than normal — discuss this with your doctor.")

    # Symptom-specific
    if bool_val(data.get("weightGain")):
        recs.append("Recent weight gain may worsen hormonal imbalance — a 5–10% weight reduction can significantly improve PCOS symptoms.")
    if bool_val(data.get("hairGrowth")):
        recs.append("Excessive hair growth (hirsutism) may indicate elevated androgens — ask your doctor about anti-androgen therapy.")
    if bool_val(data.get("skinDarkening")):
        recs.append("Skin darkening (acanthosis nigricans) can signal insulin resistance — get a fasting insulin and glucose test.")
    if bool_val(data.get("acne")):
        recs.append("Hormonal acne is common with PCOS — a dermatologist can recommend targeted treatment alongside hormone therapy.")
    if bool_val(data.get("moodSwings")):
        recs.append("Mood swings are common with hormonal imbalance — consider speaking with a mental health professional alongside PCOS management.")

    # Lifestyle
    if bool_val(data.get("fastFood")):
        recs.append("A low-glycaemic diet (whole grains, legumes, vegetables) reduces insulin resistance which drives PCOS — limit fast food.")
    if not bool_val(data.get("exercise")):
        recs.append("Regular exercise (30 minutes, 5 days a week) significantly improves insulin sensitivity and PCOS outcomes.")

    recs.append("Manage stress through mindfulness or yoga — chronic stress worsens hormonal imbalance in PCOS.")
    return recs


# ════════════════════════════════════════════════════════════════
#  THYROID — 8 features (thyroid_features.txt order)
#  0  age
#  1  sex     (1=Female 0=Male)
#  2  goitre  (1=Yes 0=No)
#  3  tumor   (1=Yes 0=No)
#  4  TSH
#  5  T3
#  6  TT4
#  7  FTI
# ════════════════════════════════════════════════════════════════

THYROID_NORMALS = {
    "TSH": {"mid": 2.2,   "unit": "mIU/L"},
    "T3":  {"mid": 1.7,   "unit": "nmol/L"},
    "TT4": {"mid": 105.0, "unit": "nmol/L"},
    "FTI": {"mid": 90.0,  "unit": "index"},
}


def build_thyroid_features(data):
    sex_raw = str(data.get("sex", "female")).lower()
    sex     = 1 if sex_raw in ("female", "f", "1") else 0

    return np.array([
        float(data.get("age")    or 0),   # 0
        sex,                               # 1
        bool_val(data.get("goitre")),      # 2
        bool_val(data.get("tumor")),       # 3
        float(data.get("tsh")    or 0),   # 4
        float(data.get("t3")     or 0),   # 5
        float(data.get("tt4")    or 0),   # 6
        float(data.get("fti")    or 0),   # 7
    ], dtype=float).reshape(1, -1)


def compute_thyroid(data):
    features   = build_thyroid_features(data)
    prediction = int(thyroid_model.predict(features)[0])
    proba      = thyroid_model.predict_proba(features)[0]
    confidence = round(float(max(proba)) * 100)

    tsh = float(data.get("tsh") or 0)
    if prediction == 0:
        condition = "Normal"
    else:
        condition = "Hypothyroid" if tsh >= 0.4 else "Hyperthyroid"

    hormone_data = [
        {"name": "TSH",  "value": float(data.get("tsh") or 0),  "normal": THYROID_NORMALS["TSH"]["mid"],  "unit": "mIU/L"},
        {"name": "T3",   "value": float(data.get("t3")  or 0),  "normal": THYROID_NORMALS["T3"]["mid"],   "unit": "nmol/L"},
        {"name": "TT4",  "value": float(data.get("tt4") or 0),  "normal": THYROID_NORMALS["TT4"]["mid"],  "unit": "nmol/L"},
        {"name": "FTI",  "value": float(data.get("fti") or 0),  "normal": THYROID_NORMALS["FTI"]["mid"],  "unit": "index"},
    ]

    symptoms_map = {
        "Normal":      ["No significant symptoms expected", "Maintain regular check-ups", "Balanced energy levels", "Stable weight"],
        "Hypothyroid": ["Fatigue and weakness", "Weight changes", "Temperature sensitivity", "Mood changes"],
        "Hyperthyroid":["Rapid heartbeat", "Unexplained weight loss", "Anxiety or nervousness", "Heat intolerance"],
    }

    return {
        "condition":       condition,
        "confidence":      confidence,
        "hormoneData":     hormone_data,
        "recommendations": _thyroid_recommendations(condition, data),
        "symptoms":        symptoms_map.get(condition, symptoms_map["Normal"]),
    }


def _thyroid_recommendations(condition, data):
    recs = []
    if condition == "Normal":
        recs += ["Maintain annual thyroid function tests", "Ensure adequate iodine intake through diet",
                 "Continue healthy lifestyle habits", "Schedule regular check-ups with your doctor",
                 "Monitor for any new symptoms and report promptly"]
    elif condition == "Hypothyroid":
        recs += ["Consult with an endocrinologist for comprehensive thyroid evaluation",
                 "Consider thyroid medication as prescribed by your doctor",
                 "Monitor iodine intake through diet", "Schedule regular thyroid function tests",
                 "Manage stress levels through relaxation techniques"]
    else:
        recs += ["Seek urgent endocrinologist referral for antithyroid medication evaluation",
                 "Avoid excessive iodine supplements until evaluated",
                 "Monitor for heart rhythm irregularities",
                 "Schedule regular thyroid function tests every 6-8 weeks",
                 "Manage stress and avoid stimulants like caffeine"]
    if bool_val(data.get("goitre")):
        recs.append("Goitre should be evaluated with an ultrasound to rule out nodules")
    return recs


# ════════════════════════════════════════════════════════════════
#  ROUTES
# ════════════════════════════════════════════════════════════════

@app.route("/", methods=["GET"])
def index():
    return jsonify({"status": "BioSense API running", "version": "2.0.0 (ML)"})

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})

@app.route("/predict/pcos", methods=["POST"])
def predict_pcos():
    data = request.get_json(force=True)
    if not data:
        return jsonify({"error": "No data provided"}), 400
    try:
        result = compute_pcos_risk(data)
        predictions_db.append({
            "type": "PCOS Risk Assessment", "date": datetime.now().strftime("%Y-%m-%d"),
            "result": f"{result['riskLevel']} Risk", "riskLevel": result["riskLevel"], "risk": result["risk"],
        })
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/predict/thyroid", methods=["POST"])
def predict_thyroid():
    data = request.get_json(force=True)
    if not data:
        return jsonify({"error": "No data provided"}), 400
    try:
        result = compute_thyroid(data)
        predictions_db.append({
            "type": "Thyroid Analysis", "date": datetime.now().strftime("%Y-%m-%d"),
            "result": result["condition"], "confidence": result["confidence"],
        })
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/history", methods=["GET"])
def get_history():
    pcos_recs    = [p for p in predictions_db if p["type"] == "PCOS Risk Assessment"]
    thyroid_recs = [p for p in predictions_db if p["type"] == "Thyroid Analysis"]

    if not predictions_db:
        today = datetime.now()
        return jsonify({
            "latestPCOS":    {"date": "2024-02-10", "risk": 45, "riskLevel": "Medium"},
            "latestThyroid": {"date": "2024-02-08", "condition": "Normal", "tsh": 2.1},
            "healthTrend": [
                {"month": (today - timedelta(days=150 - i*30)).strftime("%b"), "score": 70 + i*3}
                for i in range(6)
            ],
            "insights": [
                {"title": "Get Started",     "description": "Complete your first screening to see insights here.", "color": "text-blue-600",  "bg": "bg-blue-50"},
                {"title": "Track Regularly", "description": "Quarterly screenings help detect trends early.",      "color": "text-green-600", "bg": "bg-green-50"},
                {"title": "Action Required", "description": "Schedule your next thyroid screening within 2 weeks.","color": "text-amber-600", "bg": "bg-amber-50"},
            ],
            "recentReports": [
                {"type": "PCOS Risk Assessment", "date": "2024-02-10", "result": "Medium Risk"},
                {"type": "Thyroid Analysis",     "date": "2024-02-08", "result": "Normal"},
                {"type": "PCOS Risk Assessment", "date": "2024-01-25", "result": "Medium Risk"},
            ],
        })

    latest_pcos    = pcos_recs[-1]    if pcos_recs    else None
    latest_thyroid = thyroid_recs[-1] if thyroid_recs else None

    health_trend = [
        {"month": datetime.strptime(r["date"], "%Y-%m-%d").strftime("%b"), "score": max(0, 100 - r["risk"])}
        for r in pcos_recs[-6:]
    ]

    insights = []
    if latest_pcos:
        lvl = latest_pcos["riskLevel"]
        if lvl == "High":
            insights.append({"title": "Action Required",     "description": "High PCOS risk. Please consult a specialist.",    "color": "text-red-600",   "bg": "bg-red-50"})
        elif lvl == "Medium":
            insights.append({"title": "Monitor Closely",     "description": "Moderate PCOS risk. Lifestyle changes can help.", "color": "text-amber-600", "bg": "bg-amber-50"})
        else:
            insights.append({"title": "Improved Health Score","description": "PCOS risk is low. Keep up the healthy habits!", "color": "text-green-600", "bg": "bg-green-50"})
    if latest_thyroid:
        if latest_thyroid["result"] != "Normal":
            insights.append({"title": "Thyroid Alert",       "description": f"{latest_thyroid['result']} detected. See an endocrinologist.", "color": "text-blue-600", "bg": "bg-blue-50"})
        else:
            insights.append({"title": "Regular Monitoring",  "description": "Thyroid function normal. Schedule annual recheck.", "color": "text-blue-600", "bg": "bg-blue-50"})

    if latest_pcos:
        latest_pcos = {"date": latest_pcos["date"], "risk": latest_pcos["risk"], "riskLevel": latest_pcos["riskLevel"]}
    if latest_thyroid:
        latest_thyroid = {"date": latest_thyroid["date"], "condition": latest_thyroid["result"], "tsh": 2.1}

    return jsonify({
        "latestPCOS":    latest_pcos,
        "latestThyroid": latest_thyroid,
        "healthTrend":   health_trend,
        "insights":      insights,
        "recentReports": list(reversed(predictions_db[-10:])),
    })


# ════════════════════════════════════════════════════════════════
#  BREAST CANCER  — Rule-based risk engine
#  Fields: age, familyHistory, personalHistory, breastDensity,
#          firstPeriodAge, menopause, menopauseAge, childrenCount,
#          firstChildAge, breastfeeding, hrtUse, oralContraceptives,
#          alcohol, smoking, obesity, exercise, breastLump,
#          nippleDischarge, skinChanges, breastPain
# ════════════════════════════════════════════════════════════════

def compute_breast_cancer_risk(data: dict) -> dict:
    score = 0.0
    factors = []

    age = float(data.get("age") or 0)

    # Age risk (increases with age)
    if age >= 70:
        score += 20; factors.append({"name": "Age (70+)", "impact": 20})
    elif age >= 60:
        score += 15; factors.append({"name": "Age (60–69)", "impact": 15})
    elif age >= 50:
        score += 10; factors.append({"name": "Age (50–59)", "impact": 10})
    elif age >= 40:
        score += 5;  factors.append({"name": "Age (40–49)", "impact": 5})

    # Family / personal history (strongest factors)
    if bool_val(data.get("personalHistory")):
        score += 25; factors.append({"name": "Personal History / Prior Biopsy", "impact": 25})
    if bool_val(data.get("familyHistory")):
        score += 20; factors.append({"name": "Family History of Breast Cancer", "impact": 20})

    # Breast density
    density = str(data.get("breastDensity", "a")).lower()
    density_map = {"d": ("Extremely Dense Breasts", 15), "c": ("Heterogeneously Dense Breasts", 10),
                   "b": ("Scattered Fibroglandular Density", 5), "a": None}
    if density_map.get(density):
        label, pts = density_map[density]
        score += pts; factors.append({"name": label, "impact": pts})

    # Hormonal / reproductive
    first_period = float(data.get("firstPeriodAge") or 13)
    if first_period < 12:
        score += 8; factors.append({"name": "Early Menarche (< 12)", "impact": 8})

    if bool_val(data.get("menopause")):
        menopause_age = float(data.get("menopauseAge") or 50)
        if menopause_age >= 55:
            score += 8; factors.append({"name": "Late Menopause (≥ 55)", "impact": 8})

    children = float(data.get("childrenCount") or 0)
    first_child = float(data.get("firstChildAge") or 0)
    if children == 0:
        score += 8; factors.append({"name": "No Children (Nulliparity)", "impact": 8})
    elif first_child >= 30:
        score += 5; factors.append({"name": "First Child After Age 30", "impact": 5})

    if bool_val(data.get("breastfeeding")) and children > 0:
        score -= 5   # protective factor (don't add to factors list)

    if bool_val(data.get("hrtUse")):
        score += 10; factors.append({"name": "Hormone Replacement Therapy Use", "impact": 10})
    if bool_val(data.get("oralContraceptives")):
        score += 4;  factors.append({"name": "Oral Contraceptive Use", "impact": 4})

    # Lifestyle
    if bool_val(data.get("alcohol")):
        score += 7;  factors.append({"name": "Regular Alcohol Consumption", "impact": 7})
    if bool_val(data.get("smoking")):
        score += 6;  factors.append({"name": "Smoking", "impact": 6})
    if bool_val(data.get("obesity")):
        score += 8;  factors.append({"name": "Obesity / Overweight", "impact": 8})
    if not bool_val(data.get("exercise")):
        score += 5;  factors.append({"name": "Sedentary Lifestyle", "impact": 5})

    # Current symptoms (urgent flags)
    if bool_val(data.get("breastLump")):
        score += 15; factors.append({"name": "Breast Lump / Thickening", "impact": 15})
    if bool_val(data.get("nippleDischarge")):
        score += 10; factors.append({"name": "Nipple Discharge", "impact": 10})
    if bool_val(data.get("skinChanges")):
        score += 10; factors.append({"name": "Skin Changes on Breast", "impact": 10})
    if bool_val(data.get("breastPain")):
        score += 5;  factors.append({"name": "Persistent Breast Pain", "impact": 5})

    risk = min(round(max(score, 0)), 100)
    risk_level = "Low" if risk < 30 else ("Medium" if risk < 60 else "High")

    top_factors = sorted(factors, key=lambda x: -x["impact"])[:4]
    recommendations = _bc_recommendations(risk_level, data)

    return {
        "risk":            risk,
        "riskLevel":       risk_level,
        "topFactors":      top_factors,
        "recommendations": recommendations,
    }


def _bc_recommendations(risk_level: str, data: dict) -> list:
    recs = []

    # Urgent symptoms always get top priority
    if bool_val(data.get("breastLump")) or bool_val(data.get("nippleDischarge")) or bool_val(data.get("skinChanges")):
        recs.append("See a doctor immediately — you have symptoms that require prompt clinical evaluation")

    if risk_level == "High":
        recs.append("Consult an oncologist or breast specialist for a comprehensive risk evaluation")
        recs.append("Discuss genetic testing (BRCA1/BRCA2) with your doctor if you have strong family history")
        recs.append("Annual mammogram and clinical breast exam are strongly recommended")
    elif risk_level == "Medium":
        recs.append("Schedule a clinical breast exam and discuss mammogram frequency with your doctor")
        recs.append("Perform monthly breast self-examinations to detect any changes early")
    else:
        recs.append("Continue routine annual mammograms as recommended for your age group")
        recs.append("Perform monthly breast self-examinations to stay familiar with your normal")

    if bool_val(data.get("hrtUse")):
        recs.append("Discuss the risks and benefits of continued HRT use with your doctor")
    if bool_val(data.get("alcohol")):
        recs.append("Limit alcohol to less than 1 drink per day — alcohol is a known risk factor")
    if bool_val(data.get("obesity")):
        recs.append("Maintaining a healthy weight, especially after menopause, reduces breast cancer risk")
    if not bool_val(data.get("exercise")):
        recs.append("Aim for at least 150 minutes of moderate exercise per week — it can reduce risk by up to 20%")
    recs.append("Eat a diet rich in fruits, vegetables, and whole grains and limit processed foods")

    return recs


@app.route("/predict/breast-cancer", methods=["POST"])
def predict_breast_cancer():
    data = request.get_json(force=True)
    if not data:
        return jsonify({"error": "No data provided"}), 400
    try:
        result = compute_breast_cancer_risk(data)
        predictions_db.append({
            "type":      "Breast Cancer Screening",
            "date":      datetime.now().strftime("%Y-%m-%d"),
            "result":    f"{result['riskLevel']} Risk",
            "riskLevel": result["riskLevel"],
            "risk":      result["risk"],
        })
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    port  = int(os.environ.get("PORT", 8000))
    debug = os.environ.get("DEBUG", "true").lower() == "true"
    print(f"\n💜  BioSense ML API  →  http://localhost:{port}\n")
    app.run(host="0.0.0.0", port=port, debug=debug)
