'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  BookOpen, 
  CalendarCheck, 
  Award, 
  Clock, 
  Users, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  UserCheck,
  ChevronRight
} from 'lucide-react';

export default function TeacherDashboardPage() {
  const [teacher, setTeacher] = useState<any | null>(null);
  const [assignedClasses, setAssignedClasses] = useState<any[]>([
    { className: 'Class 8', sectionName: 'Section A', subject: 'Mathematics', studentCount: 35, room: 'Room 201' },
    { className: 'Class 9', sectionName: 'Section A', subject: 'Physics', studentCount: 32, room: 'Room 302' },
  ]);

  const [todaySchedule, setTodaySchedule] = useState<any[]>([
    { time: '08:30 - 09:15 AM', class: 'Class 8-A', subject: 'Mathematics (Algebraic Proofs)', room: 'Room 201', status: 'COMPLETED' },
    { time: '09:20 - 10:05 AM', class: 'Class 9-A', subject: 'Physics (Kinematics & Vectors)', room: 'Room 302', status: 'UPCOMING' },
    { time: '11:15 - 12:00 PM', class: 'Class 8-B', subject: 'Mathematics (Geometry & Circles)', room: 'Room 202', status: 'UPCOMING' },
  ]);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user?.teacher) {
          setTeacher(data.user.teacher);
          if (data.user.teacher.subjects && data.user.teacher.subjects.length > 0) {
            const mapped = data.user.teacher.subjects.map((sub: any) => ({
              className: sub.class?.name || 'Class 8',
              sectionName: 'Section A',
              subject: sub.name,
              studentCount: 35,
              room: 'Main Academic Wing',
            }));
            setAssignedClasses(mapped);
          }
        }
      })
      .catch(console.error);
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Futuristic Workspace Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-950 via-slate-900 to-blue-950 text-white p-8 sm:p-10 shadow-2xl border border-slate-800/80">
        <div className="absolute right-0 top-0 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-black border border-cyan-400/30 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>Academic Workspace • Session 2026-2027</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              Welcome, {teacher?.fullName || 'Faculty Specialist'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
              {teacher?.designation || 'Senior Faculty'} • Employee ID: <span className="font-mono text-cyan-300 font-bold">{teacher?.employeeId || 'THMS-T-101'}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 relative z-10">
            <Link
              href="/teacher/attendance"
              className="px-5 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-black shadow-lg shadow-cyan-500/25 flex items-center gap-2.5 transition-all hover:scale-105"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Mark Today's Attendance</span>
            </Link>
            <Link
              href="/teacher/marks"
              className="px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-black border border-white/20 backdrop-blur-xl flex items-center gap-2.5 transition-all hover:scale-105"
            >
              <Award className="w-4 h-4 text-amber-400" />
              <span>Exam Marks Entry</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Glass Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="glass-panel p-6 rounded-3xl border border-white shadow-sm glass-card-hover space-y-2">
          <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
            Assigned Classes
          </span>
          <h3 className="text-3xl font-black text-slate-900 tracking-tight">2 Classes</h3>
          <p className="text-xs text-cyan-700 font-bold">Class Incharge for 8-A</p>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-white shadow-sm glass-card-hover space-y-2">
          <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
            Total Students
          </span>
          <h3 className="text-3xl font-black text-slate-900 tracking-tight">67 Students</h3>
          <p className="text-xs text-slate-500 font-semibold">Under Academic Mentorship</p>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-white shadow-sm glass-card-hover space-y-2">
          <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
            Today's Lectures
          </span>
          <h3 className="text-3xl font-black bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent tracking-tight">
            3 Periods
          </h3>
          <p className="text-xs text-slate-500 font-semibold">1 Delivered • 2 Remaining</p>
        </div>
      </div>

      {/* Two Column Grid: Today's Schedule & My Assigned Classes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Today's Timetable */}
        <div className="lg:col-span-7 glass-panel p-6 sm:p-7 rounded-3xl border border-white shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-cyan-50 text-cyan-700 border border-cyan-200">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-black text-base text-slate-900">Today's Class Timetable</h3>
                <p className="text-xs text-slate-500 font-medium">Daily lecture sequence and room allocations</p>
              </div>
            </div>
            <span className="text-[11px] font-extrabold text-cyan-700 bg-cyan-50 px-3 py-1 rounded-full border border-cyan-200">
              Live Tracker
            </span>
          </div>

          <div className="space-y-3">
            {todaySchedule.map((sch, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-white/70 border border-slate-200/80 flex items-center justify-between text-xs glass-card-hover">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900">{sch.time}</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 font-extrabold text-[10px] border border-blue-200">
                      {sch.class}
                    </span>
                  </div>
                  <p className="text-slate-800 font-bold text-xs">{sch.subject}</p>
                  <p className="text-[11px] text-slate-400 font-medium">{sch.room}</p>
                </div>
                <div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black border ${
                    sch.status === 'COMPLETED' 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {sch.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Assigned Classes Quick Actions */}
        <div className="lg:col-span-5 glass-panel p-6 sm:p-7 rounded-3xl border border-white shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-black text-base text-slate-900">My Teaching Roster</h3>
              <p className="text-xs text-slate-500 font-medium">Subject allocations & class incharge</p>
            </div>
            <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Active
            </span>
          </div>

          <div className="space-y-3.5 text-xs">
            {assignedClasses.map((ac, idx) => (
              <div key={idx} className="p-4 rounded-2xl border border-slate-200/80 bg-white/70 space-y-3 glass-card-hover">
                <div className="flex justify-between items-center">
                  <strong className="text-slate-900 text-sm font-black">{ac.className} ({ac.sectionName})</strong>
                  <span className="text-slate-500 font-bold text-xs">{ac.studentCount} Students</span>
                </div>
                <p className="text-slate-600 font-medium">Subject: <strong className="text-slate-800">{ac.subject}</strong> • {ac.room}</p>
                <div className="flex gap-2 pt-2 border-t border-slate-100">
                  <Link
                    href="/teacher/attendance"
                    className="flex-1 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-xl font-bold text-xs text-center shadow-sm transition-all"
                  >
                    Mark Attendance
                  </Link>
                  <Link
                    href="/teacher/marks"
                    className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs text-center transition-all"
                  >
                    Enter Marks
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
