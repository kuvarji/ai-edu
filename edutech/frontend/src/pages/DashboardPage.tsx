import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Flame, Zap, Trophy, Target, BookOpen, TrendingUp, TrendingDown, Minus,
  ArrowRight, Calendar, Award, Sparkles, Clock,
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useStore } from '../store/useStore';
import { dashboardApi, type Course, type GamificationStats, type WeeklyReport, type DailyGoal, type StudyTimeData } from '../services/api';
import { useLanguage } from '../i18n/useLanguage';
import Avatar from '../components/Avatar';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5 },
  }),
};

// ============================
// Skeleton Components
// ============================

function SkeletonPulse({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
  return <div className={`animate-pulse bg-violet-100 dark:bg-gray-700/50 rounded-lg ${className}`} style={style} />;
}

function StatCardSkeleton() {
  return (
    <div className="p-5 rounded-2xl bg-theme-card border border-theme-border">
      <SkeletonPulse className="w-12 h-12 rounded-xl mb-3" />
      <SkeletonPulse className="w-20 h-7 mb-2" />
      <SkeletonPulse className="w-16 h-4" />
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="lg:col-span-2 p-6 rounded-2xl bg-theme-card border border-theme-border">
      <div className="flex items-center justify-between mb-4">
        <div>
          <SkeletonPulse className="w-40 h-6 mb-2" />
          <SkeletonPulse className="w-56 h-4" />
        </div>
        <SkeletonPulse className="w-16 h-8 rounded-lg" />
      </div>
      <div className="flex gap-2 mb-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <SkeletonPulse key={i} className="w-10 h-8 rounded-lg" />
        ))}
      </div>
      <div className="flex items-end gap-2 h-[250px] pt-4">
        {[40, 65, 35, 80, 55, 70, 45].map((h, i) => (
          <div key={i} className="flex-1 flex flex-col justify-end">
            <SkeletonPulse className="rounded-t-md" style={{ height: `${h}%` }} />
          </div>
        ))}
      </div>
    </div>
  );
}

function GoalsSkeleton() {
  return (
    <div className="p-6 rounded-2xl bg-theme-card border border-theme-border">
      <SkeletonPulse className="w-32 h-6 mb-4" />
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-2">
            <div className="flex items-center justify-between">
              <SkeletonPulse className="w-36 h-4" />
              <SkeletonPulse className="w-12 h-4" />
            </div>
            <SkeletonPulse className="w-full h-2 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

function CourseCardSkeleton() {
  return (
    <div className="p-5 rounded-2xl bg-theme-card border border-theme-border">
      <div className="flex items-center gap-4 mb-4">
        <SkeletonPulse className="w-14 h-14 rounded-2xl" />
        <div>
          <SkeletonPulse className="w-32 h-5 mb-2" />
          <SkeletonPulse className="w-24 h-3" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <SkeletonPulse className="w-28 h-4" />
          <SkeletonPulse className="w-10 h-4" />
        </div>
        <SkeletonPulse className="w-full h-2 rounded-full" />
      </div>
    </div>
  );
}

// ============================
// Dashboard Page
// ============================

export default function DashboardPage() {
  const { user } = useStore();
  const { t } = useLanguage();
  const [apiCourses, setApiCourses] = useState<Course[]>([]);
  const [courseProgress, setCourseProgress] = useState<Record<string, { completed: number; total: number }>>({});
  const [stats, setStats] = useState<GamificationStats | null>(null);
  const [, setWeeklyReport] = useState<WeeklyReport | null>(null);
  const [dailyGoals, setDailyGoals] = useState<DailyGoal[]>([]);
  const [activeDates, setActiveDates] = useState<Set<string>>(new Set());
  const [studyBreakdown, setStudyBreakdown] = useState<StudyTimeData['daily_breakdown']>([]);
  const [chartDays, setChartDays] = useState(7);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Single combined API call instead of 6 separate calls
        const params: { grade?: number; board?: string } = {};
        if (user?.grade && !isNaN(parseInt(user.grade, 10))) {
          params.grade = parseInt(user.grade, 10);
        }
        if (user?.board) {
          params.board = user.board;
        }

        const data = await dashboardApi.get(Object.keys(params).length > 0 ? params : undefined);

        // Set all state from single response
        setApiCourses(data.courses.courses);
        setStats(data.stats);
        setWeeklyReport(data.weekly_report);
        setDailyGoals(data.daily_goals.goals);

        // Study time breakdown
        const breakdown = data.study_time.daily_breakdown;
        const dates = new Set(breakdown.map((d) => d.date));
        setActiveDates(dates);
        setStudyBreakdown(breakdown);

        // Course progress
        const progMap: Record<string, { completed: number; total: number }> = {};
        const progData = data.progress.progress;
        if (progData) {
          for (const p of progData) {
            progMap[p.course.id] = { completed: p.completed_chapters, total: p.total_chapters };
          }
        }
        setCourseProgress(progMap);
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
  const isPremium = user?.subscription === 'pro' || user?.subscription === 'premium';
  const xpToNext = (stats?.xp_for_next_level ?? 500) - (xp % 500);
  const xpProgress = ((xp % 500) / 500) * 100;

  // Build chart data from study breakdown filtered by selected days (memoized)
  const chartData = useMemo(() => {
    const today = new Date();
    const days: { day: string; minutes: number; chapters: number; activities: number }[] = [];
    const breakdownMap = new Map(studyBreakdown.map(d => [d.date, d]));
    for (let i = chartDays - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().slice(0, 10);
      const dayLabel = chartDays <= 7
        ? date.toLocaleDateString('en', { weekday: 'short' })
        : date.toLocaleDateString('en', { month: 'short', day: 'numeric' });
      const entry = breakdownMap.get(dateStr);
      days.push({
        day: dayLabel,
        minutes: entry?.estimated_minutes ?? 0,
        chapters: entry?.chapters_completed ?? 0,
        activities: entry?.total_activities ?? 0,
      });
    }
    return days;
  }, [studyBreakdown, chartDays]);

  // Calculate trend: compare second half vs first half (memoized)
  const trendInfo = useMemo(() => {
    const half = Math.floor(chartData.length / 2);
    if (half === 0) return { pct: 0, direction: 'stable' as const };
    const firstHalf = chartData.slice(0, half).reduce((s, d) => s + d.minutes, 0) / half;
    const secondHalf = chartData.slice(half).reduce((s, d) => s + d.minutes, 0) / (chartData.length - half);
    if (firstHalf === 0 && secondHalf === 0) return { pct: 0, direction: 'stable' as const };
    if (firstHalf === 0) return { pct: 100, direction: 'up' as const };
    const pct = Math.round(((secondHalf - firstHalf) / firstHalf) * 100);
    return { pct: Math.abs(pct), direction: pct > 0 ? 'up' as const : pct < 0 ? 'down' as const : 'stable' as const };
  }, [chartData]);

  const totalMinutes = useMemo(() => chartData.reduce((s, d) => s + d.minutes, 0), [chartData]);
  const dayRangeOptions = [1, 3, 5, 7, 14, 30] as const;

  const displayCourses = apiCourses.map((c) => {
    const prog = courseProgress[c.id];
    return {
      id: c.id,
      title: c.title,
      icon: c.icon || '📚',
      color: c.color || 'from-violet-500 to-purple-600',
      grade: `Grade ${c.grade}`,
      board: c.board,
      chapters: prog?.total ?? 0,
      completedChapters: prog?.completed ?? 0,
    };
  });

  const statCards = [
    { label: t.streak, value: `${streak} Days`, icon: Flame, color: 'from-orange-500 to-red-500', shadow: 'shadow-orange-500/20', bg: 'bg-orange-500/10' },
    { label: t.total_xp, value: isPremium ? '∞ Unlimited' : `${xp.toLocaleString()}`, icon: Zap, color: 'from-yellow-500 to-amber-500', shadow: 'shadow-yellow-500/20', bg: 'bg-yellow-500/10' },
    { label: t.level, value: `${t.level} ${level}`, icon: Trophy, color: 'from-violet-500 to-purple-500', shadow: 'shadow-violet-500/20', bg: 'bg-violet-500/10' },
    { label: t.courses_title, value: String(apiCourses.length), icon: BookOpen, color: 'from-emerald-500 to-teal-500', shadow: 'shadow-emerald-500/20', bg: 'bg-emerald-500/10' },
  ];

  return (
        <div className="min-h-screen bg-theme-page transition-colors duration-300 pt-20 pb-12 px-4 blob-bg">
          <div className="max-w-7xl mx-auto relative z-10">
            {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-theme-text mb-1">
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
                                <p className="text-sm font-bold text-theme-text">Level {level}</p>
                                <p className="text-xs text-violet-500">{isPremium ? 'Pro Member ∞' : `${xpToNext} XP to next level`}</p>
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
            <span className="text-sm font-bold text-violet-600 dark:text-violet-400">{Math.round(xpProgress)}%</span>
          </div>
          <div className="w-full h-3 bg-violet-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${xpProgress}%` }}
              transition={{ duration: 1, delay: 0.3 }}
              className="h-full rounded-full bg-gradient-to-r from-violet-500 via-purple-500 to-cyan-500"
            />
          </div>
        </motion.div>

        {/* Stat Cards — Skeleton or real */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {loading ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            statCards.map((stat, i) => {
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
                  <p className="text-2xl font-black text-theme-text">{stat.value}</p>
                  <p className="text-sm text-theme-text-muted">{stat.label}</p>
                </motion.div>
              );
            })
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Study Progress Chart — Skeleton or real */}
          {loading ? (
            <>
              <ChartSkeleton />
              <GoalsSkeleton />
            </>
          ) : (
            <>
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={4}
            className="lg:col-span-2 p-6 rounded-2xl bg-theme-card border border-theme-border"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
              <div>
                                <h3 className="text-lg font-bold text-theme-text flex items-center gap-2">
                                  <Clock className="w-5 h-5 text-violet-500" />
                  Study Progress
                </h3>
                <p className="text-sm text-theme-text-muted">
                  {totalMinutes > 0 ? `${totalMinutes} min study — last ${chartDays} day${chartDays > 1 ? 's' : ''}` : `No activity — last ${chartDays} day${chartDays > 1 ? 's' : ''}`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {trendInfo.direction !== 'stable' || trendInfo.pct > 0 ? (
                  <div className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium ${
                    trendInfo.direction === 'up'
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : trendInfo.direction === 'down'
                      ? 'bg-red-500/10 text-red-400'
                      : 'bg-gray-500/10 text-gray-400'
                  }`}>
                    {trendInfo.direction === 'up' ? <TrendingUp className="w-4 h-4" /> : trendInfo.direction === 'down' ? <TrendingDown className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                    {trendInfo.direction === 'up' ? '+' : trendInfo.direction === 'down' ? '-' : ''}{trendInfo.pct}%
                  </div>
                ) : null}
              </div>
            </div>
            {/* Day range selector */}
            <div className="flex gap-2 mb-4 flex-wrap">
              {dayRangeOptions.map((d) => (
                <button
                  key={d}
                  onClick={() => setChartDays(d)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    chartDays === d
                      ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                      : 'bg-theme-input text-theme-text-muted border border-transparent hover:bg-theme-card-hover hover:text-theme-text'
                  }`}
                >
                  {d}D
                </button>
              ))}
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="minutesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#4b5563" fontSize={12} />
                <YAxis stroke="#4b5563" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid rgba(0,0,0,0.08)',
                    borderRadius: '12px',
                    color: '#1a1a2e',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  }}
                  formatter={(value: number, name: string) => {
                    if (name === 'minutes') return [`${value} min`, 'Study Time'];
                    if (name === 'chapters') return [value, 'Chapters'];
                    return [value, name];
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="minutes"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  fill="url(#minutesGrad)"
                  name="minutes"
                />
                <Area
                  type="monotone"
                  dataKey="chapters"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="transparent"
                  name="chapters"
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
                        <h3 className="text-lg font-bold text-theme-text mb-4 flex items-center gap-2">
                          <Target className="w-5 h-5 text-cyan-500" />
              Aaj Ke Goals
            </h3>
            <div className="space-y-4">
              {dailyGoals.length > 0 ? dailyGoals.map((goal, i) => {
                const progress = Math.min(Math.round((goal.current / goal.target) * 100), 100);
                const done = goal.current >= goal.target ? 'Done!' : `${goal.current}/${goal.target}`;
                return (
                  <div key={goal.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-theme-text-secondary">{goal.label}</span>
                      <span className={`text-xs font-bold ${progress >= 100 ? 'text-emerald-400' : 'text-theme-text-muted'}`}>
                        {done}
                      </span>
                    </div>
                                        <div className="w-full h-2 bg-violet-100 dark:bg-gray-800 rounded-full overflow-hidden">
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
            </>
          )}
        </div>

        {/* Continue Learning — Skeleton or real */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={6}
          className="mt-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-theme-text flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-violet-400" />
                            {t.continue_learning}
            </h3>
            <Link to="/courses" className="text-violet-400 hover:text-violet-300 text-sm font-medium flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? (
              <>
                <CourseCardSkeleton />
                <CourseCardSkeleton />
                <CourseCardSkeleton />
              </>
            ) : displayCourses.slice(0, 3).map((course, i) => (
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
                        <h4 className="font-bold text-theme-text group-hover:text-violet-500 transition-colors">{course.title}</h4>
                        <p className="text-xs text-theme-text-muted">{course.grade} - {course.board}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-theme-text-secondary">{course.completedChapters}/{course.chapters} chapters</span>
                        <span className="text-violet-400 font-medium">{course.chapters > 0 ? Math.round((course.completedChapters / course.chapters) * 100) : 0}%</span>
                      </div>
                                            <div className="w-full h-2 bg-violet-100 dark:bg-gray-800 rounded-full overflow-hidden">
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
                        <h3 className="text-lg font-bold text-theme-text mb-4 flex items-center gap-2">
                                        <Award className="w-5 h-5 text-amber-500" />
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
                        <h3 className="text-lg font-bold text-theme-text mb-4 flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-emerald-500" />
              {t.streak}
            </h3>
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 28 }, (_, i) => {
                const date = new Date();
                date.setDate(date.getDate() - (27 - i));
                const dateStr = date.toISOString().slice(0, 10);
                const todayStr = new Date().toISOString().slice(0, 10);
                const isToday = dateStr === todayStr;
                const active = activeDates.has(dateStr);
                const dayNum = date.getUTCDate();
                return (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5 + i * 0.02 }}
                    className={`aspect-square rounded-lg flex items-center justify-center text-xs font-medium transition-all ${
                      isToday
                        ? 'bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/30'
                        : active
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
                        : 'bg-theme-input text-theme-text-muted'
                    }`}
                  >
                    {dayNum}
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
