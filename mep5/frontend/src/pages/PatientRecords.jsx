import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserPlus, User, Trash2, Search, ChevronDown,
  ChevronUp, MapPin, Briefcase, Users, Phone, Calendar,
  Download, FileText,
} from 'lucide-react';
import BackgroundBlobs from '../components/BackgroundBlobs';
import { downloadAllPDFs } from '../services/pdfDownload';
import { getAllResults } from '../services/healthStore';

const STORE_KEY = 'biosense_patients';

function loadPatients() {
  try { return JSON.parse(localStorage.getItem(STORE_KEY) || '[]'); }
  catch { return []; }
}
function savePatients(list) {
  localStorage.setItem(STORE_KEY, JSON.stringify(list));
}
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

const EMPTY_FORM = {
  name: '', age: '', gender: '', phone: '',
  fatherName: '', motherName: '',
  occupation: '', address: '', village: '', district: '',
  notes: '',
};

const PatientRecords = () => {
  const [patients, setPatients]   = useState([]);
  const [showForm, setShowForm]   = useState(false);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [errors, setErrors]       = useState({});
  const [search, setSearch]       = useState('');
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => { setPatients(loadPatients()); }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())    e.name    = 'Patient name is required';
    if (!form.age || form.age < 1 || form.age > 120) e.age = 'Valid age required';
    if (!form.phone.trim())   e.phone   = 'Phone number is required';
    if (!form.address.trim()) e.address = 'Address is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const updated = [{ id: uid(), createdAt: new Date().toISOString(), ...form }, ...patients];
    savePatients(updated);
    setPatients(updated);
    setForm(EMPTY_FORM);
    setShowForm(false);
  };

  const handleDelete = (id) => {
    if (!window.confirm('Delete this patient record?')) return;
    const updated = patients.filter(p => p.id !== id);
    savePatients(updated);
    setPatients(updated);
    if (expandedId === id) setExpandedId(null);
  };

  const filtered = patients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.village?.toLowerCase().includes(search.toLowerCase()) ||
    p.phone?.includes(search)
  );

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <BackgroundBlobs />
      <div className="container mx-auto max-w-4xl">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-display font-bold mb-1">
                Patient <span className="gradient-text">Records</span>
              </h1>
              <p className="text-gray-600">Manage and track your community patient details</p>
            </div>
            <button
              onClick={() => { setShowForm(true); setForm(EMPTY_FORM); setErrors({}); }}
              className="btn-primary inline-flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" /> Add Patient
            </button>
          </div>
        </motion.div>

        {/* Add Patient Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="glass-card rounded-3xl p-8 shadow-card mb-8"
            >
              <h2 className="text-2xl font-display font-semibold mb-6 text-gray-800">New Patient</h2>
              <form onSubmit={handleSubmit}>
                {/* Personal Details */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-lavender-600 uppercase tracking-wider mb-4">
                    Personal Details
                  </h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Patient Full Name <span className="text-red-500">*</span>
                      </label>
                      <input name="name" value={form.name} onChange={handleChange}
                        className="input-field" placeholder="e.g. Priya Sharma" />
                      {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Age <span className="text-red-500">*</span></label>
                      <input type="number" name="age" value={form.age} onChange={handleChange}
                        className="input-field" placeholder="e.g. 32" />
                      {errors.age && <p className="text-red-500 text-xs mt-1">{errors.age}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                      <select name="gender" value={form.gender} onChange={handleChange} className="input-field">
                        <option value="">Select...</option>
                        <option value="Female">Female</option>
                        <option value="Male">Male</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone <span className="text-red-500">*</span>
                      </label>
                      <input name="phone" value={form.phone} onChange={handleChange}
                        className="input-field" placeholder="e.g. 9876543210" />
                      {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Occupation</label>
                      <input name="occupation" value={form.occupation} onChange={handleChange}
                        className="input-field" placeholder="e.g. Farmer, Teacher" />
                    </div>
                  </div>
                </div>

                {/* Parents / Family */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-lavender-600 uppercase tracking-wider mb-4">
                    Family Details
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Father's Name</label>
                      <input name="fatherName" value={form.fatherName} onChange={handleChange}
                        className="input-field" placeholder="e.g. Ramesh Sharma" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Mother's Name</label>
                      <input name="motherName" value={form.motherName} onChange={handleChange}
                        className="input-field" placeholder="e.g. Sunita Sharma" />
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-lavender-600 uppercase tracking-wider mb-4">
                    Address
                  </h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="md:col-span-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Address <span className="text-red-500">*</span>
                      </label>
                      <input name="address" value={form.address} onChange={handleChange}
                        className="input-field" placeholder="House No., Street, Area" />
                      {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Village / Town</label>
                      <input name="village" value={form.village} onChange={handleChange}
                        className="input-field" placeholder="e.g. Rajpur" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                      <input name="district" value={form.district} onChange={handleChange}
                        className="input-field" placeholder="e.g. Jaipur" />
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes / Medical History</label>
                  <textarea name="notes" value={form.notes} onChange={handleChange}
                    rows={3} className="input-field resize-none"
                    placeholder="Any additional notes about this patient..." />
                </div>

                <div className="flex gap-3">
                  <button type="submit" className="btn-primary">Save Patient</button>
                  <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-12"
            placeholder="Search by name, village, or phone..."
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total Patients', value: patients.length, color: 'text-lavender-600' },
            { label: 'This Month',
              value: patients.filter(p => new Date(p.createdAt).getMonth() === new Date().getMonth()).length,
              color: 'text-green-600' },
            { label: 'Search Results', value: filtered.length, color: 'text-amber-600' },
          ].map((s, i) => (
            <div key={i} className="glass-card rounded-2xl p-4 text-center shadow-card">
              <div className={`text-2xl font-bold font-display ${s.color}`}>{s.value}</div>
              <div className="text-xs text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Patient List */}
        {filtered.length === 0 ? (
          <div className="glass-card rounded-3xl p-12 text-center shadow-card">
            <Users className="w-16 h-16 text-lavender-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              {patients.length === 0
                ? 'No patients yet. Click "Add Patient" to register your first patient.'
                : 'No patients match your search.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((patient, index) => (
              <motion.div
                key={patient.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className="glass-card rounded-2xl shadow-card overflow-hidden"
              >
                {/* Row */}
                <div
                  className="flex items-center justify-between p-5 cursor-pointer hover:bg-lavender-50/50 transition-colors"
                  onClick={() => setExpandedId(expandedId === patient.id ? null : patient.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-lavender-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">{patient.name}</h4>
                      <p className="text-sm text-gray-500">
                        {patient.age && `Age ${patient.age}`}
                        {patient.gender && ` • ${patient.gender}`}
                        {patient.village && ` • ${patient.village}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 hidden sm:block">
                      {new Date(patient.createdAt).toLocaleDateString()}
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(patient.id); }}
                      className="p-2 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    {expandedId === patient.id
                      ? <ChevronUp className="w-4 h-4 text-lavender-500" />
                      : <ChevronDown className="w-4 h-4 text-gray-400" />
                    }
                  </div>
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {expandedId === patient.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-lavender-100 overflow-hidden"
                    >
                      <div className="p-5 bg-lavender-50/40">
                        <div className="grid md:grid-cols-2 gap-6">
                          {/* Left */}
                          <div className="space-y-3">
                            <h5 className="text-xs font-bold text-lavender-600 uppercase tracking-wider">Personal</h5>
                            {[
                              { icon: Phone,    label: 'Phone',       val: patient.phone },
                              { icon: Briefcase,label: 'Occupation',  val: patient.occupation },
                              { icon: Calendar, label: 'Registered',  val: new Date(patient.createdAt).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }) },
                            ].map(({ icon: Icon, label, val }) => val ? (
                              <div key={label} className="flex items-center gap-3 text-sm">
                                <Icon className="w-4 h-4 text-lavender-400 flex-shrink-0" />
                                <span className="text-gray-500 w-20 flex-shrink-0">{label}:</span>
                                <span className="text-gray-700 font-medium">{val}</span>
                              </div>
                            ) : null)}
                          </div>

                          {/* Right */}
                          <div className="space-y-3">
                            <h5 className="text-xs font-bold text-lavender-600 uppercase tracking-wider">Family & Address</h5>
                            {[
                              { icon: Users, label: "Father's",   val: patient.fatherName },
                              { icon: Users, label: "Mother's",   val: patient.motherName },
                              { icon: MapPin,label: 'Address',    val: [patient.address, patient.village, patient.district].filter(Boolean).join(', ') },
                            ].map(({ icon: Icon, label, val }) => val ? (
                              <div key={label} className="flex items-start gap-3 text-sm">
                                <Icon className="w-4 h-4 text-lavender-400 flex-shrink-0 mt-0.5" />
                                <span className="text-gray-500 w-20 flex-shrink-0">{label}:</span>
                                <span className="text-gray-700 font-medium">{val}</span>
                              </div>
                            ) : null)}
                          </div>
                        </div>

                        {patient.notes && (
                          <div className="mt-4 p-3 bg-white rounded-xl border border-lavender-100">
                            <p className="text-xs font-bold text-lavender-600 uppercase tracking-wider mb-1">Notes</p>
                            <p className="text-sm text-gray-700">{patient.notes}</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientRecords;
