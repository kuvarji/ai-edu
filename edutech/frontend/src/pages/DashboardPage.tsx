import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Flame, Zap, Trophy, Target, BookOpen, TrendingUp,
  ArrowRight, Calendar, Award, Sparkles,
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useStore } from '../store/useStore';
import { courses, weeklyProgress, badges } from '../data/mockData';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5 },
  }),
};

export default function DashboardPage() {
  const { user } = useStore();
  const displayName = user?.name || 'Student';
  const xp = user?.xp || 2450;
  const level = user?.level || 5;
  const streak = user?.streak || 12;
  const xpToNext = 500 - (xp % 500);
  const xpProgress = ((xp % 500) / 500) * 100;

  const statCards = [
    { label: 'Current Streak', value: `${streak} Days`, icon: Flame, color: 'from-orange-500 to-red-500', shadow: 'shadow-orange-500/20', bg: 'bg-orange-500/10' },
    { label: 'Total XP', value: `${xp.toLocaleString()}`, icon: Zap, color: 'from-yellow-500 to-amber-500', shadow: 'shadow-yellow-500/20', bg: 'bg-yellow-500/10' },
    { label: 'Level', value: `Level ${level}`, icon: Trophy, color: 'from-violet-500 to-purple-500', shadow: 'shadow-violet-500/20', bg: 'bg-violet-500/10' },
    { label: 'Courses Active', value: '4', icon: BookOpen, color: 'from-emerald-500 to-teal-500', shadow: 'shadow-emerald-500/20', bg: 'bg-emerald-500/10' },
  ];

  return (
    <div className="min-h-screen bg-gray-950 pt-20 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-white mb-1">
                Namaste, {displayName}! 👋
              </h1>
              <p className="text-gray-400">Aaj kya seekhna hai? Let&apos;s go!</p>
            </div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/20"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-lg">
                {user?.avatar || '🦁'}
              </div>
              <div>
                <p className="text-sm font-bold text-white">Level {level}</p>
                <p className="text-xs text-violet-400">{xpToNext} XP to next level</p>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* XP Progress Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 p-6 rounded-2xl bg-gray-900/50 border border-white/5"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-400">Level {level} Progress</span>
            <span className="text-sm font-bold text-violet-400">{Math.round(xpProgress)}%</span>
          </div>
          <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${xpProgress}%` }}
              transition={{ duration: 1, delay: 0.3 }}
              className="h-full rounded-full bg-gradient-to-r from-violet-500 via-purple-500 to-cyan-500"
            />
          </div>
        </motion.div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={i}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={i}
                whileHover={{ y: -5, scale: 1.02 }}
                className={`p-5 rounded-2xl bg-gray-900/50 border border-white/5 hover:border-white/10 transition-all ${stat.shadow}`}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3 shadow-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-2xl font-black text-white">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </motion.div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Weekly Progress Chart */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={4}
            className="lg:col-span-2 p-6 rounded-2xl bg-gray-900/50 border border-white/5"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-white">Weekly Progress</h3>
                <p className="text-sm text-gray-500">XP earned this week</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-sm font-medium">
                <TrendingUp className="w-4 h-4" />
                +23%
              </div>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={weeklyProgress}>
                <defs>
                  <linearGradient id="xpGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#4b5563" fontSize={12} />
                <YAxis stroke="#4b5563" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#fff',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="xp"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  fill="url(#xpGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Daily Goals */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={5}
            className="p-6 rounded-2xl bg-gray-900/50 border border-white/5"
          >
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-cyan-400" />
              Aaj Ke Goals
            </h3>
            <div className="space-y-4">
              {[
                { label: 'Complete 3 lessons', progress: 66, done: '2/3', color: 'from-violet-500 to-purple-500' },
                { label: 'Solve 10 quiz questions', progress: 80, done: '8/10', color: 'from-cyan-500 to-blue-500' },
                { label: 'Earn 200 XP', progress: 45, done: '90/200', color: 'from-amber-500 to-orange-500' },
                { label: 'Study for 30 min', progress: 100, done: 'Done!', color: 'from-emerald-500 to-teal-500' },
              ].map((goal, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">{goal.label}</span>
                    <span className={`text-xs font-bold ${goal.progress === 100 ? 'text-emerald-400' : 'text-gray-500'}`}>
                      {goal.done}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${goal.progress}%` }}
                      transition={{ duration: 0.8, delay: 0.5 + i * 0.1 }}
                      className={`h-full rounded-full bg-gradient-to-r ${goal.color}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Continue Learning */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={6}
          className="mt-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-violet-400" />
              Continue Learning
            </h3>
            <Link to="/courses" className="text-violet-400 hover:text-violet-300 text-sm font-medium flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.slice(0, 3).map((course, i) => (
              <motion.div
                key={course.id}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={7 + i}
                whileHover={{ y: -5, scale: 1.02 }}
              >
                <Link to={`/courses/${course.id}`}>
                  <div className="p-5 rounded-2xl bg-gray-900/50 border border-white/5 hover:border-white/10 transition-all group cursor-pointer">
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${course.color} flex items-center justify-center text-2xl shadow-lg`}>
                        {course.icon}
                      </div>
                      <div>
                        <h4 className="font-bold text-white group-hover:text-violet-400 transition-colors">{course.title}</h4>
                        <p className="text-xs text-gray-500">{course.grade} - {course.board}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">{course.completedChapters}/{course.chapters} chapters</span>
                        <span className="text-violet-400 font-medium">{Math.round((course.completedChapters / course.chapters) * 100)}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(course.completedChapters / course.chapters) * 100}%` }}
                          transition={{ duration: 0.8, delay: 0.8 + i * 0.1 }}
                          className={`h-full rounded-full bg-gradient-to-r ${course.color}`}
                        />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent Badges & Calendar */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          {/* Recent Badges */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={10}
            className="p-6 rounded-2xl bg-gray-900/50 border border-white/5"
          >
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              Recent Badges
            </h3>
            <div className="grid grid-cols-4 gap-3">
              {badges.slice(0, 8).map((badge) => (
                <motion.div
                  key={badge.id}
                  whileHover={{ scale: 1.1, y: -3 }}
                  className={`text-center p-3 rounded-2xl transition-all ${
                    badge.unlocked
                      ? 'bg-amber-500/10 border border-amber-500/20'
                      : 'bg-white/5 border border-white/5 opacity-40'
                  }`}
                >
                  <span className="text-2xl block mb-1">{badge.icon}</span>
                  <p className="text-xs text-gray-400 truncate">{badge.name}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Streak Calendar */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={11}
            className="p-6 rounded-2xl bg-gray-900/50 border border-white/5"
          >
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-400" />
              Study Streak
            </h3>
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 28 }, (_, i) => {
                const active = i < 20 || (i > 21 && i < 28);
                const today = i === 27;
                return (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5 + i * 0.02 }}
                    className={`aspect-square rounded-lg flex items-center justify-center text-xs font-medium transition-all ${
                      today
                        ? 'bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/30'
                        : active
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
                        : 'bg-white/5 text-gray-600'
                    }`}
                  >
                    {i + 1}
                  </motion.div>
                );
              })}
            </div>
            <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-emerald-500/20 border border-emerald-500/20" />
                <span>Studied</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-white/5" />
                <span>Missed</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-gradient-to-br from-violet-500 to-purple-600" />
                <span>Today</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
