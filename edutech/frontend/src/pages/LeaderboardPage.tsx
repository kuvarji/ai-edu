import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Flame, Zap, Crown, TrendingUp } from 'lucide-react';
import { gamificationApi, type LeaderboardEntry } from '../services/api';

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
    avatar: e.avatar || '🦁',
    xp: e.xp,
    level: e.level,
    streak: e.streak,
  }));

  const top3 = leaderboardData.slice(0, 3);
  const rest = leaderboardData.slice(3);

  return (
    <div className="min-h-screen bg-theme-page transition-colors duration-300 pt-20 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-medium mb-4">
            <Trophy className="w-4 h-4" /> Rankings
          </span>
          <h1 className="text-4xl font-black text-white mb-2">Leaderboard</h1>
          <p className="text-theme-text-secondary">Top students ki ranking dekho</p>
        </motion.div>

        {/* Period Tabs */}
        <div className="flex justify-center gap-2 mb-10">
          {(['daily', 'weekly', 'alltime'] as const).map((p) => (
            <motion.button
              key={p}
              whileTap={{ scale: 0.95 }}
              onClick={() => setPeriod(p)}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                period === p
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/20'
                  : 'bg-theme-card text-theme-text-secondary border border-theme-border hover:bg-theme-input'
              }`}
            >
              {p === 'daily' ? 'Today' : p === 'weekly' ? 'This Week' : 'All Time'}
            </motion.button>
          ))}
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full mx-auto mb-3" />
            <p className="text-theme-text-secondary">Loading leaderboard...</p>
          </div>
        )}

        {!loading && leaderboardData.length === 0 && (
          <div className="text-center py-16">
            <Trophy className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-theme-text-secondary">Abhi koi leaderboard data nahi hai. Quizzes do aur XP kamao!</p>
          </div>
        )}

        {/* Top 3 Podium */}
        {top3.length >= 3 && <div className="flex items-end justify-center gap-4 mb-12">
          {/* 2nd Place */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ y: -5 }}
            className="text-center w-36"
          >
            <div className="text-4xl mb-2">{top3[1].avatar}</div>
            <div className="p-4 rounded-2xl bg-gray-800/50 border border-theme-border">
              <div className="w-10 h-10 mx-auto rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-white font-black text-lg mb-2 shadow-lg">
                2
              </div>
              <h3 className="font-bold text-white text-sm truncate">{top3[1].name}</h3>
              <p className="text-xs text-amber-400 font-bold mt-1">{top3[1].xp.toLocaleString()} XP</p>
              <p className="text-xs text-theme-text-muted">Level {top3[1].level}</p>
            </div>
          </motion.div>

          {/* 1st Place */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ y: -5 }}
            className="text-center w-40"
          >
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Crown className="w-8 h-8 text-amber-400 mx-auto mb-1" />
            </motion.div>
            <div className="text-5xl mb-2">{top3[0].avatar}</div>
            <div className="p-5 rounded-2xl bg-gradient-to-b from-amber-500/10 to-amber-500/5 border border-amber-500/20 shadow-lg shadow-amber-500/10">
              <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-black text-xl mb-2 shadow-lg shadow-amber-500/30">
                1
              </div>
              <h3 className="font-bold text-white truncate">{top3[0].name}</h3>
              <p className="text-sm text-amber-400 font-bold mt-1">{top3[0].xp.toLocaleString()} XP</p>
              <p className="text-xs text-theme-text-secondary">Level {top3[0].level}</p>
              <div className="flex items-center justify-center gap-1 mt-2">
                <Flame className="w-4 h-4 text-orange-400" />
                <span className="text-xs text-orange-400 font-bold">{top3[0].streak} days</span>
              </div>
            </div>
          </motion.div>

          {/* 3rd Place */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            whileHover={{ y: -5 }}
            className="text-center w-36"
          >
            <div className="text-4xl mb-2">{top3[2].avatar}</div>
            <div className="p-4 rounded-2xl bg-gray-800/50 border border-theme-border">
              <div className="w-10 h-10 mx-auto rounded-full bg-gradient-to-br from-amber-700 to-amber-800 flex items-center justify-center text-white font-black text-lg mb-2 shadow-lg">
                3
              </div>
              <h3 className="font-bold text-white text-sm truncate">{top3[2].name}</h3>
              <p className="text-xs text-amber-400 font-bold mt-1">{top3[2].xp.toLocaleString()} XP</p>
              <p className="text-xs text-theme-text-muted">Level {top3[2].level}</p>
            </div>
          </motion.div>
        </div>}

        {/* Rest of Leaderboard */}
        <div className="space-y-3">
          {rest.map((player, i) => (
            <motion.div
              key={player.rank}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + i * 0.05 }}
              whileHover={{ x: 5, scale: 1.01 }}
              className="flex items-center gap-4 p-4 rounded-2xl bg-theme-card border border-theme-border hover:border-theme-border transition-all"
            >
              <span className="w-8 text-center font-bold text-theme-text-muted">#{player.rank}</span>
              <div className="w-12 h-12 rounded-xl bg-theme-input flex items-center justify-center text-2xl">
                {player.avatar}
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-white text-sm">{player.name}</h4>
                <p className="text-xs text-theme-text-muted">Level {player.level}</p>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1 text-orange-400">
                  <Flame className="w-4 h-4" /> {player.streak}
                </span>
                <span className="flex items-center gap-1 text-amber-400 font-bold">
                  <Zap className="w-4 h-4" /> {player.xp.toLocaleString()}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Your Position */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-violet-500/10 to-cyan-500/10 border border-violet-500/20 text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-violet-400" />
            <h3 className="text-lg font-bold text-white">Tumhari Position: #24</h3>
          </div>
          <p className="text-theme-text-secondary text-sm">Aur 150 XP kamao top 20 mein aane ke liye!</p>
        </motion.div>
      </div>
    </div>
  );
}
