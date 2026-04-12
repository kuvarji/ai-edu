import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Clock, Zap, CheckCircle2, XCircle, ArrowRight, Trophy,
  Brain, Sparkles, RotateCcw,
} from 'lucide-react';
import { quizQuestions as mockQuizQuestions } from '../data/mockData';
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
  const [, setLoadingQuiz] = useState(true);

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

  const quizQuestions = apiQuestions.length > 0
    ? apiQuestions.map((q) => ({
        id: q.id,
        question: q.question,
        options: q.options,
        correct: -1, // server will validate
        difficulty: q.difficulty as 'easy' | 'medium' | 'hard',
        explanation: '',
      }))
    : mockQuizQuestions;

  const question = quizQuestions[currentQ];

  const timerExpiredRef = useRef(false);

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
      handleAnswer(null);
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
      // Submit to backend if we have a real quiz
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
    // Fetch new quiz from backend
    try {
      const res = await quizApi.start({ subject: 'Mathematics', count: 5 });
      setApiQuestions(res.questions);
      setQuizId(res.quiz_id);
      if (res.time_per_question) setTimer(res.time_per_question);
    } catch {
      // keep using existing questions
    }
  };

  if (finished) {
    const percentage = Math.round((score / quizQuestions.length) * 100);
    const earnedXP = score * 10 + 50;
    return (
      <div className="min-h-screen bg-gray-950 pt-20 pb-12 px-4 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg text-center"
        >
          <div className="p-8 rounded-3xl bg-gray-900/80 border border-white/10 shadow-2xl">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              className="text-7xl mb-6"
            >
              {percentage >= 80 ? '🏆' : percentage >= 60 ? '🎉' : percentage >= 40 ? '💪' : '📚'}
            </motion.div>

            <h1 className="text-3xl font-black text-white mb-2">Quiz Complete!</h1>
            <p className="text-gray-400 mb-6">
              {percentage >= 80 ? 'Excellent! Bahut accha kiya!' : percentage >= 60 ? 'Good job! Keep going!' : 'Koi baat nahi, practice karo!'}
            </p>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="p-4 rounded-2xl bg-violet-500/10 border border-violet-500/20">
                <p className="text-2xl font-black text-violet-400">{score}/{quizQuestions.length}</p>
                <p className="text-xs text-gray-500">Correct</p>
              </div>
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                <p className="text-2xl font-black text-amber-400">{percentage}%</p>
                <p className="text-xs text-gray-500">Score</p>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                <p className="text-2xl font-black text-emerald-400">+{earnedXP}</p>
                <p className="text-xs text-gray-500">XP Earned</p>
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
                  <span className="text-sm text-gray-300 truncate">{q.question}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={restart}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-gray-300 bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                Try Again
              </motion.button>
              <Link to="/leaderboard" className="flex-1">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-violet-500 to-purple-600 shadow-lg shadow-violet-500/25"
                >
                  <Trophy className="w-4 h-4" />
                  Leaderboard
                </motion.button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 pt-20 pb-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div className="flex items-center gap-3">
            <Brain className="w-6 h-6 text-violet-400" />
            <div>
              <h1 className="text-lg font-bold text-white">Mathematics Quiz</h1>
              <p className="text-sm text-gray-500">Question {currentQ + 1} of {quizQuestions.length}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <Zap className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-bold text-emerald-400">{score * 10} XP</span>
            </div>
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${
              timer <= 10 ? 'bg-red-500/10 border-red-500/20' : 'bg-amber-500/10 border-amber-500/20'
            }`}>
              <Clock className={`w-4 h-4 ${timer <= 10 ? 'text-red-400' : 'text-amber-400'}`} />
              <span className={`text-sm font-bold ${timer <= 10 ? 'text-red-400' : 'text-amber-400'}`}>{timer}s</span>
            </div>
          </div>
        </motion.div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden mb-8">
          <motion.div
            animate={{ width: `${((currentQ + 1) / quizQuestions.length) * 100}%` }}
            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-500"
          />
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQ}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="p-8 rounded-3xl bg-gray-900/80 border border-white/10 shadow-xl mb-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                question.difficulty === 'easy' ? 'bg-emerald-500/20 text-emerald-400' :
                question.difficulty === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                {question.difficulty.toUpperCase()}
              </span>
            </div>

            <h2 className="text-xl font-bold text-white mb-8 leading-relaxed">
              {question.question}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {question.options.map((option, i) => {
                let style = 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-gray-200';
                if (answered) {
                  if (i === question.correct) style = 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400';
                  else if (i === selected) style = 'bg-red-500/20 border-red-500/30 text-red-400';
                  else style = 'bg-white/5 border-white/5 text-gray-600';
                }

                return (
                  <motion.button
                    key={i}
                    whileHover={!answered ? { scale: 1.02 } : {}}
                    whileTap={!answered ? { scale: 0.98 } : {}}
                    onClick={() => handleAnswer(i)}
                    disabled={answered}
                    className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${style}`}
                  >
                    <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="text-sm font-medium">{option}</span>
                    {answered && i === question.correct && <CheckCircle2 className="w-5 h-5 ml-auto flex-shrink-0" />}
                    {answered && i === selected && i !== question.correct && <XCircle className="w-5 h-5 ml-auto flex-shrink-0" />}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Explanation */}
        <AnimatePresence>
          {answered && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-6 rounded-2xl bg-violet-500/10 border border-violet-500/20 mb-6"
            >
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-violet-400" />
                <h4 className="font-bold text-violet-400">Explanation</h4>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">{question.explanation}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Next Button */}
        {answered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-end"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={nextQuestion}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-violet-500 to-purple-600 shadow-lg shadow-violet-500/25"
            >
              {currentQ + 1 >= quizQuestions.length ? 'See Results' : 'Next Question'}
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
