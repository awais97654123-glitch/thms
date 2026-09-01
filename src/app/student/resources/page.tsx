'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  BookOpen, 
  Download, 
  FileText, 
  Folder, 
  Search, 
  Sparkles, 
  ExternalLink, 
  CheckCircle2, 
  Layers,
  FileCheck,
  RefreshCw,
  Loader2,
  ArrowLeft
} from 'lucide-react';

export default function StudentResourcesPage() {
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'ALL', name: 'All Resources' },
    { id: 'PDF', name: 'Curriculum PDFs' },
    { id: 'NOTES', name: 'Revision Notes' },
    { id: 'PAST_PAPER', name: 'BISE Past Papers' },
    { id: 'FORMULA', name: 'Formula Cheat Sheets' },
  ];

  const fetchMaterials = () => {
    setLoading(true);
    let url = `/api/student/resources?category=${activeCategory}`;
    if (searchQuery) url += `&q=${encodeURIComponent(searchQuery)}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.materials) setMaterials(data.materials);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMaterials();
  }, [activeCategory]);

  const handleDownload = (material: any) => {
    alert(`Downloading verified curriculum material: "${material.title}"`);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 bg-[#ffffff] text-slate-900 pb-16">
      
      {/* Back link */}
      <div>
        <Link
          href="/student"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Student Portal</span>
        </Link>
      </div>

      {/* Top Header Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-[#0a192f] text-white p-8 sm:p-10 shadow-2xl border border-blue-900/40">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-600/25 text-blue-300 text-xs font-bold border border-blue-500/40 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
              <span>Digital Curriculum Hub • Session 2026-2027</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white font-serif">
              Digital Study Library & Syllabus Hub
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
              Download verified curriculum e-textbooks, chapter revision notes, formula sheets, and BISE past papers uploaded by your faculty teachers.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search notes, formulas, topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchMaterials()}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl bg-white/10 text-white placeholder:text-slate-400 border border-white/20 text-xs font-medium outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold shrink-0 transition-all ${
                activeCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <button
          onClick={fetchMaterials}
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Materials Cards Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 space-y-2">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
          <p className="text-xs">Loading verified academic resources...</p>
        </div>
      ) : materials.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-xs text-slate-400 space-y-3">
          <BookOpen className="w-10 h-10 mx-auto text-slate-300" />
          <h4 className="font-bold text-sm text-slate-700">No study materials found</h4>
          <p>Curriculum notes will appear here once uploaded by subject faculty.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {materials.map((res) => (
            <div
              key={res.id}
              className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                    {res.subject?.name || 'General Curriculum'}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 font-bold bg-slate-100 px-2 py-0.5 rounded">
                    {res.fileType || 'PDF'}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-slate-900 leading-snug">
                  {res.title}
                </h3>

                <p className="text-xs text-slate-500 leading-relaxed">
                  {res.description || res.topic}
                </p>

                {res.teacher && (
                  <div className="text-[11px] text-slate-400">
                    Faculty: <strong className="text-slate-700">{res.teacher.fullName}</strong>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-mono">
                  {new Date(res.createdAt).toLocaleDateString('en-GB')}
                </span>
                <button
                  onClick={() => handleDownload(res)}
                  className="px-4 py-2 rounded-xl btn-blue-prestige text-white font-bold text-xs shadow flex items-center gap-1.5 transition-all hover:scale-105"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Material</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
