import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, Zap, ShoppingBag, Check } from 'lucide-react';
import { useStore } from '../store/useStore';
import { storeApi, type Avatar as ApiAvatar } from '../services/api';

export default function CharacterStorePage() {
  const { user, setUser } = useStore();
  const userXP = user?.xp ?? 0;
  const [selected, setSelected] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');
  const [apiAvatars, setApiAvatars] = useState<ApiAvatar[]>([]);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);

  useEffect(() => {
    const fetchAvatars = async () => {
      try {
        const res = await storeApi.getAvatars();
        setApiAvatars(res.avatars);
      } catch {
        // fallback to mock
      } finally {
        setLoading(false);
      }
    };
    fetchAvatars();
  }, []);

  const avatars = apiAvatars.map((a) => ({
    id: a.id,
    name: a.name,
    emoji: a.emoji || '\ud83e\udd81',
    rarity: a.rarity || 'common',
    cost: a.price,
    unlocked: a.owned ?? false,
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-theme-page transition-colors duration-300 pt-20 pb-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <div className="h-8 w-36 mx-auto bg-gray-700/50 animate-pulse rounded-full mb-4" />
            <div className="h-10 w-52 mx-auto bg-gray-700/50 animate-pulse rounded-lg mb-2" />
            <div className="h-5 w-64 mx-auto bg-gray-700/50 animate-pulse rounded-lg mb-4" />
            <div className="h-10 w-44 mx-auto bg-gray-700/50 animate-pulse rounded-full" />
          </div>
          <div className="flex justify-center flex-wrap gap-2 mb-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-9 w-20 bg-gray-700/50 animate-pulse rounded-xl" />
            ))}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
              <div key={i} className="p-5 rounded-2xl bg-theme-card border border-theme-border">
                <div className="h-4 w-14 ml-auto bg-gray-700/50 animate-pulse rounded-full mb-4" />
                <div className="w-14 h-14 mx-auto rounded-full bg-gray-700/50 animate-pulse mb-3" />
                <div className="h-4 w-20 mx-auto bg-gray-700/50 animate-pulse rounded-lg mb-2" />
                <div className="h-6 w-16 mx-auto bg-gray-700/50 animate-pulse rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const handleBuy = async (avatarId: string) => {
    setBuying(true);
    try {
      await storeApi.buy(avatarId);
      // Refresh avatars and user XP
      const res = await storeApi.getAvatars();
      setApiAvatars(res.avatars);
      if (user && typeof res.user_xp === 'number') {
        setUser({ ...user, xp: res.user_xp });
      }
    } catch {
      // handle error
    } finally {
      setBuying(false);
    }
  };

  const handleEquip = async (avatarId: string) => {
    try {
      await storeApi.equip(avatarId);
    } catch {
      // handle error
    }
  };

  const rarityColors: Record<string, string> = {
    common: 'from-gray-500 to-gray-600',
    uncommon: 'from-emerald-500 to-teal-600',
    rare: 'from-blue-500 to-indigo-600',
    epic: 'from-violet-500 to-purple-600',
    legendary: 'from-amber-500 to-orange-600',
  };

  const rarityBorder: Record<string, string> = {
    common: 'border-gray-500/20',
    uncommon: 'border-emerald-500/20',
    rare: 'border-blue-500/20',
    epic: 'border-violet-500/20',
    legendary: 'border-amber-500/20',
  };

  const filtered = filter === 'all' ? avatars : avatars.filter((a: typeof avatars[number]) => a.rarity === filter);

  return (
    <div className="min-h-screen bg-theme-page transition-colors duration-300 pt-20 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm font-medium mb-4">
            <ShoppingBag className="w-4 h-4" /> Avatar Store
          </span>
          <h1 className="text-4xl font-black text-white mb-2">Character Store</h1>
          <p className="text-theme-text-secondary">XP se apna favourite avatar unlock karo!</p>
          <div className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-full bg-yellow-500/10 border border-yellow-500/20">
            <Zap className="w-5 h-5 text-yellow-400" />
            <span className="text-lg font-bold text-yellow-400">{userXP.toLocaleString()} XP Available</span>
          </div>
        </motion.div>

        {/* Filter */}
        <div className="flex justify-center flex-wrap gap-2 mb-8">
          {['all', 'common', 'uncommon', 'rare', 'epic', 'legendary'].map((f) => (
            <motion.button
              key={f}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${
                filter === f
                  ? 'bg-violet-500/20 text-violet-400 border border-violet-500/20'
                  : 'bg-theme-card text-theme-text-secondary border border-theme-border hover:bg-theme-input'
              }`}
            >
              {f}
            </motion.button>
          ))}
        </div>

        {/* Avatar Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filtered.map((avatar, i) => {
            const canAfford = userXP >= avatar.cost;
            const isSelected = selected === avatar.id;
            return (
              <motion.div
                key={avatar.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -8, scale: 1.05 }}
                onClick={() => setSelected(avatar.id)}
                className={`relative p-5 rounded-2xl border cursor-pointer transition-all ${
                  isSelected
                    ? `bg-gradient-to-b from-violet-500/20 to-violet-500/5 border-violet-500/40 shadow-lg shadow-violet-500/10`
                    : `bg-theme-card ${rarityBorder[avatar.rarity]} hover:border-white/20`
                }`}
              >
                {/* Rarity Badge */}
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold text-white bg-gradient-to-r ${rarityColors[avatar.rarity]}`}>
                    {avatar.rarity}
                  </span>
                </div>

                <div className="text-center">
                  <motion.span
                    animate={isSelected ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ duration: 0.5 }}
                    className="text-5xl block mb-3 mt-4"
                  >
                    {avatar.emoji}
                  </motion.span>
                  <h3 className="font-bold text-white text-sm mb-1">{avatar.name}</h3>

                  {avatar.unlocked ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold">
                      <Check className="w-3 h-3" /> Owned
                    </span>
                  ) : canAfford ? (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => { e.stopPropagation(); handleBuy(avatar.id); }}
                      disabled={buying}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-violet-500/20 text-violet-400 text-xs font-bold hover:bg-violet-500/30 transition-all disabled:opacity-60"
                    >
                      <Zap className="w-3 h-3" /> {buying ? '...' : `${avatar.cost} XP`}
                    </motion.button>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-theme-input text-theme-text-muted text-xs font-bold">
                      <Lock className="w-3 h-3" /> {avatar.cost} XP
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Selected Avatar Detail */}
        {selected && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 p-6 rounded-2xl bg-theme-card border border-theme-border flex items-center gap-6"
          >
            <span className="text-6xl">{avatars.find((a) => a.id === selected)?.emoji}</span>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white">{avatars.find((a) => a.id === selected)?.name}</h3>
              <p className="text-theme-text-secondary text-sm capitalize">Rarity: {avatars.find((a) => a.id === selected)?.rarity}</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                const av = avatars.find((a: typeof avatars[number]) => a.id === selected);
                if (av?.unlocked) handleEquip(selected!);
                else handleBuy(selected!);
              }}
              disabled={buying}
              className="px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-violet-500 to-purple-600 shadow-lg shadow-violet-500/25 disabled:opacity-60"
            >
              {buying ? 'Processing...' : avatars.find((a: typeof avatars[number]) => a.id === selected)?.unlocked ? 'Equip Avatar' : 'Unlock Now'}
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
