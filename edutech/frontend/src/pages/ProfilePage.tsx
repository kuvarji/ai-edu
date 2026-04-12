import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User, Mail, Phone, Shield, Edit3, Camera, Moon, Sun,
  Globe, Bell, Zap, Flame, Trophy, Award, BookOpen, Star,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { badges as mockBadges } from '../data/mockData';
import { authApi, gamificationApi, type Badge as ApiBadge } from '../services/api';

export default function ProfilePage() {
  const { user, darkMode, toggleDarkMode } = useStore();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || 'Student');
  const [language, setLanguage] = useState('hindi');
  const [saving, setSaving] = useState(false);
  const [apiBadges, setApiBadges] = useState<ApiBadge[]>([]);

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const res = await gamificationApi.getMyBadges();
        setApiBadges(res.badges);
      } catch {
        // fallback to mock
      }
    };
    fetchBadges();
  }, []);

  const badges = apiBadges.length > 0
    ? apiBadges.map((b) => ({
        id: b.id,
        name: b.name,
        description: b.description,
        icon: b.icon || '\u2b50',
        unlocked: b.unlocked ?? true,
      }))
    : mockBadges;

  const handleSave = async () => {
    setSaving(true);
    try {
      await authApi.updateProfile({ name });
      setEditing(false);
    } catch {
      // handle error
    } finally {
      setSaving(false);
    }
  };

  const stats = [
    { label: 'Total XP', value: (user?.xp ?? 2450).toLocaleString(), icon: Zap, color: 'text-yellow-400' },
    { label: 'Streak', value: `${user?.streak ?? 12} Days`, icon: Flame, color: 'text-orange-400' },
    { label: 'Level', value: `${user?.level ?? 5}`, icon: Trophy, color: 'text-violet-400' },
    { label: 'Courses', value: '4', icon: BookOpen, color: 'text-emerald-400' },
  ];

  return (
    <div className="min-h-screen bg-gray-950 pt-20 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative p-8 rounded-3xl bg-gradient-to-br from-violet-600/20 via-purple-600/10 to-cyan-600/20 border border-white/10 mb-8 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 to-transparent" />
          <div className="relative flex flex-col sm:flex-row items-center gap-6">
            <div className="relative">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="w-28 h-28 rounded-3xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-5xl shadow-xl shadow-violet-500/30"
              >
                {user?.avatar || '🦁'}
              </motion.div>
              <button className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-gray-900 border border-white/10 text-gray-400 hover:text-white transition-colors">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <div className="text-center sm:text-left flex-1">
              <h1 className="text-3xl font-black text-white mb-1">{user?.name || 'Student'}</h1>
              <p className="text-gray-400 mb-3">{user?.email || 'student@eduai.com'}</p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                <span className="px-3 py-1 rounded-full bg-violet-500/20 text-violet-400 text-xs font-bold capitalize">
                  {user?.role || 'student'}
                </span>
                <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold capitalize">
                  {user?.subscription || 'pro'} Plan
                </span>
                <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold">
                  <Star className="w-3 h-3" /> Level {user?.level ?? 5}
                </span>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setEditing(!editing)}
              className="px-5 py-2.5 rounded-xl font-medium text-sm text-white bg-white/10 border border-white/10 hover:bg-white/20 transition-all flex items-center gap-2"
            >
              <Edit3 className="w-4 h-4" />
              Edit Profile
            </motion.button>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                whileHover={{ y: -3 }}
                className="p-4 rounded-2xl bg-gray-900/50 border border-white/5 text-center"
              >
                <Icon className={`w-6 h-6 mx-auto mb-2 ${stat.color}`} />
                <p className="text-xl font-black text-white">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </motion.div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 rounded-2xl bg-gray-900/50 border border-white/5"
          >
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-violet-400" />
              Personal Information
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={!editing}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white disabled:opacity-50 focus:outline-none focus:border-violet-500/50 transition-all"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="email"
                    value={user?.email || 'student@eduai.com'}
                    disabled
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white opacity-50"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="tel"
                    value="+91 9876543210"
                    disabled={!editing}
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white disabled:opacity-50 focus:outline-none focus:border-violet-500/50 transition-all"
                  />
                </div>
              </div>
              {editing && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-violet-500 to-purple-600 shadow-lg shadow-violet-500/25 disabled:opacity-60"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </motion.button>
              )}
            </div>
          </motion.div>

          {/* Settings */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            {/* Theme */}
            <div className="p-6 rounded-2xl bg-gray-900/50 border border-white/5">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-cyan-400" />
                Settings
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                  <div className="flex items-center gap-3">
                    {darkMode ? <Moon className="w-5 h-5 text-violet-400" /> : <Sun className="w-5 h-5 text-amber-400" />}
                    <span className="text-sm text-gray-300">Dark Mode</span>
                  </div>
                  <button
                    onClick={toggleDarkMode}
                    className={`w-12 h-7 rounded-full transition-all ${darkMode ? 'bg-violet-500' : 'bg-gray-600'}`}
                  >
                    <motion.div
                      animate={{ x: darkMode ? 22 : 2 }}
                      className="w-5 h-5 rounded-full bg-white shadow-sm"
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-emerald-400" />
                    <span className="text-sm text-gray-300">Language</span>
                  </div>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="bg-gray-800 text-white text-sm rounded-lg px-3 py-1.5 border border-white/10 focus:outline-none"
                  >
                    <option value="hindi">Hindi</option>
                    <option value="english">English</option>
                    <option value="hinglish">Hinglish</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-amber-400" />
                    <span className="text-sm text-gray-300">Notifications</span>
                  </div>
                  <button className="w-12 h-7 rounded-full bg-violet-500 transition-all">
                    <motion.div animate={{ x: 22 }} className="w-5 h-5 rounded-full bg-white shadow-sm" />
                  </button>
                </div>
              </div>
            </div>

            {/* Badges */}
            <div className="p-6 rounded-2xl bg-gray-900/50 border border-white/5">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                Badges ({badges.filter((b) => b.unlocked).length}/{badges.length})
              </h3>
              <div className="grid grid-cols-4 gap-2">
                {badges.map((badge) => (
                  <motion.div
                    key={badge.id}
                    whileHover={{ scale: 1.1 }}
                    className={`text-center p-2 rounded-xl ${
                      badge.unlocked ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-white/5 opacity-40'
                    }`}
                    title={badge.description}
                  >
                    <span className="text-xl">{badge.icon}</span>
                    <p className="text-xs text-gray-400 mt-1 truncate">{badge.name}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
