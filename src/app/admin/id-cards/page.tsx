'use client';

import React, { useState, useEffect } from 'react';
import { CreditCard, Search, Printer, Users, Filter, Sparkles } from 'lucide-react';
import PrintableIDCard from '@/components/common/PrintableIDCard';

export default function AdminIdCardsStudioPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [selectedClass, setSelectedClass] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/classes')
      .then((res) => res.json())
      .then((data) => {
        if (data.classes) setClasses(data.classes);
      })
      .catch(console.error);

    fetch('/api/students')
      .then((res) => res.json())
      .then((data) => {
        if (data.students) {
          setStudents(data.students);
          if (data.students.length > 0) setSelectedStudent(data.students[0]);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredStudents = students.filter((st) => {
    const matchClass = !selectedClass || st.classId === selectedClass;
    const matchQuery =
      !searchQuery ||
      st.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.rollNo.toLowerCase().includes(searchQuery.toLowerCase());
    return matchClass && matchQuery;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-purple-600">
            Student Identity & Security
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
            Dual-Sided Student ID Card Studio
          </h1>
          <p className="text-xs text-slate-500">
            Official ISO-standard card layout with Front (biodata & photo) and Back (dynamic attendance QR code & emergency rules).
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5 transition-all"
        >
          <Printer className="w-4 h-4" />
          <span>Print Current Card</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Students Selector List */}
        <div className="lg:col-span-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              Select Student ({filteredStudents.length})
            </h3>
          </div>

          <div className="space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search student name / roll..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>

            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-purple-500 outline-none"
            >
              <option value="">All Classes</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="divide-y divide-slate-100 max-h-[480px] overflow-y-auto pr-1">
            {filteredStudents.map((st) => (
              <button
                key={st.id}
                onClick={() => setSelectedStudent(st)}
                className={`w-full text-left p-2.5 rounded-xl text-xs transition-all flex items-center justify-between ${
                  selectedStudent?.id === st.id
                    ? 'bg-purple-50 text-purple-950 font-bold border border-purple-200'
                    : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div>
                  <p className="font-bold text-slate-900">{st.fullName}</p>
                  <p className="text-[10px] text-slate-500 font-mono">
                    {st.studentId} • {st.class?.name} ({st.rollNo})
                  </p>
                </div>
                {selectedStudent?.id === st.id && (
                  <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Live ID Card Preview Studio */}
        <div className="lg:col-span-8">
          {selectedStudent ? (
            <PrintableIDCard student={selectedStudent} />
          ) : (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-slate-400 text-xs">
              Select a student on the left to generate ID card preview.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
