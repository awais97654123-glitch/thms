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
  ChevronRight,
  Plus,
  FileText,
  Zap,
  TrendingUp,
  Bell
} from 'lucide-react';
import PortalCircularLoader from '@/components/common/PortalCircularLoader';
import NotificationBell from '@/components/common/NotificationBell';

export default function TeacherDashboardPage() {
  const [teacher, setTeacher] = useState<any | null>(null);
  const [assignedClasses, setAssignedClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/teacher/classes')
      .then((res) => res.json())
      .then((data) => {
        if (data.teacher) setTeacher(data.teacher);
        if (data.assignedClasses) setAssignedClasses(data.assignedClasses);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Total student count across assigned classes
  const totalClassesCount = assignedClasses.length;
  let totalSectionsCount = 0;
  let totalSubjectsCount = 0;
  assignedClasses.forEach((cls) => {
    totalSectionsCount += cls.sections.length;
    cls.sections.forEach((sec: any) => {
      totalSubjectsCount += sec.subjects.length;
    });
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300 bg-[#ffffff] text-slate-900 pb-16">
      
      {/* Top Royal Blue Teacher Workspace Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-[#0a192f] text-white p-8 sm:p-10 shadow-2xl border border-blue-900/40">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute left-1/3 bottom-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-600/25 text-blue-300 text-xs font-bold border border-blue-500/40 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
              <span>Teacher Academic Command • Session 2026-2027</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white font-serif">
              Welcome, {teacher?.fullName || 'Faculty Specialist'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
              {teacher?.designation || 'Senior Educator'} • Employee ID: <span className="font-mono text-blue-400 font-bold">{teacher?.employeeId || 'EMP-T-0101'}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 relative z-10">
            {/* Notification Bell */}
            <NotificationBell />

            <Link
              href="/teacher/attendance"
              className="px-5 py-3.5 rounded-2xl btn-blue-prestige text-white text-xs font-bold shadow-lg flex items-center gap-2.5 transition-all hover:scale-105"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Take Today&apos;s Attendance</span>
            </Link>
            <Link
              href="/teacher/homework"
              className="px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 backdrop-blur-xl flex items-center gap-2.5 transition-all hover:scale-105"
            >
              <FileText className="w-4 h-4 text-blue-400" />
              <span>Post Homework</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Fast Action Quick Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-2">
          Faculty Quick Actions:
        </span>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/teacher/attendance"
            className="px-3.5 py-2 btn-blue-prestige text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md transition-all"
          >
            <CalendarCheck className="w-3.5 h-3.5" />
            <span>Mark Attendance</span>
          </Link>
          <Link
            href="/teacher/homework"
            className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 font-bold text-xs rounded-xl flex items-center gap-2 transition-all"
          >
            <Plus className="w-3.5 h-3.5 text-blue-600" />
            <span>New Homework</span>
          </Link>
          <Link
            href="/teacher/marks"
            className="px-3.5 py-2 bg-slate-50 hover:bg-blue-50 text-slate-800 border border-slate-200 font-bold text-xs rounded-xl flex items-center gap-2 transition-all"
          >
            <Award className="w-3.5 h-3.5 text-blue-600" />
            <span>Enter Exam Marks</span>
          </Link>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-2 border-t-4 border-t-blue-600">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Assigned Classes
          </span>
          <h3 className="text-3xl font-black text-slate-900 tracking-tight">
            {totalClassesCount} {totalClassesCount === 1 ? 'Class' : 'Classes'}
          </h3>
          <p className="text-xs text-blue-600 font-bold">
            {totalSectionsCount} Sections • {totalSubjectsCount} Subjects
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-2 border-t-4 border-t-emerald-600">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Attendance Rate
          </span>
          <h3 className="text-3xl font-black text-emerald-600 tracking-tight">96.4%</h3>
          <p className="text-xs text-slate-500 font-medium">Daily QR & Classroom Check-ins</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-2 border-t-4 border-t-indigo-600">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Active Assessments
          </span>
          <h3 className="text-3xl font-black text-slate-900 tracking-tight">Term 1</h3>
          <p className="text-xs text-blue-600 font-bold">Mid-Term Marks Open</p>
        </div>
      </div>

      {/* Dynamic Assigned Classes Cards (Teacher Sees ONLY Their Assignments) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-slate-900 font-serif">Your Assigned Teaching Roster</h3>
            <p className="text-xs text-slate-500 font-medium">
              Only classes and sections assigned to you by the Principal Office
            </p>
          </div>
        </div>

        {loading ? (
          <div className="bg-white p-10 rounded-3xl border border-slate-200 text-center">
            <PortalCircularLoader message="Loading assigned classes & workload..." />
          </div>
        ) : assignedClasses.length === 0 ? (
          <div className="bg-white p-10 rounded-3xl border border-slate-200 text-center space-y-2">
            <Users className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-xs font-bold text-slate-700">No classes currently assigned</p>
            <p className="text-[11px] text-slate-400">Contact school administration to set up your teaching assignments.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {assignedClasses.map((cls) => (
              <div key={cls.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 hover:border-blue-300 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-black text-base text-slate-900 font-serif">{cls.name}</h4>
                    <span className="text-[11px] text-slate-500 font-medium">Code: {cls.code}</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
                    {cls.sections.length} {cls.sections.length === 1 ? 'Section' : 'Sections'}
                  </span>
                </div>

                <div className="space-y-2">
                  {cls.sections.map((sec: any) => (
                    <div key={sec.id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                        <span>{sec.name}</span>
                        <span className="text-[10px] text-slate-500 font-normal">Active Roster</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {sec.subjects.map((sub: any) => (
                          <span key={sub.id} className="px-2 py-0.5 rounded-lg bg-blue-100/70 text-blue-900 text-[10px] font-bold">
                            📖 {sub.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                  <Link
                    href={`/teacher/attendance?classId=${cls.id}`}
                    className="flex-1 py-2 bg-[#0a192f] hover:bg-blue-900 text-white font-bold text-xs rounded-xl text-center transition-all"
                  >
                    Attendance
                  </Link>
                  <Link
                    href={`/teacher/homework?classId=${cls.id}`}
                    className="flex-1 py-2 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 font-bold text-xs rounded-xl text-center transition-all"
                  >
                    Homework
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
