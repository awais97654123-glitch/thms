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
  GraduationCap 
} from 'lucide-react';
import PrintableReportCard from '@/components/common/PrintableReportCard';
import PrintableReceipt from '@/components/common/PrintableReceipt';

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

  // 1. Fetch authenticated parent profile
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user?.parent) {
          setParent(data.user.parent);
          if (data.user.parent.students && data.user.parent.students.length > 0) {
            setChildrenList(data.user.parent.students);
          }
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const activeChild = childrenList[selectedChildIndex] || null;

  // 2. Fetch active child's real records from database
  useEffect(() => {
    if (!activeChild?.id) return;

    fetch(`/api/attendance?studentId=${activeChild.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.records) setChildAttendance(data.records);
      })
      .catch(console.error);

    fetch(`/api/fees/invoices?studentId=${activeChild.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.invoices) setChildInvoices(data.invoices);
      })
      .catch(console.error);

    fetch(`/api/examinations/marks?studentId=${activeChild.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.marks) setChildMarks(data.marks);
      })
      .catch(console.error);

    if (activeChild.class?.id) {
      fetch(`/api/homework?classId=${activeChild.class.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.homeworks) setChildHomework(data.homeworks);
        })
        .catch(console.error);
    }
  }, [activeChild?.id]);

  if (loading) {
    return (
      <div className="p-16 text-center space-y-4">
        <div className="w-10 h-10 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs font-bold text-slate-500">Loading Family Monitoring Hub...</p>
      </div>
    );
  }

  if (!parent || childrenList.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-amber-900 bg-amber-50 border border-amber-200 rounded-3xl max-w-lg mx-auto space-y-2">
        <AlertCircle className="w-8 h-8 mx-auto text-amber-600" />
        <h3 className="font-black text-sm text-slate-900">No Linked Students Found</h3>
        <p className="text-slate-600 font-medium">
          Your parent account is active, but no enrolled students are currently linked. Please contact the school admissions office.
        </p>
      </div>
    );
  }

  // Attendance metrics
  const totalDays = childAttendance.length;
  const presentDays = childAttendance.filter((a) => a.status === 'PRESENT' || a.status === 'LATE').length;
  const attendanceRate = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : '100.0';
  const latestAttendance = childAttendance[0] || null;

  // Fee metrics
  const totalDue = childInvoices
    .filter((inv) => inv.status !== 'PAID')
    .reduce((sum, inv) => sum + (inv.remainingAmount || 0), 0);

  // Marks metrics
  const formattedMarks = childMarks.map((m) => ({
    subjectName: m.examSchedule?.subject?.name || 'Subject',
    totalMarks: m.totalMarks || 100,
    obtainedMarks: m.marksObtained || 0,
    percentage: m.percentage || 0,
    grade: m.grade || 'N/A',
    gpa: m.gpa || 0,
    remarks: m.remarks || 'Satisfactory progress',
  }));

  const totalObtained = formattedMarks.reduce((sum, m) => sum + m.obtainedMarks, 0);
  const totalMax = formattedMarks.reduce((sum, m) => sum + m.totalMarks, 0);
  const cumulativePct = totalMax > 0 ? ((totalObtained / totalMax) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Welcome Header with Multi-Child Switcher */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-950 via-slate-900 to-slate-950 text-white p-8 sm:p-10 shadow-2xl border border-slate-800/80">
        <div className="absolute right-0 top-0 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-black border border-amber-400/30 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>Family & Guardian Hub • Session 2026-2027</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              Assalam-o-Alaikum, {parent.fatherName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
              Real-time multi-child monitoring: daily gate check-in status, homework assignments, monthly fee vouchers, and terminal examination scorecards.
            </p>
          </div>

          {/* Multi-Child Switcher Tabs */}
          {childrenList.length > 1 && (
            <div className="bg-slate-950/80 p-2 rounded-2xl border border-slate-800/90 flex flex-wrap items-center gap-2 shadow-2xl backdrop-blur-2xl">
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-2">
                Child:
              </span>
              {childrenList.map((ch, idx) => (
                <button
                  key={ch.id}
                  onClick={() => {
                    setSelectedChildIndex(idx);
                    setShowReportCard(false);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                    selectedChildIndex === idx
                      ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/25 scale-[1.03]'
                      : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {ch.fullName} ({ch.class?.name || 'Class'})
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Selected Child Info Banner */}
      <div className="glass-panel p-5 rounded-3xl border border-white shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white font-black flex items-center justify-center text-base shadow-md overflow-hidden flex-shrink-0">
            {activeChild?.photoUrl ? (
              <img src={activeChild.photoUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              activeChild?.fullName?.charAt(0) || 'S'
            )}
          </div>
          <div>
            <h3 className="font-black text-base text-slate-900">
              {activeChild?.fullName}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              ID: <span className="font-mono font-bold text-slate-700">{activeChild?.studentId}</span> • Class: <span className="font-bold text-slate-700">{activeChild?.class?.name} ({activeChild?.section?.name})</span> • Roll #{activeChild?.rollNo}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {formattedMarks.length > 0 && (
            <button
              onClick={() => setShowReportCard(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-black rounded-2xl flex items-center gap-2 transition-all shadow-md shadow-blue-500/20"
            >
              <Printer className="w-4 h-4" />
              <span>Print Official Report Card</span>
            </button>
          )}
        </div>
      </div>

      {/* Primary KPI Cards for Active Child */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Attendance */}
        <div className="glass-panel p-6 rounded-3xl border border-white shadow-sm glass-card-hover space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Today's Gate Status</span>
            <span
              className={`px-3 py-1 rounded-full text-[10px] font-black border ${
                latestAttendance?.status === 'PRESENT'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : latestAttendance?.status === 'LATE'
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              {latestAttendance?.status || 'NOT SCANNED'} {latestAttendance?.time ? `(${latestAttendance.time})` : ''}
            </span>
          </div>
          <h3 className="text-3xl font-black text-emerald-700 tracking-tight">{attendanceRate}%</h3>
          <p className="text-xs text-slate-500 font-semibold">Semester Attendance ({totalDays} Days Recorded)</p>
        </div>

        {/* Academic Performance */}
        <div className="glass-panel p-6 rounded-3xl border border-white shadow-sm glass-card-hover space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Exam Standing</span>
            <span className="px-3 py-1 rounded-full text-[10px] font-black bg-blue-50 text-blue-700 border border-blue-200">
              {formattedMarks.length > 0 ? `${formattedMarks.length} Subjects Evaluated` : 'Mid-Term 2026'}
            </span>
          </div>
          <h3 className="text-3xl font-black text-blue-900 tracking-tight">
            {formattedMarks.length > 0 ? `${cumulativePct}% Score` : 'Tabulation in Progress'}
          </h3>
          <p className="text-xs text-emerald-600 font-bold">Official BISE Curriculum Record</p>
        </div>

        {/* Fee Balance */}
        <div className="glass-panel p-6 rounded-3xl border border-white shadow-sm glass-card-hover space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Fee Status</span>
            <span
              className={`px-3 py-1 rounded-full text-[10px] font-black border ${
                totalDue === 0 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}
            >
              {totalDue === 0 ? 'PAID IN FULL' : 'PAYMENT DUE'}
            </span>
          </div>
          <h3 className={`text-3xl font-black font-mono tracking-tight ${totalDue > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
            Rs. {totalDue.toLocaleString()}
          </h3>
          <p className="text-xs text-slate-500 font-semibold">
            {totalDue === 0 ? 'All vouchers cleared' : 'Outstanding balance due'}
          </p>
        </div>
      </div>

      {/* Two Column Grid: Academic Evaluation & Daily Homework */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Subject-Wise Academic Evaluation */}
        <div className="lg:col-span-7 glass-panel p-6 sm:p-7 rounded-3xl border border-white shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-black text-base text-slate-900">
                Academic Evaluation — {activeChild?.fullName}
              </h3>
              <p className="text-xs text-slate-500 font-medium">Mid-Term examinations scorecard & teacher remarks</p>
            </div>
            <span className="text-[11px] font-extrabold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              Session 2026-27
            </span>
          </div>

          {formattedMarks.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 font-medium">
              Exam marks are currently being tabulated by subject faculty.
            </div>
          ) : (
            <div className="space-y-3 text-xs">
              {formattedMarks.map((m, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-white/70 border border-slate-200/80 space-y-1.5 glass-card-hover">
                  <div className="flex justify-between items-center">
                    <strong className="text-slate-900 font-bold">{m.subjectName}</strong>
                    <span className="font-mono font-black text-blue-900">
                      {m.obtainedMarks} / {m.totalMarks} (Grade {m.grade}, GPA {m.gpa})
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 italic font-medium">"{m.remarks}"</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Daily Homework Tasks */}
        <div className="lg:col-span-5 glass-panel p-6 sm:p-7 rounded-3xl border border-white shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-black text-base text-slate-900">Daily Homework Tasks</h3>
              <p className="text-xs text-slate-500 font-medium">Active class assignments & deadlines</p>
            </div>
            <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              {activeChild?.class?.name}
            </span>
          </div>

          {childHomework.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 font-medium">
              No pending homework tasks assigned today.
            </div>
          ) : (
            <div className="space-y-3 text-xs">
              {childHomework.map((hw) => (
                <div key={hw.id} className="p-4 rounded-2xl bg-white/70 border border-slate-200/80 space-y-1.5 glass-card-hover">
                  <div className="flex justify-between items-center">
                    <strong className="text-slate-900 font-bold">
                      {hw.subject?.name}: {hw.title}
                    </strong>
                    <span className="text-amber-700 font-black text-[10px] bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200">
                      Due: {new Date(hw.dueDate).toLocaleDateString('en-GB')}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px] font-medium leading-relaxed">{hw.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Fee Invoices & Payment Ledger */}
      <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-white shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-black text-base text-slate-900">Fee Invoices & Payment Ledger</h3>
            <p className="text-xs text-slate-500 font-medium">Official verified accounts statement for {activeChild?.fullName}</p>
          </div>
          <span className="text-xs text-slate-500 font-semibold">Official Record</span>
        </div>

        {childInvoices.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 font-medium">
            No fee invoices generated yet for this student.
          </div>
        ) : (
          <div className="space-y-3 text-xs">
            {childInvoices.map((inv) => (
              <div key={inv.id} className="p-4 rounded-2xl border border-slate-200/80 bg-white/70 flex flex-wrap justify-between items-center gap-3 glass-card-hover">
                <div>
                  <span className="font-mono font-bold text-blue-900 mr-2">{inv.invoiceNo}</span>
                  <strong className="text-slate-900 font-bold">{inv.title}</strong>
                  <span className="text-slate-500 font-medium ml-2">({inv.month})</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-slate-500 text-[10px] font-medium block">Amount Due:</span>
                    <strong className="font-mono text-slate-900 font-bold">Rs. {inv.remainingAmount.toLocaleString()}</strong>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-black border ${
                      inv.status === 'PAID'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    {inv.status}
                  </span>
                  {inv.payments && inv.payments.length > 0 && (
                    <button
                      onClick={() => setSelectedReceipt({ receipt: inv.payments[0], invoice: inv, student: activeChild })}
                      className="px-3.5 py-1.5 bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Receipt</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Official Report Card Modal */}
      {showReportCard && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-4xl w-full bg-white rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h4 className="font-black text-base text-slate-900">Official Examination Transcript</h4>
              <button
                onClick={() => setShowReportCard(false)}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-xs font-bold rounded-xl transition-colors"
              >
                ✕ Close
              </button>
            </div>
            <PrintableReportCard
              student={{
                studentId: activeChild.studentId,
                admissionNo: activeChild.admissionNo,
                rollNo: activeChild.rollNo,
                fullName: activeChild.fullName,
                class: activeChild.class,
                section: activeChild.section,
                parent: { fatherName: parent.fatherName },
              }}
              exam={{
                name: 'Mid-Term Examination 2026',
                term: 'MID_TERM',
              }}
              sessionName="Academic Session 2026-2027"
              marks={formattedMarks}
            />
          </div>
        </div>
      )}

      {/* Official Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-4xl w-full bg-white rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h4 className="font-black text-base text-slate-900">Official Fee Deposit Receipt</h4>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-xs font-bold rounded-xl transition-colors"
              >
                ✕ Close
              </button>
            </div>
            <PrintableReceipt
              receipt={selectedReceipt.receipt}
              invoice={selectedReceipt.invoice}
              student={{
                studentId: selectedReceipt.student.studentId,
                admissionNo: selectedReceipt.student.admissionNo,
                rollNo: selectedReceipt.student.rollNo,
                fullName: selectedReceipt.student.fullName,
                className: selectedReceipt.student.class?.name || 'Class',
                sectionName: selectedReceipt.student.section?.name || 'Section',
                fatherName: parent.fatherName,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
