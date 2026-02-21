import React from 'react';
import { motion } from 'framer-motion';

const ToggleSwitch = ({ label, checked, onChange, name }) => {
  return (
    <label className="flex items-center justify-between cursor-pointer group">
      <span className="text-gray-700 font-medium">{label}</span>
      <div
        className={`toggle-switch ${
          checked ? 'bg-lavender-500' : 'bg-gray-300'
        }`}
        onClick={() => onChange({ target: { name, value: !checked } })}
      >
        <motion.span
          className="inline-block h-5 w-5 transform rounded-full bg-white shadow-md"
          animate={{ x: checked ? 20 : 2 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </div>
    </label>
  );
};

export default ToggleSwitch;
