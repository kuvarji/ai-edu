import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, BookOpen, DollarSign, TrendingUp, PlusCircle,
  Search, Eye, Edit3, Trash2, Upload, X, AlertTriangle,
  ArrowUpRight, ArrowDownRight,
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { adminApi, coursesApi, type PlatformStats, type AdminUser, type Course } from '../services/api';
import { useStore } from '../store/useStore';

export default function AdminDashboard() {
  const user = useStore((s) => s.user);
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null);
  const [apiUsers, setApiUsers] = useState<AdminUser[]>([]);
  const [apiCourses, setApiCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(false);

  // Modal states
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [showUploadSyllabus, setShowUploadSyllabus] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Add Course form
  const [courseForm, setCourseForm] = useState({
    title: '', subject: '', grade: 10, board: 'CBSE', icon: '', color: 'violet', description: '',
  });
  const [courseSubmitting, setCourseSubmitting] = useState(false);

  // Upload Syllabus (Add Chapters) form
  const [chapterForm, setChapterForm] = useState({
    course_id: '', title: '', content: '', video_url: '', order: 1,
  });
  const [chapterSubmitting, setChapterSubmitting] = useState(false);
  const [addedChapters, setAddedChapters] = useState<{ title: string; order: number }[]>([]);

  // Search
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, usersRes, coursesRes] = await Promise.allSettled([
        adminApi.getStats(),
        adminApi.getUsers({ limit: 10 }),
        coursesApi.getAll(),
      ]);
      if (statsRes.status === 'fulfilled') setPlatformStats(statsRes.value);
      if (statsRes.status === 'rejected' && String(statsRes.reason).includes('403')) setAuthError(true);
      if (usersRes.status === 'fulfilled') setApiUsers(usersRes.value.users);
      if (usersRes.status === 'rejected' && String(usersRes.reason).includes('403')) setAuthError(true);
      if (coursesRes.status === 'fulfilled') setApiCourses(coursesRes.value.courses);
    } catch {
      // errors handled above
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-clear success/error messages
  useEffect(() => {
    if (successMsg) {
      const t = setTimeout(() => setSuccessMsg(''), 4000);
      return () => clearTimeout(t);
    }
  }, [successMsg]);
  useEffect(() => {
    if (errorMsg) {
      const t = setTimeout(() => setErrorMsg(''), 5000);
      return () => clearTimeout(t);
    }
  }, [errorMsg]);

  // Add Course handler
  const handleAddCourse = async () => {
    if (!courseForm.title.trim() || !courseForm.subject.trim()) {
      setErrorMsg('Course title aur subject required hain.');
      return;
    }
    setCourseSubmitting(true);
    try {
      const res = await adminApi.createCourse({
        title: courseForm.title.trim(),
        subject: courseForm.subject.trim(),
        grade: courseForm.grade,
        board: courseForm.board,
        icon: courseForm.icon || undefined,
        color: courseForm.color || undefined,
        description: courseForm.description.trim() || undefined,
      });
      setSuccessMsg(res.message || 'Course created!');
      setShowAddCourse(false);
      setCourseForm({ title: '', subject: '', grade: 10, board: 'CBSE', icon: '', color: 'violet', description: '' });
      fetchData();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Course create karne mein error aaya.');
    } finally {
      setCourseSubmitting(false);
    }
  };

  // Delete Course handler
  const handleDeleteCourse = async (courseId: string, title: string) => {
    if (!confirm(`"${title}" course delete karna hai? Related chapters bhi delete honge.`)) return;
    try {
      const res = await adminApi.deleteCourse(courseId);
      setSuccessMsg(res.message || 'Course deleted!');
      fetchData();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Course delete nahi ho paya.');
    }
  };

  // Add Chapter handler
  const handleAddChapter = async () => {
    if (!chapterForm.course_id || !chapterForm.title.trim()) {
      setErrorMsg('Course select karo aur chapter title daalo.');
      return;
    }
    setChapterSubmitting(true);
    try {
      const res = await adminApi.createChapter({
        course_id: chapterForm.course_id,
        title: chapterForm.title.trim(),
        content: chapterForm.content.trim() || undefined,
        video_url: chapterForm.video_url.trim() || undefined,
        order: chapterForm.order,
      });
      setSuccessMsg(res.message || 'Chapter added!');
      setAddedChapters((prev) => [...prev, { title: chapterForm.title.trim(), order: chapterForm.order }]);
      setChapterForm((prev) => ({ ...prev, title: '', content: '', video_url: '', order: prev.order + 1 }));
      fetchData();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Chapter add nahi ho paya.');
    } finally {
      setChapterSubmitting(false);
    }
  };

  const ps = platformStats?.stats;
  const courses = apiCourses.map((c) => ({
    id: c.id,
    title: c.title,
    subject: c.subject,
    icon: c.icon || '\ud83d\udcda',
    color: c.color || 'from-violet-500 to-purple-600',
  }));

  const filteredUsers = apiUsers.filter((u) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  const displayUsers = filteredUsers.map((u) => ({
    name: u.name,
    email: u.email,
    role: u.role,
    plan: u.subscription || 'free',
    status: 'active' as const,
    joined: u.created_at ? new Date(u.created_at).toLocaleDateString() : 'Recently',
  }));

  const stats = [
    { label: 'Total Users', value: ps ? ps.users.total.toLocaleString() : '0', change: '', up: true, icon: Users, color: 'from-violet-500 to-purple-600' },
    { label: 'Active Courses', value: ps ? String(ps.content.total_courses) : String(apiCourses.length), change: '', up: true, icon: BookOpen, color: 'from-emerald-500 to-teal-600' },
    { label: 'Revenue (Monthly)', value: ps ? `\u20b9${(ps.revenue.estimated_monthly_revenue / 100000).toFixed(1)}L` : '\u20b90', change: '', up: true, icon: DollarSign, color: 'from-amber-500 to-orange-600' },
    { label: 'Conversion Rate', value: ps ? `${(((ps.revenue.pro_users + ps.revenue.premium_users) / (ps.users.total || 1)) * 100).toFixed(1)}%` : '0%', change: '', up: true, icon: TrendingUp, color: 'from-cyan-500 to-blue-600' },
  ];

  // Auth check - show error if not admin
  if (!loading && authError && user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-theme-page transition-colors duration-300 pt-20 pb-12 px-4 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertTriangle className="w-16 h-16 text-amber-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Admin Access Required</h2>
          <p className="text-theme-text-secondary mb-6">
            Admin dashboard access karne ke liye admin account se login karo.
            <br /><br />
            <span className="text-theme-text-muted text-sm">Admin login: admin@aiedu.com</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-theme-page transition-colors duration-300 pt-20 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Toast Messages */}
        <AnimatePresence>
          {successMsg && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="fixed top-24 right-6 z-50 px-5 py-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-medium text-sm flex items-center gap-2 shadow-lg">
              {successMsg}
              <button onClick={() => setSuccessMsg('')} className="ml-2 text-emerald-300 hover:text-white"><X className="w-4 h-4" /></button>
            </motion.div>
          )}
          {errorMsg && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="fixed top-24 right-6 z-50 px-5 py-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 font-medium text-sm flex items-center gap-2 shadow-lg">
              {errorMsg}
              <button onClick={() => setErrorMsg('')} className="ml-2 text-red-300 hover:text-white"><X className="w-4 h-4" /></button>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-white mb-1">Admin Dashboard</h1>
            <p className="text-theme-text-secondary">Platform ka overview aur management</p>
          </div>
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { setShowUploadSyllabus(true); setAddedChapters([]); setChapterForm({ course_id: '', title: '', content: '', video_url: '', order: 1 }); }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-300 bg-theme-input border border-theme-border hover:bg-theme-card-hover transition-all"
            >
              <Upload className="w-4 h-4" /> Upload Syllabus
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAddCourse(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-violet-500 to-purple-600 shadow-lg shadow-violet-500/25"
            >
              <PlusCircle className="w-4 h-4" /> Add Course
            </motion.button>
          </div>
        </motion.div>

        {loading && (
          <div className="text-center py-12 mb-8">
            <div className="animate-spin w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full mx-auto mb-3" />
            <p className="text-theme-text-secondary">Loading dashboard data...</p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -5 }}
                className="p-5 rounded-2xl bg-theme-card border border-theme-border"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <span className={`flex items-center gap-1 text-xs font-bold ${stat.up ? 'text-emerald-400' : 'text-red-400'}`}>
                    {stat.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {stat.change}
                  </span>
                </div>
                <p className="text-2xl font-black text-white">{stat.value}</p>
                <p className="text-sm text-theme-text-muted">{stat.label}</p>
              </motion.div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Revenue Chart */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 p-6 rounded-2xl bg-theme-card border border-theme-border"
          >
            <h3 className="text-lg font-bold text-white mb-1">Revenue Overview</h3>
            <p className="text-sm text-theme-text-muted mb-6">Monthly revenue trend</p>
            {ps?.revenue ? <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={[]}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#4b5563" fontSize={12} />
                <YAxis stroke="#4b5563" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fill="url(#revGrad)" />
              </AreaChart>
            </ResponsiveContainer> : <div className="flex items-center justify-center h-[280px] text-theme-text-muted">No revenue data available yet</div>}
          </motion.div>

          {/* User Growth */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="p-6 rounded-2xl bg-theme-card border border-theme-border"
          >
            <h3 className="text-lg font-bold text-white mb-1">User Growth</h3>
            <p className="text-sm text-theme-text-muted mb-6">New users per month</p>
            {ps?.users ? <ResponsiveContainer width="100%" height={280}>
              <BarChart data={[]}>
                <XAxis dataKey="month" stroke="#4b5563" fontSize={12} />
                <YAxis stroke="#4b5563" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} />
                <Bar dataKey="users" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer> : <div className="flex items-center justify-center h-[280px] text-theme-text-muted">No user growth data yet</div>}
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Course Management */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="p-6 rounded-2xl bg-theme-card border border-theme-border"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-violet-400" /> Course Management
              </h3>
            </div>
            <div className="space-y-3">
              {courses.length === 0 && <p className="text-theme-text-muted text-sm text-center py-4">No courses added yet</p>}
              {courses.slice(0, 6).map((course, i) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.05 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-theme-input hover:bg-theme-card-hover transition-all"
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-lg">
                    {course.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-white">{course.title}</h4>
                    <p className="text-xs text-theme-text-muted">{course.subject}</p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => window.open(`/courses/${course.id}`, '_blank')}
                      className="p-1.5 rounded-lg text-theme-text-muted hover:text-blue-400 hover:bg-blue-500/10 transition-all"
                      title="View course"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 rounded-lg text-theme-text-muted hover:text-amber-400 hover:bg-amber-500/10 transition-all" title="Edit course">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCourse(course.id, course.title)}
                      className="p-1.5 rounded-lg text-theme-text-muted hover:text-red-400 hover:bg-red-500/10 transition-all"
                      title="Delete course"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Recent Users */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="p-6 rounded-2xl bg-theme-card border border-theme-border"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-cyan-400" /> Recent Users
              </h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-text-muted" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 rounded-lg bg-theme-input border border-theme-border text-white text-sm placeholder-gray-600 focus:outline-none focus:border-violet-500/50 w-40"
                />
              </div>
            </div>
            <div className="space-y-3">
              {displayUsers.length === 0 && <p className="text-theme-text-muted text-sm text-center py-4">No users registered yet</p>}
              {displayUsers.map((u, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + i * 0.05 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-theme-input hover:bg-theme-card-hover transition-all"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white">
                    {u.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-white">{u.name}</h4>
                    <p className="text-xs text-theme-text-muted">{u.email}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    u.role === 'admin' ? 'bg-red-500/20 text-red-400' :
                    u.role === 'parent' ? 'bg-cyan-500/20 text-cyan-400' :
                    'bg-violet-500/20 text-violet-400'
                  }`}>{u.role}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    u.plan === 'premium' ? 'bg-amber-500/20 text-amber-400' :
                    u.plan === 'pro' ? 'bg-violet-500/20 text-violet-400' :
                    'bg-gray-500/20 text-theme-text-secondary'
                  }`}>{u.plan}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ============ Add Course Modal ============ */}
      <AnimatePresence>
        {showAddCourse && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
            onClick={() => setShowAddCourse(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-lg bg-gray-900 border border-theme-border rounded-2xl p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <PlusCircle className="w-5 h-5 text-violet-400" /> Add New Course
                </h2>
                <button onClick={() => setShowAddCourse(false)} className="text-theme-text-muted hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-theme-text-secondary mb-1">Course Title *</label>
                  <input
                    type="text" placeholder="e.g. Mathematics" value={courseForm.title}
                    onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-theme-input border border-theme-border text-white placeholder-gray-600 focus:outline-none focus:border-violet-500/50"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-theme-text-secondary mb-1">Subject *</label>
                    <input
                      type="text" placeholder="e.g. math, science" value={courseForm.subject}
                      onChange={(e) => setCourseForm({ ...courseForm, subject: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-theme-input border border-theme-border text-white placeholder-gray-600 focus:outline-none focus:border-violet-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-theme-text-secondary mb-1">Grade (6-12)</label>
                    <select
                      value={courseForm.grade}
                      onChange={(e) => setCourseForm({ ...courseForm, grade: Number(e.target.value) })}
                      className="w-full px-4 py-2.5 rounded-xl bg-theme-input border border-theme-border text-white focus:outline-none focus:border-violet-500/50"
                    >
                      {[6, 7, 8, 9, 10, 11, 12].map((g) => (
                        <option key={g} value={g} className="bg-gray-900">Class {g}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-theme-text-secondary mb-1">Board</label>
                    <select
                      value={courseForm.board}
                      onChange={(e) => setCourseForm({ ...courseForm, board: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-theme-input border border-theme-border text-white focus:outline-none focus:border-violet-500/50"
                    >
                      {['CBSE', 'ICSE', 'State Board', 'Other'].map((b) => (
                        <option key={b} value={b} className="bg-gray-900">{b}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-theme-text-secondary mb-1">Icon (emoji)</label>
                    <input
                      type="text" placeholder="e.g. \ud83d\udcda" value={courseForm.icon}
                      onChange={(e) => setCourseForm({ ...courseForm, icon: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-theme-input border border-theme-border text-white placeholder-gray-600 focus:outline-none focus:border-violet-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-theme-text-secondary mb-1">Color</label>
                    <select
                      value={courseForm.color}
                      onChange={(e) => setCourseForm({ ...courseForm, color: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-theme-input border border-theme-border text-white focus:outline-none focus:border-violet-500/50"
                    >
                      {['violet', 'cyan', 'emerald', 'amber', 'rose', 'indigo', 'blue', 'red'].map((c) => (
                        <option key={c} value={c} className="bg-gray-900">{c}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-theme-text-secondary mb-1">Description</label>
                  <textarea
                    placeholder="Course ke baare mein likho..." value={courseForm.description}
                    onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-xl bg-theme-input border border-theme-border text-white placeholder-gray-600 focus:outline-none focus:border-violet-500/50 resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowAddCourse(false)} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-theme-text-secondary bg-theme-input border border-theme-border hover:bg-theme-card-hover transition-all">
                  Cancel
                </button>
                <button
                  onClick={handleAddCourse}
                  disabled={courseSubmitting}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-violet-500 to-purple-600 shadow-lg shadow-violet-500/25 disabled:opacity-50"
                >
                  {courseSubmitting ? 'Creating...' : 'Create Course'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============ Upload Syllabus (Add Chapters) Modal ============ */}
      <AnimatePresence>
        {showUploadSyllabus && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
            onClick={() => setShowUploadSyllabus(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-lg bg-gray-900 border border-theme-border rounded-2xl p-6 shadow-2xl max-h-[85vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Upload className="w-5 h-5 text-cyan-400" /> Upload Syllabus / Add Chapters
                </h2>
                <button onClick={() => setShowUploadSyllabus(false)} className="text-theme-text-muted hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-theme-text-secondary mb-1">Select Course *</label>
                  <select
                    value={chapterForm.course_id}
                    onChange={(e) => setChapterForm({ ...chapterForm, course_id: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-theme-input border border-theme-border text-white focus:outline-none focus:border-violet-500/50"
                  >
                    <option value="" className="bg-gray-900">-- Course select karo --</option>
                    {apiCourses.map((c) => (
                      <option key={c.id} value={c.id} className="bg-gray-900">{c.icon} {c.title} ({c.subject})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-theme-text-secondary mb-1">Chapter Title *</label>
                  <input
                    type="text" placeholder="e.g. Real Numbers" value={chapterForm.title}
                    onChange={(e) => setChapterForm({ ...chapterForm, title: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-theme-input border border-theme-border text-white placeholder-gray-600 focus:outline-none focus:border-violet-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-theme-text-secondary mb-1">Content / Notes</label>
                  <textarea
                    placeholder="Chapter ka content / notes likho..." value={chapterForm.content}
                    onChange={(e) => setChapterForm({ ...chapterForm, content: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2.5 rounded-xl bg-theme-input border border-theme-border text-white placeholder-gray-600 focus:outline-none focus:border-violet-500/50 resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-theme-text-secondary mb-1">Video URL</label>
                    <input
                      type="text" placeholder="https://youtube.com/..." value={chapterForm.video_url}
                      onChange={(e) => setChapterForm({ ...chapterForm, video_url: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-theme-input border border-theme-border text-white placeholder-gray-600 focus:outline-none focus:border-violet-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-theme-text-secondary mb-1">Order</label>
                    <input
                      type="number" min={1} value={chapterForm.order}
                      onChange={(e) => setChapterForm({ ...chapterForm, order: Number(e.target.value) })}
                      className="w-full px-4 py-2.5 rounded-xl bg-theme-input border border-theme-border text-white focus:outline-none focus:border-violet-500/50"
                    />
                  </div>
                </div>
              </div>

              {/* Added chapters list */}
              {addedChapters.length > 0 && (
                <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <p className="text-sm font-medium text-emerald-400 mb-2">Added Chapters ({addedChapters.length}):</p>
                  <div className="space-y-1">
                    {addedChapters.map((ch, i) => (
                      <p key={i} className="text-xs text-emerald-300">
                        {ch.order}. {ch.title}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowUploadSyllabus(false)} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-theme-text-secondary bg-theme-input border border-theme-border hover:bg-theme-card-hover transition-all">
                  {addedChapters.length > 0 ? 'Done' : 'Cancel'}
                </button>
                <button
                  onClick={handleAddChapter}
                  disabled={chapterSubmitting}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/25 disabled:opacity-50"
                >
                  {chapterSubmitting ? 'Adding...' : 'Add Chapter'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
