'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  Users, 
  GraduationCap, 
  DollarSign, 
  Building2, 
  Sparkles, 
  X, 
  ChevronRight, 
  Loader2,
  FileText,
  UserCheck,
  BookOpen
} from 'lucide-react';

export default function GlobalStudentSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{
    students: any[];
    teachers: any[];
    admissions: any[];
    fees: any[];
    classes: any[];
  }>({
    students: [],
    teachers: [],
    admissions: [],
    fees: [],
    classes: [],
  });
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

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

  // Close on outside click
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
      setResults({ students: [], teachers: [], admissions: [], fees: [], classes: [] });
      setLoading(false);
      return;
    }

    setLoading(true);
    const handler = setTimeout(() => {
      fetch(`/api/admin/global-search?q=${encodeURIComponent(query.trim())}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.results) {
            setResults(data.results);
            setIsOpen(true);
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }, 200);

    return () => clearTimeout(handler);
  }, [query]);

  const handleNavigate = (url: string) => {
    setIsOpen(false);
    setQuery('');
    router.push(url);
  };

  const totalResultsCount =
    results.students.length +
    results.teachers.length +
    results.admissions.length +
    results.fees.length +
    results.classes.length;

  return (
    <div className="relative w-full max-w-lg" ref={searchContainerRef}>
      {/* Search Input Bar */}
      <div className="relative flex items-center">
        <Search className="w-4 h-4 text-[#2563EB] absolute left-3.5 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Omni-search: Student, Teacher, Invoice, Admission, Class..."
          value={query}
          onFocus={() => {
            if (totalResultsCount > 0) setIsOpen(true);
          }}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-10 pr-24 py-2.5 text-xs rounded-2xl border border-[#E2E8F0] bg-white text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] shadow-sm font-medium transition-all"
        />

        {loading ? (
          <div className="absolute right-3.5 flex items-center">
            <Loader2 className="w-4 h-4 text-[#2563EB] animate-spin" />
          </div>
        ) : (
          <div className="absolute right-2.5 flex items-center gap-1.5">
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-mono font-bold text-[#64748B] bg-[#F1F5F9] border border-[#E2E8F0] rounded-lg">
              Ctrl K
            </kbd>
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setResults({ students: [], teachers: [], admissions: [], fees: [], classes: [] });
                  setIsOpen(false);
                }}
                className="p-1 text-[#94A3B8] hover:text-[#475569] rounded-md"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Categorized Omni-Search Dropdown */}
      {isOpen && totalResultsCount > 0 && (
        <div className="absolute left-0 right-0 top-full mt-2.5 bg-white rounded-3xl border border-[#E2E8F0] shadow-2xl z-50 overflow-hidden text-[#0F172A] divide-y divide-[#F1F5F9] animate-in fade-in duration-200">
          <div className="p-3 bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center justify-between text-[11px] font-bold text-[#475569]">
            <span className="flex items-center gap-1.5 text-[#2563EB]">
              <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>{totalResultsCount} Record(s) Found</span>
            </span>
            <span className="text-[10px] text-[#64748B]">Click any result to open record</span>
          </div>

          <div className="max-h-96 overflow-y-auto p-2 space-y-3">
            {/* Students Section */}
            {results.students.length > 0 && (
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#64748B] px-2 flex items-center gap-1">
                  <GraduationCap className="w-3 h-3 text-[#2563EB]" />
                  <span>Enrolled Students</span>
                </span>
                {results.students.map((st) => (
                  <button
                    key={st.id}
                    onClick={() => handleNavigate(st.url)}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-[#EFF6FF] flex items-center justify-between group transition-colors"
                  >
                    <div>
                      <p className="text-xs font-bold text-[#0F172A] group-hover:text-[#2563EB]">
                        {st.title}
                      </p>
                      <p className="text-[11px] text-[#64748B]">{st.subtitle}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#2563EB]" />
                  </button>
                ))}
              </div>
            )}

            {/* Teachers Section */}
            {results.teachers.length > 0 && (
              <div className="space-y-1 pt-1 border-t border-[#F1F5F9]">
                <span className="text-[10px] uppercase font-bold text-[#64748B] px-2 flex items-center gap-1">
                  <UserCheck className="w-3 h-3 text-[#2563EB]" />
                  <span>Faculty & Staff</span>
                </span>
                {results.teachers.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleNavigate(t.url)}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-[#EFF6FF] flex items-center justify-between group transition-colors"
                  >
                    <div>
                      <p className="text-xs font-bold text-[#0F172A] group-hover:text-[#2563EB]">
                        {t.title}
                      </p>
                      <p className="text-[11px] text-[#64748B]">{t.subtitle}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#2563EB]" />
                  </button>
                ))}
              </div>
            )}

            {/* Admissions Section */}
            {results.admissions.length > 0 && (
              <div className="space-y-1 pt-1 border-t border-[#F1F5F9]">
                <span className="text-[10px] uppercase font-bold text-[#64748B] px-2 flex items-center gap-1">
                  <Users className="w-3 h-3 text-[#2563EB]" />
                  <span>Admissions Pipeline</span>
                </span>
                {results.admissions.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => handleNavigate(a.url)}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-[#EFF6FF] flex items-center justify-between group transition-colors"
                  >
                    <div>
                      <p className="text-xs font-bold text-[#0F172A] group-hover:text-[#2563EB]">
                        {a.title}
                      </p>
                      <p className="text-[11px] text-[#64748B]">{a.subtitle}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#2563EB]" />
                  </button>
                ))}
              </div>
            )}

            {/* Fees Section */}
            {results.fees.length > 0 && (
              <div className="space-y-1 pt-1 border-t border-[#F1F5F9]">
                <span className="text-[10px] uppercase font-bold text-[#64748B] px-2 flex items-center gap-1">
                  <DollarSign className="w-3 h-3 text-[#2563EB]" />
                  <span>Fee Invoices</span>
                </span>
                {results.fees.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => handleNavigate(f.url)}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-[#EFF6FF] flex items-center justify-between group transition-colors"
                  >
                    <div>
                      <p className="text-xs font-bold text-[#0F172A] group-hover:text-[#2563EB]">
                        {f.title}
                      </p>
                      <p className="text-[11px] text-[#64748B]">{f.subtitle}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#2563EB]" />
                  </button>
                ))}
              </div>
            )}

            {/* Classes Section */}
            {results.classes.length > 0 && (
              <div className="space-y-1 pt-1 border-t border-[#F1F5F9]">
                <span className="text-[10px] uppercase font-bold text-[#64748B] px-2 flex items-center gap-1">
                  <BookOpen className="w-3 h-3 text-[#2563EB]" />
                  <span>Academic Classes</span>
                </span>
                {results.classes.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => handleNavigate(c.url)}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-[#EFF6FF] flex items-center justify-between group transition-colors"
                  >
                    <div>
                      <p className="text-xs font-bold text-[#0F172A] group-hover:text-[#2563EB]">
                        {c.title}
                      </p>
                      <p className="text-[11px] text-[#64748B]">{c.subtitle}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#2563EB]" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
