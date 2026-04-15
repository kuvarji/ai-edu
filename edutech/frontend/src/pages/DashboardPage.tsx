import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Flame, Zap, Trophy, Target, BookOpen, TrendingUp,
  ArrowRight, Calendar, Award, Sparkles,
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useStore } from '../store/useStore';
import { coursesApi, gamificationApi, analyticsApi, type Course, type GamificationStats, type WeeklyReport, type DailyGoal } from '../services/api';
import { useLanguage } from '../i18n/useLanguage';
import Avatar from '../components/Avatar';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5 },
  }),
};

export default function DashboardPage() {
  const { user } = useStore();
  const { t } = useLanguage();
  const [apiCourses, setApiCourses] = useState<Course[]>([]);
  const [stats, setStats] = useState<GamificationStats | null>(null);
  const [, setWeeklyReport] = useState<WeeklyReport | null>(null);
  const [dailyGoals, setDailyGoals] = useState<DailyGoal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [coursesRes, statsRes, weeklyRes, goalsRes] = await Promise.allSettled([
          coursesApi.getAll(),
          gamificationApi.getStats(),
          analyticsApi.getWeeklyReport(),
          gamificationApi.getDailyGoals(),
        ]);
        if (coursesRes.status === 'fulfilled') setApiCourses(coursesRes.value.courses);
        if (statsRes.status === 'fulfilled') setStats(statsRes.value);
        if (weeklyRes.status === 'fulfilled') setWeeklyReport(weeklyRes.value);
        if (goalsRes.status === 'fulfilled') setDailyGoals(goalsRes.value.goals);
      } catch {
        // fallback to empty data
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const displayName = user?.name || 'Student';
  const xp = stats?.xp ?? user?.xp ?? 0;
  const level = stats?.level ?? user?.level ?? 1;
  const streak = stats?.streak ?? user?.streak ?? 0;
  const xpToNext = (stats?.xp_for_next_level ?? 500) - (xp % 500);
  const xpProgress = ((xp % 500) / 500) * 100;

  const displayCourses = apiCourses.map((c) => ({
    id: c.id,
    title: c.title,
    icon: c.icon || '📚',
    color: c.color || 'from-violet-500 to-purple-600',
    grade: `Grade ${c.grade}`,
    board: c.board,
    chapters: 0,
    completedChapters: 0,
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-theme-page transition-colors duration-300 pt-20 pb-12 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-theme-text-secondary">{t.loading}</p>
        </div>
      </div>
    );
  }

  const statCards = [
    { label: t.streak, value: `${streak} Days`, icon: Flame, color: 'from-orange-500 to-red-500', shadow: 'shadow-orange-500/20', bg: 'bg-orange-500/10' },
    { label: t.total_xp, value: `${xp.toLocaleString()}`, icon: Zap, color: 'from-yellow-500 to-amber-500', shadow: 'shadow-yellow-500/20', bg: 'bg-yellow-500/10' },
    { label: t.level, value: `${t.level} ${level}`, icon: Trophy, color: 'from-violet-500 to-purple-500', shadow: 'shadow-violet-500/20', bg: 'bg-violet-500/10' },
    { label: t.courses_title, value: String(apiCourses.length), icon: BookOpen, color: 'from-emerald-500 to-teal-500', shadow: 'shadow-emerald-500/20', bg: 'bg-emerald-500/10' },
  ];

  return (
    <div className="min-h-screen bg-theme-page transition-colors duration-300 pt-20 pb-12 px-4">
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
                {t.dashboard_welcome}, {displayName}! 👋
              </h1>
              <p className="text-theme-text-secondary">{t.dashboard_title}</p>
            </div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/20"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-lg overflow-hidden">
                <Avatar avatar={user?.avatar} imgClassName="w-full h-full object-cover rounded-full" />
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
          className="mb-8 p-6 rounded-2xl bg-theme-card border border-theme-border"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-theme-text-secondary">Level {level} Progress</span>
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
                className={`p-5 rounded-2xl bg-theme-card border border-theme-border hover:border-theme-border transition-all ${stat.shadow}`}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3 shadow-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-2xl font-black text-white">{stat.value}</p>
                <p className="text-sm text-theme-text-muted">{stat.label}</p>
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
            className="lg:col-span-2 p-6 rounded-2xl bg-theme-card border border-theme-border"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-white">{t.weekly_progress}</h3>
                <p className="text-sm text-theme-text-muted">XP earned this week</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-sm font-medium">
                <TrendingUp className="w-4 h-4" />
                +23%
              </div>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={[]}>
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
            className="p-6 rounded-2xl bg-theme-card border border-theme-border"
          >
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-cyan-400" />
              Aaj Ke Goals
            </h3>
            <div className="space-y-4">
              {dailyGoals.length > 0 ? dailyGoals.map((goal, i) => {
                const progress = Math.min(Math.round((goal.current / goal.target) * 100), 100);
                const done = goal.current >= goal.target ? 'Done!' : `${goal.current}/${goal.target}`;
                return (
                  <div key={goal.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">{goal.label}</span>
                      <span className={`text-xs font-bold ${progress >= 100 ? 'text-emerald-400' : 'text-theme-text-muted'}`}>
                        {done}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.8, delay: 0.5 + i * 0.1 }}
                        className={`h-full rounded-full bg-gradient-to-r ${goal.color}`}
                      />
                    </div>
                  </div>
                );
              }) : (
                <p className="text-theme-text-muted text-sm text-center py-4">Start learning to track your daily goals!</p>
              )}
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
                            {t.continue_learning}
            </h3>
            <Link to="/courses" className="text-violet-400 hover:text-violet-300 text-sm font-medium flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayCourses.slice(0, 3).map((course, i) => (
              <motion.div
                key={course.id}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={7 + i}
                whileHover={{ y: -5, scale: 1.02 }}
              >
                <Link to={`/courses/${course.id}`}>
                  <div className="p-5 rounded-2xl bg-theme-card border border-theme-border hover:border-theme-border transition-all group cursor-pointer">
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${course.color} flex items-center justify-center text-2xl shadow-lg`}>
                        {course.icon}
                      </div>
                      <div>
                        <h4 className="font-bold text-white group-hover:text-violet-400 transition-colors">{course.title}</h4>
                        <p className="text-xs text-theme-text-muted">{course.grade} - {course.board}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-theme-text-secondary">{course.completedChapters}/{course.chapters} chapters</span>
                        <span className="text-violet-400 font-medium">{course.chapters > 0 ? Math.round((course.completedChapters / course.chapters) * 100) : 0}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${course.chapters > 0 ? (course.completedChapters / course.chapters) * 100 : 0}%` }}
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
            className="p-6 rounded-2xl bg-theme-card border border-theme-border"
          >
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Award className="w-5 h-5 text-amber-400" />
                            {t.badges}
            </h3>
            <div className="grid grid-cols-4 gap-3">
              <p className="text-theme-text-muted text-sm col-span-4 text-center py-4">{t.no_data}</p>
            </div>
          </motion.div>

          {/* Streak Calendar */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={11}
            className="p-6 rounded-2xl bg-theme-card border border-theme-border"
          >
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-400" />
              {t.streak}
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
                        : 'bg-theme-input text-gray-600'
                    }`}
                  >
                    {i + 1}
                  </motion.div>
                );
              })}
            </div>
            <div className="flex items-center justify-center gap-4 mt-4 text-xs text-theme-text-muted">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-emerald-500/20 border border-emerald-500/20" />
                <span>Studied</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-theme-input" />
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
