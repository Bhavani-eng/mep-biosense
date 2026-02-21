import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Heart, Activity, TrendingUp, Calendar,
  Download, FileText, BarChart3, Shield,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import BackgroundBlobs from '../components/BackgroundBlobs';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  getLatestPCOS, getLatestThyroid, getLatestBreastCancer,
  getAllResults,
} from '../services/healthStore';
import { downloadPCOSPDF, downloadThyroidPDF, downloadBreastPDF, downloadAllPDFs, downloadCombinedPDF } from '../services/pdfDownload';



// ── Risk level colour helper ─────────────────────────────────────
function riskColor(level) {
  return { Low:'text-green-600', Medium:'text-amber-600', High:'text-red-600' }[level] || 'text-gray-600';
}

// ── Component ────────────────────────────────────────────────────
const Dashboard = () => {
  const [loading, setLoading]           = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    const load = () => {
      const latestPCOS        = getLatestPCOS();
      const latestThyroid     = getLatestThyroid();
      const latestBreastCancer= getLatestBreastCancer();
      const allResults        = getAllResults();

      // Build health trend from PCOS risk scores (most frequent screening)
      const pcosAll = allResults.filter(r => r.type === 'PCOS Risk Assessment').slice(0, 6).reverse();
      const healthTrend = pcosAll.length > 0
        ? pcosAll.map(r => ({
            month: new Date(r.date).toLocaleDateString('en-IN', { month:'short' }),
            score: Math.max(0, 100 - r.result.risk),
          }))
        : [
            { month: 'Jan', score: 75 }, { month: 'Feb', score: 78 },
            { month: 'Mar', score: 72 }, { month: 'Apr', score: 80 },
            { month: 'May', score: 82 }, { month: 'Jun', score: 85 },
          ];

      // Build insights dynamically
      const insights = [];
      if (latestPCOS) {
        const rl = latestPCOS.result.riskLevel;
        if (rl === 'High')
          insights.push({ title:'PCOS Alert', description:`PCOS risk is High (${latestPCOS.result.risk}%). Please consult a specialist.`, icon:Heart, color:'text-red-600', bg:'bg-red-50' });
        else if (rl === 'Medium')
          insights.push({ title:'PCOS Monitoring', description:`PCOS risk is Medium (${latestPCOS.result.risk}%). Lifestyle changes can help.`, icon:Heart, color:'text-amber-600', bg:'bg-amber-50' });
        else
          insights.push({ title:'PCOS Low Risk', description:`PCOS risk is Low (${latestPCOS.result.risk}%). Keep up the healthy habits!`, icon:Heart, color:'text-green-600', bg:'bg-green-50' });
      }
      if (latestThyroid) {
        const cond = latestThyroid.result.condition;
        if (cond === 'Normal')
          insights.push({ title:'Thyroid Normal', description:`Thyroid function is normal (${latestThyroid.result.risk}% risk). Schedule an annual recheck.`, icon:Activity, color:'text-green-600', bg:'bg-green-50' });
        else
          insights.push({ title:'Thyroid Alert', description:`${cond} detected (${latestThyroid.result.risk}% risk). See an endocrinologist.`, icon:Activity, color:'text-blue-600', bg:'bg-blue-50' });
      }
      if (latestBreastCancer) {
        const rl = latestBreastCancer.result.riskLevel;
        insights.push({ title:`Breast Cancer — ${rl} Risk`, description:`Latest screening shows ${rl} risk (${latestBreastCancer.result.risk}%). ${rl==='High'?'Consult a specialist urgently.':rl==='Medium'?'Monitor closely.':'Continue regular self-exams.'}`, icon:Shield, color:rl==='High'?'text-red-600':rl==='Medium'?'text-amber-600':'text-green-600', bg:rl==='High'?'bg-red-50':rl==='Medium'?'bg-amber-50':'bg-green-50' });
      }
      if (insights.length === 0)
        insights.push({ title:'Get Started', description:'Complete your first screening to see personalised insights here.', icon:TrendingUp, color:'text-blue-600', bg:'bg-blue-50' });

      setDashboardData({ latestPCOS, latestThyroid, latestBreastCancer, allResults, healthTrend, insights });
      setLoading(false);
    };

    setTimeout(load, 800);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" message="Loading your health dashboard..." />
      </div>
    );
  }

  const { latestPCOS, latestThyroid, latestBreastCancer, allResults, healthTrend, insights } = dashboardData;
  const hasData = allResults.length > 0;

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <BackgroundBlobs />
      <div className="container mx-auto max-w-7xl">

        {/* Header */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="mb-12">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-2">
            Health <span className="gradient-text">Dashboard</span>
          </h1>
          <p className="text-xl text-gray-600">Track your health journey and insights</p>
        </motion.div>

        {/* Top 3 cards */}
        <div className="grid lg:grid-cols-3 gap-6 mb-6">

          {/* PCOS */}
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
            className="glass-card rounded-2xl p-6 shadow-card hover:shadow-glow transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">PCOS Screening</h3>
                <p className="text-sm text-gray-500">
                  {latestPCOS ? new Date(latestPCOS.date).toLocaleDateString() : 'No data yet'}
                </p>
              </div>
            </div>
            {latestPCOS ? (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Risk Level</span>
                  <span className={`font-semibold ${riskColor(latestPCOS.result.riskLevel)}`}>
                    {latestPCOS.result.riskLevel}
                  </span>
                </div>
                <div className="w-full bg-lavender-100 rounded-full h-2">
                  <div className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full"
                    style={{ width:`${latestPCOS.result.risk}%` }} />
                </div>
                <p className="text-sm text-gray-500">{latestPCOS.result.risk}% Risk Score</p>
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">Complete a PCOS screening to see results here.</p>
            )}
          </motion.div>

          {/* Thyroid */}
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}
            className="glass-card rounded-2xl p-6 shadow-card hover:shadow-glow transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-lavender-400 to-purple-500 flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Thyroid Analysis</h3>
                <p className="text-sm text-gray-500">
                  {latestThyroid ? new Date(latestThyroid.date).toLocaleDateString() : 'No data yet'}
                </p>
              </div>
            </div>
            {latestThyroid ? (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Condition</span>
                  <span className="font-semibold text-lavender-600">{latestThyroid.result.condition}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Risk Level</span>
                  <span className={`font-semibold ${riskColor(latestThyroid.result.riskLevel)}`}>
                    {latestThyroid.result.riskLevel}
                  </span>
                </div>
                <div className="w-full bg-lavender-100 rounded-full h-2">
                  <div className="h-full bg-gradient-to-r from-lavender-400 to-purple-500 rounded-full"
                    style={{ width:`${latestThyroid.result.risk}%` }} />
                </div>
                <p className="text-sm text-gray-500">{latestThyroid.result.risk}% Risk Score</p>
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">Complete a thyroid analysis to see results here.</p>
            )}
          </motion.div>

          {/* Breast Cancer */}
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.25 }}
            className="glass-card rounded-2xl p-6 shadow-card hover:shadow-glow transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Breast Cancer</h3>
                <p className="text-sm text-gray-500">
                  {latestBreastCancer ? new Date(latestBreastCancer.date).toLocaleDateString() : 'No data yet'}
                </p>
              </div>
            </div>
            {latestBreastCancer ? (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Risk Level</span>
                  <span className={`font-semibold ${riskColor(latestBreastCancer.result.riskLevel)}`}>
                    {latestBreastCancer.result.riskLevel}
                  </span>
                </div>
                <div className="w-full bg-lavender-100 rounded-full h-2">
                  <div className="h-full bg-gradient-to-r from-violet-400 to-indigo-500 rounded-full"
                    style={{ width:`${latestBreastCancer.result.risk}%` }} />
                </div>
                <p className="text-sm text-gray-500">{latestBreastCancer.result.risk}% Risk Score</p>
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">Complete a breast cancer screening to see results here.</p>
            )}
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}
          className="glass-card rounded-2xl p-6 shadow-card mb-6">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-lavender-600" /> Quick Actions
          </h3>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => downloadAllPDFs(allResults)}
              disabled={!hasData}
              className={`btn-primary text-sm py-3 px-5 flex items-center gap-2 ${!hasData ? 'opacity-50 cursor-not-allowed' : ''}`}>
              <Download className="w-4 h-4" />
              {hasData ? `Download All (${allResults.length} separate)` : 'No Reports Yet'}
            </button>
            <button
              onClick={() => downloadCombinedPDF(allResults)}
              disabled={!hasData}
              className={`text-sm py-3 px-5 flex items-center gap-2 rounded-xl font-semibold transition-all border-2 border-lavender-500 text-lavender-700 hover:bg-lavender-50 ${!hasData ? 'opacity-50 cursor-not-allowed' : ''}`}>
              <Download className="w-4 h-4" />
              Download All-in-One PDF
            </button>
            {latestPCOS && (
              <button onClick={() => downloadPCOSPDF(latestPCOS)}
                className="btn-secondary text-sm py-3 px-5 flex items-center gap-2">
                <Download className="w-4 h-4" /> Latest PCOS Report
              </button>
            )}
            {latestThyroid && (
              <button onClick={() => downloadThyroidPDF(latestThyroid)}
                className="btn-secondary text-sm py-3 px-5 flex items-center gap-2">
                <Download className="w-4 h-4" /> Latest Thyroid Report
              </button>
            )}
            {latestBreastCancer && (
              <button onClick={() => downloadBreastPDF(latestBreastCancer)}
                className="btn-secondary text-sm py-3 px-5 flex items-center gap-2">
                <Download className="w-4 h-4" /> Latest Breast Report
              </button>
            )}
          </div>
        </motion.div>

        {/* Health Trend Chart */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.4 }}
          className="glass-card rounded-2xl p-6 shadow-card mb-6">
          <h3 className="text-xl font-display font-semibold mb-6 text-gray-800">Health Score Trend</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={healthTrend}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#B8A4E3" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#B8A4E3" stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5D9FF" />
                <XAxis dataKey="month" stroke="#7B5CB0" />
                <YAxis stroke="#7B5CB0" domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor:'rgba(255,255,255,0.95)', border:'2px solid #CDB4DB', borderRadius:'12px', padding:'12px' }} />
                <Area type="monotone" dataKey="score" stroke="#7B5CB0" strokeWidth={3}
                  fillOpacity={1} fill="url(#colorScore)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Insights + Recent Reports */}
        <div className="grid lg:grid-cols-2 gap-6">

          {/* Health Insights */}
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.5 }}
            className="glass-card rounded-2xl p-6 shadow-card">
            <h3 className="text-xl font-display font-semibold mb-6 text-gray-800">Health Insights</h3>
            <div className="space-y-4">
              {insights.map((insight, index) => (
                <motion.div key={index} initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }}
                  transition={{ delay:0.6 + index * 0.1 }} className={`p-4 rounded-xl ${insight.bg}`}>
                  <div className="flex items-start gap-3">
                    <insight.icon className={`w-5 h-5 ${insight.color} flex-shrink-0 mt-0.5`} />
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-1">{insight.title}</h4>
                      <p className="text-sm text-gray-600">{insight.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Recent Reports */}
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.6 }}
            className="glass-card rounded-2xl p-6 shadow-card">
            <h3 className="text-xl font-display font-semibold mb-6 text-gray-800">Recent Reports</h3>
            {allResults.length === 0 ? (
              <p className="text-gray-400 italic text-sm">No screenings completed yet. Run a screening to see your reports here.</p>
            ) : (
              <div className="space-y-3">
                {allResults.slice(0, 8).map((entry, index) => {
                  const riskVal  = entry.result.risk;
                  const riskLvl  = entry.result.riskLevel || (entry.result.condition !== 'Normal' ? 'Medium' : 'Low');
                  const display  = entry.type === 'Thyroid Analysis'
                    ? `${entry.result.condition} — ${riskVal}%`
                    : `${riskLvl} Risk — ${riskVal}%`;
                  return (
                    <motion.div key={index} initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }}
                      transition={{ delay:0.7 + index * 0.05 }}
                      className="flex items-center justify-between p-4 bg-lavender-50 rounded-xl hover:bg-lavender-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-lavender-600" />
                        <div>
                          <h4 className="font-medium text-gray-800">{entry.type}</h4>
                          <p className="text-sm text-gray-500">{new Date(entry.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-semibold ${riskColor(riskLvl)}`}>{display}</span>
                        <button
                          onClick={() => {
                            if (entry.type === 'PCOS Risk Assessment')     downloadPCOSPDF(entry);
                            else if (entry.type === 'Thyroid Analysis')     downloadThyroidPDF(entry);
                            else if (entry.type === 'Breast Cancer Screening') downloadBreastPDF(entry);
                          }}
                          className="ml-2 p-1.5 rounded-lg bg-lavender-200 hover:bg-lavender-300 transition-colors"
                          title="Download this report">
                          <Download className="w-3.5 h-3.5 text-lavender-700" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
