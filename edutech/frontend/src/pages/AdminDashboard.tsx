import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users, BookOpen, DollarSign, TrendingUp, PlusCircle,
  Search, Eye, Edit3, Trash2, Upload,
  ArrowUpRight, ArrowDownRight,
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { adminApi, coursesApi, type PlatformStats, type AdminUser, type Course } from '../services/api';

export default function AdminDashboard() {
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null);
  const [apiUsers, setApiUsers] = useState<AdminUser[]>([]);
  const [apiCourses, setApiCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, usersRes, coursesRes] = await Promise.allSettled([
          adminApi.getStats(),
          adminApi.getUsers({ limit: 5 }),
          coursesApi.getAll(),
        ]);
        if (statsRes.status === 'fulfilled') setPlatformStats(statsRes.value);
        if (usersRes.status === 'fulfilled') setApiUsers(usersRes.value.users);
        if (coursesRes.status === 'fulfilled') setApiCourses(coursesRes.value.courses);
      } catch {
        // fallback to mock
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const ps = platformStats?.stats;
  const courses = apiCourses.map((c) => ({
    id: c.id,
    title: c.title,
    icon: c.icon || '\ud83d\udcda',
    color: c.color || 'from-violet-500 to-purple-600',
    students: 0,
    chapters: 0,
  }));

  const displayUsers = apiUsers.map((u) => ({
    name: u.name,
    email: u.email,
    plan: u.subscription || 'Free',
    status: 'active' as const,
    joined: u.created_at ? new Date(u.created_at).toLocaleDateString() : 'Recently',
  }));

  const stats = [
    { label: 'Total Users', value: ps ? ps.users.total.toLocaleString() : '0', change: '', up: true, icon: Users, color: 'from-violet-500 to-purple-600' },
    { label: 'Active Courses', value: ps ? String(ps.content.total_courses) : String(apiCourses.length), change: '', up: true, icon: BookOpen, color: 'from-emerald-500 to-teal-600' },
    { label: 'Revenue (Monthly)', value: ps ? `₹${(ps.revenue.estimated_monthly_revenue / 100000).toFixed(1)}L` : '₹0', change: '', up: true, icon: DollarSign, color: 'from-amber-500 to-orange-600' },
    { label: 'Conversion Rate', value: ps ? `${(((ps.revenue.pro_users + ps.revenue.premium_users) / (ps.users.total || 1)) * 100).toFixed(1)}%` : '0%', change: '', up: true, icon: TrendingUp, color: 'from-cyan-500 to-blue-600' },
  ];

  return (
    <div className="min-h-screen bg-gray-950 pt-20 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-white mb-1">Admin Dashboard</h1>
            <p className="text-gray-400">Platform ka overview aur management</p>
          </div>
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-300 bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
            >
              <Upload className="w-4 h-4" /> Upload Syllabus
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-violet-500 to-purple-600 shadow-lg shadow-violet-500/25"
            >
              <PlusCircle className="w-4 h-4" /> Add Course
            </motion.button>
          </div>
        </motion.div>

        {loading && (
          <div className="text-center py-12 mb-8">
            <div className="animate-spin w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full mx-auto mb-3" />
            <p className="text-gray-400">Loading dashboard data...</p>
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
                className="p-5 rounded-2xl bg-gray-900/50 border border-white/5"
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
                <p className="text-sm text-gray-500">{stat.label}</p>
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
            className="lg:col-span-2 p-6 rounded-2xl bg-gray-900/50 border border-white/5"
          >
            <h3 className="text-lg font-bold text-white mb-1">Revenue Overview</h3>
            <p className="text-sm text-gray-500 mb-6">Monthly revenue trend</p>
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
            </ResponsiveContainer> : <div className="flex items-center justify-center h-[280px] text-gray-500">No revenue data available yet</div>}
          </motion.div>

          {/* User Growth */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="p-6 rounded-2xl bg-gray-900/50 border border-white/5"
          >
            <h3 className="text-lg font-bold text-white mb-1">User Growth</h3>
            <p className="text-sm text-gray-500 mb-6">New users per month</p>
            {ps?.users ? <ResponsiveContainer width="100%" height={280}>
              <BarChart data={[]}>
                <XAxis dataKey="month" stroke="#4b5563" fontSize={12} />
                <YAxis stroke="#4b5563" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} />
                <Bar dataKey="users" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer> : <div className="flex items-center justify-center h-[280px] text-gray-500">No user growth data yet</div>}
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Course Management */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="p-6 rounded-2xl bg-gray-900/50 border border-white/5"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-violet-400" /> Course Management
              </h3>
            </div>
            <div className="space-y-3">
              {courses.length === 0 && <p className="text-gray-500 text-sm text-center py-4">No courses added yet</p>}
              {courses.slice(0, 4).map((course, i) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.05 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all"
                >
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${course.color} flex items-center justify-center text-lg`}>
                    {course.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-white">{course.title}</h4>
                    <p className="text-xs text-gray-500">{course.students} students - {course.chapters} chapters</p>
                  </div>
                  <div className="flex gap-1">
                    <button className="p-1.5 rounded-lg text-gray-500 hover:text-blue-400 hover:bg-blue-500/10 transition-all">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 rounded-lg text-gray-500 hover:text-amber-400 hover:bg-amber-500/10 transition-all">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all">
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
            className="p-6 rounded-2xl bg-gray-900/50 border border-white/5"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-cyan-400" /> Recent Users
              </h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-9 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-violet-500/50 w-40"
                />
              </div>
            </div>
            <div className="space-y-3">
              {displayUsers.length === 0 && <p className="text-gray-500 text-sm text-center py-4">No users registered yet</p>}
              {displayUsers.map((u, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + i * 0.05 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white">
                    {u.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-white">{u.name}</h4>
                    <p className="text-xs text-gray-500">{u.email}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    u.plan === 'Premium' ? 'bg-amber-500/20 text-amber-400' :
                    u.plan === 'Pro' ? 'bg-violet-500/20 text-violet-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>{u.plan}</span>
                  <span className={`w-2 h-2 rounded-full ${u.status === 'active' ? 'bg-emerald-400' : 'bg-gray-600'}`} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
