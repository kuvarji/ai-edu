import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft, Send, Bot, User, BookOpen, MessageCircle,
  FileText, Play, Volume2, Sparkles, ThumbsUp, Copy,
  Pause, SkipForward, SkipBack, Loader2,
} from 'lucide-react';
import { aiApi, storeApi, coursesApi, type LessonSlide, type Avatar as ApiAvatar } from '../services/api';
import { useStore } from '../store/useStore';
import MembershipPrompt from '../components/MembershipPrompt';

const CHARACTER_EMOJIS: Record<string, string> = {
  sheru: '\ud83e\udd81',
  drago: '\ud83e\udd84',
  meow: '\ud83d\udc31',
  foxy: '\ud83e\udd8a',
  teddy: '\ud83d\udcbb',
};

export default function ClassroomPage() {
  const { courseId, chapterId } = useParams();
  const { user, setXP } = useStore();
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'chat' | 'notes' | 'video'>('video');
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; text: string }[]>([
    { role: 'bot', text: 'Namaste! Main tumhara AI Teacher hu. Koi bhi sawal poocho!' },
  ]);
  const [sending, setSending] = useState(false);

  // Video Lesson State
  const [lessonSlides, setLessonSlides] = useState<LessonSlide[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [lessonLoading, setLessonLoading] = useState(false);
  const [lessonError, setLessonError] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [topicInput, setTopicInput] = useState('');
  const [courseSubject, setCourseSubject] = useState('');
  const [chapterTitle, setChapterTitle] = useState('');
  const [courseTitle, setCourseTitle] = useState('');
  const [selectedCharacter, setSelectedCharacter] = useState<{ name: string; emoji: string }>({ name: 'Sheru', emoji: '\ud83e\udd81' });
  const [userAvatars, setUserAvatars] = useState<ApiAvatar[]>([]);
  const [avatarsLoading, setAvatarsLoading] = useState(true);
  const [showMembershipPrompt, setShowMembershipPrompt] = useState(false);
  const [membershipPromptInfo, setMembershipPromptInfo] = useState({ requiredXP: 0, feature: '' });
  const isPlayingRef = useRef(false);
  const slidesRef = useRef<LessonSlide[]>([]);

  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
  useEffect(() => { slidesRef.current = lessonSlides; }, [lessonSlides]);

  useEffect(() => {
    const fetchAvatars = async () => {
      try {
        const res = await storeApi.getAvatars();
        setUserAvatars(res.avatars);
      } catch {
        // fallback to default characters
      } finally {
        setAvatarsLoading(false);
      }
    };
    fetchAvatars();
  }, []);

  // Fetch course & chapter info to auto-fill topic
  useEffect(() => {
    const fetchCourseChapter = async () => {
      if (!courseId) return;
      try {
        const course = await coursesApi.getById(courseId);
        setCourseSubject(course.subject || '');
        setCourseTitle(course.title || '');
        if (chapterId) {
          const chapRes = await coursesApi.getChapters(courseId);
          const chapter = chapRes.chapters.find((ch) => ch.id === chapterId);
          if (chapter) {
            setChapterTitle(chapter.title);
            setTopicInput(chapter.title);
          }
        }
      } catch {
        // ignore — user can still type manually
      }
    };
    fetchCourseChapter();
  }, [courseId, chapterId]);

  // Chrome bug workarounds for Web Speech API
  const resumeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const speakTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intentionalCancelRef = useRef(false);

  const clearResumeInterval = useCallback(() => {
    if (resumeIntervalRef.current) {
      clearInterval(resumeIntervalRef.current);
      resumeIntervalRef.current = null;
    }
  }, []);

  const clearSpeakTimeout = useCallback(() => {
    if (speakTimeoutRef.current) {
      clearTimeout(speakTimeoutRef.current);
      speakTimeoutRef.current = null;
    }
  }, []);

  /** Cancel all speech activity — clears pending timeout, resume interval, and browser speech */
  const cancelSpeech = useCallback(() => {
    intentionalCancelRef.current = true;
    clearSpeakTimeout();
    clearResumeInterval();
    window.speechSynthesis.cancel();
  }, [clearSpeakTimeout, clearResumeInterval]);

  useEffect(() => {
    return () => { cancelSpeech(); };
  }, [cancelSpeech]);

  /**
   * Split text into short sentences for mobile Chrome which cuts off long utterances.
   * Splits on sentence-ending punctuation (. ! ? | ।) keeping chunks under ~120 chars.
   */
  const splitIntoChunks = useCallback((text: string): string[] => {
    const sentences = text.split(/(?<=[।.!?\n])\s*/);
    const chunks: string[] = [];
    let current = '';
    for (const s of sentences) {
      const trimmed = s.trim();
      if (!trimmed) continue;
      if (current && (current + ' ' + trimmed).length > 120) {
        chunks.push(current);
        current = trimmed;
      } else {
        current = current ? current + ' ' + trimmed : trimmed;
      }
    }
    if (current) chunks.push(current);
    return chunks.length > 0 ? chunks : [text];
  }, []);

  /**
   * Speak a slide by splitting into short chunks (sentences).
   * Each chunk is spoken as a separate utterance to avoid mobile Chrome cutting off.
   * Used for auto-advance from onend where speech already finished naturally.
   */
  const doSpeak = useCallback((slideIndex: number, autoAdvance: boolean) => {
    intentionalCancelRef.current = false;
    const slides = slidesRef.current;
    if (slideIndex >= slides.length) return;

    const chunks = splitIntoChunks(slides[slideIndex].text);
    let chunkIndex = 0;

    const speakChunk = () => {
      if (intentionalCancelRef.current) return;
      if (chunkIndex >= chunks.length) {
        // All chunks spoken — advance to next slide or stop
        setIsSpeaking(false);
        clearResumeInterval();
        if (autoAdvance && isPlayingRef.current) {
          const nextIndex = slideIndex + 1;
          if (nextIndex < slidesRef.current.length) {
            setCurrentSlide(nextIndex);
            doSpeak(nextIndex, true);
          } else {
            setIsPlaying(false);
          }
        }
        return;
      }

      const utterance = new SpeechSynthesisUtterance(chunks[chunkIndex]);
      utterance.lang = 'hi-IN';
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      const voices = window.speechSynthesis.getVoices();
      const hindiVoice = voices.find((v) => v.lang.startsWith('hi'));
      if (hindiVoice) utterance.voice = hindiVoice;

      utterance.onstart = () => {
        setIsSpeaking(true);
        // Mobile Chrome is more aggressive — use 5s pause/resume interval
        clearResumeInterval();
        resumeIntervalRef.current = setInterval(() => {
          if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
            window.speechSynthesis.pause();
            window.speechSynthesis.resume();
          }
        }, 5000);
      };

      utterance.onend = () => {
        clearResumeInterval();
        chunkIndex++;
        speakChunk();
      };

      utterance.onerror = (e) => {
        setIsSpeaking(false);
        clearResumeInterval();
        if (!intentionalCancelRef.current && (e.error === 'interrupted' || e.error === 'canceled')) {
          speakTimeoutRef.current = setTimeout(() => speakChunk(), 150);
        }
      };

      window.speechSynthesis.speak(utterance);
    };

    speakChunk();
  }, [clearResumeInterval, splitIntoChunks]);

  /**
   * Interrupt any current speech and start speaking a slide.
   * Used for user-initiated actions (Play, Next, Prev, sidebar click).
   * Adds a short delay after cancel() to work around Chrome's cancel bug.
   */
  const speakSlide = useCallback((slideIndex: number, autoAdvance: boolean) => {
    cancelSpeech();
    const slides = slidesRef.current;
    if (slideIndex >= slides.length) return;
    // Small delay to let Chrome reset after cancel()
    speakTimeoutRef.current = setTimeout(() => doSpeak(slideIndex, autoAdvance), 100);
  }, [cancelSpeech, doSpeak]);

  const handleGenerateLesson = async () => {
    if (!topicInput.trim()) return;
    // XP check (10 XP per lesson) — skip for pro members
    if (user?.subscription !== 'pro' && (user?.xp ?? 0) < 10) {
      setMembershipPromptInfo({ requiredXP: 10, feature: 'AI Video Lesson' });
      setShowMembershipPrompt(true);
      return;
    }
    setLessonLoading(true);
    setLessonError('');
    setLessonSlides([]);
    setCurrentSlide(0);
    setIsPlaying(false);
    cancelSpeech();
    try {
      const res = await aiApi.generateLesson({
        topic: topicInput.trim(),
        subject: courseSubject || 'science',
        grade: user?.grade ? parseInt(String(user.grade)) : 8,
        language: 'hinglish',
        character_name: selectedCharacter.name,
      });
      setLessonSlides(res.slides);
      // Update XP in store from backend response
      if (res.remaining_xp !== undefined) {
        setXP(res.remaining_xp);
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      if (errMsg.includes('XP kam hai')) {
        setLessonError(errMsg);
      } else {
        setLessonError('Lesson generate nahi ho paya. Please try again.');
      }
    } finally {
      setLessonLoading(false);
    }
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      setIsPlaying(false);
      cancelSpeech();
      setIsSpeaking(false);
    } else {
      setIsPlaying(true);
      speakSlide(currentSlide, true);
    }
  };

  const handleNextSlide = () => {
    cancelSpeech();
    setIsSpeaking(false);
    setIsPlaying(false);
    if (currentSlide < lessonSlides.length - 1) setCurrentSlide((prev) => prev + 1);
  };

  const handlePrevSlide = () => {
    cancelSpeech();
    setIsSpeaking(false);
    setIsPlaying(false);
    if (currentSlide > 0) setCurrentSlide((prev) => prev - 1);
  };

  const handleSend = async () => {
    if (!message.trim() || sending) return;
    // XP check (5 XP per chat message) — skip for pro members
    if (user?.subscription !== 'pro' && (user?.xp ?? 0) < 5) {
      setMembershipPromptInfo({ requiredXP: 5, feature: 'AI Chat' });
      setShowMembershipPrompt(true);
      return;
    }
    const userMsg = message;
    setMessages((prev) => [...prev, { role: 'user' as const, text: userMsg }]);
    setMessage('');
    setSending(true);
    try {
      const res = await aiApi.chat({ message: userMsg, subject: 'general' });
      setMessages((prev) => [...prev, { role: 'bot' as const, text: res.response }]);
      // Update XP in store from backend response
      if (res.remaining_xp !== undefined) {
        setXP(res.remaining_xp);
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      if (errMsg.includes('XP kam hai')) {
        setMessages((prev) => [...prev, { role: 'bot' as const, text: errMsg }]);
      } else {
        setMessages((prev) => [...prev, { role: 'bot' as const, text: 'Sorry, abhi response nahi aa paya. Please dobara try karo.' }]);
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-theme-page transition-colors duration-300 pt-16 sm:pt-20 pb-4 px-2 sm:px-4">
      <div className="max-w-7xl mx-auto h-[calc(100vh-5rem)] sm:h-[calc(100vh-6rem)] flex flex-col">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-2 sm:mb-4 gap-2">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <Link to={`/courses/${courseId}`} className="p-2 rounded-xl text-theme-text-secondary hover:text-white hover:bg-theme-input transition-all flex-shrink-0">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="min-w-0">
              <h1 className="text-base sm:text-xl font-bold text-white truncate">{courseTitle || 'AI Video Classroom'}</h1>
              <p className="text-xs sm:text-sm text-theme-text-muted truncate">{chapterTitle || `Chapter ${chapterId}`} — AI Character Teaching</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* XP Balance Badge */}
            <div className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-amber-500/20 border border-amber-500/30">
              <span className="text-xs sm:text-sm">⚡</span>
              <span className="text-xs sm:text-sm font-bold text-amber-400">
                {user?.subscription === 'pro' || user?.subscription === 'premium' ? '∞' : `${user?.xp ?? 0} XP`}
              </span>
            </div>
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }} className="w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full bg-emerald-400" />
            <span className="text-xs sm:text-sm text-emerald-400 font-medium hidden sm:inline">AI Teacher Online</span>
            <span className="text-xs text-emerald-400 font-medium sm:hidden">Online</span>
          </div>
        </motion.div>

        {/* Tab Buttons */}
        <div className="flex gap-1.5 sm:gap-2 mb-2 sm:mb-4">
          {[
            { key: 'video' as const, label: 'AI Video', icon: Play },
            { key: 'chat' as const, label: 'AI Chat', icon: MessageCircle },
            { key: 'notes' as const, label: 'Notes', icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <motion.button key={tab.key} whileTap={{ scale: 0.95 }} onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                  activeTab === tab.key
                    ? 'bg-violet-500/20 text-violet-400 border border-violet-500/20'
                    : 'bg-theme-card text-theme-text-secondary border border-theme-border hover:bg-theme-input'
                }`}>
                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                {tab.label}
              </motion.button>
            );
          })}
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden rounded-2xl bg-theme-card border border-theme-border">

          {/* AI VIDEO LESSON TAB */}
          {activeTab === 'video' && (
            <div className="flex flex-col h-full">
              {/* Topic Input Screen */}
              {lessonSlides.length === 0 && !lessonLoading && (
                <div className="flex-1 flex items-center justify-center p-6">
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-xl text-center">
                    <div className="text-5xl sm:text-6xl mb-3 sm:mb-4">{selectedCharacter.emoji}</div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">AI Video Lesson</h3>
                    {chapterTitle ? (
                      <div className="mb-4 sm:mb-6">
                        <p className="text-sm sm:text-base text-theme-text-secondary">{courseTitle}</p>
                        <p className="text-base sm:text-lg font-semibold text-violet-400 mt-1">{chapterTitle}</p>
                      </div>
                    ) : (
                      <p className="text-sm sm:text-base text-theme-text-secondary mb-4 sm:mb-6">Topic likho, character select karo — {selectedCharacter.name} padhayega!</p>
                    )}

                    {/* Character Selector */}
                    <div className="mb-6">
                      <p className="text-xs text-theme-text-muted mb-2">Character select karo:</p>
                      <div className="flex justify-center gap-3 flex-wrap">
                        {avatarsLoading ? (
                          <div className="text-theme-text-muted text-sm">Loading characters...</div>
                        ) : userAvatars.length > 0 ? (
                          userAvatars.map((av) => (
                            <motion.button key={av.id} whileTap={{ scale: 0.9 }}
                              onClick={() => setSelectedCharacter({ name: av.name, emoji: av.emoji || CHARACTER_EMOJIS[av.name.toLowerCase()] || '\ud83e\udd81' })}
                              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl border transition-all ${
                                selectedCharacter.name === av.name
                                  ? 'bg-violet-500/20 border-violet-500/40 text-violet-400'
                                  : 'bg-theme-input border-theme-border text-theme-text-secondary hover:border-violet-500/20'
                              }`}>
                              <span className="text-2xl">{av.emoji || CHARACTER_EMOJIS[av.name.toLowerCase()] || '\ud83e\udd81'}</span>
                              <span className="text-xs">{av.name}</span>
                            </motion.button>
                          ))
                        ) : (
                          Object.entries(CHARACTER_EMOJIS).map(([name, emoji]) => (
                            <motion.button key={name} whileTap={{ scale: 0.9 }}
                              onClick={() => setSelectedCharacter({ name: name.charAt(0).toUpperCase() + name.slice(1), emoji })}
                              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl border transition-all ${
                                selectedCharacter.name.toLowerCase() === name
                                  ? 'bg-violet-500/20 border-violet-500/40 text-violet-400'
                                  : 'bg-theme-input border-theme-border text-theme-text-secondary hover:border-violet-500/20'
                              }`}>
                              <span className="text-2xl">{emoji}</span>
                              <span className="text-xs capitalize">{name}</span>
                            </motion.button>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Topic Input */}
                    <div className="flex gap-2 sm:gap-3">
                      {chapterTitle ? (
                        <div className="flex-1 min-w-0 px-3 sm:px-5 py-3 sm:py-3.5 rounded-xl bg-theme-input border border-violet-500/30 text-violet-300 text-sm sm:text-base cursor-not-allowed">
                          {topicInput}
                        </div>
                      ) : (
                        <input type="text" value={topicInput} onChange={(e) => setTopicInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleGenerateLesson()}
                          placeholder="Topic likho... (e.g. Microorganisms)"
                          className="flex-1 min-w-0 px-3 sm:px-5 py-3 sm:py-3.5 rounded-xl bg-theme-input border border-theme-border text-white text-sm sm:text-base placeholder-gray-600 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all" />
                      )}
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleGenerateLesson}
                        disabled={user?.subscription !== 'pro' && (user?.xp ?? 0) < 10}
                        className={`px-4 sm:px-6 py-3 sm:py-3.5 rounded-xl font-bold shadow-lg flex-shrink-0 ${
                          user?.subscription !== 'pro' && (user?.xp ?? 0) < 10
                            ? 'bg-gray-600 text-gray-400 cursor-not-allowed shadow-none'
                            : 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-violet-500/25'
                        }`}>
                        <Sparkles className="w-5 h-5" />
                      </motion.button>
                    </div>
                    <p className="text-xs text-amber-400/70 mt-2">⚡ 10 XP per lesson</p>
                    {lessonError && <p className="text-red-400 text-sm mt-1">{lessonError}</p>}
                  </motion.div>
                </div>
              )}

              {/* Loading state */}
              {lessonLoading && (
                <div className="flex-1 flex items-center justify-center">
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} className="text-6xl mb-4 inline-block">
                      {selectedCharacter.emoji}
                    </motion.div>
                    <div className="flex items-center gap-2 justify-center text-violet-400">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span className="font-medium">{selectedCharacter.name} lesson tayyar kar raha hai...</span>
                    </div>
                    <p className="text-theme-text-muted text-sm mt-2">Gemini AI se script generate ho rahi hai</p>
                  </motion.div>
                </div>
              )}

              {/* Lesson Player */}
              {lessonSlides.length > 0 && !lessonLoading && (
                <div className="flex-1 flex flex-col overflow-hidden">
                  <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                    {/* Character + Slide Content */}
                    <div className="flex-1 flex flex-col items-center justify-center p-3 sm:p-6 relative overflow-y-auto">
                      <div className="absolute top-2 sm:top-4 right-2 sm:right-4 px-2 sm:px-3 py-1 rounded-full bg-violet-500/20 text-violet-400 text-[10px] sm:text-xs font-bold">
                        Slide {currentSlide + 1} / {lessonSlides.length}
                      </div>

                      {/* Character with speaking animation */}
                      <motion.div animate={isSpeaking ? { scale: [1, 1.05, 1] } : {}} transition={{ duration: 0.5, repeat: isSpeaking ? Infinity : 0 }} className="mb-4">
                        <div className="relative">
                          <span className="text-6xl sm:text-8xl block">{selectedCharacter.emoji}</span>
                          {isSpeaking && (
                            <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1, repeat: Infinity }}
                              className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
                              <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                              <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                              <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                            </motion.div>
                          )}
                        </div>
                        <div className="text-center mt-1">
                          <span className="text-sm font-bold text-white">{selectedCharacter.name}</span>
                          {isSpeaking && <span className="text-xs text-violet-400 ml-2">Speaking...</span>}
                        </div>
                      </motion.div>

                      {/* Slide Content */}
                      <AnimatePresence mode="wait">
                        <motion.div key={currentSlide} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="w-full max-w-lg">
                          <div className="p-3 sm:p-5 rounded-2xl bg-gradient-to-br from-violet-500/10 to-cyan-500/10 border border-violet-500/20">
                            <div className="flex items-center gap-2 mb-2 sm:mb-3">
                              <span className="text-lg sm:text-xl">{lessonSlides[currentSlide]?.emoji}</span>
                              <h3 className="text-base sm:text-lg font-bold text-white">{lessonSlides[currentSlide]?.title}</h3>
                            </div>
                            <p className="text-gray-200 leading-relaxed text-xs sm:text-sm whitespace-pre-line">{lessonSlides[currentSlide]?.text}</p>
                          </div>
                        </motion.div>
                      </AnimatePresence>
                    </div>

                    {/* Slide List Sidebar */}
                    <div className="w-full md:w-64 border-t md:border-t-0 md:border-l border-theme-border overflow-y-auto p-2 sm:p-3 max-h-32 md:max-h-none">
                      <h4 className="text-xs text-theme-text-muted font-bold uppercase mb-2 px-1">Slides</h4>
                      {lessonSlides.map((slide, idx) => (
                        <button key={idx} onClick={() => { cancelSpeech(); setIsSpeaking(false); setIsPlaying(false); setCurrentSlide(idx); }}
                          className={`w-full text-left p-2.5 rounded-xl mb-1.5 transition-all text-sm ${
                            idx === currentSlide
                              ? 'bg-violet-500/20 border border-violet-500/30 text-white'
                              : idx < currentSlide
                                ? 'bg-emerald-500/5 border border-emerald-500/10 text-theme-text-secondary'
                                : 'bg-theme-input border border-theme-border text-theme-text-muted hover:bg-theme-card'
                          }`}>
                          <div className="flex items-center gap-2">
                            <span className="text-base">{slide.emoji}</span>
                            <span className="truncate font-medium">{slide.title}</span>
                          </div>
                        </button>
                      ))}
                      <button onClick={() => { cancelSpeech(); setLessonSlides([]); setCurrentSlide(0); setIsPlaying(false); setIsSpeaking(false); }}
                        className="w-full mt-3 p-2.5 rounded-xl bg-theme-input border border-theme-border text-theme-text-muted text-sm hover:text-violet-400 hover:border-violet-500/20 transition-all">
                        + Naya Topic
                      </button>
                    </div>
                  </div>

                  {/* Playback Controls */}
                  <div className="p-2 sm:p-4 border-t border-theme-border flex items-center justify-center gap-2 sm:gap-4 flex-wrap sm:flex-nowrap">
                    <motion.button whileTap={{ scale: 0.9 }} onClick={handlePrevSlide} disabled={currentSlide === 0}
                      className="p-1.5 sm:p-2 rounded-xl text-theme-text-secondary hover:text-white disabled:opacity-30 transition-all">
                      <SkipBack className="w-4 h-4 sm:w-5 sm:h-5" />
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={handlePlayPause}
                      className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-gradient-to-r from-violet-500 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-violet-500/30">
                      {isPlaying ? <Pause className="w-5 h-5 sm:w-6 sm:h-6" /> : <Play className="w-5 h-5 sm:w-6 sm:h-6 ml-0.5" />}
                    </motion.button>
                    <motion.button whileTap={{ scale: 0.9 }} onClick={handleNextSlide} disabled={currentSlide === lessonSlides.length - 1}
                      className="p-1.5 sm:p-2 rounded-xl text-theme-text-secondary hover:text-white disabled:opacity-30 transition-all">
                      <SkipForward className="w-4 h-4 sm:w-5 sm:h-5" />
                    </motion.button>
                    <div className="flex-1 max-w-[8rem] sm:max-w-xs mx-2 sm:mx-4">
                      <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                        <motion.div animate={{ width: `${((currentSlide + 1) / lessonSlides.length) * 100}%` }}
                          className="h-full bg-gradient-to-r from-violet-500 to-purple-600 rounded-full" />
                      </div>
                    </div>
                    <motion.button whileTap={{ scale: 0.9 }} onClick={() => speakSlide(currentSlide, false)}
                      className="p-1.5 sm:p-2 rounded-xl text-theme-text-secondary hover:text-violet-400 transition-all" title="Speak this slide">
                      <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    </motion.button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* AI CHAT TAB */}
          {activeTab === 'chat' && (
            <div className="flex flex-col h-full">
              <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-3 sm:space-y-4">
                {messages.map((msg, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      msg.role === 'bot'
                        ? 'bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/20'
                        : 'bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20'
                    }`}>
                      {msg.role === 'bot' ? <Bot className="w-5 h-5 text-white" /> : <User className="w-5 h-5 text-white" />}
                    </div>
                    <div className={`max-w-[85%] sm:max-w-lg p-3 sm:p-4 rounded-2xl ${
                      msg.role === 'bot'
                        ? 'bg-theme-input border border-theme-border text-gray-200'
                        : 'bg-violet-500/20 border border-violet-500/20 text-white'
                    }`}>
                      <p className="text-sm leading-relaxed whitespace-pre-line">{msg.text}</p>
                      {msg.role === 'bot' && (
                        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-theme-border">
                          <button className="text-theme-text-muted hover:text-violet-400 transition-colors">
                            <Volume2 className="w-4 h-4" />
                          </button>
                          <button className="text-theme-text-muted hover:text-violet-400 transition-colors">
                            <Copy className="w-4 h-4" />
                          </button>
                          <button className="text-theme-text-muted hover:text-emerald-400 transition-colors">
                            <ThumbsUp className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="p-2 sm:p-4 border-t border-theme-border">
                <div className="flex gap-2 sm:gap-3">
                  <input type="text" value={message} onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder="Apna sawal likho..."
                    className="flex-1 min-w-0 px-3 sm:px-5 py-2.5 sm:py-3.5 rounded-xl bg-theme-input border border-theme-border text-white text-sm sm:text-base placeholder-gray-600 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all" />
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleSend}
                    disabled={user?.subscription !== 'pro' && (user?.xp ?? 0) < 5}
                    className={`px-3 sm:px-5 py-2.5 sm:py-3.5 rounded-xl shadow-lg flex-shrink-0 ${
                      user?.subscription !== 'pro' && (user?.xp ?? 0) < 5
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed shadow-none'
                        : 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-violet-500/25'
                    }`}>
                    <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                  </motion.button>
                </div>
                <div className="flex items-center justify-between mt-2 text-xs text-gray-600">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3 h-3" />
                    Powered by Gemini AI - Hindi &amp; English supported
                  </div>
                  <span className="text-amber-400/70">⚡ 5 XP per message</span>
                </div>
              </div>
            </div>
          )}

          {/* NOTES TAB */}
          {activeTab === 'notes' && (
            <div className="p-6 space-y-4 overflow-y-auto h-full">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-5 h-5 text-violet-400" />
                <h3 className="text-lg font-bold text-white">Chapter Notes</h3>
              </div>
              {lessonSlides.length > 0 ? (
                lessonSlides.map((slide, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                    className="p-5 rounded-xl bg-theme-input border border-theme-border">
                    <h4 className="font-bold text-violet-400 mb-2">{slide.emoji} {slide.title}</h4>
                    <p className="text-gray-300 text-sm whitespace-pre-line leading-relaxed">{slide.text}</p>
                  </motion.div>
                ))
              ) : (
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                  className="p-5 rounded-xl bg-theme-input border border-theme-border">
                  <h4 className="font-bold text-violet-400 mb-2">AI Generated Notes</h4>
                  <p className="text-gray-300 text-sm whitespace-pre-line leading-relaxed">
                    Pehle &quot;AI Video&quot; tab mein ek lesson generate karo — phir notes yahan dikhenge.
                  </p>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Membership Prompt Modal */}
      <MembershipPrompt
        show={showMembershipPrompt}
        onClose={() => setShowMembershipPrompt(false)}
        currentXP={user?.xp ?? 0}
        requiredXP={membershipPromptInfo.requiredXP}
        feature={membershipPromptInfo.feature}
      />
    </div>
  );
}
