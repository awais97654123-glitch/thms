'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  CalendarCheck, 
  QrCode, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Save, 
  RefreshCw,
  Users,
  Building2,
  Sparkles
} from 'lucide-react';
import QRScannerModal from '@/components/common/QRScanner';

export default function AdminAttendancePage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState<any[]>([]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState<any | null>(null);
  const [showScanner, setShowScanner] = useState(false);

  useEffect(() => {
    fetch('/api/classes')
      .then((res) => res.json())
      .then((data) => {
        if (data.classes && data.classes.length > 0) {
          setClasses(data.classes);
          setSelectedClass(data.classes[0].id);
        }
      })
      .catch(console.error);
  }, []);

  const loadAttendance = () => {
    if (!selectedClass) return;
    setLoading(true);

    // Fetch students of selected class
    fetch(`/api/students?classId=${selectedClass}`)
      .then((res) => res.json())
      .then((data) => {
        const studentList = data.students || [];
        setStudents(studentList);

        // Fetch attendance for this date & class
        fetch(`/api/attendance?date=${selectedDate}&classId=${selectedClass}`)
          .then((res) => res.json())
          .then((attData) => {
            if (attData.stats) setStats(attData.stats);
            const map: Record<string, string> = {};
            // Default to present
            studentList.forEach((s: any) => {
              map[s.id] = 'PRESENT';
            });
            // Override with existing records
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
    loadAttendance();
  }, [selectedClass, selectedDate]);

  const handleStatusChange = (studentId: string, status: string) => {
    setAttendanceMap((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleSaveBulk = async () => {
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
        loadAttendance();
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
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
            Attendance Command Center
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
            Class Attendance Register & QR Gateway
          </h1>
          <p className="text-xs text-slate-500">
            Mark daily attendance registers or scan student QR codes for automated real-time verification.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowScanner(!showScanner)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5 transition-all"
          >
            <QrCode className="w-4 h-4" />
            <span>{showScanner ? 'Hide QR Scanner' : 'Open Live QR Scanner'}</span>
          </button>
        </div>
      </div>

      {/* Embedded Live QR Scanner View if toggled */}
      {showScanner && (
        <div className="animate-in fade-in">
          <QRScannerModal onAttendanceMarked={() => loadAttendance()} />
        </div>
      )}

      {/* Date & Class Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Select Date:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white font-medium outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Select Class:</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white font-medium outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleSaveBulk}
          disabled={saving || loading || students.length === 0}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5 transition-all"
        >
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>Save Class Register</span>
        </button>
      </div>

      {/* Attendance Sheet Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-4">Roll No</th>
                <th className="p-4">Student ID</th>
                <th className="p-4">Student Full Name</th>
                <th className="p-4">Father Name</th>
                <th className="p-4 text-center">Attendance Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    Loading student attendance register...
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    No students found in this class.
                  </td>
                </tr>
              ) : (
                students.map((st) => {
                  const currentStatus = attendanceMap[st.id] || 'PRESENT';
                  return (
                    <tr key={st.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 font-mono font-bold text-emerald-800">
                        {st.rollNo}
                      </td>
                      <td className="p-4 font-mono text-blue-900 font-semibold">
                        {st.studentId}
                      </td>
                      <td className="p-4 font-bold text-slate-900">
                        {st.fullName}
                      </td>
                      <td className="p-4 text-slate-600">
                        {st.parent?.fatherName || 'N/A'}
                      </td>
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
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
