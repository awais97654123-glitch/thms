'use client';

import React from 'react';
import { X, Calendar, Tag, Sparkles, FileText, ArrowRight } from 'lucide-react';

interface NoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  notice: {
    id?: string | number;
    title: string;
    date: string;
    category?: string;
    excerpt?: string;
    content?: string;
    image?: string;
    author?: string;
  } | null;
}

export default function NoticeModal({ isOpen, onClose, notice }: NoticeModalProps) {
  if (!isOpen || !notice) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-[#0a192f]/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden text-slate-800 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
              {notice.category || 'School Notice'}
            </span>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span>{notice.date}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto flex-1 p-6 space-y-4 bg-white">
          {notice.image && (
            <div className="rounded-xl overflow-hidden aspect-[16/9] bg-slate-100 border border-slate-200">
              <img src={notice.image} alt={notice.title} className="w-full h-full object-cover" />
            </div>
          )}

          <h3 className="font-serif text-2xl font-bold text-slate-900 leading-snug">
            {notice.title}
          </h3>

          <div className="blue-hairline my-2" />

          <div className="prose prose-slate max-w-none text-sm leading-relaxed text-slate-600 space-y-3">
            <p className="font-medium text-slate-800 text-base">
              {notice.excerpt || notice.title}
            </p>
            <p>
              {notice.content ||
                'The Hayatabad Model School administration is pleased to share this official update with parents, students, and staff members. For any specific queries regarding this announcement, please reach out to the school administrative desk during working hours.'}
            </p>
            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 mt-4">
              <h5 className="font-serif text-xs font-bold uppercase tracking-wider text-blue-900 mb-2">
                Official Administration Advisory
              </h5>
              <p className="text-xs text-slate-600">
                All registered parents can also view official notifications, circulars, and student reports directly through the Parent Portal mobile application or web portal.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Issued by: {notice.author || 'HMS Office of the Principal'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white btn-blue-prestige transition-all shadow-sm"
          >
            Close Notice
          </button>
        </div>
      </div>
    </div>
  );
}
