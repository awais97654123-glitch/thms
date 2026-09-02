'use client';

import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Plus, 
  AlertCircle, 
  CheckCircle2, 
  User, 
  Building2, 
  BookOpen, 
  Sparkles, 
  Zap, 
  Layers, 
  Calendar, 
  ShieldAlert, 
  X,
  Filter
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import StatusBadge from '@/components/ui/StatusBadge';
import Input, { Select } from '@/components/ui/Input';

export default function AdminTimetablePage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [timetables, setTimetables] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssistantModal, setShowAssistantModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Scheduling Form State
  const [form, setForm] = useState({
    classId: '',
    sectionId: '',
    subjectId: '',
    teacherId: '',
    dayOfWeek: 'MONDAY',
    startTime: '08:30',
    endTime: '09:15',
    roomNo: 'Room 201',
    allowOverride: false,
  });

  // Real-time Conflict Preview State
  const [conflictChecking, setConflictChecking] = useState(false);
  const [conflictResult, setConflictResult] = useState<{
    status: 'AVAILABLE' | 'CONFLICT' | null;
    conflicts: string[];
    warnings: string[];
  }>({
    status: null,
    conflicts: [],
    warnings: [],
  });

  // Scheduling Assistant State
  const [assistantForm, setAssistantForm] = useState({
    classId: '',
    sectionId: '',
    subjectId: '',
    requiredWeeklyPeriods: 5,
  });
  const [suggestedSlots, setSuggestedSlots] = useState<any[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      fetch('/api/classes').then((r) => r.json()),
      fetch('/api/teachers').then((r) => r.json()),
      fetch('/api/timetable').then((r) => r.json()),
    ])
      .then(([classData, teacherData, ttData]) => {
        if (classData.classes && classData.classes.length > 0) {
          setClasses(classData.classes);
          if (!selectedClass) {
            setSelectedClass(classData.classes[0].id);
            if (classData.classes[0].sections?.[0]) {
              setSelectedSection(classData.classes[0].sections[0].id);
            }
          }
        }
        if (teacherData.teachers) setTeachers(teacherData.teachers);
        if (ttData.timetables) setTimetables(ttData.timetables);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  // Real-time Conflict Checker debounced hook
  useEffect(() => {
    if (!showAddModal) return;
    if (!form.classId || !form.sectionId || !form.subjectId || !form.teacherId || !form.startTime || !form.endTime) {
      setConflictResult({ status: null, conflicts: [], warnings: [] });
      return;
    }

    setConflictChecking(true);
    const timer = setTimeout(() => {
      fetch('/api/timetable/check-conflict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.success) {
            setConflictResult({
              status: data.status,
              conflicts: data.conflicts || [],
              warnings: data.warnings || [],
            });
          }
        })
        .catch(console.error)
        .finally(() => setConflictChecking(false));
    }, 350);

    return () => clearTimeout(timer);
  }, [
    form.classId,
    form.sectionId,
    form.subjectId,
    form.teacherId,
    form.dayOfWeek,
    form.startTime,
    form.endTime,
    form.roomNo,
    form.allowOverride,
    showAddModal,
  ]);

  const handleCreateEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    try {
      const res = await fetch('/api/timetable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setShowAddModal(false);
        loadData();
      } else {
        setErrorMsg(data.error || 'Failed to schedule period');
      }
    } catch {
      setErrorMsg('Network error submitting timetable slot');
    }
  };

  const handleRunAssistant = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingSuggestions(true);

    try {
      const res = await fetch('/api/timetable/suggest-slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assistantForm),
      });

      const data = await res.json();
      if (res.ok && data.suggestions) {
        setSuggestedSlots(data.suggestions);
      } else {
        alert(data.error || 'No suggestions found');
      }
    } catch {
      alert('Error fetching optimal suggestions');
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleApplySuggestedSlot = async (slot: any) => {
    try {
      const res = await fetch('/api/timetable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classId: assistantForm.classId,
          sectionId: assistantForm.sectionId,
          subjectId: assistantForm.subjectId,
          teacherId: slot.teacherId,
          dayOfWeek: slot.dayOfWeek,
          startTime: slot.startTime,
          endTime: slot.endTime,
          roomNo: slot.roomNo,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuggestedSlots((prev) => prev.filter((s) => s !== slot));
        loadData();
      } else {
        alert(data.error || 'Failed to apply slot');
      }
    } catch {
      alert('Error applying slot');
    }
  };

  const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

  const filteredTimetables = timetables.filter((t) => {
    if (selectedClass && t.classId !== selectedClass) return false;
    if (selectedSection && t.sectionId !== selectedSection) return false;
    return true;
  });

  const currentClassObj = classes.find((c) => c.id === selectedClass);
  const classSections = currentClassObj?.sections || [];

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner */}
      <div className="bg-[#0F2A5F] text-white p-6 sm:p-8 rounded-3xl border border-[#173B7A] shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2563EB]/25 text-blue-200 text-xs font-bold border border-[#2563EB]/40">
            <Sparkles className="w-3.5 h-3.5 text-blue-300" />
            <span>Master Timetable & Conflict Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Academic Schedule & Conflict Prevention
          </h1>
          <p className="text-xs sm:text-sm text-blue-100/80 leading-relaxed">
            Centralized timetable architecture preventing teacher double-booking, room overlap, and workload violations in real-time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Button
            variant="secondary"
            size="md"
            leftIcon={<Zap className="w-4 h-4 text-[#2563EB]" />}
            onClick={() => {
              if (classes.length > 0) {
                const c = classes[0];
                setAssistantForm({
                  classId: c.id,
                  sectionId: c.sections?.[0]?.id || '',
                  subjectId: c.subjects?.[0]?.id || '',
                  requiredWeeklyPeriods: 5,
                });
                setSuggestedSlots([]);
              }
              setShowAssistantModal(true);
            }}
          >
            Scheduling Assistant
          </Button>

          <Button
            variant="primary"
            size="md"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => {
              setErrorMsg(null);
              setConflictResult({ status: null, conflicts: [], warnings: [] });
              setShowAddModal(true);
              if (classes.length > 0) {
                const firstClass = classes[0];
                setForm({
                  classId: firstClass.id,
                  sectionId: firstClass.sections?.[0]?.id || '',
                  subjectId: firstClass.subjects?.[0]?.id || '',
                  teacherId: teachers[0]?.id || '',
                  dayOfWeek: 'MONDAY',
                  startTime: '08:30',
                  endTime: '09:15',
                  roomNo: firstClass.sections?.[0]?.roomNo || 'Room 101',
                  allowOverride: false,
                });
              }
            }}
          >
            Schedule Period
          </Button>
        </div>
      </div>

      {/* Class & Section Filter Bar */}
      <Card padding="sm" className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#2563EB]" />
            <span className="text-xs font-bold text-[#0F172A]">Filter Class:</span>
          </div>

          <select
            value={selectedClass}
            onChange={(e) => {
              setSelectedClass(e.target.value);
              const c = classes.find((cls) => cls.id === e.target.value);
              setSelectedSection(c?.sections?.[0]?.id || '');
            }}
            className="px-3.5 py-1.5 text-xs rounded-xl border border-[#E2E8F0] bg-white text-[#0F172A] font-medium outline-none focus:ring-2 focus:ring-[#2563EB]"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {classSections.length > 0 && (
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="px-3.5 py-1.5 text-xs rounded-xl border border-[#E2E8F0] bg-white text-[#0F172A] font-medium outline-none focus:ring-2 focus:ring-[#2563EB]"
            >
              <option value="">All Sections</option>
              {classSections.map((s: any) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          )}
        </div>

        <span className="text-xs font-bold text-[#64748B]">
          {filteredTimetables.length} Total Weekly Period(s) Scheduled
        </span>
      </Card>

      {/* Weekly Timetable Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {days.map((day) => {
          const dayPeriods = filteredTimetables.filter((t) => t.dayOfWeek === day);

          return (
            <Card key={day} padding="sm" className="space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2.5">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-[#0F172A] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
                    <span>{day}</span>
                  </h3>
                  <span className="text-[11px] font-bold text-[#2563EB] bg-[#EFF6FF] border border-[#BFDBFE] px-2 py-0.5 rounded-full">
                    {dayPeriods.length} Periods
                  </span>
                </div>

                <div className="space-y-2 mt-3">
                  {dayPeriods.length === 0 ? (
                    <div className="p-8 text-center text-xs text-[#94A3B8]">
                      No periods scheduled for {day}
                    </div>
                  ) : (
                    dayPeriods.map((p) => (
                      <div
                        key={p.id}
                        className="p-3.5 rounded-xl bg-white border border-[#E2E8F0] hover:border-[#BFDBFE] hover:shadow-sm transition-all space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <strong className="text-xs text-[#0F172A]">{p.subject.name}</strong>
                          <span className="font-mono text-[10px] font-bold text-[#2563EB] bg-[#EFF6FF] px-2 py-0.5 rounded-md border border-[#BFDBFE]">
                            {p.startTime} - {p.endTime}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-[#475569]">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3 text-[#64748B]" />
                            <span>{p.teacher?.fullName || 'Faculty'}</span>
                          </span>
                          <span className="text-[#64748B] text-[10px]">
                            {p.section.name} • {p.roomNo || 'Room 101'}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* SCHEDULE PERIOD MODAL WITH REAL-TIME CONFLICT ENGINE */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#E2E8F0] p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#2563EB] block">
                  Intelligent Scheduling
                </span>
                <h3 className="text-lg font-black text-[#0F172A]">Schedule Class Period</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-xl bg-[#F1F5F9] text-xs font-bold text-[#64748B] hover:text-[#0F172A]"
              >
                ✕ Close
              </button>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3 bg-[#FEF2F2] border border-[#FECACA] rounded-xl text-[#DC2626] text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Live Real-Time Conflict Preview Pill */}
            <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#475569]">Conflict Engine Analysis:</span>
                {conflictChecking ? (
                  <span className="text-[11px] text-[#2563EB] animate-pulse font-bold">
                    Analyzing timetable...
                  </span>
                ) : conflictResult.status === 'AVAILABLE' ? (
                  <StatusBadge status="SUCCESS" label="STATUS: AVAILABLE" size="sm" />
                ) : conflictResult.status === 'CONFLICT' ? (
                  <StatusBadge status="DANGER" label="STATUS: CONFLICT" size="sm" pulse />
                ) : (
                  <span className="text-[11px] text-[#94A3B8]">Select parameters</span>
                )}
              </div>

              {conflictResult.conflicts.length > 0 && (
                <div className="space-y-1 pt-1 border-t border-[#E2E8F0] text-xs text-[#DC2626]">
                  {conflictResult.conflicts.map((c, i) => (
                    <p key={i} className="flex items-start gap-1.5">
                      <span>•</span>
                      <span>{c}</span>
                    </p>
                  ))}
                </div>
              )}

              {conflictResult.warnings.length > 0 && (
                <div className="space-y-1 pt-1 border-t border-[#E2E8F0] text-xs text-[#B45309]">
                  {conflictResult.warnings.map((w, i) => (
                    <p key={i} className="flex items-start gap-1.5">
                      <span>⚠</span>
                      <span>{w}</span>
                    </p>
                  ))}
                </div>
              )}
            </div>

            <form onSubmit={handleCreateEntry} className="space-y-3.5 text-xs">
              <Select
                label="Class"
                value={form.classId}
                onChange={(e) => {
                  const cId = e.target.value;
                  const cObj = classes.find((c) => c.id === cId);
                  setForm({
                    ...form,
                    classId: cId,
                    sectionId: cObj?.sections?.[0]?.id || '',
                    subjectId: cObj?.subjects?.[0]?.id || '',
                  });
                }}
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>

              <div className="grid grid-cols-2 gap-3">
                <Select
                  label="Section"
                  value={form.sectionId}
                  onChange={(e) => setForm({ ...form, sectionId: e.target.value })}
                >
                  {classes.find((c) => c.id === form.classId)?.sections?.map((sec: any) => (
                    <option key={sec.id} value={sec.id}>
                      {sec.name}
                    </option>
                  ))}
                </Select>

                <Select
                  label="Subject"
                  value={form.subjectId}
                  onChange={(e) => setForm({ ...form, subjectId: e.target.value })}
                >
                  {classes.find((c) => c.id === form.classId)?.subjects?.map((sub: any) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ))}
                </Select>
              </div>

              <Select
                label="Teacher"
                value={form.teacherId}
                onChange={(e) => setForm({ ...form, teacherId: e.target.value })}
              >
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.fullName} ({t.employeeId})
                  </option>
                ))}
              </Select>

              <div className="grid grid-cols-3 gap-2">
                <Select
                  label="Day"
                  value={form.dayOfWeek}
                  onChange={(e) => setForm({ ...form, dayOfWeek: e.target.value })}
                >
                  {days.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </Select>

                <Input
                  label="Start Time"
                  type="time"
                  value={form.startTime}
                  onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                />

                <Input
                  label="End Time"
                  type="time"
                  value={form.endTime}
                  onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                />
              </div>

              <Input
                label="Room / Hall Number"
                value={form.roomNo}
                onChange={(e) => setForm({ ...form, roomNo: e.target.value })}
              />

              {conflictResult.warnings.length > 0 && (
                <label className="flex items-center gap-2 text-xs font-bold text-[#0F172A] cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={form.allowOverride}
                    onChange={(e) => setForm({ ...form, allowOverride: e.target.checked })}
                    className="rounded border-[#E2E8F0] text-[#2563EB] focus:ring-[#2563EB]"
                  />
                  <span>Confirm Administrator Override (Audited)</span>
                </label>
              )}

              <div className="pt-3">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={conflictResult.status === 'CONFLICT' && !form.allowOverride}
                  className="w-full"
                >
                  Commit Timetable Period
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SCHEDULING ASSISTANT MODAL */}
      {showAssistantModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#E2E8F0] p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#2563EB] block">
                  Automated Scheduling Assistant
                </span>
                <h3 className="text-lg font-black text-[#0F172A]">
                  Optimal Conflict-Free Slot Recommendations
                </h3>
              </div>
              <button
                onClick={() => setShowAssistantModal(false)}
                className="p-1.5 rounded-xl bg-[#F1F5F9] text-xs font-bold text-[#64748B] hover:text-[#0F172A]"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleRunAssistant} className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Select
                  label="Class"
                  value={assistantForm.classId}
                  onChange={(e) => {
                    const cId = e.target.value;
                    const c = classes.find((cls) => cls.id === cId);
                    setAssistantForm({
                      ...assistantForm,
                      classId: cId,
                      sectionId: c?.sections?.[0]?.id || '',
                      subjectId: c?.subjects?.[0]?.id || '',
                    });
                  }}
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select>

                <Select
                  label="Section"
                  value={assistantForm.sectionId}
                  onChange={(e) => setAssistantForm({ ...assistantForm, sectionId: e.target.value })}
                >
                  {classes.find((c) => c.id === assistantForm.classId)?.sections?.map((sec: any) => (
                    <option key={sec.id} value={sec.id}>
                      {sec.name}
                    </option>
                  ))}
                </Select>

                <Select
                  label="Subject"
                  value={assistantForm.subjectId}
                  onChange={(e) => setAssistantForm({ ...assistantForm, subjectId: e.target.value })}
                >
                  {classes.find((c) => c.id === assistantForm.classId)?.subjects?.map((sub: any) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-[#64748B]">
                  Required Weekly Periods: <strong>{assistantForm.requiredWeeklyPeriods}</strong>
                </span>
                <Button type="submit" variant="primary" size="sm" isLoading={loadingSuggestions}>
                  Generate Recommendations
                </Button>
              </div>
            </form>

            {/* Suggestions list */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#475569]">
                Optimal Conflict-Free Slots ({suggestedSlots.length} found):
              </h4>

              {suggestedSlots.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#94A3B8]">
                  Click "Generate Recommendations" to find available timetable slots for qualified teachers.
                </div>
              ) : (
                <div className="space-y-2">
                  {suggestedSlots.map((slot, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-xl bg-white border border-[#E2E8F0] hover:border-[#BFDBFE] flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <strong className="text-[#0F172A]">{slot.dayOfWeek}</strong>
                          <span className="font-mono text-[10px] text-[#2563EB] bg-[#EFF6FF] px-2 py-0.5 rounded font-bold">
                            {slot.startTime} - {slot.endTime}
                          </span>
                          <span className="text-[10px] text-[#64748B]">({slot.periodLabel})</span>
                        </div>
                        <p className="text-[#475569] text-[11px]">
                          Faculty: <strong>{slot.teacherName}</strong> • {slot.roomNo}
                        </p>
                      </div>

                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => handleApplySuggestedSlot(slot)}
                      >
                        + Schedule Slot
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
