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
  CreditCard
} from 'lucide-react';
import PrintableReportCard from '@/components/common/PrintableReportCard';
import PrintableReceipt from '@/components/common/PrintableReceipt';

export default function ParentDashboardPage() {
  const [childrenList, setChildrenList] = useState<any[]>([
    {
      id: 'student-1',
      studentId: 'THMS-2026-000001',
      admissionNo: 'ADM-2026-000001',
      rollNo: '08-A-001',
      fullName: 'Hamza Tariq',
      className: 'Class 8',
      sectionName: 'Section A',
      attendanceRate: 96.4,
      todayStatus: 'PRESENT',
      grade: 'A+ (GPA 4.0)',
      feeDue: 0,
      feeStatus: 'PAID',
    },
    {
      id: 'student-2',
      studentId: 'THMS-2026-000002',
      admissionNo: 'ADM-2026-000002',
      rollNo: '05-A-001',
      fullName: 'Aiman Tariq',
      className: 'Class 5',
      sectionName: 'Section A',
      attendanceRate: 98.2,
      todayStatus: 'PRESENT',
      grade: 'A+ (GPA 4.0)',
      feeDue: 0,
      feeStatus: 'PAID',
    },
  ]);

  const [selectedChildIndex, setSelectedChildIndex] = useState(0);
  const [showReportCard, setShowReportCard] = useState(false);

  const [lastSyncTime, setLastSyncTime] = useState<string>(new Date().toLocaleTimeString('en-GB'));
  const [syncAlert, setSyncAlert] = useState(false);

  const currentChild = childrenList[selectedChildIndex];

  useEffect(() => {
    const handleSync = () => {
      setLastSyncTime(new Date().toLocaleTimeString('en-GB'));
      setSyncAlert(true);
      setTimeout(() => setSyncAlert(false), 4000);
    };

    window.addEventListener('thms_sync_completed', handleSync);
    return () => window.removeEventListener('thms_sync_completed', handleSync);
  }, []);

  return (
    <div className="space-y-6">
      {/* Real-time Sync Banner */}
      {syncAlert && (
        <div className="p-3 bg-amber-50 border border-amber-300 rounded-2xl text-amber-900 text-xs font-bold flex items-center gap-2 shadow-sm animate-in fade-in">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>New student records & fees updated via Admin sync! (Refreshed at {lastSyncTime})</span>
        </div>
      )}

      {/* Top Welcome Header */}
      <div className="bg-gradient-to-r from-amber-900 via-slate-900 to-slate-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-400/30">
              Parent & Guardian Portal
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 text-[10px] font-semibold border border-emerald-400/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Synced
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
            Welcome, Dr. Tariq Mehmood
          </h1>
          <p className="text-xs text-amber-200">
            Real-time monitoring of attendance, term results, homework, and fee vouchers for your linked children.
          </p>
        </div>

        {/* Multi-Child Switcher Pill Selector (Prompt Section 29) */}
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
              {ch.fullName} ({ch.className})
            </button>
          ))}
        </div>
      </div>

      {/* Primary KPI Cards for Selected Child */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Attendance */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Today's Gate Status</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
              {currentChild.todayStatus} (08:05 AM)
            </span>
          </div>
          <h3 className="text-2xl font-extrabold text-emerald-700 mt-2">{currentChild.attendanceRate}%</h3>
          <p className="text-[11px] text-slate-500 mt-1">Overall Semester Attendance</p>
        </div>

        {/* Mid-Term Results */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Mid-Term Result</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
              1st Position
            </span>
          </div>
          <h3 className="text-2xl font-extrabold text-blue-900 mt-2">{currentChild.grade}</h3>
          <p className="text-[11px] text-emerald-600 font-bold mt-1">High Honors Promotion</p>
        </div>

        {/* Fee Balance */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Fee Status</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
              {currentChild.feeStatus}
            </span>
          </div>
          <h3 className="text-2xl font-extrabold text-emerald-700 mt-2">Rs. {currentChild.feeDue} Due</h3>
          <p className="text-[11px] text-slate-500 mt-1">March 2026 Voucher Verified</p>
        </div>
      </div>

      {/* Child Performance & Quick Actions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Academic Summary */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="font-bold text-sm text-slate-900">
              Academic Assessment — {currentChild.fullName}
            </h3>
            <button
              onClick={() => setShowReportCard(true)}
              className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Official Report Card</span>
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex justify-between">
                <strong className="text-slate-900">Mathematics (Prof. Farooq Ahmad)</strong>
                <span className="font-mono font-bold text-blue-900">95 / 100 (A+)</span>
              </div>
              <p className="text-[11px] text-slate-500 italic">"Exceptional analytical proofs and disciplined class participation."</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex justify-between">
                <strong className="text-slate-900">English Literature (Ms. Ayesha)</strong>
                <span className="font-mono font-bold text-blue-900">91 / 100 (A+)</span>
              </div>
              <p className="text-[11px] text-slate-500 italic">"Superb vocabulary and creative essay writing."</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex justify-between">
                <strong className="text-slate-900">General Science (Mr. Bilal Khan)</strong>
                <span className="font-mono font-bold text-blue-900">94 / 100 (A+)</span>
              </div>
              <p className="text-[11px] text-slate-500 italic">"Deep understanding of physical principles and lab experiments."</p>
            </div>
          </div>
        </div>

        {/* Daily Homework & Notice Board */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="font-bold text-sm text-slate-900">Daily Homework & Notices</h3>
            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
              {currentChild.className}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="flex justify-between items-center">
                <strong className="text-slate-900">Mathematics Ex 4.2</strong>
                <span className="text-red-600 font-bold text-[10px]">Due in 3 days</span>
              </div>
              <p className="text-slate-600 text-[11px]">
                Solve questions 1 through 15 on Chapter 4. Ensure step-by-step proofs for quadratic expansions.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-1 text-blue-950">
              <strong className="block text-xs font-bold text-blue-900">
                Annual Science & Robotics Expo
              </strong>
              <p className="text-[11px] text-blue-800">
                School campus will host the inter-class science exhibition next Friday.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Official Report Card Modal Popup */}
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
                studentId: currentChild.studentId,
                admissionNo: currentChild.admissionNo,
                rollNo: currentChild.rollNo,
                fullName: currentChild.fullName,
                class: { name: currentChild.className },
                section: { name: currentChild.sectionName },
                parent: { fatherName: 'Dr. Tariq Mehmood' },
              }}
              exam={{
                name: 'Mid-Term Examination 2026',
                term: 'MID_TERM',
              }}
              sessionName="Academic Session 2026-2027"
              marks={[
                { subjectName: 'Mathematics', totalMarks: 100, obtainedMarks: 95, percentage: 95, grade: 'A+', gpa: 4.0, remarks: 'Outstanding proofs & calculations' },
                { subjectName: 'English Literature', totalMarks: 100, obtainedMarks: 91, percentage: 91, grade: 'A+', gpa: 4.0, remarks: 'Superb grammar and comprehension' },
                { subjectName: 'General Science', totalMarks: 100, obtainedMarks: 94, percentage: 94, grade: 'A+', gpa: 4.0, remarks: 'Excellent grasp of physics and chemistry' },
              ]}
            />
          </div>
        </div>
      )}
    </div>
  );
}
