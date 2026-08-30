'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  UserPlus, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Calendar, 
  CreditCard, 
  UserCheck, 
  Sparkles, 
  ArrowRight, 
  Printer,
  ChevronRight,
  Eye,
  FileText,
  DollarSign
} from 'lucide-react';

export default function AdminAdmissionsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  // 1-Click Enrollment Modal State
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [enrollmentResult, setEnrollmentResult] = useState<any | null>(null);
  const [enrollmentForm, setEnrollmentForm] = useState({
    sectionId: '',
    customRollNo: '',
  });

  const fetchApplications = () => {
    setLoading(true);
    let url = `/api/admissions?status=${filterStatus}`;
    if (searchQuery) url += `&q=${encodeURIComponent(searchQuery)}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.applications) setApplications(data.applications);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchApplications();
    fetch('/api/classes')
      .then((res) => res.json())
      .then((data) => {
        if (data.classes) setClasses(data.classes);
      })
      .catch(console.error);
  }, [filterStatus]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchApplications();
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admissions/${id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchApplications();
        if (selectedApp) {
          setSelectedApp((prev: any) => ({ ...prev, status: newStatus }));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleApproveAndEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;
    setIsEnrolling(true);

    try {
      const res = await fetch(`/api/admissions/${selectedApp.id}/enroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(enrollmentForm),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setEnrollmentResult(data.enrollment);
        fetchApplications();
      } else {
        alert(data.error || 'Failed to approve & enroll student');
      }
    } catch (err) {
      console.error(err);
      alert('Error during enrollment process');
    } finally {
      setIsEnrolling(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ENROLLED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'APPROVED':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'INTERVIEW_SCHEDULED':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'UNDER_REVIEW':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Title & CTA */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
            Admissions Management Hub
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
            Online Applications & 1-Click Enrollment
          </h1>
          <p className="text-xs text-slate-500">
            Review submitted inquiries, schedule interviews, and automatically enroll students with ID cards and portal accounts.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admissions/apply"
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-200"
          >
            <Eye className="w-4 h-4" />
            <span>Public Form View</span>
          </Link>
          <Link
            href="/admin/admissions/new"
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-600/20 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ New Admission Form</span>
          </Link>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-medium">
          {['ALL', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'ENROLLED'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterStatus === st
                  ? 'bg-blue-600 text-white font-bold shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by name, app code, father..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none w-64"
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

      {/* Applications Data Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-4">App Code</th>
                <th className="p-4">Applicant Student</th>
                <th className="p-4">Applying Class</th>
                <th className="p-4">Father / Contact</th>
                <th className="p-4">Submission Date</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    Loading admission applications...
                  </td>
                </tr>
              ) : applications.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No admission applications found matching this status filter.
                  </td>
                </tr>
              ) : (
                applications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-mono font-bold text-blue-900">
                      {app.applicationNo}
                    </td>
                    <td className="p-4">
                      <strong className="text-slate-900 block font-semibold">{app.fullName}</strong>
                      <span className="text-[11px] text-slate-500">{app.gender} • DOB: {new Date(app.dob).toLocaleDateString('en-GB')}</span>
                    </td>
                    <td className="p-4">
                      <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                        {app.applyingClassName}
                      </span>
                    </td>
                    <td className="p-4">
                      <p className="font-medium text-slate-800">{app.fatherName}</p>
                      <p className="text-[11px] text-slate-500 font-mono">{app.fatherPhone}</p>
                    </td>
                    <td className="p-4 text-slate-500">
                      {new Date(app.createdAt).toLocaleDateString('en-GB')}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(app.status)}`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedApp(app);
                          setEnrollmentResult(null);
                        }}
                        className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-lg text-xs transition-colors"
                      >
                        Review & Enroll
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review & 1-Click Approve & Enroll Drawer / Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 sm:p-8 space-y-6">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-blue-600 block">
                  Admission Review & Enrollment
                </span>
                <h3 className="text-xl font-bold text-slate-900">
                  {selectedApp.fullName} ({selectedApp.applicationNo})
                </h3>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold"
              >
                ✕ Close
              </button>
            </div>

            {/* If Enrolled, Show Summary Credentials Card */}
            {/* Success Enrollment View with Credentials Slip */}
            {enrollmentResult ? (
              <div className="p-6 bg-emerald-50 rounded-2xl border-2 border-emerald-300 space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 text-emerald-900 font-bold text-base">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                    <span>Student Successfully Enrolled!</span>
                  </div>
                  <button
                    onClick={() => {
                      const text = `*THE HAYATABAD MODEL SCHOOL — CREDENTIALS*\nStudent: ${enrollmentResult.fullName}\nClass: ${enrollmentResult.className} (Roll ${enrollmentResult.rollNo})\n\nStudent Login: ${enrollmentResult.studentUsername || enrollmentResult.portalUsername}\nPassword: ${enrollmentResult.studentPassword || enrollmentResult.temporaryPassword}\n\nParent Login: ${enrollmentResult.parentUsername}\nPassword: ${enrollmentResult.parentPassword || 'Parent@123'}\n\nLogin URL: http://localhost:3000/login`;
                      navigator.clipboard.writeText(text);
                      alert('Login credentials copied to clipboard!');
                    }}
                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow transition-all"
                  >
                    📱 Copy WhatsApp Slip
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 bg-white p-4 rounded-xl border border-emerald-200 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Student ID:</span>
                    <strong className="font-mono text-blue-900 text-sm">{enrollmentResult.studentId}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Admission No:</span>
                    <strong className="font-mono text-slate-800 text-sm">{enrollmentResult.admissionNo}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Class & Roll:</span>
                    <strong className="text-emerald-700">{enrollmentResult.className} • Roll {enrollmentResult.rollNo}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Initial Invoice No:</span>
                    <strong className="font-mono text-teal-700">{enrollmentResult.invoiceNo} (Rs. {enrollmentResult.initialAmount})</strong>
                  </div>
                  <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200">
                    <span className="text-blue-900 font-bold block text-[11px]">Student Login:</span>
                    <span className="font-mono text-xs block text-slate-700 font-bold">{enrollmentResult.studentUsername || enrollmentResult.portalUsername}</span>
                    <span className="font-mono text-[11px] text-red-600 font-bold block">Pass: {enrollmentResult.studentPassword || enrollmentResult.temporaryPassword}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200">
                    <span className="text-amber-900 font-bold block text-[11px]">Parent Login:</span>
                    <span className="font-mono text-xs block text-slate-700 font-bold">{enrollmentResult.parentUsername}</span>
                    <span className="font-mono text-[11px] text-red-600 font-bold block">Pass: {enrollmentResult.parentPassword || 'Parent@123'}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <Link
                    href="/admin/id-cards"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow flex items-center gap-1.5"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Print Student ID Card</span>
                  </Link>
                  <Link
                    href={`/admin/students/${enrollmentResult.studentId}`}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Open Student 360° Profile</span>
                  </Link>
                </div>
              </div>
            ) : (
              /* Applicant Details & 1-Click Enrollment Trigger */
              <div className="space-y-5">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Applying Class:</span>
                    <strong className="text-slate-900">{selectedApp.applyingClassName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Date of Birth:</span>
                    <strong className="text-slate-900">{new Date(selectedApp.dob).toLocaleDateString('en-GB')} ({selectedApp.gender})</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Father Name:</span>
                    <strong className="text-slate-900">{selectedApp.fatherName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Father Mobile:</span>
                    <strong className="text-slate-900 font-mono">{selectedApp.fatherPhone}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Address:</span>
                    <strong className="text-slate-900">{selectedApp.houseStreet}, {selectedApp.area}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Previous School:</span>
                    <strong className="text-slate-900">{selectedApp.previousSchool || 'N/A'}</strong>
                  </div>
                </div>

                {/* Status Toggle Bar */}
                <div className="flex items-center gap-2 pt-2">
                  <span className="text-xs font-bold text-slate-700">Set Status:</span>
                  <button
                    onClick={() => handleUpdateStatus(selectedApp.id, 'UNDER_REVIEW')}
                    className="px-2.5 py-1 rounded bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold"
                  >
                    Under Review
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedApp.id, 'INTERVIEW_SCHEDULED')}
                    className="px-2.5 py-1 rounded bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-semibold"
                  >
                    Interview Scheduled
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedApp.id, 'APPROVED')}
                    className="px-2.5 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-semibold"
                  >
                    Approve
                  </button>
                </div>

                {/* 1-Click Approve & Enroll Form Box (Prompt Section 48) */}
                {selectedApp.status !== 'ENROLLED' ? (
                  <form onSubmit={handleApproveAndEnroll} className="bg-blue-50/80 p-5 rounded-2xl border-2 border-blue-200 space-y-4">
                    <div className="flex items-center gap-2 text-blue-950 font-bold text-sm">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>1-Click Complete Student Enrollment</span>
                    </div>
                    <p className="text-xs text-blue-800">
                      Instantly generates official Student ID, roll number, temporary portal account, fee invoice, and dual-sided QR ID Card.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-blue-900 mb-1">
                          Assign Section
                        </label>
                        <select
                          value={enrollmentForm.sectionId}
                          onChange={(e) => setEnrollmentForm({ ...enrollmentForm, sectionId: e.target.value })}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-blue-300 bg-white font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                          <option value="">Default (Section A)</option>
                          <option value="sec-a">Section A</option>
                          <option value="sec-b">Section B</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-blue-900 mb-1">
                          Roll Number (Leave blank to auto-generate)
                        </label>
                        <input
                          type="text"
                          placeholder="Auto-generated e.g. 08-A-023"
                          value={enrollmentForm.customRollNo}
                          onChange={(e) => setEnrollmentForm({ ...enrollmentForm, customRollNo: e.target.value })}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-blue-300 bg-white font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                        </input>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isEnrolling}
                      className="w-full py-3 bg-gradient-to-r from-blue-700 to-emerald-600 hover:from-blue-600 hover:to-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all"
                    >
                      {isEnrolling ? <span className="animate-spin">⏳</span> : <UserCheck className="w-4 h-4" />}
                      <span>Approve & Enroll Student Now</span>
                    </button>
                  </form>
                ) : (
                  <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900">
                    This applicant is already enrolled. You can inspect their profile in the Student Directory.
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
