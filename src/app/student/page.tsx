'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  GraduationCap, 
  CalendarCheck, 
  Award, 
  DollarSign, 
  CreditCard, 
  BookOpen, 
  Clock, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  Building2, 
  AlertCircle, 
  FileText, 
  TrendingUp, 
  Activity,
  Settings,
  ShieldCheck,
  ChevronRight,
  Bot,
  Calendar,
  FolderDown,
  Compass,
  Atom,
  Languages,
  Calculator,
  HelpCircle,
  BarChart3,
  Flame,
  Zap,
  Target,
  Ban,
  AlertTriangle,
  RefreshCw,
  QrCode,
  Camera
} from 'lucide-react';
import PrintableIDCard from '@/components/common/PrintableIDCard';
import PortalCircularLoader from '@/components/common/PortalCircularLoader';
import NotificationBell from '@/components/common/NotificationBell';
import QRScannerModal from '@/components/common/QRScanner';

export default function StudentDashboardPage() {
  const [student, setStudent] = useState<any | null>(null);
  const [school, setSchool] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [showQrModal, setShowQrModal] = useState(false);
  const [attendanceStats, setAttendanceStats] = useState<any | null>(null);
  const [homeworks, setHomeworks] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [feeInvoices, setFeeInvoices] = useState<any[]>([]);

  // Live Timetable & Period Engine State
  const [liveSchedule, setLiveSchedule] = useState<any[]>([]);
  const [currentPeriod, setCurrentPeriod] = useState<any | null>(null);
  const [nextPeriod, setNextPeriod] = useState<any | null>(null);
  const [isSchoolClosed, setIsSchoolClosed] = useState(false);
  const [closureInfo, setClosureInfo] = useState<any | null>(null);

  const fetchLiveTimetable = () => {
    fetch('/api/timetable/live')
      .then((res) => res.json())
      .then((data) => {
        if (data.schedule) setLiveSchedule(data.schedule);
        if (data.currentPeriod) setCurrentPeriod(data.currentPeriod);
        if (data.nextPeriod) setNextPeriod(data.nextPeriod);
        setIsSchoolClosed(!!data.isSchoolClosed);
        if (data.closureInfo) setClosureInfo(data.closureInfo);
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user?.student) {
          const st = data.user.student;
          setStudent(st);
          setSchool(data.school);
          
          // 1. Fetch real attendance stats from dedicated student API
          fetch('/api/student/attendance')
            .then((res) => res.json())
            .then((attData) => {
              if (attData.statistics) setAttendanceStats(attData.statistics);
            })
            .catch(console.error);

          // 2. Fetch student homework
          fetch('/api/student/homework')
            .then((res) => res.json())
            .then((hData) => {
              if (hData.homeworks) setHomeworks(hData.homeworks);
            })
            .catch(console.error);

          // 3. Fetch published exam results
          fetch('/api/student/results')
            .then((res) => res.json())
            .then((rData) => {
              if (rData.reports) setResults(rData.reports);
            })
            .catch(console.error);

          // 4. Fetch fee invoices
          fetch(`/api/fees/invoices?studentId=${st.id}`)
            .then((res) => res.json())
            .then((fData) => {
              if (fData.invoices) setFeeInvoices(fData.invoices);
            })
            .catch(console.error);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));

    fetchLiveTimetable();
    const interval = setInterval(fetchLiveTimetable, 45000);
    return () => clearInterval(interval);
  }, []);

  const pendingFeeAmount = feeInvoices
    .filter((inv: any) => inv.status !== 'PAID')
    .reduce((acc: number, inv: any) => acc + (inv.remainingAmount || inv.totalAmount || 0), 0);

  // Subject Mastery Stats
  const subjectMastery = [
    { subject: 'Mathematics', score: 94, grade: 'A+', icon: Calculator, color: 'from-orange-500 to-amber-500' },
    { subject: 'Physics', score: 91, grade: 'A+', icon: Atom, color: 'from-blue-500 to-indigo-500' },
    { subject: 'Computer & AI', score: 98, grade: 'A+', icon: Bot, color: 'from-cyan-500 to-blue-600' },
    { subject: 'English Grammar', score: 88, grade: 'A', icon: Languages, color: 'from-purple-500 to-pink-500' },
  ];

  // Monthly Attendance Analytics Bar Data
  const monthlyAttendance = [
    { month: 'Sep', rate: 98 },
    { month: 'Oct', rate: 96 },
    { month: 'Nov', rate: 100 },
    { month: 'Dec', rate: 92 },
    { month: 'Jan', rate: 95 },
    { month: 'Feb', rate: 97 },
  ];

  if (loading) {
    return (
      <div className="p-16 text-center">
        <PortalCircularLoader message="Loading Student Academic Hub..." subMessage="Connecting AI copilot and PostgreSQL records" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="p-8 text-center text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-3xl max-w-lg mx-auto space-y-2">
        <AlertCircle className="w-8 h-8 mx-auto text-rose-500" />
        <h3 className="font-black text-sm text-slate-900">Student Profile Not Linked</h3>
        <p className="text-slate-600 font-medium">This user account is not linked to an active student record. Please contact the school administration office.</p>
      </div>
    );
  }

  const attendanceRate = attendanceStats?.attendancePercentage ?? 100;
  const todayStatus = attendanceStats?.todayStatus || 'NOT_MARKED';

  return (
    <div className="space-y-8">
      
      {/* 1. STAGGERED BOTTOM-TO-TOP SLIDE-IN HERO BANNER */}
      <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 relative overflow-hidden rounded-3xl bg-[#0F2A5F] text-white p-6 sm:p-8 lg:p-10 shadow-xl border border-[#173B7A]">
        <div className="absolute right-0 top-0 w-96 h-96 bg-[#2563EB]/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white p-1 border-2 border-[#2563EB]/40 shadow-xl overflow-hidden shrink-0">
              <img
                src={student.photoUrl || '/student-avatar.png'}
                alt={student.fullName}
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
            <div className="space-y-1 sm:space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-[#2563EB]/25 text-blue-200 text-xs font-bold border border-[#2563EB]/40">
                <Sparkles className="w-3 h-3 text-blue-300" />
                <span>Session 2026-2027 • Enrolled Scholar</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Welcome, {student.fullName}!
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 font-medium">
                {student.class?.name || 'Class 8'} ({student.section?.name || 'Section A'}) • Roll No: <strong className="text-white font-mono">{student.rollNo}</strong> • Student ID: <strong className="text-blue-300 font-mono">{student.studentId}</strong>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
            <NotificationBell />
            <Link
              href="/student/classes"
              className="flex-1 sm:flex-none px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-xs font-black shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all hover:scale-105"
            >
              <BookOpen className="w-4 h-4" />
              <span>My Classrooms (LMS)</span>
            </Link>
            <button
              type="button"
              onClick={() => setShowQrModal(true)}
              className="flex-1 sm:flex-none px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-black shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all hover:scale-105"
            >
              <Camera className="w-4 h-4" />
              <span>Mark Attendance (QR)</span>
            </button>
            <Link
              href="/student/ai-study"
              className="flex-1 sm:flex-none px-5 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white text-xs font-black shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-all hover:scale-105"
            >
              <Bot className="w-4 h-4 animate-pulse" />
              <span>Ask AI Copilot</span>
            </Link>
            <Link
              href="/student/settings"
              className="flex-1 sm:flex-none px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-black border border-white/20 backdrop-blur-xl flex items-center justify-center gap-2 transition-all hover:scale-105"
            >
              <Settings className="w-4 h-4 text-orange-400" />
              <span>Settings</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. REAL-TIME LIVE PERIOD HERO WIDGET */}
      {isSchoolClosed && closureInfo ? (
        <div className="p-6 rounded-3xl bg-rose-50 border-2 border-rose-500 text-rose-950 flex items-start gap-4 shadow-md animate-in fade-in">
          <AlertTriangle className="w-8 h-8 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white font-extrabold text-[10px] uppercase">
                {closureInfo.isEmergency ? 'Emergency Closure' : 'Campus Notice'}
              </span>
              <h3 className="font-black text-lg text-rose-950 font-serif">{closureInfo.title}</h3>
            </div>
            <p className="text-xs text-rose-800 font-medium leading-relaxed">
              {closureInfo.reason}. Academic sessions, periods, and examinations are suspended today.
            </p>
          </div>
        </div>
      ) : currentPeriod ? (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white border border-blue-500/30 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-extrabold text-[10px] uppercase border border-emerald-500/40 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block"></span>
                CURRENT PERIOD IN PROGRESS
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {currentPeriod.startTime} - {currentPeriod.endTime}
              </span>
            </div>
            <h3 className="text-2xl font-black text-white font-serif">{currentPeriod.subjectName}</h3>
            <p className="text-xs text-slate-300 font-medium">
              Instructor: <strong className="text-white">{currentPeriod.isSubstitute ? `Substitute: ${currentPeriod.substituteTeacherName}` : currentPeriod.teacherName}</strong> • Room: <span className="text-blue-300 font-bold">{currentPeriod.roomNo}</span>
            </p>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2 bg-white/10 p-3.5 rounded-2xl border border-white/15">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Time Remaining</span>
            <span className="text-2xl font-black text-emerald-400 font-mono tracking-tight">
              {currentPeriod.minutesRemaining ?? 0} min
            </span>
          </div>
        </div>
      ) : liveSchedule.some((p) => p.status === 'CANCELLED') ? (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex items-center gap-3">
          <Ban className="w-5 h-5 text-rose-600 shrink-0" />
          <div className="text-xs">
            <strong>Timetable Update:</strong> One or more of today&apos;s periods have been cancelled by faculty. Check the schedule below for reasons.
          </div>
        </div>
      ) : null}

      {/* 2. STAGGERED BOTTOM-TO-TOP SLIDE-IN AI TIP STRIP */}
      <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100 p-5 rounded-3xl bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-orange-500/10 border border-orange-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-orange-500 text-white flex items-center justify-center font-black shadow-md shrink-0">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-black text-slate-900 block">THMS AI Daily Study Recommendation:</span>
            <p className="text-xs text-slate-600 font-medium">
              &quot;Review Physics Chapter 3 practical lab equations before Period 3 session today!&quot;
            </p>
          </div>
        </div>

        <Link
          href="/student/ai-assistant"
          className="px-4 py-2 bg-white hover:bg-orange-50 text-orange-700 font-black text-xs rounded-xl border border-orange-200 shadow-sm shrink-0 flex items-center gap-1.5 self-start sm:self-auto"
        >
          <span>Open AI Tutor</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* 3. STAGGERED BOTTOM-TO-TOP KPI ANALYTICS GRID */}
      <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Today's Gate Check-in */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3 hover:shadow-md transition-all flex flex-col justify-between">
          <div className="space-y-1.5">
            <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
              Today&apos;s Gate Check-in
            </span>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-black border ${
                todayStatus === 'PRESENT'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : todayStatus === 'LATE'
                  ? 'bg-amber-50 text-amber-700 border-amber-300'
                  : todayStatus === 'ABSENT'
                  ? 'bg-rose-50 text-rose-700 border-rose-300'
                  : 'bg-slate-100 text-slate-700 border-slate-300'
              }`}>
                {todayStatus === 'PRESENT' ? '✓ Present' : todayStatus === 'LATE' ? '⚠️ Late Arrival' : todayStatus === 'ABSENT' ? '✗ Absent' : 'Pending Roll Call'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowQrModal(true)}
            className={`w-full py-2 px-3 rounded-xl text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all ${
              todayStatus === 'PRESENT'
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-[#2563EB] hover:bg-[#1D4ED8]'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>{todayStatus === 'PRESENT' ? '✓ Verified (Tap to Scan)' : 'Open Camera to Scan'}</span>
          </button>

          <p className="text-[10px] text-slate-400 font-medium">Smart QR pass scan at main gate</p>
        </div>

        {/* Overall Attendance Rate */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2 hover:shadow-md transition-all">
          <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
            Attendance Rate
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
              {attendanceRate}%
            </span>
            <span className="text-xs text-slate-500 font-bold">
              ({attendanceStats?.presentDays ?? 0}/{attendanceStats?.totalSchoolDays ?? 0} Days)
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                attendanceRate >= 80 ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gradient-to-r from-amber-500 to-rose-500'
              }`}
              style={{ width: `${attendanceRate}%` }}
            ></div>
          </div>
        </div>

        {/* Pending Homework */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
              Active Homework
            </span>
            <Link href="/student/homework" className="text-[11px] font-bold text-orange-600 hover:text-orange-700">
              View All ➔
            </Link>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
              {homeworks.length}
            </span>
            <span className="text-xs text-slate-500 font-bold">Pending Tasks</span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">Assigned by subject faculty</p>
        </div>

        {/* Fee Balance */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
              Fee Balance
            </span>
            <Link href="/student/fees" className="text-[11px] font-bold text-orange-600 hover:text-orange-700">
              Vouchers ➔
            </Link>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl sm:text-3xl font-black font-mono ${pendingFeeAmount > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
              Rs. {pendingFeeAmount.toLocaleString()}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">
            {pendingFeeAmount === 0 ? '✓ Term fees fully cleared' : 'Pending bank deposit voucher'}
          </p>
        </div>
      </div>

      {/* 4. STAGGERED BOTTOM-TO-TOP ADVANCED VISUAL ANALYTICS SECTION */}
      <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Monthly Attendance Bar Analytics */}
        <div className="lg:col-span-6 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-orange-600" />
                Attendance Trend & Monthly Analytics
              </h3>
              <p className="text-xs text-slate-500 font-medium">Punctuality progression across current session</p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
              96.3% Avg
            </span>
          </div>

          <div className="h-44 flex items-end justify-between gap-3 pt-6 px-2">
            {monthlyAttendance.map((m, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <span className="text-[10px] font-mono font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  {m.rate}%
                </span>
                <div
                  className="w-full rounded-t-xl bg-gradient-to-t from-orange-500 to-amber-400 group-hover:from-orange-600 group-hover:to-amber-500 transition-all duration-500 shadow-sm"
                  style={{ height: `${(m.rate - 60) * 2.5}%` }}
                ></div>
                <span className="text-xs font-bold text-slate-700">{m.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Academic Performance & CGPA Rank */}
        <div className="lg:col-span-6 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                <Target className="w-4 h-4 text-orange-600" />
                Academic Standing & CGPA
              </h3>
              <p className="text-xs text-slate-500 font-medium">BISE Peshawar grading standard benchmark</p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-black bg-orange-50 text-orange-700 border border-orange-200 font-mono">
              Grade A+
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Calculated CGPA</span>
              <p className="text-3xl font-black text-slate-900 font-mono">3.92</p>
              <span className="text-[10px] text-emerald-600 font-bold">Top 5% in Class</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Class Standing</span>
              <p className="text-3xl font-black text-orange-600 font-mono">#02</p>
              <span className="text-[10px] text-slate-500 font-medium">Out of 38 Scholars</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-orange-50/60 border border-orange-200 text-xs font-medium text-slate-700 flex items-center justify-between">
            <span>Official report card & subject marks:</span>
            <Link href="/student/results" className="font-black text-orange-700 hover:text-orange-800">
              View Marksheet ➔
            </Link>
          </div>
        </div>

      </div>

      {/* 5. STAGGERED BOTTOM-TO-TOP SUBJECT MASTERY PERFORMANCE METER */}
      <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-250 bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 space-y-5 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-black text-base text-slate-900">Curriculum Subject Mastery</h3>
            <p className="text-xs text-slate-500 font-medium">AI-calculated academic strength across core subjects</p>
          </div>
          <Link href="/student/results" className="text-xs font-black text-orange-600 hover:text-orange-700">
            View Full Marksheet ➔
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {subjectMastery.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5 text-orange-600" />
                    {item.subject}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-white border border-slate-200 text-slate-800 font-mono">
                    {item.grade}
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${item.color}`}
                    style={{ width: `${item.score}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 font-medium font-mono">
                  <span>Score: {item.score}%</span>
                  <span>Mastery Level</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. STAGGERED BOTTOM-TO-TOP 2-COLUMN SCHEDULE & HOMEWORK */}
      <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Live Timetable */}
        <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 space-y-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-black text-base text-slate-900">Today&apos;s Class Timetable</h3>
              <p className="text-xs text-slate-500 font-medium">Assigned periods with active classroom indicators</p>
            </div>
            <Link
              href="/student/timetable"
              className="text-xs font-black text-orange-600 hover:text-orange-700"
            >
              Weekly ➔
            </Link>
          </div>

          <div className="space-y-3">
            {liveSchedule.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs font-medium space-y-1">
                <Clock className="w-8 h-8 text-slate-300 mx-auto" />
                <p>No instructional periods scheduled for today</p>
              </div>
            ) : (
              liveSchedule.map((period, idx) => {
                const isCancelled = period.status === 'CANCELLED';
                const isActive = period.status === 'ACTIVE';
                const isSubstitute = period.status === 'SUBSTITUTE';

                return (
                  <div
                    key={period.id || idx}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs transition-colors ${
                      isActive
                        ? 'bg-emerald-500/10 border-emerald-400 shadow-sm ring-1 ring-emerald-500/30'
                        : isCancelled
                        ? 'bg-rose-50 border-rose-200'
                        : isSubstitute
                        ? 'bg-purple-50 border-purple-200'
                        : 'bg-slate-50 border-slate-100 hover:bg-orange-50/40'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs">{period.subjectName}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${
                            period.badgeClass || 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {period.label || period.status}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-medium">
                        Instructor: {period.isSubstitute ? `Sub: ${period.substituteTeacherName}` : period.teacherName}
                      </span>
                      {isCancelled && period.cancellationReason && (
                        <p className="text-[10px] text-rose-600 italic">Reason: &ldquo;{period.cancellationReason}&rdquo;</p>
                      )}
                    </div>
                    <div className="text-right space-y-1">
                      <span className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-slate-700 font-mono text-[10px] font-bold block">
                        {period.startTime} - {period.endTime}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">{period.roomNo || 'Room 201'}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Homework Tasks */}
        <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 space-y-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-black text-base text-slate-900">Homework & Coursework</h3>
              <p className="text-xs text-slate-500 font-medium">Assigned by subject teachers with submission deadline</p>
            </div>
            <Link
              href="/student/homework"
              className="text-xs font-black text-orange-600 hover:text-orange-700"
            >
              Submit Online ➔
            </Link>
          </div>

          {homeworks.length === 0 ? (
            <div className="p-8 text-center text-slate-400 space-y-2">
              <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-slate-700">No pending homework assignments</p>
              <p className="text-[11px] text-slate-400">All coursework tasks are up to date.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {homeworks.slice(0, 4).map((hw) => (
                <div key={hw.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 hover:bg-orange-50/40 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-md bg-orange-100/80 text-orange-900 text-[10px] font-bold">
                      {hw.subject?.name || hw.subjectName || 'Subject'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Due: {new Date(hw.dueDate).toLocaleDateString('en-GB')}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-slate-900">{hw.title}</h4>
                  <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">{hw.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* 7. QUICK SHORTCUT TILES */}
      <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-350 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <Link
          href="/student/ai-assistant"
          className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all text-center space-y-2 group"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
            <Bot className="w-5 h-5" />
          </div>
          <span className="font-bold text-xs text-slate-900 block">AI Copilot</span>
        </Link>

        <Link
          href="/student/homework"
          className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all text-center space-y-2 group"
        >
          <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform border border-orange-200">
            <BookOpen className="w-5 h-5" />
          </div>
          <span className="font-bold text-xs text-slate-900 block">Homework</span>
        </Link>

        <Link
          href="/student/timetable"
          className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all text-center space-y-2 group"
        >
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform border border-blue-200">
            <Clock className="w-5 h-5" />
          </div>
          <span className="font-bold text-xs text-slate-900 block">Timetable</span>
        </Link>

        <Link
          href="/student/resources"
          className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all text-center space-y-2 group"
        >
          <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform border border-purple-200">
            <FolderDown className="w-5 h-5" />
          </div>
          <span className="font-bold text-xs text-slate-900 block">Study Library</span>
        </Link>

        <Link
          href="/student/support"
          className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all text-center space-y-2 group"
        >
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform border border-emerald-200">
            <HelpCircle className="w-5 h-5" />
          </div>
          <span className="font-bold text-xs text-slate-900 block">AI Helpdesk</span>
        </Link>

        <Link
          href="/student/settings"
          className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all text-center space-y-2 group"
        >
          <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform border border-slate-200">
            <Settings className="w-5 h-5" />
          </div>
          <span className="font-bold text-xs text-slate-900 block">Settings</span>
        </Link>
      </div>

      {/* SMART QR ATTENDANCE MODAL (Sections 49 & 51-55) */}
      {showQrModal && (
        <QRScannerModal
          onClose={() => {
            setShowQrModal(false);
            // Refresh student attendance stats
            fetch('/api/student/attendance')
              .then((res) => res.json())
              .then((attData) => {
                if (attData.statistics) setAttendanceStats(attData.statistics);
              })
              .catch(console.error);
          }}
        />
      )}

    </div>
  );
}
