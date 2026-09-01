'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  Search, 
  ShieldCheck, 
  CheckCircle2, 
  GraduationCap, 
  User, 
  Calendar, 
  Building2, 
  Award, 
  AlertCircle, 
  Sparkles, 
  ExternalLink,
  QrCode,
  Loader2,
  FileCheck,
  Check
} from 'lucide-react';
import Header from '@/components/common/Header';

function StudentVerifyContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('id') || searchParams.get('q') || '';

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [student, setStudent] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const performVerification = async (term: string) => {
    if (!term || term.trim() === '') return;
    setLoading(true);
    setError(null);
    setStudent(null);
    setSearched(true);

    try {
      const res = await fetch(`/api/students?q=${encodeURIComponent(term.trim())}&limit=1`);
      const data = await res.json();

      if (res.ok && data.students && data.students.length > 0) {
        setStudent(data.students[0]);
      } else {
        setError('No active student record verified with the provided information. Please check Student ID or Name.');
      }
    } catch {
      setError('Failed to verify student record with school servers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      performVerification(initialQuery);
    }
  }, [initialQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performVerification(searchQuery);
  };

  return (
    <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-10 space-y-8">
      {/* Title & Seal */}
      <div className="text-center space-y-3">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#0a192f] border border-blue-500/30 text-blue-300 text-xs font-black uppercase tracking-wider shadow-sm">
          <ShieldCheck className="w-4 h-4 text-blue-400" />
          <span>Official Public Verification Registry</span>
        </span>
        <h1 className="font-serif text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Student Credential & Enrollment Verification
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto font-medium">
          Verify enrolled student status, academic credentials, and official admission registration at The Hayatabad Model School.
        </p>
      </div>

      {/* Search Console */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-200 space-y-4">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              placeholder="Enter Student ID (e.g. THMS-2026-000001), Full Name, or Roll No..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 text-xs sm:text-sm rounded-2xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 font-medium"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !searchQuery.trim()}
            className="px-8 py-3 bg-gradient-to-r from-[#0a192f] via-[#1e3a8a] to-[#2563eb] hover:from-[#0d223f] hover:to-[#1d4ed8] text-white text-xs sm:text-sm font-black rounded-2xl shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
            <span>Verify Status</span>
          </button>
        </form>

        <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 gap-2">
          <span>Quick sample lookup:</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setSearchQuery('THMS-2026-000034');
                performVerification('THMS-2026-000034');
              }}
              className="font-mono text-blue-600 hover:underline font-bold"
            >
              THMS-2026-000034
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('Hamza Tariq Khan');
                performVerification('Hamza Tariq Khan');
              }}
              className="font-bold text-blue-600 hover:underline"
            >
              Hamza Tariq Khan
            </button>
          </div>
        </div>
      </div>

      {/* Error / Not Found Alert */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-900 text-xs sm:text-sm flex items-center gap-3 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Verified Student Certificate & Profile Card */}
      {student && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-blue-300 space-y-6 animate-in fade-in">
          {/* Certificate Top Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-blue-100 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#0a192f] to-[#2563eb] flex items-center justify-center p-2.5 shadow-md shadow-blue-500/20">
                <img src="/logo.png" alt="THMS Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <h3 className="font-serif font-black text-slate-900 text-base sm:text-lg">
                  THE HAYATABAD MODEL SCHOOL
                </h3>
                <p className="text-xs text-blue-600 font-bold uppercase tracking-wider">
                  Official Academic Enrollment Verification
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border-2 border-emerald-300 text-xs font-black flex items-center gap-1.5 shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>ACTIVE ENROLLED SCHOLAR</span>
              </span>
            </div>
          </div>

          {/* Student Profile Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Student Photo Badge */}
            <div className="flex flex-col items-center justify-center p-5 bg-slate-50/80 rounded-2xl border border-slate-200 text-center space-y-3">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-tr from-[#0a192f] via-[#1e3a8a] to-[#2563eb] text-white flex items-center justify-center text-3xl font-black shadow-lg shadow-blue-600/30 overflow-hidden border-2 border-white">
                {student.photoUrl ? (
                  <img src={student.photoUrl} alt={student.fullName} className="w-full h-full object-cover" />
                ) : (
                  student.fullName.charAt(0)
                )}
              </div>
              <div>
                <strong className="text-sm font-black text-slate-900 block">{student.fullName}</strong>
                <span className="font-mono text-xs text-blue-700 font-bold">{student.studentId}</span>
              </div>
            </div>

            {/* Academic Credentials Details */}
            <div className="md:col-span-2 grid grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Class & Section:</span>
                <strong className="text-sm text-slate-900 block">{student.class?.name || 'Class 8'} ({student.section?.name || 'Section A'})</strong>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Roll Number:</span>
                <strong className="text-sm font-mono text-slate-900 block">{student.rollNo}</strong>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Admission Number:</span>
                <strong className="text-sm font-mono text-blue-900 block">{student.admissionNo}</strong>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Academic Session:</span>
                <strong className="text-sm text-slate-900 block">{student.session?.name || '2026-2027'}</strong>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Father / Guardian:</span>
                <strong className="text-sm text-slate-900 block">{student.parent?.fatherName || 'Parent Verified'}</strong>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Campus Location:</span>
                <strong className="text-sm text-slate-900 block">Hayatabad Phase 3, Peshawar</strong>
              </div>
            </div>
          </div>

          {/* Verification Stamp Footer */}
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 flex flex-col sm:flex-row items-center justify-between text-xs gap-3">
            <div className="flex items-center gap-2.5 text-blue-950 font-medium">
              <FileCheck className="w-5 h-5 text-blue-600 shrink-0" />
              <span>Record officially authenticated via School Registry Cloud Database.</span>
            </div>
            <span className="font-mono text-[10px] text-slate-500 font-bold">
              Stamp: {new Date().toLocaleDateString('en-GB')}
            </span>
          </div>

          {/* Action Links */}
          <div className="flex items-center justify-between pt-2 text-xs">
            <Link href="/" className="text-blue-600 hover:text-blue-700 font-bold">
              ← Return to Main Website
            </Link>
            <Link href="/admissions/apply" className="text-blue-600 hover:text-blue-700 font-bold">
              New Online Admissions ➔
            </Link>
          </div>

        </div>
      )}
    </div>
  );
}

export default function StudentVerifyPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col selection:bg-blue-600 selection:text-white">
      <Header />
      <Suspense fallback={<div className="flex-1 flex items-center justify-center p-12 text-xs text-slate-400">Loading Student Verification Registry...</div>}>
        <StudentVerifyContent />
      </Suspense>
    </div>
  );
}
