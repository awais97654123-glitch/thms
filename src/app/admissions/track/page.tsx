'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Search, CheckCircle2, Clock, Calendar, AlertCircle, Sparkles, Building2, User, ArrowRight, ShieldCheck } from 'lucide-react';
import Header from '@/components/common/Header';

function TrackContent() {
  const searchParams = useSearchParams();
  const initialAppNo = searchParams.get('appNo') || '';

  const [applicationNo, setApplicationNo] = useState(initialAppNo);
  const [loading, setLoading] = useState(false);
  const [appData, setAppData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async (appNo: string) => {
    if (!appNo || appNo.trim() === '') return;
    setLoading(true);
    setError(null);
    setAppData(null);

    try {
      const res = await fetch(`/api/admissions?q=${encodeURIComponent(appNo.trim())}`);
      const data = await res.json();
      if (res.ok && data.applications && data.applications.length > 0) {
        setAppData(data.applications[0]);
      } else {
        setError('No admission application found matching this tracking code.');
      }
    } catch {
      setError('Failed to check application status.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialAppNo) {
      fetchStatus(initialAppNo);
    }
  }, [initialAppNo]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStatus(applicationNo);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ENROLLED':
        return { label: 'Enrolled & Portal Active', color: 'bg-emerald-50 text-emerald-800 border-emerald-300' };
      case 'APPROVED':
        return { label: 'Approved for Enrollment', color: 'bg-gold-50 text-gold-800 border-gold-400' };
      case 'INTERVIEW_SCHEDULED':
        return { label: 'Interview Scheduled', color: 'bg-navy-50 text-navy-800 border-navy-300' };
      case 'UNDER_REVIEW':
        return { label: 'Under Review', color: 'bg-amber-50 text-amber-800 border-amber-300' };
      case 'REJECTED':
        return { label: 'Application Rejected', color: 'bg-red-50 text-red-800 border-red-300' };
      default:
        return { label: 'Application Submitted', color: 'bg-slate-100 text-slate-800 border-slate-300' };
    }
  };

  return (
    <div className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-10">
      <div className="text-center mb-8 space-y-2">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-navy-900 border border-gold-500/30 text-gold-400 text-xs font-bold uppercase tracking-wider">
          <Search className="w-3.5 h-3.5" />
          Live Application Tracker
        </span>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-navy-950 tracking-tight">
          Track Admission Application Status
        </h1>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Enter your application code (e.g. THMS-APP-2026-0042) to check verification progress and interview status.
        </p>
      </div>

      {/* Search Bar */}
      <div className="academic-card bg-white p-6 rounded-2xl shadow-xl border border-slate-200 mb-8">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Enter Application Code (e.g. THMS-APP-2026-0042)"
              value={applicationNo}
              onChange={(e) => setApplicationNo(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-gold-500 font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !applicationNo}
            className="px-6 py-2.5 text-navy-950 text-xs font-bold rounded-xl btn-gold-prestige shadow transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            {loading ? <span className="animate-spin">⏳</span> : <Search className="w-4 h-4" />}
            <span>Track</span>
          </button>
        </form>

        {/* Quick Demo Code helper */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>Try sample application:</span>
          <button
            type="button"
            onClick={() => {
              setApplicationNo('THMS-APP-2026-0042');
              fetchStatus('THMS-APP-2026-0042');
            }}
            className="font-mono text-navy-900 hover:text-gold-600 underline font-bold"
          >
            THMS-APP-2026-0042
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs flex items-center gap-2 mb-6">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Application Status Card */}
      {appData && (
        <div className="academic-card bg-white rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-200 space-y-6 animate-in fade-in">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Application Tracking Code
              </span>
              <h3 className="font-serif text-xl font-bold text-navy-950">
                {appData.applicationNo}
              </h3>
            </div>
            <div>
              {(() => {
                const badge = getStatusBadge(appData.status);
                return (
                  <span className={`px-3.5 py-1 rounded-full text-xs font-bold border shadow-sm ${badge.color}`}>
                    {badge.label}
                  </span>
                );
              })()}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px]">Student Name</span>
              <strong className="text-slate-900">{appData.firstName} {appData.lastName}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Applying For</span>
              <strong className="text-navy-900 font-bold">{appData.applyingClass?.name || 'Class 8'}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Father / Guardian</span>
              <strong className="text-slate-900">{appData.fatherName}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Submission Date</span>
              <strong className="text-slate-900">
                {new Date(appData.createdAt).toLocaleDateString()}
              </strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Emergency Phone</span>
              <strong className="text-slate-900">{appData.emergencyPhone || appData.fatherPhone}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Campus Location</span>
              <strong className="text-slate-900">Hayatabad Phase 3</strong>
            </div>
          </div>

          {/* Next Steps Advisory */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
            <h4 className="font-serif text-xs font-bold uppercase tracking-wider text-navy-950">
              Admissions Office Advisory
            </h4>
            <p className="text-xs text-slate-600">
              Please ensure you bring the original B-Form/CNIC and previous school certificate on the date of entry assessment. For any queries, contact the admissions desk at <span className="font-bold text-navy-900">+92 91 5828850</span>.
            </p>
          </div>

          <div className="pt-2 flex justify-between items-center text-xs">
            <Link href="/" className="text-navy-900 hover:text-gold-600 font-semibold">
              ← Return to Main Website
            </Link>
            <Link href="/admissions/apply" className="font-bold text-navy-900 hover:text-gold-600">
              Submit Another Application →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdmissionTrackPage() {
  return (
    <div className="min-h-screen bg-[#faf9f5] flex flex-col selection:bg-gold-500 selection:text-navy-950">
      <Header />
      <Suspense fallback={<div className="flex-1 flex items-center justify-center p-12 text-slate-500 text-xs">Loading Application Tracker...</div>}>
        <TrackContent />
      </Suspense>
    </div>
  );
}
