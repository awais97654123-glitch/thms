'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { CalendarCheck, Save, RefreshCw, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function TeacherAttendancePage() {
  const [students, setStudents] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadClassStudents = () => {
    setLoading(true);
    fetch('/api/students')
      .then((res) => res.json())
      .then((data) => {
        if (data.students) {
          // Class 8-A students assigned to Teacher Farooq
          const class8Students = data.students.filter((s: any) => s.class?.code === 'C08');
          setStudents(class8Students);

          const map: Record<string, string> = {};
          class8Students.forEach((s: any) => {
            map[s.id] = 'PRESENT';
          });
          setAttendanceMap(map);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadClassStudents();
  }, []);

  const handleStatusChange = (studentId: string, status: string) => {
    setAttendanceMap((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const records = Object.entries(attendanceMap).map(([studentId, status]) => ({
        studentId,
        status,
      }));

      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: selectedDate, records }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        alert(data.message);
      } else {
        alert(data.error || 'Failed to save attendance');
      }
    } catch {
      alert('Error saving attendance');
    } finally {
      setSaving(false);
    }
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
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
            Classroom Register
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
            Class 8 (Section A) Attendance Register
          </h1>
          <p className="text-xs text-slate-500">
            Class Teacher: Engr. Farooq Ahmad • Daily morning roll call
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-medium outline-none"
          />
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Attendance</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
              <tr>
                <th className="p-4">Roll No</th>
                <th className="p-4">Student ID</th>
                <th className="p-4">Full Name</th>
                <th className="p-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map((st) => {
                const currentStatus = attendanceMap[st.id] || 'PRESENT';
                return (
                  <tr key={st.id} className="hover:bg-slate-50/80">
                    <td className="p-4 font-mono font-bold text-emerald-800">{st.rollNo}</td>
                    <td className="p-4 font-mono text-blue-900 font-bold">{st.studentId}</td>
                    <td className="p-4 font-bold text-slate-900">{st.fullName}</td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-1">
                        {['PRESENT', 'LATE', 'ABSENT', 'EXCUSED'].map((stOpt) => {
                          const isSelected = currentStatus === stOpt;
                          let activeClass = 'bg-slate-100 text-slate-600';
                          if (isSelected) {
                            if (stOpt === 'PRESENT') activeClass = 'bg-emerald-600 text-white font-bold shadow';
                            else if (stOpt === 'LATE') activeClass = 'bg-amber-500 text-white font-bold shadow';
                            else if (stOpt === 'ABSENT') activeClass = 'bg-red-600 text-white font-bold shadow';
                            else activeClass = 'bg-blue-600 text-white font-bold shadow';
                          }
                          return (
                            <button
                              key={stOpt}
                              type="button"
                              onClick={() => handleStatusChange(st.id, stOpt)}
                              className={`px-3 py-1 rounded-lg text-[10px] uppercase font-semibold transition-all ${activeClass}`}
                            >
                              {stOpt}
                            </button>
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
