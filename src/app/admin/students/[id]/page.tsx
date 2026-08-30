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
  FileText
} from 'lucide-react';
import PrintableIDCard from '@/components/common/PrintableIDCard';
import PrintableReportCard from '@/components/common/PrintableReportCard';
import PrintableReceipt from '@/components/common/PrintableReceipt';

export default function Student360ProfilePage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [student, setStudent] = useState<any | null>(null);
  const [metrics, setMetrics] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'ATTENDANCE' | 'FEES' | 'RESULTS' | 'ID_CARD' | 'CERTIFICATES'>('OVERVIEW');
  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);

  useEffect(() => {
    fetch(`/api/students/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.student) {
          setStudent(data.student);
          setMetrics(data.metrics);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400 text-xs">
        Loading Student 360° Profile...
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
    { id: 'OVERVIEW', label: '360° Overview', icon: User },
    { id: 'ATTENDANCE', label: `Attendance (${metrics?.attendanceRate || 100}%)`, icon: CalendarCheck },
    { id: 'FEES', label: 'Fees & Invoices', icon: DollarSign },
    { id: 'RESULTS', label: 'Exam Results & Report Card', icon: Award },
    { id: 'ID_CARD', label: 'Printable ID Card', icon: CreditCard },
  ];

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb Bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/students"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Students Directory</span>
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('ID_CARD')}
            className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold border border-purple-200 flex items-center gap-1.5"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Generate ID Card</span>
          </button>
        </div>
      </div>

      {/* Main Student Header Hero */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-700 to-emerald-500 text-white flex items-center justify-center text-2xl font-bold shadow-md shadow-blue-500/20 border-2 border-white">
              {student.fullName.charAt(0)}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  {student.fullName}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {student.status}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                S/D of <strong className="text-slate-700">{student.parent?.fatherName || 'N/A'}</strong> • DOB: {new Date(student.dob).toLocaleDateString('en-GB')}
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[11px] font-mono font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  ID: {student.studentId}
                </span>
                <span className="text-[11px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Roll: {student.rollNo}
                </span>
                <span className="text-[11px] font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                  {student.class.name} - {student.section.name}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Financial & Attendance KPIs */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center min-w-[110px]">
              <span className="text-[10px] text-slate-400 block font-semibold uppercase">Attendance</span>
              <strong className="text-base text-emerald-700 font-extrabold">{metrics?.attendanceRate}%</strong>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center min-w-[110px]">
              <span className="text-[10px] text-slate-400 block font-semibold uppercase">Fee Balance</span>
              <strong className={`text-base font-extrabold ${metrics?.totalFeeOutstanding > 0 ? 'text-red-600' : 'text-emerald-700'}`}>
                Rs. {metrics?.totalFeeOutstanding.toLocaleString()}
              </strong>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-8 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
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
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b pb-2 flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" />
              <span>Personal & Contact Information</span>
            </h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block text-[10px]">Blood Group:</span>
                <strong className="text-red-700">{student.bloodGroup || 'N/A'}</strong>
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
                <strong className="text-slate-800">{student.session.name}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Emergency Contact:</span>
                <strong className="text-slate-800">{student.emergencyName || 'Father'} ({student.emergencyPhone || 'N/A'})</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Previous School:</span>
                <strong className="text-slate-800">{student.previousSchool || 'N/A'}</strong>
              </div>
            </div>

            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b pt-4 pb-2">
              Parent / Guardian Ledger
            </h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block text-[10px]">Father Name:</span>
                <strong className="text-slate-900">{student.parent?.fatherName || 'N/A'}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Father Phone:</span>
                <strong className="font-mono text-slate-900">{student.parent?.fatherPhone || 'N/A'}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Father CNIC:</span>
                <strong className="font-mono text-slate-800">{student.parent?.fatherCnic || 'N/A'}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Occupation:</span>
                <strong className="text-slate-800">{student.parent?.fatherOccupation || 'N/A'}</strong>
              </div>
              <div className="col-span-2">
                <span className="text-slate-500 block text-[10px]">Residential Address:</span>
                <strong className="text-slate-800">{student.parent?.address || 'Phase 6, Hayatabad, Peshawar'}</strong>
              </div>
            </div>
          </div>

          {/* Portal User Credentials & QR Token */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-300">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <span>Student Portal Account & Security</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded">
                  Active
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Portal Username:</span>
                  <strong className="font-mono text-white">{student.user?.username || student.studentId}</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Temporary Password Status:</span>
                  <span className="text-amber-300 font-semibold">
                    {student.user?.isFirstLogin ? 'Pending First-Login Update' : 'Secure & Updated'}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">QR Identity Token:</span>
                  <span className="font-mono text-[10px] text-emerald-300 truncate max-w-[200px]">
                    {student.qrToken}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                1-Click Document Actions
              </h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <button
                  onClick={() => setActiveTab('ID_CARD')}
                  className="p-3 rounded-xl bg-slate-50 hover:bg-purple-50 text-slate-700 hover:text-purple-700 border border-slate-200 font-semibold flex items-center gap-2 transition-colors"
                >
                  <CreditCard className="w-4 h-4 text-purple-600" />
                  <span>View Dual-Sided ID Card</span>
                </button>
                <button
                  onClick={() => setActiveTab('RESULTS')}
                  className="p-3 rounded-xl bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 font-semibold flex items-center gap-2 transition-colors"
                >
                  <Award className="w-4 h-4 text-blue-600" />
                  <span>Print Report Card</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: ATTENDANCE */}
      {activeTab === 'ATTENDANCE' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Attendance Timeline Record</h3>
              <p className="text-xs text-slate-500">Log of gate scans and classroom attendance entries</p>
            </div>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-extrabold text-xs rounded-full">
              Overall Rate: {metrics?.attendanceRate}%
            </span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {student.attendances.map((att: any) => (
              <div key={att.id} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${att.status === 'PRESENT' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                    <CalendarCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-slate-900 block">
                      {new Date(att.date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </strong>
                    <span className="text-[11px] text-slate-500 font-mono">
                      Recorded at {att.time} via {att.method} scanner
                    </span>
                  </div>
                </div>
                <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${att.status === 'PRESENT' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                  {att.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: FEES */}
      {activeTab === 'FEES' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Fee Invoices & Payment Ledger</h3>
              <p className="text-xs text-slate-500">Complete record of billed vouchers and verified bank/cash receipts</p>
            </div>
          </div>

          <div className="space-y-4">
            {student.invoices.map((inv: any) => (
              <div key={inv.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-3 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
                  <div>
                    <span className="font-mono font-bold text-blue-900 mr-2">{inv.invoiceNo}</span>
                    <strong className="text-slate-900">{inv.title}</strong>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${inv.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                    {inv.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Total Billed:</span>
                    <strong className="text-slate-900 font-mono">Rs. {inv.totalAmount.toLocaleString()}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Paid Amount:</span>
                    <strong className="text-emerald-700 font-mono">Rs. {inv.paidAmount.toLocaleString()}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Remaining Balance:</span>
                    <strong className="text-red-600 font-mono">Rs. {inv.remainingAmount.toLocaleString()}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Due Date:</span>
                    <strong className="text-slate-800">{new Date(inv.dueDate).toLocaleDateString('en-GB')}</strong>
                  </div>
                </div>

                {/* Payments associated with this invoice */}
                {inv.payments && inv.payments.length > 0 && (
                  <div className="pt-2 border-t border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Receipts:</span>
                    <div className="flex flex-wrap gap-2">
                      {inv.payments.map((p: any) => (
                        <button
                          key={p.id}
                          onClick={() => setSelectedReceipt({ receipt: p, invoice: inv, student })}
                          className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg font-mono text-[10px] font-bold flex items-center gap-1 shadow-sm"
                        >
                          <Printer className="w-3 h-3" />
                          <span>{p.receiptNo} (Rs. {p.amount.toLocaleString()})</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Receipt Modal Popup */}
          {selectedReceipt && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="max-w-4xl w-full bg-white rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center border-b pb-2">
                  <h4 className="font-bold text-sm">Fee Payment Receipt Voucher</h4>
                  <button
                    onClick={() => setSelectedReceipt(null)}
                    className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-xs font-bold rounded-lg"
                  >
                    ✕ Close
                  </button>
                </div>
                <PrintableReceipt
                  receipt={selectedReceipt.receipt}
                  invoice={selectedReceipt.invoice}
                  student={{
                    studentId: student.studentId,
                    admissionNo: student.admissionNo,
                    rollNo: student.rollNo,
                    fullName: student.fullName,
                    className: student.class.name,
                    sectionName: student.section.name,
                    fatherName: student.parent?.fatherName || 'N/A',
                  }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: RESULTS & REPORT CARD */}
      {activeTab === 'RESULTS' && (
        <div className="space-y-4 animate-in fade-in">
          <PrintableReportCard
            student={student}
            exam={{
              name: 'Mid-Term Examination 2026',
              term: 'MID_TERM',
            }}
            sessionName={student.session.name}
            marks={[
              { subjectName: 'Mathematics', totalMarks: 100, obtainedMarks: 95, percentage: 95, grade: 'A+', gpa: 4.0, remarks: 'Outstanding analytical proofs' },
              { subjectName: 'English Literature', totalMarks: 100, obtainedMarks: 91, percentage: 91, grade: 'A+', gpa: 4.0, remarks: 'Excellent expression' },
              { subjectName: 'General Science', totalMarks: 100, obtainedMarks: 94, percentage: 94, grade: 'A+', gpa: 4.0, remarks: 'Strong conceptual grasp' },
            ]}
          />
        </div>
      )}

      {/* TAB CONTENT: PRINTABLE ID CARD */}
      {activeTab === 'ID_CARD' && (
        <div className="space-y-4 animate-in fade-in">
          <PrintableIDCard student={student} />
        </div>
      )}

    </div>
  );
}
