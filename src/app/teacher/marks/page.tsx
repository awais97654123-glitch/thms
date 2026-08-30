'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Award, 
  Save, 
  Search, 
  Sparkles, 
  CheckCircle2, 
  Users, 
  BookOpen, 
  Calendar,
  AlertCircle
} from 'lucide-react';
import PortalCircularLoader from '@/components/common/PortalCircularLoader';

export default function TeacherMarksPage() {
  const [assignedClasses, setAssignedClasses] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedExamId, setSelectedExamId] = useState('');
  const [totalMarks, setTotalMarks] = useState('100');

  const [students, setStudents] = useState<any[]>([]);
  const [marksMap, setMarksMap] = useState<Record<string, { marksObtained: string; remarks: string }>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // 1. Load teacher assigned classes & exams
  useEffect(() => {
    fetch('/api/teacher/classes')
      .then((res) => res.json())
      .then((data) => {
        if (data.assignedClasses && data.assignedClasses.length > 0) {
          setAssignedClasses(data.assignedClasses);
          const firstCls = data.assignedClasses[0];
          const firstSec = firstCls.sections[0];
          const firstSub = firstSec?.subjects[0];
          setSelectedClassId(firstCls.id);
          setSelectedSectionId(firstSec?.id || '');
          setSelectedSubjectId(firstSub?.id || '');
        }
      })
      .catch(console.error);

    fetch('/api/teacher/marks')
      .then((res) => res.json())
      .then((data) => {
        if (data.exams && data.exams.length > 0) {
          setExams(data.exams);
          setSelectedExamId(data.exams[0].id);
        }
      })
      .catch(console.error);
  }, []);

  // 2. Load students & existing marks for selected class/section/subject/exam
  const loadStudentsAndMarks = () => {
    if (!selectedClassId || !selectedSectionId) {
      setLoading(false);
      return;
    }
    setLoading(true);

    fetch(`/api/teacher/students?classId=${selectedClassId}&sectionId=${selectedSectionId}`)
      .then((res) => res.json())
      .then((data) => {
        const studentList = data.students || [];
        setStudents(studentList);

        // Fetch existing marks if subject & exam selected
        if (selectedSubjectId && selectedExamId) {
          fetch(`/api/teacher/marks?classId=${selectedClassId}&sectionId=${selectedSectionId}&subjectId=${selectedSubjectId}&examId=${selectedExamId}`)
            .then((mRes) => mRes.json())
            .then((mData) => {
              const map: Record<string, { marksObtained: string; remarks: string }> = {};
              studentList.forEach((s: any) => {
                map[s.id] = { marksObtained: '', remarks: '' };
              });

              if (mData.examSchedules && mData.examSchedules.length > 0) {
                const schedule = mData.examSchedules[0];
                if (schedule.totalMarks) setTotalMarks(schedule.totalMarks.toString());
                if (schedule.marks) {
                  schedule.marks.forEach((m: any) => {
                    map[m.studentId] = {
                      marksObtained: m.marksObtained.toString(),
                      remarks: m.remarks || '',
                    };
                  });
                }
              }
              setMarksMap(map);
            })
            .catch(console.error);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadStudentsAndMarks();
  }, [selectedClassId, selectedSectionId, selectedSubjectId, selectedExamId]);

  const handleMarksChange = (studentId: string, val: string) => {
    setMarksMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        marksObtained: val,
      },
    }));
  };

  const handleSaveMarks = async () => {
    setSaving(true);
    setStatusMessage(null);

    try {
      const marksList = Object.entries(marksMap)
        .filter(([_, data]) => data.marksObtained !== '')
        .map(([studentId, data]) => ({
          studentId,
          marksObtained: data.marksObtained,
          remarks: data.remarks,
        }));

      if (marksList.length === 0) {
        setStatusMessage({ text: 'Please enter marks for at least one student', type: 'error' });
        setSaving(false);
        return;
      }

      const res = await fetch('/api/teacher/marks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examId: selectedExamId,
          classId: selectedClassId,
          sectionId: selectedSectionId,
          subjectId: selectedSubjectId,
          totalMarks: parseFloat(totalMarks) || 100,
          marksList,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMessage({ text: data.message || 'Marks saved and published successfully!', type: 'success' });
      } else {
        setStatusMessage({ text: data.error || 'Failed to save marks', type: 'error' });
      }
    } catch {
      setStatusMessage({ text: 'Error saving marks to database', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const currentClass = assignedClasses.find((c) => c.id === selectedClassId);
  const availableSections = currentClass?.sections || [];
  const currentSection = availableSections.find((s: any) => s.id === selectedSectionId);
  const availableSubjects = currentSection?.subjects || [];

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-white shadow-sm">
        <div className="space-y-1">
          <span className="text-xs font-black uppercase tracking-wider text-orange-600">
            Assessment & Gradebook Management
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            Exam Marks & Results Entry
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Enter examination marks with auto percentage, letter grade, and GPA calculation for official student & parent report cards.
          </p>
        </div>

        <button
          onClick={handleSaveMarks}
          disabled={saving || students.length === 0}
          className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white text-xs font-black flex items-center gap-2 shadow-lg shadow-orange-500/25 transition-all hover:scale-105 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save & Publish Marks'}</span>
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

      {/* Class, Section, Subject, Exam Filter Bar */}
      <div className="glass-panel p-5 rounded-3xl border border-white shadow-sm grid grid-cols-1 sm:grid-cols-5 gap-3.5 text-xs">
        <div>
          <label className="block font-bold text-slate-700 mb-1">Assigned Class</label>
          <select
            value={selectedClassId}
            onChange={(e) => {
              const newCId = e.target.value;
              const cls = assignedClasses.find((c) => c.id === newCId);
              const sec = cls?.sections?.[0];
              setSelectedClassId(newCId);
              setSelectedSectionId(sec?.id || '');
              setSelectedSubjectId(sec?.subjects?.[0]?.id || '');
            }}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold text-slate-900 focus:ring-2 focus:ring-orange-500 outline-none"
          >
            {assignedClasses.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">Section</label>
          <select
            value={selectedSectionId}
            onChange={(e) => {
              const newSecId = e.target.value;
              const sec = availableSections.find((s: any) => s.id === newSecId);
              setSelectedSectionId(newSecId);
              setSelectedSubjectId(sec?.subjects?.[0]?.id || '');
            }}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold text-slate-900 focus:ring-2 focus:ring-orange-500 outline-none"
          >
            {availableSections.map((sec: any) => (
              <option key={sec.id} value={sec.id}>{sec.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">Assigned Subject</label>
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold text-slate-900 focus:ring-2 focus:ring-orange-500 outline-none"
          >
            {availableSubjects.map((sub: any) => (
              <option key={sub.id} value={sub.id}>{sub.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">Examination</label>
          <select
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold text-slate-900 focus:ring-2 focus:ring-orange-500 outline-none"
          >
            {exams.length > 0 ? (
              exams.map((ex) => (
                <option key={ex.id} value={ex.id}>{ex.name}</option>
              ))
            ) : (
              <option value="">Mid-Term Exam 2026</option>
            )}
          </select>
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">Total Max Marks</label>
          <input
            type="number"
            value={totalMarks}
            onChange={(e) => setTotalMarks(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono font-bold text-slate-900 focus:ring-2 focus:ring-orange-500 outline-none"
          />
        </div>
      </div>

      {/* Marks Entry Table */}
      <div className="glass-panel rounded-3xl border border-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <PortalCircularLoader message="Loading student mark roster..." />
          </div>
        ) : students.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <Users className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-xs font-bold text-slate-700">No students enrolled in this section</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-black uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-4">Roll No</th>
                  <th className="p-4">Student Name</th>
                  <th className="p-4">Student ID</th>
                  <th className="p-4 w-40">Marks Obtained</th>
                  <th className="p-4">Percentage</th>
                  <th className="p-4">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((student) => {
                  const data = marksMap[student.id] || { marksObtained: '', remarks: '' };
                  const maxM = parseFloat(totalMarks) || 100;
                  const obtainedNum = parseFloat(data.marksObtained);
                  const hasVal = !isNaN(obtainedNum);
                  const pct = hasVal ? parseFloat(((obtainedNum / maxM) * 100).toFixed(1)) : null;

                  let grade = '-';
                  if (pct !== null) {
                    if (pct >= 90) grade = 'A+';
                    else if (pct >= 80) grade = 'A';
                    else if (pct >= 70) grade = 'B+';
                    else if (pct >= 60) grade = 'B';
                    else if (pct >= 50) grade = 'C';
                    else if (pct >= 40) grade = 'D';
                    else grade = 'F';
                  }

                  return (
                    <tr key={student.id} className="hover:bg-orange-50/30 transition-colors">
                      <td className="p-4 font-mono font-bold text-slate-900">{student.rollNo}</td>
                      <td className="p-4 font-bold text-slate-900">{student.fullName}</td>
                      <td className="p-4 font-mono text-slate-500 text-[11px]">{student.studentId}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            max={totalMarks}
                            step="0.5"
                            placeholder="0"
                            value={data.marksObtained}
                            onChange={(e) => handleMarksChange(student.id, e.target.value)}
                            className="w-24 px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-mono font-bold text-slate-900 focus:ring-2 focus:ring-orange-500 outline-none"
                          />
                          <span className="text-slate-400 font-mono">/ {totalMarks}</span>
                        </div>
                      </td>
                      <td className="p-4 font-mono font-bold text-slate-700">
                        {pct !== null ? `${pct}%` : '-'}
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                          grade === 'A+' || grade === 'A'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : grade === 'F'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-orange-50 text-orange-700 border-orange-200'
                        }`}>
                          {grade}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {saving && <PortalCircularLoader isFullScreen message="Saving & Publishing Exam Marks to PostgreSQL..." />}
    </div>
  );
}
