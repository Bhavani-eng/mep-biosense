import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Heart, Activity, Shield, ChevronRight, ChevronLeft, X } from 'lucide-react';

const SCREENINGS = [
  {
    id: 'pcos',
    route: '/pcos',
    icon: Heart,
    gradient: 'from-pink-400 to-rose-500',
    title: 'PCOS Risk Assessment',
    subtitle: 'Step 1 of 3',
    description:
      'Analyse hormonal patterns, menstrual history, symptoms and lifestyle factors to assess your PCOS risk.',
    bullets: ['14 health parameters', 'AI-powered ML model', 'Personalised recommendations'],
  },
  {
    id: 'thyroid',
    route: '/thyroid',
    icon: Activity,
    gradient: 'from-lavender-400 to-purple-500',
    title: 'Thyroid Analysis',
    subtitle: 'Step 2 of 3',
    description:
      'Enter your thyroid biomarker levels (TSH, T3, TT4, FTI) for a comprehensive rule-based diagnosis.',
    bullets: ['4 key biomarkers', 'Hypo & Hyperthyroid detection', 'Hormone level chart'],
  },
  {
    id: 'breast',
    route: '/breast-cancer',
    icon: Shield,
    gradient: 'from-violet-400 to-indigo-500',
    title: 'Breast Cancer Screening',
    subtitle: 'Step 3 of 3',
    description:
      'Quick risk screening based on family history, lifestyle, and current symptoms. No complex tests needed.',
    bullets: ['Easy toggle-based form', 'Risk factor analysis', 'Urgency-aware recommendations'],
  },
];

const ScreeningSelector = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();

  const current = SCREENINGS[step];
  const Icon = current.icon;

  const handleStart = () => {
    onClose();
    navigate(current.route);
  };

  const handleClose = () => {
    setStep(0);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-lavender-900/40 backdrop-blur-sm z-50 flex items-center justify-center px-4"
        onClick={handleClose}
      >
        <motion.div
          key="modal"
          initial={{ opacity: 0, scale: 0.92, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 30 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          className="glass-card rounded-3xl shadow-glow w-full max-w-lg p-8 relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close */}
          <button
            onClick={handleClose}
            className="absolute top-5 right-5 p-2 rounded-xl hover:bg-lavender-100 transition-colors text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Step dots */}
          <div className="flex justify-center gap-2 mb-6">
            {SCREENINGS.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === step
                    ? 'w-8 h-3 bg-lavender-500'
                    : 'w-3 h-3 bg-lavender-200 hover:bg-lavender-300'
                }`}
              />
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.22 }}
            >
              {/* Icon */}
              <div className="flex justify-center mb-5">
                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${current.gradient} flex items-center justify-center shadow-lg`}>
                  <Icon className="w-10 h-10 text-white" />
                </div>
              </div>

              {/* Subtitle */}
              <p className="text-center text-sm font-semibold text-lavender-500 uppercase tracking-widest mb-1">
                {current.subtitle}
              </p>

              {/* Title */}
              <h2 className="text-center text-2xl font-display font-bold text-gray-800 mb-3">
                {current.title}
              </h2>

              {/* Description */}
              <p className="text-center text-gray-600 mb-5 leading-relaxed">
                {current.description}
              </p>

              {/* Bullets */}
              <div className="bg-lavender-50 rounded-2xl p-4 mb-6 space-y-2">
                {current.bullets.map((b, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-lavender-500 rounded-full flex-shrink-0" />
                    <span className="text-sm text-gray-700">{b}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium text-sm transition-all ${
                step === 0
                  ? 'opacity-30 cursor-not-allowed bg-lavender-100 text-lavender-400'
                  : 'bg-lavender-100 text-lavender-700 hover:bg-lavender-200'
              }`}
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>

            <button
              onClick={handleStart}
              className="flex-1 btn-primary flex items-center justify-center gap-2 py-3"
            >
              Start {current.title.split(' ')[0]} Screening
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setStep((s) => Math.min(SCREENINGS.length - 1, s + 1))}
              disabled={step === SCREENINGS.length - 1}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium text-sm transition-all ${
                step === SCREENINGS.length - 1
                  ? 'opacity-30 cursor-not-allowed bg-lavender-100 text-lavender-400'
                  : 'bg-lavender-100 text-lavender-700 hover:bg-lavender-200'
              }`}
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* "Do all 3" hint */}
          <p className="text-center text-xs text-gray-400 mt-4">
            Use ‹ Back / Next › to browse all 3 screenings before starting
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ScreeningSelector;
