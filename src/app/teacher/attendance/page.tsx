'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  CalendarCheck, 
  Save, 
  RefreshCw, 
  ArrowLeft, 
  CheckCircle2, 
  Users, 
  AlertCircle, 
  Sparkles,
  UserCheck,
  Clock,
  ShieldCheck
} from 'lucide-react';
import PortalCircularLoader from '@/components/common/PortalCircularLoader';

export default function TeacherAttendancePage() {
  const [assignedClasses, setAssignedClasses] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [students, setStudents] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Load teacher's assigned classes ONLY
  useEffect(() => {
    fetch('/api/teacher/classes')
      .then((res) => res.json())
      .then((data) => {
        if (data.assignedClasses && data.assignedClasses.length > 0) {
          setAssignedClasses(data.assignedClasses);
          setSelectedClassId(data.assignedClasses[0].id);
          if (data.assignedClasses[0].sections?.length > 0) {
            setSelectedSectionId(data.assignedClasses[0].sections[0].id);
          }
        }
      })
      .catch(console.error);
  }, []);

  // Load students for selected assigned class and section
  const loadClassStudents = () => {
    if (!selectedClassId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    let url = `/api/teacher/students?classId=${selectedClassId}`;
    if (selectedSectionId) url += `&sectionId=${selectedSectionId}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        const studentList = data.students || [];
        setStudents(studentList);

        // Fetch existing attendance records for this date
        fetch(`/api/teacher/attendance?date=${selectedDate}&classId=${selectedClassId}${selectedSectionId ? `&sectionId=${selectedSectionId}` : ''}`)
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
    const selected = assignedClasses.find((c) => c.id === cId);
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

      const res = await fetch('/api/teacher/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classId: selectedClassId,
          sectionId: selectedSectionId,
          date: selectedDate,
          records,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMessage({ text: data.message || 'Attendance saved successfully to PostgreSQL', type: 'success' });
      } else {
        setStatusMessage({ text: data.error || 'Unable to save attendance. Please try again.', type: 'error' });
      }
    } catch {
      setStatusMessage({ text: 'Unable to save attendance. Network error.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const currentClass = assignedClasses.find((c) => c.id === selectedClassId);
  const availableSections = currentClass?.sections || [];

  const presentCount = Object.values(attendanceMap).filter((s) => s === 'PRESENT').length;
  const absentCount = Object.values(attendanceMap).filter((s) => s === 'ABSENT').length;
  const lateCount = Object.values(attendanceMap).filter((s) => s === 'LATE').length;
  const excusedCount = Object.values(attendanceMap).filter((s) => s === 'EXCUSED').length;

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-white shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-orange-600">
              Classroom Attendance Hub
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            Daily Student Attendance
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Take roll-call attendance for your authorized classes with instant student & parent portal synchronization.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving || students.length === 0}
          className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white text-xs font-black flex items-center gap-2 shadow-lg shadow-orange-500/25 transition-all hover:scale-105 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Attendance to Database'}</span>
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

      {/* Class Selection & Controls Bar */}
      <div className="glass-panel p-5 rounded-3xl border border-white shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Your Assigned Class</label>
            <select
              value={selectedClassId}
              onChange={(e) => handleClassChange(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white font-bold text-slate-900 focus:ring-2 focus:ring-orange-500 outline-none"
            >
              {assignedClasses.length > 0 ? (
                assignedClasses.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))
              ) : (
                <option value="">No classes assigned</option>
              )}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Section</label>
            <select
              value={selectedSectionId}
              onChange={(e) => setSelectedSectionId(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white font-bold text-slate-900 focus:ring-2 focus:ring-orange-500 outline-none"
            >
              {availableSections.map((sec: any) => (
                <option key={sec.id} value={sec.id}>{sec.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Attendance Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white font-bold text-slate-900 focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>
        </div>

        {/* Quick Marking Buttons & Live Summary */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Quick Fill:</span>
            <button
              onClick={() => handleMarkAll('PRESENT')}
              className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-xl transition-colors"
            >
              ✓ Mark All Present
            </button>
            <button
              onClick={() => handleMarkAll('ABSENT')}
              className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl transition-colors"
            >
              ✗ Mark All Absent
            </button>
          </div>

          <div className="flex items-center gap-3 text-xs font-bold">
            <span className="text-emerald-700">Present: {presentCount}</span>
            <span className="text-rose-700">Absent: {absentCount}</span>
            <span className="text-amber-700">Late: {lateCount}</span>
            <span className="text-blue-700">Excused: {excusedCount}</span>
          </div>
        </div>
      </div>

      {/* Student Roster & Attendance Table */}
      <div className="glass-panel rounded-3xl border border-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <PortalCircularLoader message="Loading student roster from PostgreSQL..." />
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
                  <th className="p-4">Guardian Contact</th>
                  <th className="p-4 text-center">Attendance Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((student) => {
                  const currentStatus = attendanceMap[student.id] || 'PRESENT';
                  return (
                    <tr key={student.id} className="hover:bg-orange-50/30 transition-colors">
                      <td className="p-4 font-mono font-bold text-slate-900">{student.rollNo}</td>
                      <td className="p-4 font-bold text-slate-900">{student.fullName}</td>
                      <td className="p-4 font-mono text-slate-500 text-[11px]">{student.studentId}</td>
                      <td className="p-4 text-slate-600">{student.fatherName} ({student.fatherPhone})</td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-1.5">
                          {['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'].map((st) => (
                            <button
                              key={st}
                              type="button"
                              onClick={() => handleStatusChange(student.id, st)}
                              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                                currentStatus === st
                                  ? st === 'PRESENT'
                                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                                    : st === 'ABSENT'
                                    ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                                    : st === 'LATE'
                                    ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30'
                                    : 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                              }`}
                            >
                              {st}
                            </button>
                          ))}
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

      {saving && <PortalCircularLoader isFullScreen message="Saving verified attendance to PostgreSQL..." />}
    </div>
  );
}
