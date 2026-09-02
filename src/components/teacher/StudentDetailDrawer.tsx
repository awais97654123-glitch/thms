'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  CalendarCheck, 
  BookOpen, 
  Award, 
  Phone, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  FileText,
  Save,
  MessageSquare
} from 'lucide-react';

interface StudentDetailDrawerProps {
  student: any | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateAttendance: (studentId: string, status: string) => Promise<void>;
}

export default function StudentDetailDrawer({
  student,
  isOpen,
  onClose,
  onUpdateAttendance,
}: StudentDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'ATTENDANCE' | 'HOMEWORK' | 'TESTS' | 'NOTES'>('OVERVIEW');
  const [noteText, setNoteText] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [savedNotes, setSavedNotes] = useState<string[]>([]);
  const [updatingAtt, setUpdatingAtt] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !student) return null;

  const handleStatusChange = async (status: string) => {
    setUpdatingAtt(true);
    try {
      await onUpdateAttendance(student.id, status);
    } finally {
      setUpdatingAtt(false);
    }
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    setSavingNote(true);
    setTimeout(() => {
      setSavedNotes((prev) => [noteText.trim(), ...prev]);
      setNoteText('');
      setSavingNote(false);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#0F2A5F]/40 backdrop-blur-sm transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-lg bg-white shadow-2xl border-l border-[#E2E8F0] flex flex-col justify-between animate-in slide-in-from-right duration-300">
          
          {/* Header */}
          <div className="p-6 bg-gradient-to-r from-[#0F2A5F] to-[#173B7A] text-white space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-white/10 text-blue-200 border border-white/20">
                Student 360 Dossier
              </span>
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 overflow-hidden shrink-0">
                <img
                  src={student.photoUrl || '/student-avatar.png'}
                  alt={student.fullName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-lg font-black text-white leading-tight">
                  {student.fullName}
                </h3>
                <p className="text-xs text-blue-200">
                  {student.class?.name} • Section {student.section?.name}
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[11px] font-mono text-white/90 bg-white/20 px-2 py-0.5 rounded-md font-bold">
                    {student.studentId}
                  </span>
                  <span className="text-[11px] font-mono text-white/80">
                    Roll: {student.rollNo}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center border-b border-[#E2E8F0] px-4 bg-[#F8FAFC] overflow-x-auto no-scrollbar text-xs font-bold">
            {[
              { id: 'OVERVIEW', label: 'Overview', icon: User },
              { id: 'ATTENDANCE', label: 'Attendance', icon: CalendarCheck },
              { id: 'HOMEWORK', label: 'Homework', icon: BookOpen },
              { id: 'TESTS', label: 'Tests/Marks', icon: Award },
              { id: 'NOTES', label: 'Academic Notes', icon: MessageSquare },
            ].map((t) => {
              const Icon = t.icon;
              const isActive = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id as any)}
                  className={`flex items-center gap-1.5 px-3 py-3 border-b-2 transition-all whitespace-nowrap ${
                    isActive
                      ? 'border-[#2563EB] text-[#2563EB]'
                      : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>

          {/* Drawer Body */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6 text-xs text-[#0F172A]">
            
            {/* TAB: OVERVIEW */}
            {activeTab === 'OVERVIEW' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2.5">
                  <span className="text-[10px] uppercase font-bold text-[#64748B] block">
                    Bio & Enrollment
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[#64748B] block">Gender:</span>
                      <strong className="text-[#0F172A]">{student.gender || 'N/A'}</strong>
                    </div>
                    <div>
                      <span className="text-[#64748B] block">Blood Group:</span>
                      <strong className="text-[#0F172A]">{student.bloodGroup || 'N/A'}</strong>
                    </div>
                    <div>
                      <span className="text-[#64748B] block">Status:</span>
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-black bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]">
                        {student.status}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#64748B] block">Card Status:</span>
                      <strong className="text-[#16A34A]">{student.cardStatus || 'ACTIVE'}</strong>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2.5">
                  <span className="text-[10px] uppercase font-bold text-[#64748B] block">
                    Parent / Guardian Contact
                  </span>
                  <div className="space-y-1.5 text-xs">
                    <p className="font-bold text-[#0F172A]">
                      {student.parent?.fatherName || 'Guardian on record'}
                    </p>
                    <p className="text-[#64748B] flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-[#2563EB]" />
                      <span>{student.parent?.fatherPhone || student.emergencyPhone || 'Phone available at admin office'}</span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: ATTENDANCE */}
            {activeTab === 'ATTENDANCE' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#2563EB] block">
                      Today&apos;s Gate Roll Call
                    </span>
                    <p className="text-sm font-black text-[#0F172A] mt-0.5">
                      {student.todayAttendance?.status === 'PRESENT'
                        ? '✓ Present On Campus'
                        : student.todayAttendance?.status === 'LATE'
                        ? '⚠️ Late Arrival'
                        : student.todayAttendance?.status === 'ABSENT'
                        ? '✗ Marked Absent'
                        : 'Roll Call Pending'}
                    </p>
                    {student.todayAttendance?.time && (
                      <p className="text-[10px] text-[#64748B] mt-0.5">
                        Time: {student.todayAttendance.time} via {student.todayAttendance.method}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-bold text-[#64748B] block">
                    Quick Roll Call Override:
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      disabled={updatingAtt}
                      onClick={() => handleStatusChange('PRESENT')}
                      className={`p-2.5 rounded-xl font-bold border text-center transition-all ${
                        student.todayAttendance?.status === 'PRESENT'
                          ? 'bg-[#16A34A] text-white border-[#16A34A]'
                          : 'bg-white hover:bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0]'
                      }`}
                    >
                      Present
                    </button>
                    <button
                      disabled={updatingAtt}
                      onClick={() => handleStatusChange('LATE')}
                      className={`p-2.5 rounded-xl font-bold border text-center transition-all ${
                        student.todayAttendance?.status === 'LATE'
                          ? 'bg-[#D97706] text-white border-[#D97706]'
                          : 'bg-white hover:bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]'
                      }`}
                    >
                      Late
                    </button>
                    <button
                      disabled={updatingAtt}
                      onClick={() => handleStatusChange('ABSENT')}
                      className={`p-2.5 rounded-xl font-bold border text-center transition-all ${
                        student.todayAttendance?.status === 'ABSENT'
                          ? 'bg-[#DC2626] text-white border-[#DC2626]'
                          : 'bg-white hover:bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]'
                      }`}
                    >
                      Absent
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: HOMEWORK */}
            {activeTab === 'HOMEWORK' && (
              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
                  <span className="text-[10px] uppercase font-bold text-[#64748B] block">
                    Current Homework Status
                  </span>
                  <p className="text-sm font-bold text-[#0F172A]">
                    {student.homeworkStatus === 'SUBMITTED'
                      ? '✓ Latest Homework Submitted'
                      : student.homeworkStatus === 'PENDING'
                      ? '⚠️ Submission Awaited'
                      : 'No active assignments'}
                  </p>
                </div>
              </div>
            )}

            {/* TAB: TESTS / MARKS */}
            {activeTab === 'TESTS' && (
              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
                  <span className="text-[10px] uppercase font-bold text-[#64748B] block">
                    Latest Exam Assessment
                  </span>
                  {student.latestMark ? (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-base font-black text-[#0F172A]">
                          Score: {student.latestMark.score}
                        </p>
                        <p className="text-xs text-[#64748B]">Percentage: {student.latestMark.pct}</p>
                      </div>
                      <span className="px-3 py-1 rounded-xl bg-[#2563EB] text-white text-sm font-black">
                        Grade {student.latestMark.grade}
                      </span>
                    </div>
                  ) : (
                    <p className="text-[#64748B]">No recent test marks recorded yet.</p>
                  )}
                </div>
              </div>
            )}

            {/* TAB: NOTES */}
            {activeTab === 'NOTES' && (
              <div className="space-y-4">
                <form onSubmit={handleAddNote} className="space-y-2">
                  <label className="block text-[11px] font-bold text-[#0F172A]">
                    Add Teacher Note:
                  </label>
                  <textarea
                    rows={2}
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="e.g., Student demonstrated strong engagement in algebra problem set..."
                    className="w-full p-2.5 rounded-xl border border-[#E2E8F0] text-xs focus:ring-2 focus:ring-[#2563EB] focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={savingNote || !noteText.trim()}
                    className="px-3 py-1.5 rounded-xl bg-[#2563EB] text-white font-bold text-xs disabled:opacity-50"
                  >
                    {savingNote ? 'Saving...' : 'Save Note'}
                  </button>
                </form>

                {savedNotes.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-[#E2E8F0]">
                    <span className="text-[10px] uppercase font-bold text-[#64748B] block">
                      Teacher Observations ({savedNotes.length}):
                    </span>
                    {savedNotes.map((n, i) => (
                      <div key={i} className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs">
                        {n}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Footer */}
          <div className="p-4 border-t border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between">
            <span className="text-[11px] text-[#64748B]">Press Esc to close</span>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#0F2A5F] hover:bg-[#173B7A] text-white font-bold text-xs transition-colors"
            >
              Done
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
