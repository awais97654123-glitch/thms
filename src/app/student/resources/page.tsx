'use client';

import React, { useState } from 'react';
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
  FileCheck
} from 'lucide-react';

export default function StudentResourcesPage() {
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'ALL', name: 'All Resources' },
    { id: 'TEXTBOOK', name: 'E-Textbooks' },
    { id: 'NOTES', name: 'Revision Notes' },
    { id: 'PAST_PAPER', name: 'BISE Past Papers' },
    { id: 'FORMULA', name: 'Formula Cheat Sheets' },
  ];

  const resources = [
    {
      id: '1',
      title: 'Mathematics Grade 8 & 9 Complete Formula Sheet',
      subject: 'Mathematics',
      category: 'FORMULA',
      size: '2.4 MB PDF',
      downloads: 480,
      desc: 'Algebraic identities, geometric theorems, quadratic roots, and trigonometry quick reference tables.',
    },
    {
      id: '2',
      title: 'Physics Chapter 1 to 5 Comprehensive Notes',
      subject: 'Physics',
      category: 'NOTES',
      size: '4.1 MB PDF',
      downloads: 390,
      desc: 'Kinematics, dynamics, gravitation, work & energy solved numericals and labeled diagrams.',
    },
    {
      id: '3',
      title: 'BISE Peshawar Board 5-Year Solved Past Papers',
      subject: 'All Subjects',
      category: 'PAST_PAPER',
      size: '12.8 MB PDF',
      downloads: 820,
      desc: 'Model papers and annual BISE Peshawar board examinations with official marking keys.',
    },
    {
      id: '4',
      title: 'Chemistry Laboratory Manual & Reaction Equations',
      subject: 'Chemistry',
      category: 'TEXTBOOK',
      size: '5.6 MB PDF',
      downloads: 310,
      desc: 'Standard laboratory procedures, chemical apparatus guide, and balanced chemical equations.',
    },
    {
      id: '5',
      title: 'Computer Science Python & Logic Gates Handbook',
      subject: 'Computer Science',
      category: 'NOTES',
      size: '3.2 MB PDF',
      downloads: 450,
      desc: 'Basic syntax, loops, data structures, truth tables, and Boolean algebra rules.',
    },
    {
      id: '6',
      title: 'English Grammar, Essays & Letter Formats Guide',
      subject: 'English',
      category: 'NOTES',
      size: '3.8 MB PDF',
      downloads: 510,
      desc: 'Active/passive voice, direct/indirect speech, formal letter templates, and high-scoring essays.',
    },
  ];

  const filtered = resources.filter((r) => {
    if (activeCategory !== 'ALL' && r.category !== activeCategory) return false;
    if (searchQuery && !r.title.toLowerCase().includes(searchQuery.toLowerCase()) && !r.subject.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleDownload = (title: string) => {
    alert(`Downloading verified academic material: "${title}"`);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Digital Study Library & Syllabus Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Download verified curriculum e-books, chapter revision notes, formula sheets, and BISE past papers.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search notes, formulas, past papers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs font-medium text-slate-900 outline-none focus:ring-2 focus:ring-orange-500 shadow-sm"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black shrink-0 transition-all ${
              activeCategory === cat.id
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-white text-slate-700 hover:bg-orange-50 border border-slate-200'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Resources Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((res) => (
          <div
            key={res.id}
            className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg transition-all space-y-4 flex flex-col justify-between group"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-orange-50 text-orange-700 border border-orange-200">
                  {res.subject}
                </span>
                <span className="text-[10px] font-mono text-slate-400 font-bold">
                  {res.size}
                </span>
              </div>

              <h3 className="font-black text-sm text-slate-900 leading-snug group-hover:text-orange-600 transition-colors">
                {res.title}
              </h3>

              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                {res.desc}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-medium font-mono">
                {res.downloads} downloads
              </span>
              <button
                onClick={() => handleDownload(res.title)}
                className="px-4 py-2 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 font-black text-xs border border-orange-200 flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
