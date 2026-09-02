'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, 
  CalendarCheck, 
  Award, 
  DollarSign, 
  BookOpen, 
  ArrowRight, 
  Printer, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  ShieldCheck, 
  AlertCircle, 
  GraduationCap,
  Bell,
  ChevronRight,
  TrendingUp,
  FileText,
  CreditCard,
  Phone,
  RefreshCw,
  Loader2,
  Ban,
  AlertTriangle
} from 'lucide-react';
import PrintableReportCard from '@/components/common/PrintableReportCard';
import PrintableReceipt from '@/components/common/PrintableReceipt';
import NotificationBell from '@/components/common/NotificationBell';

export default function ParentDashboardPage() {
  const [parent, setParent] = useState<any | null>(null);
  const [childrenList, setChildrenList] = useState<any[]>([]);
  const [selectedChildIndex, setSelectedChildIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Child dynamic data
  const [childAttendance, setChildAttendance] = useState<any[]>([]);
  const [childInvoices, setChildInvoices] = useState<any[]>([]);
  const [childMarks, setChildMarks] = useState<any[]>([]);
  const [childHomework, setChildHomework] = useState<any[]>([]);
  const [showReportCard, setShowReportCard] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);

  // Live Ward Schedule & Period Engine
  const [childSchedule, setChildSchedule] = useState<any[]>([]);
  const [childCurrentPeriod, setChildCurrentPeriod] = useState<any | null>(null);
  const [isSchoolClosed, setIsSchoolClosed] = useState(false);
  const [closureInfo, setClosureInfo] = useState<any | null>(null);

  // 1. Fetch authenticated parent profile
  const fetchParentData = () => {
    setLoading(true);
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user?.parent) {
          setParent(data.user.parent);
          if (data.user.parent.students && data.user.parent.students.length > 0) {
            setChildrenList(data.user.parent.students);
          } else {
            setChildrenList([]);
          }
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchParentData();
  }, []);

  const activeChild = childrenList[selectedChildIndex] || null;

  // 2. Fetch active child's real records from database
  useEffect(() => {
    if (!activeChild?.id) return;

    // Attendance
    fetch(`/api/attendance?studentId=${activeChild.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.records) setChildAttendance(data.records);
      })
      .catch(console.error);

    // Invoices & Fees
    fetch(`/api/fees?studentId=${activeChild.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.invoices) setChildInvoices(data.invoices);
      })
      .catch(console.error);

    // Exam Results & Marks
    fetch(`/api/examinations/marks?studentId=${activeChild.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.marks) setChildMarks(data.marks);
      })
      .catch(console.error);

    // Homework
    fetch(`/api/student/homework?studentId=${activeChild.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.submissions) setChildHomework(data.submissions);
      })
      .catch(console.error);

    // Live Timetable & Period Engine
    fetch(`/api/timetable/live?studentId=${activeChild.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.schedule) setChildSchedule(data.schedule);
        if (data.currentPeriod) setChildCurrentPeriod(data.currentPeriod);
        setIsSchoolClosed(!!data.isSchoolClosed);
        if (data.closureInfo) setClosureInfo(data.closureInfo);
      })
      .catch(console.error);
  }, [activeChild?.id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        <p className="text-sm font-bold text-slate-600">Loading Parent Portal & Ward Dossiers...</p>
      </div>
    );
  }

  if (!parent || childrenList.length === 0) {
    return (
      <div className="p-10 text-center bg-white rounded-3xl border border-slate-200 shadow-sm max-w-lg mx-auto mt-12 space-y-4">
        <Users className="w-12 h-12 text-blue-600 mx-auto" />
        <h3 className="text-xl font-bold text-slate-900">Welcome, {parent?.fatherName || 'Respected Parent'}</h3>
        <p className="text-xs text-slate-500">
          Your parent portal account is active. Once your child&apos;s admission application is approved &amp; enrolled by the admissions office, their academic profile, attendance, and fee vouchers will automatically appear here.
        </p>
        <Link href="/admissions/apply" className="inline-block px-5 py-2.5 btn-blue-prestige text-white text-xs font-bold rounded-xl">
          Check Admission Status
        </Link>
      </div>
    );
  }

  // Calculate child analytics
  const presentCount = childAttendance.filter((a) => a.status === 'PRESENT' || a.status === 'LATE').length;
  const attendanceRate = childAttendance.length > 0 ? ((presentCount / childAttendance.length) * 100).toFixed(1) : '100.0';
  const totalOutstanding = childInvoices.reduce((sum, inv) => sum + (inv.remainingAmount || 0), 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-300 bg-[#ffffff] text-slate-900 pb-16">
      
      {/* Top Welcome Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-[#0a192f] text-white p-8 sm:p-10 shadow-2xl border border-blue-900/40">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-600/25 text-blue-300 text-xs font-bold border border-blue-500/40 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
              <span>Parent Guardian Portal • Academic Session 2026-2027</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white font-serif">
              Welcome, {parent.fatherName || 'Respected Parent'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
              Track real-time biometric attendance, terminal exam marks cards, bank fee deposit slips, and faculty homework for your enrolled children.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <NotificationBell role="PARENT" />
            <button
              onClick={fetchParentData}
              className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 backdrop-blur-xl flex items-center gap-1.5 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* MULTI-CHILD SWITCHER TABS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-blue-600" />
            <span>Select Enrolled Child / Ward ({childrenList.length}):</span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {childrenList.map((ch, idx) => {
            const isSelected = selectedChildIndex === idx;
            return (
              <button
                key={ch.id}
                onClick={() => setSelectedChildIndex(idx)}
                className={`p-4 rounded-3xl border text-left transition-all flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-blue-50 border-blue-500 shadow-md ring-2 ring-blue-500/20'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex flex-col gap-2.5 w-full">
                  <div className="flex items-start justify-between gap-3 w-full">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#EFF6FF] text-[#2563EB] font-bold flex items-center justify-center text-base border border-[#BFDBFE] shrink-0">
                        {ch.fullName.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm leading-tight">{ch.fullName}</h3>
                        <p className="text-xs text-slate-500 font-medium">{ch.class?.name} • Section {ch.section?.name || 'A'}</p>
                        <span className="font-mono text-[10px] text-blue-800 font-bold">{ch.studentId}</span>
                      </div>
                    </div>

                    {isSelected && (
                      <CheckCircle2 className="w-5 h-5 text-[#2563EB] shrink-0" />
                    )}
                  </div>

                  {/* Micro indicators */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 text-[10px] font-bold w-full">
                    <span className="px-2 py-0.5 rounded-full bg-[#F0FDF4] text-[#16A34A] border border-[#DCFCE7]">
                      ✓ {ch.status || 'ENROLLED'}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]">
                      Card: {ch.cardStatus || 'VALID'}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ACTIVE CHILD KPI OVERVIEW */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-1 border-t-4 border-t-blue-600">
          <span className="text-[11px] font-bold text-slate-500 uppercase">30-Day Attendance</span>
          <h3 className="text-3xl font-black text-blue-600 font-mono tracking-tight">{attendanceRate}%</h3>
          <p className="text-xs text-slate-500 font-medium">Gate Biometric Check-Ins</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-1 border-t-4 border-t-emerald-600">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Fee Account Status</span>
          <h3 className="text-2xl font-black text-emerald-600 font-mono tracking-tight">
            {totalOutstanding === 0 ? 'CLEARED' : `Rs. ${totalOutstanding.toLocaleString()}`}
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            {totalOutstanding === 0 ? 'No Dues Pending' : 'Outstanding Balance'}
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-1 border-t-4 border-t-indigo-600">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Class Roll Number</span>
          <h3 className="text-3xl font-black text-slate-900 font-mono tracking-tight">{activeChild.rollNo || '08-A-014'}</h3>
          <p className="text-xs text-indigo-600 font-bold">{activeChild.class?.name || 'Class 8'}</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-1 border-t-4 border-t-amber-500">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Homework Assigned</span>
          <h3 className="text-3xl font-black text-slate-900 font-mono tracking-tight">{childHomework.length || 0} Tasks</h3>
          <p className="text-xs text-amber-600 font-bold">Current Week Curricula</p>
        </div>
      </div>

      {/* REAL-TIME WARD LIVE PERIOD & TIMETABLE WIDGET */}
      {isSchoolClosed && closureInfo && (
        <div className="p-6 rounded-3xl bg-rose-50 border-2 border-rose-500 text-rose-950 flex items-start gap-4 shadow-md animate-in fade-in">
          <AlertTriangle className="w-8 h-8 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white font-extrabold text-[10px] uppercase">
                {closureInfo.isEmergency ? 'Emergency Campus Closure' : 'Notice of School Closure'}
              </span>
              <h3 className="font-black text-lg text-rose-950 font-serif">{closureInfo.title}</h3>
            </div>
            <p className="text-xs text-rose-800 font-medium leading-relaxed">
              {closureInfo.reason}. On-campus periods and physical classes are suspended today.
            </p>
          </div>
        </div>
      )}

      {/* CANCELLATION NOTICE FOR PARENTS */}
      {childSchedule.some((p) => p.status === 'CANCELLED') && (
        <div className="p-5 rounded-3xl bg-rose-50 border border-rose-300 text-rose-950 space-y-2 animate-in fade-in">
          <div className="flex items-center gap-2 text-rose-700 font-bold text-xs">
            <Ban className="w-4 h-4" />
            <span>Class Period Cancellation Notice for {activeChild.fullName}:</span>
          </div>
          {childSchedule
            .filter((p) => p.status === 'CANCELLED')
            .map((p) => (
              <div key={p.id} className="p-3 bg-white rounded-2xl border border-rose-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <strong className="text-slate-900">{p.subjectName}</strong> ({p.startTime} - {p.endTime}) cancelled by {p.teacherName}.
                  {p.cancellationReason && (
                    <span className="text-rose-700 block text-[11px] italic mt-0.5">Reason: &ldquo;{p.cancellationReason}&rdquo;</span>
                  )}
                </div>
                <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 text-[10px] font-black uppercase shrink-0">
                  Cancelled
                </span>
              </div>
            ))}
        </div>
      )}

      {/* TODAY'S SCHEDULE FOR ACTIVE CHILD */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-sm text-slate-900 font-serif">
              {activeChild.fullName}&apos;s Live Timetable &amp; Schedule Today
            </h3>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">Asia/Karachi • Live Period Tracking</span>
        </div>

        {childSchedule.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">No periods scheduled for this section today.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {childSchedule.map((p) => {
              const isActive = p.status === 'ACTIVE';
              const isCancelled = p.status === 'CANCELLED';
              const isSub = p.status === 'SUBSTITUTE';

              return (
                <div
                  key={p.id}
                  className={`p-4 rounded-2xl border transition-all space-y-1.5 ${
                    isActive
                      ? 'bg-emerald-50 border-emerald-400 shadow-sm ring-2 ring-emerald-500/20'
                      : isCancelled
                      ? 'bg-rose-50/70 border-rose-200'
                      : isSub
                      ? 'bg-purple-50/70 border-purple-200'
                      : 'bg-slate-50 border-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-mono font-bold text-slate-700">{p.startTime} - {p.endTime}</span>
                    <span className={`px-2 py-0.5 rounded-full font-black uppercase text-[8px] ${p.badgeClass || 'bg-slate-200 text-slate-600'}`}>
                      {p.label || p.status}
                    </span>
                  </div>

                  <h4 className="font-black text-xs text-slate-900">{p.subjectName}</h4>
                  <p className="text-[11px] text-slate-500">
                    {p.isSubstitute ? `Sub: ${p.substituteTeacherName}` : p.teacherName} • Room {p.roomNo}
                  </p>

                  {isActive && p.minutesRemaining !== undefined && (
                    <div className="text-[10px] text-emerald-700 font-mono font-bold pt-1">
                      🟢 Active Now • {p.minutesRemaining}m left
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* REAL ATTENDANCE & INVOICES GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Attendance Widget */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-sm text-slate-900 font-serif">Gate Biometric Attendance Ledger</h3>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
              {attendanceRate}% On-Time
            </span>
          </div>

          <div className="space-y-2">
            {childAttendance.length === 0 ? (
              <p className="text-xs text-slate-400 p-6 text-center">No attendance scans recorded for this student yet.</p>
            ) : (
              childAttendance.slice(0, 5).map((att) => (
                <div key={att.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <strong className="text-slate-900 block">{new Date(att.date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' })}</strong>
                    <span className="text-[11px] text-slate-500 font-mono">Time: {att.time || '07:48 AM'}</span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold ${
                    att.status === 'PRESENT' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {att.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Fee Invoices & 3-Slip Receipts */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-sm text-slate-900 font-serif">Bank Fee Vouchers & Invoices</h3>
            </div>
            <span className="text-xs font-bold text-slate-500">Official Allied Bank / Cash Desk</span>
          </div>

          <div className="space-y-2.5">
            {childInvoices.length === 0 ? (
              <p className="text-xs text-slate-400 p-6 text-center">No fee invoices issued for this student yet.</p>
            ) : (
              childInvoices.slice(0, 4).map((inv) => (
                <div key={inv.id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <strong className="text-slate-900">{inv.month}</strong>
                      <span className="font-mono text-[10px] text-slate-400 font-bold">{inv.invoiceNo}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Billed: <strong className="font-mono text-slate-800">Rs. {inv.totalAmount.toLocaleString()}</strong> • Paid: <strong className="font-mono text-emerald-700">Rs. {inv.paidAmount.toLocaleString()}</strong>
                    </p>
                  </div>

                  <button
                    onClick={() => setSelectedReceipt(inv)}
                    className="px-3 py-1.5 btn-blue-prestige text-white text-[11px] font-bold rounded-xl shadow transition-all hover:scale-105"
                  >
                    3-Copy Voucher
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* EXAM REPORT CARD MODAL / VIEWER */}
      {selectedReceipt && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b pb-2">
            <h4 className="font-bold text-sm text-slate-900 font-serif">Printable 3-Copy Bank Deposit Voucher</h4>
            <button
              onClick={() => setSelectedReceipt(null)}
              className="text-xs text-slate-400 hover:text-slate-600 font-bold"
            >
              ✕ Close Voucher
            </button>
          </div>
          <PrintableReceipt
            invoice={selectedReceipt}
            student={{
              studentId: activeChild.studentId,
              admissionNo: activeChild.admissionNo,
              rollNo: activeChild.rollNo,
              fullName: activeChild.fullName,
              class: activeChild.class,
              section: activeChild.section,
              parent: parent,
            }}
            payment={selectedReceipt.payments?.[0]}
          />
        </div>
      )}

    </div>
  );
}
