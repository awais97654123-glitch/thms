'use client';

import React, { useState, useEffect } from 'react';
import { Clock, Plus, AlertCircle, CheckCircle2, User, Building2, BookOpen } from 'lucide-react';

export default function AdminTimetablePage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [timetables, setTimetables] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [form, setForm] = useState({
    classId: '',
    sectionId: '',
    subjectId: '',
    teacherId: '',
    dayOfWeek: 'MONDAY',
    startTime: '08:30',
    endTime: '09:15',
    roomNo: 'Room 201',
  });

  const loadData = () => {
    setLoading(true);
    fetch('/api/classes')
      .then((res) => res.json())
      .then((data) => {
        if (data.classes && data.classes.length > 0) {
          setClasses(data.classes);
          if (!selectedClass) setSelectedClass(data.classes[0].id);
        }
      })
      .catch(console.error);

    fetch('/api/teachers')
      .then((res) => res.json())
      .then((data) => {
        if (data.teachers) setTeachers(data.teachers);
      })
      .catch(console.error);

    fetch('/api/timetable')
      .then((res) => res.json())
      .then((data) => {
        if (data.timetables) setTimetables(data.timetables);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

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
        alert('Timetable period scheduled successfully without conflicts!');
        setShowAddModal(false);
        loadData();
      } else {
        setErrorMsg(data.error || 'Failed to schedule period');
      }
    } catch {
      setErrorMsg('Error submitting timetable');
    }
  };

  const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

  const filteredTimetables = selectedClass
    ? timetables.filter((t) => t.classId === selectedClass)
    : timetables;

  const currentClassObj = classes.find((c) => c.id === selectedClass);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
            Academics & Operations
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
            Weekly Timetable & Conflict Detection Engine
          </h1>
          <p className="text-xs text-slate-500">
            Smart timetable scheduler that detects teacher, room, and section overlap conflicts automatically.
          </p>
        </div>

        <button
          onClick={() => {
            setErrorMsg(null);
            setShowAddModal(true);
            if (classes.length > 0) {
              const firstClass = classes[0];
              setForm((prev) => ({
                ...prev,
                classId: firstClass.id,
                sectionId: firstClass.sections?.[0]?.id || '',
                subjectId: firstClass.subjects?.[0]?.id || '',
                teacherId: teachers[0]?.id || '',
              }));
            }
          }}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule Period</span>
        </button>
      </div>

      {/* Class Selector Filter */}
      <div className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <label className="text-xs font-bold text-slate-700">Select Class Timetable:</label>
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white font-medium outline-none focus:ring-2 focus:ring-blue-500"
        >
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Timetable Grid View by Days */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {days.slice(0, 5).map((day) => {
          const dayPeriods = filteredTimetables.filter((t) => t.dayOfWeek === day);
          return (
            <div key={day} className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900">{day}</h3>
                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                  {dayPeriods.length} Periods
                </span>
              </div>

              <div className="space-y-2">
                {dayPeriods.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">No periods scheduled</p>
                ) : (
                  dayPeriods.map((p) => (
                    <div key={p.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <strong className="text-slate-900">{p.subject.name}</strong>
                        <span className="font-mono text-[10px] font-bold text-blue-900 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                          {p.startTime} - {p.endTime}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-400" />
                        <span>{p.teacher?.fullName || 'Teacher'}</span>
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {p.section.name} • {p.roomNo || 'Room'}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Schedule Period Modal with Conflict Protection */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-sm text-slate-900">Schedule Class Period</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg bg-slate-100 text-xs font-bold text-slate-600"
              >
                ✕
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-900 text-xs flex items-start gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreateEntry} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Class</label>
                <select
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
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Subject</label>
                  <select
                    value={form.subjectId}
                    onChange={(e) => setForm({ ...form, subjectId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                  >
                    {currentClassObj?.subjects?.map((s: any) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Teacher</label>
                  <select
                    value={form.teacherId}
                    onChange={(e) => setForm({ ...form, teacherId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                  >
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.fullName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Day</label>
                  <select
                    value={form.dayOfWeek}
                    onChange={(e) => setForm({ ...form, dayOfWeek: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                  >
                    {days.slice(0, 5).map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={form.startTime}
                    onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                    className="w-full px-2 py-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">End Time</label>
                  <input
                    type="time"
                    value={form.endTime}
                    onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                    className="w-full px-2 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Room No</label>
                <input
                  type="text"
                  value={form.roomNo}
                  onChange={(e) => setForm({ ...form, roomNo: e.target.value })}
                  placeholder="e.g. Room 201"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow mt-2"
              >
                Save Schedule (With Conflict Check)
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
