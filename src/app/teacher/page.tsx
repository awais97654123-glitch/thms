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
  RefreshCw,
  Search,
  Filter,
  User,
  SlidersHorizontal,
  ChevronDown,
  Phone,
  Camera
} from 'lucide-react';
import PortalCircularLoader from '@/components/common/PortalCircularLoader';
import NotificationBell from '@/components/common/NotificationBell';
import StudentDetailDrawer from '@/components/teacher/StudentDetailDrawer';
import CreateHomeworkModal from '@/components/teacher/CreateHomeworkModal';
import FastMarksEntryModal from '@/components/teacher/FastMarksEntryModal';
import CreateClassTestModal from '@/components/teacher/CreateClassTestModal';
import UploadStudyMaterialModal from '@/components/teacher/UploadStudyMaterialModal';
import QRScannerModal from '@/components/common/QRScanner';

export default function TeacherDashboardPage() {
  const [teacher, setTeacher] = useState<any | null>(null);
  const [assignedClasses, setAssignedClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected Class & Section State
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedSectionId, setSelectedSectionId] = useState<string>('');
  const [classDataLoading, setClassDataLoading] = useState(false);
  const [classStats, setClassStats] = useState<any | null>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'PRESENT' | 'ABSENT' | 'LATE' | 'PENDING' | 'HOMEWORK_PENDING'>('ALL');

  // Modals & Drawers
  const [selectedStudentForDrawer, setSelectedStudentForDrawer] = useState<any | null>(null);
  const [showHomeworkModal, setShowHomeworkModal] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [showMarksModal, setShowMarksModal] = useState(false);
  const [showScannerModal, setShowScannerModal] = useState(false);

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

  // 1. Initial Load: Teacher Profile & Authorized Classes
  useEffect(() => {
    fetch('/api/teacher/classes')
      .then((res) => res.json())
      .then((data) => {
        if (data.teacher) setTeacher(data.teacher);
        if (data.assignedClasses && data.assignedClasses.length > 0) {
          setAssignedClasses(data.assignedClasses);
          // Default to first class and section
          setSelectedClassId(data.assignedClasses[0].id);
          if (data.assignedClasses[0].sections?.length > 0) {
            setSelectedSectionId(data.assignedClasses[0].sections[0].id);
          }
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));

    fetchLiveSchedule();
    const interval = setInterval(fetchLiveSchedule, 45000);
    return () => clearInterval(interval);
  }, []);

  // 2. Fetch Selected Class Roster & KPIs
  const fetchClassStudents = () => {
    if (!selectedClassId) return;
    setClassDataLoading(true);

    let url = `/api/teacher/students?classId=${selectedClassId}`;
    if (selectedSectionId) url += `&sectionId=${selectedSectionId}`;
    if (searchQuery.trim()) url += `&q=${encodeURIComponent(searchQuery.trim())}`;
    if (activeFilter !== 'ALL') url += `&status=${activeFilter}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.stats) setClassStats(data.stats);
        if (data.students) setStudents(data.students);
      })
      .catch(console.error)
      .finally(() => setClassDataLoading(false));
  };

  useEffect(() => {
    fetchClassStudents();
  }, [selectedClassId, selectedSectionId, activeFilter]);

  // Debounced search within class
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchClassStudents();
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Attendance update handler
  const handleUpdateStudentAttendance = async (studentId: string, status: string) => {
    if (!selectedClassId || !selectedSectionId) return;

    try {
      const res = await fetch(
        `/api/teacher/classes/${selectedClassId}/sections/${selectedSectionId}/attendance`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ studentId, status }),
        }
      );

      if (res.ok) {
        // Optimistic update local roster
        setStudents((prev) =>
          prev.map((s) =>
            s.id === studentId
              ? {
                  ...s,
                  todayAttendance: {
                    status,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    method: 'MANUAL',
                  },
                }
              : s
          )
        );

        if (selectedStudentForDrawer && selectedStudentForDrawer.id === studentId) {
          setSelectedStudentForDrawer((prev: any) => ({
            ...prev,
            todayAttendance: {
              status,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              method: 'MANUAL',
            },
          }));
        }

        // Refresh stats
        fetchClassStudents();
      }
    } catch (err) {
      console.error('Attendance update error:', err);
    }
  };

  // Quick mark all present
  const handleMarkAllPresent = async () => {
    if (!selectedClassId || !selectedSectionId || students.length === 0) return;

    const updates = students.map((s) => ({
      studentId: s.id,
      status: 'PRESENT',
    }));

    try {
      const res = await fetch(
        `/api/teacher/classes/${selectedClassId}/sections/${selectedSectionId}/attendance`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ updates }),
        }
      );

      if (res.ok) {
        fetchClassStudents();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Find currently selected class object and section
  const currentClassObject = assignedClasses.find((c) => c.id === selectedClassId) || null;
  const currentSectionObject = currentClassObject?.sections.find((s: any) => s.id === selectedSectionId) || null;
  const currentSubjects = currentSectionObject?.subjects || [];

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

      setCancelMessage({
        type: 'success',
        text: 'Class cancelled. All students and parents have been notified in real time.',
      });
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

  return (
    <div className="space-y-8 animate-in fade-in duration-300 bg-[#FFFFFF] text-[#0F172A] pb-16">
      
      {/* Top Royal Blue Teacher Workspace Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-[#0F2A5F] text-white p-6 sm:p-10 shadow-xl border border-[#173B7A]">
        <div className="absolute right-0 top-0 w-96 h-96 bg-[#2563EB]/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute left-1/3 bottom-0 w-80 h-80 bg-[#173B7A]/30 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-600/25 text-blue-300 text-xs font-bold border border-blue-500/40 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
              <span>Teacher Academic Command • Session 2026-2027</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white font-serif">
              {teacher ? `Welcome, ${teacher.fullName}` : 'Faculty Command Center'}
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 font-medium leading-relaxed">
              Live timetable countdown, one-click classroom roll calls, and smart student 360 management.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <NotificationBell role="TEACHER" />
            <button
              onClick={() => {
                fetchLiveSchedule();
                fetchClassStudents();
              }}
              className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 backdrop-blur-xl flex items-center gap-1.5 transition-all"
              title="Refresh Dashboard"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* EMERGENCY SCHOOL CLOSURE BANNER */}
      {isSchoolClosed && (
        <div className="p-5 rounded-3xl bg-rose-50 border border-rose-200 flex items-start gap-4 shadow-sm animate-in slide-in-from-top-2">
          <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-md">
            <Ban className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-200 text-rose-800">
                Official Notice
              </span>
              <h4 className="font-black text-rose-950 text-sm font-serif">
                Campus Operations Temporarily Suspended
              </h4>
            </div>
            <p className="text-xs text-rose-800 font-medium">
              {closureInfo?.reason || 'School is closed by administration order.'}
            </p>
          </div>
        </div>
      )}

      {/* LIVE PERIOD ENGINE: TODAY'S TEACHING SCHEDULE & COUNTDOWN */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 font-serif">
              Today&apos;s Live Teaching Schedule
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Synchronized with school bell timetable (Asia/Karachi UTC+5)
            </p>
          </div>
        </div>

        {todaySchedule.length === 0 ? (
          <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200 text-center space-y-2">
            <Clock className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-xs font-bold text-slate-700">No Teaching Periods Scheduled for Today</p>
            <p className="text-[11px] text-slate-400">Enjoy your faculty prep and planning hours.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {todaySchedule.map((period, idx) => {
              const isActive = period.status === 'ACTIVE';
              const isCancelled = period.status === 'CANCELLED';
              const isSub = period.isSubstituteRole;

              return (
                <div
                  key={idx}
                  className={`p-5 rounded-3xl border transition-all relative overflow-hidden flex flex-col justify-between gap-4 ${
                    isActive
                      ? 'bg-blue-50/70 border-[#2563EB] shadow-md ring-2 ring-blue-500/20'
                      : isCancelled
                      ? 'bg-rose-50/60 border-rose-200 opacity-80'
                      : isSub
                      ? 'bg-amber-50/60 border-amber-300'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono font-bold text-slate-500">
                        {period.startTime} — {period.endTime}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          isActive
                            ? 'bg-[#2563EB] text-white shadow-sm'
                            : isCancelled
                            ? 'bg-rose-600 text-white'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {period.status}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-sm text-slate-900 leading-tight">
                        {period.subjectName}
                      </h4>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        {period.className} ({period.sectionName}) • {period.roomNo || 'Main Hall'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
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
                  placeholder="e.g., Emergency medical appointment / Faculty conference"
                  className="w-full p-3.5 rounded-2xl border border-slate-200 text-xs text-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              {cancelMessage && (
                <div
                  className={`p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2 ${
                    cancelMessage.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{cancelMessage.text}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCancellingPeriod(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-all"
                >
                  Keep Active
                </button>
                <button
                  type="submit"
                  disabled={cancelLoading || !cancellationReason.trim()}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {cancelLoading ? <span>Broadcasting...</span> : <span>Confirm Cancellation</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🚀 SECTION: MY CLASSES — AUTHORITATIVE CLASS DROPDOWN & COMMAND CENTER    */}
      {/* ========================================================================= */}
      <div className="space-y-6 pt-4 border-t border-[#E2E8F0]">
        
        {/* Class Selector Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#F8FAFC] p-4 sm:p-5 rounded-3xl border border-[#E2E8F0]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-[#2563EB] block">
                Class Command Center (Authoritative RBAC)
              </span>
              <h2 className="text-lg font-black text-[#0F172A] font-serif">
                Select Teaching Class
              </h2>
            </div>
          </div>

          {/* Authoritative Class-Section Dropdown */}
          <div className="flex items-center gap-3">
            <label className="text-xs font-bold text-[#64748B] hidden sm:inline">Active Class:</label>
            <div className="relative min-w-[220px]">
              <select
                value={`${selectedClassId}::${selectedSectionId}`}
                onChange={(e) => {
                  const [cId, sId] = e.target.value.split('::');
                  setSelectedClassId(cId);
                  setSelectedSectionId(sId);
                }}
                className="w-full appearance-none bg-white text-xs font-bold text-[#0F172A] px-4 py-2.5 rounded-2xl border border-[#E2E8F0] shadow-sm focus:ring-2 focus:ring-[#2563EB] focus:outline-none cursor-pointer pr-10"
              >
                {assignedClasses.map((cls) =>
                  cls.sections.map((sec: any) => (
                    <option key={`${cls.id}::${sec.id}`} value={`${cls.id}::${sec.id}`}>
                      {cls.name} — Section {sec.name}
                    </option>
                  ))
                )}
              </select>
              <ChevronDown className="w-4 h-4 text-[#94A3B8] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* CLASS COMMAND CENTER HEADER & ACTIONS */}
        {currentClassObject && currentSectionObject && (
          <div className="bg-white rounded-3xl border border-[#E2E8F0] p-6 shadow-sm space-y-6">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#F1F5F9] pb-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <h3 className="text-xl sm:text-2xl font-black text-[#0F172A] font-serif">
                    {currentClassObject.name} — Section {currentSectionObject.name}
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]">
                    Authoritative Roster
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-[#64748B]">
                  <span>Teaching Subjects:</span>
                  {currentSubjects.map((sub: any) => (
                    <span
                      key={sub.id}
                      className="px-2 py-0.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] font-bold text-[#0F172A]"
                    >
                      📖 {sub.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Class Quick Actions */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setShowScannerModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Scan Student QR</span>
                </button>

                <button
                  onClick={handleMarkAllPresent}
                  className="px-3.5 py-2 rounded-xl bg-[#F0FDF4] hover:bg-[#DCFCE7] text-[#16A34A] font-bold text-xs border border-[#BBF7D0] flex items-center gap-1.5 transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Mark All Present</span>
                </button>

                <button
                  onClick={() => setShowHomeworkModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#2563EB] font-bold text-xs border border-[#BFDBFE] flex items-center gap-1.5 transition-colors"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>+ Assign Homework</span>
                </button>

                <button
                  onClick={() => setShowTestModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs border border-purple-200 flex items-center gap-1.5 transition-colors"
                >
                  <Award className="w-3.5 h-3.5 text-purple-600" />
                  <span>+ Schedule Test</span>
                </button>

                <button
                  onClick={() => setShowMaterialModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-xs border border-amber-200 flex items-center gap-1.5 transition-colors"
                >
                  <FileText className="w-3.5 h-3.5 text-amber-600" />
                  <span>+ Upload Docs</span>
                </button>

                <button
                  onClick={() => setShowMarksModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-colors"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>+ Enter Test Marks</span>
                </button>
              </div>
            </div>

            {/* CLASS KPI METRICS (8 CARDS) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
              <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#64748B] block">Students</span>
                <p className="text-xl font-black text-[#0F172A] font-mono">
                  {classStats?.totalStudents ?? students.length}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0] space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#16A34A] block">Present</span>
                <p className="text-xl font-black text-[#16A34A] font-mono">
                  {classStats?.presentToday ?? 0}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#FEF3C7] border border-[#FDE68A] space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#D97706] block">Late</span>
                <p className="text-xl font-black text-[#D97706] font-mono">
                  {classStats?.lateToday ?? 0}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#FEE2E2] border border-[#FECACA] space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#DC2626] block">Absent</span>
                <p className="text-xl font-black text-[#DC2626] font-mono">
                  {classStats?.absentToday ?? 0}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#EFF6FF] border border-[#BFDBFE] space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#2563EB] block">Attendance %</span>
                <p className="text-xl font-black text-[#2563EB] font-mono">
                  {classStats?.attendancePct ?? 100}%
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#64748B] block">Pending Roll</span>
                <p className="text-xl font-black text-[#0F172A] font-mono">
                  {classStats?.pendingAttendance ?? 0}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#64748B] block">Pending Hw</span>
                <p className="text-xl font-black text-[#0F172A] font-mono">
                  {classStats?.pendingHomework ?? 0}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#64748B] block">Tests</span>
                <p className="text-xl font-black text-[#0F172A] font-mono">
                  {classStats?.upcomingTests ?? 1}
                </p>
              </div>
            </div>

            {/* SEARCH & FILTER BAR */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-[#2563EB] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search student by name, roll number, or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#E2E8F0] bg-white text-xs text-[#0F172A] focus:ring-2 focus:ring-[#2563EB] focus:outline-none"
                />
              </div>

              {/* Quick Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                {[
                  { id: 'ALL', label: 'All Students' },
                  { id: 'PRESENT', label: 'Present' },
                  { id: 'LATE', label: 'Late' },
                  { id: 'ABSENT', label: 'Absent' },
                  { id: 'PENDING', label: 'Roll Pending' },
                  { id: 'HOMEWORK_PENDING', label: 'Homework Pending' },
                ].map((f) => {
                  const isActive = activeFilter === f.id;
                  return (
                    <button
                      key={f.id}
                      onClick={() => setActiveFilter(f.id as any)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                        isActive
                          ? 'bg-[#2563EB] text-white shadow-sm'
                          : 'bg-[#F8FAFC] text-[#64748B] hover:text-[#0F172A] border border-[#E2E8F0]'
                      }`}
                    >
                      {f.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CLASS STUDENT ROSTER (DESKTOP TABLE & MOBILE CARDS) */}
            {classDataLoading ? (
              <div className="py-12 text-center">
                <PortalCircularLoader message="Loading class roster and live roll call..." />
              </div>
            ) : students.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#64748B] space-y-2">
                <Users className="w-8 h-8 text-[#94A3B8] mx-auto" />
                <p className="font-bold text-[#0F172A]">No students match your filter or search query.</p>
                <p>Try clearing your search keyword or switching filters.</p>
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto border border-[#E2E8F0] rounded-2xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] font-bold">
                      <tr>
                        <th className="p-3.5">Roll</th>
                        <th className="p-3.5">Student</th>
                        <th className="p-3.5">Student ID</th>
                        <th className="p-3.5">Attendance Status</th>
                        <th className="p-3.5">Homework</th>
                        <th className="p-3.5">Latest Mark</th>
                        <th className="p-3.5 text-right">One-Click Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F1F5F9]">
                      {students.map((st) => {
                        const attStatus = st.todayAttendance?.status || 'PENDING';
                        return (
                          <tr
                            key={st.id}
                            className="hover:bg-[#EFF6FF]/40 transition-colors group cursor-pointer"
                            onClick={() => setSelectedStudentForDrawer(st)}
                          >
                            <td className="p-3.5 font-mono font-bold text-[#0F172A]">
                              {st.rollNo}
                            </td>
                            <td className="p-3.5">
                              <div className="flex items-center gap-2.5">
                                <img
                                  src={st.photoUrl || '/student-avatar.png'}
                                  alt={st.fullName}
                                  className="w-8 h-8 rounded-full object-cover border border-[#E2E8F0]"
                                />
                                <div>
                                  <p className="font-bold text-[#0F172A] group-hover:text-[#2563EB]">
                                    {st.fullName}
                                  </p>
                                  <p className="text-[10px] text-[#64748B]">
                                    Card: {st.cardStatus || 'ACTIVE'}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="p-3.5 font-mono text-[#64748B]">{st.studentId}</td>
                            <td className="p-3.5" onClick={(e) => e.stopPropagation()}>
                              {/* 1-Click Roll Call Status Cycle */}
                              <button
                                onClick={() => {
                                  const nextStatus =
                                    attStatus === 'PRESENT'
                                      ? 'LATE'
                                      : attStatus === 'LATE'
                                      ? 'ABSENT'
                                      : 'PRESENT';
                                  handleUpdateStudentAttendance(st.id, nextStatus);
                                }}
                                className={`px-2.5 py-1 rounded-full text-[11px] font-black border transition-all ${
                                  attStatus === 'PRESENT'
                                    ? 'bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0]'
                                    : attStatus === 'LATE'
                                    ? 'bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]'
                                    : attStatus === 'ABSENT'
                                    ? 'bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]'
                                    : 'bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0]'
                                }`}
                                title="Click to toggle: Present ➔ Late ➔ Absent"
                              >
                                {attStatus === 'PRESENT'
                                  ? '✓ Present'
                                  : attStatus === 'LATE'
                                  ? '⚠️ Late'
                                  : attStatus === 'ABSENT'
                                  ? '✗ Absent'
                                  : '● Pending'}
                              </button>
                            </td>
                            <td className="p-3.5">
                              <span
                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                  st.homeworkStatus === 'SUBMITTED'
                                    ? 'bg-[#F0FDF4] text-[#16A34A]'
                                    : st.homeworkStatus === 'PENDING'
                                    ? 'bg-[#FEF3C7] text-[#D97706]'
                                    : 'text-[#94A3B8]'
                                }`}
                              >
                                {st.homeworkStatus === 'SUBMITTED'
                                  ? '✓ Submitted'
                                  : st.homeworkStatus === 'PENDING'
                                  ? 'Awaited'
                                  : '—'}
                              </span>
                            </td>
                            <td className="p-3.5">
                              {st.latestMark ? (
                                <span className="font-mono text-[11px] font-bold text-[#0F172A]">
                                  {st.latestMark.score} ({st.latestMark.grade})
                                </span>
                              ) : (
                                <span className="text-[#94A3B8]">—</span>
                              )}
                            </td>
                            <td className="p-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => setSelectedStudentForDrawer(st)}
                                className="px-3 py-1.5 rounded-xl bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#2563EB] font-bold text-[11px] transition-colors"
                              >
                                Student 360
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards View */}
                <div className="md:hidden space-y-3">
                  {students.map((st) => {
                    const attStatus = st.todayAttendance?.status || 'PENDING';
                    return (
                      <div
                        key={st.id}
                        onClick={() => setSelectedStudentForDrawer(st)}
                        className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-3 cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <img
                              src={st.photoUrl || '/student-avatar.png'}
                              alt={st.fullName}
                              className="w-10 h-10 rounded-full object-cover border border-[#E2E8F0]"
                            />
                            <div>
                              <p className="font-bold text-sm text-[#0F172A]">{st.fullName}</p>
                              <p className="text-[11px] text-[#64748B]">
                                Roll {st.rollNo} • {st.studentId}
                              </p>
                            </div>
                          </div>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                              attStatus === 'PRESENT'
                                ? 'bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0]'
                                : attStatus === 'LATE'
                                ? 'bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]'
                                : attStatus === 'ABSENT'
                                ? 'bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]'
                                : 'bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0]'
                            }`}
                          >
                            {attStatus}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-[#E2E8F0] text-xs">
                          <span className="text-[#64748B]">
                            Hw: <strong>{st.homeworkStatus}</strong>
                          </span>
                          <span className="text-[#2563EB] font-bold flex items-center gap-1">
                            <span>Open 360</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

          </div>
        )}
      </div>

      {/* STUDENT DETAIL DRAWER / SLIDE-OVER PANEL */}
      <StudentDetailDrawer
        student={selectedStudentForDrawer}
        isOpen={!!selectedStudentForDrawer}
        onClose={() => setSelectedStudentForDrawer(null)}
        onUpdateAttendance={handleUpdateStudentAttendance}
      />

      {/* CREATE HOMEWORK MODAL */}
      {currentClassObject && currentSectionObject && (
        <CreateHomeworkModal
          isOpen={showHomeworkModal}
          onClose={() => setShowHomeworkModal(false)}
          classId={selectedClassId}
          className={currentClassObject.name}
          sectionId={selectedSectionId}
          sectionName={currentSectionObject.name}
          subjects={currentSubjects}
          onSuccess={() => fetchClassStudents()}
        />
      )}

      {/* FAST MARKS ENTRY MODAL */}
      {currentClassObject && currentSectionObject && (
        <FastMarksEntryModal
          isOpen={showMarksModal}
          onClose={() => setShowMarksModal(false)}
          classId={selectedClassId}
          className={currentClassObject.name}
          sectionId={selectedSectionId}
          sectionName={currentSectionObject.name}
          subjects={currentSubjects}
          students={students}
          onSuccess={() => fetchClassStudents()}
        />
      )}

      {/* SCHEDULE CLASS TEST MODAL */}
      {currentClassObject && currentSectionObject && (
        <CreateClassTestModal
          isOpen={showTestModal}
          onClose={() => setShowTestModal(false)}
          classId={selectedClassId}
          sectionId={selectedSectionId}
          subjects={currentSubjects}
          onSuccess={() => fetchClassStudents()}
        />
      )}

      {/* UPLOAD STUDY MATERIAL MODAL */}
      {currentClassObject && currentSectionObject && (
        <UploadStudyMaterialModal
          isOpen={showMaterialModal}
          onClose={() => setShowMaterialModal(false)}
          classId={selectedClassId}
          subjects={currentSubjects}
          onSuccess={() => fetchClassStudents()}
        />
      )}

      {/* LIVE OPTICAL QR SCANNER MODAL */}
      {showScannerModal && (
        <QRScannerModal
          title="Classroom Live QR Attendance Scanner"
          subtitle={`Scanning students for ${currentClassObject?.name || 'Class'} - Section ${currentSectionObject?.name || ''}`}
          onClose={() => setShowScannerModal(false)}
          onAttendanceMarked={() => fetchClassStudents()}
        />
      )}

    </div>
  );
}
