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
  ArrowUpRight, 
  Clock, 
  Megaphone,
  CreditCard,
  FileText,
  Building2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ChevronRight,
  UserCheck,
  Layers,
  ArrowRight,
  HelpCircle
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

  const [setupProgress, setSetupProgress] = useState({
    schoolInfo: true,
    adminAccount: true,
    academicSession: true,
    classes: true,
    teachers: false,
    feeStructure: false,
    firstAdmission: false,
    pct: 65,
  });

  const [recentAdmissions, setRecentAdmissions] = useState<any[]>([]);
  const [recentPayments, setRecentPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1-Call Ultra Fast Dashboard Statistics Loader
    fetch('/api/admin/dashboard-stats')
      .then((res) => res.json())
      .then((data) => {
        if (data.stats) {
          setStats(data.stats);
          setSetupProgress((prev) => ({
            ...prev,
            firstAdmission: data.stats.totalStudents > 0,
            teachers: data.stats.activeTeachers > 0,
            feeStructure: true,
            pct: 95,
          }));
        }
        if (data.recentAdmissions) setRecentAdmissions(data.recentAdmissions);
        if (data.recentPayments) setRecentPayments(data.recentPayments);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-wrap items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-400/30">
            <span>The Hayatabad Model School</span>
            <span>•</span>
            <span>Academic Session 2026</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            School Management & Office ERP
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Central administration hub for admissions, student enrollment, dual-sided ID cards, smart QR gate attendance, fee collection, and examination grading.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 relative z-10">
          <button
            onClick={() => setShowScannerModal(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition-all"
          >
            <QrCode className="w-4 h-4" />
            <span>Launch QR Scanner</span>
          </button>
          <Link
            href="/admin/admissions"
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Review Admissions</span>
          </Link>
        </div>
      </div>

      {/* Quick Action Shortcuts Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Quick Actions:</span>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/admissions/new"
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-sm"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ New Admission</span>
          </Link>
          <Link
            href="/admin/teachers"
            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>+ Add Teacher</span>
          </Link>
          <Link
            href="/admin/fees"
            className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all"
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>+ Record Fee Payment</span>
          </Link>
          <Link
            href="/admin/attendance"
            className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all"
          >
            <CalendarCheck className="w-3.5 h-3.5" />
            <span>Attendance Registry</span>
          </Link>
          <Link
            href="/admin/setup"
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Setup Wizard</span>
          </Link>
        </div>
      </div>

      {/* School Setup Checklist (Progressive Onboarding Guidance) */}
      <div className="bg-gradient-to-br from-slate-900 to-blue-950 p-6 rounded-3xl text-white shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <h2 className="text-base font-extrabold">School Setup & Onboarding Progress</h2>
            </div>
            <p className="text-xs text-slate-300">
              Complete initial parameters to ensure all features and portals run seamlessly.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-500/30">
            {stats.totalStudents > 0 && stats.activeTeachers > 0 ? '100% Operational' : 'Setup In Progress'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          <Link href="/admin/settings" className="p-3 rounded-2xl bg-white/10 hover:bg-white/15 transition-all space-y-1 block">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <p className="font-bold">1. School Info</p>
            <span className="text-[10px] text-slate-300">Configured</span>
          </Link>

          <Link href="/admin/academics/classes" className="p-3 rounded-2xl bg-white/10 hover:bg-white/15 transition-all space-y-1 block">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <p className="font-bold">2. Classes & Sections</p>
            <span className="text-[10px] text-slate-300">Configured</span>
          </Link>

          <Link href="/admin/teachers" className="p-3 rounded-2xl bg-white/10 hover:bg-white/15 transition-all space-y-1 block">
            {stats.activeTeachers > 0 ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Clock className="w-4 h-4 text-amber-400" />}
            <p className="font-bold">3. Teachers</p>
            <span className="text-[10px] text-slate-300">{stats.activeTeachers} Active</span>
          </Link>

          <Link href="/admin/fees" className="p-3 rounded-2xl bg-white/10 hover:bg-white/15 transition-all space-y-1 block">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <p className="font-bold">4. Fee Structures</p>
            <span className="text-[10px] text-slate-300">Configured</span>
          </Link>

          <Link href="/admin/academics/timetable" className="p-3 rounded-2xl bg-white/10 hover:bg-white/15 transition-all space-y-1 block">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <p className="font-bold">5. Timetable</p>
            <span className="text-[10px] text-slate-300">Configured</span>
          </Link>

          <Link href="/admin/admissions" className="p-3 rounded-2xl bg-white/10 hover:bg-white/15 transition-all space-y-1 block">
            {stats.totalStudents > 0 ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Clock className="w-4 h-4 text-amber-400" />}
            <p className="font-bold">6. Admissions</p>
            <span className="text-[10px] text-slate-300">{stats.totalStudents} Enrolled</span>
          </Link>
        </div>
      </div>

      {/* Primary KPI Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Enrolled Students
            </span>
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-extrabold text-slate-900">{stats.totalStudents}</h3>
            <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Active Roster</span>
            </p>
          </div>
        </div>

        {/* Teachers */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Active Faculty
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-extrabold text-slate-900">{stats.activeTeachers}</h3>
            <p className="text-[11px] text-slate-500 font-medium mt-1">
              Subject Faculty Teachers
            </p>
          </div>
        </div>

        {/* Today Fee Collection */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Fee Collections
            </span>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-extrabold text-slate-900">
              Rs. {stats.todayFeeCollection.toLocaleString()}
            </h3>
            <p className="text-[11px] text-slate-500 font-medium mt-1">
              Verified 3-Slip Receipts
            </p>
          </div>
        </div>

        {/* Admissions Pending */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Online Admissions
            </span>
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
              <UserPlus className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-extrabold text-slate-900">{stats.activeAdmissions}</h3>
            <p className="text-[11px] text-purple-600 font-semibold mt-1">
              Applications In Pipeline
            </p>
          </div>
        </div>
      </div>

      {/* Tables Row: Recent Admissions & Recent Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Admissions Pipeline */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Recent Online Admissions</h3>
              <p className="text-xs text-slate-500">Applications ready for review and 1-Click Enrollment</p>
            </div>
            <Link href="/admin/admissions" className="text-xs font-bold text-blue-600 hover:underline">
              View All
            </Link>
          </div>

          {recentAdmissions.length === 0 ? (
            <div className="p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                <UserPlus className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-slate-700">No applications received yet</p>
              <p className="text-[11px] text-slate-400">Share your online admission portal link or register directly.</p>
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
                <div key={app.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-slate-900">{app.fullName}</p>
                    <p className="text-[10px] text-slate-500 font-mono">{app.applicationNo}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      app.status === 'ENROLLED' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {app.status}
                    </span>
                    <Link
                      href="/admin/admissions"
                      className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-50"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Payments Stream */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Recent Fee Payments</h3>
              <p className="text-xs text-slate-500">Multi-channel bank transfer & cash counter ledger</p>
            </div>
            <Link href="/admin/fees/receipts" className="text-xs font-bold text-blue-600 hover:underline">
              View All
            </Link>
          </div>

          {recentPayments.length === 0 ? (
            <div className="p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <DollarSign className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-slate-700">No payment receipts recorded yet</p>
              <p className="text-[11px] text-slate-400">Record payments against pending monthly invoices.</p>
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
                <div key={p.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-slate-900">Rs. {p.amount.toLocaleString()}</p>
                    <p className="text-[10px] text-slate-500 font-mono">{p.receiptNo} • {p.paymentMethod}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    {p.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* QR Scanner Modal */}
      {showScannerModal && <QRScannerModal onClose={() => setShowScannerModal(false)} />}
    </div>
  );
}
