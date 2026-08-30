'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, Plus, Save, ArrowLeft, Clock, CheckCircle2 } from 'lucide-react';

export default function TeacherHomeworkPage() {
  const [homeworks, setHomeworks] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [loading, setLoading] = useState(false);

  const loadHomework = () => {
    fetch('/api/homework')
      .then((res) => res.json())
      .then((data) => {
        if (data.homeworks) setHomeworks(data.homeworks);
      })
      .catch(console.error);
  };

  useEffect(() => {
    loadHomework();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/homework', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classId: 'class-8-id',
          sectionId: 'section-8a-id',
          subjectId: 'math-8-id',
          title,
          description: desc,
        }),
      });
      alert('Homework posted successfully to student and parent portals!');
      setShowAdd(false);
      setTitle('');
      setDesc('');
      loadHomework();
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
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
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
            Assign homework with due dates and review student submissions.
          </p>
        </div>

        <button
          onClick={() => setShowAdd(true)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Post New Homework</span>
        </button>
      </div>

      {showAdd && (
        <div className="bg-white rounded-3xl p-6 border-2 border-emerald-200 shadow-lg space-y-4 animate-in fade-in">
          <h3 className="font-bold text-sm text-slate-900">Post Homework Assignment</h3>
          <form onSubmit={handleCreate} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Chapter 4 Exercise 4.2"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Description & Instructions</label>
              <textarea
                rows={3}
                required
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Provide task details for students..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setShowAdd(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-emerald-600 text-white font-bold rounded-xl shadow"
              >
                Post to Class
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {homeworks.map((hw) => (
          <div key={hw.id} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <strong className="text-slate-900 text-sm">{hw.title}</strong>
              <span className="text-[10px] font-bold bg-blue-50 text-blue-900 px-2 py-0.5 rounded">
                {hw.subject?.name}
              </span>
            </div>
            <p className="text-slate-600 leading-relaxed">{hw.description}</p>
            <div className="pt-2 border-t text-[11px] text-slate-500 flex justify-between">
              <span>Class: {hw.class?.name} ({hw.section?.name})</span>
              <span className="text-red-600 font-semibold">Due: {new Date(hw.dueDate).toLocaleDateString('en-GB')}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
