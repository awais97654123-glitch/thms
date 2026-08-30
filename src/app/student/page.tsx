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
  ChevronRight
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
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-orange-950/70 text-white p-6 sm:p-8 lg:p-10 shadow-2xl border border-orange-500/20">
        <div className="absolute right-0 top-0 w-96 h-96 bg-orange-500/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white p-1 border-2 border-orange-400/40 shadow-xl overflow-hidden shrink-0">
              <img
                src={student.photoUrl || '/student-avatar.png'}
                alt={student.fullName}
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
            <div className="space-y-1 sm:space-y-1.5">
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

          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
            <Link
              href="/student/homework"
              className="flex-1 sm:flex-none px-4 py-3 rounded-2xl bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white text-xs font-black shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-all hover:scale-105"
            >
              <BookOpen className="w-4 h-4" />
              <span>Daily Homework</span>
            </Link>
            <Link
              href="/student/id-card"
              className="flex-1 sm:flex-none px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-black border border-white/20 backdrop-blur-xl flex items-center justify-center gap-2 transition-all hover:scale-105"
            >
              <CreditCard className="w-4 h-4 text-orange-400" />
              <span>Digital ID Card</span>
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

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Today's Status */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
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
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
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
          {/* Visual Progress Bar */}
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                attendanceRate >= 80 ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gradient-to-r from-amber-500 to-rose-500'
              }`}
              style={{ width: `${attendanceRate}%` }}
            ></div>
          </div>
        </div>

        {/* Pending Homework Tasks */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
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
            <span className="text-xs text-slate-500 font-bold">Active Tasks</span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">Assigned by subject teachers</p>
        </div>

        {/* Fee Status */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
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
            {pendingFeeAmount === 0 ? '✓ All fees cleared for term' : 'Pending bank deposit voucher'}
          </p>
        </div>
      </div>

      {/* Main 2-Column Student Workload Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Today's Timetable */}
        <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 space-y-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-black text-base text-slate-900">Today&apos;s Class Schedule</h3>
              <p className="text-xs text-slate-500 font-medium">Assigned subject periods and teachers</p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-black bg-orange-50 text-orange-700 border border-orange-200">
              Regular Hours
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

        {/* Right Column: Active Homework Assignments */}
        <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 space-y-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-black text-base text-slate-900">Homework & Curriculum Tasks</h3>
              <p className="text-xs text-slate-500 font-medium">Published assignments by your subject teachers</p>
            </div>
            <Link
              href="/student/homework"
              className="text-xs font-black text-orange-600 hover:text-orange-700 flex items-center gap-1"
            >
              <span>View All ➔</span>
            </Link>
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

      {/* Published Examination Results Marksheet */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 space-y-5 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-black text-base text-slate-900">Official Exam Reports & Marksheets</h3>
            <p className="text-xs text-slate-500 font-medium">Verified terminal examination marks entered by subject faculty</p>
          </div>
          <Link
            href="/student/results"
            className="text-xs font-black text-orange-600 hover:text-orange-700 flex items-center gap-1"
          >
            <span>Full Report Card ➔</span>
          </Link>
        </div>

        {results.length === 0 ? (
          <div className="p-8 text-center text-slate-400 space-y-2">
            <Award className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-xs font-bold text-slate-700">No published exam marks available</p>
            <p className="text-[11px] text-slate-400">Terminal examination marks will be published after teacher evaluation.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-black border-b border-slate-100">
                <tr>
                  <th className="p-3.5">Subject</th>
                  <th className="p-3.5">Exam Term</th>
                  <th className="p-3.5 text-center">Marks Obtained</th>
                  <th className="p-3.5 text-center">Total</th>
                  <th className="p-3.5 text-center">Percentage</th>
                  <th className="p-3.5 text-center">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {results.slice(0, 5).map((r, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 font-medium">
                    <td className="p-3.5 font-bold text-slate-900">{r.subjectName}</td>
                    <td className="p-3.5 text-slate-600">{r.term}</td>
                    <td className="p-3.5 text-center font-bold font-mono text-slate-800">{r.obtainedMarks}</td>
                    <td className="p-3.5 text-center font-mono text-slate-500">{r.totalMarks}</td>
                    <td className="p-3.5 text-center font-mono font-bold text-orange-600">{r.percentage}%</td>
                    <td className="p-3.5 text-center">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-orange-50 text-orange-800 border border-orange-200">
                        {r.grade}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
