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
  Plus,
  Sparkles,
  UserCheck
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

  const [lastSyncTime, setLastSyncTime] = useState<string>(new Date().toLocaleTimeString('en-GB'));
  const [syncAlert, setSyncAlert] = useState(false);

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
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-900 text-xs font-bold flex items-center gap-2 shadow-sm animate-in fade-in">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>New data synchronized automatically from Central Admin! (Refreshed at {lastSyncTime})</span>
        </div>
      )}

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30">
              Senior Faculty Dashboard
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 text-[10px] font-semibold border border-emerald-400/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Synced
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
            Welcome, {teacher?.fullName || 'Teacher Portal'}
          </h1>
          <p className="text-xs text-emerald-200">
            {teacher?.designation || 'Faculty Member'} • Employee ID: {teacher?.employeeId || 'EMP-T-0101'}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/teacher/attendance"
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow flex items-center gap-1.5 transition-all"
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Mark Today's Attendance</span>
          </Link>
          <Link
            href="/teacher/marks"
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 flex items-center gap-1.5 transition-all"
          >
            <Award className="w-4 h-4" />
            <span>Enter Exam Marks</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Assigned Classes</span>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-1">2 Classes (3 Sections)</h3>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">Class Teacher for 8-A</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Total Students</span>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-1">67 Students</h3>
          <p className="text-[11px] text-slate-500 mt-1">Under Academic Mentorship</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Today's Lectures</span>
          <h3 className="text-2xl font-extrabold text-emerald-700 mt-1">3 Periods</h3>
          <p className="text-[11px] text-slate-500 mt-1">1 Delivered • 2 Remaining</p>
        </div>
      </div>

      {/* Two Column: Today's Schedule & My Assigned Classes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Today's Lecture Schedule */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-sm text-slate-900">Today's Class Timetable</h3>
            </div>
            <span className="text-xs text-slate-500">Live Period Tracker</span>
          </div>

          <div className="space-y-3">
            {todaySchedule.map((sch, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900">{sch.time}</span>
                    <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-900 font-bold text-[10px]">
                      {sch.class}
                    </span>
                  </div>
                  <p className="text-slate-700 font-medium">{sch.subject}</p>
                  <p className="text-[10px] text-slate-400">{sch.room}</p>
                </div>
                <div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${sch.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                    {sch.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Assigned Classes Quick Actions */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="font-bold text-sm text-slate-900">My Assigned Classes</h3>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
              Active Session 2026
            </span>
          </div>

          <div className="space-y-3 text-xs">
            {assignedClasses.map((ac, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-2">
                <div className="flex justify-between items-center">
                  <strong className="text-slate-900 text-sm">{ac.className} ({ac.sectionName})</strong>
                  <span className="text-slate-500 font-medium">{ac.studentCount} Students</span>
                </div>
                <p className="text-slate-600">Subject: <strong>{ac.subject}</strong> • {ac.room}</p>
                <div className="flex gap-2 pt-2 border-t border-slate-200">
                  <Link
                    href="/teacher/attendance"
                    className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] text-center"
                  >
                    Mark Attendance
                  </Link>
                  <Link
                    href="/teacher/marks"
                    className="flex-1 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-bold text-[11px] text-center"
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
