import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Heart,
  Sparkles,
  Brain,
  Activity,
  Shield,
  Zap,
  Users,
  TrendingUp,
  ChevronRight,
} from 'lucide-react';
import BackgroundBlobs from '../components/BackgroundBlobs';
import ScreeningSelector from '../components/ScreeningSelector';

const LandingPage = () => {
  const [showScreening, setShowScreening] = useState(false);

  const features = [
    {
      icon: Heart,
      title: 'PCOS Risk Prediction',
      description:
        'Advanced AI analysis of hormonal patterns, symptoms, and lifestyle factors for early PCOS detection.',
      gradient: 'from-pink-400 to-rose-500',
    },
    {
      icon: Activity,
      title: 'Thyroid Analysis',
      description:
        'Comprehensive thyroid function assessment using biomarker analysis and symptom correlation.',
      gradient: 'from-lavender-400 to-purple-500',
    },
    {
      icon: Shield,
      title: 'Breast Cancer Screening',
      description:
        'AI-powered early detection screening combining risk factors and multi-omics data analysis.',
      gradient: 'from-violet-400 to-indigo-500',
      link: '/breast-cancer',
    },
    {
      icon: Sparkles,
      title: 'Personalized Insights',
      description:
        'Tailored treatment recommendations and lifestyle modifications based on your unique health profile.',
      gradient: 'from-fuchsia-400 to-pink-500',
    },
  ];

  const stats = [
    { value: '98%', label: 'Prediction Accuracy' },
    { value: '50K+', label: 'Women Screened' },
    { value: '15+', label: 'Health Biomarkers' },
    { value: '24/7', label: 'AI Support' },
  ];

  return (
    <div className="min-h-screen">
      <BackgroundBlobs />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-lavender-100/80 rounded-full">
                <Sparkles className="w-4 h-4 text-lavender-600" />
                <span className="text-sm font-medium text-lavender-700">
                  AI-Powered Women's Healthcare
                </span>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold leading-tight">
                Empowering Women Through{' '}
                <span className="gradient-text">AI Precision</span> Healthcare
              </h1>

              <p className="text-xl text-gray-600 leading-relaxed">
                Early disease detection and personalized treatment insights powered by
                advanced AI, multi-omics analysis, and women-centric innovation.
              </p>

              <div className="flex flex-wrap gap-4">
                <button onClick={() => setShowScreening(true)} className="btn-primary inline-flex items-center gap-2">
                  Start Health Screening
                  <ChevronRight className="w-5 h-5" />
                </button>
                <Link to="/dashboard" className="btn-secondary">
                  View Dashboard
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8">
                {stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 * index }}
                  >
                    <div className="text-3xl font-bold gradient-text font-display">
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right Illustration */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative glass-card rounded-3xl p-8 shadow-card">
                {/* Medical Illustration Placeholder */}
                <div className="relative h-96 bg-gradient-to-br from-lavender-100 to-lavender-200 rounded-2xl overflow-hidden">
                  {/* Animated Elements */}
                  <motion.div
                    className="absolute top-1/4 left-1/4 w-24 h-24 bg-lavender-300/50 rounded-full blur-2xl"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 0.8, 0.5],
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                  <motion.div
                    className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-accent-purple/40 rounded-full blur-2xl"
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.4, 0.7, 0.4],
                    }}
                    transition={{ duration: 4, repeat: Infinity, delay: 1 }}
                  />

                  {/* Center Icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                      className="relative"
                    >
                      <Heart className="w-32 h-32 text-lavender-400 fill-lavender-400/30" />
                    </motion.div>
                  </div>

                  {/* Floating Icons */}
                  {[Brain, Activity, Shield, Zap].map((Icon, index) => (
                    <motion.div
                      key={index}
                      className="absolute"
                      style={{
                        top: `${25 + index * 15}%`,
                        left: `${10 + index * 20}%`,
                      }}
                      animate={{
                        y: [0, -10, 0],
                        rotate: [0, 5, 0],
                      }}
                      transition={{
                        duration: 2 + index,
                        repeat: Infinity,
                        delay: index * 0.5,
                      }}
                    >
                      <div className="glass-card p-3 rounded-xl shadow-soft">
                        <Icon className="w-6 h-6 text-lavender-600" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-lavender-300/30 rounded-full blur-2xl" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-accent-purple/20 rounded-full blur-2xl" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
              Comprehensive Health <span className="gradient-text">Screening</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Advanced AI-powered screening tools designed specifically for women's health
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className="glass-card rounded-2xl p-6 shadow-card hover:shadow-glow transition-all duration-300"
              >
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 shadow-md`}
                >
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-display font-semibold mb-3 text-gray-800">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 px-6 bg-white/50">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
                AI + Multi-Omics + <span className="gradient-text">Innovation</span>
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  BioSense leverages cutting-edge artificial intelligence and multi-omics
                  data analysis to revolutionize women's healthcare. Our platform combines
                  genomics, proteomics, and metabolomics data to provide unprecedented
                  insights into your health.
                </p>
                <p>
                  By analyzing complex patterns across multiple biological layers, we can
                  detect early warning signs of conditions like PCOS, thyroid disorders,
                  and breast cancer before traditional methods.
                </p>
                <p>
                  Our women-centric approach ensures that every algorithm, every insight,
                  and every recommendation is tailored to the unique biological and
                  hormonal patterns of women's health.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-8">
                {[
                  { icon: Brain, label: 'AI-Powered' },
                  { icon: TrendingUp, label: 'Multi-Omics' },
                  { icon: Users, label: 'Women-Centric' },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="glass-card rounded-xl p-4 text-center hover:shadow-soft transition-shadow"
                  >
                    <item.icon className="w-8 h-8 text-lavender-600 mx-auto mb-2" />
                    <div className="text-sm font-medium text-gray-700">{item.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="glass-card rounded-3xl p-8 shadow-card">
                <div className="bg-gradient-to-br from-lavender-50 to-lavender-100 rounded-2xl p-8 space-y-4">
                  {[
                    'Early detection through pattern recognition',
                    'Personalized risk assessment',
                    'Evidence-based recommendations',
                    'Continuous health monitoring',
                    'Privacy-first data handling',
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-3"
                    >
                      <div className="w-2 h-2 bg-lavender-500 rounded-full" />
                      <span className="text-gray-700">{item}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card rounded-3xl p-12 text-center bg-gradient-to-br from-lavender-100/80 to-lavender-200/80 shadow-card"
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
              Ready to Take Control of Your Health?
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Start your personalized health screening journey today with our AI-powered
              platform.
            </p>
            <button onClick={() => setShowScreening(true)} className="btn-primary inline-flex items-center gap-2">
              Begin Screening
              <ChevronRight className="w-5 h-5" />
            </button>
          </motion.div>
        </div>
      </section>
      <ScreeningSelector isOpen={showScreening} onClose={() => setShowScreening(false)} />
    </div>
  );
};

export default LandingPage;
