'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Award, Save, RefreshCw, ArrowLeft, CheckCircle2, AlertCircle, BookOpen, Layers } from 'lucide-react';

export default function TeacherMarksPage() {
  const [exams, setExams] = useState<any[]>([]);
  const [selectedExamId, setSelectedExamId] = useState('');
  const [schedules, setSchedules] = useState<any[]>([]);
  const [selectedScheduleId, setSelectedScheduleId] = useState('');
  const [students, setStudents] = useState<any[]>([]);
  const [marksMap, setMarksMap] = useState<Record<string, { marksObtained: number; remarks: string }>>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Load published exams
  useEffect(() => {
    fetch('/api/examinations')
      .then((res) => res.json())
      .then((data) => {
        if (data.exams && data.exams.length > 0) {
          setExams(data.exams);
          setSelectedExamId(data.exams[0].id);
          if (data.exams[0].schedules?.length > 0) {
            setSchedules(data.exams[0].schedules);
            setSelectedScheduleId(data.exams[0].schedules[0].id);
          }
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleExamChange = (eId: string) => {
    setSelectedExamId(eId);
    const targetExam = exams.find((x) => x.id === eId);
    if (targetExam?.schedules?.length > 0) {
      setSchedules(targetExam.schedules);
      setSelectedScheduleId(targetExam.schedules[0].id);
    } else {
      setSchedules([]);
      setSelectedScheduleId('');
    }
  };

  // Load students and existing marks for selected schedule
  useEffect(() => {
    if (!selectedScheduleId) return;
    const currentSchedule = schedules.find((s) => s.id === selectedScheduleId);
    if (!currentSchedule) return;

    setLoading(true);
    let url = `/api/students?classId=${currentSchedule.classId}`;
    if (currentSchedule.sectionId) url += `&sectionId=${currentSchedule.sectionId}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        const studentList = data.students || [];
        setStudents(studentList);

        // Fetch marks
        fetch(`/api/examinations/marks?examScheduleId=${selectedScheduleId}`)
          .then((res) => res.json())
          .then((mData) => {
            const map: Record<string, { marksObtained: number; remarks: string }> = {};
            studentList.forEach((st: any) => {
              map[st.id] = { marksObtained: 0, remarks: '' };
            });

            if (mData.marks) {
              mData.marks.forEach((m: any) => {
                map[m.studentId] = {
                  marksObtained: m.marksObtained,
                  remarks: m.remarks || '',
                };
              });
            }
            setMarksMap(map);
          })
          .catch(console.error);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedScheduleId, schedules]);

  const activeSchedule = schedules.find((s) => s.id === selectedScheduleId);
  const totalMarks = activeSchedule?.totalMarks || 100;

  const handleScoreChange = (studentId: string, value: number) => {
    const safeScore = Math.min(totalMarks, Math.max(0, isNaN(value) ? 0 : value));
    setMarksMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        marksObtained: safeScore,
      },
    }));
  };

  const handleRemarksChange = (studentId: string, remarks: string) => {
    setMarksMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        remarks,
      },
    }));
  };

  const getComputedGrade = (obtained: number, total: number) => {
    const pct = total > 0 ? (obtained / total) * 100 : 0;
    if (pct >= 90) return { grade: 'A+', gpa: '4.0', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
    if (pct >= 80) return { grade: 'A', gpa: '3.7', color: 'bg-blue-100 text-blue-800 border-blue-200' };
    if (pct >= 70) return { grade: 'B+', gpa: '3.3', color: 'bg-teal-100 text-teal-800 border-teal-200' };
    if (pct >= 60) return { grade: 'B', gpa: '3.0', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' };
    if (pct >= 50) return { grade: 'C', gpa: '2.0', color: 'bg-amber-100 text-amber-800 border-amber-200' };
    if (pct >= 33) return { grade: 'D', gpa: '1.0', color: 'bg-orange-100 text-orange-800 border-orange-200' };
    return { grade: 'F', gpa: '0.0', color: 'bg-red-100 text-red-800 border-red-200' };
  };

  const handleSave = async () => {
    if (!selectedScheduleId) return;
    setSaving(true);
    setStatusMessage(null);

    try {
      const entries = Object.entries(marksMap).map(([studentId, item]) => ({
        studentId,
        marksObtained: item.marksObtained,
        remarks: item.remarks,
      }));

      const res = await fetch('/api/examinations/marks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examScheduleId: selectedScheduleId,
          entries,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMessage({
          text: data.message || 'Exam marks saved successfully to the official ledger!',
          type: 'success',
        });
        setTimeout(() => setStatusMessage(null), 5000);
      } else {
        setStatusMessage({ text: data.error || 'Failed to save marks', type: 'error' });
      }
    } catch {
      setStatusMessage({ text: 'Error connecting to database to save marks.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/teacher"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-emerald-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Teacher Dashboard</span>
        </Link>
      </div>

      {statusMessage && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-sm animate-in fade-in ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-300'
              : 'bg-red-50 text-red-900 border border-red-300'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Top Header Card */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
            Subject Evaluation Matrix
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
            {activeSchedule?.subject?.name || 'Subject'} Marks Ledger
          </h1>
          <p className="text-xs text-slate-500">
            Class: {activeSchedule?.class?.name} ({activeSchedule?.section?.name}) • Maximum Marks: {totalMarks} • Passing: {activeSchedule?.passingMarks || 33}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <select
              value={selectedExamId}
              onChange={(e) => handleExamChange(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
            >
              {exams.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.name}
                </option>
              ))}
            </select>

            {schedules.length > 0 && (
              <select
                value={selectedScheduleId}
                onChange={(e) => setSelectedScheduleId(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
              >
                {schedules.map((sc) => (
                  <option key={sc.id} value={sc.id}>
                    {sc.subject?.name} - {sc.class?.name} ({sc.section?.name})
                  </option>
                ))}
              </select>
            )}
          </div>

          <button
            onClick={handleSave}
            disabled={saving || loading || students.length === 0}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 flex items-center gap-1.5 transition-all"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Marks Matrix</span>
          </button>
        </div>
      </div>

      {/* Spreadsheet Marks Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500 space-y-2">
            <span className="animate-spin inline-block text-xl">⏳</span>
            <p>Loading student examination roster...</p>
          </div>
        ) : students.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No students found for this examination schedule.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3">Roll No</th>
                  <th className="p-3">Student ID</th>
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Obtained Score (Max: {totalMarks})</th>
                  <th className="p-3">Computed Grade & GPA</th>
                  <th className="p-3">Teacher Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((st) => {
                  const entry = marksMap[st.id] || { marksObtained: 0, remarks: '' };
                  const { grade, gpa, color } = getComputedGrade(entry.marksObtained, totalMarks);

                  return (
                    <tr key={st.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-mono font-bold text-emerald-800">{st.rollNo}</td>
                      <td className="p-3 font-mono text-blue-900 font-bold">{st.studentId}</td>
                      <td className="p-3 font-bold text-slate-900">{st.fullName}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min="0"
                            max={totalMarks}
                            value={entry.marksObtained}
                            onChange={(e) => handleScoreChange(st.id, parseFloat(e.target.value))}
                            className="w-24 px-3 py-1.5 font-mono font-bold text-blue-900 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                          <span className="text-slate-400 font-mono">/ {totalMarks}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-lg text-[11px] font-extrabold border ${color}`}>
                            Grade {grade}
                          </span>
                          <span className="font-mono text-slate-600 font-bold text-[11px]">GPA {gpa}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <input
                          type="text"
                          placeholder="Optional feedback e.g. Excellent"
                          value={entry.remarks}
                          onChange={(e) => handleRemarksChange(st.id, e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
