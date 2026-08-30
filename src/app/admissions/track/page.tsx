'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Search, CheckCircle2, Clock, Calendar, AlertCircle, Sparkles, Building2, User, ArrowRight } from 'lucide-react';
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
        return { label: 'Enrolled & Portal Active', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
      case 'APPROVED':
        return { label: 'Approved for Enrollment', color: 'bg-blue-100 text-blue-800 border-blue-300' };
      case 'INTERVIEW_SCHEDULED':
        return { label: 'Interview Scheduled', color: 'bg-purple-100 text-purple-800 border-purple-300' };
      case 'UNDER_REVIEW':
        return { label: 'Under Review', color: 'bg-amber-100 text-amber-800 border-amber-300' };
      case 'REJECTED':
        return { label: 'Application Rejected', color: 'bg-red-100 text-red-800 border-red-300' };
      default:
        return { label: 'Application Submitted', color: 'bg-slate-100 text-slate-800 border-slate-300' };
    }
  };

  return (
    <div className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-10">
      <div className="text-center mb-8">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider">
          <Search className="w-3.5 h-3.5" />
          Live Application Tracker
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
          Track Admission Application Status
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Enter your application code (e.g. THMS-APP-2026-0042) to check verification progress.
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-200 mb-8">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Enter Application Code (e.g. THMS-APP-2026-0042)"
              value={applicationNo}
              onChange={(e) => setApplicationNo(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !applicationNo}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow transition-all flex items-center gap-1.5"
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
            className="font-mono text-blue-600 hover:underline font-bold"
          >
            THMS-APP-2026-0042
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Application Status Card */}
      {appData && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 space-y-6 animate-in fade-in">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Application Tracking Code
              </span>
              <h3 className="text-xl font-mono font-extrabold text-blue-950">
                {appData.applicationNo}
              </h3>
            </div>
            <div>
              {(() => {
                const badge = getStatusBadge(appData.status);
                return (
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border shadow-sm ${badge.color}`}>
                    {badge.label}
                  </span>
                );
              })()}
            </div>
          </div>

          {/* Applicant Details */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div>
              <span className="text-slate-500 block text-[10px]">Student Name:</span>
              <strong className="text-slate-900">{appData.fullName}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Applying Class:</span>
              <strong className="text-blue-900">{appData.applyingClassName}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Submission Date:</span>
              <strong className="text-slate-800">
                {new Date(appData.createdAt).toLocaleDateString('en-GB')}
              </strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Father / Guardian:</span>
              <strong className="text-slate-900">{appData.fatherName}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Contact Phone:</span>
              <strong className="text-slate-900">{appData.fatherPhone}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Location:</span>
              <strong className="text-slate-900">{appData.area}, {appData.city}</strong>
            </div>
          </div>

          {/* Office Review Note */}
          {appData.reviewNotes && (
            <div className="p-4 bg-blue-50/80 rounded-2xl border border-blue-200 text-xs text-blue-950 space-y-1">
              <span className="font-bold block text-[11px] uppercase tracking-wider text-blue-700">
                Admissions Office Remarks:
              </span>
              <p className="leading-relaxed">{appData.reviewNotes}</p>
            </div>
          )}

          {/* Enrolled Details if approved */}
          {appData.status === 'ENROLLED' && (
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-300 text-xs text-emerald-950 space-y-3">
              <div className="flex items-center gap-2 font-bold text-sm text-emerald-900">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Official Enrollment Completed!</span>
              </div>
              <p className="text-[11px] text-emerald-800">
                Your student portal account and digital identity card are ready.
              </p>
              <div className="pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow"
                >
                  <span>Login to Student Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function TrackApplicationPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      <Suspense fallback={<div className="p-12 text-center text-xs text-slate-400">Loading tracker...</div>}>
        <TrackContent />
      </Suspense>
    </div>
  );
}
