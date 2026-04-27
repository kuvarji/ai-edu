import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { BookOpen, ArrowRight, Search, Sparkles, GraduationCap } from 'lucide-react';
import { coursesApi, type Course } from '../services/api';
import { useStore } from '../store/useStore';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5 },
  }),
};

const bannerGradients = [
  'linear-gradient(135deg, #06b6d4, #67e8f9, #a5f3fc)',
  'linear-gradient(135deg, #6366f1, #818cf8, #a5b4fc)',
  'linear-gradient(135deg, #f43f5e, #fb7185, #fda4af)',
  'linear-gradient(135deg, #10b981, #34d399, #6ee7b7)',
  'linear-gradient(135deg, #f97316, #fb923c, #fdba74)',
  'linear-gradient(135deg, #6366f1, #818cf8, #a5b4fc)',
];
const fillGradients = [
  'linear-gradient(90deg, #06b6d4, #67e8f9)',
  'linear-gradient(90deg, #6366f1, #a5b4fc)',
  'linear-gradient(90deg, #f43f5e, #fda4af)',
  'linear-gradient(90deg, #10b981, #6ee7b7)',
  'linear-gradient(90deg, #f97316, #fdba74)',
  'linear-gradient(90deg, #6366f1, #a5b4fc)',
];

export default function CoursesPage() {
  const user = useStore((s) => s.user);
  const userGrade = user?.grade ? parseInt(user.grade, 10) : null;
  const userBoard = user?.board || null;
  const hasClassInfo = userGrade !== null && !isNaN(userGrade);

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [showMyClass, setShowMyClass] = useState(hasClassInfo);
  const [apiCourses, setApiCourses] = useState<Course[]>([]);
  const [courseProgress, setCourseProgress] = useState<Record<string, { completed: number; total: number }>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (hasClassInfo) setShowMyClass(true);
  }, [hasClassInfo]);

  useEffect(() => {
    let cancelled = false;
    const fetchCourses = async () => {
      try {
        const params: { grade?: number; board?: string } = {};
        if (showMyClass && hasClassInfo) {
          params.grade = userGrade!;
          if (userBoard) params.board = userBoard;
        }
        const [coursesRes, progressRes] = await Promise.allSettled([
          coursesApi.getAll(params),
          coursesApi.getMyProgress(),
        ]);
        if (!cancelled) {
          if (coursesRes.status === 'fulfilled') setApiCourses(coursesRes.value.courses);
          if (progressRes.status === 'fulfilled') {
            const progMap: Record<string, { completed: number; total: number }> = {};
            const progData = (progressRes.value as unknown as { progress: Array<{ course: { id: string }; completed_chapters: number; total_chapters: number }> }).progress;
            if (progData) {
              for (const p of progData) {
                progMap[p.course.id] = { completed: p.completed_chapters, total: p.total_chapters };
              }
            }
            setCourseProgress(progMap);
          }
        }
      } catch {
        // show empty state
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    setLoading(true);
    fetchCourses();
    return () => { cancelled = true; };
  }, [showMyClass, userGrade, userBoard, hasClassInfo]);

  const courses = apiCourses.map((c) => {
    const prog = courseProgress[c.id];
    return {
      id: c.id, title: c.title, subject: c.subject,
      grade: `Class ${c.grade}`, board: c.board,
      chapters: prog?.total ?? 0, completedChapters: prog?.completed ?? 0,
      color: c.color || 'from-indigo-500 to-violet-500',
      icon: c.icon || '\ud83d\udcda', description: c.description || '',
    };
  });

  const filtered = courses.filter((c) => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase());
    if (filter === 'all') return matchesSearch;
    if (filter === 'progress') return matchesSearch && c.completedChapters > 0;
    if (filter === 'new') return matchesSearch && c.completedChapters === 0;
    return matchesSearch;
  });

  const totalChaptersDone = courses.reduce((s, c) => s + c.completedChapters, 0);

  /* Skeleton */
  const CourseCardSkeleton = () => (
    <div className="rounded-[22px] overflow-hidden bg-theme-card border border-theme-border">
      <div className="h-[100px] bg-[var(--color-surface)] animate-pulse" />
      <div className="p-[18px_22px]">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-[22px] w-24 bg-[var(--color-surface)] animate-pulse rounded-md" />
          <div className="h-4 w-16 bg-[var(--color-surface)] animate-pulse rounded" />
        </div>
        <div className="flex items-center gap-2.5 mb-3">
          <div className="flex-1 h-[7px] bg-[var(--color-surface)] animate-pulse rounded-full" />
          <div className="h-4 w-8 bg-[var(--color-surface)] animate-pulse rounded" />
        </div>
        <div className="flex gap-2">
          <div className="flex-1 h-10 bg-[var(--color-surface)] animate-pulse rounded-xl" />
          <div className="flex-1 h-10 bg-[var(--color-surface)] animate-pulse rounded-xl" />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-theme-page transition-colors duration-300 pt-20 pb-12 px-4 sm:px-6 lg:px-10 blob-bg">
        <div className="max-w-[1400px] mx-auto relative z-10">
          <div className="mb-6">
            <div className="h-8 w-48 bg-[var(--color-surface)] animate-pulse rounded-lg mb-2" />
            <div className="h-5 w-72 bg-[var(--color-surface)] animate-pulse rounded-lg" />
          </div>
          {/* Stats row skeleton */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-6">
            {[1,2,3,4].map(i => (
              <div key={i} className="p-[18px] rounded-[18px] bg-theme-card border border-theme-border text-center">
                <div className="h-7 w-7 mx-auto bg-[var(--color-surface)] animate-pulse rounded mb-2" />
                <div className="h-7 w-12 mx-auto bg-[var(--color-surface)] animate-pulse rounded mb-1" />
                <div className="h-3 w-20 mx-auto bg-[var(--color-surface)] animate-pulse rounded" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {[1,2,3,4,5,6].map(i => <CourseCardSkeleton key={i} />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-theme-page transition-colors duration-300 pt-20 pb-12 px-4 sm:px-6 lg:px-10 blob-bg">
      <div className="max-w-[1400px] mx-auto relative z-10">

        {/* Page Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex flex-col sm:flex-row justify-between sm:items-end gap-3">
          <div>
            <h1 className="font-['Space_Grotesk'] text-[28px] font-extrabold text-theme-text mb-1">{'\ud83d\udcda'} My Courses</h1>
            <p className="text-sm text-theme-text-muted">
              {showMyClass && hasClassInfo
                ? `Class ${userGrade}${userBoard ? ` \u2022 ${userBoard}` : ''} \u2014 apne subjects padho AI ke saath!`
                : 'Class 6-12 ke saare subjects ek jagah'}
            </p>
          </div>
        </motion.div>

        {/* Stats Row */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 lg:gap-6 mb-8">
          {[
            { emoji: '\ud83d\udcd6', val: String(courses.length), label: 'Active Courses' },
            { emoji: '\u2705', val: String(totalChaptersDone), label: 'Chapters Done' },
            { emoji: '\u23f1', val: '0h', label: 'Study Time' },
            { emoji: '\ud83c\udfc6', val: '0%', label: 'Avg Score' },
          ].map((s, i) => (
            <motion.div key={i} whileHover={{ y: -3 }}
              className="p-[18px] rounded-[18px] bg-theme-card border border-theme-border text-center hover:shadow-md transition-all cursor-default">
              <span className="text-[28px] block mb-2">{s.emoji}</span>
              <div className="font-['Space_Grotesk'] text-[26px] font-extrabold text-theme-text">{s.val}</div>
              <div className="text-[11px] font-semibold text-theme-text-muted mt-0.5">{s.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Filter Tabs */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-2 mb-6 items-center">
          <div className="flex gap-1.5 p-1.5 rounded-[14px] bg-theme-card border border-theme-border">
            {[
              { key: 'all', label: 'All Subjects' },
              { key: 'progress', label: 'In Progress' },
              { key: 'new', label: 'Not Started' },
            ].map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)}
                className={`px-[18px] py-2 rounded-[10px] text-[13px] font-bold transition-all ${
                  filter === f.key
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                    : 'text-theme-text-muted hover:text-theme-text-secondary hover:bg-indigo-50 dark:hover:bg-indigo-900/20'
                }`}>
                {f.label}
              </button>
            ))}
          </div>
          {hasClassInfo && (
            <button onClick={() => setShowMyClass(!showMyClass)}
              className={`px-3.5 py-2 rounded-[10px] text-[13px] font-bold flex items-center gap-1.5 transition-all border ${
                showMyClass
                  ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-700'
                  : 'bg-theme-card text-theme-text-muted border-theme-border hover:bg-theme-input'
              }`}>
              <GraduationCap className="w-4 h-4" />
              {showMyClass ? `Class ${userGrade}` : 'My Class'}
            </button>
          )}
        </motion.div>

        {/* Search */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-text-muted" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search courses..."
            className="w-full sm:w-80 pl-10 pr-4 py-2.5 rounded-xl bg-theme-card border border-theme-border text-sm text-theme-text placeholder-theme-text-muted focus:outline-none focus:border-indigo-400 transition-all" />
        </motion.div>

        {/* Courses Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <Sparkles className="w-10 h-10 text-theme-text-muted mx-auto mb-3" />
            <p className="text-theme-text-secondary text-sm">No courses found. Try changing filters!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {filtered.map((course, i) => {
              const pct = course.chapters > 0 ? Math.round((course.completedChapters / course.chapters) * 100) : 0;
              return (
                <motion.div key={course.id} variants={fadeUp} initial="hidden" animate="visible" custom={i}
                  whileHover={{ y: -6 }}
                  className="rounded-[22px] overflow-hidden bg-theme-card border border-theme-border shadow-sm hover:shadow-lg transition-all cursor-pointer relative">
                  {course.completedChapters === 0 && (
                    <span className="absolute top-3 right-3 z-[2] px-2.5 py-1 rounded-lg text-[10px] font-bold text-indigo-600 bg-white/90 dark:bg-indigo-900/80 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-700" style={{ backdropFilter: 'blur(4px)' }}>
                      NEW
                    </span>
                  )}
                  <Link to={`/courses/${course.id}`}>
                    {/* Banner */}
                    <div className="h-[100px] relative overflow-hidden flex items-center justify-between px-[22px]"
                      style={{ background: bannerGradients[i % bannerGradients.length] }}>
                      <div className="relative z-[1]">
                        <div className="text-lg font-extrabold text-white" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.15)' }}>{course.title}</div>
                        <div className="text-[11px] text-white/85 font-semibold mt-0.5">{course.subject}</div>
                      </div>
                      <span className="text-[42px] relative z-[1]" style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.1))' }}>{course.icon}</span>
                      <div className="absolute right-[-20px] bottom-[-20px] w-[100px] h-[100px] rounded-full bg-white/10" />
                      <div className="absolute right-10 top-[-30px] w-[70px] h-[70px] rounded-full bg-white/[0.08]" />
                    </div>
                    {/* Body */}
                    <div className="p-[18px_22px]">
                      <div className="flex items-center gap-2 mb-3 text-xs text-theme-text-muted font-semibold">
                        <span className="px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold text-[11px]">{course.chapters} Chapters</span>
                        <span>{'\u2022'} {course.completedChapters} completed</span>
                      </div>
                      <div className="flex items-center gap-2.5 mb-3">
                        <div className="flex-1 h-[7px] rounded-full overflow-hidden" style={{ background: 'var(--color-surface)' }}>
                          <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, delay: 0.2 + i * 0.05 }}
                            className="h-full rounded-full" style={{ background: fillGradients[i % fillGradients.length] }} />
                        </div>
                        <span className="text-xs font-extrabold text-theme-text min-w-[32px] text-right">{pct}%</span>
                      </div>
                      <div className="flex gap-2">
                        <button className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 shadow-md shadow-indigo-500/20 hover:bg-indigo-700 transition-all flex items-center justify-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5" /> Continue
                        </button>
                        <button className="flex-1 py-2.5 rounded-xl text-xs font-bold text-indigo-600 bg-indigo-100 dark:bg-indigo-900/20 hover:bg-indigo-200 dark:hover:bg-indigo-900/30 transition-all flex items-center justify-center gap-1.5">
                          Details <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
