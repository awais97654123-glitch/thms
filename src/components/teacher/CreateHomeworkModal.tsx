'use client';

import React, { useState } from 'react';
import { X, BookOpen, Calendar, Send, Sparkles, CheckCircle2 } from 'lucide-react';

interface CreateHomeworkModalProps {
  isOpen: boolean;
  onClose: () => void;
  classId: string;
  className: string;
  sectionId: string;
  sectionName: string;
  subjects: { id: string; name: string; code: string }[];
  onSuccess: () => void;
}

export default function CreateHomeworkModal({
  isOpen,
  onClose,
  classId,
  className,
  sectionId,
  sectionName,
  subjects,
  onSuccess,
}: CreateHomeworkModalProps) {
  const [selectedSubjectId, setSelectedSubjectId] = useState(subjects[0]?.id || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubjectId || !title.trim() || !description.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/teacher/homework', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classId,
          sectionId,
          subjectId: selectedSubjectId,
          title: title.trim(),
          description: description.trim(),
          dueDate: new Date(dueDate).toISOString(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to publish homework');

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
        setTitle('');
        setDescription('');
        setSuccess(false);
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Error publishing homework');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F2A5F]/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-2xl max-w-lg w-full p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0F172A]">Publish New Homework</h3>
              <p className="text-xs text-[#64748B]">
                {className} • Section {sectionName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#94A3B8] hover:text-[#0F172A] hover:bg-[#F8FAFC]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-[#FEE2E2] text-[#DC2626] text-xs font-bold">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 rounded-xl bg-[#DCFCE7] text-[#16A34A] text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Homework published! Students and parents have been notified.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs text-[#0F172A]">
          {/* Subject Selector */}
          <div className="space-y-1">
            <label className="block font-bold">Academic Subject *</label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-[#E2E8F0] bg-white text-xs font-medium focus:ring-2 focus:ring-[#2563EB] focus:outline-none"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div className="space-y-1">
            <label className="block font-bold">Homework Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Chapter 4 Exercise 4.2 Questions 1-8"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-[#E2E8F0] text-xs focus:ring-2 focus:ring-[#2563EB] focus:outline-none"
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="block font-bold">Instructions & Problem Set Details *</label>
            <textarea
              required
              rows={3}
              placeholder="Write detailed student guidelines, required textbook pages, or submission rules..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-[#E2E8F0] text-xs focus:ring-2 focus:ring-[#2563EB] focus:outline-none"
            />
          </div>

          {/* Due Date */}
          <div className="space-y-1">
            <label className="block font-bold">Submission Deadline *</label>
            <input
              type="date"
              required
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-[#E2E8F0] text-xs focus:ring-2 focus:ring-[#2563EB] focus:outline-none"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#F1F5F9]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[#E2E8F0] text-[#475569] font-bold hover:bg-[#F8FAFC]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || success}
              className="px-5 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold flex items-center gap-2 shadow-sm disabled:opacity-50"
            >
              {loading ? (
                <span>Publishing...</span>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Publish Assignment</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
