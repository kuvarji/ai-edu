import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft, Send, Bot, User, BookOpen, MessageCircle,
  FileText, Play, Volume2, Sparkles, ThumbsUp, Copy,
} from 'lucide-react';
import { aiApi } from '../services/api';

export default function ClassroomPage() {
  const { courseId } = useParams();
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'chat' | 'notes' | 'video'>('chat');
  const [messages, setMessages] = useState([
    { role: 'bot' as const, text: 'Namaste! Main tumhara AI Teacher hu. Aaj hum Quadratic Equations padhenge. Koi bhi sawal poocho!' },
    { role: 'user' as const, text: 'Quadratic equation kya hota hai?' },
    { role: 'bot' as const, text: 'Bahut accha sawal! 🎯\n\nQuadratic equation ek aisi equation hoti hai jismein variable ki highest power 2 hoti hai.\n\n**General Form:** ax² + bx + c = 0\n\nJahan:\n- a, b, c constants hain\n- a ≠ 0 (agar a = 0, toh yeh linear equation ban jayega)\n- x variable hai\n\n**Example:** x² + 5x + 6 = 0\n\nKya tum iska solution nikalna chahoge? 🤔' },
  ]);

  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!message.trim() || sending) return;
    const userMsg = message;
    setMessages((prev) => [...prev, { role: 'user' as const, text: userMsg }]);
    setMessage('');
    setSending(true);
    try {
      const res = await aiApi.chat({ message: userMsg, subject: 'Mathematics', chapter: 'Quadratic Equations' });
      setMessages((prev) => [...prev, { role: 'bot' as const, text: res.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'bot' as const, text: 'Sorry, abhi response nahi aa paya. Please dobara try karo.' },
      ]);
    } finally {
      setSending(false);
    }
  };

  const notes = [
    { title: 'Quadratic Equation Definition', content: 'ax² + bx + c = 0, where a ≠ 0' },
    { title: 'Methods to Solve', content: '1. Factoring\n2. Quadratic Formula\n3. Completing the Square' },
    { title: 'Quadratic Formula', content: 'x = (-b ± √(b²-4ac)) / 2a' },
    { title: 'Discriminant', content: 'D = b²-4ac\nD > 0: Two real roots\nD = 0: One root\nD < 0: No real roots' },
  ];

  return (
    <div className="min-h-screen bg-gray-950 pt-20 pb-4 px-4">
      <div className="max-w-7xl mx-auto h-[calc(100vh-6rem)] flex flex-col">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-4"
        >
          <div className="flex items-center gap-4">
            <Link to={`/courses/${courseId}`} className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-white">Quadratic Equations</h1>
              <p className="text-sm text-gray-500">Mathematics - Chapter 4</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-3 h-3 rounded-full bg-emerald-400"
            />
            <span className="text-sm text-emerald-400 font-medium">AI Teacher Online</span>
          </div>
        </motion.div>

        {/* Tab Buttons */}
        <div className="flex gap-2 mb-4">
          {[
            { key: 'chat' as const, label: 'AI Chat', icon: MessageCircle },
            { key: 'notes' as const, label: 'Notes', icon: FileText },
            { key: 'video' as const, label: 'Video', icon: Play },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <motion.button
                key={tab.key}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeTab === tab.key
                    ? 'bg-violet-500/20 text-violet-400 border border-violet-500/20'
                    : 'bg-gray-900/50 text-gray-400 border border-white/5 hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </motion.button>
            );
          })}
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden rounded-2xl bg-gray-900/50 border border-white/5">
          {activeTab === 'chat' && (
            <div className="flex flex-col h-full">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      msg.role === 'bot'
                        ? 'bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/20'
                        : 'bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20'
                    }`}>
                      {msg.role === 'bot' ? <Bot className="w-5 h-5 text-white" /> : <User className="w-5 h-5 text-white" />}
                    </div>
                    <div className={`max-w-lg p-4 rounded-2xl ${
                      msg.role === 'bot'
                        ? 'bg-white/5 border border-white/10 text-gray-200'
                        : 'bg-violet-500/20 border border-violet-500/20 text-white'
                    }`}>
                      <p className="text-sm leading-relaxed whitespace-pre-line">{msg.text}</p>
                      {msg.role === 'bot' && (
                        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/5">
                          <button className="text-gray-500 hover:text-violet-400 transition-colors">
                            <Volume2 className="w-4 h-4" />
                          </button>
                          <button className="text-gray-500 hover:text-violet-400 transition-colors">
                            <Copy className="w-4 h-4" />
                          </button>
                          <button className="text-gray-500 hover:text-emerald-400 transition-colors">
                            <ThumbsUp className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Input */}
              <div className="p-4 border-t border-white/5">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Apna sawal likho... (Hindi ya English)"
                    className="flex-1 px-5 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSend}
                    className="px-5 py-3.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/25"
                  >
                    <Send className="w-5 h-5" />
                  </motion.button>
                </div>
                <div className="flex items-center gap-2 mt-2 text-xs text-gray-600">
                  <Sparkles className="w-3 h-3" />
                  Powered by Gemini AI - Hindi & English supported
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="p-6 space-y-4 overflow-y-auto h-full">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-5 h-5 text-violet-400" />
                <h3 className="text-lg font-bold text-white">Chapter Notes</h3>
              </div>
              {notes.map((note, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-5 rounded-xl bg-white/5 border border-white/10"
                >
                  <h4 className="font-bold text-violet-400 mb-2">{note.title}</h4>
                  <p className="text-gray-300 text-sm whitespace-pre-line leading-relaxed">{note.content}</p>
                </motion.div>
              ))}
            </div>
          )}

          {activeTab === 'video' && (
            <div className="p-6 flex items-center justify-center h-full">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <div className="w-full max-w-2xl aspect-video rounded-2xl bg-gradient-to-br from-violet-500/10 to-cyan-500/10 border border-white/10 flex items-center justify-center mb-6">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-xl shadow-violet-500/30 cursor-pointer"
                  >
                    <Play className="w-8 h-8 text-white ml-1" />
                  </motion.div>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">AI Video Lesson</h3>
                <p className="text-gray-400">AI teacher animated character ke saath seekho</p>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
