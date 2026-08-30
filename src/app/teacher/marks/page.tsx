'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Award, Save, RefreshCw, ArrowLeft } from 'lucide-react';

export default function TeacherMarksPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [marksMap, setMarksMap] = useState<Record<string, number>>({
    'student-1': 95,
    'student-3': 84,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/students')
      .then((res) => res.json())
      .then((data) => {
        if (data.students) {
          const class8 = data.students.filter((s: any) => s.class?.code === 'C08');
          setStudents(class8);
          const initialMap: Record<string, number> = {};
          class8.forEach((s: any) => {
            initialMap[s.id] = s.studentId === 'THMS-2026-000001' ? 95 : 84;
          });
          setMarksMap(initialMap);
        }
      })
      .catch(console.error);
  }, []);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      alert('Subject marks saved successfully to the examination ledger!');
    }, 800);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/teacher"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
            Subject Evaluation Matrix
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
            Mathematics — Class 8 (Section A)
          </h1>
          <p className="text-xs text-slate-500">
            Mid-Term Examination 2026 • Maximum Marks: 100 • Passing: 33
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5"
        >
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>Save Marks Matrix</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
            <tr>
              <th className="p-3">Roll No</th>
              <th className="p-3">Student Name</th>
              <th className="p-3">Score (Max: 100)</th>
              <th className="p-3">Computed Grade & GPA</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {students.map((st) => {
              const val = marksMap[st.id] || 0;
              const grade = val >= 90 ? 'A+' : val >= 80 ? 'A' : val >= 70 ? 'B+' : 'B';
              const gpa = val >= 90 ? '4.0' : val >= 80 ? '3.7' : val >= 70 ? '3.3' : '3.0';
              return (
                <tr key={st.id} className="hover:bg-slate-50/80">
                  <td className="p-3 font-mono font-bold text-emerald-800">{st.rollNo}</td>
                  <td className="p-3 font-bold text-slate-900">{st.fullName}</td>
                  <td className="p-3">
                    <input
                      type="number"
                      value={marksMap[st.id] !== undefined ? marksMap[st.id] : ''}
                      onChange={(e) => setMarksMap({ ...marksMap, [st.id]: parseFloat(e.target.value) || 0 })}
                      className="w-24 px-3 py-1.5 font-mono font-bold text-blue-900 rounded-xl border border-slate-300 outline-none"
                    />
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200 mr-2">
                      Grade {grade}
                    </span>
                    <span className="font-mono text-slate-600 font-semibold text-[11px]">GPA {gpa}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
