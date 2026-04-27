import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Clock, BookOpen, Shield, UserPlus, Users,
  Flame, Zap, Target, AlertCircle, BarChart3,
} from 'lucide-react';
import { XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { parentApi, type ChildInfo, type ChildProgress } from '../services/api';
import Avatar from '../components/Avatar';


export default function ParentDashboard() {
  const [children, setChildren] = useState<ChildInfo[]>([]);
  const [childProgress, setChildProgress] = useState<ChildProgress | null>(null);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [childEmail, setChildEmail] = useState('');
  const [linking, setLinking] = useState(false);
  const [linkMsg, setLinkMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchChildren = async () => {
    try {
      const res = await parentApi.getChildren();
      setChildren(res.children);
      if (res.children.length > 0) {
        const targetId = selectedChildId || res.children[0].id;
        const progress = await parentApi.getChildProgress(targetId);
        setChildProgress(progress);
        setSelectedChildId(targetId);
      }
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChildren();
  }, []);

  const handleLinkChild = async () => {
    if (!childEmail.trim()) return;
    setLinking(true);
    setLinkMsg(null);
    try {
      await parentApi.linkChild(childEmail.trim());
      setLinkMsg({ type: 'success', text: `Bachcha "${childEmail.trim()}" successfully link ho gaya!` });
      setChildEmail('');
      await fetchChildren();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Link karne mein error aaya. Email check karo.';
      setLinkMsg({ type: 'error', text: msg });
    } finally {
      setLinking(false);
    }
  };

  const latestChildIdRef = useRef<string | null>(null);

  const handleSelectChild = async (childId: string) => {
    setSelectedChildId(childId);
    latestChildIdRef.current = childId;
    try {
      const progress = await parentApi.getChildProgress(childId);
      if (latestChildIdRef.current !== childId) return;
      setChildProgress(progress);
    } catch {
      if (latestChildIdRef.current !== childId) return;
      setChildProgress(null);
    }
  };

  const cp = childProgress;

  const subjectProgress = cp?.course_progress?.length
    ? cp.course_progress.map((p, i) => ({
        subject: p.subject,
        progress: p.percentage,
        grade: p.percentage >= 80 ? 'A' : p.percentage >= 60 ? 'B' : 'C',
        color: [
          'from-indigo-500 to-violet-500',
          'from-emerald-500 to-teal-600',
          'from-amber-500 to-orange-600',
          'from-rose-500 to-pink-600',
          'from-cyan-500 to-blue-600',
        ][i % 5],
      }))
    : [];

  return (
    <div className="min-h-screen bg-theme-page transition-colors duration-300 pt-20 pb-12 px-4 blob-bg">
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-black text-theme-text mb-1">Parent Dashboard</h1>
          <p className="text-theme-text-secondary">Apne bachche ki padhai ka pura overview</p>
        </motion.div>

        {loading && (
          <div className="mb-8 space-y-6">
            {/* Link child section skeleton */}
            <div className="p-6 rounded-2xl bg-theme-card border border-theme-border">
              <div className="h-6 w-44 bg-indigo-100 dark:bg-gray-700/50 animate-pulse rounded-lg mb-4" />
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 h-12 bg-indigo-100 dark:bg-gray-700/50 animate-pulse rounded-xl" />
                <div className="h-12 w-32 bg-indigo-100 dark:bg-gray-700/50 animate-pulse rounded-xl" />
              </div>
            </div>
            {/* Child info card skeleton */}
            <div className="p-6 rounded-2xl bg-indigo-500/5 border border-indigo-500/20">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="w-20 h-20 rounded-2xl bg-indigo-100 dark:bg-gray-700/50 animate-pulse" />
                <div className="flex-1">
                  <div className="h-7 w-40 bg-indigo-100 dark:bg-gray-700/50 animate-pulse rounded-lg mb-2" />
                  <div className="h-4 w-32 bg-indigo-100 dark:bg-gray-700/50 animate-pulse rounded-lg mb-3" />
                  <div className="flex gap-3">
                    <div className="h-6 w-24 bg-indigo-100 dark:bg-gray-700/50 animate-pulse rounded-full" />
                    <div className="h-6 w-20 bg-indigo-100 dark:bg-gray-700/50 animate-pulse rounded-full" />
                    <div className="h-6 w-16 bg-indigo-100 dark:bg-gray-700/50 animate-pulse rounded-full" />
                  </div>
                </div>
                <div className="text-center">
                  <div className="h-8 w-14 mx-auto bg-indigo-100 dark:bg-gray-700/50 animate-pulse rounded-lg mb-1" />
                  <div className="h-4 w-20 mx-auto bg-indigo-100 dark:bg-gray-700/50 animate-pulse rounded-lg" />
                </div>
              </div>
            </div>
            {/* Stats skeleton */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-5 rounded-2xl bg-theme-card border border-theme-border">
                  <div className="w-11 h-11 rounded-xl bg-indigo-100 dark:bg-gray-700/50 animate-pulse mb-3" />
                  <div className="h-7 w-16 bg-indigo-100 dark:bg-gray-700/50 animate-pulse rounded-lg mb-1" />
                  <div className="h-4 w-20 bg-indigo-100 dark:bg-gray-700/50 animate-pulse rounded-lg" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Link Child Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="p-6 rounded-2xl bg-theme-card border border-theme-border mb-8"
        >
                    <h3 className="text-lg font-bold text-theme-text mb-4 flex items-center gap-2">
                      <UserPlus className="w-5 h-5 text-indigo-400" /> Link Child Account
          </h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              value={childEmail}
              onChange={(e) => setChildEmail(e.target.value)}
              placeholder="Bachche ka registered email daalo..."
              className="flex-1 px-4 py-3 rounded-xl bg-theme-input border border-theme-border text-theme-text placeholder-theme-text-muted text-sm focus:outline-none focus:border-indigo-500"
              onKeyDown={(e) => e.key === 'Enter' && !linking && handleLinkChild()}
            />
            <button
              onClick={handleLinkChild}
              disabled={linking || !childEmail.trim()}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-bold text-sm hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 justify-center"
            >
              {linking ? (
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <><UserPlus className="w-4 h-4" /> Link Child</>
              )}
            </button>
          </div>
          {linkMsg && (
            <p className={`mt-3 text-sm font-medium ${
              linkMsg.type === 'success' ? 'text-emerald-400' : 'text-red-400'
            }`}>
              {linkMsg.text}
            </p>
          )}
        </motion.div>

        {/* Linked Children List */}
        {children.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="mb-8"
          >
                        <h3 className="text-lg font-bold text-theme-text mb-3 flex items-center gap-2">
                          <Users className="w-5 h-5 text-cyan-400" /> Linked Children
            </h3>
            <div className="flex flex-wrap gap-3">
              {children.map((child) => (
                <button
                  key={child.id}
                  onClick={() => handleSelectChild(child.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                    selectedChildId === child.id
                      ? 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-lg'
                      : 'bg-theme-card border border-theme-border text-theme-text-secondary hover:border-indigo-500'
                  }`}
                >
                  <span className="text-lg"><Avatar avatar={child.avatar} fallback="🦁" className="" imgClassName="w-6 h-6 rounded-full" /></span>
                  <span>{child.name}</span>
                  <span className="text-xs opacity-60">Lv.{child.level}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {!loading && !cp && children.length === 0 && (
          <div className="text-center py-16 mb-8">
            <Shield className="w-12 h-12 text-theme-text-muted mx-auto mb-3" />
            <p className="text-theme-text-secondary">Koi child link nahi hai. Upar email dalke apne bachche ka account link karo.</p>
          </div>
        )}

        {/* Child Info Card */}
        {cp && <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-2xl bg-gradient-to-r from-indigo-500/10 to-cyan-500/10 border border-indigo-500/20 mb-8"
        >
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-4xl shadow-xl overflow-hidden">
              <Avatar avatar={cp.child?.avatar} fallback="🦁" className="" imgClassName="w-full h-full object-cover" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-2xl font-bold text-theme-text">{cp.child?.name || 'Student'}</h2>
              <p className="text-theme-text-secondary">Progress Overview</p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-3">
                <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold">
                  <Flame className="w-3 h-3" /> {cp.child?.streak ?? 0} Day Streak
                </span>
                <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-bold">
                  <Zap className="w-3 h-3" /> {(cp.child?.xp ?? 0).toLocaleString()} XP
                </span>
                <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-bold">
                  Level {cp.child?.level ?? 1}
                </span>
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-emerald-400">{cp.quiz_stats?.average_score ?? 0}%</div>
              <p className="text-sm text-theme-text-secondary">Overall Score</p>
            </div>
          </div>
        </motion.div>}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total XP', value: cp ? String(cp.child?.xp ?? 0) : '0', icon: Clock, color: 'from-indigo-500 to-violet-500', badge: '' },
            { label: 'Quizzes Done', value: cp ? String(cp.quiz_stats?.total_quizzes ?? 0) : '0', icon: Target, color: 'from-emerald-500 to-teal-600', badge: '' },
            { label: 'Avg Score', value: cp ? `${cp.quiz_stats?.average_score ?? 0}%` : '0%', icon: AlertCircle, color: 'from-red-500 to-rose-600', badge: '' },
            { label: 'Courses Active', value: cp ? String(cp.course_progress?.length ?? 0) : '0', icon: BookOpen, color: 'from-amber-500 to-orange-600', badge: '' },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.05 }}
                whileHover={{ y: -5 }}
                className="p-5 rounded-2xl bg-theme-card border border-theme-border"
              >
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3 shadow-lg`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-2xl font-black text-theme-text">{stat.value}</p>
                <p className="text-sm text-theme-text-muted">{stat.label}</p>
                <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-xs font-bold ${
                  stat.badge === 'Needs Help' ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
                }`}>{stat.badge}</span>
              </motion.div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Study Hours Chart */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2 p-6 rounded-2xl bg-theme-card border border-theme-border"
          >
                        <h3 className="text-lg font-bold text-theme-text mb-1 flex items-center gap-2">
                          <Clock className="w-5 h-5 text-cyan-400" /> Study Hours (This Week)
            </h3>
            <p className="text-sm text-theme-text-muted mb-6">Daily study time vs target</p>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={[]}>
                <XAxis dataKey="day" stroke="#4b5563" fontSize={12} />
                <YAxis stroke="#4b5563" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--color-tooltip-bg)', border: '1px solid var(--color-border)', borderRadius: '12px', color: 'var(--color-text)' }} />
                <Bar dataKey="hours" fill="#8b5cf6" radius={[6, 6, 0, 0]} name="Study Hours" />
                <Bar dataKey="target" fill="#374151" radius={[6, 6, 0, 0]} name="Target" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Study Time Controls */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="p-6 rounded-2xl bg-theme-card border border-theme-border"
          >
                        <h3 className="text-lg font-bold text-theme-text mb-4 flex items-center gap-2">
                          <Shield className="w-5 h-5 text-emerald-400" /> Study Controls
            </h3>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-theme-input">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-theme-text-secondary">Daily Limit</span>
                  <span className="text-sm font-bold text-indigo-400">4 hours</span>
                </div>
                <input type="range" min="1" max="8" defaultValue={4} className="w-full accent-indigo-500" />
              </div>
              <div className="p-4 rounded-xl bg-theme-input">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-theme-text-secondary">Blocked Hours</span>
                  <span className="text-sm font-bold text-red-400">10 PM - 6 AM</span>
                </div>
                <div className="flex gap-2">
                  <input type="time" defaultValue="22:00"                   className="flex-1 px-3 py-2 rounded-lg bg-theme-input border border-theme-border text-theme-text text-sm" />
                                    <input type="time" defaultValue="06:00" className="flex-1 px-3 py-2 rounded-lg bg-theme-input border border-theme-border text-theme-text text-sm" />
                </div>
              </div>
              <div className="p-4 rounded-xl bg-theme-input">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-theme-text-secondary">Break Reminders</span>
                  <button className="w-12 h-7 rounded-full bg-emerald-500 transition-all">
                    <motion.div animate={{ x: 22 }} className="w-5 h-5 rounded-full bg-white shadow-sm" />
                  </button>
                </div>
                <p className="text-xs text-theme-text-muted mt-1">Every 45 minutes ka break reminder</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Subject Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="p-6 rounded-2xl bg-theme-card border border-theme-border"
        >
                    <h3 className="text-lg font-bold text-theme-text mb-6 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-amber-400" /> Subject-wise Progress
          </h3>
          <div className="space-y-5">
            {subjectProgress.map((sub, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + i * 0.05 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-theme-text w-20">{sub.subject}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                      sub.progress >= 80 ? 'bg-emerald-500/20 text-emerald-400' :
                      sub.progress >= 60 ? 'bg-amber-500/20 text-amber-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>{sub.grade}</span>
                  </div>
                  <span className="text-sm font-bold text-theme-text-secondary">{sub.progress}%</span>
                </div>
                <div                 className="w-full h-3 bg-theme-surface rounded-full overflow-hidden">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${sub.progress}%` }}
                    transition={{ duration: 0.8, delay: 0.8 + i * 0.1 }}
                    className={`h-full rounded-full bg-gradient-to-r ${sub.color}`}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Weak Topics Alert */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="mt-6 p-6 rounded-2xl bg-red-500/5 border border-red-500/20"
        >
                    <h3 className="text-lg font-bold text-theme-text mb-4 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-red-400" /> Weak Topics (Attention Needed)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {cp?.course_progress?.filter(p => p.percentage < 50).length === 0 && <p className="text-theme-text-muted text-sm col-span-3 text-center py-4">No weak topics identified yet</p>}
            {cp?.course_progress?.filter(p => p.percentage < 50).map((topic, i) => (
              <div key={i} className="p-4 rounded-xl bg-red-500/10 border border-red-500/10">
                <h4 className="font-bold text-theme-text text-sm">{topic.course_name}</h4>
                <p className="text-xs text-theme-text-muted">{topic.subject}</p>
                <p className="text-lg font-black text-red-400 mt-1">{topic.percentage}%</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
