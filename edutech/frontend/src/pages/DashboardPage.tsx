import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Target, BookOpen, TrendingUp, TrendingDown, Minus,
  ArrowRight, Calendar, Sparkles,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { dashboardApi, type Course, type GamificationStats, type WeeklyReport, type DailyGoal, type StudyTimeData } from '../services/api';
import { useLanguage } from '../i18n/useLanguage';
import Avatar from '../components/Avatar';
import Character3D from '../components/Character3D';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5 },
  }),
};

const barGradients = [
  'linear-gradient(180deg, #a5b4fc, #6366f1)',
  'linear-gradient(180deg, #93c5fd, #3b82f6)',
  'linear-gradient(180deg, #a5f3fc, #06b6d4)',
  'linear-gradient(180deg, #a5b4fc, #6366f1)',
  'linear-gradient(180deg, #fda4af, #f43f5e)',
  'linear-gradient(180deg, #a5f3fc, #06b6d4)',
  'linear-gradient(180deg, #a5b4fc, #6366f1)',
];

const goalColors = ['gc-cyan', 'gc-rose', 'gc-yellow', 'gc-green'];
const goalStrokes = ['#06b6d4', '#f43f5e', '#f59e0b', '#10b981'];

const courseBannerGradients = [
  'linear-gradient(135deg, #06b6d4, #67e8f9, #a5f3fc)',
  'linear-gradient(135deg, #6366f1, #818cf8, #a5b4fc)',
  'linear-gradient(135deg, #f43f5e, #fb7185, #fda4af)',
  'linear-gradient(135deg, #10b981, #34d399, #6ee7b7)',
  'linear-gradient(135deg, #f97316, #fb923c, #fdba74)',
  'linear-gradient(135deg, #6366f1, #818cf8, #a5b4fc)',
];
const courseArcStrokes = ['#06b6d4', '#6366f1', '#f43f5e', '#10b981', '#f97316', '#6366f1'];

function SkeletonPulse({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
  return <div className={`animate-pulse bg-[var(--color-surface)] rounded-lg ${className}`} style={style} />;
}

function HeroSkeleton() {
  return (
    <div className="hero-section mb-5">
      <div className="p-8 rounded-3xl bg-[var(--color-surface)] animate-pulse" style={{ minHeight: 260 }}>
        <SkeletonPulse className="w-32 h-6 rounded-full mb-4" />
        <SkeletonPulse className="w-64 h-10 mb-3" />
        <SkeletonPulse className="w-48 h-5 mb-5" />
        <div className="flex gap-3">
          <SkeletonPulse className="w-32 h-12 rounded-xl" />
          <SkeletonPulse className="w-32 h-12 rounded-xl" />
        </div>
      </div>
      <SkeletonPulse className="rounded-3xl" style={{ minHeight: 260 }} />
    </div>
  );
}

function BentoSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-5">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="p-5 rounded-[20px] bg-theme-card border border-theme-border">
          <SkeletonPulse className="w-8 h-8 rounded-lg mb-2.5" />
          <SkeletonPulse className="w-20 h-8 mb-1" />
          <SkeletonPulse className="w-16 h-3" />
        </div>
      ))}
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="p-6 rounded-[20px] bg-theme-card border border-theme-border">
      <SkeletonPulse className="w-40 h-5 mb-1" />
      <SkeletonPulse className="w-56 h-3 mb-4" />
      <div className="flex gap-1 mb-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <SkeletonPulse key={i} className="w-10 h-7 rounded-lg" />
        ))}
      </div>
      <div className="flex items-end gap-3 h-[180px]">
        {[40, 65, 35, 80, 55, 90, 70].map((h, i) => (
          <div key={i} className="flex-1 flex justify-center">
            <SkeletonPulse className="rounded-t-lg" style={{ height: `${h}%`, width: '70%', maxWidth: 36 }} />
          </div>
        ))}
      </div>
    </div>
  );
}

function GoalsSkeleton() {
  return (
    <div className="p-6 rounded-[20px] bg-theme-card border border-theme-border">
      <SkeletonPulse className="w-28 h-5 mb-4" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-3 p-3.5 rounded-2xl border border-theme-border">
            <SkeletonPulse className="w-11 h-11 rounded-full" />
            <div className="flex-1">
              <SkeletonPulse className="w-24 h-3 mb-1.5" />
              <SkeletonPulse className="w-16 h-2.5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CourseCardSkeleton() {
  return (
    <div className="rounded-[20px] overflow-hidden bg-theme-card border border-theme-border">
      <SkeletonPulse className="rounded-none" style={{ height: 80 }} />
      <div className="p-4">
        <div className="flex items-center gap-3 mb-2">
          <SkeletonPulse className="w-12 h-12 rounded-full" />
          <div className="flex-1">
            <SkeletonPulse className="w-24 h-3 mb-1.5" />
            <SkeletonPulse className="w-16 h-2.5" />
          </div>
        </div>
        <SkeletonPulse className="w-full h-9 rounded-xl" />
      </div>
    </div>
  );
}

function MiniRing({ pct, stroke, size = 44, sw = 4 }: { pct: number; stroke: string; size?: number; sw?: number }) {
  const r = (size - sw) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} className="goal-ring-track" />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        stroke={stroke} strokeDasharray={circ} strokeDashoffset={offset}
        className="goal-ring-fill"
      />
    </svg>
  );
}

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
        const params: { grade?: number; board?: string } = {};
        if (user?.grade && !isNaN(parseInt(user.grade, 10))) {
          params.grade = parseInt(user.grade, 10);
        }
        if (user?.board) {
          params.board = user.board;
        }
        const data = await dashboardApi.get(Object.keys(params).length > 0 ? params : undefined);
        setApiCourses(data.courses.courses);
        setStats(data.stats);
        setWeeklyReport(data.weekly_report);
        setDailyGoals(data.daily_goals.goals);
        const breakdown = data.study_time.daily_breakdown;
        const dates = new Set(breakdown.map((d) => d.date));
        setActiveDates(dates);
        setStudyBreakdown(breakdown);
        const progMap: Record<string, { completed: number; total: number }> = {};
        const progData = data.progress.progress;
        if (progData) {
          for (const p of progData) {
            progMap[p.course.id] = { completed: p.completed_chapters, total: p.total_chapters };
          }
        }
        setCourseProgress(progMap);
      } catch {
        // fallback
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
  const maxMinutes = useMemo(() => Math.max(...chartData.map(d => d.minutes), 1), [chartData]);
  const dayRangeOptions = [1, 3, 5, 7, 14, 30] as const;

  const displayCourses = apiCourses.map((c) => {
    const prog = courseProgress[c.id];
    return {
      id: c.id, title: c.title, icon: c.icon || '\ud83d\udcda',
      color: c.color || 'from-indigo-500 to-violet-500',
      grade: `Grade ${c.grade}`, board: c.board,
      chapters: prog?.total ?? 0, completedChapters: prog?.completed ?? 0,
    };
  });

  const statCards = [
    { label: t.streak, value: `${streak}`, emoji: '\ud83d\udd25', sublabel: 'Days', bentoClass: 'bento-orange' },
    { label: t.total_xp, value: isPremium ? '\u221e' : `${xp.toLocaleString()}`, emoji: '\u26a1', sublabel: 'XP', bentoClass: 'bento-violet' },
    { label: t.level, value: `${level}`, emoji: '\ud83c\udfc6', sublabel: 'Level', bentoClass: 'bento-cyan' },
    { label: t.courses_title, value: String(apiCourses.length), emoji: '\ud83d\udcda', sublabel: 'Courses', bentoClass: 'bento-green' },
  ];

  const overallPct = totalMinutes > 0 ? Math.min(Math.round((totalMinutes / (chartDays * 30)) * 100), 100) : 0;
  const ringR = 48;
  const ringCirc = 2 * Math.PI * ringR;
  const ringOffset = ringCirc - (overallPct / 100) * ringCirc;

  return (
    <div className="min-h-screen bg-theme-page transition-colors duration-300 pt-20 pb-12 px-4 blob-bg">
      <div className="max-w-[1200px] mx-auto relative z-10">

        {/* HERO SECTION */}
        {loading ? <HeroSkeleton /> : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="hero-section mb-5">
            {/* Hero Left */}
            <div className="p-8 rounded-3xl relative overflow-hidden flex flex-col justify-center"
              style={{ background: 'var(--hero-bg)' }}>
              <div className="absolute top-[-40px] right-[-40px] w-[180px] h-[180px] rounded-full" style={{ background: 'rgba(99,102,241,0.12)', filter: 'blur(40px)' }} />
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wide mb-4 w-fit"
                style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.1)', color: '#6366f1' }}>
                <Sparkles className="w-3.5 h-3.5" /> Welcome Back
              </span>
              <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-2.5 text-[var(--hero-text)]">
                {t.dashboard_welcome},<br /><span className="glow-name">{displayName}!</span> {'\ud83d\udc4b'}
              </h1>
              <p className="text-sm text-[var(--hero-sub)] mb-5 leading-relaxed">{t.dashboard_title}</p>
              <div className="flex gap-2.5 relative z-10">
                <Link to="/courses" className="px-6 py-3 rounded-[14px] bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-sm font-bold shadow-lg shadow-violet-500/25 hover:-translate-y-0.5 transition-all">
                  Start Learning {'\u2192'}
                </Link>
                <Link to="/leaderboard" className="px-6 py-3 rounded-[14px] bg-white/70 dark:bg-white/10 border border-[rgba(0,0,0,0.06)] dark:border-violet-500/20 text-[var(--hero-text)] text-sm font-bold shadow-sm hover:bg-white dark:hover:bg-white/15 transition-all">
                  Leaderboard
                </Link>
              </div>
            </div>
            {/* Hero Right - 3D Character */}
            <div className="rounded-3xl relative overflow-hidden flex items-center justify-center"
              style={{ background: 'var(--hero-avatar-bg)', border: '1px solid var(--hero-avatar-border)' }}>
              <Character3D />
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[3] flex items-center gap-2 px-5 py-2.5 rounded-2xl"
                style={{ background: 'var(--hero-level-bg)', backdropFilter: 'blur(16px)', border: '1px solid var(--hero-level-border)', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
                <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0">
                  <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
                    <Avatar avatar={user?.avatar} imgClassName="w-full h-full object-cover" />
                  </div>
                </div>
                <div>
                  <div className="text-xs font-bold text-[var(--hero-level-text)]">Level {level}</div>
                  <div className="w-[110px] h-[5px] rounded-full mt-1 overflow-hidden" style={{ background: 'rgba(99,102,241,0.1)' }}>
                    <div className="h-full rounded-full" style={{ width: `${xpProgress}%`, background: 'linear-gradient(90deg, #6366f1, #06b6d4)' }} />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* BENTO STATS */}
        {loading ? <BentoSkeleton /> : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-5">
            {statCards.map((stat, i) => (
              <motion.div key={i} variants={fadeUp} initial="hidden" animate="visible" custom={i}
                className={`bento-card p-5 rounded-[20px] bg-theme-card border border-theme-border ${stat.bentoClass}`}>
                <span className="text-[28px] block mb-2.5">{stat.emoji}</span>
                <div className="text-[30px] font-bold text-theme-text leading-none mb-0.5">{stat.value}</div>
                <div className="text-xs font-semibold text-theme-text-muted">{stat.sublabel}</div>
              </motion.div>
            ))}
          </div>
        )}

        {/* CHARACTER SHOWCASE */}
        {!loading && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Link to="/store" className="char-showcase block">
              <div className="flex gap-3.5 flex-shrink-0 relative z-[1]">
                {['\ud83e\uddd1\u200d\ud83c\udf93', '\ud83d\udc67', '\ud83e\uddd2'].map((emoji, i) => (
                  <div key={i} className={`rounded-[18px] overflow-hidden border-[3px] border-white shadow-md hover:-translate-y-1.5 hover:scale-105 transition-all cursor-pointer flex items-center justify-center text-3xl bg-gradient-to-br ${i === 0 ? 'w-[110px] h-[130px] rounded-[22px] border-[4px] border-[var(--color-accent)] shadow-indigo-500/20 from-indigo-100 to-violet-100 dark:from-indigo-900/30 dark:to-violet-900/30' : 'w-[90px] h-[110px] from-pink-100 to-sky-100 dark:from-pink-900/20 dark:to-sky-900/20'}`}>
                    {emoji}
                  </div>
                ))}
              </div>
              <div className="relative z-[1]">
                <h3 className="text-xl font-extrabold text-[var(--hero-text)] mb-1">
                  Your <span className="text-[var(--color-accent)]">Characters</span>
                </h3>
                <p className="text-sm text-[var(--hero-sub)] leading-relaxed mb-3.5">
                  Unlock & customize your AI study companion! Earn XP to get new characters.
                </p>
                <span className="inline-block px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-sm font-bold shadow-md shadow-violet-500/20 hover:-translate-y-0.5 transition-all">
                  Visit Store {'\u2192'}
                </span>
              </div>
            </Link>
          </motion.div>
        )}

        {/* CHART + GOALS */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-3.5 mb-5">
          {loading ? (
            <><ChartSkeleton /><GoalsSkeleton /></>
          ) : (
            <>
              {/* Study Progress with Gradient Bars + Radial Ring */}
              <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={4}
                className="p-6 rounded-[20px] bg-theme-card border border-theme-border hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-base font-extrabold text-theme-text">Study Progress</h3>
                  {(trendInfo.direction !== 'stable' || trendInfo.pct > 0) && (
                    <span className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
                      trendInfo.direction === 'up' ? 'bg-green-100 dark:bg-green-900/30 text-green-600'
                      : trendInfo.direction === 'down' ? 'bg-red-100 dark:bg-red-900/30 text-red-500'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                    }`}>
                      {trendInfo.direction === 'up' ? <TrendingUp className="w-3.5 h-3.5" /> : trendInfo.direction === 'down' ? <TrendingDown className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
                      {trendInfo.direction === 'up' ? '+' : trendInfo.direction === 'down' ? '-' : ''}{trendInfo.pct}%
                    </span>
                  )}
                </div>
                <p className="text-xs text-theme-text-muted mb-3.5">
                  {totalMinutes > 0 ? `${totalMinutes} min study \u2014 last ${chartDays} day${chartDays > 1 ? 's' : ''}` : `No activity \u2014 last ${chartDays} day${chartDays > 1 ? 's' : ''}`}
                </p>
                {/* Day range pills */}
                <div className="flex gap-1 mb-3.5 flex-wrap">
                  {dayRangeOptions.map((d) => (
                    <button key={d} onClick={() => setChartDays(d)}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                        chartDays === d
                          ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-700'
                          : 'text-theme-text-muted border border-transparent hover:bg-theme-input'
                      }`}>
                      {d}D
                    </button>
                  ))}
                </div>
                {/* Chart: bars + radial ring */}
                <div className="flex items-end gap-5">
                  <div className="bar-chart-container flex-1">
                    {chartData.map((d, i) => {
                      const pct = maxMinutes > 0 ? (d.minutes / maxMinutes) * 100 : 0;
                      return (
                        <div key={i} className="bar-col group">
                          <div className="bar-val opacity-0 group-hover:opacity-100 transition-opacity">{d.minutes}m</div>
                          <div className="bar-wrap">
                            <div className="bar-fill" style={{ height: `${Math.max(pct, 3)}%`, background: barGradients[i % barGradients.length] }} />
                          </div>
                          <div className="bar-label">{d.day}</div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex-shrink-0 relative flex items-center justify-center" style={{ width: 120, height: 120 }}>
                    <svg width={120} height={120} style={{ transform: 'rotate(-90deg)' }}>
                      <defs>
                        <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#7c3aed" />
                          <stop offset="50%" stopColor="#06b6d4" />
                          <stop offset="100%" stopColor="#10b981" />
                        </linearGradient>
                      </defs>
                      <circle cx={60} cy={60} r={ringR} className="ring-track" />
                      <circle cx={60} cy={60} r={ringR} stroke="url(#ringGrad)" strokeDasharray={ringCirc} strokeDashoffset={ringOffset} className="ring-fill" />
                    </svg>
                    <div className="absolute text-center">
                      <div className="text-[28px] font-extrabold text-theme-text leading-none">{overallPct}%</div>
                      <div className="text-[10px] font-semibold text-theme-text-muted mt-0.5">Goal</div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Daily Goals with mini radial rings */}
              <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={5}
                className="p-6 rounded-[20px] bg-theme-card border border-theme-border hover:shadow-lg transition-shadow">
                <h3 className="text-base font-extrabold text-theme-text mb-3.5 flex items-center gap-2">
                  <Target className="w-5 h-5 text-cyan-500" /> Aaj Ke Goals
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {dailyGoals.length > 0 ? dailyGoals.map((goal, i) => {
                    const progress = Math.min(Math.round((goal.current / goal.target) * 100), 100);
                    const done = goal.current >= goal.target;
                    const colorIdx = i % goalColors.length;
                    return (
                      <div key={goal.id} className={`goal-card ${goalColors[colorIdx]}`}>
                        <div className="w-11 h-11 flex-shrink-0 relative flex items-center justify-center">
                          <MiniRing pct={progress} stroke={goalStrokes[colorIdx]} />
                          <span className="absolute text-base">{i === 0 ? '\ud83d\udcd6' : i === 1 ? '\ud83e\udde0' : i === 2 ? '\ud83c\udfaf' : '\u2b50'}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[11px] font-bold text-theme-text leading-tight">{goal.label}</div>
                          <div className="text-[10px] font-semibold text-theme-text-muted">{goal.current}/{goal.target}</div>
                        </div>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold flex-shrink-0 ${
                          done ? 'bg-green-100 dark:bg-green-900/30 text-green-600' : progress > 0 ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-600' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600'
                        }`}>
                          {done ? 'Done' : progress > 0 ? `${progress}%` : 'Start'}
                        </span>
                      </div>
                    );
                  }) : (
                    <p className="text-theme-text-muted text-sm text-center py-4 col-span-2">Start learning to track your daily goals!</p>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </div>

        {/* CONTINUE LEARNING - Course Cards with Gradient Banners */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={6} className="mb-5">
          <div className="flex items-center justify-between mb-3.5">
            <h2 className="text-lg font-extrabold text-theme-text">{t.continue_learning}</h2>
            <Link to="/courses" className="text-sm text-violet-600 dark:text-violet-400 font-semibold hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {loading ? (
              <>{[1, 2, 3].map(i => <CourseCardSkeleton key={i} />)}</>
            ) : displayCourses.slice(0, 3).map((course, i) => {
              const pct = course.chapters > 0 ? Math.round((course.completedChapters / course.chapters) * 100) : 0;
              const arcR = 18;
              const arcCirc = 2 * Math.PI * arcR;
              const arcOffset = arcCirc - (pct / 100) * arcCirc;
              return (
                <motion.div key={course.id} variants={fadeUp} initial="hidden" animate="visible" custom={7 + i}
                  whileHover={{ y: -4 }}
                  className="rounded-[20px] overflow-hidden bg-theme-card border border-theme-border hover:shadow-lg transition-all cursor-pointer">
                  <Link to={`/courses/${course.id}`}>
                    <div className="h-20 relative overflow-hidden flex items-center justify-between px-5"
                      style={{ background: courseBannerGradients[i % courseBannerGradients.length] }}>
                      <div className="relative z-[1]">
                        <div className="text-base font-extrabold text-white" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.15)' }}>{course.title}</div>
                        <div className="text-[11px] text-white/85 font-semibold">{course.grade} {'\u2022'} {course.board}</div>
                      </div>
                      <span className="text-4xl relative z-[1]" style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.1))' }}>{course.icon}</span>
                      <div className="absolute right-[-20px] bottom-[-20px] w-[100px] h-[100px] rounded-full bg-white/10" />
                      <div className="absolute right-10 top-[-30px] w-[70px] h-[70px] rounded-full bg-white/[0.08]" />
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 flex-shrink-0 relative flex items-center justify-center">
                          <svg width={48} height={48} style={{ transform: 'rotate(-90deg)' }}>
                            <circle cx={24} cy={24} r={arcR} className="course-arc-track" />
                            <circle cx={24} cy={24} r={arcR} stroke={courseArcStrokes[i % courseArcStrokes.length]}
                              strokeDasharray={arcCirc} strokeDashoffset={arcOffset} className="course-arc-fill" />
                          </svg>
                          <span className="absolute text-[11px] font-extrabold text-theme-text">{pct}%</span>
                        </div>
                        <div className="flex-1">
                          <div className="text-xs font-semibold text-theme-text-secondary">{course.completedChapters}/{course.chapters} chapters</div>
                          <div className="text-[11px] text-theme-text-muted">Continue learning {'\u2192'}</div>
                        </div>
                      </div>
                      <button className="w-full py-2 rounded-xl text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-all flex items-center justify-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5" /> Continue
                      </button>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* STREAK + XP CARD */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
          {/* Streak Calendar */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={10}
            className="p-6 rounded-[20px] bg-theme-card border border-theme-border hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-3.5">
              <h3 className="text-base font-extrabold text-theme-text flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-500" /> {t.streak}
              </h3>
              <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-100 dark:bg-amber-900/30 text-orange-600">{'\ud83d\udd25'} {streak} days</span>
            </div>
            <div className="streak-grid mb-1">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                <div key={i} className="text-center text-[9px] font-bold text-theme-text-muted">{d}</div>
              ))}
            </div>
            <div className="streak-grid">
              {Array.from({ length: 28 }, (_, i) => {
                const date = new Date();
                date.setDate(date.getDate() - (27 - i));
                const dateStr = date.toISOString().slice(0, 10);
                const todayStr = new Date().toISOString().slice(0, 10);
                const isToday = dateStr === todayStr;
                const active = activeDates.has(dateStr);
                return (
                  <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 + i * 0.015 }}
                    className={`streak-cell ${isToday ? 'today' : active ? 'active' : 'bg-theme-input text-theme-text-muted'}`}>
                    {date.getUTCDate()}
                  </motion.div>
                );
              })}
            </div>
            <div className="flex items-center justify-center gap-4 mt-3 text-[10px] text-theme-text-muted">
              <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded bg-emerald-500/20 border border-emerald-500/20" /><span>Studied</span></div>
              <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded bg-theme-input" /><span>Missed</span></div>
              <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded bg-gradient-to-br from-indigo-500 to-violet-500" /><span>Today</span></div>
            </div>
          </motion.div>

          {/* XP Progress Card */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={11}
            className="p-6 rounded-[20px] relative overflow-hidden text-white"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #6366f1)' }}>
            <div className="absolute right-[-30px] top-[-30px] w-[120px] h-[120px] rounded-full bg-white/[0.08]" />
            <div className="absolute left-[-20px] bottom-[-20px] w-[100px] h-[100px] rounded-full bg-white/[0.05]" />
            <div className="relative z-[1]">
              <div className="text-sm font-bold opacity-85 mb-2">{'\u26a1'} XP Progress</div>
              <div className="text-4xl font-extrabold mb-1">
                {isPremium ? '\u221e Unlimited' : xp.toLocaleString()}
              </div>
              <div className="text-xs opacity-70 mb-4">
                {isPremium ? 'Pro Member \u2014 Unlimited XP' : `${xpToNext} XP to Level ${level + 1}`}
              </div>
              <div className="flex justify-between text-[11px] font-semibold opacity-80 mb-1">
                <span>Level {level}</span>
                <span>Level {level + 1}</span>
              </div>
              <div className="h-2 rounded-full bg-white/20 overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${xpProgress}%` }} transition={{ duration: 1, delay: 0.3 }}
                  className="h-full rounded-full bg-white/80" />
              </div>
              <div className="mt-4 flex gap-5">
                <div className="text-center">
                  <div className="text-xl font-extrabold">{streak}</div>
                  <div className="text-[10px] opacity-70 font-semibold">Day Streak</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-extrabold">{level}</div>
                  <div className="text-[10px] opacity-70 font-semibold">Current Level</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-extrabold">{apiCourses.length}</div>
                  <div className="text-[10px] opacity-70 font-semibold">Courses</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
