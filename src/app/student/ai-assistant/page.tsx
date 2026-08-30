'use client';

import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  BookOpen, 
  HelpCircle, 
  Zap, 
  Award, 
  Copy, 
  Check, 
  RefreshCw, 
  Compass, 
  Cpu, 
  Calculator, 
  Atom, 
  Languages, 
  FileText 
} from 'lucide-react';
import PortalCircularLoader from '@/components/common/PortalCircularLoader';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  subject?: string;
}

export default function StudentAIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: `Hello! I am your **THMS AI Academic Copilot** 🎓. I am trained on your school curriculum, BISE Peshawar standards, textbooks, and past papers.\n\nHow can I help you today? You can ask me to explain any tough concept, solve numerical problems, create practice quizzes, or summarize chapters!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('Mathematics');
  const [activeMode, setActiveMode] = useState<'EXPLAIN' | 'QUIZ' | 'SUMMARY'>('EXPLAIN');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const subjects = [
    { name: 'Mathematics', icon: Calculator, color: 'text-orange-600 bg-orange-50' },
    { name: 'Physics', icon: Atom, color: 'text-blue-600 bg-blue-50' },
    { name: 'Chemistry', icon: Compass, color: 'text-purple-600 bg-purple-50' },
    { name: 'Biology', icon: Sparkles, color: 'text-emerald-600 bg-emerald-50' },
    { name: 'Computer Science', icon: Cpu, color: 'text-cyan-600 bg-cyan-50' },
    { name: 'English Grammar', icon: Languages, color: 'text-pink-600 bg-pink-50' },
  ];

  const quickPrompts = [
    'Explain quadratic formula and proofs with steps',
    'What is Newton’s Third Law of Motion with practical examples?',
    'Summarize Photosynthesis light and dark reactions',
    'How do arrays and loops work in Computer Science?',
    'Explain active and passive voice rules with examples',
  ];

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      subject: selectedSubject,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      const res = await fetch('/api/student/ai-tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: textToSend,
          subject: selectedSubject,
          mode: activeMode,
        }),
      });

      const data = await res.json();
      if (data.success && data.aiResponse) {
        const aiMsg: Message = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: data.aiResponse,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          subject: selectedSubject,
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        const errorMsg: Message = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: 'I apologize, I encountered a brief glitch while generating the study answer. Please try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, errorMsg]);
      }
    } catch {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: 'Network connection issue. Please verify your connection and try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-orange-950/80 text-white p-6 sm:p-8 shadow-xl border border-orange-500/20">
        <div className="absolute right-0 top-0 w-80 h-80 bg-orange-500/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 text-orange-300 text-xs font-black border border-orange-400/30">
              <Sparkles className="w-3.5 h-3.5 text-orange-400 animate-spin" />
              <span>THMS AI Academic Copilot • 24/7 Study Support</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              AI Curriculum Study Assistant
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-medium">
              Ask questions about your daily subjects, generate instant practice quizzes, and get step-by-step homework guidance.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveMode('EXPLAIN')}
              className={`px-3.5 py-2 rounded-2xl text-xs font-black transition-all ${
                activeMode === 'EXPLAIN' ? 'bg-orange-500 text-white shadow-md' : 'bg-white/10 text-slate-300 hover:bg-white/20'
              }`}
            >
              📖 Explain
            </button>
            <button
              onClick={() => setActiveMode('QUIZ')}
              className={`px-3.5 py-2 rounded-2xl text-xs font-black transition-all ${
                activeMode === 'QUIZ' ? 'bg-orange-500 text-white shadow-md' : 'bg-white/10 text-slate-300 hover:bg-white/20'
              }`}
            >
              📝 Practice Quiz
            </button>
            <button
              onClick={() => setActiveMode('SUMMARY')}
              className={`px-3.5 py-2 rounded-2xl text-xs font-black transition-all ${
                activeMode === 'SUMMARY' ? 'bg-orange-500 text-white shadow-md' : 'bg-white/10 text-slate-300 hover:bg-white/20'
              }`}
            >
              📚 Summary
            </button>
          </div>
        </div>
      </div>

      {/* Subject Quick Selector Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {subjects.map((sub) => {
          const Icon = sub.icon;
          const isSelected = selectedSubject === sub.name;
          return (
            <button
              key={sub.name}
              onClick={() => setSelectedSubject(sub.name)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black shrink-0 flex items-center gap-2 transition-all ${
                isSelected
                  ? 'bg-slate-900 text-white shadow-md scale-105'
                  : 'bg-white text-slate-700 hover:bg-orange-50 border border-slate-200'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-orange-400' : 'text-orange-600'}`} />
              <span>{sub.name}</span>
            </button>
          );
        })}
      </div>

      {/* Interactive Chat Window */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col h-[520px] overflow-hidden">
        
        {/* Messages List Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg) => {
            const isAI = msg.sender === 'ai';
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${isAI ? '' : 'flex-row-reverse'}`}
              >
                <div
                  className={`w-9 h-9 rounded-2xl flex items-center justify-center text-xs font-black shrink-0 shadow-sm ${
                    isAI
                      ? 'bg-gradient-to-tr from-orange-500 to-amber-500 text-white'
                      : 'bg-slate-900 text-white'
                  }`}
                >
                  {isAI ? <Bot className="w-5 h-5" /> : <User className="w-4 h-4" />}
                </div>

                <div
                  className={`max-w-2xl rounded-3xl p-4 sm:p-5 text-xs leading-relaxed font-medium space-y-2 relative group ${
                    isAI
                      ? 'bg-slate-50 border border-slate-200 text-slate-800'
                      : 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-md'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.text}</div>

                  <div className={`flex items-center justify-between pt-1 text-[10px] ${isAI ? 'text-slate-400' : 'text-orange-200'}`}>
                    <span>{msg.timestamp}</span>
                    {isAI && (
                      <button
                        onClick={() => handleCopy(msg.id, msg.text)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-slate-200 text-slate-600 flex items-center gap-1"
                        title="Copy note"
                      >
                        {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5 animate-pulse" />
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-3xl p-4 text-xs font-bold text-slate-600 flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-orange-600" />
                <span>AI Tutor is preparing your explanation & study notes...</span>
              </div>
            </div>
          )}
        </div>

        {/* Suggested Quick Prompts */}
        <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider shrink-0">Quick Ideas:</span>
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p)}
              className="px-3 py-1 rounded-xl bg-white border border-slate-200 text-[11px] font-bold text-slate-700 hover:text-orange-600 hover:border-orange-200 shrink-0 transition-colors"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-200 flex items-center gap-2">
          <input
            type="text"
            placeholder={`Ask a question in ${selectedSubject} (e.g. explain formula, solve theorem)...`}
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
            className="flex-1 px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 outline-none focus:ring-2 focus:ring-orange-500"
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !inputQuery.trim()}
            className="p-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-black shadow-md shadow-orange-500/25 transition-all hover:scale-105 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
}
