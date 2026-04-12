import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Clock, BookOpen, Shield,
  Flame, Zap, Target, AlertCircle, BarChart3,
} from 'lucide-react';
import { XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { parentApi, type ChildInfo, type ChildProgress } from '../services/api';

const studyData = [
  { day: 'Mon', hours: 2.5, target: 3 },
  { day: 'Tue', hours: 3.2, target: 3 },
  { day: 'Wed', hours: 1.8, target: 3 },
  { day: 'Thu', hours: 4.0, target: 3 },
  { day: 'Fri', hours: 2.0, target: 3 },
  { day: 'Sat', hours: 3.5, target: 3 },
  { day: 'Sun', hours: 2.8, target: 3 },
];

const defaultSubjectProgress = [
  { subject: 'Maths', progress: 75, grade: 'A', color: 'from-violet-500 to-purple-600' },
  { subject: 'Science', progress: 60, grade: 'B+', color: 'from-emerald-500 to-teal-600' },
  { subject: 'English', progress: 90, grade: 'A+', color: 'from-amber-500 to-orange-600' },
  { subject: 'Hindi', progress: 45, grade: 'B', color: 'from-rose-500 to-pink-600' },
  { subject: 'SST', progress: 70, grade: 'A-', color: 'from-cyan-500 to-blue-600' },
];

export default function ParentDashboard() {
  const [, setChildren] = useState<ChildInfo[]>([]);
  const [childProgress, setChildProgress] = useState<ChildProgress | null>(null);
  const [, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await parentApi.getChildren();
        setChildren(res.children);
        if (res.children.length > 0) {
          const progress = await parentApi.getChildProgress(res.children[0].id);
          setChildProgress(progress);
        }
      } catch {
        // fallback to mock
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const cp = childProgress;

  const subjectProgress = cp?.course_progress?.length
    ? cp.course_progress.map((p, i) => ({
        subject: p.subject,
        progress: p.percentage,
        grade: p.percentage >= 80 ? 'A' : p.percentage >= 60 ? 'B' : 'C',
        color: [
          'from-violet-500 to-purple-600',
          'from-emerald-500 to-teal-600',
          'from-amber-500 to-orange-600',
          'from-rose-500 to-pink-600',
          'from-cyan-500 to-blue-600',
        ][i % 5],
      }))
    : defaultSubjectProgress;

  return (
    <div className="min-h-screen bg-gray-950 pt-20 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-black text-white mb-1">Parent Dashboard</h1>
          <p className="text-gray-400">Apne bachche ki padhai ka pura overview</p>
        </motion.div>

        {/* Child Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-2xl bg-gradient-to-r from-violet-500/10 to-cyan-500/10 border border-violet-500/20 mb-8"
        >
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-4xl shadow-xl">
              🦁
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-2xl font-bold text-white">Aarav Sharma</h2>
              <p className="text-gray-400">Class 10 - CBSE Board</p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-3">
                <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold">
                  <Flame className="w-3 h-3" /> 12 Day Streak
                </span>
                <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-bold">
                  <Zap className="w-3 h-3" /> 2,450 XP
                </span>
                <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-violet-500/20 text-violet-400 text-xs font-bold">
                  Level 5
                </span>
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-emerald-400">78%</div>
              <p className="text-sm text-gray-400">Overall Score</p>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Study Today', value: '2.5 hrs', icon: Clock, color: 'from-violet-500 to-purple-600', badge: 'On Track' },
            { label: 'Quizzes Done', value: '8', icon: Target, color: 'from-emerald-500 to-teal-600', badge: 'Good' },
            { label: 'Weak Topics', value: '3', icon: AlertCircle, color: 'from-red-500 to-rose-600', badge: 'Needs Help' },
            { label: 'Courses Active', value: '5', icon: BookOpen, color: 'from-amber-500 to-orange-600', badge: 'All Going' },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.05 }}
                whileHover={{ y: -5 }}
                className="p-5 rounded-2xl bg-gray-900/50 border border-white/5"
              >
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3 shadow-lg`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-2xl font-black text-white">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
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
            className="lg:col-span-2 p-6 rounded-2xl bg-gray-900/50 border border-white/5"
          >
            <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <Clock className="w-5 h-5 text-cyan-400" /> Study Hours (This Week)
            </h3>
            <p className="text-sm text-gray-500 mb-6">Daily study time vs target</p>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={studyData}>
                <XAxis dataKey="day" stroke="#4b5563" fontSize={12} />
                <YAxis stroke="#4b5563" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} />
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
            className="p-6 rounded-2xl bg-gray-900/50 border border-white/5"
          >
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-400" /> Study Controls
            </h3>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-white/5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-300">Daily Limit</span>
                  <span className="text-sm font-bold text-violet-400">4 hours</span>
                </div>
                <input type="range" min="1" max="8" defaultValue={4} className="w-full accent-violet-500" />
              </div>
              <div className="p-4 rounded-xl bg-white/5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-300">Blocked Hours</span>
                  <span className="text-sm font-bold text-red-400">10 PM - 6 AM</span>
                </div>
                <div className="flex gap-2">
                  <input type="time" defaultValue="22:00" className="flex-1 px-3 py-2 rounded-lg bg-gray-800 border border-white/10 text-white text-sm" />
                  <input type="time" defaultValue="06:00" className="flex-1 px-3 py-2 rounded-lg bg-gray-800 border border-white/10 text-white text-sm" />
                </div>
              </div>
              <div className="p-4 rounded-xl bg-white/5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Break Reminders</span>
                  <button className="w-12 h-7 rounded-full bg-emerald-500 transition-all">
                    <motion.div animate={{ x: 22 }} className="w-5 h-5 rounded-full bg-white shadow-sm" />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Every 45 minutes ka break reminder</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Subject Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="p-6 rounded-2xl bg-gray-900/50 border border-white/5"
        >
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
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
                    <span className="text-sm font-bold text-white w-20">{sub.subject}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                      sub.progress >= 80 ? 'bg-emerald-500/20 text-emerald-400' :
                      sub.progress >= 60 ? 'bg-amber-500/20 text-amber-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>{sub.grade}</span>
                  </div>
                  <span className="text-sm font-bold text-gray-400">{sub.progress}%</span>
                </div>
                <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">
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
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-400" /> Weak Topics (Attention Needed)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { topic: 'Trigonometry', subject: 'Maths', score: '35%' },
              { topic: 'Chemical Bonding', subject: 'Science', score: '42%' },
              { topic: 'Hindi Vyakaran', subject: 'Hindi', score: '38%' },
            ].map((topic, i) => (
              <div key={i} className="p-4 rounded-xl bg-red-500/10 border border-red-500/10">
                <h4 className="font-bold text-white text-sm">{topic.topic}</h4>
                <p className="text-xs text-gray-500">{topic.subject}</p>
                <p className="text-lg font-black text-red-400 mt-1">{topic.score}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
