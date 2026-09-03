'use client';

import React, { useState } from 'react';
import { X, FolderOpen, FileText, CheckCircle2 } from 'lucide-react';

interface UploadStudyMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  classId: string;
  subjects: { id: string; name: string }[];
  onSuccess: () => void;
}

export default function UploadStudyMaterialModal({
  isOpen,
  onClose,
  classId,
  subjects,
  onSuccess,
}: UploadStudyMaterialModalProps) {
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [topic, setTopic] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [fileType, setFileType] = useState('PDF');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !fileUrl.trim()) {
      setError('Title and File URL are required');
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
      const res = await fetch('/api/teacher/study-material', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classId,
          subjectId: resolvedSubjectId,
          title: title.trim(),
          description: description.trim() || undefined,
          topic: topic.trim() || undefined,
          fileUrl: fileUrl.trim(),
          fileType,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to upload material');

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
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 text-[#2563EB] flex items-center justify-center shrink-0">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 font-serif">Upload Study Material</h3>
              <p className="text-xs text-slate-500 font-medium">
                Share notes, worksheets, past papers, or reference PDFs with this class.
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
              Document / Note Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Organic Chemistry Lecture Notes Handout"
              className="w-full p-3 rounded-2xl border border-slate-200 font-medium focus:ring-2 focus:ring-[#2563EB] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block font-bold text-slate-700">Topic / Chapter</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Unit 3: Hydrocarbons"
                className="w-full p-3 rounded-2xl border border-slate-200 font-medium focus:ring-2 focus:ring-[#2563EB] focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="block font-bold text-slate-700">File Type</label>
              <select
                value={fileType}
                onChange={(e) => setFileType(e.target.value)}
                className="w-full p-3 rounded-2xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-[#2563EB] focus:outline-none"
              >
                <option value="PDF">PDF Document</option>
                <option value="DOCX">Word Document (.docx)</option>
                <option value="PPTX">Presentation (.pptx)</option>
                <option value="VIDEO">Video Lecture Link</option>
                <option value="LINK">External Resource Link</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block font-bold text-slate-700">
              File URL / Document Link <span className="text-rose-500">*</span>
            </label>
            <input
              type="url"
              required
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
              placeholder="https://.../notes.pdf"
              className="w-full p-3 rounded-2xl border border-slate-200 font-medium focus:ring-2 focus:ring-[#2563EB] focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="block font-bold text-slate-700">Description / Reading Guide</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional notes for students studying this material..."
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
              <span>{submitting ? 'Uploading...' : 'Save & Share'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
