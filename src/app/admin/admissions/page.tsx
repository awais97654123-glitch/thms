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
  AlertCircle,
  Loader2,
  RefreshCw,
  Copy,
  Check,
  CalendarCheck,
  Send,
  MessageSquare,
  ShieldCheck,
  HelpCircle,
  ChevronDown
} from 'lucide-react';

export default function AdminAdmissionsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Status update state
  const [statusUpdating, setStatusUpdating] = useState<string | null>(null);
  const [statusNotification, setStatusNotification] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  
  // Detailed review fields inside modal
  const [reviewNotes, setReviewNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [interviewDate, setInterviewDate] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [showInterviewForm, setShowInterviewForm] = useState(false);

  // 1-Click Enrollment Modal State
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [enrollmentResult, setEnrollmentResult] = useState<any | null>(null);
  const [enrollmentForm, setEnrollmentForm] = useState({
    sectionId: '',
    customRollNo: '',
  });

  const [copiedSlip, setCopiedSlip] = useState(false);

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
  }, [filterStatus]);

  useEffect(() => {
    fetch('/api/classes')
      .then((res) => res.json())
      .then((data) => {
        if (data.classes) setClasses(data.classes);
      })
      .catch(console.error);
  }, []);

  // When selectedApp changes, initialize review fields
  useEffect(() => {
    if (selectedApp) {
      setReviewNotes(selectedApp.reviewNotes || '');
      setRejectionReason(selectedApp.rejectionReason || '');
      setInterviewDate(selectedApp.interviewDate ? new Date(selectedApp.interviewDate).toISOString().slice(0, 16) : '');
      setShowRejectForm(false);
      setShowInterviewForm(false);
      setStatusNotification(null);
    }
  }, [selectedApp?.id]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchApplications();
  };

  const handleUpdateStatus = async (
    id: string, 
    newStatus: string, 
    additionalData?: { reviewNotes?: string; rejectionReason?: string; interviewDate?: string }
  ) => {
    setStatusUpdating(newStatus);
    setStatusNotification(null);

    try {
      const payload: any = { status: newStatus, ...additionalData };
      const res = await fetch(`/api/admissions/${id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStatusNotification({
          text: `Application status successfully updated to "${newStatus.replace(/_/g, ' ')}"`,
          type: 'success',
        });

        // Update in table list
        setApplications((prev) =>
          prev.map((app) => (app.id === id ? { ...app, ...data.application } : app))
        );

        // Update selected modal object
        if (selectedApp && selectedApp.id === id) {
          setSelectedApp((prev: any) => ({ ...prev, ...data.application }));
        }

        setShowRejectForm(false);
        setShowInterviewForm(false);
      } else {
        setStatusNotification({
          text: data.error || 'Failed to update application status.',
          type: 'error',
        });
      }
    } catch (err: any) {
      console.error(err);
      setStatusNotification({
        text: err?.message || 'Network error updating status.',
        type: 'error',
      });
    } finally {
      setStatusUpdating(null);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedApp) return;
    setStatusUpdating('SAVING_NOTES');
    try {
      const res = await fetch(`/api/admissions/${selectedApp.id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewNotes }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatusNotification({ text: 'Review notes saved successfully!', type: 'success' });
        setSelectedApp((prev: any) => ({ ...prev, reviewNotes }));
      } else {
        setStatusNotification({ text: data.error || 'Failed to save notes.', type: 'error' });
      }
    } catch (err: any) {
      setStatusNotification({ text: 'Error saving notes.', type: 'error' });
    } finally {
      setStatusUpdating(null);
    }
  };

  const handleApproveAndEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;
    setIsEnrolling(true);
    setStatusNotification(null);

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
        if (selectedApp) {
          setSelectedApp((prev: any) => ({ ...prev, status: 'ENROLLED', enrolledStudentId: data.enrollment.studentId }));
        }
      } else {
        alert(data.error || 'Failed to approve & enroll student');
      }
    } catch (err: any) {
      console.error(err);
      alert('Error during enrollment process: ' + (err?.message || 'Network failure'));
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
      case 'SUBMITTED':
      default:
        return 'bg-orange-50 text-orange-700 border-orange-300';
    }
  };

  // Find sections for selected application's class
  const appClass = classes.find(c => c.id === selectedApp?.applyingClassId || c.name === selectedApp?.applyingClassName);
  const availableSections = appClass?.sections || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Title & CTA */}
      <div className="flex flex-wrap items-center justify-between gap-4 glass-panel p-6 sm:p-8 rounded-3xl border border-white shadow-sm">
        <div className="space-y-1">
          <span className="text-xs font-black uppercase tracking-wider text-orange-600">
            Admissions Management Hub
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            Online Applications & 1-Click Enrollment Desk
          </h1>
          <p className="text-xs text-slate-500 font-medium max-w-2xl">
            Review applicant submissions, set verification workflow status, schedule interviews, and instantly generate official Student IDs, portal logins, and fee vouchers.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchApplications}
            className="p-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold border border-slate-200 shadow-sm transition-colors"
            title="Refresh List"
          >
            <RefreshCw className={`w-4 h-4 text-slate-600 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link
            href="/admissions/apply"
            target="_blank"
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-200 shadow-sm"
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
          {['ALL', 'SUBMITTED', 'UNDER_REVIEW', 'INTERVIEW_SCHEDULED', 'APPROVED', 'REJECTED', 'ENROLLED'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3.5 py-1.5 rounded-xl transition-all ${
                filterStatus === st
                  ? 'bg-orange-600 text-white font-black shadow-md shadow-orange-500/20 scale-[1.02]'
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
              className="pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-orange-500 outline-none w-64 font-medium shadow-sm"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
          >
            Search
          </button>
        </form>
      </div>

      {/* Applications Data Table */}
      <div className="glass-panel rounded-3xl border border-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50/90 border-b border-slate-200 text-slate-600 font-black uppercase text-[10px] tracking-wider">
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
                  <td colSpan={7} className="p-16 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-xs font-bold text-slate-600">Loading admission applications...</span>
                    </div>
                  </td>
                </tr>
              ) : applications.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-16 text-center text-slate-400 font-medium">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <FileText className="w-8 h-8 text-slate-300" />
                      <p className="text-xs font-bold text-slate-600">No applications found</p>
                      <p className="text-[11px] text-slate-400">No applications matching status filter &ldquo;{filterStatus}&rdquo;.</p>
                    </div>
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
                      <span className="text-[11px] text-slate-500">
                        {app.gender} • DOB: {app.dob ? new Date(app.dob).toLocaleDateString('en-GB') : 'N/A'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200">
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
                        {app.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedApp(app);
                            setEnrollmentResult(null);
                          }}
                          className="px-3.5 py-1.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-xs transition-all shadow-sm flex items-center gap-1"
                        >
                          <span>Review & Enroll</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
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
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 sm:p-8 space-y-6">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] uppercase font-black text-orange-600 block tracking-wider">
                  Admission Review Desk & Enrollment Engine
                </span>
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2 mt-0.5">
                  <span>{selectedApp.fullName}</span>
                  <span className="font-mono text-xs font-bold px-2.5 py-0.5 bg-orange-100 text-orange-900 rounded-lg">
                    {selectedApp.applicationNo}
                  </span>
                </h3>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition-colors"
              >
                ✕ Close
              </button>
            </div>

            {/* Notification Banner */}
            {statusNotification && (
              <div className={`p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in ${
                statusNotification.type === 'success'
                  ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                  : 'bg-rose-50 text-rose-900 border border-rose-200'
              }`}>
                {statusNotification.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                )}
                <span>{statusNotification.text}</span>
              </div>
            )}

            {/* If Enrolled, Show Celebratory Credentials Slip */}
            {enrollmentResult ? (
              <div className="p-6 bg-emerald-50/90 rounded-2xl border-2 border-emerald-300 space-y-5 animate-in fade-in">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-200 pb-3">
                  <div className="flex items-center gap-2.5 text-emerald-950 font-black text-base">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                    <div>
                      <span>Student Successfully Enrolled!</span>
                      <p className="text-[11px] text-emerald-800 font-medium">All student & parent credentials and initial fee voucher have been generated.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const text = `*THE HAYATABAD MODEL SCHOOL — OFFICIAL ENROLLMENT CREDENTIALS*\nStudent: ${enrollmentResult.fullName}\nClass: ${enrollmentResult.className} (${enrollmentResult.sectionName}, Roll ${enrollmentResult.rollNo})\nStudent ID: ${enrollmentResult.studentId}\nAdmission No: ${enrollmentResult.admissionNo}\n\n*PORTAL CREDENTIALS*\nStudent Login: ${enrollmentResult.studentUsername}\nPassword: ${enrollmentResult.studentPassword}\n\nParent Login: ${enrollmentResult.parentUsername}\nPassword: ${enrollmentResult.parentPassword}\n\nLogin URL: http://localhost:3000/login`;
                      navigator.clipboard.writeText(text);
                      setCopiedSlip(true);
                      setTimeout(() => setCopiedSlip(false), 3000);
                    }}
                    className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1.5"
                  >
                    {copiedSlip ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedSlip ? 'Copied to Clipboard!' : 'Copy WhatsApp Slip'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-4 rounded-2xl border border-emerald-200 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Student ID:</span>
                    <strong className="font-mono text-blue-900 text-sm font-black">{enrollmentResult.studentId}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Admission No:</span>
                    <strong className="font-mono text-slate-800 text-sm font-bold">{enrollmentResult.admissionNo}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Class & Section:</span>
                    <strong className="text-emerald-800 font-bold">{enrollmentResult.className} ({enrollmentResult.sectionName})</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Roll Number:</span>
                    <strong className="text-purple-800 font-mono font-bold">{enrollmentResult.rollNo}</strong>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200">
                    <span className="text-blue-900 font-black block text-xs mb-1">Student Portal Login:</span>
                    <div className="space-y-0.5 text-xs">
                      <p><span className="text-slate-500 font-medium">Username:</span> <span className="font-mono font-bold text-blue-950">{enrollmentResult.studentUsername}</span></p>
                      <p><span className="text-slate-500 font-medium">Password:</span> <span className="font-mono font-bold text-rose-600">{enrollmentResult.studentPassword}</span></p>
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200">
                    <span className="text-amber-900 font-black block text-xs mb-1">Parent Portal Login:</span>
                    <div className="space-y-0.5 text-xs">
                      <p><span className="text-slate-500 font-medium">Username:</span> <span className="font-mono font-bold text-amber-950">{enrollmentResult.parentUsername}</span></p>
                      <p><span className="text-slate-500 font-medium">Password:</span> <span className="font-mono font-bold text-rose-600">{enrollmentResult.parentPassword}</span></p>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-emerald-200 text-xs flex items-center justify-between">
                  <span className="text-slate-600 font-medium">Initial Admission Fee Invoice:</span>
                  <span className="font-mono font-bold text-teal-800">{enrollmentResult.invoiceNo} (Rs. {enrollmentResult.initialAmount?.toLocaleString()})</span>
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
                    <span>View Student Directory</span>
                  </Link>
                </div>
              </div>
            ) : (
              /* Complete Applicant Details View */
              <div className="space-y-5">
                
                {/* 1. Applicant Profile Summary */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 bg-slate-50/80 p-5 rounded-2xl border border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px] font-bold uppercase">Applying Class:</span>
                    <strong className="text-slate-900 font-bold text-sm">{selectedApp.applyingClassName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] font-bold uppercase">Date of Birth & Gender:</span>
                    <strong className="text-slate-900 font-medium">
                      {selectedApp.dob ? new Date(selectedApp.dob).toLocaleDateString('en-GB') : 'N/A'} ({selectedApp.gender})
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] font-bold uppercase">Current Status:</span>
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black border mt-0.5 ${getStatusBadge(selectedApp.status)}`}>
                      {selectedApp.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] font-bold uppercase">Father Name:</span>
                    <strong className="text-slate-900 font-bold">{selectedApp.fatherName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] font-bold uppercase">Father Phone:</span>
                    <strong className="text-slate-900 font-mono font-bold text-blue-900">{selectedApp.fatherPhone}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] font-bold uppercase">Father Email:</span>
                    <strong className="text-slate-700 font-medium">{selectedApp.fatherEmail || 'Not Provided'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] font-bold uppercase">Residential Address:</span>
                    <strong className="text-slate-900 font-medium">{selectedApp.houseStreet}, {selectedApp.area}, {selectedApp.city}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] font-bold uppercase">Previous School:</span>
                    <strong className="text-slate-900 font-medium">{selectedApp.previousSchool || 'First Enrollment'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] font-bold uppercase">Emergency Contact:</span>
                    <strong className="text-slate-900 font-mono font-medium">{selectedApp.emergencyPhone || selectedApp.fatherPhone}</strong>
                  </div>
                </div>

                {/* 2. Review Status Action Bar */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                      Workflow Status Actions
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">Click to update status</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* SUBMITTED */}
                    <button
                      type="button"
                      disabled={statusUpdating !== null}
                      onClick={() => handleUpdateStatus(selectedApp.id, 'SUBMITTED')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
                        selectedApp.status === 'SUBMITTED'
                          ? 'bg-orange-600 text-white border-orange-700 shadow-sm'
                          : 'bg-white hover:bg-orange-50 text-orange-900 border-orange-200'
                      }`}
                    >
                      {statusUpdating === 'SUBMITTED' ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <FileText className="w-3.5 h-3.5" />
                      )}
                      <span>Submitted</span>
                    </button>

                    {/* UNDER REVIEW */}
                    <button
                      type="button"
                      disabled={statusUpdating !== null}
                      onClick={() => handleUpdateStatus(selectedApp.id, 'UNDER_REVIEW')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
                        selectedApp.status === 'UNDER_REVIEW'
                          ? 'bg-amber-600 text-white border-amber-700 shadow-sm'
                          : 'bg-white hover:bg-amber-50 text-amber-900 border-amber-200'
                      }`}
                    >
                      {statusUpdating === 'UNDER_REVIEW' ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Clock className="w-3.5 h-3.5" />
                      )}
                      <span>Under Review</span>
                    </button>

                    {/* SCHEDULE INTERVIEW */}
                    <button
                      type="button"
                      disabled={statusUpdating !== null}
                      onClick={() => setShowInterviewForm(!showInterviewForm)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
                        selectedApp.status === 'INTERVIEW_SCHEDULED' || showInterviewForm
                          ? 'bg-purple-600 text-white border-purple-700 shadow-sm'
                          : 'bg-white hover:bg-purple-50 text-purple-900 border-purple-200'
                      }`}
                    >
                      {statusUpdating === 'INTERVIEW_SCHEDULED' ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Calendar className="w-3.5 h-3.5" />
                      )}
                      <span>Schedule Interview</span>
                    </button>

                    {/* APPROVE APPLICATION */}
                    <button
                      type="button"
                      disabled={statusUpdating !== null}
                      onClick={() => handleUpdateStatus(selectedApp.id, 'APPROVED')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
                        selectedApp.status === 'APPROVED'
                          ? 'bg-blue-600 text-white border-blue-700 shadow-sm'
                          : 'bg-white hover:bg-blue-50 text-blue-900 border-blue-200'
                      }`}
                    >
                      {statusUpdating === 'APPROVED' ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      )}
                      <span>Approve Application</span>
                    </button>

                    {/* REJECT */}
                    <button
                      type="button"
                      disabled={statusUpdating !== null}
                      onClick={() => setShowRejectForm(!showRejectForm)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
                        selectedApp.status === 'REJECTED' || showRejectForm
                          ? 'bg-rose-600 text-white border-rose-700 shadow-sm'
                          : 'bg-white hover:bg-rose-50 text-rose-900 border-rose-200'
                      }`}
                    >
                      {statusUpdating === 'REJECTED' ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5" />
                      )}
                      <span>Reject</span>
                    </button>
                  </div>

                  {/* Interview Date Scheduler Form Drawer */}
                  {showInterviewForm && (
                    <div className="p-4 bg-purple-50/80 rounded-2xl border border-purple-200 space-y-3 animate-in fade-in">
                      <span className="text-xs font-bold text-purple-950 block">Set Assessment & Interview Date:</span>
                      <div className="flex flex-wrap items-center gap-2">
                        <input
                          type="datetime-local"
                          value={interviewDate}
                          onChange={(e) => setInterviewDate(e.target.value)}
                          className="px-3 py-2 text-xs rounded-xl border border-purple-300 bg-white font-medium focus:ring-2 focus:ring-purple-500 outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(selectedApp.id, 'INTERVIEW_SCHEDULED', { interviewDate })}
                          className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-xl shadow transition-colors"
                        >
                          Confirm & Schedule
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Rejection Reason Form Drawer */}
                  {showRejectForm && (
                    <div className="p-4 bg-rose-50/80 rounded-2xl border border-rose-200 space-y-3 animate-in fade-in">
                      <span className="text-xs font-bold text-rose-950 block">Specify Reason for Rejection:</span>
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-1.5">
                          {['Incomplete documentation', 'Failed admission assessment', 'Age limit criteria', 'Class capacity full'].map((preset) => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => setRejectionReason(preset)}
                              className="px-2.5 py-1 rounded-lg bg-white hover:bg-rose-100 text-[11px] font-medium text-rose-900 border border-rose-200"
                            >
                              {preset}
                            </button>
                          ))}
                        </div>
                        <input
                          type="text"
                          placeholder="Rejection reason details..."
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-rose-300 bg-white font-medium focus:ring-2 focus:ring-rose-500 outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(selectedApp.id, 'REJECTED', { rejectionReason })}
                          className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold rounded-xl shadow transition-colors"
                        >
                          Confirm Rejection
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Review Notes Field */}
                <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                      <span>Internal Admission Review Notes:</span>
                    </span>
                    <button
                      type="button"
                      disabled={statusUpdating === 'SAVING_NOTES'}
                      onClick={handleSaveNotes}
                      className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1"
                    >
                      {statusUpdating === 'SAVING_NOTES' ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                      <span>Save Notes</span>
                    </button>
                  </div>
                  <textarea
                    rows={2}
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="Enter notes about student test marks, interview remarks, or fee concessions..."
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-orange-500 outline-none resize-none"
                  />
                </div>

                {/* 4. 1-Click Approve & Enroll Form Box */}
                {selectedApp.status !== 'ENROLLED' ? (
                  <form onSubmit={handleApproveAndEnroll} className="bg-gradient-to-br from-orange-50/90 to-amber-50/90 p-6 rounded-3xl border-2 border-orange-200 space-y-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-orange-950 font-black text-sm">
                        <Sparkles className="w-4 h-4 text-orange-600" />
                        <span>1-Click Official Student Enrollment</span>
                      </div>
                      <span className="text-[11px] font-bold text-orange-700 bg-orange-100 px-2.5 py-0.5 rounded-full">
                        Instant Roll No & Accounts
                      </span>
                    </div>
                    
                    <p className="text-xs text-orange-900 font-medium">
                      Instantly generates official Student ID, roll number, student & parent portal logins, initial fee voucher, and student directory registration.
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
                          <option value="">Default (Auto Assign)</option>
                          {availableSections.map((sec: any) => (
                            <option key={sec.id} value={sec.id}>
                              {sec.name} (Capacity: {sec.capacity || 40})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-orange-950 mb-1">
                          Roll Number (Optional - Leave blank for auto)
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
                      className="w-full py-3.5 bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-black text-xs rounded-2xl shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] disabled:opacity-60 cursor-pointer"
                    >
                      {isEnrolling ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Enrolling Student & Generating Accounts...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <UserCheck className="w-4 h-4" />
                          <span>Approve & Enroll Student Now</span>
                        </div>
                      )}
                    </button>
                  </form>
                ) : (
                  <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>This applicant is already enrolled in the school register.</span>
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
