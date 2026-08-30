'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  UserCheck, 
  Search, 
  Plus, 
  Mail, 
  Phone, 
  MapPin, 
  Award, 
  Printer, 
  CheckCircle2, 
  X, 
  Key,
  Sparkles,
  BookOpen
} from 'lucide-react';

export default function AdminTeachersPage() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<any | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    qualification: '',
    designation: 'Subject Teacher',
    classId: '',
    subjectName: 'Mathematics',
    tempPassword: 'Teacher@123',
  });

  const fetchTeachers = () => {
    setLoading(true);
    fetch('/api/teachers')
      .then((res) => res.json())
      .then((data) => {
        if (data.teachers) setTeachers(data.teachers);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTeachers();
    fetch('/api/classes')
      .then((res) => res.json())
      .then((data) => {
        if (data.classes) {
          setClasses(data.classes);
          if (data.classes.length > 0) {
            setFormData((prev) => ({ ...prev, classId: data.classes[0].id }));
          }
        }
      })
      .catch(console.error);
  }, []);

  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch('/api/teachers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setCreatedCredentials(data.credentials);
        setShowAddModal(false);
        fetchTeachers();
      } else {
        alert(data.error || 'Failed to create teacher');
      }
    } catch {
      alert('Error creating teacher');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
            Faculty Directory
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
            Teachers & Faculty Management
          </h1>
          <p className="text-xs text-slate-500">
            Assigned classes, subjects, qualification profiles, and teaching schedules.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/users?role=TEACHER"
            className="px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors border border-amber-200"
          >
            <Key className="w-4 h-4" />
            <span>Login & Passwords</span>
          </Link>
          <button
            onClick={() => {
              setFormData({
                fullName: '',
                phone: '',
                email: '',
                qualification: '',
                designation: 'Senior Subject Teacher',
                classId: classes[0]?.id || '',
                subjectName: 'Mathematics',
                tempPassword: 'Teacher@123',
              });
              setShowAddModal(true);
            }}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add New Teacher</span>
          </button>
        </div>
      </div>

      {/* Teachers Grid or Smart Empty State */}
      {teachers.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-12 text-center space-y-4 max-w-md mx-auto">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
            <UserCheck className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900">No teachers added yet</h3>
            <p className="text-xs text-slate-500 mt-1">
              Start by creating your academic faculty. Portal credentials will be generated automatically.
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow transition-all inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add First Teacher</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teachers.map((t) => (
            <div key={t.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-lg">
                  {t.fullName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{t.fullName}</h3>
                  <p className="text-xs text-emerald-700 font-semibold">{t.designation}</p>
                  <span className="text-[10px] font-mono text-slate-400">{t.employeeId}</span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 border-t pt-3">
                <p className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">{t.email}</span>
                </p>
                <p className="flex items-center gap-2 font-mono">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{t.phone}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Award className="w-3.5 h-3.5 text-slate-400" />
                  <span>{t.qualification}</span>
                </p>
              </div>

              <div className="pt-2 border-t text-xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Assigned Subjects:</span>
                <div className="flex flex-wrap gap-1">
                  {t.subjects && t.subjects.length > 0 ? (
                    t.subjects.map((s: any) => (
                      <span key={s.id} className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[10px] font-semibold">
                        {s.name} ({s.class?.name || 'Class'})
                      </span>
                    ))
                  ) : (
                    <span className="text-[10px] text-slate-400 italic">No subjects assigned</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Teacher Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 animate-in zoom-in-95">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">Add New Faculty Teacher</h3>
                <p className="text-xs text-slate-500">Creates profile, portal login, and subject teaching assignment</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddTeacher} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="e.g. Engr. Farooq Ahmad"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+92 333 1234567"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="teacher@hayatabadmodel.edu.pk"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Qualification</label>
                  <input
                    type="text"
                    value={formData.qualification}
                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                    placeholder="e.g. M.Sc. Mathematics"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Designation</label>
                  <input
                    type="text"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    placeholder="Senior Subject Teacher"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Subject Assignment</label>
                  <input
                    type="text"
                    value={formData.subjectName}
                    onChange={(e) => setFormData({ ...formData, subjectName: e.target.value })}
                    placeholder="e.g. Mathematics"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Temporary Initial Password</label>
                  <input
                    type="password"
                    value={formData.tempPassword}
                    onChange={(e) => setFormData({ ...formData, tempPassword: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none font-mono"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Teacher will be required to change password on first login.</span>
                </div>
              </div>

              <div className="pt-4 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl shadow transition-all"
                >
                  {creating ? 'Creating Account...' : 'Save & Generate Login'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Credentials Created Slip Modal */}
      {createdCredentials && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 text-center animate-in zoom-in-95">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Teacher Account Generated!</h3>
              <p className="text-xs text-slate-500 mt-0.5">Print or hand over these credentials to the teacher.</p>
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-left text-xs space-y-2.5">
              <p>Teacher: <strong>{createdCredentials.fullName}</strong></p>
              <p>Employee ID: <code className="font-bold font-mono text-emerald-800">{createdCredentials.employeeId}</code></p>
              <p>Portal Username: <code className="font-bold font-mono">{createdCredentials.username}</code></p>
              <p>Temporary Password: <code className="font-mono bg-white px-2 py-0.5 rounded border">{createdCredentials.temporaryPassword}</code></p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Print Login Slip</span>
              </button>
              <button
                onClick={() => setCreatedCredentials(null)}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
