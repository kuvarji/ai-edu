import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, UserPlus, GraduationCap, Phone, Loader2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import { authApi, ApiError } from '../services/api';
import { useLanguage } from '../i18n/useLanguage';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'student' | 'parent'>('student');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useStore();
  const { t } = useLanguage();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill all required fields');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await authApi.register({ name, email, password, role, phone: phone || undefined });
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
        },
        res.token,
      );
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-theme-page transition-colors duration-300 flex items-center justify-center pt-20 pb-8 px-4 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/4 right-1/3 w-80 h-80 bg-emerald-600/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-violet-600/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
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
              className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30"
            >
              <GraduationCap className="w-8 h-8 text-white" />
            </motion.div>
                        <h1 className="text-2xl font-black text-white mb-2">{t.signup_title}</h1>
                        <p className="text-theme-text-secondary">{t.signup_subtitle}</p>
          </div>

          {/* Role Selector */}
          <div className="flex gap-3 mb-6">
            {(['student', 'parent'] as const).map((r) => (
              <motion.button
                key={r}
                whileTap={{ scale: 0.95 }}
                onClick={() => setRole(r)}
                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
                  role === r
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25'
                    : 'bg-theme-input text-theme-text-secondary border border-theme-border hover:bg-theme-card-hover'
                }`}
              >
                {r === 'student' ? '🎒 Student' : '👨‍👩‍👧 Parent'}
              </motion.button>
            ))}
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
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
              <label className="text-sm font-medium text-theme-text-secondary">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-text-muted" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Apna naam likho"
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-theme-input border border-theme-border text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-theme-text-secondary">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-text-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-theme-input border border-theme-border text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-theme-text-secondary">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-text-muted" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 9876543210"
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-theme-input border border-theme-border text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-theme-text-secondary">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-text-muted" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Strong password banao"
                  className="w-full pl-12 pr-12 py-3.5 rounded-xl bg-theme-input border border-theme-border text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
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

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all disabled:opacity-60"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserPlus className="w-5 h-5" />}
              {loading ? t.loading : t.signup_button}
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-theme-text-muted text-sm">
                            {t.have_account}{' '}
                            <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
                              {t.nav_login}
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
