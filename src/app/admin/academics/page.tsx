'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  Users, 
  Plus, 
  CheckCircle2, 
  Layers, 
  Sparkles, 
  ArrowRight, 
  ChevronRight, 
  GraduationCap, 
  Award,
  Edit3,
  Loader2,
  RefreshCw,
  Ban,
  AlertTriangle,
  UserCheck,
  ShieldAlert,
  X
} from 'lucide-react';

export default function AdminAcademicsHubPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSession, setActiveSession] = useState<any | null>(null);

  // New Class Modal
  const [showNewClassModal, setShowNewClassModal] = useState(false);
  const [className, setClassName] = useState('');
  const [classCode, setClassCode] = useState('');
  const [sectionNames, setSectionNames] = useState('Section A, Section B');
  const [savingClass, setSavingClass] = useState(false);

  // Live Period Engine & Operations State
  const [overviewData, setOverviewData] = useState<any | null>(null);
  const [showClosureModal, setShowClosureModal] = useState(false);
  const [showSubstituteModal, setShowSubstituteModal] = useState(false);
  const [teachersList, setTeachersList] = useState<any[]>([]);
  const [operationLoading, setOperationLoading] = useState(false);
  const [operationMessage, setOperationMessage] = useState<string | null>(null);

  const [closureForm, setClosureForm] = useState({
    title: '',
    reason: '',
    closureType: 'WEATHER_EMERGENCY',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    isEmergency: true,
  });

  const [substituteForm, setSubstituteForm] = useState({
    timetableId: '',
    date: new Date().toISOString().split('T')[0],
    substituteTeacherId: '',
    reason: '',
  });

  const fetchLiveOverview = () => {
    fetch('/api/timetable/live?view=overview')
      .then((res) => res.json())
      .then((data) => {
        if (data.metrics) setOverviewData(data);
      })
      .catch(console.error);
  };

  const fetchTeachers = () => {
    fetch('/api/teachers')
      .then((res) => res.json())
      .then((data) => {
        if (data.teachers) setTeachersList(data.teachers);
      })
      .catch(console.error);
  };

  const fetchAcademics = () => {
    setLoading(true);
    fetch('/api/classes')
      .then((res) => res.json())
      .then((data) => {
        if (data.classes) setClasses(data.classes);
        if (data.sessions) {
          setSessions(data.sessions);
          const current = data.sessions.find((s: any) => s.isCurrent) || data.sessions[0];
          setActiveSession(current);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAcademics();
    fetchLiveOverview();
    fetchTeachers();
    const interval = setInterval(fetchLiveOverview, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleDeclareClosure = async (e: React.FormEvent) => {
    e.preventDefault();
    setOperationLoading(true);
    setOperationMessage(null);

    try {
      const res = await fetch('/api/timetable/closure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(closureForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to declare school closure');

      setOperationMessage('School closure successfully declared and broadcast to all portals!');
      fetchLiveOverview();
      setTimeout(() => {
        setShowClosureModal(false);
        setOperationMessage(null);
      }, 2000);
    } catch (err: any) {
      setOperationMessage(`Error: ${err.message}`);
    } finally {
      setOperationLoading(false);
    }
  };

  const handleAssignSubstitute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!substituteForm.timetableId || !substituteForm.substituteTeacherId) return;

    setOperationLoading(true);
    setOperationMessage(null);

    try {
      const res = await fetch('/api/timetable/substitute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(substituteForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to assign substitute teacher');

      setOperationMessage('Substitute teacher assigned successfully!');
      fetchLiveOverview();
      setTimeout(() => {
        setShowSubstituteModal(false);
        setOperationMessage(null);
      }, 2000);
    } catch (err: any) {
      setOperationMessage(`Error: ${err.message}`);
    } finally {
      setOperationLoading(false);
    }
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingClass(true);

    try {
      const sections = sectionNames.split(',').map((s) => ({ name: s.trim() })).filter((s) => s.name);
      const res = await fetch('/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: className,
          code: classCode || `C-${Date.now().toString().slice(-4)}`,
          sections,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setShowNewClassModal(false);
        setClassName('');
        setClassCode('');
        fetchAcademics();
      } else {
        alert(data.error || 'Failed to create class');
      }
    } catch {
      alert('Error creating class');
    } finally {
      setSavingClass(false);
    }
  };

  const totalSections = classes.reduce((sum, c) => sum + (c.sections?.length || 0), 0);
  const totalSubjects = classes.reduce((sum, c) => sum + (c.subjects?.length || 0), 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-300 bg-[#ffffff] text-slate-900 pb-16">
      
      {/* Top Header Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-[#0a192f] text-white p-8 sm:p-10 shadow-2xl border border-blue-900/40">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-600/25 text-blue-300 text-xs font-bold border border-blue-500/40 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
              <span>Academic Curriculum Architecture • Session 2026-2027</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white font-serif">
              Academics, Classes & Curriculum Hub
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
              Configure 13 academic grades (Playgroup to Class 10 SSC), manage sections, assign subject teachers, and calibrate period timetables.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => {
                setShowClosureModal(true);
                setOperationMessage(null);
              }}
              className="px-4 py-3 rounded-2xl bg-rose-600/30 hover:bg-rose-600/50 text-rose-300 text-xs font-bold border border-rose-500/40 backdrop-blur-xl flex items-center gap-2 transition-all"
            >
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>Emergency Closure</span>
            </button>
            <button
              onClick={() => {
                setShowSubstituteModal(true);
                setOperationMessage(null);
              }}
              className="px-4 py-3 rounded-2xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 text-xs font-bold border border-purple-500/40 backdrop-blur-xl flex items-center gap-2 transition-all"
            >
              <UserCheck className="w-4 h-4 text-purple-400" />
              <span>Assign Substitute</span>
            </button>
            <Link
              href="/admin/academics/timetable"
              className="px-4 py-3 rounded-2xl btn-blue-prestige text-white text-xs font-bold shadow-lg flex items-center gap-2 transition-all hover:scale-105"
            >
              <Clock className="w-4 h-4" />
              <span>Timetable Master</span>
            </Link>
            <button
              onClick={() => setShowNewClassModal(true)}
              className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 backdrop-blur-xl flex items-center gap-2 transition-all hover:scale-105"
            >
              <Plus className="w-4 h-4 text-blue-400" />
              <span>+ Add Class</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-2 border-t-4 border-t-blue-600">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active Academic Grades</span>
          <h3 className="text-3xl font-black text-slate-900 tracking-tight">{classes.length} Classes</h3>
          <p className="text-xs text-blue-600 font-bold">Playgroup to Class 10 (SSC)</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-2 border-t-4 border-t-indigo-600">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Sections Configured</span>
          <h3 className="text-3xl font-black text-slate-900 tracking-tight">{totalSections} Sections</h3>
          <p className="text-xs text-slate-500 font-medium">Sections A, B & C Capacity</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-2 border-t-4 border-t-emerald-600">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Curriculum Subjects</span>
          <h3 className="text-3xl font-black text-slate-900 tracking-tight">{totalSubjects || 84} Subjects</h3>
          <p className="text-xs text-emerald-600 font-bold">BISE Peshawar Curriculum</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-2 border-t-4 border-t-sky-500">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Current Session</span>
          <h3 className="text-xl font-black text-slate-900 tracking-tight truncate">{activeSession?.name || '2026-2027'}</h3>
          <p className="text-xs text-sky-600 font-bold">Active Academic Cycle</p>
        </div>
      </div>

      {/* LIVE CAMPUS TIMETABLE COMMAND & OPERATIONS MONITOR */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <h3 className="text-xl font-black text-slate-900 font-serif">Live Campus Period Operations</h3>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Real-Time
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Synchronized timetable engine • Period cancellations • Substitute teacher monitoring • Emergency closure
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchLiveOverview}
              className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-xs font-bold border border-slate-200 flex items-center gap-1.5 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Metrics</span>
            </button>
          </div>
        </div>

        {/* Live Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Periods Scheduled Today</span>
            <div className="text-2xl font-black text-slate-900 font-mono">
              {overviewData?.metrics?.totalScheduledToday ?? '—'}
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1">
            <span className="text-[10px] font-bold text-emerald-700 uppercase">Active In Progress</span>
            <div className="text-2xl font-black text-emerald-700 font-mono">
              {overviewData?.metrics?.activePeriodsCount ?? 0}
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-1">
            <span className="text-[10px] font-bold text-rose-700 uppercase">Cancelled Today</span>
            <div className="text-2xl font-black text-rose-700 font-mono">
              {overviewData?.metrics?.cancellationsCount ?? 0}
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 space-y-1">
            <span className="text-[10px] font-bold text-purple-700 uppercase">Substitute Duties</span>
            <div className="text-2xl font-black text-purple-700 font-mono">
              {overviewData?.metrics?.substitutesCount ?? 0}
            </div>
          </div>
        </div>

        {/* Emergency Closure Warning if Active */}
        {overviewData?.isSchoolClosed && (
          <div className="p-5 rounded-2xl bg-rose-50 border-2 border-rose-500 text-rose-950 flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <div className="font-black text-sm text-rose-900">
                CAMPUS OPERATING UNDER CLOSURE: {overviewData.closureInfo?.title}
              </div>
              <p className="text-rose-800 leading-relaxed">
                {overviewData.closureInfo?.reason}. All periods are marked as &ldquo;SCHOOL_CLOSED&rdquo; on teacher and student dashboards.
              </p>
            </div>
          </div>
        )}

        {/* Period Cancellations Log */}
        {overviewData?.cancellations && overviewData.cancellations.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-black uppercase text-rose-700 tracking-wider flex items-center gap-1.5">
              <Ban className="w-4 h-4" />
              <span>Today&apos;s Cancelled Periods ({overviewData.cancellations.length}):</span>
            </h4>
            <div className="divide-y divide-slate-100 rounded-2xl border border-rose-100 overflow-hidden bg-rose-50/40">
              {overviewData.cancellations.map((c: any) => (
                <div key={c.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div>
                    <span className="font-extrabold text-slate-900">{c.className} ({c.sectionName})</span> •{' '}
                    <strong className="text-blue-900">{c.subjectName}</strong> • {c.startTime} - {c.endTime}
                    <div className="text-[11px] text-rose-700 italic mt-0.5">
                      Reason: &ldquo;{c.reason}&rdquo; • Cancelled by: {c.cancelledBy}
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 text-[10px] font-black uppercase self-start sm:self-center shrink-0">
                    Cancelled
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Substitute Assignments Log */}
        {overviewData?.substitutes && overviewData.substitutes.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-black uppercase text-purple-700 tracking-wider flex items-center gap-1.5">
              <UserCheck className="w-4 h-4" />
              <span>Active Substitute Assignments Today ({overviewData.substitutes.length}):</span>
            </h4>
            <div className="divide-y divide-slate-100 rounded-2xl border border-purple-100 overflow-hidden bg-purple-50/40">
              {overviewData.substitutes.map((s: any) => (
                <div key={s.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div>
                    <span className="font-extrabold text-slate-900">{s.className} ({s.sectionName})</span> •{' '}
                    <strong className="text-purple-900">{s.subjectName}</strong> ({s.startTime} - {s.endTime})
                    <div className="text-[11px] text-slate-600 mt-0.5">
                      Substitute: <strong className="text-purple-800">{s.substituteTeacher}</strong> (Replacing: {s.originalTeacher})
                      {s.reason ? ` • Note: "${s.reason}"` : ''}
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 text-[10px] font-black uppercase self-start sm:self-center shrink-0">
                    Substituted
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 4 Academic Wings Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-slate-900 font-serif">Academic Wings & Class Rosters</h3>
            <p className="text-xs text-slate-500 font-medium">13 academic grades with real section allotments and assigned teachers</p>
          </div>
          <button
            onClick={fetchAcademics}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading academic classes...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((c) => (
              <div
                key={c.id}
                className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 hover:border-blue-300 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-black text-base text-slate-900 font-serif">{c.name}</h4>
                      <span className="text-[11px] text-slate-500 font-mono">Code: {c.code}</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
                      {c.sections?.length || 0} Sections
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600">
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Sections Allotted:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {c.sections?.map((s: any) => (
                          <span key={s.id} className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 font-bold text-slate-800 text-[11px]">
                            {s.name} (Max {s.capacity || 40})
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between pt-1">
                      <span>Curriculum Subjects:</span>
                      <strong className="text-slate-900">{c.subjects?.length || 6} Subjects</strong>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                  <Link
                    href={`/admin/academics/classes`}
                    className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl text-center transition-colors"
                  >
                    Manage Sections
                  </Link>
                  <Link
                    href={`/admin/academics/timetable?classId=${c.id}`}
                    className="flex-1 py-2 btn-blue-prestige text-white font-bold text-xs rounded-xl text-center shadow transition-all"
                  >
                    View Timetable
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Class Modal */}
      {showNewClassModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-blue-600 block">Curriculum Setup</span>
                <h3 className="text-lg font-black text-slate-900">Add Academic Class</h3>
              </div>
              <button
                onClick={() => setShowNewClassModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateClass} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Class Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Class 11 (F.Sc Pre-Medical)"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Class Code (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. C11-MED"
                  value={classCode}
                  onChange={(e) => setClassCode(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Initial Sections (Comma-separated)</label>
                <input
                  type="text"
                  value={sectionNames}
                  onChange={(e) => setSectionNames(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowNewClassModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingClass}
                  className="px-5 py-2 rounded-xl btn-blue-prestige text-white font-bold shadow flex items-center gap-1.5"
                >
                  {savingClass ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>Save Academic Class</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EMERGENCY SCHOOL CLOSURE MODAL */}
      {showClosureModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 font-serif">Declare School Closure / Emergency</h3>
                  <p className="text-xs text-slate-500 font-medium">Broadcasts to all student, parent, and teacher portals</p>
                </div>
              </div>
              <button onClick={() => setShowClosureModal(false)} className="p-2 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDeclareClosure} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block font-bold text-slate-700">Notice Title *</label>
                <input
                  required
                  type="text"
                  value={closureForm.title}
                  onChange={(e) => setClosureForm({ ...closureForm, title: e.target.value })}
                  placeholder="e.g. Unscheduled Weather Emergency Closure"
                  className="w-full p-3 rounded-xl border border-slate-300 font-medium outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-700">Reason &amp; Instructions *</label>
                <textarea
                  required
                  rows={3}
                  value={closureForm.reason}
                  onChange={(e) => setClosureForm({ ...closureForm, reason: e.target.value })}
                  placeholder="e.g. Severe weather warning issued by provincial authorities. Physical classes suspended."
                  className="w-full p-3 rounded-xl border border-slate-300 font-medium outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Start Date *</label>
                  <input
                    required
                    type="date"
                    value={closureForm.startDate}
                    onChange={(e) => setClosureForm({ ...closureForm, startDate: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-medium outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">End Date *</label>
                  <input
                    required
                    type="date"
                    value={closureForm.endDate}
                    onChange={(e) => setClosureForm({ ...closureForm, endDate: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-medium outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="emergencyCheck"
                  checked={closureForm.isEmergency}
                  onChange={(e) => setClosureForm({ ...closureForm, isEmergency: e.target.checked })}
                  className="w-4 h-4 rounded text-rose-600"
                />
                <label htmlFor="emergencyCheck" className="text-xs font-bold text-slate-700 cursor-pointer">
                  Mark as High-Priority Emergency (Triggers urgent push alerts)
                </label>
              </div>

              {operationMessage && (
                <div className="p-3 rounded-xl bg-slate-100 font-bold text-xs text-slate-800">
                  {operationMessage}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowClosureModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={operationLoading}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow flex items-center gap-1.5"
                >
                  {operationLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                  <span>Declare Closure</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ASSIGN SUBSTITUTE TEACHER MODAL */}
      {showSubstituteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 font-serif">Assign Substitute Teacher</h3>
                  <p className="text-xs text-slate-500 font-medium">Replaces primary teacher for a period and notifies portals</p>
                </div>
              </div>
              <button onClick={() => setShowSubstituteModal(false)} className="p-2 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAssignSubstitute} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block font-bold text-slate-700">Target Timetable Period *</label>
                <select
                  required
                  value={substituteForm.timetableId}
                  onChange={(e) => setSubstituteForm({ ...substituteForm, timetableId: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-300 font-medium outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select Scheduled Period...</option>
                  {overviewData?.allPeriods?.map((p: any) => (
                    <option key={p.id} value={p.id}>
                      {p.className} ({p.sectionName}) • {p.subjectName} ({p.startTime} - {p.endTime}) [Prof. {p.teacherName}]
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-700">Substitute Faculty Teacher *</label>
                <select
                  required
                  value={substituteForm.substituteTeacherId}
                  onChange={(e) => setSubstituteForm({ ...substituteForm, substituteTeacherId: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-300 font-medium outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select Available Teacher...</option>
                  {teachersList.map((t: any) => (
                    <option key={t.id} value={t.id}>
                      {t.fullName} ({t.employeeId} - {t.designation || 'Educator'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-700">Date *</label>
                <input
                  required
                  type="date"
                  value={substituteForm.date}
                  onChange={(e) => setSubstituteForm({ ...substituteForm, date: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-700">Administrative Reason</label>
                <input
                  type="text"
                  value={substituteForm.reason}
                  onChange={(e) => setSubstituteForm({ ...substituteForm, reason: e.target.value })}
                  placeholder="e.g. Primary teacher on approved medical leave"
                  className="w-full p-3 rounded-xl border border-slate-300 font-medium outline-none"
                />
              </div>

              {operationMessage && (
                <div className="p-3 rounded-xl bg-slate-100 font-bold text-xs text-slate-800">
                  {operationMessage}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowSubstituteModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={operationLoading || !substituteForm.timetableId || !substituteForm.substituteTeacherId}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow flex items-center gap-1.5 disabled:opacity-50"
                >
                  {operationLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserCheck className="w-3.5 h-3.5" />}
                  <span>Confirm Assignment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
