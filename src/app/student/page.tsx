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
  AlertCircle
} from 'lucide-react';
import PrintableIDCard from '@/components/common/PrintableIDCard';

export default function StudentDashboardPage() {
  const [student, setStudent] = useState<any | null>(null);
  const [school, setSchool] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [homeworks, setHomeworks] = useState<any[]>([]);
  const [feeInvoices, setFeeInvoices] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user?.student) {
          const st = data.user.student;
          setStudent(st);
          setSchool(data.school);
          
          fetch(`/api/fees/invoices?studentId=${st.id}`)
            .then((res) => res.json())
            .then((fData) => {
              if (fData.invoices) setFeeInvoices(fData.invoices);
            })
            .catch(console.error);

          fetch(`/api/attendance?studentId=${st.id}`)
            .then((res) => res.json())
            .then((attData) => {
              if (attData.records) setAttendanceRecords(attData.records);
            })
            .catch(console.error);

          if (st.classId) {
            fetch(`/api/homework?classId=${st.classId}`)
              .then((res) => res.json())
              .then((hData) => {
                if (hData.homeworks) setHomeworks(hData.homeworks);
              })
              .catch(console.error);
          }
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalAttDays = attendanceRecords.length;
  const presentDays = attendanceRecords.filter((a) => a.status === 'PRESENT' || a.status === 'LATE').length;
  const attendanceRate = totalAttDays > 0 ? ((presentDays / totalAttDays) * 100).toFixed(1) : '100.0';

  const todayPeriods = [
    { time: '08:30 - 09:15 AM', subject: 'Mathematics (Algebra & Geometry)', teacher: 'Engr. Farooq Ahmad', room: 'Room 201' },
    { time: '09:20 - 10:05 AM', subject: 'English Grammar & Literature', teacher: 'Ms. Saima Khattak', room: 'Room 201' },
    { time: '10:25 - 11:10 AM', subject: 'General Science (Physics / Bio)', teacher: 'Dr. Zobia Khan', room: 'Science Lab' },
    { time: '11:15 - 12:00 PM', subject: 'Islamic Studies & Nazra Quran', teacher: 'Qari Abdul Rehman', room: 'Room 201' },
  ];

  const pendingFeeAmount = feeInvoices
    .filter((inv: any) => inv.status !== 'PAID')
    .reduce((acc: number, inv: any) => acc + (inv.remainingAmount || inv.totalAmount || 0), 0);

  if (loading) {
    return (
      <div className="p-16 text-center space-y-4">
        <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs font-bold text-slate-500">Loading Student Academic Hub...</p>
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

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Student Welcome Hero Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white p-8 sm:p-10 shadow-2xl border border-slate-800/80">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-white text-blue-900 font-black text-2xl flex items-center justify-center shadow-xl border-2 border-white/30 overflow-hidden flex-shrink-0">
              {student.photoUrl ? (
                <img src={student.photoUrl} alt={student.fullName} className="w-full h-full object-cover" />
              ) : (
                <span>{student.firstName?.charAt(0) || 'S'}</span>
              )}
            </div>
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3.5 py-0.5 rounded-full bg-blue-500/20 text-cyan-300 text-[11px] font-black border border-cyan-400/30 backdrop-blur-md">
                <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />
                <span>Official Student Portal</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Assalam-o-Alaikum, {student.fullName}!
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 font-medium">
                Class <span className="text-cyan-300 font-bold">{student.class?.name || 'Class 8'} ({student.section?.name || 'Section A'})</span> • Roll #{student.rollNo} • ID: <span className="font-mono text-cyan-300 font-bold">{student.studentId}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 relative z-10">
            <Link
              href="/student/id-card"
              className="px-5 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white font-black text-xs shadow-lg shadow-indigo-500/25 flex items-center gap-2 transition-all hover:scale-105"
            >
              <CreditCard className="w-4 h-4" />
              <span>Digital ID Card</span>
            </Link>
            <Link
              href="/student/fees"
              className="px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-black text-xs border border-white/20 backdrop-blur-xl flex items-center gap-2 transition-all hover:scale-105"
            >
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>Fee Vouchers</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Glass Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
        <div className="glass-panel p-6 rounded-3xl border border-white shadow-sm glass-card-hover space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-black uppercase tracking-wider">
            <span>Attendance</span>
            <CalendarCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-3xl font-black text-slate-900">{attendanceRate}%</p>
          <span className="text-[10px] text-emerald-700 font-extrabold bg-emerald-50 px-2.5 py-0.5 rounded-full inline-block border border-emerald-200">
            {parseFloat(attendanceRate) >= 90 ? 'Regular Attendance' : 'Satisfactory'}
          </span>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-white shadow-sm glass-card-hover space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-black uppercase tracking-wider">
            <span>Fee Balance</span>
            <DollarSign className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-3xl font-black text-slate-900 font-mono">
            Rs. {pendingFeeAmount.toLocaleString()}
          </p>
          <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full inline-block border ${
            pendingFeeAmount === 0 
              ? 'text-emerald-700 bg-emerald-50 border-emerald-200' 
              : 'text-amber-700 bg-amber-50 border-amber-200'
          }`}>
            {pendingFeeAmount === 0 ? 'All Cleared' : 'Current Dues'}
          </span>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-white shadow-sm glass-card-hover space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-black uppercase tracking-wider">
            <span>Academic Status</span>
            <Award className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-3xl font-black text-indigo-900">Enrolled</p>
          <span className="text-[10px] text-indigo-700 font-extrabold bg-indigo-50 px-2.5 py-0.5 rounded-full inline-block border border-indigo-200">
            Active Scholar
          </span>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-white shadow-sm glass-card-hover space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-black uppercase tracking-wider">
            <span>Session</span>
            <Building2 className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">2026-27</p>
          <span className="text-[10px] text-blue-700 font-extrabold bg-blue-50 px-2.5 py-0.5 rounded-full inline-block border border-blue-200">
            BISE Peshawar
          </span>
        </div>
      </div>

      {/* Grid: Timetable & ID Card Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Schedule & Homework */}
        <div className="lg:col-span-7 space-y-6">
          {/* Today's Schedule */}
          <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-white shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900">Today&apos;s Class Schedule</h3>
                  <p className="text-xs text-slate-500 font-medium">Daily lecture sequence and room locations</p>
                </div>
              </div>
              <span className="text-[11px] font-bold text-slate-500 font-mono">
                {new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
              </span>
            </div>

            <div className="space-y-3">
              {todayPeriods.map((p, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-white/70 border border-slate-200/80 flex items-center justify-between text-xs glass-card-hover">
                  <div className="space-y-1">
                    <strong className="text-slate-900 block text-xs font-black">{p.subject}</strong>
                    <span className="text-slate-500 text-[11px] font-medium">{p.teacher} • {p.room}</span>
                  </div>
                  <span className="font-mono font-black text-blue-700 bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-xs shadow-sm">
                    {p.time}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Homework Card */}
          <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-white shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900">Active Homework Tasks</h3>
                  <p className="text-xs text-slate-500 font-medium">Assignments distributed by subject teachers</p>
                </div>
              </div>
              <span className="text-xs text-indigo-700 font-black bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
                {homeworks.length} Assigned
              </span>
            </div>

            {homeworks.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 font-medium">
                No pending homework assignments. All tasks submitted!
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                {homeworks.map((hw) => (
                  <div key={hw.id} className="p-4 rounded-2xl bg-white/70 border border-slate-200/80 space-y-1.5 glass-card-hover">
                    <div className="flex items-center justify-between">
                      <strong className="text-slate-900 font-bold">
                        {hw.subject?.name || 'Subject'}: {hw.title}
                      </strong>
                      <span className="text-[10px] text-amber-700 font-black bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200">
                        Due {new Date(hw.dueDate).toLocaleDateString('en-GB')}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed font-medium">{hw.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Digital ID Card Preview */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-blue-600" />
              <span>Smart Digital Student ID</span>
            </h3>
            <Link href="/student/id-card" className="text-xs font-black text-blue-600 hover:underline">
              Full View & Print ➔
            </Link>
          </div>

          <PrintableIDCard student={student} />
        </div>
      </div>
    </div>
  );
}
