'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, 
  UserPlus, 
  GraduationCap, 
  QrCode, 
  CalendarCheck, 
  DollarSign, 
  TrendingUp, 
  Award, 
  Clock, 
  Megaphone,
  CreditCard,
  Building2,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  UserCheck,
  Layers,
  ArrowRight,
  ShieldCheck,
  Activity,
  ArrowUpRight
} from 'lucide-react';
import QRScannerModal from '@/components/common/QRScanner';

export default function AdminDashboardPage() {
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeAdmissions: 0,
    activeTeachers: 0,
    todayAttendancePct: 0,
    todayPresent: 0,
    todayLate: 0,
    todayFeeCollection: 0,
    pendingFees: 0,
  });

  const [recentAdmissions, setRecentAdmissions] = useState<any[]>([]);
  const [recentPayments, setRecentPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/dashboard-stats')
      .then((res) => res.json())
      .then((data) => {
        if (data.stats) {
          setStats(data.stats);
        }
        if (data.recentAdmissions) setRecentAdmissions(data.recentAdmissions);
        if (data.recentPayments) setRecentPayments(data.recentPayments);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Futuristic Command Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white p-8 sm:p-10 shadow-2xl border border-slate-800/80">
        {/* Ambient Glows */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute left-1/3 bottom-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/20 text-cyan-300 text-xs font-black border border-cyan-400/30 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>THMS Central Control Tower • Session 2026-2027</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              Principal & Office Command Center
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
              Real-time synchronization across student 360 records, online admissions pipeline, gate QR scanner attendance, and automated 3-copy fee billing.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 relative z-10">
            <button
              onClick={() => setShowScannerModal(true)}
              className="px-5 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-black shadow-lg shadow-emerald-500/25 flex items-center gap-2.5 transition-all hover:scale-105"
            >
              <QrCode className="w-4 h-4" />
              <span>Launch Gate QR Scanner</span>
            </button>
            <Link
              href="/admin/admissions"
              className="px-5 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-black shadow-lg shadow-blue-500/25 flex items-center gap-2.5 transition-all hover:scale-105"
            >
              <UserPlus className="w-4 h-4" />
              <span>Admissions Pipeline</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Action Pills Toolbar */}
      <div className="glass-panel p-4 rounded-2xl border border-white shadow-sm flex flex-wrap items-center justify-between gap-3">
        <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-2">
          Fast Actions:
        </span>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/admissions/new"
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-all shadow-md shadow-blue-500/20"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ New Admission</span>
          </Link>
          <Link
            href="/admin/teachers"
            className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100/80 text-emerald-800 border border-emerald-200/80 font-bold text-xs rounded-xl flex items-center gap-2 transition-all"
          >
            <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>+ Faculty Directory</span>
          </Link>
          <Link
            href="/admin/fees"
            className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100/80 text-amber-800 border border-amber-200/80 font-bold text-xs rounded-xl flex items-center gap-2 transition-all"
          >
            <DollarSign className="w-3.5 h-3.5 text-amber-600" />
            <span>+ Record Fee Payment</span>
          </Link>
          <Link
            href="/admin/attendance"
            className="px-3.5 py-2 bg-cyan-50 hover:bg-cyan-100/80 text-cyan-800 border border-cyan-200/80 font-bold text-xs rounded-xl flex items-center gap-2 transition-all"
          >
            <CalendarCheck className="w-3.5 h-3.5 text-cyan-600" />
            <span>Daily Attendance Hub</span>
          </Link>
          <Link
            href="/admin/id-cards"
            className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100/80 text-indigo-800 border border-indigo-200/80 font-bold text-xs rounded-xl flex items-center gap-2 transition-all"
          >
            <CreditCard className="w-3.5 h-3.5 text-indigo-600" />
            <span>ID Card Studio</span>
          </Link>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Students */}
        <div className="glass-panel p-6 rounded-3xl border border-white shadow-sm glass-card-hover space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
              Enrolled Students
            </span>
            <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-600 border border-blue-200/60 shadow-sm">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">{stats.totalStudents}</h3>
            <p className="text-xs text-emerald-600 font-bold flex items-center gap-1.5 mt-1.5">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Active Student Roster</span>
            </p>
          </div>
        </div>

        {/* Teachers */}
        <div className="glass-panel p-6 rounded-3xl border border-white shadow-sm glass-card-hover space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
              Active Faculty
            </span>
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 border border-emerald-200/60 shadow-sm">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">{stats.activeTeachers}</h3>
            <p className="text-xs text-slate-500 font-semibold mt-1.5">
              Subject Faculty Specialists
            </p>
          </div>
        </div>

        {/* Today Fee Collection */}
        <div className="glass-panel p-6 rounded-3xl border border-white shadow-sm glass-card-hover space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
              Today Fee Collection
            </span>
            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-600 border border-amber-200/60 shadow-sm">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">
              Rs. {stats.todayFeeCollection.toLocaleString()}
            </h3>
            <p className="text-xs text-slate-500 font-semibold mt-1.5">
              Verified Official Receipts
            </p>
          </div>
        </div>

        {/* Admissions Pending */}
        <div className="glass-panel p-6 rounded-3xl border border-white shadow-sm glass-card-hover space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
              Admissions Pipeline
            </span>
            <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-600 border border-indigo-200/60 shadow-sm">
              <UserPlus className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">{stats.activeAdmissions}</h3>
            <p className="text-xs text-indigo-600 font-bold mt-1.5">
              Applications In Review
            </p>
          </div>
        </div>
      </div>

      {/* Setup & Onboarding Blueprint Glass Card */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 p-6 sm:p-8 text-white shadow-xl border border-slate-800/80 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <h2 className="text-lg font-black text-white">System Architecture & Modules Status</h2>
            </div>
            <p className="text-xs text-slate-300 font-medium mt-0.5">
              Core academic and administrative engines configured and operational on Neon PostgreSQL.
            </p>
          </div>
          <span className="px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-black text-xs border border-emerald-500/30 backdrop-blur-md">
            100% Operational
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          <Link href="/admin/settings" className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all space-y-1.5 block group">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
            <p className="font-bold text-white">1. School Info</p>
            <span className="text-[10px] text-slate-400">Configured</span>
          </Link>

          <Link href="/admin/academics/classes" className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all space-y-1.5 block group">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
            <p className="font-bold text-white">2. 13 Classes</p>
            <span className="text-[10px] text-slate-400">Playgroup - 10</span>
          </Link>

          <Link href="/admin/teachers" className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all space-y-1.5 block group">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
            <p className="font-bold text-white">3. Teachers</p>
            <span className="text-[10px] text-slate-400">{stats.activeTeachers} Active</span>
          </Link>

          <Link href="/admin/fees" className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all space-y-1.5 block group">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
            <p className="font-bold text-white">4. 3-Slip Fees</p>
            <span className="text-[10px] text-slate-400">Auto Invoices</span>
          </Link>

          <Link href="/admin/academics/timetable" className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all space-y-1.5 block group">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
            <p className="font-bold text-white">5. Timetable</p>
            <span className="text-[10px] text-slate-400">Period 1-5 Grid</span>
          </Link>

          <Link href="/admin/admissions" className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all space-y-1.5 block group">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
            <p className="font-bold text-white">6. Admissions</p>
            <span className="text-[10px] text-slate-400">1-Click Enroll</span>
          </Link>
        </div>
      </div>

      {/* 2-Column Data Grids: Recent Admissions & Recent Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Admissions Pipeline */}
        <div className="glass-panel rounded-3xl border border-white p-6 sm:p-7 space-y-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-black text-base text-slate-900">Recent Online Admissions</h3>
              <p className="text-xs text-slate-500 font-medium">Applications ready for review and 1-Click Enrollment</p>
            </div>
            <Link href="/admin/admissions" className="text-xs font-black text-blue-600 hover:text-blue-700 flex items-center gap-1">
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentAdmissions.length === 0 ? (
            <div className="p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                <UserPlus className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-slate-700">No applications received yet</p>
              <p className="text-[11px] text-slate-400 font-medium">Share your online admission portal link or register directly.</p>
              <Link
                href="/admin/admissions/new"
                className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow transition-all"
              >
                + Create First Application
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentAdmissions.map((app) => (
                <div key={app.id} className="py-3.5 flex items-center justify-between text-xs hover:bg-slate-50/60 px-2 rounded-xl transition-colors">
                  <div>
                    <p className="font-bold text-slate-900">{app.fullName}</p>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">{app.applicationNo}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                      app.status === 'ENROLLED' 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                        : 'bg-blue-50 text-blue-700 border-blue-200'
                    }`}>
                      {app.status}
                    </span>
                    <Link
                      href="/admin/admissions"
                      className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-white transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Payments Stream */}
        <div className="glass-panel rounded-3xl border border-white p-6 sm:p-7 space-y-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-black text-base text-slate-900">Recent Fee Payments</h3>
              <p className="text-xs text-slate-500 font-medium">Multi-channel bank deposit & cash counter stream</p>
            </div>
            <Link href="/admin/fees/receipts" className="text-xs font-black text-blue-600 hover:text-blue-700 flex items-center gap-1">
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentPayments.length === 0 ? (
            <div className="p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <DollarSign className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-slate-700">No payment receipts recorded yet</p>
              <p className="text-[11px] text-slate-400 font-medium">Record fee payments against pending student invoices.</p>
              <Link
                href="/admin/fees"
                className="inline-block px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl"
              >
                + Record Payment
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentPayments.map((p) => (
                <div key={p.id} className="py-3.5 flex items-center justify-between text-xs hover:bg-slate-50/60 px-2 rounded-xl transition-colors">
                  <div>
                    <p className="font-bold text-slate-900">Rs. {p.amount.toLocaleString()}</p>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">{p.receiptNo} • {p.paymentMethod}</p>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {p.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Live QR Gate Scanner Modal */}
      {showScannerModal && <QRScannerModal onClose={() => setShowScannerModal(false)} />}
    </div>
  );
}
