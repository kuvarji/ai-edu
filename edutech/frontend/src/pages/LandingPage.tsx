import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Brain,
  Gamepad2,
  Trophy,
  Users,
  BookOpen,
  Zap,
  Shield,
  Star,
  ArrowRight,
  Play,
  CheckCircle2,
  Flame,
  GraduationCap,
  MessageCircle,
  BarChart3,
} from 'lucide-react';
import { pricingPlans } from '../data/mockData';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: 'easeOut' as const },
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' as const },
  }),
};

export default function LandingPage() {
  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Tutor',
      description: 'Gemini AI se smart answers, Socratic method se samjhaye',
      color: 'from-indigo-500 to-violet-500',
      shadow: 'shadow-indigo-500/20',
    },
    {
      icon: MessageCircle,
      title: 'AI Voice Teacher',
      description: 'Animated character jo Hindi/English mein baat kare',
      color: 'from-cyan-500 to-blue-600',
      shadow: 'shadow-cyan-500/20',
    },
    {
      icon: Gamepad2,
      title: 'Gamified Learning',
      description: 'XP points, streaks, badges, leaderboard - Duolingo style!',
      color: 'from-amber-500 to-orange-600',
      shadow: 'shadow-amber-500/20',
    },
    {
      icon: BarChart3,
      title: 'Smart Analytics',
      description: 'Weak topics identify karo aur adaptive difficulty se improve karo',
      color: 'from-emerald-500 to-teal-600',
      shadow: 'shadow-emerald-500/20',
    },
    {
      icon: Shield,
      title: 'Parent Dashboard',
      description: 'Bachche ki progress track karo, study time control karo',
      color: 'from-rose-500 to-pink-600',
      shadow: 'shadow-rose-500/20',
    },
    {
      icon: BookOpen,
      title: 'CBSE Syllabus Based',
      description: 'Class 6-12 ka complete syllabus, chapter-wise coverage',
      color: 'from-indigo-500 to-blue-700',
      shadow: 'shadow-indigo-500/20',
    },
  ];

  const stats = [
    { value: '50K+', label: 'Active Students', icon: Users },
    { value: '200+', label: 'Courses', icon: BookOpen },
    { value: '10L+', label: 'Quizzes Solved', icon: Zap },
    { value: '4.9', label: 'App Rating', icon: Star },
  ];

  return (
    <div className="min-h-screen bg-theme-page transition-colors duration-300 text-white overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-16">
        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="mb-6"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              India&apos;s #1 AI Education Platform
              <Sparkles className="w-4 h-4" />
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl sm:text-7xl lg:text-8xl font-black leading-tight mb-6"
          >
            <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
              Padhai Ko
            </span>
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
              Banao Smart
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg sm:text-xl text-theme-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            AI teacher jo tumhari language mein samjhaye, quizzes se test kare,
            aur games jaisa fun learning experience de. Class 6-12 CBSE syllabus ready!
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/signup">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(139, 92, 246, 0.3)' }}
                whileTap={{ scale: 0.95 }}
                className="group flex items-center gap-3 px-8 py-4 rounded-2xl text-lg font-bold text-white bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-600 shadow-xl shadow-indigo-500/25 transition-all"
              >
                <Zap className="w-5 h-5" />
                Start Free Padhai
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </Link>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-3 px-8 py-4 rounded-2xl text-lg font-medium text-gray-300 bg-theme-input border border-theme-border hover:bg-theme-card-hover transition-all"
            >
              <Play className="w-5 h-5 text-indigo-400" />
              Watch Demo
            </motion.button>
          </motion.div>

          {/* Floating cards */}
          <div className="relative mt-20 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.8 }}
              className="relative"
            >
              <div className="bg-gray-900/80 backdrop-blur-xl rounded-3xl border border-theme-border p-8 shadow-2xl">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {[
                    { emoji: '📐', label: 'Maths', progress: 75, color: 'violet' },
                    { emoji: '🔬', label: 'Science', progress: 60, color: 'emerald' },
                    { emoji: '📚', label: 'English', progress: 90, color: 'amber' },
                    { emoji: '🌍', label: 'SST', progress: 45, color: 'cyan' },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1 + i * 0.15 }}
                      whileHover={{ y: -5 }}
                      className="text-center p-4 rounded-2xl bg-theme-input hover:bg-theme-card-hover transition-all cursor-pointer"
                    >
                      <span className="text-4xl mb-2 block">{item.emoji}</span>
                      <p className="text-sm font-medium text-gray-300 mb-2">{item.label}</p>
                      <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${item.progress}%` }}
                          transition={{ delay: 1.5 + i * 0.15, duration: 0.8 }}
                          className={`h-full rounded-full bg-gradient-to-r ${
                            item.color === 'violet' ? 'from-indigo-500 to-violet-500' :
                            item.color === 'emerald' ? 'from-emerald-500 to-teal-500' :
                            item.color === 'amber' ? 'from-amber-500 to-orange-500' :
                            'from-cyan-500 to-blue-500'
                          }`}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Floating badges */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-6 -left-6 p-3 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/30"
              >
                <Flame className="w-6 h-6 text-white" />
              </motion.div>
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                className="absolute -top-4 -right-4 p-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/30"
              >
                <Trophy className="w-6 h-6 text-white" />
              </motion.div>
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
                className="absolute -bottom-4 left-1/4 p-3 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/30"
              >
                <GraduationCap className="w-6 h-6 text-white" />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={i}
                  variants={scaleIn}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  custom={i}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="text-center p-6 rounded-2xl bg-theme-card border border-theme-border hover:border-indigo-500/20 transition-all"
                >
                  <Icon className="w-8 h-8 text-indigo-400 mx-auto mb-3" />
                  <h3 className="text-3xl font-black text-white mb-1">{stat.value}</h3>
                  <p className="text-theme-text-muted text-sm">{stat.label}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-0 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl" />
          <div className="absolute top-1/4 right-0 w-72 h-72 bg-cyan-600/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={0}
            className="text-center mb-16"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              Features
            </span>
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
              Kya Milega Tumhe?
            </h2>
            <p className="text-theme-text-secondary text-lg max-w-2xl mx-auto">
              Har wo feature jo tumhari padhai ko next level pe le jaaye
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  custom={i}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className={`group p-6 rounded-2xl bg-theme-card border border-theme-border hover:border-theme-border transition-all cursor-pointer ${feature.shadow}`}
                >
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-theme-text-secondary leading-relaxed">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={0}
            className="text-center mb-16"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              How It Works
            </span>
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
              3 Steps Mein Shuru Karo
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Sign Up Karo',
                desc: 'Free account banao aur apna class/board select karo',
                color: 'from-indigo-500 to-violet-500',
                icon: '🚀',
              },
              {
                step: '02',
                title: 'Course Select Karo',
                desc: 'Apna subject choose karo aur chapters explore karo',
                color: 'from-cyan-500 to-blue-600',
                icon: '📚',
              },
              {
                step: '03',
                title: 'Padhna Shuru!',
                desc: 'AI teacher se seekho, quiz do, XP kamao!',
                color: 'from-amber-500 to-orange-600',
                icon: '🎯',
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                whileHover={{ y: -8 }}
                className="relative p-8 rounded-3xl bg-theme-card border border-theme-border text-center group hover:border-theme-border transition-all"
              >
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${item.color} flex items-center justify-center text-white font-bold text-sm shadow-lg`}>
                    {item.step}
                  </div>
                </div>
                <span className="text-5xl mb-4 block mt-4">{item.icon}</span>
                <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                <p className="text-theme-text-secondary">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0">
          <div className="absolute bottom-0 left-1/4 w-96 h-96           bg-indigo-600/10 rounded-full blur-3xl" />
                    <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-amber-600/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={0}
            className="text-center mb-16"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              Pricing
            </span>
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
              Apna Plan Choose Karo
            </h2>
            <p className="text-theme-text-secondary text-lg max-w-2xl mx-auto">
              Free se start karo, jab mann kare upgrade karo
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan, i) => (
              <motion.div
                key={i}
                variants={scaleIn}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                whileHover={{ y: -8, scale: 1.02 }}
                className={`relative p-8 rounded-3xl border transition-all ${
                  plan.popular
                    ? 'bg-gradient-to-b from-indigo-500/10 to-violet-500/5 border-indigo-500/30 shadow-xl shadow-indigo-500/10'
                    : 'bg-theme-card border-theme-border hover:border-theme-border'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-xs font-bold shadow-lg">
                      MOST POPULAR
                    </span>
                  </div>
                )}
                <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  {plan.price === 0 ? (
                    <span className="text-4xl font-black text-white">Free</span>
                  ) : (
                    <>
                      <span className="text-lg text-theme-text-secondary">&#8377;</span>
                      <span className="text-4xl font-black text-white">{plan.price}</span>
                      <span className="text-theme-text-secondary">{plan.period}</span>
                    </>
                  )}
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-3 text-gray-300 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link to="/signup">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${
                      plan.popular
                        ? 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/25'
                        : 'bg-theme-input text-white hover:bg-theme-card-hover border border-theme-border'
                    }`}
                  >
                    {plan.price === 0 ? 'Start Free' : 'Get Started'}
                  </motion.button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={0}
            className="relative p-12 rounded-3xl bg-gradient-to-br from-indigo-600/20 to-violet-600/20 border border-indigo-500/20 text-center overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/5 to-transparent" />
            <div className="relative">
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="text-6xl mb-6"
              >
                🎓
              </motion.div>
              <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
                Aaj Hi Shuru Karo Apni Smart Padhai!
              </h2>
              <p className="text-theme-text-secondary text-lg mb-8 max-w-xl mx-auto">
                50,000+ students already join kar chuke hai. Ab tumhari baari!
              </p>
              <Link to="/signup">
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(99, 102, 241, 0.4)' }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-3 px-10 py-4 rounded-2xl text-lg font-bold text-white bg-gradient-to-r from-indigo-500 to-violet-500 shadow-xl shadow-indigo-500/25"
                >
                  <Sparkles className="w-5 h-5" />
                  Join EduAI Free
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
