import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Edit3, Camera,
  Flame, Award, BookOpen, Star,
  CheckCircle, AlertTriangle, LogOut, Crown,
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { authApi, gamificationApi, type Badge as ApiBadge } from '../services/api';

export default function ProfilePage() {
  const { user, darkMode, toggleDarkMode, setUser, logout } = useStore();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [grade, setGrade] = useState(user?.grade || '');
  const [board, setBoard] = useState(user?.board || '');
  const [language, setLanguage] = useState(() => localStorage.getItem('app_language') || 'hindi');
  const [notifications, setNotifications] = useState(() => localStorage.getItem('app_notifications') !== 'false');
  const [saving, setSaving] = useState(false);
  const [apiBadges, setApiBadges] = useState<ApiBadge[]>([]);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync name/phone when user changes
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setGrade(user.grade || '');
      setBoard(user.board || '');
    }
  }, [user]);

  // Apply dark mode to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('app_darkMode', darkMode ? 'true' : 'false');
  }, [darkMode]);

  // Auto-dismiss toasts
  useEffect(() => {
    if (successMsg) {
      const t = setTimeout(() => setSuccessMsg(''), 3000);
      return () => clearTimeout(t);
    }
  }, [successMsg]);
  useEffect(() => {
    if (errorMsg) {
      const t = setTimeout(() => setErrorMsg(''), 4000);
      return () => clearTimeout(t);
    }
  }, [errorMsg]);

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const res = await gamificationApi.getMyBadges();
        setApiBadges(res.badges);
      } catch {
        // no badges available
      }
    };
    fetchBadges();
  }, []);

  const badges = apiBadges.map((b) => ({
    id: b.id,
    name: b.name,
    description: b.description,
    icon: b.icon || '\u2b50',
    unlocked: b.unlocked ?? true,
  }));

  const handleSave = async () => {
    if (!name.trim()) {
      setErrorMsg('Name cannot be empty.');
      return;
    }
    setSaving(true);
    try {
      await authApi.updateProfile({
        name: name.trim(),
        phone: phone.trim() || undefined,
        ...(user?.role === 'student' ? { grade: grade || undefined, board: board || undefined } : {}),
      });
      if (user) {
        setUser({
          ...user,
          name: name.trim(),
          phone: phone.trim() || undefined,
          ...(user.role === 'student' ? { grade: grade || undefined, board: board || undefined } : {}),
        });
      }
      setEditing(false);
      setSuccessMsg('Profile updated successfully!');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Profile update failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleDarkModeToggle = () => {
    toggleDarkMode();
    setSuccessMsg(darkMode ? 'Light mode enabled!' : 'Dark mode enabled!');
  };

  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang);
    localStorage.setItem('app_language', newLang);
    setSuccessMsg(`Language changed to ${newLang === 'hindi' ? 'Hindi' : newLang === 'english' ? 'English' : 'Hinglish'}!`);
  };

  const handleNotificationsToggle = () => {
    const newVal = !notifications;
    setNotifications(newVal);
    localStorage.setItem('app_notifications', newVal ? 'true' : 'false');
    setSuccessMsg(newVal ? 'Notifications enabled!' : 'Notifications disabled!');
  };

  const isPremium = user?.subscription === 'pro' || user?.subscription === 'premium';

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setErrorMsg('Photo size 2MB se kam honi chahiye.');
      return;
    }
    setUploadingPhoto(true);
    try {
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const img = new Image();
      const resized = await new Promise<string>((resolve, reject) => {
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxSize = 200;
          let w = img.width;
          let h = img.height;
          if (w > h) { h = (h / w) * maxSize; w = maxSize; }
          else { w = (w / h) * maxSize; h = maxSize; }
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.onerror = reject;
        img.src = base64;
      });
      await authApi.updateProfile({ avatar: resized });
      if (user) {
        setUser({ ...user, avatar: resized });
      }
      setSuccessMsg('Profile photo updated!');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Photo upload failed.');
    } finally {
      setUploadingPhoto(false);
      e.target.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-theme-page transition-colors duration-300 pt-20 pb-12 px-4 blob-bg">
      {/* Toast notifications */}
      <AnimatePresence>
        {successMsg && (
          <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }}
            className="fixed top-4 right-4 z-50 flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 text-white shadow-lg shadow-emerald-500/30">
            <CheckCircle className="w-5 h-5" /> {successMsg}
          </motion.div>
        )}
        {errorMsg && (
          <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }}
            className="fixed top-4 right-4 z-50 flex items-center gap-2 px-5 py-3 rounded-xl bg-red-600 text-white shadow-lg shadow-red-500/30">
            <AlertTriangle className="w-5 h-5" /> {errorMsg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-[1100px] mx-auto relative z-10">

        {/* Profile Header — matching mockup */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          className="p-8 rounded-[24px] mb-6 relative overflow-hidden flex flex-col sm:flex-row items-center gap-7"
          style={{ background: 'var(--section-gradient)', border: '1px solid var(--section-gradient-border)' }}>
          <div className="absolute -top-[60px] -right-[60px] w-[250px] h-[250px] rounded-full bg-indigo-300/10 dark:bg-indigo-400/5 blur-[40px]" />

          {/* Avatar Section */}
          <div className="relative z-[1] flex-shrink-0">
            <motion.div whileHover={{ scale: 1.05 }}
              className="w-[120px] h-[120px] rounded-[30px] overflow-hidden border-4 border-white dark:border-gray-700 shadow-xl cursor-pointer"
              onClick={() => fileInputRef.current?.click()}>
              {user?.avatar && user.avatar.startsWith('data:') ? (
                <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-5xl">
                  {user?.avatar || '\ud83e\udd81'}
                </div>
              )}
            </motion.div>
            <button onClick={() => fileInputRef.current?.click()} disabled={uploadingPhoto}
              className="absolute -bottom-1 -right-1 w-9 h-9 rounded-xl bg-indigo-600 text-white border-[3px] border-white dark:border-gray-800 flex items-center justify-center shadow-md disabled:opacity-50">
              {uploadingPhoto ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Camera className="w-4 h-4" />}
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
          </div>

          {/* Profile Info */}
          <div className="relative z-[1] flex-1 text-center sm:text-left">
            <h1 className="font-['Space_Grotesk'] text-[26px] font-extrabold text-theme-text mb-1">{user?.name || 'Student'}</h1>
            <p className="text-[13px] text-theme-text-secondary mb-3">
              {user?.email || 'student@eduai.com'}
              {user?.phone ? ` \u2022 ${user.phone}` : ''}
            </p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              {isPremium && (
                <span className="inline-flex items-center gap-1 px-3 py-[5px] rounded-lg text-[11px] font-bold"
                  style={{ background: 'var(--membership-bg)', color: 'var(--membership-badge-text)' }}>
                  <Crown className="w-3 h-3" /> Pro Member
                </span>
              )}
              <span className="inline-flex items-center gap-1 px-3 py-[5px] rounded-lg text-[11px] font-bold bg-amber-50 dark:bg-amber-900/20 text-orange-500">
                <Flame className="w-3 h-3" /> {user?.streak ?? 0} Day Streak
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-[5px] rounded-lg text-[11px] font-bold bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400">
                <Star className="w-3 h-3" /> Level {user?.level ?? 1}
              </span>
              {user?.board && user?.grade && (
                <span className="inline-flex items-center gap-1 px-3 py-[5px] rounded-lg text-[11px] font-bold bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                  <BookOpen className="w-3 h-3" /> {user.board} \u2022 Class {user.grade}
                </span>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="relative z-[1] flex gap-5 sm:gap-6 flex-shrink-0">
            <div className="text-center">
              <div className="font-['Space_Grotesk'] text-[24px] font-extrabold text-theme-text">
                {isPremium ? '\u221e' : (user?.xp ?? 0).toLocaleString()}
              </div>
              <div className="text-[11px] font-semibold text-theme-text-muted">Total XP</div>
            </div>
            <div className="text-center">
              <div className="font-['Space_Grotesk'] text-[24px] font-extrabold text-theme-text">
                {user?.level ?? 1}
              </div>
              <div className="text-[11px] font-semibold text-theme-text-muted">Level</div>
            </div>
            <div className="text-center">
              <div className="font-['Space_Grotesk'] text-[24px] font-extrabold text-theme-text">
                {user?.streak ?? 0}
              </div>
              <div className="text-[11px] font-semibold text-theme-text-muted">Streak</div>
            </div>
          </div>

          {/* Edit button */}
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => setEditing(!editing)}
            className="absolute top-6 right-6 z-[2] p-2.5 rounded-xl bg-white/80 dark:bg-gray-800/60 border border-theme-border text-theme-text-secondary hover:text-theme-text transition-all backdrop-blur-sm">
            <Edit3 className="w-4 h-4" />
          </motion.button>
        </motion.div>

        {/* 2-Column Grid — matching mockup */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Left Column */}
          <div className="flex flex-col gap-4">
            {/* Personal Info Card */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
              className="p-6 rounded-[22px] bg-theme-card border border-theme-border shadow-sm">
              <h3 className="text-[16px] font-extrabold text-theme-text mb-[18px] flex items-center gap-2">
                {'\ud83d\udc64'} Personal Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-[12px] font-bold text-theme-text-muted mb-1.5 block">Full Name</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} disabled={!editing}
                    className="w-full px-4 py-3 rounded-xl bg-theme-input border border-theme-border text-theme-text text-sm disabled:opacity-60 focus:outline-none focus:border-indigo-400 transition-all" />
                </div>
                <div>
                  <label className="text-[12px] font-bold text-theme-text-muted mb-1.5 block">Email</label>
                  <input type="email" value={user?.email || ''} disabled
                    className="w-full px-4 py-3 rounded-xl bg-theme-input border border-theme-border text-theme-text text-sm opacity-60" />
                </div>
                <div>
                  <label className="text-[12px] font-bold text-theme-text-muted mb-1.5 block">Phone Number</label>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 9876543210" disabled={!editing}
                    className="w-full px-4 py-3 rounded-xl bg-theme-input border border-theme-border text-theme-text text-sm disabled:opacity-60 focus:outline-none focus:border-indigo-400 transition-all" />
                </div>
                {user?.role === 'student' && (
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="text-[12px] font-bold text-theme-text-muted mb-1.5 block">Class</label>
                      <select value={grade} onChange={(e) => setGrade(e.target.value)} disabled={!editing}
                        className="w-full px-4 py-3 rounded-xl bg-theme-input border border-theme-border text-theme-text text-sm disabled:opacity-60 focus:outline-none focus:border-indigo-400 transition-all appearance-none">
                        <option value="">Select Class</option>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((g) => (
                          <option key={g} value={String(g)}>Class {g}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="text-[12px] font-bold text-theme-text-muted mb-1.5 block">Board</label>
                      <select value={board} onChange={(e) => setBoard(e.target.value)} disabled={!editing}
                        className="w-full px-4 py-3 rounded-xl bg-theme-input border border-theme-border text-theme-text text-sm disabled:opacity-60 focus:outline-none focus:border-indigo-400 transition-all appearance-none">
                        <option value="">Select Board</option>
                        <option value="CBSE">CBSE</option>
                        <option value="ICSE">ICSE</option>
                        <option value="State Board">State Board</option>
                      </select>
                    </div>
                  </div>
                )}
                {editing && (
                  <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}
                    onClick={handleSave} disabled={saving}
                    className="w-full py-3.5 rounded-[14px] font-bold text-white bg-indigo-600 shadow-lg shadow-indigo-500/25 disabled:opacity-60 mt-2 text-sm">
                    {saving ? 'Saving...' : '\ud83d\udcbe Save Changes'}
                  </motion.button>
                )}
              </div>
            </motion.div>

            {/* Preferences Card */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}
              className="p-6 rounded-[22px] bg-theme-card border border-theme-border shadow-sm">
              <h3 className="text-[16px] font-extrabold text-theme-text mb-[18px] flex items-center gap-2">
                {'\u2699\ufe0f'} Preferences
              </h3>
              <div className="divide-y divide-[rgba(0,0,0,0.03)] dark:divide-white/5">
                {/* Dark Mode */}
                <div className="flex items-center justify-between py-3">
                  <div>
                    <div className="text-[13px] font-semibold text-theme-text-secondary">Dark Mode</div>
                    <div className="text-[11px] text-theme-text-muted mt-0.5">Switch to dark theme</div>
                  </div>
                  <button onClick={handleDarkModeToggle}
                    className={`w-11 h-6 rounded-full transition-all ${darkMode ? 'bg-indigo-600' : 'bg-[var(--toggle-off)]'}`}>
                    <motion.div animate={{ x: darkMode ? 22 : 2 }} className="w-5 h-5 rounded-full bg-white shadow-sm" />
                  </button>
                </div>
                {/* Notifications */}
                <div className="flex items-center justify-between py-3">
                  <div>
                    <div className="text-[13px] font-semibold text-theme-text-secondary">Notifications</div>
                    <div className="text-[11px] text-theme-text-muted mt-0.5">Push notifications for goals & streaks</div>
                  </div>
                  <button onClick={handleNotificationsToggle}
                    className={`w-11 h-6 rounded-full transition-all ${notifications ? 'bg-indigo-600' : 'bg-[var(--toggle-off)]'}`}>
                    <motion.div animate={{ x: notifications ? 22 : 2 }} className="w-5 h-5 rounded-full bg-white shadow-sm" />
                  </button>
                </div>
                {/* Language */}
                <div className="flex items-center justify-between py-3">
                  <div>
                    <div className="text-[13px] font-semibold text-theme-text-secondary">Language</div>
                    <div className="text-[11px] text-theme-text-muted mt-0.5">Choose app language</div>
                  </div>
                  <select value={language} onChange={(e) => handleLanguageChange(e.target.value)}
                    className="bg-theme-surface text-theme-text text-sm rounded-lg px-3 py-1.5 border border-theme-border focus:outline-none">
                    <option value="hindi">Hindi</option>
                    <option value="english">English</option>
                    <option value="hinglish">Hinglish</option>
                  </select>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-4">
            {/* XP Card — gradient */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
              className="p-6 rounded-[22px] text-white relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent2))' }}>
              <div className="absolute -right-[30px] -top-[30px] w-[120px] h-[120px] rounded-full bg-white/[0.08]" />
              <div className="text-[14px] font-bold opacity-[0.85] mb-2">{'\u26a1'} Experience Points</div>
              <div className="font-['Space_Grotesk'] text-[36px] font-extrabold relative z-[1] mb-1">
                {isPremium ? '\u221e Unlimited' : (user?.xp ?? 0).toLocaleString()}
              </div>
              <div className="text-[12px] opacity-70">Level {user?.level ?? 1} \u2022 Keep learning to earn more!</div>
              {!isPremium && (
                <div className="mt-3.5">
                  <div className="flex justify-between text-[11px] font-semibold opacity-80 mb-1">
                    <span>Progress to Level {(user?.level ?? 1) + 1}</span>
                    <span>{Math.min(100, Math.round(((user?.xp ?? 0) % 500) / 5))}%</span>
                  </div>
                  <div className="h-2 rounded-lg bg-white/20 overflow-hidden">
                    <div className="h-full rounded-lg bg-white/80" style={{ width: `${Math.min(100, Math.round(((user?.xp ?? 0) % 500) / 5))}%` }} />
                  </div>
                </div>
              )}
            </motion.div>

            {/* Membership Card */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
              className="p-6 rounded-[22px] relative overflow-hidden"
              style={{ background: 'var(--membership-bg)', border: '1px solid var(--membership-border)' }}>
              <div className="absolute -right-5 -bottom-5 w-[100px] h-[100px] rounded-full bg-amber-500/10" />
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold mb-2.5"
                style={{ background: 'var(--membership-badge-bg)', color: 'var(--membership-badge-text)' }}>
                <Crown className="w-3 h-3" /> {isPremium ? 'Active' : 'Upgrade'}
              </span>
              <h3 className="text-[18px] font-extrabold mb-1" style={{ color: 'var(--membership-text)' }}>
                {isPremium ? 'Pro Member' : 'Go Pro!'}
              </h3>
              <p className="text-[13px] leading-relaxed mb-3.5" style={{ color: 'var(--membership-sub)' }}>
                {isPremium ? 'Unlimited AI features, no XP limits!' : 'Unlock unlimited AI Video Lessons, AI Chat & more.'}
              </p>
              <div className="flex flex-col gap-1.5 mb-3.5">
                {['\u2728 Unlimited AI Video Lessons', '\ud83e\udde0 Unlimited AI Chat', '\ud83d\udd25 Priority Support'].map((feat) => (
                  <div key={feat} className="flex items-center gap-2 text-[12px] font-semibold" style={{ color: 'var(--membership-badge-text)' }}>
                    {feat}
                  </div>
                ))}
              </div>
              {!isPremium && (
                <Link to="/membership">
                  <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}
                    className="w-full py-3 rounded-xl font-bold text-white text-sm"
                    style={{ background: 'var(--membership-badge-text)', boxShadow: '0 4px 12px rgba(146,64,14,0.25)' }}>
                    Upgrade to Pro — \u20b9299/month
                  </motion.button>
                </Link>
              )}
            </motion.div>

            {/* Badges Card */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
              className="p-6 rounded-[22px] bg-theme-card border border-theme-border shadow-sm">
              <h3 className="text-[16px] font-extrabold text-theme-text mb-[18px] flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                Badges ({badges.filter((b) => b.unlocked).length}/{badges.length})
              </h3>
              {badges.length > 0 ? (
                <div className="grid grid-cols-4 gap-2">
                  {badges.map((badge) => (
                    <motion.div key={badge.id} whileHover={{ scale: 1.1 }}
                      className={`text-center p-2.5 rounded-xl ${
                        badge.unlocked ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-theme-input opacity-40'
                      }`} title={badge.description}>
                      <span className="text-xl">{badge.icon}</span>
                      <p className="text-[11px] text-theme-text-secondary mt-1 truncate font-semibold">{badge.name}</p>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-theme-text-muted text-center py-4">Abhi koi badge nahi mila. Quizzes do aur badges unlock karo!</p>
              )}
            </motion.div>
          </div>
        </div>

        {/* Logout Button — matching mockup */}
        <motion.button initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
          onClick={() => { logout(); navigate('/login'); }}
          className="w-full mt-4 py-3.5 rounded-[14px] font-bold text-rose-500 text-sm flex items-center justify-center gap-2 transition-all"
          style={{ background: 'var(--logout-bg)', border: '1px solid var(--logout-border)' }}>
          <LogOut className="w-4 h-4" /> Logout
        </motion.button>
      </div>
    </div>
  );
}
