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
  MessageCircle,
  BarChart3,
  Rocket,
  Globe,
  Heart,
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

function FloatingShape({
  className,
  delay = 0,
  duration = 6,
  children,
}: {
  className?: string;
  delay?: number;
  duration?: number;
  children?: React.ReactNode;
}) {
  return (
    <motion.div
      animate={{
        y: [0, -20, 0],
        rotateZ: [0, 8, -8, 0],
        rotateX: [0, 15, -15, 0],
      }}
      transition={{ duration, repeat: Infinity, delay, ease: 'easeInOut' }}
      className={className}
      style={{ transformStyle: 'preserve-3d', perspective: '800px' }}
    >
      {children}
    </motion.div>
  );
}

export default function LandingPage() {
  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Tutor',
      description: 'Gemini AI se smart answers, Socratic method se samjhaye',
      iconBg: 'bg-blue-500/10 dark:bg-blue-500/20',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      icon: MessageCircle,
      title: 'AI Voice Teacher',
      description: 'Animated character jo Hindi/English mein baat kare',
      iconBg: 'bg-teal-500/10 dark:bg-teal-500/20',
      iconColor: 'text-teal-600 dark:text-teal-400',
    },
    {
      icon: Gamepad2,
      title: 'Gamified Learning',
      description: 'XP points, streaks, badges, leaderboard - Duolingo style!',
      iconBg: 'bg-orange-500/10 dark:bg-orange-500/20',
      iconColor: 'text-orange-600 dark:text-orange-400',
    },
    {
      icon: BarChart3,
      title: 'Smart Analytics',
      description: 'Weak topics identify karo aur adaptive difficulty se improve karo',
      iconBg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      icon: Shield,
      title: 'Parent Dashboard',
      description: 'Bachche ki progress track karo, study time control karo',
      iconBg: 'bg-rose-500/10 dark:bg-rose-500/20',
      iconColor: 'text-rose-600 dark:text-rose-400',
    },
    {
      icon: BookOpen,
      title: 'CBSE & ICSE Ready',
      description: 'Class 1-12 ka complete syllabus, chapter-wise coverage',
      iconBg: 'bg-indigo-500/10 dark:bg-indigo-500/20',
      iconColor: 'text-indigo-600 dark:text-indigo-400',
    },
  ];

  const stats = [
    { value: '50K+', label: 'Active Students', icon: Users, color: 'text-blue-600 dark:text-blue-400' },
    { value: '200+', label: 'Courses', icon: BookOpen, color: 'text-emerald-600 dark:text-emerald-400' },
    { value: '10L+', label: 'Quizzes Solved', icon: Zap, color: 'text-amber-600 dark:text-amber-400' },
    { value: '4.9', label: 'App Rating', icon: Star, color: 'text-rose-600 dark:text-rose-400' },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-page)] transition-colors duration-300 overflow-hidden">
      {/* ===== HERO SECTION ===== */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 pb-10">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="landing-orb landing-orb-1" />
          <div className="landing-orb landing-orb-2" />
          <div className="landing-orb landing-orb-3" />
        </div>
        <div className="absolute inset-0 landing-grid-pattern" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Text */}
            <div className="text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="mb-6"
              >
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full landing-badge text-sm font-semibold">
                  <Sparkles className="w-4 h-4" />
                  India&apos;s #1 AI Education Platform
                  <Sparkles className="w-4 h-4" />
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.1] mb-6"
              >
                <span className="text-[var(--color-text)]">Padhai Ko</span>
                <br />
                <span className="landing-gradient-text">Banao Smart</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-lg sm:text-xl text-[var(--color-text-secondary)] max-w-xl mb-10 leading-relaxed"
              >
                AI teacher jo tumhari language mein samjhaye, quizzes se test kare,
                aur games jaisa fun learning experience de. Class 1-12 CBSE &amp; ICSE ready!
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="flex flex-col sm:flex-row items-center gap-4 lg:justify-start justify-center"
              >
                <Link to="/signup">
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="group flex items-center gap-3 px-8 py-4 rounded-2xl text-lg font-bold text-white landing-cta-btn shadow-xl"
                  >
                    <Rocket className="w-5 h-5" />
                    Start Free Padhai
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                </Link>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-3 px-8 py-4 rounded-2xl text-lg font-medium landing-secondary-btn"
                >
                  <Play className="w-5 h-5 text-[var(--color-accent)]" />
                  Watch Demo
                </motion.button>
              </motion.div>
            </div>

            {/* Right - Hero Character */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="relative hidden lg:flex items-center justify-center"
            >
              <div className="relative">
                {/* Character Image with float animation */}
                <motion.div
                  animate={{ y: [0, -15, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="relative z-10"
                >
                  <img
                    src="/hero-character.jpg"
                    alt="Smart Student Character"
                    className="w-[420px] h-auto drop-shadow-2xl rounded-3xl"
                    style={{ filter: 'drop-shadow(0 20px 40px rgba(99, 102, 241, 0.2))' }}
                  />
                </motion.div>

                {/* Floating badges around character */}
                <FloatingShape className="absolute -top-6 -left-6 landing-float-badge p-3 rounded-2xl shadow-lg z-20" delay={0} duration={5}>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{'\u{1F525}'}</span>
                    <div>
                      <p className="text-xs font-bold text-[var(--color-text)]">7 Day Streak!</p>
                      <p className="text-[10px] text-[var(--color-text-muted)]">Keep going!</p>
                    </div>
                  </div>
                </FloatingShape>

                <FloatingShape className="absolute -top-2 -right-8 landing-float-badge p-3 rounded-2xl shadow-lg z-20" delay={1.5} duration={6}>
                  <div className="flex items-center gap-2">
                    <Trophy className="w-6 h-6 text-amber-500" />
                    <div>
                      <p className="text-xs font-bold text-[var(--color-text)]">#3 Rank</p>
                      <p className="text-[10px] text-[var(--color-text-muted)]">Leaderboard</p>
                    </div>
                  </div>
                </FloatingShape>

                <FloatingShape className="absolute -bottom-4 left-1/4 landing-float-badge p-3 rounded-2xl shadow-lg z-20" delay={0.8} duration={7}>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{'\u{1F3AF}'}</span>
                    <div>
                      <p className="text-xs font-bold text-[var(--color-text)]">Quiz Score: 95%</p>
                      <p className="text-[10px] text-[var(--color-text-muted)]">Maths Chapter 5</p>
                    </div>
                  </div>
                </FloatingShape>

                {/* Glow behind character */}
                <div className="absolute inset-0 -z-10 rounded-full blur-3xl opacity-30 bg-gradient-to-br from-indigo-400 via-cyan-400 to-purple-400 scale-75" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== STATS SECTION ===== */}
      <section className="py-16 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
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
                  whileHover={{ scale: 1.05, y: -4 }}
                  className="landing-stat-card text-center p-6 rounded-2xl"
                >
                  <Icon className={`w-8 h-8 ${stat.color} mx-auto mb-3`} />
                  <h3 className="text-3xl font-black text-[var(--color-text)] mb-1">{stat.value}</h3>
                  <p className="text-[var(--color-text-muted)] text-sm">{stat.label}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section className="py-20 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="landing-orb landing-orb-4" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full landing-feature-badge text-sm font-semibold mb-4">
              <Sparkles className="w-4 h-4" />
              Features
            </span>
            <h2 className="text-4xl sm:text-5xl font-black text-[var(--color-text)] mb-4">Kya Milega Tumhe?</h2>
            <p className="text-[var(--color-text-secondary)] text-lg max-w-2xl mx-auto">Har wo feature jo tumhari padhai ko next level pe le jaaye</p>
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
                  className="landing-feature-card group p-6 rounded-2xl cursor-pointer"
                >
                  <div className={`w-14 h-14 rounded-2xl ${feature.iconBg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-7 h-7 ${feature.iconColor}`} />
                  </div>
                  <h3 className="text-xl font-bold text-[var(--color-text)] mb-2">{feature.title}</h3>
                  <p className="text-[var(--color-text-secondary)] leading-relaxed">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full landing-steps-badge text-sm font-semibold mb-4">
              <Globe className="w-4 h-4" />
              How It Works
            </span>
            <h2 className="text-4xl sm:text-5xl font-black text-[var(--color-text)] mb-4">3 Steps Mein Shuru Karo</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Sign Up Karo', desc: 'Free account banao aur apna class/board select karo', icon: '\u{1F680}', color: 'from-blue-500 to-indigo-600' },
              { step: '02', title: 'Course Select Karo', desc: 'Apna subject choose karo aur chapters explore karo', icon: '\u{1F4DA}', color: 'from-teal-500 to-cyan-600' },
              { step: '03', title: 'Padhna Shuru!', desc: 'AI teacher se seekho, quiz do, XP kamao!', icon: '\u{1F3AF}', color: 'from-orange-500 to-amber-600' },
            ].map((item, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                whileHover={{ y: -8 }}
                className="landing-step-card relative p-8 rounded-3xl text-center group"
              >
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${item.color} flex items-center justify-center text-white font-bold text-sm shadow-lg`}>
                    {item.step}
                  </div>
                </div>
                <span className="text-5xl mb-4 block mt-4">{item.icon}</span>
                <h3 className="text-xl font-bold text-[var(--color-text)] mb-2">{item.title}</h3>
                <p className="text-[var(--color-text-secondary)]">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PRICING SECTION ===== */}
      <section className="py-20 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="landing-orb landing-orb-5" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full landing-pricing-badge text-sm font-semibold mb-4">
              <Heart className="w-4 h-4" />
              Pricing
            </span>
            <h2 className="text-4xl sm:text-5xl font-black text-[var(--color-text)] mb-4">Apna Plan Choose Karo</h2>
            <p className="text-[var(--color-text-secondary)] text-lg max-w-2xl mx-auto">Free se start karo, jab mann kare upgrade karo</p>
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
                className={`relative p-8 rounded-3xl transition-all ${plan.popular ? 'landing-pricing-popular' : 'landing-pricing-card'}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs font-bold shadow-lg">MOST POPULAR</span>
                  </div>
                )}
                <h3 className="text-xl font-bold text-[var(--color-text)] mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  {plan.price === 0 ? (
                    <span className="text-4xl font-black text-[var(--color-text)]">Free</span>
                  ) : (
                    <>
                      <span className="text-lg text-[var(--color-text-secondary)]">&#8377;</span>
                      <span className="text-4xl font-black text-[var(--color-text)]">{plan.price}</span>
                      <span className="text-[var(--color-text-secondary)]">{plan.period}</span>
                    </>
                  )}
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-3 text-[var(--color-text-secondary)] text-sm">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link to="/signup">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${plan.popular ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25' : 'landing-pricing-btn'}`}
                  >
                    {plan.price === 0 ? 'Start Free' : 'Get Started'}
                  </motion.button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="py-20 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={0}
            className="landing-cta-section relative p-12 rounded-3xl text-center overflow-hidden"
          >
            <div className="relative z-10">
              <motion.div
                animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="text-6xl mb-6"
              >
                {'\u{1F393}'}
              </motion.div>
              <h2 className="text-3xl sm:text-4xl font-black text-[var(--color-text)] mb-4">
                Aaj Hi Shuru Karo Apni Smart Padhai!
              </h2>
              <p className="text-[var(--color-text-secondary)] text-lg mb-8 max-w-xl mx-auto">
                50,000+ students already join kar chuke hai. Ab tumhari baari!
              </p>
              <Link to="/signup">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-3 px-10 py-4 rounded-2xl text-lg font-bold text-white landing-cta-btn shadow-xl"
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
