'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { CalendarCheck, Save, RefreshCw, ArrowLeft, CheckCircle2, Users, AlertCircle, Sparkles } from 'lucide-react';

export default function TeacherAttendancePage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [students, setStudents] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Load teacher's assigned classes
  useEffect(() => {
    fetch('/api/classes')
      .then((res) => res.json())
      .then((data) => {
        if (data.classes && data.classes.length > 0) {
          setClasses(data.classes);
          setSelectedClassId(data.classes[0].id);
          if (data.classes[0].sections?.length > 0) {
            setSelectedSectionId(data.classes[0].sections[0].id);
          }
        }
      })
      .catch(console.error);
  }, []);

  // Load students for selected class and section
  const loadClassStudents = () => {
    if (!selectedClassId) return;
    setLoading(true);
    let url = `/api/students?classId=${selectedClassId}`;
    if (selectedSectionId) url += `&sectionId=${selectedSectionId}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        const studentList = data.students || [];
        setStudents(studentList);

        // Fetch existing attendance records for this date
        fetch(`/api/attendance?date=${selectedDate}&classId=${selectedClassId}${selectedSectionId ? `&sectionId=${selectedSectionId}` : ''}`)
          .then((res) => res.json())
          .then((attData) => {
            const map: Record<string, string> = {};
            studentList.forEach((s: any) => {
              map[s.id] = 'PRESENT';
            });
            if (attData.records) {
              attData.records.forEach((r: any) => {
                map[r.studentId] = r.status;
              });
            }
            setAttendanceMap(map);
          })
          .catch(console.error);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadClassStudents();
  }, [selectedClassId, selectedSectionId, selectedDate]);

  const handleClassChange = (cId: string) => {
    setSelectedClassId(cId);
    const selected = classes.find((c) => c.id === cId);
    if (selected?.sections?.length > 0) {
      setSelectedSectionId(selected.sections[0].id);
    } else {
      setSelectedSectionId('');
    }
  };

  const handleStatusChange = (studentId: string, status: string) => {
    setAttendanceMap((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleMarkAll = (status: string) => {
    const map: Record<string, string> = {};
    students.forEach((s) => {
      map[s.id] = status;
    });
    setAttendanceMap(map);
  };

  const handleSave = async () => {
    setSaving(true);
    setStatusMessage(null);
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
        setStatusMessage({ text: data.message || 'Attendance saved successfully to official records.', type: 'success' });
        setTimeout(() => setStatusMessage(null), 5000);
      } else {
        setStatusMessage({ text: data.error || 'Failed to save attendance', type: 'error' });
      }
    } catch {
      setStatusMessage({ text: 'Error saving attendance. Please check connection.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const presentCount = Object.values(attendanceMap).filter((s) => s === 'PRESENT').length;
  const lateCount = Object.values(attendanceMap).filter((s) => s === 'LATE').length;
  const absentCount = Object.values(attendanceMap).filter((s) => s === 'ABSENT').length;
  const excusedCount = Object.values(attendanceMap).filter((s) => s === 'EXCUSED').length;

  const currentClassObj = classes.find((c) => c.id === selectedClassId);

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
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
            Classroom Register
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
            {currentClassObj?.name || 'Class'} Daily Roll Call
          </h1>
          <p className="text-xs text-slate-500">
            Mark attendance for students. Records are synced instantly to central admin and parent monitoring portals.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <select
              value={selectedClassId}
              onChange={(e) => handleClassChange(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-bold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            {currentClassObj?.sections && currentClassObj.sections.length > 0 && (
              <select
                value={selectedSectionId}
                onChange={(e) => setSelectedSectionId(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-bold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {currentClassObj.sections.map((sec: any) => (
                  <option key={sec.id} value={sec.id}>
                    {sec.name}
                  </option>
                ))}
              </select>
            )}

            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving || loading || students.length === 0}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 flex items-center gap-1.5 transition-all"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Attendance</span>
          </button>
        </div>
      </div>

      {/* Live Counter Badges & Quick Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-bold text-slate-500 mr-1">Roster Summary:</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-bold">
            Total: {students.length}
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold">
            Present: {presentCount}
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800 font-bold">
            Late: {lateCount}
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-red-100 text-red-800 font-bold">
            Absent: {absentCount}
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-800 font-bold">
            Excused: {excusedCount}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-slate-400">Quick Fill:</span>
          <button
            type="button"
            onClick={() => handleMarkAll('PRESENT')}
            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs rounded-lg transition-colors border border-emerald-200"
          >
            All Present
          </button>
          <button
            type="button"
            onClick={() => handleMarkAll('ABSENT')}
            className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs rounded-lg transition-colors border border-red-200"
          >
            All Absent
          </button>
        </div>
      </div>

      {/* Students Register Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500 space-y-2">
            <span className="animate-spin inline-block text-xl">⏳</span>
            <p>Loading classroom roster...</p>
          </div>
        ) : students.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No active students enrolled in this section.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-4">Roll No</th>
                  <th className="p-4">Student ID</th>
                  <th className="p-4">Student Name</th>
                  <th className="p-4">Father / Guardian</th>
                  <th className="p-4 text-center">Status Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((st) => {
                  const currentStatus = attendanceMap[st.id] || 'PRESENT';
                  return (
                    <tr key={st.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 font-mono font-bold text-emerald-800">{st.rollNo}</td>
                      <td className="p-4 font-mono text-blue-900 font-bold">{st.studentId}</td>
                      <td className="p-4 font-bold text-slate-900 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-200 overflow-hidden text-[10px] flex items-center justify-center font-bold">
                          {st.photoUrl ? (
                            <img src={st.photoUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            st.firstName?.charAt(0)
                          )}
                        </div>
                        <span>{st.fullName}</span>
                      </td>
                      <td className="p-4 text-slate-600 font-medium">
                        {st.parent?.fatherName || st.emergencyName || 'N/A'}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-1.5">
                          {[
                            { code: 'PRESENT', label: 'Present', activeColor: 'bg-emerald-600 text-white shadow-sm' },
                            { code: 'LATE', label: 'Late', activeColor: 'bg-amber-500 text-white shadow-sm' },
                            { code: 'ABSENT', label: 'Absent', activeColor: 'bg-red-600 text-white shadow-sm' },
                            { code: 'EXCUSED', label: 'Excused', activeColor: 'bg-blue-600 text-white shadow-sm' },
                          ].map((opt) => {
                            const isSelected = currentStatus === opt.code;
                            return (
                              <button
                                key={opt.code}
                                type="button"
                                onClick={() => handleStatusChange(st.id, opt.code)}
                                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                                  isSelected
                                    ? opt.activeColor
                                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                                }`}
                              >
                                {opt.label}
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
        )}
      </div>
    </div>
  );
}
