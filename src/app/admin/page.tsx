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
  ArrowUpRight,
  BarChart3,
  LineChart as LineChartIcon,
  PieChart,
  Zap,
  BrainCircuit,
  FileText,
  Bell
} from 'lucide-react';
import QRScannerModal from '@/components/common/QRScanner';
import NotificationBell from '@/components/common/NotificationBell';

export default function AdminDashboardPage() {
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [stats, setStats] = useState({
    totalStudents: 1250,
    activeAdmissions: 24,
    activeTeachers: 85,
    todayAttendancePct: 96.4,
    todayPresent: 1205,
    todayLate: 28,
    todayFeeCollection: 425000,
    pendingFees: 180000,
  });

  const [recentAdmissions, setRecentAdmissions] = useState<any[]>([]);
  const [recentPayments, setRecentPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Animated Chart Rising Effect State
  const [chartAnimated, setChartAnimated] = useState(false);
  const [selectedMetricPeriod, setSelectedMetricPeriod] = useState<'6M' | '1Y'>('6M');

  useEffect(() => {
    // Trigger rising animation after mount
    const timer = setTimeout(() => setChartAnimated(true), 150);

    fetch('/api/admin/dashboard-stats')
      .then((res) => res.json())
      .then((data) => {
        if (data.stats) {
          setStats((prev) => ({ ...prev, ...data.stats }));
        }
        if (data.recentAdmissions && data.recentAdmissions.length > 0) setRecentAdmissions(data.recentAdmissions);
        if (data.recentPayments && data.recentPayments.length > 0) setRecentPayments(data.recentPayments);
      })
      .catch(console.error)
      .finally(() => setLoading(false));

    return () => clearTimeout(timer);
  }, []);

  // Revenue & Fee Collection Monthly Data Points
  const monthlyRevenueData = [
    { month: 'Sep', amount: 3.2, target: 3.5, rate: '92%' },
    { month: 'Oct', amount: 4.1, target: 4.0, rate: '102%' },
    { month: 'Nov', amount: 3.8, target: 4.2, rate: '91%' },
    { month: 'Dec', amount: 4.6, target: 4.5, rate: '102%' },
    { month: 'Jan', amount: 5.2, target: 5.0, rate: '104%' },
    { month: 'Feb', amount: 5.9, target: 5.5, rate: '107%' },
    { month: 'Mar (Now)', amount: 6.8, target: 6.2, rate: '110%' },
  ];

  // Weekly Attendance Day-wise percentage
  const weeklyAttendanceData = [
    { day: 'Mon', pct: 97.2, count: 1215 },
    { day: 'Tue', pct: 96.5, count: 1206 },
    { day: 'Wed', pct: 98.1, count: 1226 },
    { day: 'Thu', pct: 95.8, count: 1198 },
    { day: 'Fri', pct: 96.4, count: 1205 },
    { day: 'Sat', pct: 93.0, count: 1162 },
  ];

  // Academic Wing Enrollment Distribution
  const academicWings = [
    { name: 'Early Years (Playgroup – Prep)', students: 280, capacity: 300, pct: 93, color: 'bg-blue-500' },
    { name: 'Primary Wing (Class 1 – 5)', students: 460, capacity: 480, pct: 96, color: 'bg-blue-600' },
    { name: 'Middle Wing (Class 6 – 8)', students: 310, capacity: 320, pct: 97, color: 'bg-indigo-600' },
    { name: 'SSC Matric Wing (9th & 10th Sciences)', students: 200, capacity: 200, pct: 100, color: 'bg-sky-600' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300 bg-[#ffffff] text-slate-900 pb-16">
      
      {/* Top Royal Blue Command Header with Notification Bell */}
      <div className="relative overflow-hidden rounded-3xl bg-[#0F2A5F] text-white p-8 sm:p-10 shadow-xl border border-[#173B7A]">
        {/* Ambient Glows */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-[#2563EB]/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute left-1/3 bottom-0 w-80 h-80 bg-[#173B7A]/30 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-600/25 text-blue-300 text-xs font-bold border border-blue-500/40 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
              <span>THMS AI Executive Control Tower • Session 2026-2027</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white font-serif">
              Principal & Office Command Center
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
              Real-time synchronization across student 360 records, online admissions pipeline, gate QR scanner attendance, and automated 3-copy fee billing.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 relative z-10">
            {/* Notification Bell */}
            <NotificationBell />

            <button
              onClick={() => setShowScannerModal(true)}
              className="px-5 py-3.5 rounded-2xl btn-blue-prestige text-white text-xs font-bold shadow-lg flex items-center gap-2.5 transition-all hover:scale-105"
            >
              <QrCode className="w-4 h-4" />
              <span>Launch Gate QR Scanner</span>
            </button>
            <Link
              href="/admin/admissions"
              className="px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 backdrop-blur-xl flex items-center gap-2.5 transition-all hover:scale-105"
            >
              <UserPlus className="w-4 h-4 text-blue-400" />
              <span>Admissions Desk</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Fast Actions Bar with Blue Accents */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-2">
          Fast Actions:
        </span>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/admissions/new"
            className="px-3.5 py-2 btn-blue-prestige text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-all shadow-md"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ New Admission</span>
          </Link>
          <Link
            href="/admin/teachers"
            className="px-3.5 py-2 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-800 font-bold text-xs rounded-xl flex items-center gap-2 transition-all border border-slate-200"
          >
            <UserCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>+ Faculty Directory</span>
          </Link>
          <Link
            href="/admin/fees"
            className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 font-bold text-xs rounded-xl flex items-center gap-2 transition-all"
          >
            <DollarSign className="w-3.5 h-3.5 text-blue-600" />
            <span>+ Record Fee Payment</span>
          </Link>
          <Link
            href="/admin/attendance"
            className="px-3.5 py-2 bg-slate-50 hover:bg-blue-50 text-slate-800 border border-slate-200 font-bold text-xs rounded-xl flex items-center gap-2 transition-all"
          >
            <CalendarCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Daily Attendance Hub</span>
          </Link>
          <Link
            href="/admin/id-cards"
            className="px-3.5 py-2 bg-slate-50 hover:bg-blue-50 text-slate-800 border border-slate-200 font-bold text-xs rounded-xl flex items-center gap-2 transition-all"
          >
            <CreditCard className="w-3.5 h-3.5 text-blue-600" />
            <span>ID Card Studio</span>
          </Link>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Students */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-4 border-t-4 border-t-blue-600">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Enrolled Students
            </span>
            <div className="p-3 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 shadow-sm">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">{stats.totalStudents}</h3>
            <p className="text-xs text-blue-600 font-bold flex items-center gap-1.5 mt-1.5">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Active Student Roster</span>
            </p>
          </div>
        </div>

        {/* Teachers */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-4 border-t-4 border-t-indigo-600">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Active Faculty
            </span>
            <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-200 shadow-sm">
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
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-4 border-t-4 border-t-emerald-600">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Fee Collections
            </span>
            <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-sm">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-black text-slate-900 tracking-tight font-mono">
              Rs. {stats.todayFeeCollection.toLocaleString()}
            </h3>
            <p className="text-xs text-emerald-600 font-bold mt-1.5">
              Verified 3-Slip Receipts
            </p>
          </div>
        </div>

        {/* Admissions Pending */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-4 border-t-4 border-t-sky-500">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Admissions Pipeline
            </span>
            <div className="p-3 rounded-2xl bg-sky-50 text-sky-600 border border-sky-200 shadow-sm">
              <UserPlus className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">{stats.activeAdmissions}</h3>
            <p className="text-xs text-sky-600 font-bold mt-1.5">
              Applications In Review
            </p>
          </div>
        </div>
      </div>

      {/* =========================================================================
          DYNAMIC ANIMATED GRAPHS & CHARTS SUITE (Rises upwards on dashboard open)
         ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 8 Cols: Dynamic Revenue & Enrollment Trend Line Graph */}
        <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl btn-blue-prestige text-white shadow-md">
                <LineChartIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-base text-slate-900 font-serif">
                  Monthly Fee Revenue & Enrollment Trajectory
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Dynamic animated trajectory with month-over-month collection curves
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
                +28.4% YoY Growth
              </span>
            </div>
          </div>

          {/* Dynamic Animated Line & Area SVG Chart */}
          <div className="relative h-64 w-full bg-gradient-to-b from-blue-50/50 via-white to-white rounded-2xl border border-blue-100 p-4 flex flex-col justify-between overflow-hidden">
            
            {/* Background Grid Lines */}
            <div className="absolute inset-0 flex flex-col justify-between p-6 pointer-events-none opacity-40">
              <div className="w-full border-b border-dashed border-blue-200"></div>
              <div className="w-full border-b border-dashed border-blue-200"></div>
              <div className="w-full border-b border-dashed border-blue-200"></div>
              <div className="w-full border-b border-dashed border-blue-200"></div>
            </div>

            {/* Rising Animated Line SVG Overlay */}
            <svg 
              viewBox="0 0 700 200" 
              className="w-full h-44 overflow-visible relative z-10 transition-all duration-1000 ease-out"
              style={{
                transform: chartAnimated ? 'translateY(0) scaleY(1)' : 'translateY(40px) scaleY(0.1)',
                transformOrigin: 'bottom',
                opacity: chartAnimated ? 1 : 0,
              }}
            >
              <defs>
                {/* Blue Gradient Area */}
                <linearGradient id="blueAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="50%" stopColor="#2563eb" />
                  <stop offset="100%" stopColor="#1d4ed8" />
                </linearGradient>
              </defs>

              {/* Area Fill */}
              <path
                d="M 50,160 Q 150,140 250,110 T 450,70 T 650,25 L 650,200 L 50,200 Z"
                fill="url(#blueAreaGrad)"
              />

              {/* Main Animated Trend Line */}
              <path
                d="M 50,160 Q 150,140 250,110 T 450,70 T 650,25"
                fill="none"
                stroke="url(#lineGrad)"
                strokeWidth="4"
                strokeLinecap="round"
                className="drop-shadow-md"
              />

              {/* Data Nodes */}
              {[
                { cx: 50, cy: 160, label: '3.2M' },
                { cx: 150, cy: 135, label: '4.1M' },
                { cx: 250, cy: 110, label: '3.8M' },
                { cx: 350, cy: 85, label: '4.6M' },
                { cx: 450, cy: 70, label: '5.2M' },
                { cx: 550, cy: 45, label: '5.9M' },
                { cx: 650, cy: 25, label: '6.8M' },
              ].map((pt, i) => (
                <g key={i} className="cursor-pointer group">
                  <circle
                    cx={pt.cx}
                    cy={pt.cy}
                    r="6"
                    fill="#ffffff"
                    stroke="#2563eb"
                    strokeWidth="3"
                    className="transition-transform group-hover:scale-150"
                  />
                  <text
                    x={pt.cx}
                    y={pt.cy - 12}
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight="bold"
                    fill="#1e3a8a"
                    className="font-mono font-bold"
                  >
                    Rs {pt.label}
                  </text>
                </g>
              ))}
            </svg>

            {/* X-Axis Labels */}
            <div className="grid grid-cols-7 text-center text-xs font-bold text-slate-500 pt-2 border-t border-slate-100 relative z-10">
              {monthlyRevenueData.map((d, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <span className="text-slate-800">{d.month}</span>
                  <span className="text-[10px] text-emerald-600 font-semibold">{d.rate} Target</span>
                </div>
              ))}
            </div>
          </div>

          {/* Chart Legend */}
          <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 font-medium px-2">
            <div className="flex items-center gap-5">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-blue-600"></span> Confirmed Revenue Stream
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-blue-200"></span> Institutional Collection Target
              </span>
            </div>
            <span className="text-blue-700 font-black">All 12 Academic Classes Synchronized</span>
          </div>
        </div>

        {/* Right 4 Cols: Weekly Attendance Velocity Bars (Rising animation) */}
        <div className="lg:col-span-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5 flex flex-col justify-between">
          <div className="space-y-1.5 border-b border-slate-100 pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm font-serif">
                <CalendarCheck className="w-4 h-4 text-blue-600" />
                <span>Weekly Gate Attendance</span>
              </div>
              <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                96.4% Avg
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">Daily biometric turnstile pass rates</p>
          </div>

          {/* Rising Vertical Bars */}
          <div className="grid grid-cols-6 gap-2 h-44 items-end pt-4 px-2 bg-slate-50/60 rounded-2xl border border-slate-200">
            {weeklyAttendanceData.map((item, idx) => (
              <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end group">
                <div className="w-full flex items-end justify-center h-full">
                  <div 
                    style={{ 
                      height: chartAnimated ? `${(item.pct / 100) * 100}%` : '0%',
                      transition: `height 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) ${idx * 100}ms`
                    }}
                    className="w-full max-w-[28px] rounded-t-xl bg-gradient-to-t from-blue-700 to-blue-500 shadow-md group-hover:scale-105 transition-transform"
                    title={`${item.day}: ${item.pct}% (${item.count} students)`}
                  ></div>
                </div>
                <span className="text-[10px] font-bold text-slate-600">{item.day}</span>
              </div>
            ))}
          </div>

          {/* Attendance Breakdown */}
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-600 font-medium">On-Time Smart Gate Present</span>
              <span className="font-bold text-emerald-700">96.4% (1,205)</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full transition-all duration-1000" style={{ width: chartAnimated ? '96.4%' : '0%' }}></div>
            </div>
            <div className="flex justify-between text-[11px] text-slate-500">
              <span>Late Entry: 2.2% (28)</span>
              <span>Absence: 1.4% (17)</span>
            </div>
          </div>

        </div>
      </div>

      {/* Academic Wing Enrollment Distribution */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-black text-base text-slate-900 font-serif">Academic Wing Capacity & Enrollment Distribution</h3>
            <p className="text-xs text-slate-500 font-medium">Live seat occupancy across Early Years, Primary, Middle, and SSC Matric Wings</p>
          </div>
          <span className="text-xs text-blue-700 font-bold bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            Total Capacity: 1,300 Seats
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {academicWings.map((wing, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 hover:bg-blue-50/40 transition-colors">
              <div className="flex justify-between items-start">
                <h4 className="font-bold text-xs text-slate-900 leading-tight">{wing.name}</h4>
                <span className="text-xs font-black text-blue-700 font-mono">{wing.pct}%</span>
              </div>

              <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${wing.color} rounded-full transition-all duration-1000`} 
                  style={{ width: chartAnimated ? `${wing.pct}%` : '0%' }}
                ></div>
              </div>

              <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                <span>{wing.students} Enrolled</span>
                <span>Max {wing.capacity} Seats</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2-Column Data Grids: Admissions Review Desk & Fee Receipts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Admissions Review Desk */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 space-y-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-black text-base text-slate-900 font-serif">Online Admissions Pipeline</h3>
              <p className="text-xs text-slate-500 font-medium">Review submitted inquiries with 1-Click Approve & Enroll</p>
            </div>
            <Link href="/admin/admissions" className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
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
                className="inline-block px-4 py-2 btn-blue-prestige text-white text-xs font-bold rounded-xl shadow transition-all"
              >
                + Create First Application
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentAdmissions.map((app) => (
                <div key={app.id} className="py-3.5 flex items-center justify-between text-xs hover:bg-blue-50/40 px-2 rounded-xl transition-colors">
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

        {/* Recent Fee Payments */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 space-y-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-black text-base text-slate-900 font-serif">Recent Fee Payments</h3>
              <p className="text-xs text-slate-500 font-medium">Multi-channel bank deposit & cash counter stream</p>
            </div>
            <Link href="/admin/fees/receipts" className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
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
                className="inline-block px-4 py-2 btn-blue-prestige text-white text-xs font-bold rounded-xl"
              >
                + Record Payment
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentPayments.map((p) => (
                <div key={p.id} className="py-3.5 flex items-center justify-between text-xs hover:bg-blue-50/40 px-2 rounded-xl transition-colors">
                  <div>
                    <p className="font-bold text-slate-900">Rs. {p.amount?.toLocaleString()}</p>
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
