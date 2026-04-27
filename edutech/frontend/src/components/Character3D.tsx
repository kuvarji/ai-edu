import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';

const DEFAULT_EMOJI = '🦁';

export default function Character3D() {
  const { user } = useStore();
  const avatar = user?.avatar || DEFAULT_EMOJI;
  const isBase64 = avatar.startsWith('data:') || avatar.startsWith('http');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="char-3d-stage" aria-hidden="true">
      {/* Orbiting rings */}
      <div className="char-ring char-ring-1" />
      <div className="char-ring char-ring-2" />
      <div className="char-ring char-ring-3" />

      {/* Glow aura */}
      <div className="char-3d-glow" />

      {/* Particles */}
      {mounted && Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="char-particle"
          style={{
            left: `${20 + Math.random() * 60}%`,
            animationDelay: `${i * 0.4}s`,
            animationDuration: `${2.5 + Math.random() * 2}s`,
          }}
        />
      ))}

      {/* Main character model */}
      <motion.div
        className="char-3d-model"
        initial={{ scale: 0, rotateY: -30 }}
        animate={{ scale: 1, rotateY: 0 }}
        transition={{ type: 'spring', stiffness: 120, damping: 14, delay: 0.2 }}
      >
        {isBase64 ? (
          <img
            src={avatar}
            alt="avatar"
            className="w-full h-full object-cover rounded-[28px]"
            draggable={false}
          />
        ) : (
          <span className="select-none" style={{ fontSize: '4.5rem', lineHeight: 1 }}>
            {avatar}
          </span>
        )}
      </motion.div>

      {/* Floating shadow */}
      <div className="char-3d-shadow" />

      {/* Orbiting mini-elements */}
      <div className="char-orb char-orb-1">⚡</div>
      <div className="char-orb char-orb-2">🎯</div>
      <div className="char-orb char-orb-3">📚</div>
    </div>
  );
}
