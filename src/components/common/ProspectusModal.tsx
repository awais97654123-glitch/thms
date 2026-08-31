'use client';

import React, { useState } from 'react';
import { X, Download, FileText, CheckCircle2, Sparkles, BookOpen, GraduationCap, ShieldCheck } from 'lucide-react';

interface ProspectusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProspectusModal({ isOpen, onClose }: ProspectusModalProps) {
  const [downloaded, setDownloaded] = useState(false);

  if (!isOpen) return null;

  const handleDownload = () => {
    setDownloaded(true);
    // Trigger download or opening
    const link = document.createElement('a');
    link.href = '#';
    link.onclick = (e) => {
      e.preventDefault();
      alert('The Official Hayatabad Model School Prospectus (2026-2027) is downloading.');
    };
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-navy-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-xl bg-white border border-gold-500/30 rounded-2xl shadow-2xl overflow-hidden text-slate-800 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="bg-navy-950 px-6 py-5 text-white flex items-center justify-between border-b border-gold-500/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold-500/20 border border-gold-500/40 flex items-center justify-center text-gold-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-gold-400 block">
                Official Document
              </span>
              <h3 className="font-serif text-lg font-bold text-white leading-tight">
                School Prospectus & Information Guide
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-navy-800 transition-all"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto">
          <div className="bg-gold-50/60 p-4 rounded-xl border border-gold-200 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-gold-600 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-700 space-y-1">
              <p className="font-bold text-navy-900">Academic Session 2026–2027</p>
              <p>
                Comprehensive curriculum breakdown from Playgroup through Matriculation (BISE Peshawar), fee structure, faculty credentials, co-curricular calendar, and rules of discipline.
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Prospectus Table of Contents
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-gold-600 shrink-0" />
                <span className="font-medium text-slate-800">Academic Wings & Syllabus</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-gold-600 shrink-0" />
                <span className="font-medium text-slate-800">Transparent Fee Structure</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-gold-600 shrink-0" />
                <span className="font-medium text-slate-800">Merit Scholarship Criteria</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-gold-600 shrink-0" />
                <span className="font-medium text-slate-800">BISE Matric Board Prep</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-navy-900 text-white rounded-xl border border-navy-800 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gold-400">Digital Document (PDF)</p>
              <p className="text-sm font-bold">Hayatabad_Model_School_Prospectus_2026.pdf</p>
              <p className="text-[11px] text-slate-400">4.8 MB • High Resolution</p>
            </div>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold text-navy-950 btn-gold-prestige"
            >
              <Download className="w-4 h-4" />
              <span>{downloaded ? 'Downloaded ✓' : 'Download PDF'}</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-500">Need printed copy? Visit Campus Desk</span>
          <a
            href="/admissions/apply"
            className="text-xs font-bold text-navy-900 hover:text-gold-600 transition-colors"
          >
            Go directly to Online Admission →
          </a>
        </div>
      </div>
    </div>
  );
}
