import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Star, Users, BookOpen, ArrowRight, Search, Filter, Sparkles } from 'lucide-react';
import { coursesApi, type Course } from '../services/api';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5 },
  }),
};

export default function CoursesPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [apiCourses, setApiCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await coursesApi.getAll();
        setApiCourses(res.courses);
      } catch {
        // show empty state
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const courses = apiCourses.map((c) => ({
    id: c.id,
    title: c.title,
    subject: c.subject,
    grade: `Class ${c.grade}`,
    board: c.board,
    chapters: 0,
    completedChapters: 0,
    color: c.color || 'from-violet-500 to-purple-600',
    icon: c.icon || '\ud83d\udcda',
    description: c.description || '',
    students: 0,
    rating: 0,
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 pt-20 pb-12 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-gray-400">Loading courses...</p>
        </div>
      </div>
    );
  }

  const filtered = courses.filter((c) => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase());
    if (filter === 'all') return matchesSearch;
    if (filter === 'progress') return matchesSearch && c.completedChapters > 0;
    if (filter === 'new') return matchesSearch && c.completedChapters === 0;
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-950 pt-20 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            Explore Courses
          </span>
          <h1 className="text-4xl font-black text-white mb-2">Courses</h1>
          <p className="text-gray-400">CBSE Class 6-12 ke saare subjects ek jagah</p>
        </motion.div>

        {/* Search & Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-4 mb-8"
        >
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search courses..."
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-900/50 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all"
            />
          </div>
          <div className="flex gap-2">
            {[
              { key: 'all', label: 'All' },
              { key: 'progress', label: 'In Progress' },
              { key: 'new', label: 'New' },
            ].map((f) => (
              <motion.button
                key={f.key}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilter(f.key)}
                className={`px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                  filter === f.key
                    ? 'bg-violet-500/20 text-violet-400 border border-violet-500/20'
                    : 'bg-gray-900/50 text-gray-400 border border-white/10 hover:bg-white/5'
                }`}
              >
                <Filter className="w-4 h-4" />
                {f.label}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((course, i) => (
            <motion.div
              key={course.id}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={i}
              whileHover={{ y: -8, scale: 1.02 }}
            >
              <Link to={`/courses/${course.id}`}>
                <div className="group p-6 rounded-2xl bg-gray-900/50 border border-white/5 hover:border-white/10 transition-all cursor-pointer h-full">
                  <div className={`w-full h-40 rounded-2xl bg-gradient-to-br ${course.color} flex items-center justify-center mb-5 shadow-lg group-hover:shadow-xl transition-shadow relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-black/10" />
                    <span className="text-6xl relative z-10">{course.icon}</span>
                    <div className="absolute top-3 right-3 px-2 py-1 rounded-lg bg-black/30 backdrop-blur-sm text-white text-xs font-medium">
                      {course.grade}
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-1 group-hover:text-violet-400 transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-gray-500 text-sm mb-4">{course.description}</p>

                  <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      {course.chapters} Chapters
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {course.students}
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-amber-400" />
                      {course.rating}
                    </span>
                  </div>

                  {course.completedChapters > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Progress</span>
                        <span className="text-violet-400 font-medium">
                          {Math.round((course.completedChapters / course.chapters) * 100)}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(course.completedChapters / course.chapters) * 100}%` }}
                          transition={{ duration: 0.8, delay: 0.3 + i * 0.1 }}
                          className={`h-full rounded-full bg-gradient-to-r ${course.color}`}
                        />
                      </div>
                    </div>
                  )}

                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-gray-500">{course.board}</span>
                    <span className="flex items-center gap-1 text-violet-400 text-sm font-medium group-hover:gap-2 transition-all">
                      Explore <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
