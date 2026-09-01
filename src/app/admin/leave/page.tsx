'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  CalendarCheck, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  RefreshCw, 
  Filter, 
  Sparkles,
  Loader2,
  Users,
  AlertCircle
} from 'lucide-react';

export default function AdminLeaveDeskPage() {
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  // Review Modal
  const [selectedLeave, setSelectedLeave] = useState<any | null>(null);
  const [decision, setDecision] = useState<'APPROVED' | 'REJECTED'>('APPROVED');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchLeaves = () => {
    setLoading(true);
    let url = `/api/leave?status=${statusFilter}`;
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.leaves) setLeaves(data.leaves);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLeaves();
  }, [statusFilter]);

  const handleReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeave) return;
    setSaving(true);

    try {
      const res = await fetch('/api/leave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'REVIEW',
          leaveId: selectedLeave.id,
          decision,
          notes,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSelectedLeave(null);
        setNotes('');
        fetchLeaves();
      } else {
        alert(data.error || 'Failed to review leave');
      }
    } catch {
      alert('Error reviewing leave');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 bg-[#ffffff] text-slate-900 pb-16">
      
      {/* Top Header Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-[#0a192f] text-white p-8 sm:p-10 shadow-2xl border border-blue-900/40">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-600/25 text-blue-300 text-xs font-bold border border-blue-500/40 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
              <span>Principal Desk & HR Approvals • Session 2026-2027</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white font-serif">
              Faculty & Staff Leave Approvals Desk
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
              Review formal leave applications submitted by teaching faculty and administrative staff with 1-click approvals and remarks.
            </p>
          </div>

          <button
            onClick={fetchLeaves}
            className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 backdrop-blur-xl flex items-center gap-2 transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh List</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-2">
        {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              statusFilter === st
                ? 'bg-blue-600 text-white shadow'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Leave Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading leave requests from database...</div>
        ) : leaves.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400 space-y-2">
            <CalendarCheck className="w-8 h-8 mx-auto text-slate-300" />
            <p>No leave requests found for this filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b text-slate-600 font-bold">
                <tr>
                  <th className="p-3">Applicant Name</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Leave Type</th>
                  <th className="p-3">Dates</th>
                  <th className="p-3">Days</th>
                  <th className="p-3">Reason</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leaves.map((l) => {
                  const applicantName = l.user?.teacher?.fullName || l.user?.staff?.fullName || l.user?.username || 'Employee';
                  const roleName = l.user?.role || 'FACULTY';
                  return (
                    <tr key={l.id}>
                      <td className="p-3 font-bold text-slate-900">{applicantName}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-bold">
                          {roleName}
                        </span>
                      </td>
                      <td className="p-3 font-medium">{l.leaveType}</td>
                      <td className="p-3 text-slate-600">
                        {new Date(l.startDate).toLocaleDateString('en-GB')} - {new Date(l.endDate).toLocaleDateString('en-GB')}
                      </td>
                      <td className="p-3 font-mono font-bold text-blue-900">{l.totalDays}</td>
                      <td className="p-3 text-slate-600 max-w-xs truncate">{l.reason}</td>
                      <td className="p-3">
                        <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold ${
                          l.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700' :
                          l.status === 'REJECTED' ? 'bg-rose-50 text-rose-700' :
                          'bg-amber-50 text-amber-700'
                        }`}>
                          {l.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        {l.status === 'PENDING' ? (
                          <button
                            onClick={() => {
                              setSelectedLeave(l);
                              setDecision('APPROVED');
                            }}
                            className="px-3 py-1 btn-blue-prestige text-white text-[11px] font-bold rounded-lg shadow"
                          >
                            Review & Decide
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-medium">Decided</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedLeave && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-black text-slate-900">Review Leave Request</h3>
              <button
                onClick={() => setSelectedLeave(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-blue-50/70 rounded-2xl border border-blue-200 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Applicant:</span>
                <strong className="text-slate-900">{selectedLeave.user?.teacher?.fullName || selectedLeave.user?.staff?.fullName || selectedLeave.user?.username}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Dates:</span>
                <strong className="text-slate-900">{new Date(selectedLeave.startDate).toLocaleDateString('en-GB')} to {new Date(selectedLeave.endDate).toLocaleDateString('en-GB')} ({selectedLeave.totalDays} days)</strong>
              </div>
              <div className="pt-1 border-t text-slate-700">
                <strong>Reason:</strong> {selectedLeave.reason}
              </div>
            </div>

            <form onSubmit={handleReview} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Decision *</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setDecision('APPROVED')}
                    className={`flex-1 py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 ${
                      decision === 'APPROVED' ? 'bg-emerald-600 text-white shadow' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve Leave</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDecision('REJECTED')}
                    className={`flex-1 py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 ${
                      decision === 'REJECTED' ? 'bg-rose-600 text-white shadow' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject Leave</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Principal Review Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Approved. Please arrange substitute for periods 2 & 4."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setSelectedLeave(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl btn-blue-prestige text-white font-bold shadow flex items-center gap-1.5"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>Confirm Decision</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
