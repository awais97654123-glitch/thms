'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, 
  Search, 
  Filter, 
  GraduationCap, 
  CreditCard, 
  QrCode, 
  DollarSign, 
  Award, 
  UserCheck, 
  Eye,
  Plus,
  Key
} from 'lucide-react';

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('');

  const fetchStudents = () => {
    setLoading(true);
    let url = '/api/students';
    const params = [];
    if (searchQuery) params.push(`q=${encodeURIComponent(searchQuery)}`);
    if (selectedClass) params.push(`classId=${selectedClass}`);
    if (params.length > 0) url += `?${params.join('&')}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.students) setStudents(data.students);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStudents();
    fetch('/api/classes')
      .then((res) => res.json())
      .then((data) => {
        if (data.classes) setClasses(data.classes);
      })
      .catch(console.error);
  }, [selectedClass]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStudents();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
            Student Information System (SIS)
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
            Student 360° Directory
          </h1>
          <p className="text-xs text-slate-500">
            Browse complete academic profiles, attendance history, fee balances, exam results, and ID cards.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/users?role=STUDENT"
            className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors border border-amber-200"
          >
            <Key className="w-4 h-4" />
            <span>Login & Passwords</span>
          </Link>
          <Link
            href="/admin/id-cards"
            className="px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors border border-purple-200"
          >
            <CreditCard className="w-4 h-4" />
            <span>ID Card Studio</span>
          </Link>
          <Link
            href="/admin/admissions/new"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>+ New Admission & Enroll</span>
          </Link>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-700">Filter Class:</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">All Classes</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search Student ID, Name, Roll No..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none w-72"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl"
          >
            Search
          </button>
        </form>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-4">Student ID / Roll</th>
                <th className="p-4">Full Name</th>
                <th className="p-4">Class & Section</th>
                <th className="p-4">Father / Guardian</th>
                <th className="p-4">Emergency Phone</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    Loading student records...
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                      <GraduationCap className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-bold text-slate-700">No students enrolled yet</p>
                    <p className="text-[11px] text-slate-400">Start by submitting and approving your first online or offline admission.</p>
                    <Link
                      href="/admin/admissions/new"
                      className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow"
                    >
                      + Start First Admission
                    </Link>
                  </td>
                </tr>
              ) : (
                students.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4">
                      <span className="font-mono font-bold text-blue-900 block">{st.studentId}</span>
                      <span className="text-[10px] font-mono text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                        Roll: {st.rollNo}
                      </span>
                    </td>
                    <td className="p-4">
                      <strong className="text-slate-900 text-xs block font-bold">{st.fullName}</strong>
                      <span className="text-[11px] text-slate-500 font-mono">Adm: {st.admissionNo} • {st.gender}</span>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                        {st.class?.name} - {st.section?.name}
                      </span>
                    </td>
                    <td className="p-4">
                      <p className="font-semibold text-slate-800">{st.parent?.fatherName || 'N/A'}</p>
                      <p className="text-[10px] text-slate-500">{st.parent?.fatherOccupation || ''}</p>
                    </td>
                    <td className="p-4 font-mono text-slate-700">
                      {st.emergencyPhone || st.parent?.fatherPhone || 'N/A'}
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {st.status}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-1.5">
                      <Link
                        href={`/admin/students/${st.studentId}`}
                        className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-lg text-xs transition-colors inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>360° Profile</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
