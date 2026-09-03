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
  Info,
  RefreshCw
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

  // Subject confirmation via Enter key state
  const [subjectInput, setSubjectInput] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(['Mathematics', 'Physics']);

  // AI Auto-Scheduling Assistant States
  const [aiStep, setAiStep] = useState<'FORM' | 'REVIEW'>('FORM');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiProposals, setAiProposals] = useState<any[]>([]);
  const [aiSummary, setAiSummary] = useState<any | null>(null);
  const [acceptedSlotIds, setAcceptedSlotIds] = useState<Set<string>>(new Set());

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

  const handleAddSubjectChip = (subj: string) => {
    const clean = subj.trim();
    if (!clean) return;
    if (!selectedSubjects.some((s) => s.toLowerCase() === clean.toLowerCase())) {
      setSelectedSubjects((prev) => [...prev, clean]);
    }
    setSubjectInput('');
  };

  const handleSubjectKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSubjectChip(subjectInput);
    }
  };

  const handleRemoveSubjectChip = (subjToRemove: string) => {
    setSelectedSubjects((prev) => prev.filter((s) => s !== subjToRemove));
  };

  const handleGenerateAiSchedule = async () => {
    if (!formData.fullName.trim()) {
      alert('Please enter the faculty member full name first.');
      return;
    }
    if (selectedSubjects.length === 0) {
      alert('Please enter and confirm at least one teaching subject (press Enter to add subject).');
      return;
    }

    setAiGenerating(true);
    try {
      const res = await fetch('/api/admin/timetable/ai-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherName: formData.fullName,
          qualifiedSubjects: selectedSubjects,
          workingDays: formData.workingDays.split(',').map((d) => d.trim()),
          availableFrom: formData.availableFrom,
          availableTo: formData.availableTo,
          maxDailyPeriods: formData.maxDailyPeriods,
          maxWeeklyPeriods: formData.maxWeeklyPeriods,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setAiProposals(data.proposedSlots || []);
        setAiSummary(data.summary || null);
        setAcceptedSlotIds(new Set((data.proposedSlots || []).map((s: any) => s.id)));
        setAiStep('REVIEW');
      } else {
        alert(data.error || 'Failed to generate AI schedule proposal.');
      }
    } catch {
      alert('Network error communicating with AI scheduling assistant.');
    } finally {
      setAiGenerating(false);
    }
  };

  const handleToggleAcceptSlot = (slotId: string) => {
    setAcceptedSlotIds((prev) => {
      const next = new Set(prev);
      if (next.has(slotId)) next.delete(slotId);
      else next.add(slotId);
      return next;
    });
  };

  const handleAcceptAllValid = () => {
    setAcceptedSlotIds(new Set(aiProposals.map((s) => s.id)));
  };

  const handleAddTeacher = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setDbProcessing(true);
    setDbMessage('Creating Teacher Profile & Committing Approved Timetable...');

    try {
      const payload = {
        ...formData,
        qualifiedSubjects: selectedSubjects,
      };

      // 1. Create Teacher Profile
      const res = await fetch('/api/teachers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error || 'Failed to create teacher');
        setDbProcessing(false);
        return;
      }

      const createdTeacher = data.teacher;
      const credentials = data.credentials;

      // 2. Commit Approved AI Timetable Slots if any
      const approvedSlotsToCommit = aiProposals.filter((s) => acceptedSlotIds.has(s.id));
      if (approvedSlotsToCommit.length > 0 && createdTeacher?.id) {
        setDbMessage(`Saving ${approvedSlotsToCommit.length} official timetable slots...`);
        const ttRes = await fetch('/api/admin/timetable/ai-schedule', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            teacherId: createdTeacher.id,
            approvedSlots: approvedSlotsToCommit,
          }),
        });
        const ttData = await ttRes.json();
        if (!ttRes.ok) {
          console.warn('Timetable commit warning:', ttData.error);
        }
      }

      setCreatedCredentials(credentials);
      setShowAddModal(false);
      setAiStep('FORM');
      setAiProposals([]);
      fetchTeachers();
    } catch {
      alert('Error creating teacher and timetable');
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

      {/* CREATE NEW TEACHER & AI TIMETABLE SCHEDULER MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-[#E2E8F0] p-6 sm:p-8 space-y-6">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold text-[#2563EB] tracking-wider">
                    {aiStep === 'FORM' ? 'Step 1: Faculty Registration' : 'Step 2: AI Timetable Review & Approval'}
                  </span>
                  {aiStep === 'REVIEW' && (
                    <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-[10px] font-extrabold flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-purple-600" />
                      AI Assisted
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-black text-[#0F172A] mt-0.5">
                  {aiStep === 'FORM' ? 'Register Faculty & Teaching Eligibility' : `Review AI Proposed Timetable for ${formData.fullName}`}
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setAiStep('FORM');
                  setAiProposals([]);
                }}
                className="p-2 rounded-xl bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#475569] text-xs font-bold transition-colors"
              >
                ✕ Close
              </button>
            </div>

            {aiStep === 'FORM' ? (
              /* STEP 1: FORM WITH ENTER-KEY SUBJECT TAGS */
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleGenerateAiSchedule();
                }}
                className="space-y-4 text-xs"
              >
                <Input
                  label="Full Name"
                  required
                  placeholder="e.g. Prof. Ahmad Khan"
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

                {/* ENTER-KEY / SUBJECT CONFIRMATION SECTION */}
                <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-extrabold text-[#0F172A] text-xs flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4 text-[#2563EB]" />
                        <span>Teaching Subjects (Press Enter to Confirm)</span>
                        <span className="text-red-500">*</span>
                      </label>
                      <p className="text-[11px] text-[#475569] mt-0.5">
                        Type subject name and press <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono text-[10px] text-slate-800 shadow-sm">Enter</kbd> to add to eligibility list.
                      </p>
                    </div>
                    <span className="text-xs font-bold text-[#2563EB]">
                      {selectedSubjects.length} subject(s) added
                    </span>
                  </div>

                  {/* Subject Input Field */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. Science, Mathematics, English, Urdu, Physics..."
                      value={subjectInput}
                      onChange={(e) => setSubjectInput(e.target.value)}
                      onKeyDown={handleSubjectKeyDown}
                      className="flex-1 px-3 py-2 text-xs rounded-xl border border-blue-300 focus:outline-none focus:ring-2 focus:ring-[#2563EB] bg-white font-medium shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddSubjectChip(subjectInput)}
                      className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Subject</span>
                    </button>
                  </div>

                  {/* Selected Subject Chips */}
                  {selectedSubjects.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {selectedSubjects.map((subj) => (
                        <span
                          key={subj}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-[#1E3A8A] font-bold text-xs border border-blue-300 shadow-sm animate-in zoom-in-95"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{subj}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSubjectChip(subj)}
                            className="w-4 h-4 rounded-full bg-blue-100 hover:bg-red-100 text-blue-700 hover:text-red-700 flex items-center justify-center text-[10px] font-bold transition-colors ml-1"
                            title="Remove subject"
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* School Catalog Quick Picks */}
                  <div className="pt-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                      Quick Suggestions from School Catalog:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        'Science',
                        'Mathematics',
                        'English',
                        'Urdu',
                        'Computer',
                        'Physics',
                        'Chemistry',
                        'Biology',
                        'Islamiat',
                        'Social Studies',
                      ].map((catSubject) => {
                        const isSelected = selectedSubjects.some(
                          (s) => s.toLowerCase() === catSubject.toLowerCase()
                        );
                        return (
                          <button
                            key={catSubject}
                            type="button"
                            disabled={isSelected}
                            onClick={() => handleAddSubjectChip(catSubject)}
                            className={`px-2.5 py-1 text-[11px] rounded-lg border font-medium transition-all ${
                              isSelected
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 opacity-60 cursor-not-allowed'
                                : 'bg-white hover:bg-blue-100 text-slate-700 border-slate-200 hover:border-blue-300'
                            }`}
                          >
                            {isSelected ? `✓ ${catSubject}` : `+ ${catSubject}`}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

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

                {/* Multi-action Submit Buttons */}
                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={handleGenerateAiSchedule}
                    disabled={aiGenerating || !formData.fullName || selectedSubjects.length === 0}
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all"
                  >
                    {aiGenerating ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>AI Inspecting School Schedule & Conflicts...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                        <span>AI Auto-Schedule & Review Proposal</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAddTeacher()}
                    disabled={dbProcessing || !formData.fullName}
                    className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl border border-slate-300 transition-colors"
                  >
                    Register Only (Manual Schedule Later)
                  </button>
                </div>
              </form>
            ) : (
              /* STEP 2: AI PROPOSAL REVIEW TABLE */
              <div className="space-y-5 text-xs">
                
                {/* AI Summary Banner */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 border border-purple-200 flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase text-purple-700 tracking-wider">
                      AI Schedule Analysis Completed
                    </span>
                    <p className="text-xs text-slate-700 font-medium">
                      Found <strong className="text-purple-900">{aiProposals.length} conflict-free slots</strong> across {aiSummary?.classesCovered?.length || 0} classes for {formData.fullName}.
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Estimated weekly teaching workload: {aiSummary?.weeklyWorkloadHours || 0} hours (Max cap: {formData.maxWeeklyPeriods} periods).
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleAcceptAllValid}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-sm transition-colors"
                    >
                      ✓ Accept All Valid ({aiProposals.length})
                    </button>
                    <button
                      type="button"
                      onClick={handleGenerateAiSchedule}
                      disabled={aiGenerating}
                      className="px-3 py-1.5 bg-white hover:bg-slate-100 text-purple-700 border border-purple-300 rounded-xl font-bold text-xs transition-colors flex items-center gap-1"
                    >
                      <RefreshCw className={`w-3 h-3 ${aiGenerating ? 'animate-spin' : ''}`} />
                      <span>Regenerate</span>
                    </button>
                  </div>
                </div>

                {/* Human Review Table */}
                <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                  <div className="max-h-[380px] overflow-y-auto">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-100 text-slate-700 text-[10px] uppercase tracking-wider font-extrabold sticky top-0 z-10 border-b border-slate-200">
                        <tr>
                          <th className="p-3 w-10 text-center">Status</th>
                          <th className="p-3">Day & Period</th>
                          <th className="p-3">Class & Section</th>
                          <th className="p-3">Subject</th>
                          <th className="p-3">Room</th>
                          <th className="p-3">AI Reasoning & Confidence</th>
                          <th className="p-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 text-xs">
                        {aiProposals.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="p-8 text-center text-slate-400">
                              No open slots found matching this teacher's availability and qualified subjects.
                            </td>
                          </tr>
                        ) : (
                          aiProposals.map((slot) => {
                            const isAccepted = acceptedSlotIds.has(slot.id);
                            return (
                              <tr
                                key={slot.id}
                                className={`transition-colors ${
                                  isAccepted ? 'bg-emerald-50/40 hover:bg-emerald-50/70' : 'bg-slate-50/60 opacity-60'
                                }`}
                              >
                                <td className="p-3 text-center">
                                  <input
                                    type="checkbox"
                                    checked={isAccepted}
                                    onChange={() => handleToggleAcceptSlot(slot.id)}
                                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                  />
                                </td>
                                <td className="p-3">
                                  <span className="font-bold text-slate-900 block">{slot.dayOfWeek}</span>
                                  <span className="text-[10px] text-blue-700 font-semibold">
                                    {slot.periodLabel} ({slot.startTime} - {slot.endTime})
                                  </span>
                                </td>
                                <td className="p-3 font-semibold text-slate-800">
                                  {slot.className} - {slot.sectionName}
                                </td>
                                <td className="p-3">
                                  <span className="px-2 py-0.5 rounded-lg bg-blue-100 text-blue-800 font-bold text-[11px]">
                                    {slot.subjectName}
                                  </span>
                                </td>
                                <td className="p-3 font-mono text-slate-600">
                                  {slot.roomNo}
                                </td>
                                <td className="p-3 max-w-xs">
                                  <div className="flex items-center gap-1.5 mb-0.5">
                                    <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-black text-[9px]">
                                      {slot.confidence}% Match
                                    </span>
                                    <span className="text-[10px] text-slate-400">0 conflicts found</span>
                                  </div>
                                  <p className="text-[10px] text-slate-500 leading-tight">
                                    {slot.reason}
                                  </p>
                                </td>
                                <td className="p-3 text-right">
                                  <button
                                    type="button"
                                    onClick={() => handleToggleAcceptSlot(slot.id)}
                                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                                      isAccepted
                                        ? 'bg-emerald-600 hover:bg-red-600 text-white'
                                        : 'bg-slate-200 hover:bg-emerald-600 hover:text-white text-slate-700'
                                    }`}
                                  >
                                    {isAccepted ? 'Accepted' : 'Accept Slot'}
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Bottom Action Bar */}
                <div className="pt-2 flex items-center justify-between border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setAiStep('FORM')}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
                  >
                    ← Back to Teacher Details
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAddTeacher()}
                    disabled={dbProcessing}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      Approve & Register Faculty with Official Timetable ({acceptedSlotIds.size} slots)
                    </span>
                  </button>
                </div>
              </div>
            )}

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
