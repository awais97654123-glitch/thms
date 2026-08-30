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
  DollarSign,
  Phone,
  Mail,
  MapPin,
  School,
  AlertCircle
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
        return 'bg-emerald-50 text-emerald-700 border-emerald-300';
      case 'APPROVED':
        return 'bg-blue-50 text-blue-700 border-blue-300';
      case 'INTERVIEW_SCHEDULED':
        return 'bg-purple-50 text-purple-700 border-purple-300';
      case 'UNDER_REVIEW':
        return 'bg-amber-50 text-amber-700 border-amber-300';
      case 'REJECTED':
        return 'bg-rose-50 text-rose-700 border-rose-300';
      default:
        return 'bg-orange-50 text-orange-700 border-orange-300';
    }
  };

  // Find sections for selected application's class
  const appClass = classes.find(c => c.id === selectedApp?.applyingClassId);
  const availableSections = appClass?.sections || [];

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Top Title & CTA */}
      <div className="flex flex-wrap items-center justify-between gap-4 glass-panel p-6 sm:p-8 rounded-3xl border border-white shadow-sm">
        <div className="space-y-1">
          <span className="text-xs font-black uppercase tracking-wider text-orange-600">
            Admissions Management Hub
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            Online Applications & 1-Click Enrollment
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Review online applicant submissions, schedule interviews, and automatically enroll students with official Student IDs, 3-copy fee vouchers, and smart ID cards.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admissions/apply"
            target="_blank"
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-200"
          >
            <Eye className="w-4 h-4 text-orange-600" />
            <span>Public Admission Form</span>
          </Link>
          <Link
            href="/admin/admissions/new"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-orange-500/25 transition-all hover:scale-105"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ New Admission</span>
          </Link>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 glass-panel p-4 rounded-2xl border border-white shadow-sm">
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
          {['ALL', 'SUBMITTED', 'UNDER_REVIEW', 'INTERVIEW_SCHEDULED', 'APPROVED', 'ENROLLED'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3.5 py-1.5 rounded-xl transition-all ${
                filterStatus === st
                  ? 'bg-orange-600 text-white font-black shadow-md shadow-orange-500/20'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {st.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search applicant name, app code, father..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-orange-500 outline-none w-64 font-medium"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* Applications Data Table */}
      <div className="glass-panel rounded-3xl border border-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-black uppercase text-[10px] tracking-wider">
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
                  <td colSpan={7} className="p-12 text-center text-slate-400">
                    <span className="animate-spin inline-block mr-2">⏳</span>
                    Loading admission applications...
                  </td>
                </tr>
              ) : applications.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400 font-medium">
                    No admission applications found matching this status filter.
                  </td>
                </tr>
              ) : (
                applications.map((app) => (
                  <tr key={app.id} className="hover:bg-orange-50/40 transition-colors">
                    <td className="p-4 font-mono font-bold text-orange-950">
                      {app.applicationNo}
                    </td>
                    <td className="p-4">
                      <strong className="text-slate-900 block font-bold text-xs">{app.fullName}</strong>
                      <span className="text-[11px] text-slate-500">{app.gender} • DOB: {new Date(app.dob).toLocaleDateString('en-GB')}</span>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded-lg">
                        {app.applyingClassName}
                      </span>
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-slate-800">{app.fatherName}</p>
                      <p className="text-[11px] text-slate-500 font-mono">{app.fatherPhone}</p>
                    </td>
                    <td className="p-4 text-slate-500 font-medium">
                      {new Date(app.createdAt).toLocaleDateString('en-GB')}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${getStatusBadge(app.status)}`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedApp(app);
                          setEnrollmentResult(null);
                        }}
                        className="px-3.5 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-800 font-bold rounded-xl text-xs transition-colors border border-orange-200"
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
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 sm:p-8 space-y-6">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] uppercase font-black text-orange-600 block">
                  Online Admission Review & Enrollment
                </span>
                <h3 className="text-xl font-black text-slate-900">
                  {selectedApp.fullName} ({selectedApp.applicationNo})
                </h3>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition-colors"
              >
                ✕ Close
              </button>
            </div>

            {/* If Enrolled, Show Celebratory Credentials Slip */}
            {enrollmentResult ? (
              <div className="p-6 bg-emerald-50 rounded-2xl border-2 border-emerald-300 space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 text-emerald-900 font-black text-base">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                    <span>Student Successfully Enrolled!</span>
                  </div>
                  <button
                    onClick={() => {
                      const text = `*THE HAYATABAD MODEL SCHOOL — OFFICIAL ENROLLMENT CREDENTIALS*\nStudent: ${enrollmentResult.fullName}\nClass: ${enrollmentResult.className} (${enrollmentResult.sectionName}, Roll ${enrollmentResult.rollNo})\nStudent ID: ${enrollmentResult.studentId}\nAdmission No: ${enrollmentResult.admissionNo}\n\n*PORTAL CREDENTIALS*\nStudent Login: ${enrollmentResult.studentUsername}\nPassword: ${enrollmentResult.studentPassword}\n\nParent Login: ${enrollmentResult.parentUsername}\nPassword: ${enrollmentResult.parentPassword}\n\nLogin URL: http://localhost:3000/login`;
                      navigator.clipboard.writeText(text);
                      alert('Enrollment slip copied to clipboard!');
                    }}
                    className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow transition-all"
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
                    <strong className="text-emerald-700">{enrollmentResult.className} ({enrollmentResult.sectionName}) • Roll {enrollmentResult.rollNo}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Initial Invoice No:</span>
                    <strong className="font-mono text-teal-700">{enrollmentResult.invoiceNo} (Rs. {enrollmentResult.initialAmount})</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
                    <span className="text-blue-900 font-bold block text-[11px]">Student Login:</span>
                    <span className="font-mono text-xs block text-slate-700 font-bold">{enrollmentResult.studentUsername}</span>
                    <span className="font-mono text-[11px] text-rose-600 font-bold block">Pass: {enrollmentResult.studentPassword}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                    <span className="text-amber-900 font-bold block text-[11px]">Parent Login:</span>
                    <span className="font-mono text-xs block text-slate-700 font-bold">{enrollmentResult.parentUsername}</span>
                    <span className="font-mono text-[11px] text-rose-600 font-bold block">Pass: {enrollmentResult.parentPassword}</span>
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
                    href="/admin/students"
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Student Directory</span>
                  </Link>
                </div>
              </div>
            ) : (
              /* Complete Applicant Details View */
              <div className="space-y-5">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 bg-slate-50 p-5 rounded-2xl border border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Applying Class:</span>
                    <strong className="text-slate-900 font-bold text-sm">{selectedApp.applyingClassName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Date of Birth:</span>
                    <strong className="text-slate-900 font-medium">{new Date(selectedApp.dob).toLocaleDateString('en-GB')} ({selectedApp.gender})</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Father Name:</span>
                    <strong className="text-slate-900 font-bold">{selectedApp.fatherName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Father Phone:</span>
                    <strong className="text-slate-900 font-mono font-medium">{selectedApp.fatherPhone}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Residential Address:</span>
                    <strong className="text-slate-900 font-medium">{selectedApp.houseStreet}, {selectedApp.area}, {selectedApp.city}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Previous School:</span>
                    <strong className="text-slate-900 font-medium">{selectedApp.previousSchool || 'First Enrollment'}</strong>
                  </div>
                </div>

                {/* Status Toggle Bar */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-xs font-bold text-slate-700">Set Status:</span>
                  <button
                    onClick={() => handleUpdateStatus(selectedApp.id, 'UNDER_REVIEW')}
                    className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold border border-amber-200"
                  >
                    Under Review
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedApp.id, 'INTERVIEW_SCHEDULED')}
                    className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-bold border border-purple-200"
                  >
                    Schedule Interview
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedApp.id, 'APPROVED')}
                    className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-bold border border-blue-200"
                  >
                    Approve Application
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedApp.id, 'REJECTED')}
                    className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-bold border border-rose-200"
                  >
                    Reject
                  </button>
                </div>

                {/* 1-Click Approve & Enroll Form Box */}
                {selectedApp.status !== 'ENROLLED' ? (
                  <form onSubmit={handleApproveAndEnroll} className="bg-gradient-to-br from-orange-50/80 to-amber-50/80 p-6 rounded-3xl border-2 border-orange-200 space-y-4">
                    <div className="flex items-center gap-2 text-orange-950 font-black text-sm">
                      <Sparkles className="w-4 h-4 text-orange-600" />
                      <span>1-Click Official Student Enrollment</span>
                    </div>
                    <p className="text-xs text-orange-800 font-medium">
                      Instantly generates official Student ID, roll number, student & parent portal logins, 3-copy fee voucher, and gate QR pass.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-orange-950 mb-1">
                          Assign Section
                        </label>
                        <select
                          value={enrollmentForm.sectionId}
                          onChange={(e) => setEnrollmentForm({ ...enrollmentForm, sectionId: e.target.value })}
                          className="w-full px-3.5 py-2 text-xs rounded-xl border border-orange-300 bg-white font-medium focus:ring-2 focus:ring-orange-500 outline-none"
                        >
                          <option value="">Default (Section A)</option>
                          {availableSections.map((sec: any) => (
                            <option key={sec.id} value={sec.id}>
                              {sec.name} (Capacity: {sec.capacity || 40})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-orange-950 mb-1">
                          Roll Number (Leave blank for auto-numbering)
                        </label>
                        <input
                          type="text"
                          placeholder="Auto-generated e.g. 08-A-023"
                          value={enrollmentForm.customRollNo}
                          onChange={(e) => setEnrollmentForm({ ...enrollmentForm, customRollNo: e.target.value })}
                          className="w-full px-3.5 py-2 text-xs rounded-xl border border-orange-300 bg-white font-mono focus:ring-2 focus:ring-orange-500 outline-none"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isEnrolling}
                      className="w-full py-3.5 bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-black text-xs rounded-2xl shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] disabled:opacity-50"
                    >
                      {isEnrolling ? (
                        <span className="animate-spin">⏳ Enrolling Student & Generating Accounts...</span>
                      ) : (
                        <>
                          <UserCheck className="w-4 h-4" />
                          <span>Approve & Enroll Student Now</span>
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 font-bold">
                    ✓ This applicant is already enrolled in the school register.
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
