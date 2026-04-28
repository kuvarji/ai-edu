import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Zap, CheckCircle2, XCircle, ArrowRight, Trophy,
  Brain, Sparkles, RotateCcw,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { quizApi, type QuizQuestion as ApiQuizQuestion } from '../services/api';

export default function QuizPage() {
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(30);
  const [finished, setFinished] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const { addXP } = useStore();
  const [apiQuestions, setApiQuestions] = useState<ApiQuizQuestion[]>([]);
  const [quizId, setQuizId] = useState<string | null>(null);
  const [loadingQuiz, setLoadingQuiz] = useState(true);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await quizApi.start({ subject: 'Mathematics', count: 5 });
        setApiQuestions(res.questions);
        setQuizId(res.quiz_id);
        if (res.time_per_question) setTimer(res.time_per_question);
      } catch {
        // fallback to mock
      } finally {
        setLoadingQuiz(false);
      }
    };
    fetchQuiz();
  }, []);

  const quizQuestions = apiQuestions.map((q) => ({
    id: q.id,
    question: q.question,
    options: q.options,
    correct: -1, // server will validate
    difficulty: q.difficulty as 'easy' | 'medium' | 'hard',
    explanation: '',
  }));

  const question = quizQuestions[currentQ];

  const timerExpiredRef = useRef(false);
  const selectedRef = useRef<number | null>(null);
  selectedRef.current = selected;

  useEffect(() => {
    if (finished || answered) return;
    timerExpiredRef.current = false;
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          timerExpiredRef.current = true;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [currentQ, finished, answered]);

  useEffect(() => {
    if (timer === 0 && !answered && !finished && timerExpiredRef.current) {
      timerExpiredRef.current = false;
      handleAnswer(selectedRef.current);
    }
  }, [timer, answered, finished]);

  const handleAnswer = (idx: number | null) => {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);
    const correct = idx === question.correct;
    if (correct) setScore((s) => s + 1);
    setAnswers((prev) => [...prev, idx]);
  };

  const nextQuestion = async () => {
    if (currentQ + 1 >= quizQuestions.length) {
      setFinished(true);
      if (quizId && apiQuestions.length > 0) {
        try {
          const submitAnswers = answers.concat(selected !== null ? [] : [null]).map((ans, i) => ({
            question_id: apiQuestions[i]?.id || '',
            selected_option: ans ?? -1,
          }));
          const res = await quizApi.submit({ quiz_id: quizId, answers: submitAnswers });
          addXP(res.xp_earned);
          return;
        } catch {
          // fallback
        }
      }
      const earnedXP = score * 10 + 50;
      addXP(earnedXP);
      return;
    }
    setCurrentQ((q) => q + 1);
    setSelected(null);
    setAnswered(false);
    setTimer(30);
  };

  const restart = async () => {
    setCurrentQ(0);
    setSelected(null);
    setAnswered(false);
    setScore(0);
    setTimer(30);
    setFinished(false);
    setAnswers([]);
    try {
      const res = await quizApi.start({ subject: 'Mathematics', count: 5 });
      setApiQuestions(res.questions);
      setQuizId(res.quiz_id);
      if (res.time_per_question) setTimer(res.time_per_question);
    } catch {
      // keep using existing questions
    }
  };

  /* ───── Loading Skeleton ───── */
  if (loadingQuiz) {
    return (
      <div className="min-h-screen bg-theme-page transition-colors duration-300 pt-20 pb-12 px-4 blob-bg">
        <div className="max-w-[800px] mx-auto relative z-10">
          {/* Quiz header skeleton */}
          <div className="p-7 rounded-[22px] mb-6" style={{ background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent2), var(--color-cyan))' }}>
            <div className="h-6 w-48 bg-white/20 animate-pulse rounded-lg mb-2" />
            <div className="h-4 w-64 bg-white/15 animate-pulse rounded-lg mb-4" />
            <div className="flex gap-5">
              {[1,2,3].map(i => <div key={i} className="h-8 w-28 bg-white/15 animate-pulse rounded-lg" />)}
            </div>
          </div>
          {/* Progress dots skeleton */}
          <div className="flex gap-1.5 justify-center mb-6">
            {[1,2,3,4,5].map(i => <div key={i} className="w-2.5 h-2.5 rounded-full bg-[var(--color-surface)] animate-pulse" />)}
          </div>
          {/* Question card skeleton */}
          <div className="p-7 rounded-[22px] bg-theme-card border border-theme-border">
            <div className="h-6 w-36 bg-[var(--color-surface)] animate-pulse rounded-lg mb-4" />
            <div className="h-5 w-full bg-[var(--color-surface)] animate-pulse rounded-lg mb-2" />
            <div className="h-5 w-3/4 bg-[var(--color-surface)] animate-pulse rounded-lg mb-6" />
            <div className="flex flex-col gap-2.5">
              {[1,2,3,4].map(i => (
                <div key={i} className="flex items-center gap-3.5 p-4 rounded-2xl bg-theme-input border border-theme-border">
                  <div className="w-9 h-9 rounded-[10px] bg-[var(--color-surface)] animate-pulse flex-shrink-0" />
                  <div className="h-4 w-full bg-[var(--color-surface)] animate-pulse rounded-lg" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ───── No Questions ───── */
  if (quizQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-theme-page transition-colors duration-300 pt-20 pb-12 px-4 flex items-center justify-center blob-bg">
        <div className="text-center relative z-10">
          <Brain className="w-12 h-12 text-theme-text-muted mx-auto mb-3" />
          <p className="text-theme-text-secondary mb-4">No quiz questions available right now. Try again later!</p>
          <Link to="/dashboard">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-500 to-violet-500">
              Back to Dashboard
            </motion.button>
          </Link>
        </div>
      </div>
    );
  }

  /* ───── Finished State ───── */
  if (finished) {
    const percentage = Math.round((score / quizQuestions.length) * 100);
    const earnedXP = score * 10 + 50;
    return (
      <div className="min-h-screen bg-theme-page transition-colors duration-300 pt-20 pb-12 px-4 flex items-center justify-center blob-bg">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg text-center relative z-10">
          <div className="p-8 rounded-3xl bg-theme-card border border-theme-border shadow-2xl">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              className="text-7xl mb-6">
              {percentage >= 80 ? '\ud83c\udfc6' : percentage >= 60 ? '\ud83c\udf89' : percentage >= 40 ? '\ud83d\udcaa' : '\ud83d\udcda'}
            </motion.div>
            <h1 className="text-3xl font-black text-theme-text mb-2">Quiz Complete!</h1>
            <p className="text-theme-text-secondary mb-6">
              {percentage >= 80 ? 'Excellent! Bahut accha kiya!' : percentage >= 60 ? 'Good job! Keep going!' : 'Koi baat nahi, practice karo!'}
            </p>
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
                <p className="text-2xl font-black text-indigo-400">{score}/{quizQuestions.length}</p>
                <p className="text-xs text-theme-text-muted">Correct</p>
              </div>
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                <p className="text-2xl font-black text-amber-400">{percentage}%</p>
                <p className="text-xs text-theme-text-muted">Score</p>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                <p className="text-2xl font-black text-emerald-400">+{earnedXP}</p>
                <p className="text-xs text-theme-text-muted">XP Earned</p>
              </div>
            </div>
            {/* Answer Review */}
            <div className="space-y-2 mb-8 text-left">
              {quizQuestions.map((q, i) => (
                <div key={i} className={`flex items-center gap-3 p-3 rounded-xl ${
                  answers[i] === q.correct ? 'bg-emerald-500/10' : 'bg-red-500/10'
                }`}>
                  {answers[i] === q.correct ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                  )}
                  <span className="text-sm text-theme-text-secondary truncate">{q.question}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={restart}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-theme-text-secondary bg-theme-input border border-theme-border hover:bg-theme-card-hover transition-all">
                <RotateCcw className="w-4 h-4" /> Try Again
              </motion.button>
              <Link to="/leaderboard" className="flex-1">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-500 to-violet-500 shadow-lg shadow-violet-500/25">
                  <Trophy className="w-4 h-4" /> Leaderboard
                </motion.button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  /* ───── Active Quiz ───── */
  const timerPct = (timer / 30) * 100;
  const timerLow = timer <= 10;

  return (
    <div className="min-h-screen bg-theme-page transition-colors duration-300 pt-20 pb-12 px-4 blob-bg">
      <div className="max-w-[800px] mx-auto relative z-10">

        {/* Quiz Header Card */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="p-7 rounded-[22px] text-white mb-6 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent2), var(--color-cyan))' }}>
          <div className="absolute -right-10 -top-10 w-[180px] h-[180px] rounded-full bg-white/[0.08]" />
          <div className="absolute right-[60px] -bottom-[30px] w-[120px] h-[120px] rounded-full bg-white/[0.05]" />
          <div className="flex justify-between items-center mb-2 relative z-[1]">
            <div>
              <h1 className="text-[24px] font-extrabold">{'\ud83e\udde0'} Mathematics Quiz</h1>
              <p className="text-[13px] opacity-85 mt-1">Question {currentQ + 1} of {quizQuestions.length}</p>
            </div>
            <div className="px-3.5 py-1.5 rounded-[10px] bg-white/15 backdrop-blur-sm text-xs font-bold flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" /> +{score * 10} XP
            </div>
          </div>
          <div className="flex gap-5 mt-4 relative z-[1]">
            <div className="flex items-center gap-1.5 text-[13px] font-semibold">
              <span className="w-8 h-8 rounded-[10px] bg-white/15 flex items-center justify-center text-base">{'\ud83d\udcdd'}</span>
              {quizQuestions.length} Questions
            </div>
            <div className="flex items-center gap-1.5 text-[13px] font-semibold">
              <span className="w-8 h-8 rounded-[10px] bg-white/15 flex items-center justify-center text-base">{'\u23f1'}</span>
              {quizQuestions.length * 30}s Total
            </div>
            <div className="flex items-center gap-1.5 text-[13px] font-semibold">
              <span className="w-8 h-8 rounded-[10px] bg-white/15 flex items-center justify-center text-base">{'\ud83c\udfaf'}</span>
              Pass: 60%
            </div>
          </div>
        </motion.div>

        {/* Progress Dots */}
        <div className="flex gap-1.5 justify-center mb-6">
          {quizQuestions.map((_, i) => (
            <motion.div key={i}
              animate={{ width: i === currentQ ? 28 : 10 }}
              className={`h-2.5 rounded-full transition-colors ${
                i < currentQ ? (answers[i] === quizQuestions[i].correct ? 'bg-green-500' : 'bg-rose-500')
                : i === currentQ ? 'bg-indigo-600' : 'bg-black/[0.06] dark:bg-white/10'
              }`}
              style={{ borderRadius: i === currentQ ? 5 : '50%' }}
            />
          ))}
        </div>

        {/* Timer Bar */}
        <div className="flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-theme-card border border-theme-border shadow-sm mb-5">
          <span className="text-[22px]">{'\u23f1'}</span>
          <div className="flex-1 h-2 rounded-lg overflow-hidden" style={{ background: 'var(--color-surface)' }}>
            <motion.div animate={{ width: `${timerPct}%` }} transition={{ duration: 0.8 }}
              className="h-full rounded-lg"
              style={{ background: timerLow ? 'linear-gradient(90deg, #f43f5e, #fb7185)' : 'linear-gradient(90deg, #10b981, #06b6d4)' }} />
          </div>
          <span className={`text-base font-extrabold ${timerLow ? 'text-rose-500' : 'text-theme-text'}`}>
            {timer}s
          </span>
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div key={currentQ} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}
            className="p-7 rounded-[22px] bg-theme-card border border-theme-border shadow-sm mb-5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold mb-3.5">
              {'\u2753'} Question {currentQ + 1} of {quizQuestions.length}
            </div>
            <h2 className="text-[17px] font-bold text-theme-text leading-relaxed mb-5">
              {question.question}
            </h2>

            {/* Options */}
            <div className="flex flex-col gap-2.5">
              {question.options.map((option, i) => {
                let borderColor = 'border-theme-border';
                let bg = 'bg-theme-card hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10';
                let letterBg = 'bg-theme-surface border border-theme-border text-theme-text-secondary';
                let textColor = 'text-theme-text-secondary';

                if (answered) {
                  if (i === question.correct) {
                    borderColor = 'border-green-400';
                    bg = 'bg-green-50 dark:bg-green-900/20';
                    letterBg = 'bg-green-500 border-green-500 text-white';
                    textColor = 'text-green-700 dark:text-green-400 font-bold';
                  } else if (i === selected) {
                    borderColor = 'border-rose-400';
                    bg = 'bg-rose-50 dark:bg-rose-900/20';
                    letterBg = 'bg-rose-500 border-rose-500 text-white';
                    textColor = 'text-rose-600 dark:text-rose-400 font-bold';
                  } else {
                    bg = 'bg-theme-input';
                    textColor = 'text-theme-text-muted';
                  }
                } else if (selected === i) {
                  borderColor = 'border-indigo-400';
                  bg = 'bg-indigo-50 dark:bg-indigo-900/20';
                  letterBg = 'bg-indigo-600 border-indigo-600 text-white';
                  textColor = 'text-indigo-600 dark:text-indigo-400 font-bold';
                }

                return (
                  <motion.button key={i}
                    whileHover={!answered ? { x: 4 } : {}}
                    whileTap={!answered ? { scale: 0.98 } : {}}
                    onClick={() => !answered && setSelected(i)}
                    disabled={answered}
                    className={`flex items-center gap-3.5 p-4 rounded-2xl border-2 text-left transition-all ${borderColor} ${bg}`}>
                    <span className={`w-9 h-9 rounded-[10px] flex items-center justify-center text-sm font-extrabold flex-shrink-0 ${letterBg}`}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className={`text-sm font-semibold ${textColor}`}>{option}</span>
                    {answered && i === question.correct && <CheckCircle2 className="w-5 h-5 ml-auto text-green-500 flex-shrink-0" />}
                    {answered && i === selected && i !== question.correct && <XCircle className="w-5 h-5 ml-auto text-rose-500 flex-shrink-0" />}
                  </motion.button>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2.5 mt-5">
              {!answered ? (
                <>
                  <motion.button whileTap={{ scale: 0.98 }}
                    onClick={() => handleAnswer(null)}
                    className="flex-1 py-3.5 rounded-[14px] text-sm font-bold bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center gap-2">
                    {'\u23ed'} Skip
                  </motion.button>
                  <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}
                    onClick={() => selected !== null && handleAnswer(selected)}
                    disabled={selected === null}
                    className="flex-1 py-3.5 rounded-[14px] text-sm font-bold text-white bg-indigo-600 shadow-lg shadow-indigo-500/25 disabled:opacity-50 flex items-center justify-center gap-2">
                    {'\u2705'} Submit Answer
                  </motion.button>
                </>
              ) : (
                <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}
                  onClick={nextQuestion}
                  className="flex-1 py-3.5 rounded-[14px] text-sm font-bold text-white bg-indigo-600 shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2">
                  {currentQ + 1 >= quizQuestions.length ? 'See Results' : 'Next Question'}
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Explanation */}
        <AnimatePresence>
          {answered && question.explanation && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="p-6 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <h4 className="font-bold text-indigo-400">Explanation</h4>
              </div>
              <p className="text-theme-text-secondary text-sm leading-relaxed">{question.explanation}</p>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
