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
  QrCode, 
  FileText,
  UserCheck,
  Building2,
  Calendar,
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
          
          // Fetch student invoices
          fetch(`/api/fees/invoices?studentId=${st.id}`)
            .then((res) => res.json())
            .then((fData) => {
              if (fData.invoices) setFeeInvoices(fData.invoices);
            })
            .catch(console.error);

          // Fetch student attendance
          fetch(`/api/attendance?studentId=${st.id}`)
            .then((res) => res.json())
            .then((attData) => {
              if (attData.records) setAttendanceRecords(attData.records);
            })
            .catch(console.error);

          // Fetch class homework
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
    { time: '08:30 - 09:15 AM', subject: 'Mathematics', teacher: 'Engr. Farooq Ahmad', room: 'Room 201' },
    { time: '09:20 - 10:05 AM', subject: 'English Literature', teacher: 'Ms. Saima Khattak', room: 'Room 201' },
    { time: '10:25 - 11:10 AM', subject: 'General Science', teacher: 'Dr. Zobia Khan', room: 'Science Lab' },
    { time: '11:15 - 12:00 PM', subject: 'Islamic Studies & Nazra', teacher: 'Qari Abdul Rehman', room: 'Room 201' },
  ];

  const pendingFeeAmount = feeInvoices
    .filter((inv: any) => inv.status !== 'PAID')
    .reduce((acc: number, inv: any) => acc + (inv.remainingAmount || inv.totalAmount || 0), 0);

  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-slate-500 space-y-3">
        <span className="animate-spin inline-block text-2xl">⏳</span>
        <p>Loading your Student Portal Dashboard...</p>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="p-8 text-center text-xs text-red-600 bg-red-50 border border-red-200 rounded-3xl max-w-lg mx-auto">
        <AlertCircle className="w-8 h-8 mx-auto text-red-500 mb-2" />
        <h3 className="font-bold text-sm">Student Profile Not Linked</h3>
        <p className="mt-1">This user account is not linked to an active student record. Please contact the school administration office.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-wrap items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex items-center gap-5 relative z-10">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white text-blue-900 font-extrabold text-2xl flex items-center justify-center shadow-lg border-2 border-white/20 overflow-hidden">
            {student.photoUrl ? (
              <img src={student.photoUrl} alt={student.fullName} className="w-full h-full object-cover" />
            ) : (
              <span>{student.firstName?.charAt(0) || 'S'}</span>
            )}
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-400/30 mb-2">
              <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
              <span>Official Student Portal</span>
            </div>
            <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight text-white">
              Assalam-o-Alaikum, {student.fullName}!
            </h1>
            <p className="text-xs sm:text-sm text-blue-200 mt-1">
              Class {student.class?.name || 'Class 8'} ({student.section?.name || 'Section A'}) • Roll #{student.rollNo} • ID: {student.studentId}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <Link
            href="/student/id-card"
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg flex items-center gap-1.5 transition-all"
          >
            <CreditCard className="w-4 h-4" />
            <span>Digital ID Card</span>
          </Link>
          <Link
            href="/student/fees"
            className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 flex items-center gap-1.5 transition-all"
          >
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>Fee Vouchers</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Attendance</span>
            <CalendarCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{attendanceRate}%</p>
          <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full inline-block">
            {parseFloat(attendanceRate) >= 90 ? 'Regular' : 'Satisfactory'}
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Fee Balance</span>
            <DollarSign className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 font-mono">
            Rs. {pendingFeeAmount.toLocaleString()}
          </p>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block ${
            pendingFeeAmount === 0 ? 'text-emerald-700 bg-emerald-50' : 'text-amber-700 bg-amber-50'
          }`}>
            {pendingFeeAmount === 0 ? 'All Clear' : 'Current Dues'}
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Academic Standing</span>
            <Award className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-extrabold text-purple-900">Enrolled</p>
          <span className="text-[10px] text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded-full inline-block">
            Official Student Record
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Active Term</span>
            <Building2 className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-xl font-extrabold text-slate-900">Session 2026</p>
          <span className="text-[10px] text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded-full inline-block">
            BISE Peshawar
          </span>
        </div>
      </div>

      {/* Grid: Timetable & ID Card Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 cols: Today Schedule & Homework */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-sm text-slate-900">Today&apos;s Class Schedule</h3>
              </div>
              <span className="text-[11px] font-semibold text-slate-500">
                {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' })}
              </span>
            </div>

            <div className="space-y-2.5">
              {todayPeriods.map((p, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs hover:bg-blue-50/50 transition-colors">
                  <div className="space-y-0.5">
                    <strong className="text-slate-900 block text-xs">{p.subject}</strong>
                    <span className="text-slate-500 text-[11px]">{p.teacher} • {p.room}</span>
                  </div>
                  <span className="font-mono font-bold text-blue-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200 text-[11px]">
                    {p.time}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-purple-600" />
                <h3 className="font-bold text-sm text-slate-900">Active Homework & Assignments</h3>
              </div>
              <span className="text-xs text-purple-600 font-bold bg-purple-50 px-2 py-0.5 rounded-full">
                {homeworks.length} Assigned
              </span>
            </div>

            {homeworks.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No active homework tasks assigned.
              </div>
            ) : (
              <div className="space-y-2.5 text-xs">
                {homeworks.map((hw) => (
                  <div key={hw.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                    <div className="flex items-center justify-between">
                      <strong className="text-slate-900">
                        {hw.subject?.name || 'Subject'}: {hw.title}
                      </strong>
                      <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded">
                        Due {new Date(hw.dueDate).toLocaleDateString('en-GB')}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600">{hw.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 5 cols: Official ID Card Preview */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-blue-600" />
              <span>My Official ID Card</span>
            </h3>
            <Link href="/student/id-card" className="text-xs font-bold text-blue-600 hover:underline">
              Full View & Print ➔
            </Link>
          </div>

          <PrintableIDCard student={student} />
        </div>
      </div>
    </div>
  );
}
