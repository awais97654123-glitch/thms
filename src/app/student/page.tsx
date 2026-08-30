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
  FileText
} from 'lucide-react';
import PrintableIDCard from '@/components/common/PrintableIDCard';

export default function StudentDashboardPage() {
  const [student, setStudent] = useState<any | null>(null);

  useEffect(() => {
    fetch('/api/students/THMS-2026-000001')
      .then((res) => res.json())
      .then((data) => {
        if (data.student) setStudent(data.student);
      })
      .catch(console.error);
  }, []);

  const todayPeriods = [
    { time: '08:30 - 09:15 AM', subject: 'Mathematics', teacher: 'Engr. Farooq Ahmad', room: 'Room 201' },
    { time: '09:20 - 10:05 AM', subject: 'English Literature', teacher: 'Ms. Ayesha Siddiqui', room: 'Room 201' },
    { time: '10:25 - 11:10 AM', subject: 'General Science', teacher: 'Mr. Bilal Khan', room: 'Room 201' },
  ];

  const [lastSyncTime, setLastSyncTime] = useState<string>(new Date().toLocaleTimeString('en-GB'));
  const [syncAlert, setSyncAlert] = useState(false);

  useEffect(() => {
    const handleSync = () => {
      setLastSyncTime(new Date().toLocaleTimeString('en-GB'));
      setSyncAlert(true);
      setTimeout(() => setSyncAlert(false), 4000);
      // Re-fetch student data
      fetch('/api/students/THMS-2026-000001')
        .then((res) => res.json())
        .then((data) => {
          if (data.student) setStudent(data.student);
        })
        .catch(console.error);
    };

    window.addEventListener('thms_sync_completed', handleSync);
    return () => window.removeEventListener('thms_sync_completed', handleSync);
  }, []);

  return (
    <div className="space-y-6">
      {/* Real-time Sync Banner */}
      {syncAlert && (
        <div className="p-3 bg-blue-50 border border-blue-300 rounded-2xl text-blue-900 text-xs font-bold flex items-center gap-2 shadow-sm animate-in fade-in">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>New student data & portal updates received from Admin sync! (Refreshed at {lastSyncTime})</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-400/30">
              Student Portal
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 text-[10px] font-semibold border border-emerald-400/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Synced
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
            Welcome back, Hamza!
          </h1>
          <p className="text-xs text-blue-200">
            Class 8 - Section A • Roll No: 08-A-001 • Academic Session 2026
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/student/results"
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow flex items-center gap-1.5 transition-all"
          >
            <Award className="w-4 h-4" />
            <span>Download Report Card</span>
          </Link>
          <Link
            href="/student/id-card"
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow flex items-center gap-1.5 transition-all"
          >
            <CreditCard className="w-4 h-4" />
            <span>View Digital ID Card</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">My Attendance</span>
          <h3 className="text-2xl font-extrabold text-emerald-700 mt-1">96.4%</h3>
          <p className="text-[11px] text-slate-500 mt-1">5 Days Present • 0 Absences</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Mid-Term GPA / Grade</span>
          <h3 className="text-2xl font-extrabold text-blue-900 mt-1">4.0 (A+)</h3>
          <p className="text-[11px] text-emerald-600 font-bold mt-1">1st Class Standing</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Fee Status</span>
          <h3 className="text-2xl font-extrabold text-emerald-700 mt-1">Rs. 0 Due</h3>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">March 2026 Paid in Full</p>
        </div>
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Today's Timetable */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <h3 className="font-bold text-sm text-slate-900">Today's Class Timetable</h3>
            </div>
            <span className="text-xs text-slate-500">Room 201</span>
          </div>

          <div className="space-y-3">
            {todayPeriods.map((p, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <span className="font-mono font-bold text-blue-900 text-[11px]">{p.time}</span>
                  <strong className="block text-slate-900 text-sm">{p.subject}</strong>
                  <p className="text-[11px] text-slate-500">{p.teacher}</p>
                </div>
                <span className="px-2.5 py-1 rounded bg-blue-50 text-blue-900 font-bold text-[10px]">
                  {p.room}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Homework & Notifications */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="font-bold text-sm text-slate-900">Pending Homework</h3>
            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
              1 Due
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
            <div className="flex justify-between">
              <strong className="text-slate-900 font-bold">Mathematics Ex 4.2</strong>
              <span className="text-red-600 font-semibold text-[10px]">Due in 3 days</span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Solve algebraic factorization problems 1 to 15. Show complete steps for quadratic expressions.
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/student/results"
              className="w-full py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>View Terminal Results & Report Card</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
