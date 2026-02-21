import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const CircularProgress = ({ percentage, size = 200, strokeWidth = 12 }) => {
  const [progress, setProgress] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => setProgress(percentage), 100);
    return () => clearTimeout(timer);
  }, [percentage]);

  const getRiskColor = (value) => {
    if (value < 30) return '#10B981'; // Green
    if (value < 60) return '#F59E0B'; // Amber
    return '#EF4444'; // Red
  };

  const riskColor = getRiskColor(percentage);

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E5D9FF"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={riskColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-4xl font-bold font-display"
          style={{ color: riskColor }}
        >
          {Math.round(progress)}%
        </motion.span>
        <span className="text-sm text-gray-600 font-medium">Risk Level</span>
      </div>
    </div>
  );
};

export default CircularProgress;
