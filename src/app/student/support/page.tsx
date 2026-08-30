'use client';

import React, { useState, useEffect } from 'react';
import { 
  HelpCircle, 
  Send, 
  Bot, 
  User, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  MessageSquare, 
  Sparkles, 
  PlusCircle, 
  ChevronRight,
  Headphones,
  RefreshCw
} from 'lucide-react';
import PortalCircularLoader from '@/components/common/PortalCircularLoader';

export default function StudentSupportPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  const [formData, setFormData] = useState({
    category: 'PORTAL_ISSUE',
    subject: '',
    description: '',
    priority: 'NORMAL',
  });
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchTickets = () => {
    fetch('/api/student/support')
      .then((res) => res.json())
      .then((data) => {
        if (data.tickets) {
          setTickets(data.tickets);
          if (data.tickets.length > 0 && !selectedTicket) {
            setSelectedTicket(data.tickets[0]);
          } else if (selectedTicket) {
            const updated = data.tickets.find((t: any) => t.id === selectedTicket.id);
            if (updated) setSelectedTicket(updated);
          }
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/student/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg(`Ticket #${data.ticket.ticketNumber} created successfully! Our AI and Admin desk are on it.`);
        setShowNewModal(false);
        setFormData({ category: 'PORTAL_ISSUE', subject: '', description: '', priority: 'NORMAL' });
        fetchTickets();
        setSelectedTicket(data.ticket);
      }
    } catch {
      // error
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedTicket) return;
    setSendingReply(true);

    try {
      const res = await fetch('/api/student/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId: selectedTicket.id,
          message: replyText,
        }),
      });

      if (res.ok) {
        setReplyText('');
        fetchTickets();
      }
    } catch {
      // error
    } finally {
      setSendingReply(false);
    }
  };

  if (loading) {
    return (
      <div className="p-16 text-center">
        <PortalCircularLoader message="Connecting to Support Desk..." subMessage="Loading student service tickets" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            AI Support & Admin Helpdesk
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Chat with THMS AI Support or submit direct issue requests to School Administration.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchTickets()}
            className="p-2.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold transition-all"
            title="Refresh Tickets"
          >
            <RefreshCw className="w-4 h-4 text-slate-600" />
          </button>

          <button
            onClick={() => setShowNewModal(true)}
            className="px-5 py-3 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-black text-xs rounded-2xl shadow-md shadow-orange-500/20 flex items-center gap-2 transition-all hover:scale-105"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Support Request</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main 2-Column Support Desk */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Tickets List */}
        <div className="lg:col-span-4 space-y-4">
          <span className="text-xs font-black text-slate-900 block">Your Helpdesk Tickets ({tickets.length})</span>

          {tickets.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 space-y-3 shadow-sm">
              <Headphones className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-slate-700">No active support requests</p>
              <p className="text-[11px] text-slate-400">Need help with fee vouchers or exams? Open a new request above!</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
              {tickets.map((t) => {
                const isSelected = selectedTicket?.id === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTicket(t)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-2 ${
                      isSelected
                        ? 'bg-orange-500/10 border-orange-300 shadow-sm'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold text-orange-600">
                        {t.ticketNumber}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border ${
                        t.status === 'RESOLVED'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : t.status === 'IN_PROGRESS'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {t.status}
                      </span>
                    </div>

                    <h3 className="font-bold text-xs text-slate-900 line-clamp-1">{t.subject}</h3>
                    <p className="text-[11px] text-slate-500 line-clamp-1">{t.description}</p>
                    <span className="text-[10px] text-slate-400 block pt-1 border-t border-slate-100 font-mono">
                      {new Date(t.createdAt).toLocaleDateString('en-GB')}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Active Ticket Conversation Stream */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col h-[600px] overflow-hidden">
          {selectedTicket ? (
            <>
              {/* Header */}
              <div className="p-5 border-b border-slate-100 flex items-center justify-between gap-4 bg-slate-50/50">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-orange-600">{selectedTicket.ticketNumber}</span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-slate-200 text-slate-700">
                      {selectedTicket.category}
                    </span>
                  </div>
                  <h2 className="font-black text-sm text-slate-900">{selectedTicket.subject}</h2>
                </div>

                <span className={`px-3 py-1 rounded-full text-xs font-black border ${
                  selectedTicket.status === 'RESOLVED'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  {selectedTicket.status}
                </span>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {selectedTicket.messages?.map((msg: any) => {
                  const isStudent = msg.senderRole === 'STUDENT';
                  const isAI = msg.senderRole === 'AI_BOT';

                  return (
                    <div
                      key={msg.id}
                      className={`flex items-start gap-3 ${isStudent ? 'flex-row-reverse' : ''}`}
                    >
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                          isStudent
                            ? 'bg-slate-900 text-white'
                            : isAI
                            ? 'bg-gradient-to-tr from-orange-500 to-amber-500 text-white'
                            : 'bg-blue-600 text-white'
                        }`}
                      >
                        {isAI ? <Bot className="w-4 h-4" /> : isStudent ? <User className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                      </div>

                      <div
                        className={`max-w-xl rounded-2xl p-4 text-xs font-medium space-y-1 ${
                          isStudent
                            ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white'
                            : isAI
                            ? 'bg-orange-50/70 border border-orange-200/80 text-orange-950'
                            : 'bg-slate-100 border border-slate-200 text-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-4 text-[10px] opacity-80">
                          <span className="font-bold">{msg.senderName}</span>
                          <span className="font-mono">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Reply Input Bar */}
              <div className="p-4 border-t border-slate-100 bg-white flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Type your reply to School Administration..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSendReply(); }}
                  className="flex-1 px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 outline-none focus:ring-2 focus:ring-orange-500"
                />
                <button
                  onClick={handleSendReply}
                  disabled={sendingReply || !replyText.trim()}
                  className="p-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-black shadow-md shadow-orange-500/25 transition-all hover:scale-105 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
              <MessageSquare className="w-12 h-12 text-slate-300" />
              <h3 className="font-bold text-sm text-slate-700">Select a Ticket to View Discussion</h3>
              <p className="text-xs text-slate-400">Click on any ticket from the left panel or create a new inquiry.</p>
            </div>
          )}
        </div>

      </div>

      {/* New Ticket Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-lg font-black text-slate-900">Create Support Request</h2>
                <p className="text-xs text-slate-500">Direct connection to School Administration & AI Triage</p>
              </div>
              <button
                onClick={() => setShowNewModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block text-slate-700 font-bold">Issue Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 font-medium text-slate-900 outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="PORTAL_ISSUE">Portal Access / Technical Error</option>
                  <option value="FEE_DISCREPANCY">Fee Voucher / Payment Issue</option>
                  <option value="ID_CARD_CORRECTION">Smart Digital ID Card Correction</option>
                  <option value="TIMETABLE_EXAM">Timetable or Exam Schedule Query</option>
                  <option value="GENERAL">General Academic Inquiries</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-slate-700 font-bold">Subject Summary</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Need correction in Father's name on Smart ID"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 font-medium text-slate-900 outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-slate-700 font-bold">Detailed Explanation</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Please describe the issue in detail..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-3.5 rounded-2xl bg-slate-50 border border-slate-200 font-medium text-slate-900 outline-none focus:ring-2 focus:ring-orange-500"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-black text-xs rounded-2xl shadow-md shadow-orange-500/20 transition-all hover:scale-105"
                >
                  {submitting ? 'Submitting Ticket...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
