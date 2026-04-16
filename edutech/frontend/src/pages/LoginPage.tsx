import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, LogIn, GraduationCap, Sparkles, Loader2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import { authApi, ApiError } from '../services/api';
import { useLanguage } from '../i18n/useLanguage';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useStore();
  const { t } = useLanguage();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill all fields');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await authApi.login({ email, password });
      login(
        {
          id: res.user.id,
          name: res.user.name,
          email: res.user.email,
          role: res.user.role,
          avatar: res.user.avatar || '🦁',
          xp: res.user.xp ?? 0,
          level: res.user.level ?? 1,
          streak: res.user.streak ?? 0,
          badges: [],
          subscription: (res.user.subscription as 'free' | 'pro' | 'premium') || 'free',
          phone: res.user.phone || '',
          grade: res.user.grade || '',
          board: res.user.board || '',
        },
        res.token,
      );
      navigate(res.user.role === 'admin' ? '/admin' : res.user.role === 'parent' ? '/parent' : '/dashboard');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-theme-page transition-colors duration-300 flex items-center justify-center pt-16 px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/3 w-80 h-80 bg-violet-600/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-cyan-600/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-md"
      >
        <div className="bg-gray-900/80 backdrop-blur-xl rounded-3xl border border-theme-border p-8 shadow-2xl">
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30"
            >
              <GraduationCap className="w-8 h-8 text-white" />
            </motion.div>
                        <h1 className="text-2xl font-black text-white mb-2">{t.login_title}</h1>
                        <p className="text-theme-text-secondary">{t.login_subtitle}</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
              >
                {error}
              </motion.div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-theme-text-secondary">{t.email}</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-text-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@example.com"
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-theme-input border border-theme-border text-white placeholder-gray-600 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-theme-text-secondary">{t.password}</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-text-muted" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full pl-12 pr-12 py-3.5 rounded-xl bg-theme-input border border-theme-border text-white placeholder-gray-600 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-theme-text-muted hover:text-gray-300"
                >
                  {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-theme-text-secondary cursor-pointer">
                <input type="checkbox" className="rounded border-gray-600 bg-theme-input text-violet-500 focus:ring-violet-500" />
                Remember me
              </label>
              <a href="#" className="text-violet-400 hover:text-violet-300 transition-colors">
                Forgot password?
              </a>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-violet-500 to-purple-600 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all disabled:opacity-60"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5" />}
              {loading ? t.loading : t.login_button}
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-theme-text-muted text-sm">
                            {t.no_account}{' '}
                            <Link to="/signup" className="text-violet-400 hover:text-violet-300 font-medium transition-colors">
                              {t.nav_signup}
                            </Link>
            </p>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-theme-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-gray-900 text-theme-text-muted">ya</span>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={async () => {
                setError('');
                setLoading(true);
                try {
                  const res = await authApi.login({ email: 'demo@eduai.com', password: 'demo123456' });
                  login(
                    {
                      id: res.user.id,
                      name: res.user.name,
                      email: res.user.email,
                      role: res.user.role,
                      avatar: res.user.avatar || '🦁',
                      xp: res.user.xp ?? 0,
                      level: res.user.level ?? 1,
                      streak: res.user.streak ?? 0,
                      badges: [],
                      subscription: (res.user.subscription as 'free' | 'pro' | 'premium') || 'free',
                      phone: res.user.phone || '',
                      grade: res.user.grade || '',
                      board: res.user.board || '',
                    },
                    res.token,
                  );
                  navigate(res.user.role === 'admin' ? '/admin' : res.user.role === 'parent' ? '/parent' : '/dashboard');
                } catch (err) {
                  setError(err instanceof ApiError ? err.message : 'Demo login failed.');
                } finally {
                  setLoading(false);
                }
              }}
              className="mt-4 w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-medium text-gray-300 bg-theme-input border border-theme-border hover:bg-theme-card-hover transition-all"
            >
              <Sparkles className="w-5 h-5 text-violet-400" />
              Demo Login
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
