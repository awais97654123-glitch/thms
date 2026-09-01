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
  RefreshCw
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
  }, []);

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

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/admin/academics/timetable"
              className="px-5 py-3.5 rounded-2xl btn-blue-prestige text-white text-xs font-bold shadow-lg flex items-center gap-2.5 transition-all hover:scale-105"
            >
              <Clock className="w-4 h-4" />
              <span>Timetable Master</span>
            </Link>
            <button
              onClick={() => setShowNewClassModal(true)}
              className="px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 backdrop-blur-xl flex items-center gap-2.5 transition-all hover:scale-105"
            >
              <Plus className="w-4 h-4 text-blue-400" />
              <span>+ Add Academic Class</span>
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

    </div>
  );
}
