'use client';

import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Send, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  FileText, 
  Sparkles,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import PortalCircularLoader from '@/components/common/PortalCircularLoader';

export default function StudentLeavePage() {
  const [leaves, setLeaves] = useState<any[]>([
    {
      id: '1',
      reason: 'Medical Leave (Viral Fever & Doctor Advised Bed Rest)',
      startDate: '2026-09-02',
      endDate: '2026-09-04',
      days: 3,
      status: 'APPROVED',
      approvedBy: 'Principal Office & Class Teacher',
      appliedAt: '2026-08-30',
    },
    {
      id: '2',
      reason: 'Family Urgent Event / Sister Marriage Ceremony',
      startDate: '2026-09-10',
      endDate: '2026-09-11',
      days: 2,
      status: 'PENDING',
      approvedBy: 'Under Admin Review',
      appliedAt: '2026-08-31',
    },
  ]);

  const [formData, setFormData] = useState({
    leaveType: 'MEDICAL',
    startDate: '',
    endDate: '',
    reason: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg(null);

    try {
      await new Promise((r) => setTimeout(r, 600));

      const newLeave = {
        id: Date.now().toString(),
        reason: `${formData.leaveType}: ${formData.reason}`,
        startDate: formData.startDate,
        endDate: formData.endDate,
        days: 1,
        status: 'PENDING',
        approvedBy: 'Under Teacher & Admin Review',
        appliedAt: new Date().toISOString().split('T')[0],
      };

      setLeaves([newLeave, ...leaves]);
      setSuccessMsg('Leave application submitted successfully! Your class teacher has been notified.');
      setFormData({ leaveType: 'MEDICAL', startDate: '', endDate: '', reason: '' });
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch {
      // error
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Leave & Absence Application Desk
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Submit formal leave applications directly to your class teacher and school administration.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 text-orange-700 text-xs font-black border border-orange-200">
          <ShieldCheck className="w-4 h-4 text-orange-600" />
          <span>Official Leave Register</span>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Leave Application Form */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-black text-slate-900">Apply for New Leave</h2>
            <p className="text-xs text-slate-500 font-medium">Fill in absence dates and reason</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="block text-slate-700 font-bold">Leave Category</label>
              <select
                value={formData.leaveType}
                onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
                className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 font-medium text-slate-900 outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="MEDICAL">Medical / Sickness</option>
                <option value="URGENT_WORK">Urgent Family Work</option>
                <option value="OUT_OF_STATION">Out of Station</option>
                <option value="SPECIAL_EVENT">Ceremony / Special Event</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-slate-700 font-bold">From Date</label>
                <input
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 font-medium text-slate-900 outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-slate-700 font-bold">To Date</label>
                <input
                  type="date"
                  required
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 font-medium text-slate-900 outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-slate-700 font-bold">Reason & Doctor / Parent Remarks</label>
              <textarea
                rows={3}
                required
                placeholder="Explain the detailed reason for absence..."
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                className="w-full p-3.5 rounded-2xl bg-slate-50 border border-slate-200 font-medium text-slate-900 outline-none focus:ring-2 focus:ring-orange-500"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-black text-xs rounded-2xl shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? 'Submitting Application...' : 'Send Leave Request to Teacher'}</span>
            </button>
          </form>
        </div>

        {/* Right: Leave History & Status Table */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-black text-slate-900">Leave History & Status</h2>
            <p className="text-xs text-slate-500 font-medium">Real-time status updates from class teachers and principal</p>
          </div>

          <div className="space-y-3">
            {leaves.map((l) => (
              <div
                key={l.id}
                className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 hover:bg-orange-50/30 transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                    l.status === 'APPROVED'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : l.status === 'REJECTED'
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {l.status === 'APPROVED' ? '✓ Approved' : l.status === 'REJECTED' ? '✗ Rejected' : '⏳ Pending Review'}
                  </span>

                  <span className="text-[10px] font-mono text-slate-400 font-bold">
                    Applied: {l.appliedAt}
                  </span>
                </div>

                <h3 className="font-bold text-xs text-slate-900 leading-snug">{l.reason}</h3>

                <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                  <span>Dates: <strong className="text-slate-800">{l.startDate}</strong> to <strong className="text-slate-800">{l.endDate}</strong> ({l.days} Days)</span>
                  <span className="font-medium text-orange-600">{l.approvedBy}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
