'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Users, 
  GraduationCap, 
  CreditCard, 
  DollarSign, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  UserCheck, 
  Sparkles, 
  X, 
  ChevronRight, 
  Edit3, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  BookOpen, 
  Award,
  Loader2,
  AlertCircle,
  FileText
} from 'lucide-react';

export default function GlobalStudentSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [studentDetails, setStudentDetails] = useState<any | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Edit form state
  const [editFormData, setEditFormData] = useState<any>({});
  const [savingEdit, setSavingEdit] = useState(false);
  const [editMessage, setEditMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close auto-suggest on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const handler = setTimeout(() => {
      fetch(`/api/students?q=${encodeURIComponent(query.trim())}&limit=8`)
        .then((res) => res.json())
        .then((data) => {
          if (data.students) {
            setResults(data.students);
            setIsOpen(true);
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }, 250);

    return () => clearTimeout(handler);
  }, [query]);

  // Fetch full 360° details including siblings & teachers
  const handleSelectStudent = async (studentId: string) => {
    setSelectedStudentId(studentId);
    setLoadingDetails(true);
    setIsOpen(false);
    setEditMessage(null);

    try {
      const res = await fetch(`/api/students/${studentId}`);
      const data = await res.json();
      if (res.ok && data.student) {
        setStudentDetails(data);
        // Prep edit form
        const s = data.student;
        setEditFormData({
          firstName: s.firstName || '',
          lastName: s.lastName || '',
          dob: s.dob ? new Date(s.dob).toISOString().slice(0, 10) : '',
          gender: s.gender || 'MALE',
          bloodGroup: s.bloodGroup || '',
          rollNo: s.rollNo || '',
          classId: s.classId || '',
          sectionId: s.sectionId || '',
          status: s.status || 'ENROLLED',
          emergencyPhone: s.emergencyPhone || '',
          fatherName: s.parent?.fatherName || '',
          fatherPhone: s.parent?.fatherPhone || '',
          fatherEmail: s.parent?.fatherEmail || '',
          fatherCnic: s.parent?.fatherCnic || '',
          motherName: s.parent?.motherName || '',
          motherPhone: s.parent?.motherPhone || '',
          address: s.parent?.address || '',
          city: s.parent?.city || 'Peshawar',
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleSaveStudentEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) return;
    setSavingEdit(true);
    setEditMessage(null);

    try {
      const res = await fetch(`/api/students/${selectedStudentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setEditMessage({ text: 'Student details updated successfully!', type: 'success' });
        // Refresh details
        handleSelectStudent(selectedStudentId);
        setTimeout(() => setIsEditModalOpen(false), 1200);
      } else {
        setEditMessage({ text: data.error || 'Failed to update student.', type: 'error' });
      }
    } catch (err: any) {
      setEditMessage({ text: err?.message || 'Error updating student.', type: 'error' });
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <>
      {/* Global Top Search Bar */}
      <div className="relative w-full max-w-md" ref={searchContainerRef}>
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-blue-500 absolute left-3.5 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search student by Name, ID, Roll, Father, or Phone..."
            value={query}
            onFocus={() => {
              if (results.length > 0) setIsOpen(true);
            }}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-20 py-2 text-xs rounded-2xl border border-slate-200 bg-white/95 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm font-medium transition-all"
          />

          {loading ? (
            <div className="absolute right-3.5 flex items-center">
              <Loader2 className="w-3.5 h-3.5 text-blue-600 animate-spin" />
            </div>
          ) : (
            <div className="absolute right-2.5 flex items-center gap-1">
              <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono font-bold text-slate-500 bg-slate-100 border border-slate-200 rounded-md">
                Ctrl K
              </kbd>
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    setResults([]);
                    setIsOpen(false);
                  }}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Auto-suggestions Dropdown */}
        {isOpen && results.length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl border border-slate-200 shadow-2xl z-50 overflow-hidden text-slate-900 divide-y divide-slate-100 animate-in fade-in duration-150">
            <div className="p-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              <span>Matching Student Profiles ({results.length})</span>
              <span>Click to open 360° intel</span>
            </div>

            <div className="max-h-72 overflow-y-auto">
              {results.map((st) => (
                <div
                  key={st.id}
                  onClick={() => handleSelectStudent(st.id)}
                  className="p-3 hover:bg-blue-50/70 transition-colors flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 to-blue-500 text-white font-bold flex items-center justify-center text-xs shadow-sm overflow-hidden shrink-0">
                      {st.photoUrl ? (
                        <img src={st.photoUrl} alt={st.fullName} className="w-full h-full object-cover" />
                      ) : (
                        st.fullName?.charAt(0) || 'S'
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <strong className="text-xs text-slate-900 group-hover:text-blue-600 transition-colors">
                          {st.fullName}
                        </strong>
                        <span className="font-mono text-[10px] font-bold text-blue-800 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                          {st.studentId}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        {st.class?.name} ({st.section?.name}) • Roll: <span className="font-mono font-bold text-slate-700">{st.rollNo}</span> • Father: {st.parent?.fatherName || 'N/A'}
                      </p>
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Student 360° Intelligence Modal */}
      {selectedStudentId && studentDetails && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 sm:p-8 space-y-6">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#0a192f] via-[#1e3a8a] to-[#2563eb] text-white flex items-center justify-center text-xl font-bold shadow-md shadow-blue-500/25 shrink-0 overflow-hidden border-2 border-white">
                  {studentDetails.student.photoUrl ? (
                    <img src={studentDetails.student.photoUrl} alt={studentDetails.student.fullName} className="w-full h-full object-cover" />
                  ) : (
                    studentDetails.student.fullName?.charAt(0) || 'S'
                  )}
                </div>
                <div>
                  <span className="text-[10px] uppercase font-black tracking-wider text-blue-600 block">
                    Student 360° Intelligence & Family Dossier
                  </span>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
                    <span>{studentDetails.student.fullName}</span>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {studentDetails.student.status}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    ID: <strong className="text-blue-900 font-bold">{studentDetails.student.studentId}</strong> • Roll: <strong className="text-slate-800">{studentDetails.student.rollNo}</strong> • Adm: {studentDetails.student.admissionNo}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors flex items-center gap-1 border border-blue-200"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedStudentId(null);
                    setStudentDetails(null);
                  }}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Academic & Faculty Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-slate-50/80 p-4 rounded-2xl border border-slate-200 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Class & Section</span>
                <p className="text-sm font-bold text-slate-900">
                  {studentDetails.student.class?.name} — {studentDetails.student.section?.name}
                </p>
                <p className="text-[11px] text-slate-600">
                  Academic Session: <strong>{studentDetails.student.session?.name || '2026-2027'}</strong>
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Faculty Assigned</span>
                <p className="text-xs font-bold text-slate-900">
                  Class Incharge: <span className="text-blue-700">{studentDetails.classTeacher?.fullName || 'Senior Subject Teacher'}</span>
                </p>
                <p className="text-[11px] text-slate-600 truncate">
                  Subjects: {studentDetails.subjectTeachers?.map((st: any) => st.subject?.name).filter(Boolean).slice(0, 4).join(', ') || 'Mathematics, Science, English, Urdu'}
                </p>
              </div>
            </div>

            {/* Parent & Family Contact Details */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2.5 text-xs shadow-sm">
              <span className="text-xs font-black text-slate-900 uppercase tracking-wider block border-b pb-2">
                Parent & Guardian Information
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <span className="text-slate-400 block text-[10px]">Father / Guardian:</span>
                  <strong className="text-slate-900">{studentDetails.student.parent?.fatherName || 'N/A'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Father Phone:</span>
                  <strong className="text-blue-900 font-mono">{studentDetails.student.parent?.fatherPhone || 'N/A'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Father CNIC:</span>
                  <strong className="text-slate-700 font-mono">{studentDetails.student.parent?.fatherCnic || 'N/A'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Mother Name:</span>
                  <strong className="text-slate-900">{studentDetails.student.parent?.motherName || 'N/A'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Emergency Phone:</span>
                  <strong className="text-rose-700 font-mono font-bold">{studentDetails.student.emergencyPhone || studentDetails.student.parent?.fatherPhone || 'N/A'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Residential Address:</span>
                  <strong className="text-slate-700 truncate block">{studentDetails.student.parent?.address || 'Hayatabad, Peshawar'}</strong>
                </div>
              </div>
            </div>

            {/* Family & Siblings Studying in School */}
            <div className="bg-gradient-to-r from-blue-50/60 to-indigo-50/60 p-4 rounded-2xl border border-blue-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-blue-950 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span>Siblings Enrolled in School ({studentDetails.siblings?.length || 0})</span>
                </span>
                <span className="text-[10px] text-blue-700 font-bold bg-blue-100 px-2 py-0.5 rounded-full">
                  Family Intelligence
                </span>
              </div>

              {studentDetails.siblings && studentDetails.siblings.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {studentDetails.siblings.map((sib: any) => (
                    <div
                      key={sib.id}
                      onClick={() => handleSelectStudent(sib.id)}
                      className="p-3 bg-white rounded-xl border border-blue-200 hover:border-blue-400 transition-all flex items-center justify-between cursor-pointer group shadow-sm"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs shrink-0">
                          {sib.fullName.charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {sib.fullName}
                          </p>
                          <p className="text-[10px] text-slate-500">
                            {sib.class?.name} ({sib.section?.name}) • Roll: <span className="font-mono font-bold text-slate-700">{sib.rollNo}</span>
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-blue-700 font-bold bg-blue-50 px-1.5 py-0.5 rounded">
                        {sib.studentId}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-blue-800 font-medium py-1">
                  ✓ No other siblings currently recorded under this parent contact.
                </p>
              )}
            </div>

            {/* Quick Navigation Footer */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <Link
                  href={`/admin/students/${studentDetails.student.studentId}`}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow transition-colors flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Open Full Digital Dossier</span>
                </Link>
                <Link
                  href="/admin/id-cards"
                  className="px-3.5 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs rounded-xl border border-purple-200 transition-colors flex items-center gap-1"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Smart ID Card</span>
                </Link>
              </div>

              <span className="text-[11px] text-slate-400 font-mono">
                The Hayatabad Model School Management System
              </span>
            </div>

          </div>
        </div>
      )}

      {/* Edit Student Details Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 sm:p-8 space-y-5">
            
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="text-[10px] uppercase font-black text-blue-600 block">Admin Correction Center</span>
                <h3 className="text-lg font-black text-slate-900">Edit Student & Parent Details</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {editMessage && (
              <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                editMessage.type === 'success' ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'bg-rose-50 text-rose-900 border border-rose-200'
              }`}>
                {editMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
                <span>{editMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleSaveStudentEdit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">First Name</label>
                  <input
                    type="text"
                    value={editFormData.firstName || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, firstName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={editFormData.lastName || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, lastName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Roll Number</label>
                  <input
                    type="text"
                    value={editFormData.rollNo || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, rollNo: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Gender</label>
                  <select
                    value={editFormData.gender || 'MALE'}
                    onChange={(e) => setEditFormData({ ...editFormData, gender: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Blood Group</label>
                  <input
                    type="text"
                    value={editFormData.bloodGroup || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, bloodGroup: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="e.g. B+"
                  />
                </div>
              </div>

              <div className="border-t pt-3 space-y-3">
                <span className="font-bold text-slate-900 block text-xs">Parent Information</span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Father Name</label>
                    <input
                      type="text"
                      value={editFormData.fatherName || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, fatherName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Father Phone</label>
                    <input
                      type="text"
                      value={editFormData.fatherPhone || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, fatherPhone: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Father CNIC</label>
                    <input
                      type="text"
                      value={editFormData.fatherCnic || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, fatherCnic: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Emergency Phone</label>
                    <input
                      type="text"
                      value={editFormData.emergencyPhone || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, emergencyPhone: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Residential Address</label>
                  <input
                    type="text"
                    value={editFormData.address || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow flex items-center gap-1.5"
                >
                  {savingEdit ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>Save Updated Information</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </>
  );
}
