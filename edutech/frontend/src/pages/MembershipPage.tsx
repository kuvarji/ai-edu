import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Crown, Check, Sparkles, Zap, Shield, BookOpen,
  MessageCircle, Award, Users, BarChart3, Loader2,
  Star, ArrowRight,
} from 'lucide-react';
import { paymentApi, type MembershipPlan, type MembershipStatus } from '../services/api';
import { useStore } from '../store/useStore';

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill: { name: string; email: string; contact: string };
  theme: { color: string };
  modal?: { ondismiss?: () => void };
}

interface RazorpayInstance {
  open: () => void;
}

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

const FEATURE_ICONS: Record<string, typeof Crown> = {
  'All Courses Access': BookOpen,
  'Advanced AI Tutor': Sparkles,
  'Unlimited Quizzes': Award,
  'Priority Support': Shield,
  'Premium Avatars': Star,
  'Parent Dashboard': Users,
  'Progress Reports': BarChart3,
  'Unlimited AI Chat': MessageCircle,
  'Unlimited AI Video Lessons': Zap,
};

export default function MembershipPage() {
  const navigate = useNavigate();
  const { user, setUser } = useStore();
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [membershipStatus, setMembershipStatus] = useState<MembershipStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [plansRes, statusRes] = await Promise.all([
          paymentApi.getPlans(),
          paymentApi.getStatus(),
        ]);
        setPlans(plansRes.plans);
        setMembershipStatus(statusRes);
      } catch {
        // Plans can be fetched without auth, status needs auth
        try {
          const plansRes = await paymentApi.getPlans();
          setPlans(plansRes.plans);
        } catch {
          setError('Plans load nahi ho paye. Please refresh karo.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePurchase = async (planId: string) => {
    if (!user) {
      navigate('/login');
      return;
    }

    setPurchasing(true);
    setError('');
    setSuccess('');

    try {
      // 1. Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setError('Razorpay load nahi ho paya. Please refresh karo.');
        setPurchasing(false);
        return;
      }

      // 2. Create order from backend
      const orderData = await paymentApi.createOrder(planId);

      // 3. Open Razorpay checkout
      const options: RazorpayOptions = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: orderData.name,
        description: orderData.description,
        order_id: orderData.order_id,
        handler: async (response: RazorpayResponse) => {
          try {
            // 4. Verify payment
            const verifyRes = await paymentApi.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            setSuccess(verifyRes.message);

            // Update user subscription in store
            if (user) {
              setUser({ ...user, subscription: 'pro' });
            }

            // Refresh membership status
            const statusRes = await paymentApi.getStatus();
            setMembershipStatus(statusRes);
          } catch (err) {
            const msg = err instanceof Error ? err.message : 'Payment verify nahi ho paya.';
            setError(msg);
          } finally {
            setPurchasing(false);
          }
        },
        prefill: orderData.prefill,
        theme: { color: '#6366f1' },
        modal: {
          ondismiss: () => {
            setPurchasing(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Order create nahi ho paya.';
      setError(msg);
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-theme-page transition-colors duration-300 pt-20 pb-10 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header skeleton */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-2xl bg-[var(--color-surface)] animate-pulse mb-4" />
            <div className="h-10 w-52 mx-auto bg-[var(--color-surface)] animate-pulse rounded-lg mb-3" />
            <div className="h-5 w-80 mx-auto bg-[var(--color-surface)] animate-pulse rounded-lg" />
          </div>
          {/* Plan card skeleton */}
          <div className="bg-theme-card border-2 border-indigo-500/30 rounded-2xl overflow-hidden">
            <div className="bg-[var(--color-surface)] animate-pulse p-6 h-36" />
            <div className="p-4 sm:p-6">
              <div className="h-4 w-48 bg-[var(--color-surface)] animate-pulse rounded-lg mb-4" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-theme-input/50 border border-theme-border">
                    <div className="w-8 h-8 rounded-lg bg-[var(--color-surface)] animate-pulse" />
                    <div className="h-4 w-32 bg-[var(--color-surface)] animate-pulse rounded-lg" />
                  </div>
                ))}
              </div>
              <div className="w-full h-14 bg-[var(--color-surface)] animate-pulse rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isPremium = membershipStatus?.is_premium;

  return (
    <div className="min-h-screen bg-theme-page transition-colors duration-300 pt-20 pb-10 px-4 blob-bg">
      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8 sm:mb-12">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="inline-block mb-4"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
              <Crown className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
          </motion.div>
          <h1 className="text-2xl sm:text-4xl font-bold text-theme-text mb-2 sm:mb-3">
            Pro Membership
          </h1>
          <p className="text-sm sm:text-lg text-theme-text-secondary max-w-xl mx-auto">
            Unlimited AI features, premium avatars, aur bahut kuch — sirf ₹299/month!
          </p>
        </motion.div>

        {/* Success Message */}
        {success && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mb-6 p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-center font-medium">
            {success}
          </motion.div>
        )}

        {/* Error Message */}
        {error && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mb-6 p-4 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 text-center font-medium">
            {error}
          </motion.div>
        )}

        {/* Already Premium Badge */}
        {isPremium && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-center">
            <Crown className="w-8 h-8 text-amber-400 mx-auto mb-2" />
            <h3 className="text-lg font-bold text-amber-400 mb-1">Pro Member Active!</h3>
            <p className="text-sm text-theme-text-secondary">
              Expires: {membershipStatus?.membership.expires_at ? new Date(membershipStatus.membership.expires_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}
            </p>
          </motion.div>
        )}

        {/* Plans */}
        {plans.map((plan) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-theme-card border-2 border-indigo-500/30 rounded-2xl overflow-hidden shadow-xl shadow-indigo-500/10"
          >
            {/* Plan Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-4 sm:p-6 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiLz48L3N2Zz4=')] opacity-50" />
              <div className="relative">
                <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold mb-3">
                  MOST POPULAR
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">{plan.name}</h2>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-3xl sm:text-5xl font-bold text-white">{plan.amount_display}</span>
                  <span className="text-white/70 text-sm sm:text-base">/ {plan.duration_days} days</span>
                </div>
              </div>
            </div>

            {/* Features Grid */}
            <div className="p-4 sm:p-6">
              <h3 className="text-sm font-semibold text-theme-text-muted uppercase tracking-wider mb-4">Sab kuch included hai:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                {plan.features.map((feature) => {
                  const Icon = FEATURE_ICONS[feature] || Check;
                  return (
                    <motion.div
                      key={feature}
                      whileHover={{ x: 4 }}
                      className="flex items-center gap-3 p-2.5 rounded-xl bg-theme-input/50 border border-theme-border"
                    >
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-indigo-400" />
                      </div>
                      <span className="text-sm text-theme-text font-medium">{feature}</span>
                    </motion.div>
                  );
                })}
              </div>

              {/* CTA Button */}
              {!isPremium ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handlePurchase(plan.id)}
                  disabled={purchasing}
                  className="w-full py-3.5 sm:py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-bold text-base sm:text-lg shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {purchasing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Crown className="w-5 h-5" />
                      Subscribe Now — {plan.amount_display}
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </motion.button>
              ) : (
                <div className="w-full py-3.5 sm:py-4 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-bold text-center text-base sm:text-lg flex items-center justify-center gap-2">
                  <Check className="w-5 h-5" />
                  Already Subscribed
                </div>
              )}
            </div>
          </motion.div>
        ))}

        {/* Free Plan Comparison */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-8 p-4 sm:p-6 rounded-2xl bg-theme-card border border-theme-border">
          <h3 className="text-lg font-bold text-theme-text mb-4 text-center">Free vs Pro</h3>
          <div className="space-y-3">
            {[
              { feature: 'AI Chat Messages', free: '5 XP per message', pro: 'Unlimited' },
              { feature: 'AI Video Lessons', free: '10 XP per lesson', pro: 'Unlimited' },
              { feature: 'Starting XP', free: '50 XP (signup bonus)', pro: 'Unlimited access' },
              { feature: 'Premium Avatars', free: 'XP se kharido', pro: 'Free unlock' },
              { feature: 'Quizzes', free: 'Limited', pro: 'Unlimited' },
              { feature: 'Parent Dashboard', free: 'Basic', pro: 'Full Access' },
            ].map((row) => (
              <div key={row.feature} className="flex items-center justify-between py-2 border-b border-theme-border last:border-0">
                <span className="text-sm text-theme-text-secondary">{row.feature}</span>
                <div className="flex gap-4 sm:gap-8">
                  <span className="text-xs sm:text-sm text-theme-text-muted w-24 sm:w-32 text-center">{row.free}</span>
                  <span className="text-xs sm:text-sm text-indigo-400 font-medium w-24 sm:w-32 text-center">{row.pro}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
