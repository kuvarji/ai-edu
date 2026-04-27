import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Crown, X, Zap, ArrowRight, Sparkles } from 'lucide-react';

interface MembershipPromptProps {
  show: boolean;
  onClose: () => void;
  currentXP: number;
  requiredXP: number;
  feature: string;
}

export default function MembershipPrompt({ show, onClose, currentXP, requiredXP, feature }: MembershipPromptProps) {
  const navigate = useNavigate();
  const [closing, setClosing] = useState(false);

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      onClose();
    }, 200);
  };

  const handleUpgrade = () => {
    onClose();
    navigate('/membership');
  };

  return (
    <AnimatePresence>
      {show && !closing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-theme-card border border-theme-border rounded-2xl overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-4 sm:p-5 relative">
              <button onClick={handleClose} className="absolute top-3 right-3 p-1 rounded-lg bg-white/20 hover:bg-white/30 transition-all">
                <X className="w-4 h-4 text-white" />
              </button>
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
                >
                  <Crown className="w-10 h-10 text-white" />
                </motion.div>
                <div>
                  <h3 className="text-lg font-bold text-white">XP Khatam Ho Gayi!</h3>
                  <p className="text-sm text-white/80">Pro membership lo unlimited access ke liye</p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-4 sm:p-5">
              {/* XP Status */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-red-500/10 border border-red-500/20 mb-4">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-red-400" />
                  <span className="text-sm text-red-400 font-medium">Tumhare paas: {currentXP} XP</span>
                </div>
                <span className="text-sm text-theme-text-muted">Chahiye: {requiredXP} XP</span>
              </div>

              <p className="text-sm text-theme-text-secondary mb-4">
                <span className="font-medium text-theme-text">{feature}</span> ke liye {requiredXP} XP chahiye, lekin tumhare paas sirf {currentXP} XP hai.
              </p>

              {/* Pro Benefits */}
              <div className="space-y-2 mb-5">
                <p className="text-xs text-theme-text-muted font-semibold uppercase tracking-wider">Pro Membership mein milega:</p>
                {['Unlimited AI Chat', 'Unlimited AI Video Lessons', 'Premium Avatars', 'All Courses Access'].map((feat) => (
                  <div key={feat} className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="text-sm text-theme-text-secondary">{feat}</span>
                  </div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="space-y-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleUpgrade}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-bold text-sm shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all flex items-center justify-center gap-2"
                >
                  <Crown className="w-4 h-4" />
                  Pro Membership Lo — Sirf ₹299
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
                <button
                  onClick={handleClose}
                  className="w-full py-2.5 rounded-xl text-theme-text-secondary text-sm hover:bg-theme-input transition-all"
                >
                  Baad mein dekhenge
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
