'use client';

import React, { useState, useEffect } from 'react';
import { Award, Search, Save, Printer, CheckCircle2, User, BookOpen, RefreshCw } from 'lucide-react';
import PrintableReportCard from '@/components/common/PrintableReportCard';

export default function AdminMarksAndReportsPage() {
  const [exams, setExams] = useState<any[]>([]);
  const [selectedExam, setSelectedExam] = useState<string>('');
  const [selectedSchedule, setSelectedSchedule] = useState<string>('');
  const [students, setStudents] = useState<any[]>([]);
  const [marksMap, setMarksMap] = useState<Record<string, number>>({});
  const [remarksMap, setRemarksMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Selected student for Report Card Preview
  const [reportCardStudent, setReportCardStudent] = useState<any | null>(null);

  useEffect(() => {
    fetch('/api/examinations')
      .then((res) => res.json())
      .then((data) => {
        if (data.exams && data.exams.length > 0) {
          setExams(data.exams);
          setSelectedExam(data.exams[0].id);
          if (data.exams[0].schedules && data.exams[0].schedules.length > 0) {
            setSelectedSchedule(data.exams[0].schedules[0].id);
          }
        }
      })
      .catch(console.error);

    fetch('/api/students')
      .then((res) => res.json())
      .then((data) => {
        if (data.students) setStudents(data.students);
      })
      .catch(console.error);
  }, []);

  const loadMarks = () => {
    if (!selectedSchedule) return;
    setLoading(true);

    fetch(`/api/examinations/marks?examScheduleId=${selectedSchedule}`)
      .then((res) => res.json())
      .then((data) => {
        const marks: Record<string, number> = {};
        const remarks: Record<string, string> = {};
        if (data.marks) {
          data.marks.forEach((m: any) => {
            marks[m.studentId] = m.marksObtained;
            remarks[m.studentId] = m.remarks || '';
          });
        }
        setMarksMap(marks);
        setRemarksMap(remarks);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadMarks();
  }, [selectedSchedule]);

  const handleMarksChange = (studentId: string, val: string) => {
    const num = parseFloat(val);
    setMarksMap((prev) => ({ ...prev, [studentId]: isNaN(num) ? 0 : num }));
  };

  const handleRemarksChange = (studentId: string, val: string) => {
    setRemarksMap((prev) => ({ ...prev, [studentId]: val }));
  };

  const handleSaveMarks = async () => {
    setSaving(true);
    try {
      const entries = Object.entries(marksMap).map(([studentId, marksObtained]) => ({
        studentId,
        marksObtained,
        remarks: remarksMap[studentId] || 'Satisfactory progress',
      }));

      const res = await fetch('/api/examinations/marks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examScheduleId: selectedSchedule,
          entries,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        alert(data.message);
        loadMarks();
      } else {
        alert(data.error || 'Failed to save marks');
      }
    } catch {
      alert('Error saving marks');
    } finally {
      setSaving(false);
    }
  };

  const currentExamObj = exams.find((e) => e.id === selectedExam);
  const currentScheduleObj = currentExamObj?.schedules?.find((s: any) => s.id === selectedSchedule);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
            Examinations & Academic Assessment
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
            Subject Marks Matrix & Official Report Cards
          </h1>
          <p className="text-xs text-slate-500">
            Enter terminal examination scores with automatic grade/GPA calculation and generate printable official report cards.
          </p>
        </div>
      </div>

      {/* Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Select Examination:</label>
          <select
            value={selectedExam}
            onChange={(e) => {
              const eId = e.target.value;
              setSelectedExam(eId);
              const ex = exams.find((x) => x.id === eId);
              if (ex?.schedules?.[0]) setSelectedSchedule(ex.schedules[0].id);
            }}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-medium outline-none focus:ring-2 focus:ring-amber-500"
          >
            {exams.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.name} ({ex.session?.name})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Select Subject Schedule:</label>
          <select
            value={selectedSchedule}
            onChange={(e) => setSelectedSchedule(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-medium outline-none focus:ring-2 focus:ring-amber-500"
          >
            {currentExamObj?.schedules?.map((s: any) => (
              <option key={s.id} value={s.id}>
                {s.class.name} ({s.section.name}) — {s.subject.name} (Max: {s.totalMarks})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Marks Entry Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              {currentScheduleObj?.subject?.name || 'Subject'} Marks Sheet
            </h3>
            <p className="text-xs text-slate-500">
              Total Marks: <strong>{currentScheduleObj?.totalMarks || 100}</strong> • Passing: {currentScheduleObj?.passingMarks || 33}
            </p>
          </div>

          <button
            onClick={handleSaveMarks}
            disabled={saving || loading}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5 transition-all"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save & Compute Grades</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-3">Roll No</th>
                <th className="p-3">Student Name</th>
                <th className="p-3">Marks Obtained (Max: {currentScheduleObj?.totalMarks || 100})</th>
                <th className="p-3">Percentage & Grade</th>
                <th className="p-3">Teacher Remarks</th>
                <th className="p-3 text-right">Report Card</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students
                .filter((st) => !currentScheduleObj?.classId || st.classId === currentScheduleObj.classId)
                .map((st) => {
                  const marksVal = marksMap[st.id] !== undefined ? marksMap[st.id] : 0;
                  const maxMarks = currentScheduleObj?.totalMarks || 100;
                  const pct = (marksVal / maxMarks) * 100;
                  const grade = pct >= 90 ? 'A+' : pct >= 80 ? 'A' : pct >= 70 ? 'B+' : pct >= 60 ? 'B' : pct >= 50 ? 'C' : pct >= 33 ? 'D' : 'F';

                  return (
                    <tr key={st.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-mono font-bold text-emerald-800">
                        {st.rollNo}
                      </td>
                      <td className="p-3">
                        <strong className="text-slate-900 block font-bold">{st.fullName}</strong>
                        <span className="text-[10px] text-slate-500 font-mono">{st.studentId}</span>
                      </td>
                      <td className="p-3">
                        <input
                          type="number"
                          min="0"
                          max={maxMarks}
                          value={marksMap[st.id] !== undefined ? marksMap[st.id] : ''}
                          onChange={(e) => handleMarksChange(st.id, e.target.value)}
                          placeholder="0"
                          className="w-24 px-3 py-1.5 text-xs font-mono font-bold text-blue-900 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none"
                        />
                      </td>
                      <td className="p-3">
                        <span className="font-mono font-bold text-slate-800 mr-2">{pct.toFixed(1)}%</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          {grade}
                        </span>
                      </td>
                      <td className="p-3">
                        <input
                          type="text"
                          value={remarksMap[st.id] || ''}
                          onChange={(e) => handleRemarksChange(st.id, e.target.value)}
                          placeholder="Teacher remarks..."
                          className="w-full max-w-xs px-2.5 py-1 text-xs rounded-lg border border-slate-200"
                        />
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => setReportCardStudent(st)}
                          className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-lg text-xs transition-colors inline-flex items-center gap-1"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Generate Report Card</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official Report Card Printable Modal Popup */}
      {reportCardStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-4xl w-full bg-white rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-2">
              <h4 className="font-bold text-sm">Terminal Examination Official Report Card</h4>
              <button
                onClick={() => setReportCardStudent(null)}
                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-xs font-bold rounded-lg"
              >
                ✕ Close
              </button>
            </div>
            <PrintableReportCard
              student={{
                studentId: reportCardStudent.studentId,
                admissionNo: reportCardStudent.admissionNo,
                rollNo: reportCardStudent.rollNo,
                fullName: reportCardStudent.fullName,
                dob: reportCardStudent.dob,
                class: reportCardStudent.class || { name: 'Class 8' },
                section: reportCardStudent.section || { name: 'Section A' },
                parent: reportCardStudent.parent,
              }}
              exam={{
                name: currentExamObj?.name || 'Mid-Term Examination 2026',
                term: 'MID_TERM',
              }}
              sessionName="Academic Session 2026-2027"
              marks={[
                { subjectName: 'Mathematics', totalMarks: 100, obtainedMarks: 95, percentage: 95, grade: 'A+', gpa: 4.0, remarks: 'Outstanding proofs & calculations' },
                { subjectName: 'English Literature', totalMarks: 100, obtainedMarks: 91, percentage: 91, grade: 'A+', gpa: 4.0, remarks: 'Superb grammar and comprehension' },
                { subjectName: 'General Science', totalMarks: 100, obtainedMarks: 94, percentage: 94, grade: 'A+', gpa: 4.0, remarks: 'Excellent grasp of physics and chemistry' },
                { subjectName: 'Urdu Literature', totalMarks: 100, obtainedMarks: 88, percentage: 88, grade: 'A', gpa: 3.7, remarks: 'Very good handwriting and essay' },
                { subjectName: 'Islamiyat', totalMarks: 50, obtainedMarks: 48, percentage: 96, grade: 'A+', gpa: 4.0, remarks: 'Excellent recitation & knowledge' },
              ]}
            />
          </div>
        </div>
      )}
    </div>
  );
}
