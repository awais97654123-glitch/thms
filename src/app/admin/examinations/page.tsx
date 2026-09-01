'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  CalendarCheck, 
  Award, 
  Plus, 
  Clock, 
  Printer, 
  BookOpen, 
  School, 
  CheckCircle2, 
  FileText, 
  Sparkles,
  Calendar,
  Layers,
  Loader2,
  AlertCircle,
  X
} from 'lucide-react';

export default function AdminExaminationsPage() {
  const [exams, setExams] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Form State
  const [examForm, setExamForm] = useState({
    name: 'Mid-Term Examinations 2026',
    term: 'MID_TERM',
    startDate: '2026-10-15',
    endDate: '2026-10-25',
    status: 'SCHEDULED',
    schedules: [
      { classId: '', sectionId: '', subjectId: '', subjectName: 'Mathematics', examDate: '2026-10-15', startTime: '09:00 AM', endTime: '12:00 PM', roomNo: 'Main Exam Hall', totalMarks: 100, passingMarks: 33 },
      { classId: '', sectionId: '', subjectId: '', subjectName: 'Physics / General Science', examDate: '2026-10-17', startTime: '09:00 AM', endTime: '12:00 PM', roomNo: 'Main Exam Hall', totalMarks: 100, passingMarks: 33 },
      { classId: '', sectionId: '', subjectId: '', subjectName: 'English Literature', examDate: '2026-10-19', startTime: '09:00 AM', endTime: '12:00 PM', roomNo: 'Hall B', totalMarks: 100, passingMarks: 33 },
      { classId: '', sectionId: '', subjectId: '', subjectName: 'Urdu & Islamiat', examDate: '2026-10-22', startTime: '09:00 AM', endTime: '12:00 PM', roomNo: 'Hall B', totalMarks: 100, passingMarks: 33 },
    ]
  });

  const fetchExams = () => {
    setLoading(true);
    fetch('/api/examinations')
      .then((res) => res.json())
      .then((data) => {
        if (data.exams) setExams(data.exams);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchExams();
    fetch('/api/classes')
      .then((res) => res.json())
      .then((data) => {
        if (data.classes) {
          setClasses(data.classes);
          // Set default classId & sectionId for schedules
          if (data.classes.length > 0) {
            const firstCls = data.classes[0];
            const firstSec = firstCls.sections?.[0]?.id || '';
            const firstSubj = firstCls.subjects?.[0]?.id || '';
            setExamForm((prev) => ({
              ...prev,
              schedules: prev.schedules.map((s, idx) => ({
                ...s,
                classId: firstCls.id,
                sectionId: firstSec,
                subjectId: firstCls.subjects?.[idx]?.id || firstSubj || firstCls.id,
              })),
            }));
          }
        }
      })
      .catch(console.error);
  }, []);

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch('/api/examinations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(examForm),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMessage({ text: 'Examination Session & Date Sheet created successfully!', type: 'success' });
        fetchExams();
        setTimeout(() => setIsModalOpen(false), 1200);
      } else {
        setMessage({ text: data.error || 'Failed to create exam schedule.', type: 'error' });
      }
    } catch (err: any) {
      setMessage({ text: err?.message || 'Network error.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
        <div className="space-y-1">
          <span className="text-xs font-black uppercase tracking-wider text-blue-600">
            Examinations & Assessment Registry
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            Exam Sessions & Paper Date Sheet Control Desk
          </h1>
          <p className="text-xs text-slate-500 font-medium max-w-2xl">
            Schedule official Mid-Term, Final Term, and Pre-Board exam sessions, configure paper date sheets, and manage marks entry matrix.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-md shadow-blue-500/25 flex items-center gap-1.5 transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>+ Schedule Exam Session</span>
          </button>
          <Link
            href="/admin/examinations/marks"
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5 transition-colors"
          >
            <Award className="w-4 h-4 text-amber-400" />
            <span>Marks Entry Matrix</span>
          </Link>
        </div>
      </div>

      {/* Exam Sessions List */}
      <div className="space-y-6">
        {loading ? (
          <div className="p-16 text-center text-slate-500 text-xs flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <span>Loading Examination Schedules...</span>
          </div>
        ) : exams.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <CalendarCheck className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">No Exam Sessions Scheduled Yet</h3>
            <p className="text-xs text-slate-400">Click below to create your first official paper schedule.</p>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl shadow"
            >
              + Create First Exam Session
            </button>
          </div>
        ) : (
          exams.map((exam) => (
            <div key={exam.id} className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-sm space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-slate-900 text-base sm:text-lg">{exam.name}</h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-50 text-blue-800 border border-blue-200">
                      Term: {exam.term.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    Session: <strong>{exam.session?.name || '2026-2027'}</strong> • Timeline: {new Date(exam.startDate).toLocaleDateString('en-GB')} – {new Date(exam.endDate).toLocaleDateString('en-GB')}
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-800 font-bold text-xs rounded-full border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{exam.status}</span>
                  </span>
                  <Link
                    href="/admin/examinations/marks"
                    className="px-3.5 py-1.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-colors"
                  >
                    Enter Marks
                  </Link>
                </div>
              </div>

              {/* Schedules Grid */}
              <div className="space-y-3">
                <span className="text-[10px] uppercase font-black tracking-wider text-blue-900 block">
                  Official Examination Date Sheet & Hall Schedules:
                </span>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
                  {exam.schedules?.map((sch: any) => (
                    <div key={sch.id} className="p-4 rounded-2xl bg-slate-50 hover:bg-blue-50/40 border border-slate-200 transition-colors space-y-2">
                      <div className="flex justify-between items-start">
                        <strong className="text-slate-900 text-sm font-bold block">{sch.subject?.name || 'Subject'}</strong>
                        <span className="font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 text-[10px]">
                          {sch.class?.name || 'Class 8'} ({sch.section?.name || 'Sec A'})
                        </span>
                      </div>
                      
                      <div className="space-y-0.5 text-[11px] text-slate-600">
                        <p className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>Date: <strong className="text-slate-900">{new Date(sch.examDate).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}</strong></span>
                        </p>
                        <p>Time: <strong className="font-mono text-slate-800">{sch.startTime} - {sch.endTime}</strong> ({sch.roomNo})</p>
                      </div>

                      <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-200">
                        <span>Total: {sch.totalMarks} Marks</span>
                        <span className="text-emerald-700 font-bold">Pass: {sch.passingMarks} Marks</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Schedule Exam Session Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 sm:p-8 space-y-5">
            
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="text-[10px] uppercase font-black text-blue-600 block">Examination Planning Studio</span>
                <h3 className="text-lg font-black text-slate-900">Schedule Examination Session & Date Sheet</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {message && (
              <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                message.type === 'success' ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'bg-rose-50 text-rose-900 border border-rose-200'
              }`}>
                {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
                <span>{message.text}</span>
              </div>
            )}

            <form onSubmit={handleCreateExam} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Exam Title</label>
                  <input
                    type="text"
                    value={examForm.name}
                    onChange={(e) => setExamForm({ ...examForm, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Examination Term</label>
                  <select
                    value={examForm.term}
                    onChange={(e) => setExamForm({ ...examForm, term: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="FIRST_TERM">First Term</option>
                    <option value="MID_TERM">Mid-Term</option>
                    <option value="FINAL_TERM">Final Term</option>
                    <option value="PRE_BOARD">Pre-Board Exam</option>
                    <option value="MONTHLY_TEST">Monthly Class Assessment</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={examForm.startDate}
                    onChange={(e) => setExamForm({ ...examForm, startDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={examForm.endDate}
                    onChange={(e) => setExamForm({ ...examForm, endDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="border-t pt-3 space-y-3">
                <span className="font-black text-slate-900 block text-xs">Paper Schedules (Date Sheet Matrix)</span>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {examForm.schedules.map((sch, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-4 gap-2 items-center">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold">Paper Subject</span>
                        <input
                          type="text"
                          value={sch.subjectName}
                          onChange={(e) => {
                            const next = [...examForm.schedules];
                            next[idx].subjectName = e.target.value;
                            setExamForm({ ...examForm, schedules: next });
                          }}
                          className="w-full px-2 py-1 text-xs rounded-lg border bg-white font-bold"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold">Exam Date</span>
                        <input
                          type="date"
                          value={sch.examDate}
                          onChange={(e) => {
                            const next = [...examForm.schedules];
                            next[idx].examDate = e.target.value;
                            setExamForm({ ...examForm, schedules: next });
                          }}
                          className="w-full px-2 py-1 text-xs rounded-lg border bg-white"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold">Timings</span>
                        <input
                          type="text"
                          value={sch.startTime + ' - ' + sch.endTime}
                          onChange={(e) => {
                            const next = [...examForm.schedules];
                            next[idx].startTime = '09:00 AM';
                            next[idx].endTime = '12:00 PM';
                            setExamForm({ ...examForm, schedules: next });
                          }}
                          className="w-full px-2 py-1 text-xs rounded-lg border bg-white font-mono"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold">Total / Pass</span>
                        <div className="flex gap-1">
                          <input
                            type="number"
                            value={sch.totalMarks}
                            onChange={(e) => {
                              const next = [...examForm.schedules];
                              next[idx].totalMarks = parseInt(e.target.value);
                              setExamForm({ ...examForm, schedules: next });
                            }}
                            className="w-1/2 px-1 py-1 text-xs rounded-lg border bg-white font-mono font-bold"
                          />
                          <input
                            type="number"
                            value={sch.passingMarks}
                            onChange={(e) => {
                              const next = [...examForm.schedules];
                              next[idx].passingMarks = parseInt(e.target.value);
                              setExamForm({ ...examForm, schedules: next });
                            }}
                            className="w-1/2 px-1 py-1 text-xs rounded-lg border bg-white font-mono font-bold"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black shadow flex items-center gap-1.5"
                >
                  {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CalendarCheck className="w-4 h-4" />}
                  <span>Save Exam Schedule & Date Sheet</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}
