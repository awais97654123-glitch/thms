'use client';

import React, { useState } from 'react';
import { X, Award, Calendar, Clock, FileText, CheckCircle2 } from 'lucide-react';

interface CreateClassTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  classId: string;
  sectionId: string;
  subjects: { id: string; name: string }[];
  onSuccess: () => void;
}

export default function CreateClassTestModal({
  isOpen,
  onClose,
  classId,
  sectionId,
  subjects,
  onSuccess,
}: CreateClassTestModalProps) {
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [testDate, setTestDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('09:00');
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [totalMarks, setTotalMarks] = useState(25);
  const [passingMarks, setPassingMarks] = useState(10);
  const [paperUrl, setPaperUrl] = useState('');
  const [instructions, setInstructions] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Test title is required');
      return;
    }
    const resolvedSubjectId = subjectId || subjects[0]?.id;
    if (!resolvedSubjectId) {
      setError('Subject is required');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/teacher/tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classId,
          sectionId,
          subjectId: resolvedSubjectId,
          title: title.trim(),
          description: description.trim() || undefined,
          testDate,
          startTime,
          durationMinutes: Number(durationMinutes),
          totalMarks: Number(totalMarks),
          passingMarks: Number(passingMarks),
          paperUrl: paperUrl.trim() || undefined,
          instructions: instructions.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create test');

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 text-[#2563EB] flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 font-serif">Schedule Class Test</h3>
              <p className="text-xs text-slate-500 font-medium">
                Publish a test with date, time limits, total marks, and paper attachments.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 text-rose-800 text-xs font-bold border border-rose-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="block font-bold text-slate-700">Subject</label>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="w-full p-3 rounded-2xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-[#2563EB] focus:outline-none"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block font-bold text-slate-700">
              Test Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Chapter 4: Quadratic Equations Quiz"
              className="w-full p-3 rounded-2xl border border-slate-200 font-medium focus:ring-2 focus:ring-[#2563EB] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block font-bold text-slate-700">Test Date</label>
              <input
                type="date"
                required
                value={testDate}
                onChange={(e) => setTestDate(e.target.value)}
                className="w-full p-3 rounded-2xl border border-slate-200 font-medium focus:ring-2 focus:ring-[#2563EB] focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="block font-bold text-slate-700">Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full p-3 rounded-2xl border border-slate-200 font-medium focus:ring-2 focus:ring-[#2563EB] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="block font-bold text-slate-700">Duration (Mins)</label>
              <input
                type="number"
                min="10"
                max="180"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(parseInt(e.target.value, 10) || 45)}
                className="w-full p-3 rounded-2xl border border-slate-200 font-medium focus:ring-2 focus:ring-[#2563EB] focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="block font-bold text-slate-700">Total Marks</label>
              <input
                type="number"
                min="5"
                max="100"
                value={totalMarks}
                onChange={(e) => setTotalMarks(parseInt(e.target.value, 10) || 25)}
                className="w-full p-3 rounded-2xl border border-slate-200 font-medium focus:ring-2 focus:ring-[#2563EB] focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="block font-bold text-slate-700">Passing Marks</label>
              <input
                type="number"
                min="1"
                max="100"
                value={passingMarks}
                onChange={(e) => setPassingMarks(parseInt(e.target.value, 10) || 10)}
                className="w-full p-3 rounded-2xl border border-slate-200 font-medium focus:ring-2 focus:ring-[#2563EB] focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block font-bold text-slate-700">Question Paper / Worksheet URL (Optional)</label>
            <input
              type="url"
              value={paperUrl}
              onChange={(e) => setPaperUrl(e.target.value)}
              placeholder="https://.../quiz-paper.pdf"
              className="w-full p-3 rounded-2xl border border-slate-200 font-medium focus:ring-2 focus:ring-[#2563EB] focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="block font-bold text-slate-700">Instructions for Students</label>
            <textarea
              rows={2}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="e.g. Calculators allowed. All questions compulsory."
              className="w-full p-3 rounded-2xl border border-slate-200 font-medium focus:ring-2 focus:ring-[#2563EB] focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold shadow-md transition-all disabled:opacity-50 flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{submitting ? 'Publishing...' : 'Publish Test'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
