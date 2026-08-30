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
  Activity
} from 'lucide-react';
import PrintableIDCard from '@/components/common/PrintableIDCard';
import PortalCircularLoader from '@/components/common/PortalCircularLoader';

export default function StudentDashboardPage() {
  const [student, setStudent] = useState<any | null>(null);
  const [school, setSchool] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [attendanceStats, setAttendanceStats] = useState<any | null>(null);
  const [homeworks, setHomeworks] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [feeInvoices, setFeeInvoices] = useState<any[]>([]);

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
  }, []);

  const todayPeriods = [
    { time: '08:30 - 09:15 AM', subject: 'Mathematics (Algebra & Proofs)', teacher: 'Engr. Farooq Ahmad', room: 'Room 201' },
    { time: '09:20 - 10:05 AM', subject: 'English Grammar & Literature', teacher: 'Ms. Saima Khattak', room: 'Room 201' },
    { time: '10:25 - 11:10 AM', subject: 'General Science (Physics Lab)', teacher: 'Dr. Zobia Khan', room: 'Science Lab' },
    { time: '11:15 - 12:00 PM', subject: 'Islamic Studies & Quran', teacher: 'Qari Abdul Rehman', room: 'Room 201' },
  ];

  const pendingFeeAmount = feeInvoices
    .filter((inv: any) => inv.status !== 'PAID')
    .reduce((acc: number, inv: any) => acc + (inv.remainingAmount || inv.totalAmount || 0), 0);

  if (loading) {
    return (
      <div className="p-16 text-center">
        <PortalCircularLoader message="Loading Student Academic Hub..." subMessage="Querying PostgreSQL attendance and gradebook" />
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
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Futuristic Student Hero Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-orange-950/70 text-white p-8 sm:p-10 shadow-2xl border border-orange-500/20">
        <div className="absolute right-0 top-0 w-96 h-96 bg-orange-500/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-white p-1 border-2 border-orange-400/40 shadow-xl overflow-hidden shrink-0">
              <img
                src={student.photoUrl || '/student-avatar.png'}
                alt={student.fullName}
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-orange-500/20 text-orange-300 text-xs font-black border border-orange-400/30">
                <Sparkles className="w-3 h-3 text-orange-400" />
                <span>Session 2026-2027 • Enrolled Student</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                {student.fullName}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 font-medium">
                {student.class?.name || 'Class 8'} ({student.section?.name || 'Section A'}) • Roll No: <strong className="text-white font-mono">{student.rollNo}</strong> • Student ID: <strong className="text-orange-300 font-mono">{student.studentId}</strong>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/student/id-card"
              className="px-4 py-3 rounded-2xl bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white text-xs font-black shadow-lg shadow-orange-500/25 flex items-center gap-2 transition-all hover:scale-105"
            >
              <CreditCard className="w-4 h-4" />
              <span>Digital ID Card</span>
            </Link>
            <Link
              href="/student/fees"
              className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-black border border-white/20 backdrop-blur-xl flex items-center gap-2 transition-all hover:scale-105"
            >
              <DollarSign className="w-4 h-4 text-orange-400" />
              <span>Fee Vouchers</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Today's Status */}
        <div className="glass-panel p-6 rounded-3xl border border-white shadow-sm glass-card-hover space-y-2">
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
          <p className="text-[11px] text-slate-400 font-medium">Smart QR pass scan at main gate</p>
        </div>

        {/* Overall Attendance Rate */}
        <div className="glass-panel p-6 rounded-3xl border border-white shadow-sm glass-card-hover space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
              Session Attendance
            </span>
            <span className="text-emerald-600 font-black text-sm">{attendanceRate}%</span>
          </div>
          {/* Visual Progress Bar ████████████░░ 92% */}
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-1000"
              style={{ width: `${Math.min(100, Math.max(0, attendanceRate))}%` }}
            ></div>
          </div>
          <p className="text-[11px] text-slate-500 font-semibold">
            {attendanceStats?.presentCount || 0} Present • {attendanceStats?.absentCount || 0} Absent • {attendanceStats?.totalDays || 0} Total Days
          </p>
        </div>

        {/* Active Homework */}
        <div className="glass-panel p-6 rounded-3xl border border-white shadow-sm glass-card-hover space-y-2">
          <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
            Active Homework
          </span>
          <h3 className="text-3xl font-black text-slate-900 tracking-tight">{homeworks.length}</h3>
          <p className="text-xs text-orange-600 font-bold">Curriculum Tasks Pending</p>
        </div>

        {/* Fee Status */}
        <div className="glass-panel p-6 rounded-3xl border border-white shadow-sm glass-card-hover space-y-2">
          <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
            Fee Clearance
          </span>
          <h3 className="text-3xl font-black text-slate-900 tracking-tight font-mono">
            {pendingFeeAmount === 0 ? 'Rs. 0' : `Rs. ${pendingFeeAmount.toLocaleString()}`}
          </h3>
          <p className={`text-xs font-bold ${pendingFeeAmount === 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
            {pendingFeeAmount === 0 ? '✓ 100% Cleared (Session 2026)' : 'Pending Monthly Voucher'}
          </p>
        </div>
      </div>

      {/* 2-Column Section: Today's Timetable & Active Homework */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Timetable */}
        <div className="glass-panel rounded-3xl border border-white p-6 sm:p-7 space-y-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-black text-base text-slate-900">Today&apos;s Class Schedule</h3>
              <p className="text-xs text-slate-500 font-medium">Daily periods and subject teacher allocations</p>
            </div>
            <span className="text-xs font-black text-orange-600 bg-orange-50 px-2.5 py-1 rounded-xl border border-orange-200">
              {student.class?.name || 'Class 8-A'}
            </span>
          </div>

          <div className="space-y-3">
            {todayPeriods.map((period, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs hover:bg-orange-50/40 transition-colors">
                <div className="space-y-1">
                  <span className="font-bold text-slate-900 block text-xs">{period.subject}</span>
                  <span className="text-[11px] text-slate-500 font-medium">Faculty: {period.teacher}</span>
                </div>
                <div className="text-right space-y-1">
                  <span className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-slate-700 font-mono text-[10px] font-bold block">
                    {period.time}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">{period.room}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Homework Assignments */}
        <div className="glass-panel rounded-3xl border border-white p-6 sm:p-7 space-y-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-black text-base text-slate-900">Homework & Curriculum Tasks</h3>
              <p className="text-xs text-slate-500 font-medium">Published assignments by your subject teachers</p>
            </div>
          </div>

          {homeworks.length === 0 ? (
            <div className="p-8 text-center text-slate-400 space-y-2">
              <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-slate-700">No pending homework assignments</p>
              <p className="text-[11px] text-slate-400">All curriculum tasks are up to date.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {homeworks.slice(0, 4).map((hw) => (
                <div key={hw.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 hover:bg-orange-50/40 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-md bg-orange-100/80 text-orange-900 text-[10px] font-bold">
                      {hw.subjectName}
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

      {/* Published Exam Results Section */}
      {results.length > 0 && (
        <div className="glass-panel rounded-3xl border border-white p-6 sm:p-7 space-y-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-black text-base text-slate-900">Official Examination Marksheet</h3>
              <p className="text-xs text-slate-500 font-medium">Published results verified by Principal Office</p>
            </div>
          </div>

          <div className="space-y-4">
            {results.map((report) => (
              <div key={report.examId} className="space-y-3">
                <div className="flex items-center justify-between bg-orange-50 p-4 rounded-2xl border border-orange-200">
                  <div>
                    <h4 className="font-black text-sm text-orange-950">{report.examName}</h4>
                    <span className="text-[11px] text-orange-800 font-medium">Term: {report.term}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black text-orange-950 block">{report.percentage}%</span>
                    <span className="text-[10px] font-bold text-orange-800">GPA: {report.gpaAverage}</span>
                  </div>
                </div>

                <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden text-xs">
                  <div className="grid grid-cols-12 bg-slate-50 p-3 font-black text-[10px] uppercase text-slate-600">
                    <span className="col-span-4">Subject</span>
                    <span className="col-span-3 text-center">Marks Obtained</span>
                    <span className="col-span-2 text-center">Percentage</span>
                    <span className="col-span-3 text-right">Grade</span>
                  </div>
                  {report.subjects.map((sub: any, idx: number) => (
                    <div key={idx} className="grid grid-cols-12 p-3 items-center hover:bg-slate-50/50">
                      <span className="col-span-4 font-bold text-slate-900">{sub.subjectName}</span>
                      <span className="col-span-3 text-center font-mono font-bold text-slate-800">
                        {sub.marksObtained} / {sub.totalMarks}
                      </span>
                      <span className="col-span-2 text-center font-mono font-semibold text-slate-600">
                        {sub.percentage}%
                      </span>
                      <span className="col-span-3 text-right font-black text-emerald-700">
                        {sub.grade} ({sub.gpa} GPA)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
