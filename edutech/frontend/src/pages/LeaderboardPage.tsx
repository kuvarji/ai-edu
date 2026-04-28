import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp } from 'lucide-react';
import { gamificationApi, type LeaderboardEntry } from '../services/api';
import Avatar from '../components/Avatar';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5 },
  }),
};

export default function LeaderboardPage() {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'alltime'>('weekly');
  const [apiLeaderboard, setApiLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const res = await gamificationApi.getLeaderboard({ period, limit: 20 });
        setApiLeaderboard(res.leaderboard);
      } catch {
        // fallback to mock
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [period]);

  const leaderboardData = apiLeaderboard.map((e) => ({
    rank: e.rank,
    name: e.name,
    avatar: e.avatar || '\ud83e\udd81',
    xp: e.xp,
    level: e.level,
    streak: e.streak,
  }));

  const top3 = leaderboardData.slice(0, 3);

  /* Skeleton */
  if (loading) {
    return (
      <div className="min-h-screen bg-theme-page transition-colors duration-300 pt-20 pb-12 px-4 blob-bg">
        <div className="max-w-[1100px] mx-auto relative z-10">
          {/* Podium skeleton */}
          <div className="p-8 rounded-[24px] mb-6" style={{ background: 'var(--section-gradient)' }}>
            <div className="h-7 w-60 mx-auto bg-[var(--color-surface)] animate-pulse rounded-lg mb-7" />
            <div className="flex items-end justify-center gap-4">
              {[80, 100, 80].map((sz, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="rounded-full bg-[var(--color-surface)] animate-pulse mb-2" style={{ width: sz, height: sz }} />
                  <div className="h-4 w-20 bg-[var(--color-surface)] animate-pulse rounded mb-1" />
                  <div className="h-3 w-16 bg-[var(--color-surface)] animate-pulse rounded mb-2" />
                  <div className="rounded-[14px_14px_0_0] bg-[var(--color-surface)] animate-pulse" style={{ width: 120, height: [70, 100, 50][i] }} />
                </div>
              ))}
            </div>
          </div>
          {/* List skeleton */}
          <div className="rounded-[22px] bg-theme-card border border-theme-border overflow-hidden">
            <div className="grid grid-cols-[60px_1fr_120px_120px_100px] px-6 py-3.5 bg-theme-surface">
              {['Rank','Student','XP','Streak','Level'].map(h => (
                <div key={h} className="h-3 w-12 bg-[var(--color-surface)] animate-pulse rounded" />
              ))}
            </div>
            {[1,2,3,4,5].map(i => (
              <div key={i} className="grid grid-cols-[60px_1fr_120px_120px_100px] px-6 py-3.5 items-center border-b border-theme-border last:border-b-0">
                <div className="h-5 w-6 bg-[var(--color-surface)] animate-pulse rounded" />
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--color-surface)] animate-pulse" />
                  <div>
                    <div className="h-4 w-24 bg-[var(--color-surface)] animate-pulse rounded mb-1" />
                    <div className="h-3 w-16 bg-[var(--color-surface)] animate-pulse rounded" />
                  </div>
                </div>
                <div className="h-4 w-16 bg-[var(--color-surface)] animate-pulse rounded" />
                <div className="h-4 w-14 bg-[var(--color-surface)] animate-pulse rounded" />
                <div className="h-6 w-14 bg-[var(--color-surface)] animate-pulse rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!loading && leaderboardData.length === 0) {
    return (
      <div className="min-h-screen bg-theme-page transition-colors duration-300 pt-20 pb-12 px-4 blob-bg">
        <div className="max-w-[1100px] mx-auto relative z-10 text-center py-16">
          <Trophy className="w-12 h-12 text-theme-text-muted mx-auto mb-3" />
          <p className="text-theme-text-secondary">Abhi koi leaderboard data nahi hai. Quizzes do aur XP kamao!</p>
        </div>
      </div>
    );
  }

  const rankColor = (r: number) => r === 1 ? 'text-yellow-500' : r === 2 ? 'text-slate-400' : r === 3 ? 'text-orange-500' : 'text-theme-text-muted';
  const levelBg = (l: number) => l >= 10 ? 'bg-violet-100 dark:bg-violet-900/30 text-indigo-600 dark:text-indigo-400' : l >= 5 ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400';

  return (
    <div className="min-h-screen bg-theme-page transition-colors duration-300 pt-20 pb-12 px-4 blob-bg">
      <div className="max-w-[1100px] mx-auto relative z-10">

        {/* Podium Section */}
        {top3.length >= 3 && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            className="p-8 rounded-[24px] mb-6 relative overflow-hidden"
            style={{ background: 'var(--section-gradient)', border: '1px solid var(--section-gradient-border)' }}>
            <div className="absolute -top-[60px] -right-[60px] w-[250px] h-[250px] rounded-full bg-indigo-300/10 dark:bg-indigo-400/5 blur-[40px]" />
            <h2 className="text-center text-[26px] font-extrabold mb-7 relative z-[1]">
              {'\ud83c\udfc6'} <span className="text-indigo-600 dark:text-indigo-400">Top Learners</span> of the Week
            </h2>
            <div className="flex items-end justify-center gap-4 relative z-[1]">
              {/* 2nd Place */}
              <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                whileHover={{ y: -6 }} className="flex flex-col items-center cursor-default">
                <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white dark:border-gray-700 shadow-lg mb-2.5">
                  <Avatar avatar={top3[1].avatar} imgClassName="w-full h-full object-cover" />
                </div>
                <span className="text-sm font-bold text-theme-text mb-0.5 truncate max-w-[100px]">{top3[1].name}</span>
                <span className="text-xs font-extrabold text-slate-500 mb-2">{top3[1].xp.toLocaleString()} XP</span>
                <div className="w-[120px] h-[70px] rounded-t-[14px] flex items-center justify-center text-[28px] font-extrabold text-white"
                  style={{ background: 'linear-gradient(180deg, #94a3b8, #64748b)' }}>2</div>
              </motion.div>

              {/* 1st Place */}
              <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                whileHover={{ y: -6 }} className="flex flex-col items-center cursor-default">
                <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity }}
                  className="text-[28px] mb-1 drop-shadow">{'\ud83d\udc51'}</motion.div>
                <div className="w-[100px] h-[100px] rounded-full overflow-hidden border-4 border-yellow-400 shadow-lg mb-2.5">
                  <Avatar avatar={top3[0].avatar} imgClassName="w-full h-full object-cover" />
                </div>
                <span className="text-sm font-bold text-theme-text mb-0.5 truncate max-w-[120px]">{top3[0].name}</span>
                <span className="text-xs font-extrabold text-yellow-500 mb-2">{top3[0].xp.toLocaleString()} XP</span>
                <div className="w-[120px] h-[100px] rounded-t-[14px] flex items-center justify-center text-[28px] font-extrabold text-white"
                  style={{ background: 'linear-gradient(180deg, #fbbf24, #f59e0b)', boxShadow: '0 -4px 20px rgba(245,158,11,0.2)' }}>1</div>
              </motion.div>

              {/* 3rd Place */}
              <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                whileHover={{ y: -6 }} className="flex flex-col items-center cursor-default">
                <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white dark:border-gray-700 shadow-lg mb-2.5">
                  <Avatar avatar={top3[2].avatar} imgClassName="w-full h-full object-cover" />
                </div>
                <span className="text-sm font-bold text-theme-text mb-0.5 truncate max-w-[100px]">{top3[2].name}</span>
                <span className="text-xs font-extrabold text-orange-500 mb-2">{top3[2].xp.toLocaleString()} XP</span>
                <div className="w-[120px] h-[50px] rounded-t-[14px] flex items-center justify-center text-[28px] font-extrabold text-white"
                  style={{ background: 'linear-gradient(180deg, #fb923c, #f97316)' }}>3</div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Filter Row */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="flex flex-wrap justify-between items-center gap-3 mb-5">
          <div className="flex gap-1.5 p-1.5 rounded-[14px] bg-theme-card border border-theme-border">
            {(['daily', 'weekly', 'alltime'] as const).map((p) => (
              <button key={p} onClick={() => setPeriod(p)}
                className={`px-[18px] py-2 rounded-[10px] text-[13px] font-bold transition-all ${
                  period === p
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                    : 'text-theme-text-muted hover:text-theme-text-secondary hover:bg-indigo-50 dark:hover:bg-indigo-900/20'
                }`}>
                {p === 'daily' ? 'Today' : p === 'weekly' ? 'This Week' : 'All Time'}
              </button>
            ))}
          </div>
          <div className="px-5 py-2.5 rounded-[14px] bg-indigo-100 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700 text-[13px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> Your Rank: <span className="text-xl font-extrabold">#{leaderboardData.length > 0 ? leaderboardData.length : '—'}</span>
          </div>
        </motion.div>

        {/* Leaderboard Table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="rounded-[22px] overflow-hidden bg-theme-card border border-theme-border shadow-sm">
          {/* Header */}
          <div className="hidden sm:grid grid-cols-[60px_1fr_120px_120px_100px] px-6 py-3.5 bg-theme-surface text-[11px] font-bold text-theme-text-muted uppercase tracking-wide">
            <div>Rank</div><div>Student</div><div>XP</div><div>Streak</div><div>Level</div>
          </div>
          {/* Rows */}
          {leaderboardData.map((player, i) => (
            <motion.div key={player.rank} variants={fadeUp} initial="hidden" animate="visible" custom={i}
              className={`grid grid-cols-[40px_1fr_auto] sm:grid-cols-[60px_1fr_120px_120px_100px] px-4 sm:px-6 py-3.5 items-center border-b border-theme-border last:border-b-0 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition-colors ${
                i < 3 ? '' : ''
              }`}>
              {/* Rank */}
              <span className={`text-base font-extrabold ${rankColor(player.rank)}`}>
                {player.rank}
              </span>
              {/* User */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-white dark:border-gray-700 shadow-sm flex-shrink-0">
                  <Avatar avatar={player.avatar} imgClassName="w-full h-full object-cover rounded-xl" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-theme-text truncate">{player.name}</div>
                  <div className="text-[11px] text-theme-text-muted font-semibold">Level {player.level}</div>
                </div>
              </div>
              {/* XP */}
              <span className="hidden sm:block text-[15px] font-extrabold text-indigo-600 dark:text-indigo-400">
                {player.xp.toLocaleString()}
              </span>
              {/* Streak */}
              <span className="hidden sm:flex items-center gap-1 text-[13px] font-bold text-orange-500">
                {'\ud83d\udd25'} {player.streak} days
              </span>
              {/* Level */}
              <span className={`hidden sm:block px-3 py-1 rounded-lg text-xs font-bold text-center ${levelBg(player.level)}`}>
                Lvl {player.level}
              </span>
              {/* Mobile: XP + Streak */}
              <div className="flex sm:hidden items-center gap-2 justify-end">
                <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400">{player.xp.toLocaleString()}</span>
                <span className="text-xs text-orange-400">{'\ud83d\udd25'}{player.streak}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </div>
  );
}
