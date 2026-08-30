'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FileText, 
  Plus, 
  Send, 
  Calendar, 
  Users, 
  CheckCircle2, 
  Clock, 
  Sparkles,
  BookOpen,
  Mail,
  AlertCircle
} from 'lucide-react';
import PortalCircularLoader from '@/components/common/PortalCircularLoader';

export default function TeacherHomeworkPage() {
  const [assignedClasses, setAssignedClasses] = useState<any[]>([]);
  const [homeworks, setHomeworks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Homework Form State
  const [formData, setFormData] = useState({
    classId: '',
    sectionId: '',
    subjectId: '',
    title: '',
    description: '',
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch assigned classes
      const classRes = await fetch('/api/teacher/classes');
      const classData = await classRes.json();
      if (classData.assignedClasses && classData.assignedClasses.length > 0) {
        setAssignedClasses(classData.assignedClasses);
        const firstCls = classData.assignedClasses[0];
        const firstSec = firstCls.sections[0];
        const firstSub = firstSec?.subjects[0];
        setFormData((prev) => ({
          ...prev,
          classId: firstCls.id,
          sectionId: firstSec?.id || '',
          subjectId: firstSub?.id || '',
        }));
      }

      // 2. Fetch homework list
      const hwRes = await fetch('/api/teacher/homework');
      const hwData = await hwRes.json();
      if (hwData.homeworks) setHomeworks(hwData.homeworks);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePublishHomework = async (e: React.FormEvent) => {
    e.preventDefault();
    setPublishing(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/teacher/homework', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMessage({ text: data.message || 'Homework published successfully!', type: 'success' });
        setShowModal(false);
        setFormData((prev) => ({ ...prev, title: '', description: '' }));
        fetchData();
      } else {
        setStatusMessage({ text: data.error || 'Failed to publish homework', type: 'error' });
      }
    } catch {
      setStatusMessage({ text: 'Error publishing homework', type: 'error' });
    } finally {
      setPublishing(false);
    }
  };

  const selectedClass = assignedClasses.find((c) => c.id === formData.classId);
  const availableSections = selectedClass?.sections || [];
  const selectedSection = availableSections.find((s: any) => s.id === formData.sectionId);
  const availableSubjects = selectedSection?.subjects || [];

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-white shadow-sm">
        <div className="space-y-1">
          <span className="text-xs font-black uppercase tracking-wider text-orange-600">
            Academic Assignments & Task Manager
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            Teacher Homework Portal
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Publish curriculum tasks with automatic dispatch to student portals, parent accounts, and email notifications.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white text-xs font-black flex items-center gap-2 shadow-lg shadow-orange-500/25 transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create Homework</span>
        </button>
      </div>

      {/* Status Alert Banner */}
      {statusMessage && (
        <div className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-2.5 ${
          statusMessage.type === 'success'
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
            : 'bg-rose-50 text-rose-800 border-rose-200'
        }`}>
          {statusMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Homework List Table / Cards */}
      <div className="space-y-4">
        <h3 className="text-base font-black text-slate-900">Published Homework Archive</h3>

        {loading ? (
          <div className="glass-panel p-12 rounded-3xl border border-white text-center">
            <PortalCircularLoader message="Loading homework assignments from PostgreSQL..." />
          </div>
        ) : homeworks.length === 0 ? (
          <div className="glass-panel p-12 rounded-3xl border border-white text-center space-y-2">
            <FileText className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-xs font-bold text-slate-700">No homework posted yet</p>
            <p className="text-[11px] text-slate-400">Click &quot;Create Homework&quot; to publish your first assignment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {homeworks.map((hw) => (
              <div key={hw.id} className="glass-panel p-6 rounded-3xl border border-white shadow-sm space-y-4 flex flex-col justify-between">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-orange-50 text-orange-700 border border-orange-200">
                      {hw.subjectName}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Due: {new Date(hw.dueDate).toLocaleDateString('en-GB')}
                    </span>
                  </div>

                  <h4 className="font-black text-sm text-slate-900 leading-snug">{hw.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 bg-slate-50 p-3 rounded-2xl border border-slate-100 font-medium">
                    {hw.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                  <span>Class: <strong className="text-slate-800">{hw.className} ({hw.sectionName})</strong></span>
                  <span className="text-emerald-600 font-bold">{hw.submissionsCount} Submissions</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CREATE HOMEWORK MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] uppercase font-black text-orange-600 block">
                  Publish Academic Assignment
                </span>
                <h3 className="text-xl font-black text-slate-900">
                  New Homework
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition-colors"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handlePublishHomework} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-900 mb-1">Class</label>
                  <select
                    value={formData.classId}
                    onChange={(e) => {
                      const newCId = e.target.value;
                      const cls = assignedClasses.find((c) => c.id === newCId);
                      const sec = cls?.sections?.[0];
                      setFormData({
                        ...formData,
                        classId: newCId,
                        sectionId: sec?.id || '',
                        subjectId: sec?.subjects?.[0]?.id || '',
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-orange-500 outline-none"
                  >
                    {assignedClasses.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-900 mb-1">Section</label>
                  <select
                    value={formData.sectionId}
                    onChange={(e) => {
                      const newSecId = e.target.value;
                      const sec = availableSections.find((s: any) => s.id === newSecId);
                      setFormData({
                        ...formData,
                        sectionId: newSecId,
                        subjectId: sec?.subjects?.[0]?.id || '',
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-orange-500 outline-none"
                  >
                    {availableSections.map((sec: any) => (
                      <option key={sec.id} value={sec.id}>{sec.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-900 mb-1">Subject</label>
                  <select
                    value={formData.subjectId}
                    onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-orange-500 outline-none"
                  >
                    {availableSubjects.map((sub: any) => (
                      <option key={sub.id} value={sub.id}>{sub.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-900 mb-1">Homework Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chapter 4 — Exercise 4.2 Proofs"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 outline-none font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-900 mb-1">Instructions & Problem Details *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Write clear instructions, questions, or textbook page numbers for students..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 outline-none font-medium leading-relaxed"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-900 mb-1">Submission Deadline (Due Date)</label>
                <input
                  type="date"
                  required
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 outline-none font-mono font-bold text-slate-800"
                />
              </div>

              <button
                type="submit"
                disabled={publishing}
                className="w-full py-3.5 bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-black text-xs rounded-2xl shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{publishing ? 'Publishing & Dispatching Email...' : 'Publish to Student & Parent Portals'}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {publishing && <PortalCircularLoader isFullScreen message="Publishing Homework & Dispatching Resend Alerts..." />}
    </div>
  );
}
