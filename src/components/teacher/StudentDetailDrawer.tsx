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
  MessageSquare,
  RefreshCw,
  FolderOpen
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
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'ATTENDANCE' | 'HOMEWORK' | 'TESTS' | 'MATERIALS' | 'NOTES'>('OVERVIEW');
  const [noteText, setNoteText] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [savedNotes, setSavedNotes] = useState<string[]>([]);
  const [updatingAtt, setUpdatingAtt] = useState(false);

  // Real 360 Database State
  const [data360, setData360] = useState<any | null>(null);
  const [loading360, setLoading360] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Fetch full 360 data when opened
  useEffect(() => {
    if (isOpen && student?.id) {
      setLoading360(true);
      fetch(`/api/teacher/student-360/${student.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setData360(data);
          }
        })
        .catch(console.error)
        .finally(() => setLoading360(false));
    }
  }, [isOpen, student?.id]);

  if (!isOpen || !student) return null;

  const currentStudent = data360?.student || student;

  const handleStatusChange = async (status: string) => {
    setUpdatingAtt(true);
    try {
      await onUpdateAttendance(student.id, status);
      // Refresh 360 view
      if (student.id) {
        const res = await fetch(`/api/teacher/student-360/${student.id}`);
        const data = await res.json();
        if (data.success) setData360(data);
      }
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
        <div className="w-screen max-w-xl bg-white shadow-2xl border-l border-[#E2E8F0] flex flex-col justify-between animate-in slide-in-from-right duration-300">
          
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
                  src={currentStudent.photoUrl || '/student-avatar.png'}
                  alt={currentStudent.fullName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-lg font-black text-white leading-tight">
                  {currentStudent.fullName}
                </h3>
                <p className="text-xs text-blue-200">
                  {currentStudent.className || student.class?.name} • Section {currentStudent.sectionName || student.section?.name}
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[11px] font-mono text-white/90 bg-white/20 px-2 py-0.5 rounded-md font-bold">
                    {currentStudent.studentId}
                  </span>
                  <span className="text-[11px] font-mono text-white/80">
                    Roll: {currentStudent.rollNo}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick KPI badges */}
            {data360?.stats && (
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10 text-center">
                <div className="bg-white/10 rounded-xl p-2">
                  <span className="text-[10px] text-blue-200 block">Attendance</span>
                  <strong className="text-sm text-white font-black">{data360.stats.attendancePercentage}%</strong>
                </div>
                <div className="bg-white/10 rounded-xl p-2">
                  <span className="text-[10px] text-blue-200 block">HW Completed</span>
                  <strong className="text-sm text-white font-black">
                    {data360.stats.totalHomeworkSubmitted} / {data360.stats.totalHomeworkAssigned}
                  </strong>
                </div>
                <div className="bg-white/10 rounded-xl p-2">
                  <span className="text-[10px] text-blue-200 block">Avg Test Score</span>
                  <strong className="text-sm text-white font-black">
                    {data360.stats.averageTestScore !== null ? `${data360.stats.averageTestScore} pts` : 'N/A'}
                  </strong>
                </div>
              </div>
            )}
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center border-b border-[#E2E8F0] px-4 bg-[#F8FAFC] overflow-x-auto no-scrollbar text-xs font-bold">
            {[
              { id: 'OVERVIEW', label: 'Overview', icon: User },
              { id: 'ATTENDANCE', label: 'Attendance', icon: CalendarCheck },
              { id: 'HOMEWORK', label: 'Homework', icon: BookOpen },
              { id: 'TESTS', label: 'Tests & Exams', icon: Award },
              { id: 'MATERIALS', label: 'Study Docs', icon: FolderOpen },
              { id: 'NOTES', label: 'Notes', icon: MessageSquare },
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
            
            {loading360 ? (
              <div className="py-12 text-center text-[#64748B] space-y-2">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#2563EB]" />
                <p>Loading full 360 profile from central database...</p>
              </div>
            ) : (
              <>
                {/* TAB: OVERVIEW */}
                {activeTab === 'OVERVIEW' && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2.5">
                      <span className="text-[10px] uppercase font-bold text-[#64748B] block">
                        Bio & Enrollment Information
                      </span>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-[#64748B] block">Gender:</span>
                          <strong className="text-[#0F172A]">{currentStudent.gender || 'N/A'}</strong>
                        </div>
                        <div>
                          <span className="text-[#64748B] block">Blood Group:</span>
                          <strong className="text-[#0F172A]">{currentStudent.bloodGroup || 'N/A'}</strong>
                        </div>
                        <div>
                          <span className="text-[#64748B] block">Status:</span>
                          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-black bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]">
                            {currentStudent.status}
                          </span>
                        </div>
                        <div>
                          <span className="text-[#64748B] block">Biometric Card:</span>
                          <strong className="text-[#16A34A]">{currentStudent.cardStatus || 'ACTIVE'}</strong>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2.5">
                      <span className="text-[10px] uppercase font-bold text-[#64748B] block">
                        Parent / Guardian Contact
                      </span>
                      <div className="space-y-1.5 text-xs">
                        <p className="font-bold text-[#0F172A]">
                          {currentStudent.parent?.fatherName || 'Guardian on record'}
                        </p>
                        <p className="text-[#64748B] flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-[#2563EB]" />
                          <span>
                            {currentStudent.parent?.fatherPhone || currentStudent.parent?.emergencyContact || 'Available in Admin Office'}
                          </span>
                        </p>
                        {currentStudent.parent?.address && (
                          <p className="text-[#64748B] text-[11px] pt-1">
                            Address: {currentStudent.parent.address}
                          </p>
                        )}
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

                    {/* Attendance History Timeline */}
                    {data360?.attendances?.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-[#E2E8F0]">
                        <span className="text-[10px] uppercase font-bold text-[#64748B] block">
                          Recent Attendance Logs:
                        </span>
                        <div className="max-h-48 overflow-y-auto space-y-1.5">
                          {data360.attendances.map((att: any) => (
                            <div key={att.id} className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between text-xs">
                              <div>
                                <span className="font-bold text-[#0F172A]">
                                  {new Date(att.date).toLocaleDateString()}
                                </span>
                                <span className="text-[#64748B] text-[10px] ml-2 font-mono">
                                  {att.time || '08:00'} ({att.method})
                                </span>
                              </div>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                                att.status === 'PRESENT'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : att.status === 'LATE'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}>
                                {att.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB: HOMEWORK */}
                {activeTab === 'HOMEWORK' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-[#64748B]">
                        Assigned Homework ({data360?.homework?.length || 0})
                      </span>
                    </div>

                    {data360?.homework?.length === 0 ? (
                      <p className="p-6 text-center text-[#64748B] bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0]">
                        No homework assignments found for this student.
                      </p>
                    ) : (
                      <div className="space-y-2 max-h-80 overflow-y-auto">
                        {data360?.homework?.map((hw: any) => (
                          <div key={hw.id} className="p-3 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1.5">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h4 className="font-bold text-[#0F172A] text-xs">{hw.title}</h4>
                                <span className="text-[10px] text-[#2563EB] font-bold">{hw.subjectName}</span>
                              </div>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                                hw.submissionStatus === 'SUBMITTED' || hw.submissionStatus === 'GRADED'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : hw.submissionStatus === 'LATE'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}>
                                {hw.submissionStatus}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-[10px] text-[#64748B]">
                              <span>Due: {new Date(hw.dueDate).toLocaleDateString()}</span>
                              {hw.marks !== null && (
                                <span className="font-bold text-[#0F172A]">Marks: {hw.marks}</span>
                              )}
                            </div>
                            {hw.feedback && (
                              <p className="text-[10px] text-[#475569] bg-white p-2 rounded-lg border border-[#E2E8F0]">
                                Feedback: {hw.feedback}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB: TESTS / MARKS */}
                {activeTab === 'TESTS' && (
                  <div className="space-y-4">
                    {/* Class Tests */}
                    <div className="space-y-2">
                      <span className="text-[10px] uppercase font-bold text-[#64748B] block">
                        Class Test Submissions ({data360?.testSubmissions?.length || 0})
                      </span>
                      {data360?.testSubmissions?.length === 0 ? (
                        <p className="p-4 text-center text-[#64748B] bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0]">
                          No class test submissions on record.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {data360.testSubmissions.map((ts: any) => (
                            <div key={ts.id} className="p-3 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between">
                              <div>
                                <h4 className="font-bold text-[#0F172A]">{ts.testTitle}</h4>
                                <span className="text-[10px] text-[#2563EB]">{ts.subjectName}</span>
                              </div>
                              <div className="text-right">
                                <span className="text-xs font-black text-[#0F172A] block">
                                  {ts.marksObtained ?? '-'} / {ts.totalMarks}
                                </span>
                                <span className="text-[9px] uppercase font-bold text-[#64748B]">{ts.status}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Official Exam Marks */}
                    {data360?.examMarks?.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-[#E2E8F0]">
                        <span className="text-[10px] uppercase font-bold text-[#64748B] block">
                          Official Term Exam Results
                        </span>
                        <div className="space-y-2">
                          {data360.examMarks.map((em: any) => (
                            <div key={em.id} className="p-3 rounded-2xl bg-white border border-[#BFDBFE] flex items-center justify-between">
                              <div>
                                <h4 className="font-bold text-[#0F172A]">{em.subjectName}</h4>
                                <span className="text-[10px] text-[#64748B]">{em.examName}</span>
                              </div>
                              <div className="text-right">
                                <span className="px-2 py-0.5 rounded-lg bg-[#2563EB] text-white font-black text-xs">
                                  Grade {em.grade} ({em.percentage}%)
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB: STUDY MATERIALS */}
                {activeTab === 'MATERIALS' && (
                  <div className="space-y-3">
                    <span className="text-[10px] uppercase font-bold text-[#64748B] block">
                      Study Materials Assigned to Class
                    </span>
                    {data360?.studyMaterials?.length === 0 ? (
                      <p className="p-6 text-center text-[#64748B] bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0]">
                        No study materials uploaded for this class yet.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {data360?.studyMaterials?.map((sm: any) => (
                          <div key={sm.id} className="p-3 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between">
                            <div>
                              <h4 className="font-bold text-[#0F172A]">{sm.title}</h4>
                              <span className="text-[10px] text-[#2563EB]">{sm.subject.name} • {sm.fileType}</span>
                            </div>
                            <a
                              href={sm.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl text-xs font-bold transition-colors"
                            >
                              Download
                            </a>
                          </div>
                        ))}
                      </div>
                    )}
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
              </>
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
