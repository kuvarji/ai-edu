import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap,
  Menu,
  X,
  LogIn,
  UserPlus,
  Home,
  BookOpen,
  Trophy,
  User,
  LayoutDashboard,
  LogOut,
  Flame,
  Zap,
  Shield,
  Users,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { useLanguage } from '../i18n/useLanguage';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { isLoggedIn, user, logout } = useStore();
  const { t } = useLanguage();

  const publicLinks = [
    { to: '/', label: t.nav_home, icon: Home },
    { to: '/courses', label: t.nav_courses, icon: BookOpen },
    { to: '/leaderboard', label: t.nav_leaderboard, icon: Trophy },
  ];

  const adminLinks = [
    { to: '/admin', label: 'Admin Panel', icon: Shield },
    { to: '/dashboard', label: t.nav_dashboard, icon: LayoutDashboard },
    { to: '/courses', label: t.nav_courses, icon: BookOpen },
    { to: '/profile', label: t.nav_profile, icon: User },
  ];

  const parentLinks = [
    { to: '/parent', label: 'Parent Dashboard', icon: Users },
    { to: '/courses', label: t.nav_courses, icon: BookOpen },
    { to: '/profile', label: t.nav_profile, icon: User },
  ];

  const studentLinks = [
    { to: '/dashboard', label: t.nav_dashboard, icon: LayoutDashboard },
    { to: '/courses', label: t.nav_courses, icon: BookOpen },
    { to: '/leaderboard', label: t.nav_leaderboard, icon: Trophy },
    { to: '/profile', label: t.nav_profile, icon: User },
  ];

  const authLinks = user?.role === 'admin' ? adminLinks : user?.role === 'parent' ? parentLinks : studentLinks;
  const links = isLoggedIn ? authLinks : publicLinks;

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      className="fixed top-0 left-0 right-0 z-50 bg-theme-nav backdrop-blur-xl border-b border-theme-nav-border transition-colors duration-300"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <motion.div
              whileHover={{ rotate: 20, scale: 1.1 }}
              className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/30"
            >
              <GraduationCap className="w-6 h-6 text-white" />
            </motion.div>
            <span className="text-xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
              EduAI
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => {
              const Icon = link.icon;
              const active = location.pathname === link.to;
              return (
                <Link key={link.to} to={link.to}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      active
                        ? 'bg-violet-500/20 text-violet-400 shadow-lg shadow-violet-500/10'
                        : 'text-theme-text-secondary hover:text-theme-text hover:bg-theme-card-hover'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {link.label}
                  </motion.div>
                </Link>
              );
            })}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn && user ? (
              <div className="flex items-center gap-4">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20"
                >
                  <Flame className="w-4 h-4 text-orange-400" />
                  <span className="text-sm font-bold text-orange-400">{user.streak}</span>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20"
                >
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm font-bold text-yellow-400">{user.xp} XP</span>
                </motion.div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={logout}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  {t.nav_logout}
                </motion.button>
              </div>
            ) : (
              <>
                <Link to="/login">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-all"
                  >
                    <LogIn className="w-4 h-4" />
                    {t.nav_login}
                  </motion.button>
                </Link>
                <Link to="/signup">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-violet-500 to-purple-600 shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 transition-all"
                  >
                    <UserPlus className="w-4 h-4" />
                    {t.nav_signup}
                  </motion.button>
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-xl text-theme-text-secondary hover:text-theme-text hover:bg-theme-card-hover"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-theme-nav backdrop-blur-xl border-t border-theme-border transition-colors duration-300"
          >
            <div className="px-4 py-4 space-y-2">
              {links.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-theme-text-secondary hover:text-theme-text hover:bg-theme-card-hover transition-all"
                  >
                    <Icon className="w-5 h-5" />
                    {link.label}
                  </Link>
                );
              })}
              {!isLoggedIn && (
                <div className="pt-2 border-t border-theme-border space-y-2">
                  <Link to="/login" onClick={() => setMobileOpen(false)}>
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:text-white hover:bg-white/5">
                      <LogIn className="w-5 h-5" />
                      {t.nav_login}
                    </div>
                  </Link>
                  <Link to="/signup" onClick={() => setMobileOpen(false)}>
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-white bg-gradient-to-r from-violet-500 to-purple-600">
                      <UserPlus className="w-5 h-5" />
                      {t.nav_signup}
                    </div>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
