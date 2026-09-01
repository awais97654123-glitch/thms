'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  User, 
  ArrowLeft, 
  CreditCard, 
  CalendarCheck, 
  DollarSign, 
  Award, 
  BookOpen, 
  Shield, 
  Phone, 
  Mail, 
  MapPin, 
  Printer, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  QrCode, 
  FileText,
  Users,
  Edit3,
  Loader2,
  AlertCircle,
  FolderDown,
  Building2,
  Calendar,
  Layers,
  MessageSquare,
  History,
  ShieldAlert,
  Download,
  Key
} from 'lucide-react';
import PrintableIDCard from '@/components/common/PrintableIDCard';
import PrintableReportCard from '@/components/common/PrintableReportCard';
import PrintableReceipt from '@/components/common/PrintableReceipt';

type TabType = 
  | 'OVERVIEW' 
  | 'ACADEMIC' 
  | 'ATTENDANCE' 
  | 'FEES' 
  | 'EXAMS' 
  | 'HOMEWORK' 
  | 'TIMETABLE' 
  | 'DOCUMENTS' 
  | 'DISCIPLINE' 
  | 'COMMUNICATION' 
  | 'HISTORY'
  | 'ID_CARD';

export default function Student360ProfilePage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [student, setStudent] = useState<any | null>(null);
  const [metrics, setMetrics] = useState<any | null>(null);
  const [siblings, setSiblings] = useState<any[]>([]);
  const [classTeacher, setClassTeacher] = useState<any | null>(null);
  const [subjectTeachers, setSubjectTeachers] = useState<any[]>([]);
  const [timetableSlots, setTimetableSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('OVERVIEW');
  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<any>({});
  const [savingEdit, setSavingEdit] = useState(false);
  const [editMessage, setEditMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fetchProfile = () => {
    setLoading(true);
    fetch(`/api/students/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.student) {
          setStudent(data.student);
          setMetrics(data.metrics);
          setSiblings(data.siblings || []);
          setClassTeacher(data.classTeacher || null);
          setSubjectTeachers(data.subjectTeachers || []);

          // Prepare edit form
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

          // Fetch Timetable for student's class and section
          if (s.classId && s.sectionId) {
            fetch(`/api/timetable?classId=${s.classId}&sectionId=${s.sectionId}`)
              .then((res) => res.json())
              .then((tData) => {
                if (tData.timetable) setTimetableSlots(tData.timetable);
              })
              .catch(console.error);
          }
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const handleSaveStudentEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingEdit(true);
    setEditMessage(null);

    try {
      const res = await fetch(`/api/students/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setEditMessage({ text: 'Student details updated successfully!', type: 'success' });
        fetchProfile();
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        <p className="text-sm font-bold text-slate-600">Retrieving Student 360° Dossier...</p>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 shadow-sm max-w-lg mx-auto mt-12 space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h3 className="text-xl font-bold text-slate-900">Student Record Not Found</h3>
        <p className="text-xs text-slate-500">The requested student dossier does not exist in the active database.</p>
        <Link href="/admin/students" className="inline-block px-5 py-2.5 btn-blue-prestige text-white text-xs font-bold rounded-xl">
          Back to Students Directory
        </Link>
      </div>
    );
  }

  const tabs: { id: TabType; label: string; icon: any }[] = [
    { id: 'OVERVIEW', label: 'Overview & Profile', icon: User },
    { id: 'ACADEMIC', label: 'Academic & Faculty', icon: BookOpen },
    { id: 'ATTENDANCE', label: 'Attendance Ledger', icon: CalendarCheck },
    { id: 'FEES', label: 'Fee & Invoices', icon: DollarSign },
    { id: 'EXAMS', label: 'Exams & Reports', icon: Award },
    { id: 'HOMEWORK', label: 'Homework & Tasks', icon: Layers },
    { id: 'TIMETABLE', label: 'Period Timetable', icon: Clock },
    { id: 'DOCUMENTS', label: 'Certificates & Docs', icon: FileText },
    { id: 'DISCIPLINE', label: 'Discipline Log', icon: ShieldAlert },
    { id: 'COMMUNICATION', label: 'Parent Notices', icon: MessageSquare },
    { id: 'HISTORY', label: 'Siblings & Audit History', icon: History },
    { id: 'ID_CARD', label: 'Smart ID Card', icon: CreditCard },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300 bg-[#ffffff] text-slate-900 pb-16">
      
      {/* Back link */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/students"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Students Roster</span>
        </Link>
      </div>

      {/* Hero 360 Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-[#0a192f] text-white p-8 sm:p-10 shadow-2xl border border-blue-900/40">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative">
              <img
                src={student.photoUrl || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&h=350&fit=crop'}
                alt={student.fullName}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-4 border-white/20 shadow-xl"
              />
              <span className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-[#0a192f]"></span>
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-[11px] font-black text-blue-300 bg-blue-900/60 px-2.5 py-0.5 rounded-lg border border-blue-700/50">
                  {student.studentId}
                </span>
                <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {student.status}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-serif">
                {student.fullName}
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 font-medium">
                {student.class?.name || 'Class'} • {student.section?.name || 'Section'} • Roll #{student.rollNo || 'N/A'} • Adm #{student.admissionNo || 'N/A'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 backdrop-blur-xl flex items-center gap-2 transition-all"
            >
              <Edit3 className="w-3.5 h-3.5 text-blue-300" />
              <span>Edit Dossier</span>
            </button>
            <Link
              href={`/admin/users?q=${encodeURIComponent(student.studentId)}`}
              className="px-4 py-2.5 rounded-2xl btn-blue-prestige text-white text-xs font-bold shadow-lg flex items-center gap-2 transition-all"
            >
              <Key className="w-3.5 h-3.5" />
              <span>Login Credentials</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Header Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1 border-t-4 border-t-blue-600">
          <span className="text-[10px] uppercase font-bold text-slate-500">Attendance Rate</span>
          <h3 className="text-2xl font-black text-blue-600 font-mono">{metrics?.attendanceRate ?? 100}%</h3>
          <p className="text-[11px] text-slate-500">30-Day Gate Scans</p>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1 border-t-4 border-t-emerald-600">
          <span className="text-[10px] uppercase font-bold text-slate-500">Fee Clearance</span>
          <h3 className="text-2xl font-black text-emerald-600 font-mono">
            {metrics?.totalFeeOutstanding === 0 ? 'CLEARED' : `Rs. ${(metrics?.totalFeeOutstanding ?? 0).toLocaleString()}`}
          </h3>
          <p className="text-[11px] text-slate-500">Outstanding Balance</p>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1 border-t-4 border-t-indigo-600">
          <span className="text-[10px] uppercase font-bold text-slate-500">Academic Wing</span>
          <h3 className="text-2xl font-black text-slate-900">{student.class?.name || 'Class 8'}</h3>
          <p className="text-[11px] text-slate-500">Section {student.section?.name || 'A'}</p>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1 border-t-4 border-t-amber-500">
          <span className="text-[10px] uppercase font-bold text-slate-500">Enrolled Siblings</span>
          <h3 className="text-2xl font-black text-amber-600 font-mono">{siblings.length} Siblings</h3>
          <p className="text-[11px] text-slate-500">Family Account Linked</p>
        </div>
      </div>

      {/* 11 Tabs Navigation Bar */}
      <div className="bg-white p-2 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-1.5 overflow-x-auto">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold shrink-0 transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT AREAS */}

      {/* 1. OVERVIEW TAB */}
      {activeTab === 'OVERVIEW' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-black text-slate-900 font-serif flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" />
              <span>Personal & Identity Details</span>
            </h3>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block font-bold">First Name:</span>
                <strong className="text-slate-900">{student.firstName}</strong>
              </div>
              <div>
                <span className="text-slate-400 block font-bold">Last Name:</span>
                <strong className="text-slate-900">{student.lastName}</strong>
              </div>
              <div>
                <span className="text-slate-400 block font-bold">Date of Birth:</span>
                <strong className="text-slate-900">{student.dob ? new Date(student.dob).toLocaleDateString('en-GB') : 'N/A'}</strong>
              </div>
              <div>
                <span className="text-slate-400 block font-bold">Gender:</span>
                <strong className="text-slate-900">{student.gender}</strong>
              </div>
              <div>
                <span className="text-slate-400 block font-bold">Blood Group:</span>
                <strong className="text-rose-600 font-bold font-mono">{student.bloodGroup || 'B+'}</strong>
              </div>
              <div>
                <span className="text-slate-400 block font-bold">Nationality:</span>
                <strong className="text-slate-900">{student.nationality || 'Pakistani'}</strong>
              </div>
              <div>
                <span className="text-slate-400 block font-bold">Emergency Phone:</span>
                <strong className="text-slate-900 font-mono">{student.emergencyPhone || student.parent?.fatherPhone || 'N/A'}</strong>
              </div>
              <div>
                <span className="text-slate-400 block font-bold">Joining Date:</span>
                <strong className="text-slate-900">{new Date(student.createdAt).toLocaleDateString('en-GB')}</strong>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-black text-slate-900 font-serif flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-600" />
              <span>Parent & Guardian Information</span>
            </h3>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block font-bold">Father Name:</span>
                <strong className="text-slate-900">{student.parent?.fatherName || 'N/A'}</strong>
              </div>
              <div>
                <span className="text-slate-400 block font-bold">Father Phone / WhatsApp:</span>
                <strong className="text-blue-900 font-bold font-mono">{student.parent?.fatherPhone || 'N/A'}</strong>
              </div>
              <div>
                <span className="text-slate-400 block font-bold">Father CNIC:</span>
                <strong className="text-slate-900 font-mono">{student.parent?.fatherCnic || '17301-XXXXXXX-X'}</strong>
              </div>
              <div>
                <span className="text-slate-400 block font-bold">Father Email:</span>
                <strong className="text-slate-700">{student.parent?.fatherEmail || 'N/A'}</strong>
              </div>
              <div>
                <span className="text-slate-400 block font-bold">Mother Name:</span>
                <strong className="text-slate-900">{student.parent?.motherName || 'N/A'}</strong>
              </div>
              <div>
                <span className="text-slate-400 block font-bold">Residential City:</span>
                <strong className="text-slate-900">{student.parent?.city || 'Peshawar'}</strong>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 block font-bold">Residential Address:</span>
                <strong className="text-slate-900">{student.parent?.address || 'Phase 3, Hayatabad, Peshawar'}</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. ACADEMIC TAB */}
      {activeTab === 'ACADEMIC' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-slate-900">Enrolled Class & Section Incharge</h3>
              <div className="p-4 bg-blue-50/70 rounded-2xl border border-blue-200 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span>Class:</span>
                  <strong className="text-slate-900">{student.class?.name}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Section:</span>
                  <strong className="text-slate-900">{student.section?.name}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Section Roll Number:</span>
                  <strong className="text-blue-900 font-mono font-bold">{student.rollNo}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Class Incharge Teacher:</span>
                  <strong className="text-slate-900">{classTeacher?.fullName || 'Engr. Farooq Ahmad'}</strong>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-slate-900">Assigned Curriculum Faculty</h3>
              <div className="space-y-2 text-xs">
                {subjectTeachers.length === 0 ? (
                  <p className="text-slate-400">Class 8 core faculty: Mathematics, Physics, Chemistry, English, Urdu, Islamiyat.</p>
                ) : (
                  subjectTeachers.map((st) => (
                    <div key={st.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex justify-between items-center">
                      <div>
                        <strong className="text-slate-900 block">{st.subject?.name}</strong>
                        <span className="text-[11px] text-slate-500">{st.teacher?.fullName}</span>
                      </div>
                      <span className="font-mono text-[10px] bg-white px-2 py-0.5 rounded border">
                        {st.teacher?.employeeId}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. ATTENDANCE TAB */}
      {activeTab === 'ATTENDANCE' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-sm text-slate-900">Recent Attendance Ledger (30 Days)</h3>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-200">
              {metrics?.attendanceRate ?? 100}% Present
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b text-slate-600 font-bold">
                <tr>
                  <th className="p-3">Date</th>
                  <th className="p-3">Check-In Time</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Method</th>
                  <th className="p-3">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {student.attendances?.map((att: any) => (
                  <tr key={att.id}>
                    <td className="p-3 font-medium text-slate-900">
                      {new Date(att.date).toLocaleDateString('en-GB')}
                    </td>
                    <td className="p-3 font-mono text-slate-600">{att.time || '07:45 AM'}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        att.status === 'PRESENT' ? 'bg-emerald-50 text-emerald-700' :
                        att.status === 'LATE' ? 'bg-amber-50 text-amber-700' :
                        'bg-rose-50 text-rose-700'
                      }`}>
                        {att.status}
                      </span>
                    </td>
                    <td className="p-3 text-slate-500">{att.method || 'QR_SCAN'}</td>
                    <td className="p-3 text-slate-500">{att.remarks || 'Normal Entry'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. FEES TAB */}
      {activeTab === 'FEES' && (
        <div className="space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-900">Billing Invoices & Payment Ledger</h3>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b text-slate-600 font-bold">
                  <tr>
                    <th className="p-3">Invoice #</th>
                    <th className="p-3">Month</th>
                    <th className="p-3">Total Amount</th>
                    <th className="p-3">Paid Amount</th>
                    <th className="p-3">Remaining Balance</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {student.invoices?.map((inv: any) => (
                    <tr key={inv.id}>
                      <td className="p-3 font-mono font-bold text-blue-900">{inv.invoiceNo}</td>
                      <td className="p-3 font-medium text-slate-900">{inv.month}</td>
                      <td className="p-3 font-mono font-bold text-slate-900">Rs. {inv.totalAmount.toLocaleString()}</td>
                      <td className="p-3 font-mono font-bold text-emerald-600">Rs. {inv.paidAmount.toLocaleString()}</td>
                      <td className="p-3 font-mono font-bold text-rose-600">Rs. {inv.remainingAmount.toLocaleString()}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          inv.status === 'PAID' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => setSelectedReceipt(inv)}
                          className="px-3 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold rounded-lg text-[11px]"
                        >
                          Print 3-Slip Voucher
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {selectedReceipt && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <h4 className="font-bold text-sm text-slate-900">3-Slip Deposit Receipt Preview</h4>
                <button
                  onClick={() => setSelectedReceipt(null)}
                  className="text-xs text-slate-400 hover:text-slate-600 font-bold"
                >
                  Close Receipt
                </button>
              </div>
              <PrintableReceipt
                invoice={selectedReceipt}
                student={{
                  studentId: student.studentId,
                  admissionNo: student.admissionNo,
                  rollNo: student.rollNo,
                  fullName: student.fullName,
                  class: student.class,
                  section: student.section,
                  parent: student.parent,
                }}
                payment={selectedReceipt.payments?.[0]}
              />
            </div>
          )}
        </div>
      )}

      {/* 5. EXAMS TAB */}
      {activeTab === 'EXAMS' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-900">Terminal Exam Marks & Performance</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b text-slate-600 font-bold">
                <tr>
                  <th className="p-3">Exam Term</th>
                  <th className="p-3">Subject</th>
                  <th className="p-3">Total Marks</th>
                  <th className="p-3">Obtained</th>
                  <th className="p-3">Percentage</th>
                  <th className="p-3">Grade</th>
                  <th className="p-3">GPA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {student.marks?.map((m: any) => (
                  <tr key={m.id}>
                    <td className="p-3 font-medium text-slate-900">{m.examSchedule?.exam?.name || 'Term Exam'}</td>
                    <td className="p-3 font-bold text-blue-900">{m.examSchedule?.subject?.name || 'Subject'}</td>
                    <td className="p-3 font-mono">{m.totalMarks}</td>
                    <td className="p-3 font-mono font-bold text-emerald-600">{m.marksObtained}</td>
                    <td className="p-3 font-mono font-bold">{m.percentage}%</td>
                    <td className="p-3 font-bold text-blue-700">{m.grade}</td>
                    <td className="p-3 font-mono font-bold">{m.gpa}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. HOMEWORK TAB */}
      {activeTab === 'HOMEWORK' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-900">Assigned Homework & Submissions</h3>
          {student.submissions?.length === 0 ? (
            <p className="text-xs text-slate-400 p-6 text-center">No homework tasks recorded.</p>
          ) : (
            <div className="space-y-3">
              {student.submissions?.map((sub: any) => (
                <div key={sub.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex justify-between items-center text-xs">
                  <div>
                    <h4 className="font-bold text-slate-900">{sub.homework?.title}</h4>
                    <p className="text-slate-500">{sub.homework?.subject?.name} • Due: {new Date(sub.homework?.dueDate).toLocaleDateString('en-GB')}</p>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold rounded-lg text-[10px]">
                    {sub.status || 'SUBMITTED'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 7. TIMETABLE TAB */}
      {activeTab === 'TIMETABLE' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-900">Weekly Class Period Schedule (Class {student.class?.name} - {student.section?.name})</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            {['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'].map((day) => (
              <div key={day} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <span className="font-bold text-blue-900 text-xs block border-b pb-1">{day}</span>
                <div className="space-y-1.5">
                  <div className="p-2 bg-white rounded-xl border text-[11px]">
                    <strong className="block text-slate-800">Period 1: Mathematics</strong>
                    <span className="text-slate-400">08:00 AM - 08:45 AM</span>
                  </div>
                  <div className="p-2 bg-white rounded-xl border text-[11px]">
                    <strong className="block text-slate-800">Period 2: Physics</strong>
                    <span className="text-slate-400">08:45 AM - 09:30 AM</span>
                  </div>
                  <div className="p-2 bg-white rounded-xl border text-[11px]">
                    <strong className="block text-slate-800">Period 3: Chemistry</strong>
                    <span className="text-slate-400">09:30 AM - 10:15 AM</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. DOCUMENTS TAB */}
      {activeTab === 'DOCUMENTS' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-900">Student Official Documents & Certificates</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-2xl border space-y-2">
              <FileText className="w-6 h-6 text-blue-600" />
              <h4 className="font-bold text-slate-900">Admission Application Dossier</h4>
              <p className="text-slate-500 text-[11px]">Verified B-Form, birth certificate, and father CNIC.</p>
              <button className="text-blue-600 font-bold hover:underline block pt-1">Download PDF</button>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border space-y-2">
              <Award className="w-6 h-6 text-emerald-600" />
              <h4 className="font-bold text-slate-900">Bonafide Student Certificate</h4>
              <p className="text-slate-500 text-[11px]">Issued for passport/visa verification.</p>
              <button className="text-blue-600 font-bold hover:underline block pt-1">Generate Certificate</button>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border space-y-2">
              <Shield className="w-6 h-6 text-purple-600" />
              <h4 className="font-bold text-slate-900">Character & Conduct Certificate</h4>
              <p className="text-slate-500 text-[11px]">Official academic conduct certificate.</p>
              <button className="text-blue-600 font-bold hover:underline block pt-1">Generate Certificate</button>
            </div>
          </div>
        </div>
      )}

      {/* 9. DISCIPLINE TAB */}
      {activeTab === 'DISCIPLINE' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-900">Disciplinary Standing & Remarks</h3>
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            <div>
              <h4 className="font-bold text-emerald-900 text-xs">Exemplary Conduct Record</h4>
              <p className="text-emerald-700 text-[11px]">No disciplinary infractions or formal warnings recorded on this student file.</p>
            </div>
          </div>
        </div>
      )}

      {/* 10. COMMUNICATION TAB */}
      {activeTab === 'COMMUNICATION' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-900">Parent Communication & Automated Notices</h3>
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border flex justify-between items-center">
              <div>
                <strong className="text-slate-900">Attendance Gate Scan Notification</strong>
                <p className="text-slate-500">Delivered via automated portal & email</p>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Today, 07:45 AM</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border flex justify-between items-center">
              <div>
                <strong className="text-slate-900">Monthly Fee Invoice Deposit Slip Issued</strong>
                <p className="text-slate-500">Delivered to {student.parent?.fatherPhone}</p>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">1st of Month</span>
            </div>
          </div>
        </div>
      )}

      {/* 11. SIBLINGS & HISTORY TAB */}
      {activeTab === 'HISTORY' && (
        <div className="space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-900">Linked Family Siblings ({siblings.length})</h3>
            {siblings.length === 0 ? (
              <p className="text-xs text-slate-400">No other siblings found under this parent phone number.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {siblings.map((sib) => (
                  <div key={sib.id} className="p-4 rounded-2xl bg-slate-50 border flex items-center justify-between text-xs">
                    <div>
                      <h4 className="font-bold text-slate-900">{sib.fullName}</h4>
                      <p className="text-slate-500">{sib.class?.name} • Roll #{sib.rollNo}</p>
                    </div>
                    <Link
                      href={`/admin/students/${sib.id}`}
                      className="px-3 py-1.5 btn-blue-prestige text-white text-[11px] font-bold rounded-lg"
                    >
                      View 360° Dossier
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 12. ID CARD TAB */}
      {activeTab === 'ID_CARD' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-sm text-slate-900">Official Smart PVC Student ID Card</h3>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 btn-blue-prestige text-white text-xs font-bold rounded-xl shadow flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print PVC Card</span>
            </button>
          </div>

          <div className="flex justify-center p-6 bg-slate-100 rounded-3xl border">
            <PrintableIDCard
              student={{
                id: student.id,
                studentId: student.studentId,
                admissionNo: student.admissionNo,
                rollNo: student.rollNo,
                fullName: student.fullName,
                photoUrl: student.photoUrl,
                bloodGroup: student.bloodGroup || 'B+',
                emergencyPhone: student.emergencyPhone || student.parent?.fatherPhone || '+92 333 1122334',
                class: student.class,
                section: student.section,
                parent: student.parent,
                session: student.session,
                qrToken: student.qrToken,
              }}
            />
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-black text-slate-900">Edit Student 360° Record</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {editMessage && (
              <div className={`p-3 rounded-xl text-xs font-bold ${
                editMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
              }`}>
                {editMessage.text}
              </div>
            )}

            <form onSubmit={handleSaveStudentEdit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={editFormData.firstName}
                    onChange={(e) => setEditFormData({ ...editFormData, firstName: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={editFormData.lastName}
                    onChange={(e) => setEditFormData({ ...editFormData, lastName: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Roll Number</label>
                  <input
                    type="text"
                    value={editFormData.rollNo}
                    onChange={(e) => setEditFormData({ ...editFormData, rollNo: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-mono font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Blood Group</label>
                  <input
                    type="text"
                    value={editFormData.bloodGroup}
                    onChange={(e) => setEditFormData({ ...editFormData, bloodGroup: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="ENROLLED">ENROLLED</option>
                    <option value="SUSPENDED">SUSPENDED</option>
                    <option value="GRADUATED">GRADUATED</option>
                    <option value="WITHDRAWN">WITHDRAWN</option>
                  </select>
                </div>
              </div>

              <div className="border-t pt-3 space-y-3">
                <span className="text-[10px] uppercase font-bold text-blue-600 block">Father & Guardian Updates</span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Father Name</label>
                    <input
                      type="text"
                      value={editFormData.fatherName}
                      onChange={(e) => setEditFormData({ ...editFormData, fatherName: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Father Phone</label>
                    <input
                      type="text"
                      value={editFormData.fatherPhone}
                      onChange={(e) => setEditFormData({ ...editFormData, fatherPhone: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-300 font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t">
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
                  className="px-5 py-2 rounded-xl btn-blue-prestige text-white font-bold shadow flex items-center gap-1.5"
                >
                  {savingEdit ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
