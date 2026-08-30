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
  Filter, 
  ChevronRight,
  Headphones,
  RefreshCw
} from 'lucide-react';
import PortalCircularLoader from '@/components/common/PortalCircularLoader';

export default function AdminSupportDeskPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({ total: 0, open: 0, inProgress: 0, resolved: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [replyText, setReplyText] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [sendingReply, setSendingReply] = useState(false);

  const fetchTickets = () => {
    fetch(`/api/admin/support?status=${statusFilter}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.tickets) {
          setTickets(data.tickets);
          if (data.stats) setStats(data.stats);
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
  }, [statusFilter]);

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedTicket) return;
    setSendingReply(true);

    try {
      const res = await fetch('/api/admin/support', {
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

  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedTicket) return;
    setUpdatingStatus(true);

    try {
      const res = await fetch('/api/admin/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId: selectedTicket.id,
          status: newStatus,
        }),
      });

      if (res.ok) {
        fetchTickets();
      }
    } catch {
      // error
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="p-16 text-center">
        <PortalCircularLoader message="Loading Support Command Center..." subMessage="Fetching student tickets & AI logs" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Student Support & Issue Helpdesk
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Manage incoming student inquiries, portal error reports, fee issues, and AI bot triage logs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchTickets()}
            className="p-2.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold transition-all shadow-sm"
          >
            <RefreshCw className="w-4 h-4 text-orange-600" />
          </button>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs font-black text-slate-800 outline-none shadow-sm"
          >
            <option value="ALL">All Tickets ({stats.total})</option>
            <option value="OPEN">Open ({stats.open})</option>
            <option value="IN_PROGRESS">In Progress ({stats.inProgress})</option>
            <option value="RESOLVED">Resolved ({stats.resolved})</option>
          </select>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Inquiries</span>
          <p className="text-2xl font-black text-slate-900 font-mono">{stats.total}</p>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-amber-600">Pending / Open</span>
          <p className="text-2xl font-black text-amber-600 font-mono">{stats.open}</p>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-blue-600">In Progress</span>
          <p className="text-2xl font-black text-blue-600 font-mono">{stats.inProgress}</p>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600">Resolved</span>
          <p className="text-2xl font-black text-emerald-600 font-mono">{stats.resolved}</p>
        </div>
      </div>

      {/* 2-Column Desk */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Tickets List */}
        <div className="lg:col-span-4 space-y-3">
          <span className="text-xs font-black text-slate-900 block">Student Tickets ({tickets.length})</span>

          {tickets.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 space-y-2">
              <Headphones className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-slate-700">No tickets found</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
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
                    
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                      <span>{t.student ? `${t.student.fullName} (${t.student.class?.name || 'Class'})` : t.user?.username}</span>
                      <span className="font-mono">{new Date(t.createdAt).toLocaleDateString('en-GB')}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Active Ticket Thread */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col h-[600px] overflow-hidden">
          {selectedTicket ? (
            <>
              {/* Header with Status Selector */}
              <div className="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4 bg-slate-50/50">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-orange-600">{selectedTicket.ticketNumber}</span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-slate-200 text-slate-700">
                      {selectedTicket.category}
                    </span>
                  </div>
                  <h2 className="font-black text-sm text-slate-900">{selectedTicket.subject}</h2>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Student: {selectedTicket.student ? `${selectedTicket.student.fullName} • Roll: ${selectedTicket.student.rollNo}` : selectedTicket.user?.username}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleUpdateStatus('IN_PROGRESS')}
                    disabled={updatingStatus}
                    className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold transition-colors"
                  >
                    In Progress
                  </button>
                  <button
                    onClick={() => handleUpdateStatus('RESOLVED')}
                    disabled={updatingStatus}
                    className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold transition-colors"
                  >
                    ✓ Mark Resolved
                  </button>
                </div>
              </div>

              {/* Messages Thread */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {selectedTicket.messages?.map((msg: any) => {
                  const isAdmin = msg.senderRole === 'ADMIN';
                  const isAI = msg.senderRole === 'AI_BOT';

                  return (
                    <div
                      key={msg.id}
                      className={`flex items-start gap-3 ${isAdmin ? 'flex-row-reverse' : ''}`}
                    >
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                          isAdmin
                            ? 'bg-slate-900 text-white'
                            : isAI
                            ? 'bg-gradient-to-tr from-orange-500 to-amber-500 text-white'
                            : 'bg-orange-600 text-white'
                        }`}
                      >
                        {isAdmin ? <ShieldCheck className="w-4 h-4" /> : isAI ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                      </div>

                      <div
                        className={`max-w-xl rounded-2xl p-4 text-xs font-medium space-y-1 ${
                          isAdmin
                            ? 'bg-slate-900 text-white shadow-md'
                            : isAI
                            ? 'bg-orange-50/80 border border-orange-200/80 text-orange-950'
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

              {/* Admin Reply Box */}
              <div className="p-4 border-t border-slate-100 bg-white flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Type official response to student..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSendReply(); }}
                  className="flex-1 px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 outline-none focus:ring-2 focus:ring-orange-500"
                />
                <button
                  onClick={handleSendReply}
                  disabled={sendingReply || !replyText.trim()}
                  className="px-5 py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-black text-xs shadow-md shadow-orange-500/25 transition-all hover:scale-105 disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Reply</span>
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
              <MessageSquare className="w-12 h-12 text-slate-300" />
              <h3 className="font-bold text-sm text-slate-700">Select a Support Ticket</h3>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
