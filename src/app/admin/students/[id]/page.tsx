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
  Building2
} from 'lucide-react';
import PrintableIDCard from '@/components/common/PrintableIDCard';
import PrintableReportCard from '@/components/common/PrintableReportCard';
import PrintableReceipt from '@/components/common/PrintableReceipt';

export default function Student360ProfilePage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [student, setStudent] = useState<any | null>(null);
  const [metrics, setMetrics] = useState<any | null>(null);
  const [siblings, setSiblings] = useState<any[]>([]);
  const [classTeacher, setClassTeacher] = useState<any | null>(null);
  const [subjectTeachers, setSubjectTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'ATTENDANCE' | 'FEES' | 'RESULTS' | 'SIBLINGS' | 'ID_CARD'>('OVERVIEW');
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
      <div className="p-16 text-center text-slate-500 text-xs flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <span>Loading Student Digital Dossier...</span>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 space-y-4">
        <p className="text-sm font-bold text-slate-800">Student Profile Not Found</p>
        <Link href="/admin/students" className="text-xs text-blue-600 font-semibold hover:underline">
          ← Return to Student Directory
        </Link>
      </div>
    );
  }

  const tabs = [
    { id: 'OVERVIEW', label: '📁 Digital Dossier Overview', icon: User },
    { id: 'ATTENDANCE', label: `📅 Attendance (${metrics?.attendanceRate || 100}%)`, icon: CalendarCheck },
    { id: 'FEES', label: '💳 Fee Invoices & Ledger', icon: DollarSign },
    { id: 'RESULTS', label: '📊 Exam Marks & Reports', icon: Award },
    { id: 'SIBLINGS', label: `👨‍👩‍👦 Family & Siblings (${siblings.length})`, icon: Users },
    { id: 'ID_CARD', label: '🆔 Smart Digital ID Card', icon: CreditCard },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Breadcrumb Bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/students"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Students Directory</span>
        </Link>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow flex items-center gap-1.5 transition-all"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Profile & Parents</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ID_CARD')}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold border border-slate-200 shadow-sm flex items-center gap-1.5"
          >
            <CreditCard className="w-3.5 h-3.5 text-blue-600" />
            <span>Print ID Card</span>
          </button>
        </div>
      </div>

      {/* Main Student Header Hero */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#0a192f] via-[#1e3a8a] to-[#2563eb] text-white flex items-center justify-center text-2xl font-bold shadow-md shadow-blue-500/20 border-2 border-white overflow-hidden shrink-0">
              {student.photoUrl ? (
                <img src={student.photoUrl} alt={student.fullName} className="w-full h-full object-cover" />
              ) : (
                student.fullName.charAt(0)
              )}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                  {student.fullName}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {student.status}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                S/D of <strong className="text-slate-700">{student.parent?.fatherName || 'N/A'}</strong> • DOB: {student.dob ? new Date(student.dob).toLocaleDateString('en-GB') : 'N/A'} ({student.gender})
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[11px] font-mono font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  ID: {student.studentId}
                </span>
                <span className="text-[11px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Roll: {student.rollNo}
                </span>
                <span className="text-[11px] font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border">
                  {student.class?.name} - {student.section?.name}
                </span>
              </div>
            </div>
          </div>

          {/* Financial & Attendance KPIs */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-blue-50/60 border border-blue-200 text-center min-w-[110px]">
              <span className="text-[10px] text-blue-600 block font-bold uppercase">Attendance</span>
              <strong className="text-base text-blue-950 font-black">{metrics?.attendanceRate}%</strong>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center min-w-[110px]">
              <span className="text-[10px] text-slate-400 block font-semibold uppercase">Fee Balance</span>
              <strong className={`text-base font-black ${metrics?.totalFeeOutstanding > 0 ? 'text-red-600' : 'text-emerald-700'}`}>
                Rs. {metrics?.totalFeeOutstanding?.toLocaleString() || 0}
              </strong>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-8 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-[1.02]'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB CONTENT: 360 OVERVIEW */}
      {activeTab === 'OVERVIEW' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in">
          {/* Bio & Guardians */}
          <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-blue-900 border-b pb-2 flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" />
              <span>Personal & Contact Information</span>
            </h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block text-[10px]">Blood Group:</span>
                <strong className="text-rose-700 font-bold">{student.bloodGroup || 'N/A'}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Nationality:</span>
                <strong className="text-slate-800">{student.nationality}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Admission No:</span>
                <strong className="font-mono text-slate-800">{student.admissionNo}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Academic Session:</span>
                <strong className="text-slate-800">{student.session?.name}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Emergency Contact:</span>
                <strong className="text-slate-800">{student.emergencyName || 'Father'} ({student.emergencyPhone || 'N/A'})</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Previous School:</span>
                <strong className="text-slate-800">{student.previousSchool || 'First Enrollment'}</strong>
              </div>
            </div>

            <h3 className="text-xs font-black uppercase tracking-wider text-blue-900 border-b pb-2 pt-2 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span>Parents / Guardians Profile</span>
            </h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block text-[10px]">Father Name:</span>
                <strong className="text-slate-800">{student.parent?.fatherName || 'N/A'}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Father Phone:</span>
                <strong className="text-blue-900 font-mono font-bold">{student.parent?.fatherPhone || 'N/A'}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Father CNIC:</span>
                <strong className="font-mono text-slate-700">{student.parent?.fatherCnic || 'N/A'}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Mother Name:</span>
                <strong className="text-slate-800">{student.parent?.motherName || 'N/A'}</strong>
              </div>
              <div className="col-span-2">
                <span className="text-slate-500 block text-[10px]">Home Address:</span>
                <strong className="text-slate-800">{student.parent?.address || 'N/A'}, {student.parent?.city}</strong>
              </div>
            </div>
          </div>

          {/* Academic & Faculty Section */}
          <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-blue-900 border-b pb-2 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span>Academic Incharge & Assigned Teachers</span>
            </h3>
            
            <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-200 space-y-1 text-xs">
              <span className="text-[10px] uppercase font-bold text-blue-600 block">Class Incharge Teacher</span>
              <p className="font-bold text-slate-900 text-sm">{classTeacher?.fullName || 'Senior Subject Faculty'}</p>
              <p className="text-[11px] text-slate-500">{classTeacher?.phone || '+92 91 5828850'}</p>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 block">Subject Teachers Assigned:</span>
              <div className="divide-y divide-slate-100 text-xs">
                {subjectTeachers.length > 0 ? (
                  subjectTeachers.map((st: any) => (
                    <div key={st.id} className="py-2 flex justify-between items-center">
                      <span className="font-bold text-slate-800">{st.subject?.name}</span>
                      <span className="text-slate-600">{st.teacher?.fullName || 'Subject Faculty'}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 py-2">General Faculty assigned for Class 8.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: SIBLINGS FOLDER */}
      {activeTab === 'SIBLINGS' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5 animate-in fade-in">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h3 className="text-base font-black text-slate-900">Enrolled Family & Siblings Folder</h3>
              <p className="text-xs text-slate-500">Brothers and sisters studying in The Hayatabad Model School under same parent record.</p>
            </div>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full">
              {siblings.length} Sibling(s) Found
            </span>
          </div>

          {siblings.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <Users className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-slate-700">No other siblings recorded</p>
              <p className="text-[11px] text-slate-400">This student is currently the only child enrolled from this family record.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {siblings.map((sib: any) => (
                <div key={sib.id} className="p-4 bg-slate-50 hover:bg-blue-50/50 rounded-2xl border border-slate-200 transition-all space-y-2">
                  <div className="flex items-center justify-between">
                    <strong className="text-sm font-black text-slate-900">{sib.fullName}</strong>
                    <span className="font-mono text-[10px] font-bold text-blue-800 bg-blue-100 px-1.5 py-0.5 rounded">
                      {sib.studentId}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Class: <strong className="text-slate-900">{sib.class?.name} ({sib.section?.name})</strong> • Roll: <strong className="font-mono">{sib.rollNo}</strong>
                  </p>
                  <div className="pt-2">
                    <Link
                      href={`/admin/students/${sib.studentId}`}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      <span>View Sibling Profile</span>
                      <span>➔</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: FEES & INVOICES */}
      {activeTab === 'FEES' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5 animate-in fade-in">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h3 className="text-base font-black text-slate-900">Student Fee Invoices & Payment Ledger</h3>
              <p className="text-xs text-slate-500">Track monthly fee vouchers, discount allocations, and paid receipts.</p>
            </div>
            <Link
              href="/admin/fees"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow"
            >
              + Record Payment
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3">Invoice No</th>
                  <th className="p-3">Title / Month</th>
                  <th className="p-3">Due Date</th>
                  <th className="p-3">Total Amount</th>
                  <th className="p-3">Paid Amount</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {student.invoices?.map((inv: any) => (
                  <tr key={inv.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-blue-900">{inv.invoiceNo}</td>
                    <td className="p-3 font-medium text-slate-800">{inv.title}</td>
                    <td className="p-3 text-slate-500">{new Date(inv.dueDate).toLocaleDateString()}</td>
                    <td className="p-3 font-bold text-slate-900">Rs. {inv.totalAmount.toLocaleString()}</td>
                    <td className="p-3 font-bold text-emerald-700">Rs. {inv.paidAmount.toLocaleString()}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        inv.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {inv.payments?.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setSelectedReceipt(inv.payments[0])}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] rounded-lg"
                        >
                          Print Receipt
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: ATTENDANCE */}
      {activeTab === 'ATTENDANCE' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5 animate-in fade-in">
          <h3 className="text-base font-black text-slate-900 border-b pb-3">Recent 30-Day Attendance Records</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 text-xs">
            {student.attendances?.map((att: any) => (
              <div key={att.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-1">
                <span className="text-[10px] text-slate-500 block">{new Date(att.date).toLocaleDateString('en-GB')}</span>
                <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  att.status === 'PRESENT' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  {att.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: RESULTS */}
      {activeTab === 'RESULTS' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5 animate-in fade-in">
          <h3 className="text-base font-black text-slate-900 border-b pb-3">Exam Results & Marks Matrix</h3>
          <div className="space-y-3">
            {student.marks?.length === 0 ? (
              <p className="text-xs text-slate-400">No examination marks recorded yet.</p>
            ) : (
              student.marks?.map((m: any) => (
                <div key={m.id} className="p-4 bg-slate-50 rounded-2xl border flex items-center justify-between text-xs">
                  <div>
                    <strong className="text-slate-900 block text-sm">{m.examSchedule?.subject?.name}</strong>
                    <span className="text-slate-500">{m.examSchedule?.exam?.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-bold text-blue-900">{m.marksObtained} / {m.examSchedule?.totalMarks || 100}</span>
                    <p className="text-[10px] text-emerald-700 font-bold">Grade: {m.grade || 'A'}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: ID CARD */}
      {activeTab === 'ID_CARD' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5 animate-in fade-in">
          <h3 className="text-base font-black text-slate-900 border-b pb-3">Official Smart Student ID Card</h3>
          <div className="flex justify-center py-4">
            <PrintableIDCard student={student} />
          </div>
        </div>
      )}

      {/* Edit Student & Parent Profile Modal */}
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

      {/* Printable Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full space-y-4">
            <PrintableReceipt payment={selectedReceipt} />
            <button
              type="button"
              onClick={() => setSelectedReceipt(null)}
              className="w-full py-2 bg-slate-900 text-white text-xs font-bold rounded-xl"
            >
              Close Receipt
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
