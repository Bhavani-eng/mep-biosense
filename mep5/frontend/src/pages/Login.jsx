import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Heart, User, Briefcase, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import BackgroundBlobs from '../components/BackgroundBlobs';

const Login = () => {
  const navigate = useNavigate();
  const [userType, setUserType] = useState(null); // 'patient' or 'asha'
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});

  const handleUserTypeSelect = (type) => {
    setUserType(type);
    setFormData({ email: '', password: '' });
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    // Store user type and auth status in localStorage
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userType', userType);
    localStorage.setItem('userEmail', formData.email);

    // Navigate to home
    navigate('/home');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      <BackgroundBlobs />

      <div className="w-full max-w-5xl">
        {/* Logo and Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Heart className="w-12 h-12 text-lavender-500 fill-lavender-500" />
            <h1 className="text-5xl font-display font-bold gradient-text">BioSense</h1>
          </div>
          <p className="text-xl text-gray-600">
            AI-Driven Early Disease Detection & Personalized Treatment
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {!userType ? (
            /* User Type Selection */
            <motion.div
              key="user-type"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="grid md:grid-cols-2 gap-6"
            >
              {/* Patient Login */}
              <motion.button
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                onClick={() => handleUserTypeSelect('patient')}
                className="glass-card rounded-3xl p-8 shadow-card hover:shadow-glow transition-all text-left group"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <User className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-display font-bold mb-3 text-gray-800">
                  I'm a Patient
                </h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Access personalized health screening, risk assessments, and treatment insights
                  tailored for you.
                </p>
                <div className="flex items-center gap-2 text-lavender-600 font-medium">
                  Continue as Patient
                  <span className="group-hover:translate-x-2 transition-transform">→</span>
                </div>
              </motion.button>

              {/* ASHA Worker Login */}
              <motion.button
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                onClick={() => handleUserTypeSelect('asha')}
                className="glass-card rounded-3xl p-8 shadow-card hover:shadow-glow transition-all text-left group"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-lavender-400 to-purple-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Briefcase className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-display font-bold mb-3 text-gray-800">
                  I'm an ASHA Worker
                </h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Manage patient screenings, track community health data, and access healthcare
                  worker tools.
                </p>
                <div className="flex items-center gap-2 text-lavender-600 font-medium">
                  Continue as ASHA Worker
                  <span className="group-hover:translate-x-2 transition-transform">→</span>
                </div>
              </motion.button>
            </motion.div>
          ) : (
            /* Login Form */
            <motion.div
              key="login-form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-md mx-auto"
            >
              <div className="glass-card rounded-3xl p-8 shadow-card">
                {/* Back Button */}
                <button
                  onClick={() => setUserType(null)}
                  className="text-lavender-600 hover:text-lavender-700 font-medium mb-6 flex items-center gap-2"
                >
                  ← Back to user selection
                </button>

                {/* Form Header */}
                <div className="text-center mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-lavender-400 to-purple-500 flex items-center justify-center mx-auto mb-4">
                    {userType === 'patient' ? (
                      <User className="w-8 h-8 text-white" />
                    ) : (
                      <Briefcase className="w-8 h-8 text-white" />
                    )}
                  </div>
                  <h2 className="text-3xl font-display font-bold mb-2">
                    {userType === 'patient' ? 'Patient Login' : 'ASHA Worker Login'}
                  </h2>
                  <p className="text-gray-600">
                    Enter your credentials to continue
                  </p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Email Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`input-field pl-12 ${errors.email ? 'border-red-500' : ''}`}
                        placeholder={
                          userType === 'patient'
                            ? 'patient@example.com'
                            : 'asha.worker@example.com'
                        }
                      />
                    </div>
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                    )}
                  </div>

                  {/* Password Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className={`input-field pl-12 pr-12 ${
                          errors.password ? 'border-red-500' : ''
                        }`}
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                    )}
                  </div>

                  {/* Remember Me & Forgot Password */}
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-lavender-500 border-lavender-300 rounded focus:ring-lavender-400"
                      />
                      <span className="text-sm text-gray-600">Remember me</span>
                    </label>
                    <a href="#" className="text-sm text-lavender-600 hover:text-lavender-700">
                      Forgot password?
                    </a>
                  </div>

                  {/* Submit Button */}
                  <button type="submit" className="w-full btn-primary text-lg py-4">
                    Sign In
                  </button>
                </form>

                {/* Sign Up Link */}
                <div className="mt-6 text-center">
                  <p className="text-gray-600">
                    Don't have an account?{' '}
                    <a href="#" className="text-lavender-600 hover:text-lavender-700 font-medium">
                      Sign up here
                    </a>
                  </p>
                </div>
              </div>

              {/* Demo Credentials */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-6 glass-card rounded-2xl p-4 bg-lavender-50/50"
              >
                <p className="text-sm text-gray-600 mb-2 font-medium">
                  🔑 Demo Credentials (for testing):
                </p>
                <div className="text-xs text-gray-600 space-y-1">
                  {userType === 'patient' ? (
                    <>
                      <p>Email: patient@biosense.com</p>
                      <p>Password: patient123</p>
                    </>
                  ) : (
                    <>
                      <p>Email: asha@biosense.com</p>
                      <p>Password: asha123</p>
                    </>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Login;
