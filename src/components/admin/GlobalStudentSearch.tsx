'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  Users, 
  GraduationCap, 
  CreditCard, 
  DollarSign, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  UserCheck, 
  Sparkles, 
  X, 
  ChevronRight, 
  Edit3, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  BookOpen, 
  Award,
  Loader2,
  AlertCircle,
  FileText,
  Maximize2
} from 'lucide-react';

export default function GlobalStudentSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close auto-suggest on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const handler = setTimeout(() => {
      fetch(`/api/students?q=${encodeURIComponent(query.trim())}&limit=8`)
        .then((res) => res.json())
        .then((data) => {
          if (data.students) {
            setResults(data.students);
            setIsOpen(true);
            setSelectedIndex(0);
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }, 200);

    return () => clearTimeout(handler);
  }, [query]);

  // Navigate directly to full screen Student 360 profile
  const handleOpenStudentProfile = (student: any) => {
    setIsOpen(false);
    setQuery('');
    const targetId = student.studentId || student.id;
    router.push(`/admin/students/${targetId}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        handleOpenStudentProfile(results[selectedIndex]);
      }
    }
  };

  return (
    <div className="relative w-full max-w-lg" ref={searchContainerRef}>
      {/* Search Input Bar */}
      <div className="relative flex items-center">
        <Search className="w-4 h-4 text-blue-600 absolute left-3.5 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search student by Name, ID, Roll, or Father Phone..."
          value={query}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full pl-10 pr-24 py-2.5 text-xs rounded-2xl border border-slate-200 bg-white/95 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm font-medium transition-all"
        />

        {loading ? (
          <div className="absolute right-3.5 flex items-center">
            <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
          </div>
        ) : (
          <div className="absolute right-2.5 flex items-center gap-1.5">
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-mono font-bold text-slate-500 bg-slate-100 border border-slate-200 rounded-lg">
              Ctrl K
            </kbd>
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setResults([]);
                  setIsOpen(false);
                }}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Auto-suggestions Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-2.5 bg-white rounded-3xl border border-slate-200 shadow-2xl z-50 overflow-hidden text-slate-900 divide-y divide-slate-100 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-3 bg-slate-50/90 border-b border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-600">
            <span className="flex items-center gap-1.5 text-blue-700">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Matching Students ({results.length})</span>
            </span>
            <span className="text-[10px] text-slate-400 font-normal">
              Press Enter or click to open Full Screen 360° Profile
            </span>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {results.map((st, idx) => {
              const isSelected = selectedIndex === idx;
              return (
                <div
                  key={st.id}
                  onClick={() => handleOpenStudentProfile(st)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`p-3.5 transition-all flex items-center justify-between cursor-pointer group ${
                    isSelected ? 'bg-blue-50/90 border-l-4 border-l-blue-600 pl-3' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#0a192f] via-[#1e3a8a] to-[#2563eb] text-white font-bold flex items-center justify-center text-xs shadow-sm overflow-hidden shrink-0 border border-blue-200">
                      {st.photoUrl ? (
                        <img src={st.photoUrl} alt={st.fullName} className="w-full h-full object-cover" />
                      ) : (
                        st.fullName?.charAt(0) || 'S'
                      )}
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <strong className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {st.fullName}
                        </strong>
                        <span className="font-mono text-[10px] font-bold text-blue-900 bg-blue-100/70 px-2 py-0.5 rounded-md border border-blue-200">
                          {st.studentId}
                        </span>
                        <span className="font-mono text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                          Roll: {st.rollNo}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-500 flex items-center gap-2">
                        <span>{st.class?.name || 'Class 8'} ({st.section?.name || 'A'})</span>
                        <span>•</span>
                        <span>Father: <strong className="text-slate-700">{st.parent?.fatherName || 'N/A'}</strong></span>
                        {st.parent?.fatherPhone && (
                          <>
                            <span>•</span>
                            <span className="font-mono text-slate-600">{st.parent.fatherPhone}</span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 bg-blue-600 text-white text-[10px] font-bold rounded-xl shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                      <Maximize2 className="w-3 h-3" />
                      <span>Open Full 360°</span>
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all shrink-0" />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-2.5 bg-slate-50 text-center text-[10px] text-slate-400 font-medium">
            Clicking any student opens their complete 11-tab 360° Dossier &amp; Family Intelligence in full screen
          </div>
        </div>
      )}
    </div>
  );
}
