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

  // 2. Fetch active child's real records from database whenever activeChild changes
  useEffect(() => {
    if (!activeChild?.id) return;

    // Fetch child's attendance
    fetch(`/api/attendance?studentId=${activeChild.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.records) setChildAttendance(data.records);
      })
      .catch(console.error);

    // Fetch child's invoices
    fetch(`/api/fees/invoices?studentId=${activeChild.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.invoices) setChildInvoices(data.invoices);
      })
      .catch(console.error);

    // Fetch child's marks
    fetch(`/api/examinations/marks?studentId=${activeChild.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.marks) setChildMarks(data.marks);
      })
      .catch(console.error);

    // Fetch child's homework
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
      <div className="p-12 text-center text-xs text-slate-500 space-y-2">
        <span className="animate-spin inline-block text-xl">⏳</span>
        <p>Loading Parent & Family Monitoring Portal...</p>
      </div>
    );
  }

  if (!parent || childrenList.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-amber-900 bg-amber-50 border border-amber-200 rounded-3xl max-w-lg mx-auto">
        <AlertCircle className="w-8 h-8 mx-auto text-amber-600 mb-2" />
        <h3 className="font-bold text-sm">No Linked Students Found</h3>
        <p className="mt-1">
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
    <div className="space-y-6">
      {/* Top Welcome Header */}
      <div className="bg-gradient-to-r from-amber-900 via-slate-900 to-slate-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-400/30">
              Family & Guardian Portal
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 text-[10px] font-semibold border border-emerald-400/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Synced
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
            Assalam-o-Alaikum, {parent.fatherName}
          </h1>
          <p className="text-xs text-amber-200">
            Real-time child monitoring: daily smart gate attendance, homework tasks, fee vouchers, and term report cards.
          </p>
        </div>

        {/* Multi-Child Switcher Tabs */}
        {childrenList.length > 1 && (
          <div className="bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800 flex items-center gap-1.5 shadow-lg">
            <span className="text-[10px] font-bold text-slate-400 uppercase px-2">Select Child:</span>
            {childrenList.map((ch, idx) => (
              <button
                key={ch.id}
                onClick={() => {
                  setSelectedChildIndex(idx);
                  setShowReportCard(false);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedChildIndex === idx
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                }`}
              >
                {ch.fullName} ({ch.class?.name || 'Class'})
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Selected Child Info Strip */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 font-bold flex items-center justify-center text-sm shadow-sm overflow-hidden">
            {activeChild?.photoUrl ? (
              <img src={activeChild.photoUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              activeChild?.fullName?.charAt(0) || 'S'
            )}
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-slate-900">
              {activeChild?.fullName}
            </h3>
            <p className="text-[11px] text-slate-500 font-mono">
              ID: {activeChild?.studentId} • Class: {activeChild?.class?.name} ({activeChild?.section?.name}) • Roll #{activeChild?.rollNo}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {formattedMarks.length > 0 && (
            <button
              onClick={() => setShowReportCard(true)}
              className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors border border-blue-200"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Official Report Card</span>
            </button>
          )}
        </div>
      </div>

      {/* Primary KPI Cards for Active Child */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Attendance */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Today's Gate Status</span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                latestAttendance?.status === 'PRESENT'
                  ? 'bg-emerald-100 text-emerald-800'
                  : latestAttendance?.status === 'LATE'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              {latestAttendance?.status || 'NOT SCANNED'} {latestAttendance?.time ? `(${latestAttendance.time})` : ''}
            </span>
          </div>
          <h3 className="text-2xl font-extrabold text-emerald-700 mt-2">{attendanceRate}%</h3>
          <p className="text-[11px] text-slate-500 mt-1">Semester Attendance Record ({totalDays} days)</p>
        </div>

        {/* Academic Performance */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Exam Standing</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
              {formattedMarks.length > 0 ? `${formattedMarks.length} Subjects Evaluated` : 'Mid-Term 2026'}
            </span>
          </div>
          <h3 className="text-2xl font-extrabold text-blue-900 mt-2">
            {formattedMarks.length > 0 ? `${cumulativePct}% Score` : 'Evaluation in Progress'}
          </h3>
          <p className="text-[11px] text-emerald-600 font-bold mt-1">Official BISE Curriculum Record</p>
        </div>

        {/* Fee Balance */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Fee Status</span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                totalDue === 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
              }`}
            >
              {totalDue === 0 ? 'PAID IN FULL' : 'PAYMENT DUE'}
            </span>
          </div>
          <h3 className={`text-2xl font-extrabold mt-2 font-mono ${totalDue > 0 ? 'text-red-600' : 'text-emerald-700'}`}>
            Rs. {totalDue.toLocaleString()}
          </h3>
          <p className="text-[11px] text-slate-500 mt-1">
            {totalDue === 0 ? 'All vouchers cleared' : 'Outstanding fee balance due'}
          </p>
        </div>
      </div>

      {/* Two Columns: Homework & Academic Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Subject-Wise Academic Evaluation */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="font-bold text-sm text-slate-900">
              Academic Assessment — {activeChild?.fullName}
            </h3>
            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              Session 2026
            </span>
          </div>

          {formattedMarks.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              Exam marks are currently being tabulated by subject faculty.
            </div>
          ) : (
            <div className="space-y-3 text-xs">
              {formattedMarks.map((m, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex justify-between items-center">
                    <strong className="text-slate-900">{m.subjectName}</strong>
                    <span className="font-mono font-bold text-blue-900">
                      {m.obtainedMarks} / {m.totalMarks} (Grade {m.grade}, GPA {m.gpa})
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 italic">"{m.remarks}"</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Daily Homework & Active Assignments */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="font-bold text-sm text-slate-900">Daily Homework Tasks</h3>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              {activeChild?.class?.name}
            </span>
          </div>

          {childHomework.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No pending homework tasks assigned today.
            </div>
          ) : (
            <div className="space-y-3 text-xs">
              {childHomework.map((hw) => (
                <div key={hw.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="flex justify-between items-center">
                    <strong className="text-slate-900">
                      {hw.subject?.name}: {hw.title}
                    </strong>
                    <span className="text-amber-700 font-bold text-[10px]">
                      Due: {new Date(hw.dueDate).toLocaleDateString('en-GB')}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px]">{hw.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Fee Invoices & Payment Receipts for this Child */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <h3 className="font-bold text-sm text-slate-900">Fee Invoices & Payment Ledger</h3>
          <span className="text-xs text-slate-500">Official Accounts Record</span>
        </div>

        {childInvoices.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No fee invoices generated yet for this student.
          </div>
        ) : (
          <div className="space-y-3 text-xs">
            {childInvoices.map((inv) => (
              <div key={inv.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex flex-wrap justify-between items-center gap-3">
                <div>
                  <span className="font-mono font-bold text-blue-900 mr-2">{inv.invoiceNo}</span>
                  <strong className="text-slate-900">{inv.title}</strong>
                  <span className="text-slate-500 ml-2">({inv.month})</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-slate-500 text-[10px] block">Amount Due:</span>
                    <strong className="font-mono text-slate-900">Rs. {inv.remainingAmount.toLocaleString()}</strong>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                      inv.status === 'PAID'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {inv.status}
                  </span>
                  {inv.payments && inv.payments.length > 0 && (
                    <button
                      onClick={() => setSelectedReceipt({ receipt: inv.payments[0], invoice: inv, student: activeChild })}
                      className="px-3 py-1 bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm"
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
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-4xl w-full bg-white rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-2">
              <h4 className="font-bold text-sm">Official Examination Transcript</h4>
              <button
                onClick={() => setShowReportCard(false)}
                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-xs font-bold rounded-lg"
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

      {/* Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-4xl w-full bg-white rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-2">
              <h4 className="font-bold text-sm">Official Fee Deposit Receipt</h4>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-xs font-bold rounded-lg"
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
