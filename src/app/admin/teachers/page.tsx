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
  BookOpen,
  Layers,
  Trash2,
  Calendar,
  Clock,
  ChevronRight,
  ShieldAlert,
  UserPlus
} from 'lucide-react';
import AdminChipLoader from '@/components/common/AdminChipLoader';

export default function AdminTeachersPage() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbProcessing, setDbProcessing] = useState(false);
  const [dbMessage, setDbMessage] = useState('Saving teaching assignment...');

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTeacherForAssign, setSelectedTeacherForAssign] = useState<any | null>(null);
  const [teacherAssignments, setTeacherAssignments] = useState<any[]>([]);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<any | null>(null);

  // New Teacher Form
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    qualification: 'M.Sc. Mathematics / B.Ed',
    designation: 'Senior Subject Specialist',
    classId: '',
    sectionId: '',
    subjectName: 'Mathematics',
    tempPassword: 'Teacher@123',
  });

  // New Assignment Form State (inside Assignment Modal)
  const [assignForm, setAssignForm] = useState({
    classId: '',
    sectionId: '',
    subjectId: '',
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

  const fetchClasses = () => {
    fetch('/api/classes')
      .then((res) => res.json())
      .then((data) => {
        if (data.classes) {
          setClasses(data.classes);
          if (data.classes.length > 0) {
            setFormData((prev) => ({
              ...prev,
              classId: data.classes[0].id,
              sectionId: data.classes[0].sections?.[0]?.id || '',
            }));
            setAssignForm({
              classId: data.classes[0].id,
              sectionId: data.classes[0].sections?.[0]?.id || '',
              subjectId: data.classes[0].subjects?.[0]?.id || '',
            });
          }
        }
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchTeachers();
    fetchClasses();
  }, []);

  // Fetch specific teacher's assignments
  const openAssignModal = async (teacher: any) => {
    setSelectedTeacherForAssign(teacher);
    setLoadingAssignments(true);
    try {
      const res = await fetch(`/api/teachers/${teacher.id}/assignments`);
      const data = await res.json();
      if (res.ok && data.assignments) {
        setTeacherAssignments(data.assignments);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAssignments(false);
    }
  };

  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setDbProcessing(true);
    setDbMessage('Creating Teacher Account & Provisioning Credentials...');

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
      setDbProcessing(false);
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeacherForAssign) return;

    setDbProcessing(true);
    setDbMessage('Writing Teacher Assignment to PostgreSQL...');

    try {
      const res = await fetch(`/api/teachers/${selectedTeacherForAssign.id}/assignments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assignForm),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        // Refresh assignments
        const assignRes = await fetch(`/api/teachers/${selectedTeacherForAssign.id}/assignments`);
        const assignData = await assignRes.json();
        if (assignData.assignments) setTeacherAssignments(assignData.assignments);
        fetchTeachers();
      } else {
        alert(data.error || 'Failed to add assignment');
      }
    } catch {
      alert('Error adding assignment');
    } finally {
      setDbProcessing(false);
    }
  };

  const handleDeleteAssignment = async (assignmentId: string) => {
    if (!selectedTeacherForAssign) return;
    if (!confirm('Are you sure you want to remove this teaching assignment?')) return;

    setDbProcessing(true);
    setDbMessage('Removing Teaching Assignment from Database...');

    try {
      const res = await fetch(`/api/teachers/${selectedTeacherForAssign.id}/assignments?assignmentId=${assignmentId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTeacherAssignments((prev) => prev.filter((a) => a.id !== assignmentId));
        fetchTeachers();
      } else {
        alert(data.error || 'Failed to remove assignment');
      }
    } catch {
      alert('Error removing assignment');
    } finally {
      setDbProcessing(false);
    }
  };

  // Selected class in assign form for dynamic sections & subjects dropdowns
  const assignSelectedClass = classes.find((c) => c.id === assignForm.classId);
  const assignAvailableSections = assignSelectedClass?.sections || [];
  const assignAvailableSubjects = assignSelectedClass?.subjects || [];

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Top Header Card with Orange/Slate Theme */}
      <div className="flex flex-wrap items-center justify-between gap-4 glass-panel p-6 sm:p-8 rounded-3xl border border-white shadow-sm">
        <div className="space-y-1">
          <span className="text-xs font-black uppercase tracking-wider text-orange-600">
            Faculty Directory & Academic Workload
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            Teacher Management & Relational Assignments
          </h1>
          <p className="text-xs text-slate-500 font-medium max-w-2xl">
            Manage teacher profiles, provision portal login accounts, and assign multi-class subject workflows (<span className="font-mono text-orange-700 font-bold">Teacher → Class → Section → Subject</span>).
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white text-xs font-black flex items-center gap-2 shadow-lg shadow-orange-500/25 transition-all hover:scale-105"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Add New Teacher</span>
        </button>
      </div>

      {/* Teachers Grid */}
      {loading ? (
        <div className="glass-panel p-12 rounded-3xl border border-white shadow-sm">
          <AdminChipLoader message="Loading Faculty Directory..." subMessage="Querying PostgreSQL teacher relations" />
        </div>
      ) : teachers.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl border border-white text-center space-y-3">
          <UserCheck className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="text-sm font-bold text-slate-700">No teachers found</p>
          <p className="text-xs text-slate-400">Click &quot;Add New Teacher&quot; to provision your first faculty member.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {teachers.map((teacher) => (
            <div
              key={teacher.id}
              className="glass-panel p-6 rounded-3xl border border-white shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Header info */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center font-black text-base shadow-md shadow-orange-500/20">
                      {teacher.fullName.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-black text-sm text-slate-900 leading-tight">
                        {teacher.fullName}
                      </h3>
                      <span className="text-[11px] font-mono font-bold text-orange-600 block mt-0.5">
                        {teacher.employeeId}
                      </span>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${
                    teacher.status === 'ACTIVE'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}>
                    {teacher.status}
                  </span>
                </div>

                {/* Qualification & Contact */}
                <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100">
                  <p className="font-medium flex items-center gap-1.5 text-[11px]">
                    <Award className="w-3.5 h-3.5 text-orange-500" />
                    <span>{teacher.qualification || 'Senior Teacher'}</span>
                  </p>
                  <p className="font-medium flex items-center gap-1.5 text-[11px]">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{teacher.email}</span>
                  </p>
                  <p className="font-medium flex items-center gap-1.5 text-[11px] font-mono">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{teacher.phone}</span>
                  </p>
                </div>

                {/* Assigned Classes Preview */}
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 block">
                    Teaching Workload:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {teacher.assignments && teacher.assignments.length > 0 ? (
                      teacher.assignments.map((a: any) => (
                        <span
                          key={a.id}
                          className="px-2 py-1 rounded-lg bg-orange-50 text-orange-800 text-[10px] font-bold border border-orange-200"
                        >
                          {a.class?.name || 'Class'} ({a.section?.name || 'A'}) • {a.subject?.name || 'Subj'}
                        </span>
                      ))
                    ) : teacher.subjects && teacher.subjects.length > 0 ? (
                      teacher.subjects.map((s: any) => (
                        <span
                          key={s.id}
                          className="px-2 py-1 rounded-lg bg-blue-50 text-blue-800 text-[10px] font-bold border border-blue-200"
                        >
                          {s.class?.name} • {s.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">No class assignments yet</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                <button
                  onClick={() => openAssignModal(teacher)}
                  className="flex-1 py-2 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-orange-500/20 transition-all hover:scale-[1.02]"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Assign Classes & Subjects</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ASSIGN CLASSES & SUBJECTS MODAL */}
      {selectedTeacherForAssign && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] uppercase font-black text-orange-600 block">
                  Relational Teaching Assignment Manager
                </span>
                <h3 className="text-xl font-black text-slate-900">
                  {selectedTeacherForAssign.fullName} ({selectedTeacherForAssign.employeeId})
                </h3>
              </div>
              <button
                onClick={() => setSelectedTeacherForAssign(null)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition-colors"
              >
                ✕ Close
              </button>
            </div>

            {/* Active Assignments Table */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-600">
                Active Assignments for this Teacher:
              </h4>

              {loadingAssignments ? (
                <div className="p-8 text-center text-slate-400 text-xs font-medium">
                  Loading current assignments...
                </div>
              ) : teacherAssignments.length === 0 ? (
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center text-xs text-slate-500 font-medium">
                  No explicit class/subject assignments found for this teacher. Add your first assignment below.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden text-xs">
                  <div className="grid grid-cols-12 bg-slate-50 p-3 font-black text-[10px] uppercase tracking-wider text-slate-600">
                    <span className="col-span-4">Class</span>
                    <span className="col-span-3">Section</span>
                    <span className="col-span-4">Subject</span>
                    <span className="col-span-1 text-right">Action</span>
                  </div>
                  {teacherAssignments.map((assign) => (
                    <div key={assign.id} className="grid grid-cols-12 p-3 items-center hover:bg-orange-50/40">
                      <span className="col-span-4 font-bold text-slate-900">{assign.class?.name}</span>
                      <span className="col-span-3 font-semibold text-slate-700">{assign.section?.name}</span>
                      <span className="col-span-4 font-semibold text-orange-900 bg-orange-50 px-2 py-0.5 rounded-md inline-block w-fit">
                        {assign.subject?.name}
                      </span>
                      <div className="col-span-1 text-right">
                        <button
                          onClick={() => handleDeleteAssignment(assign.id)}
                          className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Remove assignment"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* + Add New Assignment Form */}
            <form onSubmit={handleCreateAssignment} className="bg-gradient-to-br from-orange-50/80 to-amber-50/80 p-5 rounded-3xl border border-orange-200 space-y-4">
              <div className="flex items-center gap-2 text-orange-950 font-black text-xs uppercase tracking-wider">
                <Plus className="w-4 h-4 text-orange-600" />
                <span>Assign New Class, Section & Subject</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-orange-950 mb-1">Select Class</label>
                  <select
                    value={assignForm.classId}
                    onChange={(e) => {
                      const newCId = e.target.value;
                      const cls = classes.find((c) => c.id === newCId);
                      setAssignForm({
                        classId: newCId,
                        sectionId: cls?.sections?.[0]?.id || '',
                        subjectId: cls?.subjects?.[0]?.id || '',
                      });
                    }}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-orange-300 bg-white font-medium focus:ring-2 focus:ring-orange-500 outline-none"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-orange-950 mb-1">Select Section</label>
                  <select
                    value={assignForm.sectionId}
                    onChange={(e) => setAssignForm({ ...assignForm, sectionId: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-orange-300 bg-white font-medium focus:ring-2 focus:ring-orange-500 outline-none"
                  >
                    {assignAvailableSections.length > 0 ? (
                      assignAvailableSections.map((sec: any) => (
                        <option key={sec.id} value={sec.id}>{sec.name}</option>
                      ))
                    ) : (
                      <option value="">No sections configured</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-orange-950 mb-1">Select Subject</label>
                  <select
                    value={assignForm.subjectId}
                    onChange={(e) => setAssignForm({ ...assignForm, subjectId: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-orange-300 bg-white font-medium focus:ring-2 focus:ring-orange-500 outline-none"
                  >
                    {assignAvailableSubjects.length > 0 ? (
                      assignAvailableSubjects.map((sub: any) => (
                        <option key={sub.id} value={sub.id}>{sub.name}</option>
                      ))
                    ) : (
                      <option value="">No subjects found</option>
                    )}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-black text-xs rounded-2xl shadow-lg shadow-orange-500/25 transition-all hover:scale-[1.01]"
              >
                + Save Relational Assignment (PostgreSQL)
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CREATE NEW TEACHER MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] uppercase font-black text-orange-600 block">
                  Faculty Registration
                </span>
                <h3 className="text-xl font-black text-slate-900">
                  Add New Teacher
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition-colors"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleAddTeacher} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-900 mb-1">Teacher Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Engr. Farooq Ahmad"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 outline-none font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-900 mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+92 300 1234567"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-900 mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="teacher@thms.edu.pk"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 outline-none font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-900 mb-1">Academic Qualification</label>
                  <input
                    type="text"
                    value={formData.qualification}
                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 outline-none font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-900 mb-1">Initial Password</label>
                  <input
                    type="text"
                    value={formData.tempPassword}
                    onChange={(e) => setFormData({ ...formData, tempPassword: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 outline-none font-mono font-bold text-rose-600"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-black text-xs rounded-2xl shadow-lg shadow-orange-500/25 transition-all hover:scale-[1.01]"
              >
                + Create Teacher & Generate Account
              </button>
            </form>
          </div>
        </div>
      )}

      {/* FULL-SCREEN AI CHIP LOADER ON DB TRANSACTIONS */}
      {dbProcessing && (
        <AdminChipLoader isFullScreen message={dbMessage} subMessage="Synchronizing with Neon PostgreSQL Cluster" />
      )}
    </div>
  );
}
