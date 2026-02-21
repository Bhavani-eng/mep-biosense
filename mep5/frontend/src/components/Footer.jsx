import React from 'react';
import { Heart, Mail, MapPin, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-lavender-900 to-accent-purple text-white mt-20">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Heart className="w-6 h-6 fill-white" />
              <span className="text-xl font-display font-semibold">BioSense</span>
            </div>
            <p className="text-lavender-100 text-sm leading-relaxed">
              AI-powered healthcare platform dedicated to women's health through
              early disease detection and personalized insights.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4 font-display text-lg">Quick Links</h3>
            <div className="space-y-2">
              <Link to="/home" className="block text-lavender-100 hover:text-white transition-colors">
                Home
              </Link>
              <Link to="/pcos" className="block text-lavender-100 hover:text-white transition-colors">
                PCOS Screening
              </Link>
              <Link to="/thyroid" className="block text-lavender-100 hover:text-white transition-colors">
                Thyroid Analysis
              </Link>
              <Link to="/dashboard" className="block text-lavender-100 hover:text-white transition-colors">
                Dashboard
              </Link>
            </div>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold mb-4 font-display text-lg">Resources</h3>
            <div className="space-y-2">
              <a href="#" className="block text-lavender-100 hover:text-white transition-colors">
                About Us
              </a>
              <a href="#" className="block text-lavender-100 hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="block text-lavender-100 hover:text-white transition-colors">
                Terms of Service
              </a>
              <a href="#" className="block text-lavender-100 hover:text-white transition-colors">
                Contact Support
              </a>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4 font-display text-lg">Contact</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Mail className="w-4 h-4 mt-1 flex-shrink-0" />
                <span className="text-lavender-100 text-sm">support@biosense.health</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                <span className="text-lavender-100 text-sm">
                  Silicon Valley, CA
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="border-t border-lavender-700/50 pt-8">
          <div className="flex items-start gap-3 p-4 bg-lavender-800/30 rounded-xl backdrop-blur-sm mb-6">
            <Shield className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold mb-1 text-sm">Medical Disclaimer</h4>
              <p className="text-xs text-lavender-100 leading-relaxed">
                This platform is designed for screening and educational purposes only. 
                It does not provide medical diagnosis or treatment. Always consult with 
                qualified healthcare professionals for medical advice and diagnosis. 
                Do not disregard professional medical advice or delay seeking it based 
                on information from this platform.
              </p>
            </div>
          </div>

          <div className="text-center text-sm text-lavender-200">
            <p>&copy; 2024 BioSense. All rights reserved. Empowering women through AI precision healthcare.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
