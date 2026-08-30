'use client';

import React, { useState, useEffect } from 'react';
import { Megaphone, Plus, Calendar, Sparkles } from 'lucide-react';

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetAudience, setTargetAudience] = useState('ALL');

  const loadAnnouncements = () => {
    fetch('/api/announcements')
      .then((res) => res.json())
      .then((data) => {
        if (data.announcements) setAnnouncements(data.announcements);
      })
      .catch(console.error);
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, targetAudience }),
      });
      alert('Announcement published successfully across student, teacher, and parent portals!');
      setShowAdd(false);
      setTitle('');
      setContent('');
      loadAnnouncements();
    } catch {
      alert('Error publishing announcement');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
            Campus Broadcasts
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
            School Announcements & Circulars
          </h1>
          <p className="text-xs text-slate-500">
            Publish circulars to students, parents, and teachers with target audience filters.
          </p>
        </div>

        <button
          onClick={() => setShowAdd(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>New Circular</span>
        </button>
      </div>

      {showAdd && (
        <div className="bg-white rounded-3xl p-6 border-2 border-blue-200 shadow-lg space-y-4 animate-in fade-in">
          <h3 className="font-bold text-sm text-slate-900">Publish Circular</h3>
          <form onSubmit={handleCreate} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Annual Sports & Athletic Meet 2026"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Target Audience</label>
              <select
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
              >
                <option value="ALL">All School (Students, Teachers, Parents)</option>
                <option value="STUDENTS">Students Only</option>
                <option value="TEACHERS">Faculty Only</option>
                <option value="PARENTS">Parents Only</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Circular Content</label>
              <textarea
                rows={3}
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write notice body..."
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
                className="px-6 py-2 bg-blue-600 text-white font-bold rounded-xl shadow"
              >
                Publish Circular
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {announcements.map((a) => (
          <div key={a.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-blue-600" />
                <strong className="text-slate-900 text-sm">{a.title}</strong>
              </div>
              <span className="text-[10px] font-bold bg-blue-50 text-blue-900 px-2.5 py-0.5 rounded-full">
                Target: {a.targetAudience}
              </span>
            </div>
            <p className="text-slate-600 leading-relaxed">{a.content}</p>
            <div className="pt-2 border-t text-[10px] text-slate-400">
              Published on {new Date(a.publishDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
