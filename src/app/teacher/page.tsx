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
  Bell,
  Ban,
  AlertTriangle,
  X,
  RefreshCw
} from 'lucide-react';
import PortalCircularLoader from '@/components/common/PortalCircularLoader';
import NotificationBell from '@/components/common/NotificationBell';

export default function TeacherDashboardPage() {
  const [teacher, setTeacher] = useState<any | null>(null);
  const [assignedClasses, setAssignedClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Live Period Engine State
  const [todaySchedule, setTodaySchedule] = useState<any[]>([]);
  const [currentPeriod, setCurrentPeriod] = useState<any | null>(null);
  const [isSchoolClosed, setIsSchoolClosed] = useState(false);
  const [closureInfo, setClosureInfo] = useState<any | null>(null);
  const [cancellingPeriod, setCancellingPeriod] = useState<any | null>(null);
  const [cancellationReason, setCancellationReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelMessage, setCancelMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchLiveSchedule = () => {
    fetch('/api/timetable/live')
      .then((res) => res.json())
      .then((data) => {
        if (data.schedule) setTodaySchedule(data.schedule);
        if (data.currentPeriod) setCurrentPeriod(data.currentPeriod);
        setIsSchoolClosed(!!data.isSchoolClosed);
        if (data.closureInfo) setClosureInfo(data.closureInfo);
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetch('/api/teacher/classes')
      .then((res) => res.json())
      .then((data) => {
        if (data.teacher) setTeacher(data.teacher);
        if (data.assignedClasses) setAssignedClasses(data.assignedClasses);
      })
      .catch(console.error)
      .finally(() => setLoading(false));

    fetchLiveSchedule();
    // Auto-refresh schedule every 45 seconds for real-time period updates
    const interval = setInterval(fetchLiveSchedule, 45000);
    return () => clearInterval(interval);
  }, []);

  const handleCancelPeriod = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancellingPeriod || !cancellationReason.trim()) return;

    setCancelLoading(true);
    setCancelMessage(null);

    try {
      const res = await fetch('/api/timetable/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timetableId: cancellingPeriod.timetableId || cancellingPeriod.id,
          date: new Date().toISOString(),
          reason: cancellationReason.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to cancel period');

      setCancelMessage({ type: 'success', text: 'Class cancelled. All students and parents have been notified in real time.' });
      fetchLiveSchedule();
      setTimeout(() => {
        setCancellingPeriod(null);
        setCancellationReason('');
        setCancelMessage(null);
      }, 2000);
    } catch (err: any) {
      setCancelMessage({ type: 'error', text: err.message });
    } finally {
      setCancelLoading(false);
    }
  };

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
      <div className="relative overflow-hidden rounded-3xl bg-[#0F2A5F] text-white p-8 sm:p-10 shadow-xl border border-[#173B7A]">
        <div className="absolute right-0 top-0 w-96 h-96 bg-[#2563EB]/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute left-1/3 bottom-0 w-80 h-80 bg-[#173B7A]/30 rounded-full blur-3xl pointer-events-none"></div>

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

      {/* EMERGENCY SCHOOL CLOSURE BANNER IF ACTIVE */}
      {isSchoolClosed && closureInfo && (
        <div className="p-6 rounded-3xl bg-rose-50 border-2 border-rose-500 text-rose-950 flex items-start gap-4 shadow-md animate-in fade-in">
          <AlertTriangle className="w-8 h-8 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white font-extrabold text-[10px] uppercase">
                {closureInfo.isEmergency ? 'Emergency Closure' : 'Campus Notice'}
              </span>
              <h3 className="font-black text-lg text-rose-950 font-serif">{closureInfo.title}</h3>
            </div>
            <p className="text-xs text-rose-800 font-medium leading-relaxed">
              {closureInfo.reason}. Academic sessions, periods, and examinations are suspended during this window.
            </p>
          </div>
        </div>
      )}

      {/* TODAY'S TEACHING SCHEDULE & LIVE PERIOD OPERATIONS */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <h3 className="text-xl font-black text-slate-900 font-serif">Today&apos;s Live Teaching Schedule</h3>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Synchronized with school timetable engine (Asia/Karachi) • Real-time status &amp; period cancellation
            </p>
          </div>

          <button
            onClick={fetchLiveSchedule}
            className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-xs font-bold border border-slate-200 flex items-center gap-2 self-start transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync Live Status</span>
          </button>
        </div>

        {todaySchedule.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <Clock className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="text-sm font-bold text-slate-700">No Teaching Periods Scheduled for Today</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              You do not have any instructional periods configured on today&apos;s timetable, or school is not in regular session.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {todaySchedule.map((period) => {
              const isCancelled = period.status === 'CANCELLED';
              const isActive = period.status === 'ACTIVE';
              const isSubstitute = period.status === 'SUBSTITUTE' || period.isSubstituteRole;

              return (
                <div
                  key={period.id}
                  className={`p-5 rounded-3xl border transition-all space-y-4 relative ${
                    isActive
                      ? 'bg-emerald-50/70 border-emerald-400 shadow-md ring-2 ring-emerald-500/20'
                      : isCancelled
                      ? 'bg-rose-50/50 border-rose-200'
                      : isSubstitute
                      ? 'bg-purple-50/50 border-purple-200'
                      : 'bg-slate-50/60 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Top Header: Time & Status Pill */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black text-slate-800">
                        ⏰ {period.startTime} - {period.endTime}
                      </span>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wide border uppercase ${
                        period.badgeClass || 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {period.label || period.status}
                    </span>
                  </div>

                  {/* Class, Section & Subject */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-900 font-extrabold text-[10px]">
                        {period.className} • {period.sectionName}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">📍 {period.roomNo || 'Classroom'}</span>
                    </div>
                    <h4 className="text-base font-black text-slate-900 font-serif leading-snug">
                      {period.subjectName}
                    </h4>
                  </div>

                  {/* Status Highlights */}
                  {isActive && period.minutesRemaining !== undefined && (
                    <div className="p-2.5 rounded-xl bg-emerald-100/70 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center justify-between">
                      <span>🟢 Class in progress</span>
                      <span className="font-mono font-black">{period.minutesRemaining} min remaining</span>
                    </div>
                  )}

                  {isCancelled && period.cancellationReason && (
                    <div className="p-3 rounded-xl bg-rose-100/80 border border-rose-300 text-rose-900 text-xs space-y-1">
                      <div className="flex items-center gap-1 font-bold">
                        <Ban className="w-3.5 h-3.5 text-rose-700 shrink-0" />
                        <span>Cancelled Period</span>
                      </div>
                      <p className="text-[11px] text-rose-800 italic">&ldquo;{period.cancellationReason}&rdquo;</p>
                    </div>
                  )}

                  {period.substituteTeacherAssigned && (
                    <div className="p-2.5 rounded-xl bg-purple-100/70 border border-purple-300 text-purple-900 text-xs font-medium">
                      Covered by Substitute: <strong className="font-bold">{period.substituteTeacherAssigned}</strong>
                    </div>
                  )}

                  {/* Actions Footer */}
                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between gap-2">
                    <Link
                      href={`/teacher/attendance?classId=${period.classId || ''}`}
                      className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200 transition-all flex items-center gap-1"
                    >
                      <CalendarCheck className="w-3.5 h-3.5 text-blue-600" />
                      <span>Roster</span>
                    </Link>

                    {/* CANCEL PERIOD BUTTON (Available for upcoming & active periods) */}
                    {!isCancelled && period.status !== 'COMPLETED' && !period.isSubstituteRole && (
                      <button
                        onClick={() => {
                          setCancellingPeriod(period);
                          setCancellationReason('');
                          setCancelMessage(null);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 flex items-center gap-1.5 transition-all"
                      >
                        <Ban className="w-3.5 h-3.5 text-rose-600" />
                        <span>Cancel Period</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CANCEL PERIOD MODAL DIALOG */}
      {cancellingPeriod && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                  <Ban className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 font-serif">Cancel Teaching Period</h3>
                  <p className="text-xs text-slate-500 font-medium">
                    This will immediately update Student &amp; Parent portals and send real-time notices.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setCancellingPeriod(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Target Period Details */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
              <div className="font-bold text-slate-900 text-sm">{cancellingPeriod.subjectName}</div>
              <div className="text-slate-600">
                {cancellingPeriod.className} ({cancellingPeriod.sectionName}) • Time: {cancellingPeriod.startTime} - {cancellingPeriod.endTime}
              </div>
              <div className="text-slate-500">Room: {cancellingPeriod.roomNo || 'Main Classroom'}</div>
            </div>

            <form onSubmit={handleCancelPeriod} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Reason for Cancellation <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  placeholder="e.g., Unscheduled emergency medical appointment / Faculty department conference"
                  className="w-full p-3.5 rounded-2xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                />
                <p className="text-[11px] text-slate-400">
                  This explanation will be permanently recorded in the school audit logs and displayed on parent dashboards.
                </p>
              </div>

              {cancelMessage && (
                <div
                  className={`p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2 ${
                    cancelMessage.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {cancelMessage.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                  )}
                  <span>{cancelMessage.text}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCancellingPeriod(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-all"
                >
                  Keep Period Active
                </button>
                <button
                  type="submit"
                  disabled={cancelLoading || !cancellationReason.trim()}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {cancelLoading ? (
                    <span>Broadcasting...</span>
                  ) : (
                    <>
                      <Ban className="w-3.5 h-3.5" />
                      <span>Confirm Cancellation</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
