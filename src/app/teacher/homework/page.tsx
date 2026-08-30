'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, Plus, Save, ArrowLeft, Clock, CheckCircle2, AlertCircle, Calendar } from 'lucide-react';

export default function TeacherHomeworkPage() {
  const [homeworks, setHomeworks] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const loadHomework = () => {
    fetch('/api/homework')
      .then((res) => res.json())
      .then((data) => {
        if (data.homeworks) setHomeworks(data.homeworks);
      })
      .catch(console.error);
  };

  const loadClassesAndSubjects = () => {
    fetch('/api/classes')
      .then((res) => res.json())
      .then((data) => {
        if (data.classes && data.classes.length > 0) {
          setClasses(data.classes);
          const c08 = data.classes.find((c: any) => c.code === 'C08') || data.classes[0];
          setSelectedClassId(c08.id);
          if (c08.sections && c08.sections.length > 0) {
            setSelectedSectionId(c08.sections[0].id);
          }
          if (c08.subjects && c08.subjects.length > 0) {
            setSubjects(c08.subjects);
            setSelectedSubjectId(c08.subjects[0].id);
          }
        }
      })
      .catch(console.error);
  };

  useEffect(() => {
    loadHomework();
    loadClassesAndSubjects();
  }, []);

  const handleClassChange = (cId: string) => {
    setSelectedClassId(cId);
    const selected = classes.find((c) => c.id === cId);
    if (selected) {
      if (selected.sections && selected.sections.length > 0) {
        setSelectedSectionId(selected.sections[0].id);
      }
      if (selected.subjects && selected.subjects.length > 0) {
        setSubjects(selected.subjects);
        setSelectedSubjectId(selected.subjects[0].id);
      }
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/homework', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classId: selectedClassId,
          sectionId: selectedSectionId,
          subjectId: selectedSubjectId,
          title,
          description: desc,
          dueDate,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMessage('Homework assignment published successfully! Students and parents have been notified.');
        setShowAdd(false);
        setTitle('');
        setDesc('');
        loadHomework();
      } else {
        alert(data.error || 'Failed to post homework');
      }
    } catch {
      alert('Error posting homework');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/teacher"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-emerald-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
            Curriculum & Assignments
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
            Homework & Classroom Tasks
          </h1>
          <p className="text-xs text-slate-500">
            Assign curriculum tasks with due dates. Assignments are instantly synchronized with student and parent portals.
          </p>
        </div>

        <button
          onClick={() => setShowAdd(!showAdd)}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>{showAdd ? 'Close Form' : 'Post New Homework'}</span>
        </button>
      </div>

      {message && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-900 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {showAdd && (
        <div className="bg-white rounded-3xl p-6 border-2 border-emerald-300 shadow-xl space-y-4 animate-in fade-in">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-600" />
            <span>Post New Assignment</span>
          </h3>

          <form onSubmit={handleCreate} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Class *</label>
                <select
                  value={selectedClassId}
                  onChange={(e) => handleClassChange(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 outline-none bg-white font-medium"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Subject *</label>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 outline-none bg-white font-medium"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Submission Due Date *</label>
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none bg-white font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Assignment Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Chapter 4 Exercise 4.2 — Algebraic Proofs"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 outline-none font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Instructions & Description *</label>
              <textarea
                rows={3}
                required
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Solve questions 1 through 8 in fair homework notebook..."
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAdd(false)}
                className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/30 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>{loading ? 'Publishing...' : 'Publish to Students & Parents'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Homework List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {homeworks.map((hw) => (
          <div key={hw.id} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg font-bold text-[11px] border border-emerald-200">
                {hw.class?.name || 'Class 8'} • {hw.subject?.name || 'Mathematics'}
              </span>
              <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>Due: {new Date(hw.dueDate).toLocaleDateString('en-GB')}</span>
              </span>
            </div>

            <div>
              <h3 className="font-extrabold text-sm text-slate-900">{hw.title}</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">{hw.description}</p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>Teacher: {hw.teacher?.fullName || 'Senior Faculty'}</span>
              <span className="text-emerald-600 font-bold">● Active & Published</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
