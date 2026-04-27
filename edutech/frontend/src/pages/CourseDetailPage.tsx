import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft, BookOpen, Clock, Lock, CheckCircle2, Play, Zap,
  Star, Users, Award, ChevronRight,
} from 'lucide-react';
import { coursesApi, type Course, type Chapter } from '../services/api';

export default function CourseDetailPage() {
  const { id } = useParams();
  const [apiCourse, setApiCourse] = useState<Course | null>(null);
  const [apiChapters, setApiChapters] = useState<Chapter[]>([]);
  const [progress, setProgress] = useState<{ completed: number; total: number; percentage: number }>({ completed: 0, total: 0, percentage: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        const [courseRes, chaptersRes] = await Promise.allSettled([
          coursesApi.getById(id),
          coursesApi.getChapters(id),
        ]);
        if (courseRes.status === 'fulfilled') setApiCourse(courseRes.value);
        if (chaptersRes.status === 'fulfilled') {
          setApiChapters(chaptersRes.value.chapters);
          // Extract progress from chapters response
          const prog = (chaptersRes.value as unknown as { progress?: { completed: number; total: number; percentage: number } }).progress;
          if (prog) setProgress(prog);
        }
      } catch {
        // fallback to mock
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const course = apiCourse
    ? {
        id: apiCourse.id,
        title: apiCourse.title,
        description: apiCourse.description || '',
        grade: `Class ${apiCourse.grade}`,
        board: apiCourse.board,
        icon: apiCourse.icon || '\ud83d\udcda',
        color: apiCourse.color || 'from-violet-500 to-purple-600',
        chapters: progress.total,
        completedChapters: progress.completed,
        students: 0,
        rating: 0,
      }
    : null;

  // Determine chapter status based on real is_completed from backend
  // Rule: first chapter always unlocked, next chapter unlocks after previous is completed
  const chapters = apiChapters.map((ch, i) => {
    const isCompleted = (ch as unknown as { is_completed?: boolean }).is_completed === true;
    const prevCompleted = i === 0 ? true : (apiChapters[i - 1] as unknown as { is_completed?: boolean }).is_completed === true;

    let status: 'completed' | 'in-progress' | 'locked';
    if (isCompleted) {
      status = 'completed';
    } else if (prevCompleted) {
      status = 'in-progress';
    } else {
      status = 'locked';
    }

    return {
      id: ch.id,
      title: ch.title,
      duration: '45 min',
      status,
      xp: 50,
    };
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-theme-page transition-colors duration-300 pt-20 pb-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="h-5 w-32 bg-violet-100 dark:bg-gray-700/50 animate-pulse rounded-lg mb-6" />
          {/* Header skeleton */}
          <div className="p-8 rounded-3xl bg-violet-50 dark:bg-gray-700/30 animate-pulse mb-8 h-48" />
          {/* Progress bar skeleton */}
          <div className="mb-8 p-5 rounded-2xl bg-theme-card border border-theme-border">
            <div className="flex items-center justify-between mb-2">
              <div className="h-4 w-28 bg-violet-100 dark:bg-gray-700/50 animate-pulse rounded-lg" />
              <div className="h-4 w-36 bg-violet-100 dark:bg-gray-700/50 animate-pulse rounded-lg" />
            </div>
            <div className="w-full h-3 bg-violet-100 dark:bg-gray-700/50 animate-pulse rounded-full" />
          </div>
          {/* Chapters skeleton */}
          <div className="h-6 w-32 bg-violet-100 dark:bg-gray-700/50 animate-pulse rounded-lg mb-4" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4 p-5 rounded-2xl bg-theme-card border border-theme-border">
                <div className="w-12 h-12 rounded-xl bg-violet-100 dark:bg-gray-700/50 animate-pulse" />
                <div className="flex-1">
                  <div className="h-4 w-48 bg-violet-100 dark:bg-gray-700/50 animate-pulse rounded-lg mb-2" />
                  <div className="h-3 w-32 bg-violet-100 dark:bg-gray-700/50 animate-pulse rounded-lg" />
                </div>
                <div className="h-6 w-16 bg-violet-100 dark:bg-gray-700/50 animate-pulse rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-theme-page transition-colors duration-300 pt-20 pb-12 px-4 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-theme-text-secondary mb-4">Course not found</p>
          <Link to="/courses" className="text-violet-400 hover:text-violet-300">Back to Courses</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-theme-page transition-colors duration-300 pt-20 pb-12 px-4 blob-bg">
      <div className="max-w-5xl mx-auto relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Link to="/courses" className="inline-flex items-center gap-2 text-theme-text-secondary hover:text-theme-text mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Courses
          </Link>
        </motion.div>

        {/* Course Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`relative p-8 rounded-3xl bg-gradient-to-br ${course.color} mb-8 overflow-hidden`}
        >
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="w-24 h-24 rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-5xl shadow-xl">
              {course.icon}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-black text-white mb-2">{course.title}</h1>
              <p className="text-white/80 mb-4">{course.description}</p>
              <div className="flex flex-wrap items-center gap-4 text-sm text-white/80">
                <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" /> {course.chapters} Chapters</span>
                <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {course.students} Students</span>
                <span className="flex items-center gap-1"><Star className="w-4 h-4 text-amber-300" /> {course.rating}</span>
                <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-bold">{course.grade} - {course.board}</span>
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-black text-white">{course.chapters > 0 ? Math.round((course.completedChapters / course.chapters) * 100) : 0}%</div>
              <p className="text-white/70 text-sm">Complete</p>
            </div>
          </div>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8 p-5 rounded-2xl bg-theme-card border border-theme-border"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-theme-text-secondary">Overall Progress</span>
            <span className="text-sm font-bold text-violet-400">{course.completedChapters}/{course.chapters} chapters done</span>
          </div>
          <div className="w-full h-3 bg-theme-surface rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${course.chapters > 0 ? (course.completedChapters / course.chapters) * 100 : 0}%` }}
              transition={{ duration: 1, delay: 0.4 }}
              className={`h-full rounded-full bg-gradient-to-r ${course.color}`}
            />
          </div>
        </motion.div>

        {/* Chapters List */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <h2 className="text-xl font-bold text-theme-text mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-violet-400" /> Chapters
          </h2>
          <div className="space-y-3">
            {chapters.map((chapter, i) => (
              <motion.div
                key={chapter.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.05 }}
                whileHover={{ x: 5, scale: 1.01 }}
              >
                <Link to={chapter.status !== 'locked' ? `/classroom/${course.id}/${chapter.id}` : '#'}>
                  <div className={`flex items-center gap-4 p-5 rounded-2xl border transition-all cursor-pointer ${
                    chapter.status === 'completed'
                      ? 'bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/30'
                      : chapter.status === 'in-progress'
                      ? 'bg-violet-500/5 border-violet-500/20 hover:border-violet-500/30'
                      : 'bg-theme-surface/30 border-theme-border opacity-60'
                  }`}>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      chapter.status === 'completed'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : chapter.status === 'in-progress'
                        ? 'bg-violet-500/20 text-violet-400'
                        : 'bg-theme-input text-gray-600'
                    }`}>
                      {chapter.status === 'completed' ? (
                        <CheckCircle2 className="w-6 h-6" />
                      ) : chapter.status === 'in-progress' ? (
                        <Play className="w-6 h-6" />
                      ) : (
                        <Lock className="w-6 h-6" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-theme-text text-sm">{chapter.title}</h4>
                      <div className="flex items-center gap-3 text-xs text-theme-text-muted mt-1">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {chapter.duration}</span>
                        <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> +{chapter.xp} XP</span>
                      </div>
                    </div>
                    {chapter.status === 'completed' && (
                      <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold">Done</span>
                    )}
                    {chapter.status === 'in-progress' && (
                      <span className="px-3 py-1 rounded-full bg-violet-500/20 text-violet-400 text-xs font-bold animate-pulse">Continue</span>
                    )}
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Start Quiz CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-8 p-8 rounded-3xl bg-gradient-to-r from-violet-500/10 to-cyan-500/10 border border-violet-500/20 text-center"
        >
          <Award className="w-12 h-12 text-amber-400 mx-auto mb-3" />
          <h3 className="text-xl font-bold text-theme-text mb-2">Ready for Quiz?</h3>
          <p className="text-theme-text-secondary mb-4">Chapter quiz de aur XP kamao!</p>
          <Link to="/quiz">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-violet-500 to-purple-600 shadow-lg shadow-violet-500/25"
            >
              Start Quiz 🎯
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
