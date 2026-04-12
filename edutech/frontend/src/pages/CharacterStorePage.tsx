import { motion } from 'framer-motion';
import { Lock, Zap, ShoppingBag, Check } from 'lucide-react';
import { avatars } from '../data/mockData';
import { useStore } from '../store/useStore';
import { useState } from 'react';

export default function CharacterStorePage() {
  const { user } = useStore();
  const userXP = user?.xp ?? 2450;
  const [selected, setSelected] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');

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

  const filtered = filter === 'all' ? avatars : avatars.filter((a) => a.rarity === filter);

  return (
    <div className="min-h-screen bg-gray-950 pt-20 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm font-medium mb-4">
            <ShoppingBag className="w-4 h-4" /> Avatar Store
          </span>
          <h1 className="text-4xl font-black text-white mb-2">Character Store</h1>
          <p className="text-gray-400">XP se apna favourite avatar unlock karo!</p>
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
                  : 'bg-gray-900/50 text-gray-400 border border-white/5 hover:bg-white/5'
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
                    : `bg-gray-900/50 ${rarityBorder[avatar.rarity]} hover:border-white/20`
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
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-violet-500/20 text-violet-400 text-xs font-bold hover:bg-violet-500/30 transition-all"
                    >
                      <Zap className="w-3 h-3" /> {avatar.cost} XP
                    </motion.button>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/5 text-gray-500 text-xs font-bold">
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
            className="mt-8 p-6 rounded-2xl bg-gray-900/50 border border-white/10 flex items-center gap-6"
          >
            <span className="text-6xl">{avatars.find((a) => a.id === selected)?.emoji}</span>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white">{avatars.find((a) => a.id === selected)?.name}</h3>
              <p className="text-gray-400 text-sm capitalize">Rarity: {avatars.find((a) => a.id === selected)?.rarity}</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-violet-500 to-purple-600 shadow-lg shadow-violet-500/25"
            >
              {avatars.find((a) => a.id === selected)?.unlocked ? 'Equip Avatar' : 'Unlock Now'}
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
