'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  UserCheck, 
  Search, 
  Plus, 
  Mail, 
  Phone, 
  Award, 
  CheckCircle2, 
  X, 
  Layers, 
  Trash2, 
  Clock, 
  ChevronRight, 
  Calendar,
  Sparkles,
  BookOpen,
  Info
} from 'lucide-react';
import AdminChipLoader from '@/components/common/AdminChipLoader';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import StatusBadge from '@/components/ui/StatusBadge';
import Input, { Select } from '@/components/ui/Input';

export default function AdminTeachersPage() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbProcessing, setDbProcessing] = useState(false);
  const [dbMessage, setDbMessage] = useState('Saving...');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTeacherForAssign, setSelectedTeacherForAssign] = useState<any | null>(null);
  const [teacherAssignments, setTeacherAssignments] = useState<any[]>([]);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<any | null>(null);

  // New Teacher Eligibility Form
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    department: 'Mathematics & Natural Sciences',
    designation: 'Senior Subject Specialist',
    qualification: 'M.Sc. Mathematics / B.Ed',
    qualifiedSubjects: 'Mathematics, Physics',
    workingDays: 'MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY,SATURDAY',
    availableFrom: '08:00',
    availableTo: '14:30',
    maxDailyPeriods: 6,
    maxWeeklyPeriods: 30,
    isClassTeacherEligible: true,
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
        if (data.classes && data.classes.length > 0) {
          setClasses(data.classes);
          setAssignForm({
            classId: data.classes[0].id,
            sectionId: data.classes[0].sections?.[0]?.id || '',
            subjectId: data.classes[0].subjects?.[0]?.id || '',
          });
        }
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchTeachers();
    fetchClasses();
  }, []);

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
    setDbMessage('Creating Teacher Profile & Eligibility Record...');

    try {
      const qualifiedArray = formData.qualifiedSubjects
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        ...formData,
        qualifiedSubjects: qualifiedArray,
      };

      const res = await fetch('/api/teachers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
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
    setDbMessage('Saving relational teaching assignment...');

    try {
      const res = await fetch(`/api/teachers/${selectedTeacherForAssign.id}/assignments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assignForm),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        openAssignModal(selectedTeacherForAssign);
        fetchTeachers();
      } else {
        alert(data.error || 'Failed to assign class');
      }
    } catch {
      alert('Error creating assignment');
    } finally {
      setDbProcessing(false);
    }
  };

  const handleDeleteAssignment = async (assignmentId: string) => {
    if (!confirm('Are you sure you want to remove this teaching assignment?')) return;
    setDbProcessing(true);
    setDbMessage('Removing assignment record...');

    try {
      const res = await fetch(`/api/teachers/assignments/${assignmentId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        openAssignModal(selectedTeacherForAssign);
        fetchTeachers();
      }
    } catch {
      alert('Error deleting assignment');
    } finally {
      setDbProcessing(false);
    }
  };

  const filteredTeachers = teachers.filter((t) => {
    const q = searchQuery.toLowerCase();
    return (
      t.fullName.toLowerCase().includes(q) ||
      t.employeeId.toLowerCase().includes(q) ||
      (t.department && t.department.toLowerCase().includes(q)) ||
      (t.email && t.email.toLowerCase().includes(q))
    );
  });

  const selectedClassObj = classes.find((c) => c.id === assignForm.classId);
  const assignAvailableSections = selectedClassObj?.sections || [];
  const assignAvailableSubjects = selectedClassObj?.subjects || [];

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header Card */}
      <div className="bg-[#0F2A5F] text-white p-6 sm:p-8 rounded-3xl border border-[#173B7A] shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2563EB]/25 text-blue-200 text-xs font-bold border border-[#2563EB]/40">
            <Sparkles className="w-3.5 h-3.5 text-blue-300" />
            <span>Faculty Architecture & Workload Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Faculty Directory & Eligibility Management
          </h1>
          <p className="text-xs sm:text-sm text-blue-100/80 leading-relaxed">
            Centralized registry of teachers, subject qualifications, availability constraints, and automated timetable scheduling eligibility.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setShowAddModal(true)}
          className="shadow-md shrink-0"
        >
          Add New Faculty Member
        </Button>
      </div>

      {/* Info Notice Banner */}
      <div className="p-4 rounded-2xl bg-[#EFF6FF] border border-[#BFDBFE] text-xs text-[#1E3A8A] flex items-start gap-3">
        <Info className="w-5 h-5 text-[#2563EB] shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">Authoritative Scheduling Rule:</p>
          <p className="mt-0.5 text-[#334155]">
            Teacher schedules are automatically derived from the central timetable and availability rules. Adding a teacher establishes their subject qualifications and availability bounds without forcing fixed class assignments.
          </p>
        </div>
      </div>

      {/* Credentials Modal Alert after Creation */}
      {createdCredentials && (
        <div className="p-6 rounded-3xl bg-[#F0FDF4] border border-[#BBF7D0] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#16A34A] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Account Provisioned Successfully
            </span>
            <h4 className="text-base font-black text-[#0F172A]">
              Faculty Credentials for {createdCredentials.fullName}
            </h4>
            <div className="flex flex-wrap items-center gap-4 text-xs mt-2 font-mono">
              <span className="bg-white px-3 py-1.5 rounded-xl border border-[#BBF7D0] text-[#0F172A]">
                Username: <strong>{createdCredentials.username}</strong>
              </span>
              <span className="bg-white px-3 py-1.5 rounded-xl border border-[#BBF7D0] text-[#0F172A]">
                Password: <strong>{createdCredentials.temporaryPassword}</strong>
              </span>
            </div>
          </div>
          <Button variant="secondary" size="sm" onClick={() => setCreatedCredentials(null)}>
            Dismiss Notice
          </Button>
        </div>
      )}

      {/* Search & Filter Bar */}
      <Card padding="sm" className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search faculty by name, employee ID, or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#F8FAFC] text-sm text-[#0F172A] placeholder-[#94A3B8] rounded-xl border border-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:bg-white transition-all"
          />
        </div>
        <span className="text-xs font-bold text-[#64748B]">
          Showing {filteredTeachers.length} Registered Faculty Member(s)
        </span>
      </Card>

      {/* Teachers Roster Grid */}
      {loading ? (
        <div className="p-12 text-center text-[#64748B] text-sm">
          Loading faculty records and workload metrics...
        </div>
      ) : filteredTeachers.length === 0 ? (
        <Card className="text-center p-12 space-y-3">
          <UserCheck className="w-12 h-12 text-[#94A3B8] mx-auto" />
          <h3 className="text-base font-bold text-[#0F172A]">No Faculty Records Found</h3>
          <p className="text-xs text-[#64748B] max-w-md mx-auto">
            {searchQuery
              ? `No teachers match the search criteria "${searchQuery}".`
              : 'Get started by creating your first faculty profile.'}
          </p>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowAddModal(true)}
            className="mt-2"
          >
            Add New Teacher
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredTeachers.map((teacher) => {
            const workload = teacher.workload || { weeklyPeriods: 0, maxWeekly: 30, maxDaily: 6 };
            const qualifications = teacher.parsedQualifications || [];

            return (
              <Card key={teacher.id} hoverEffect className="flex flex-col justify-between space-y-5">
                <div className="space-y-4">
                  {/* Top info */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#2563EB] text-white flex items-center justify-center font-black text-base shadow-sm">
                        {teacher.fullName.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-[#0F172A] leading-tight">
                          {teacher.fullName}
                        </h3>
                        <span className="text-[11px] font-mono font-bold text-[#2563EB] block mt-0.5">
                          {teacher.employeeId}
                        </span>
                        {teacher.department && (
                          <span className="text-[10px] text-[#64748B] block">
                            {teacher.department}
                          </span>
                        )}
                      </div>
                    </div>
                    <StatusBadge status={teacher.status || 'ACTIVE'} size="sm" />
                  </div>

                  {/* Qualification & Contact Info */}
                  <div className="space-y-1.5 text-xs text-[#475569] bg-[#F8FAFC] p-3.5 rounded-xl border border-[#E2E8F0]">
                    <p className="font-medium flex items-center gap-1.5 text-[11px]">
                      <Award className="w-3.5 h-3.5 text-[#2563EB]" />
                      <span>{teacher.qualification || 'Subject Specialist'}</span>
                    </p>
                    <p className="font-medium flex items-center gap-1.5 text-[11px]">
                      <Mail className="w-3.5 h-3.5 text-[#64748B]" />
                      <span className="truncate">{teacher.email}</span>
                    </p>
                    <p className="font-medium flex items-center gap-1.5 text-[11px] font-mono">
                      <Phone className="w-3.5 h-3.5 text-[#64748B]" />
                      <span>{teacher.phone}</span>
                    </p>
                  </div>

                  {/* Qualified Subjects Tags */}
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#64748B] block">
                      Qualified Subjects:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {qualifications.length > 0 ? (
                        qualifications.map((q: string, idx: number) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-lg bg-[#EFF6FF] text-[#1E40AF] text-[10px] font-bold border border-[#BFDBFE]"
                          >
                            {q}
                          </span>
                        ))
                      ) : (
                        <span className="text-[11px] text-[#94A3B8] italic">All academic subjects</span>
                      )}
                    </div>
                  </div>

                  {/* Workload Indicator */}
                  <div className="p-3 rounded-xl bg-white border border-[#E2E8F0] space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-[#475569]">Weekly Schedule Load</span>
                      <span className="text-[#2563EB]">
                        {workload.weeklyPeriods} / {workload.maxWeekly} periods
                      </span>
                    </div>
                    <div className="w-full bg-[#E2E8F0] rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-1.5 rounded-full transition-all ${
                          workload.isOverloaded
                            ? 'bg-[#DC2626]'
                            : workload.weeklyPeriods > workload.maxWeekly * 0.75
                            ? 'bg-[#F59E0B]'
                            : 'bg-[#2563EB]'
                        }`}
                        style={{
                          width: `${Math.min(100, Math.round((workload.weeklyPeriods / (workload.maxWeekly || 30)) * 100))}%`,
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-[#64748B]">
                      <span>Max daily: {workload.maxDaily} periods</span>
                      <span>{workload.utilizationPct || 0}% Utilized</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-[#E2E8F0] flex items-center gap-2">
                  <Link
                    href={`/admin/academics/timetable?teacherId=${teacher.id}`}
                    className="flex-1 py-2 bg-white hover:bg-[#F8FAFC] text-[#2563EB] font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 border border-[#BFDBFE] transition-colors"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>View Schedule</span>
                  </Link>
                  <button
                    onClick={() => openAssignModal(teacher)}
                    className="flex-1 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Manage Classes</span>
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* CREATE NEW TEACHER & ELIGIBILITY MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#E2E8F0] p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#2563EB] block">
                  Faculty Registration
                </span>
                <h3 className="text-xl font-black text-[#0F172A]">
                  Register Faculty & Eligibility Rules
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 rounded-xl bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#475569] text-xs font-bold transition-colors"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleAddTeacher} className="space-y-4 text-xs">
              <Input
                label="Full Name"
                required
                placeholder="e.g. Prof. Arshad Khan"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Phone Number"
                  placeholder="+92 300 1234567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="faculty@hayatabadmodel.edu.pk"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Department"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                />
                <Input
                  label="Designation"
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                />
              </div>

              <Input
                label="Academic Qualifications"
                value={formData.qualification}
                onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
              />

              <Input
                label="Qualified Subjects (Comma separated)"
                placeholder="e.g. Mathematics, Physics, General Science"
                helperText="Scheduling engine will only allow timetable assignments matching these qualified subjects."
                value={formData.qualifiedSubjects}
                onChange={(e) => setFormData({ ...formData, qualifiedSubjects: e.target.value })}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Available From Time"
                  type="time"
                  value={formData.availableFrom}
                  onChange={(e) => setFormData({ ...formData, availableFrom: e.target.value })}
                />
                <Input
                  label="Available To Time"
                  type="time"
                  value={formData.availableTo}
                  onChange={(e) => setFormData({ ...formData, availableTo: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Max Daily Periods Limit"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.maxDailyPeriods}
                  onChange={(e) => setFormData({ ...formData, maxDailyPeriods: parseInt(e.target.value, 10) || 6 })}
                />
                <Input
                  label="Max Weekly Periods Limit"
                  type="number"
                  min="1"
                  max="40"
                  value={formData.maxWeeklyPeriods}
                  onChange={(e) => setFormData({ ...formData, maxWeeklyPeriods: parseInt(e.target.value, 10) || 30 })}
                />
              </div>

              <Input
                label="Initial Portal Password"
                value={formData.tempPassword}
                onChange={(e) => setFormData({ ...formData, tempPassword: e.target.value })}
                helperText="Faculty member will be required to change this upon initial login."
              />

              <div className="pt-2">
                <Button type="submit" variant="primary" size="md" className="w-full">
                  Create Faculty Member & Set Eligibility
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ASSIGN CLASSES MODAL */}
      {selectedTeacherForAssign && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#E2E8F0] p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#2563EB] block">
                  Class Assignment Manager
                </span>
                <h3 className="text-xl font-black text-[#0F172A]">
                  {selectedTeacherForAssign.fullName} ({selectedTeacherForAssign.employeeId})
                </h3>
              </div>
              <button
                onClick={() => setSelectedTeacherForAssign(null)}
                className="p-2 rounded-xl bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#475569] text-xs font-bold transition-colors"
              >
                ✕ Close
              </button>
            </div>

            {/* Active Assignments Table */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#475569]">
                Active Class Assignments:
              </h4>

              {loadingAssignments ? (
                <div className="p-8 text-center text-[#64748B] text-xs">
                  Loading current assignments...
                </div>
              ) : teacherAssignments.length === 0 ? (
                <div className="p-6 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] text-center text-xs text-[#64748B]">
                  No explicit class assignments. Teacher can still be scheduled dynamically in the master timetable.
                </div>
              ) : (
                <div className="divide-y divide-[#E2E8F0] border border-[#E2E8F0] rounded-2xl overflow-hidden text-xs">
                  <div className="grid grid-cols-12 bg-[#F8FAFC] p-3 font-bold text-[10px] uppercase tracking-wider text-[#475569]">
                    <span className="col-span-4">Class</span>
                    <span className="col-span-3">Section</span>
                    <span className="col-span-4">Subject</span>
                    <span className="col-span-1 text-right">Action</span>
                  </div>
                  {teacherAssignments.map((assign) => (
                    <div key={assign.id} className="grid grid-cols-12 p-3 items-center hover:bg-[#EFF6FF]">
                      <span className="col-span-4 font-bold text-[#0F172A]">{assign.class?.name}</span>
                      <span className="col-span-3 text-[#475569]">{assign.section?.name}</span>
                      <span className="col-span-4 text-[#2563EB] font-bold">
                        {assign.subject?.name}
                      </span>
                      <div className="col-span-1 text-right">
                        <button
                          onClick={() => handleDeleteAssignment(assign.id)}
                          className="p-1 text-[#DC2626] hover:bg-[#FEF2F2] rounded-lg transition-colors"
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
            <form onSubmit={handleCreateAssignment} className="bg-[#F8FAFC] p-5 rounded-2xl border border-[#E2E8F0] space-y-4">
              <div className="flex items-center gap-2 text-[#0F172A] font-bold text-xs uppercase tracking-wider">
                <Plus className="w-4 h-4 text-[#2563EB]" />
                <span>Add Class & Subject Assignment</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Select
                  label="Select Class"
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
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </Select>

                <Select
                  label="Select Section"
                  value={assignForm.sectionId}
                  onChange={(e) => setAssignForm({ ...assignForm, sectionId: e.target.value })}
                >
                  {assignAvailableSections.length > 0 ? (
                    assignAvailableSections.map((sec: any) => (
                      <option key={sec.id} value={sec.id}>{sec.name}</option>
                    ))
                  ) : (
                    <option value="">No sections</option>
                  )}
                </Select>

                <Select
                  label="Select Subject"
                  value={assignForm.subjectId}
                  onChange={(e) => setAssignForm({ ...assignForm, subjectId: e.target.value })}
                >
                  {assignAvailableSubjects.length > 0 ? (
                    assignAvailableSubjects.map((sub: any) => (
                      <option key={sub.id} value={sub.id}>{sub.name}</option>
                    ))
                  ) : (
                    <option value="">No subjects</option>
                  )}
                </Select>
              </div>

              <Button type="submit" variant="primary" size="md" className="w-full">
                Save Teaching Assignment
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* FULL-SCREEN LOADER ON DB TRANSACTIONS */}
      {dbProcessing && (
        <AdminChipLoader isFullScreen message={dbMessage} subMessage="Synchronizing with Database" />
      )}
    </div>
  );
}
