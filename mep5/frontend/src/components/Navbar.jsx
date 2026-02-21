import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Menu, X, LogOut, User, Briefcase, Sparkles } from 'lucide-react';
import ScreeningSelector from './ScreeningSelector';

const Navbar = () => {
  const [isScrolled, setIsScrolled]         = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showScreening, setShowScreening]   = useState(false);
  const location  = useLocation();
  const navigate  = useNavigate();

  const userType  = localStorage.getItem('userType');
  const userEmail = localStorage.getItem('userEmail');
  const isAsha    = userType === 'asha';

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userType');
    localStorage.removeItem('userEmail');
    navigate('/');
  };

  // All nav links — Patient Records only for ASHA workers
  const navLinks = [
    { path: '/home',         label: 'Home' },
    { path: '/pcos',         label: 'PCOS' },
    { path: '/thyroid',      label: 'Thyroid' },
    { path: '/breast-cancer',label: 'Breast Cancer' },
    { path: '/dashboard',    label: 'Dashboard' },
    ...(isAsha ? [{ path: '/patients', label: 'Patient Records' }] : []),
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/90 backdrop-blur-md shadow-soft' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">

          {/* Logo */}
          <Link to="/home" className="flex items-center gap-2 group flex-shrink-0">
            <div className="relative">
              <Heart className="w-8 h-8 text-lavender-500 fill-lavender-500 group-hover:scale-110 transition-transform" />
              <div className="absolute inset-0 bg-lavender-400 blur-lg opacity-0 group-hover:opacity-50 transition-opacity" />
            </div>
            <span className="text-2xl font-display font-semibold gradient-text">BioSense</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-5">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`font-medium text-sm transition-all duration-200 relative whitespace-nowrap ${
                  location.pathname === link.path
                    ? 'text-lavender-600'
                    : 'text-gray-600 hover:text-lavender-500'
                }`}
              >
                {link.label}
                {location.pathname === link.path && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-lavender-500"
                  />
                )}
              </Link>
            ))}

            {/* Start Screening Button */}
            <button
              onClick={() => setShowScreening(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-lavender-500 hover:bg-lavender-600 text-white text-sm font-semibold rounded-xl transition-all shadow-sm hover:shadow-md flex-shrink-0"
            >
              <Sparkles className="w-4 h-4" />
              Start Screening
            </button>

            {/* User Info + Logout */}
            <div className="flex items-center gap-2 pl-3 border-l border-lavender-200">
              <div className="flex items-center gap-1">
                {isAsha
                  ? <Briefcase className="w-4 h-4 text-lavender-600" />
                  : <User className="w-4 h-4 text-lavender-600" />
                }
                <span className="text-sm text-gray-600 hidden lg:block max-w-[100px] truncate">
                  {userEmail?.split('@')[0]}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden lg:block">Logout</span>
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-700"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden pt-4 pb-2"
          >
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block py-3 font-medium ${
                  location.pathname === link.path ? 'text-lavender-600' : 'text-gray-600'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <button
              onClick={() => { setIsMobileMenuOpen(false); setShowScreening(true); }}
              className="w-full mt-2 btn-primary text-sm py-3 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" /> Start Screening
            </button>
            <div className="mt-4 pt-4 border-t border-lavender-200">
              <div className="flex items-center gap-2 py-2 text-gray-600">
                {isAsha ? <Briefcase className="w-5 h-5 text-lavender-600" /> : <User className="w-5 h-5 text-lavender-600" />}
                <span className="text-sm">{userEmail}</span>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 mt-2 px-4 py-3 text-sm font-medium text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-all"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          </motion.div>
        )}
      </div>

      <ScreeningSelector isOpen={showScreening} onClose={() => setShowScreening(false)} />
    </motion.nav>
  );
};

export default Navbar;
