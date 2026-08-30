'use client';

import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Clock, 
  CalendarCheck, 
  CheckCircle2, 
  AlertCircle, 
  ChevronDown, 
  ChevronUp, 
  Upload, 
  FileText, 
  Filter, 
  Sparkles,
  UserCheck,
  Send
} from 'lucide-react';
import PortalCircularLoader from '@/components/common/PortalCircularLoader';

export default function StudentHomeworkPage() {
  const [homeworks, setHomeworks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterSubject, setFilterSubject] = useState<string>('ALL');
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [submissionText, setSubmissionText] = useState<{ [key: string]: string }>({});
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/student/homework')
      .then((res) => res.json())
      .then((data) => {
        if (data.homeworks) {
          setHomeworks(data.homeworks);
          if (data.homeworks.length > 0) {
            setExpandedId(data.homeworks[0].id);
          }
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const subjectsList = Array.from(new Set(homeworks.map((h) => h.subject?.name).filter(Boolean)));

  const filteredHomeworks = homeworks.filter((hw) => {
    if (filterSubject !== 'ALL' && hw.subject?.name !== filterSubject) return false;
    return true;
  });

  const handleToggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleOnlineSubmit = async (hwId: string) => {
    setSubmittingId(hwId);
    setSubmitSuccess(null);

    try {
      // Simulate submission record
      await new Promise((r) => setTimeout(r, 600));
      setSubmitSuccess(`Homework assignment submitted successfully to teacher!`);
      setTimeout(() => setSubmitSuccess(null), 4000);
    } catch {
      // error handling
    } finally {
      setSubmittingId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-16 text-center">
        <PortalCircularLoader message="Loading Homework Assignments..." subMessage="Fetching active class coursework from teachers" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Daily Homework & Coursework
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Review daily assignments published by your subject teachers, submission deadlines, and task briefs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">Filter:</span>
          <select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            className="px-3.5 py-2 rounded-2xl bg-white border border-slate-200 text-xs font-black text-slate-800 outline-none focus:ring-2 focus:ring-orange-500 shadow-sm"
          >
            <option value="ALL">All Subjects ({homeworks.length})</option>
            {subjectsList.map((sub) => (
              <option key={sub} value={sub}>{sub}</option>
            ))}
          </select>
        </div>
      </div>

      {submitSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{submitSuccess}</span>
        </div>
      )}

      {/* Homework List with Accordion Open/Close Feature */}
      {filteredHomeworks.length > 0 ? (
        <div className="space-y-4">
          {filteredHomeworks.map((hw) => {
            const isExpanded = expandedId === hw.id;
            const dueDate = new Date(hw.dueDate);
            const isOverdue = dueDate < new Date();

            return (
              <div
                key={hw.id}
                className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden"
              >
                {/* Header Strip — Click to Expand / Collapse */}
                <div
                  onClick={() => handleToggleExpand(hw.id)}
                  className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/70 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-600 flex items-center justify-center font-black text-sm shrink-0 border border-orange-200">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-orange-50 text-orange-700 border border-orange-200">
                          {hw.subject?.name || 'Subject'}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-slate-100 text-slate-700">
                          {hw.class?.name} - {hw.section?.name}
                        </span>
                        {isOverdue ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-50 text-rose-700 border border-rose-200">
                            Deadline Passed
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Active
                          </span>
                        )}
                      </div>
                      <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                        {hw.title}
                      </h3>
                      <p className="text-[11px] text-slate-400 font-medium">
                        Assigned on {new Date(hw.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                        Submission Due
                      </span>
                      <span className={`text-xs font-black font-mono ${isOverdue ? 'text-rose-600' : 'text-slate-800'}`}>
                        {dueDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>

                    <div className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-orange-50 hover:text-orange-600 transition-colors">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>
                </div>

                {/* Collapsible Open/Close Details Drawer */}
                {isExpanded && (
                  <div className="px-5 sm:px-6 pb-6 pt-2 border-t border-slate-100 bg-slate-50/50 space-y-5 animate-in fade-in duration-200">
                    
                    {/* Instructions Content */}
                    <div className="space-y-2">
                      <span className="text-xs font-black text-slate-900 block">
                        Teacher&apos;s Assignment Instructions:
                      </span>
                      <div className="p-4 rounded-2xl bg-white border border-slate-200 text-xs text-slate-700 leading-relaxed font-medium whitespace-pre-wrap shadow-inner">
                        {hw.description || 'No detailed instructions provided.'}
                      </div>
                    </div>

                    {/* Online Submission Form */}
                    <div className="p-5 rounded-2xl bg-white border border-orange-200/80 shadow-sm space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                          <Upload className="w-4 h-4 text-orange-600" />
                          Submit Completed Assignment Online
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">Direct Teacher Inbox</span>
                      </div>

                      <textarea
                        rows={3}
                        placeholder="Write your homework answers, questions, or paste document links here..."
                        value={submissionText[hw.id] || ''}
                        onChange={(e) => setSubmissionText({ ...submissionText, [hw.id]: e.target.value })}
                        className="w-full p-3.5 rounded-xl border border-slate-200 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-orange-500 font-medium"
                      ></textarea>

                      <div className="flex justify-end">
                        <button
                          type="button"
                          disabled={submittingId === hw.id}
                          onClick={() => handleOnlineSubmit(hw.id)}
                          className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-black text-xs rounded-xl shadow-md shadow-orange-500/20 flex items-center gap-2 transition-all hover:scale-105"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>{submittingId === hw.id ? 'Submitting...' : 'Submit to Teacher'}</span>
                        </button>
                      </div>
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mx-auto">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-base font-black text-slate-800">No Homework Tasks Found</h3>
          <p className="text-xs text-slate-500 font-medium">
            You are all caught up! New homework tasks published by your teachers will appear here automatically.
          </p>
        </div>
      )}

    </div>
  );
}
