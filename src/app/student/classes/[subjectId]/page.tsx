'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  BookOpen, 
  Clock, 
  Calendar, 
  Award, 
  FolderOpen, 
  CheckCircle2, 
  AlertCircle, 
  Radio, 
  FileText, 
  Upload, 
  Send, 
  Download, 
  Sparkles,
  Megaphone,
  X
} from 'lucide-react';
import PortalCircularLoader from '@/components/common/PortalCircularLoader';

export default function StudentClassroomPage({
  params,
}: {
  params: { subjectId: string };
}) {
  const { subjectId } = params;
  const [loading, setLoading] = useState(true);
  const [classroom, setClassroom] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Active Tab State
  const [activeTab, setActiveTab] = useState<'STREAM' | 'HOMEWORK' | 'TESTS' | 'MATERIALS' | 'ANNOUNCEMENTS'>('STREAM');

  // Homework Submission Modal State
  const [submittingHw, setSubmittingHw] = useState<any | null>(null);
  const [hwText, setHwText] = useState('');
  const [hwFileUrl, setHwFileUrl] = useState('');
  const [hwSubmitting, setHwSubmitting] = useState(false);
  const [hwSuccessMsg, setHwSuccessMsg] = useState<string | null>(null);

  // Test Submission Modal State
  const [submittingTest, setSubmittingTest] = useState<any | null>(null);
  const [testText, setTestText] = useState('');
  const [testFileUrl, setTestFileUrl] = useState('');
  const [testSubmitting, setTestSubmitting] = useState(false);
  const [testSuccessMsg, setTestSuccessMsg] = useState<string | null>(null);

  const fetchClassroom = () => {
    setLoading(true);
    fetch(`/api/student/classes/${subjectId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setClassroom(data.classroom);
        } else {
          setError(data.error || 'Failed to load classroom');
        }
      })
      .catch((err) => {
        console.error(err);
        setError('Network error loading classroom');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchClassroom();
  }, [subjectId]);

  const handleSubmitHomework = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submittingHw) return;

    setHwSubmitting(true);
    setHwSuccessMsg(null);

    try {
      const res = await fetch('/api/student/homework/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          homeworkId: submittingHw.id,
          submissionText: hwText.trim() || undefined,
          attachmentsJson: hwFileUrl.trim() ? [{ url: hwFileUrl.trim() }] : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit homework');

      setHwSuccessMsg(data.message || 'Homework submitted successfully!');
      setTimeout(() => {
        setSubmittingHw(null);
        setHwText('');
        setHwFileUrl('');
        setHwSuccessMsg(null);
        fetchClassroom();
      }, 1500);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setHwSubmitting(false);
    }
  };

  const handleSubmitTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submittingTest) return;

    setTestSubmitting(true);
    setTestSuccessMsg(null);

    try {
      const res = await fetch('/api/student/tests/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testId: submittingTest.id,
          submissionText: testText.trim() || undefined,
          attachmentsJson: testFileUrl.trim() ? [{ url: testFileUrl.trim() }] : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit test');

      setTestSuccessMsg('Test answers recorded successfully!');
      setTimeout(() => {
        setSubmittingTest(null);
        setTestText('');
        setTestFileUrl('');
        setTestSuccessMsg(null);
        fetchClassroom();
      }, 1500);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setTestSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <PortalCircularLoader size="lg" />
        <p className="text-xs text-slate-500 font-bold animate-pulse">Connecting to Classroom Stream...</p>
      </div>
    );
  }

  if (error || !classroom) {
    return (
      <div className="p-8 max-w-lg mx-auto text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h3 className="text-lg font-bold text-slate-900">{error || 'Classroom not found'}</h3>
        <Link
          href="/student/classes"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#2563EB] text-white rounded-xl font-bold text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Classes</span>
        </Link>
      </div>
    );
  }

  const isLive = !!classroom.currentPeriod?.isActive;

  return (
    <div className="space-y-6 animate-in fade-in duration-300 bg-white text-slate-900 pb-16">
      
      {/* Back to Hub Nav */}
      <div>
        <Link
          href="/student/classes"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-[#2563EB] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Classes</span>
        </Link>
      </div>

      {/* Classroom Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0F2A5F] via-[#173B7A] to-[#1E3A8A] text-white p-6 sm:p-10 shadow-xl border border-blue-900">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-blue-500/30 text-blue-200 text-xs font-black border border-blue-400/40">
                {classroom.subjectCode || 'ACADEMIC'}
              </span>
              <span className="text-xs text-blue-200 font-bold">
                {classroom.className} — Section {classroom.sectionName}
              </span>
              {isLive && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500 text-white font-black text-xs shadow-md animate-pulse">
                  <Radio className="w-3.5 h-3.5" />
                  <span>PERIOD IN SESSION RIGHT NOW</span>
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-black font-serif tracking-tight">
              {classroom.subjectName} Classroom
            </h1>

            {/* Teacher Details */}
            <div className="flex items-center gap-3 pt-1">
              <div className="w-10 h-10 rounded-full bg-white/20 border border-white/40 overflow-hidden shrink-0">
                <img
                  src={classroom.teacher?.photoUrl || '/faculty-avatar.png'}
                  alt={classroom.teacher?.fullName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-xs">
                <span className="font-bold text-white block text-sm">
                  {classroom.teacher?.fullName || 'Assigned Faculty'}
                </span>
                <span className="text-blue-200 text-[11px]">
                  {classroom.teacher?.designation || 'Subject Specialist'} • {classroom.teacher?.email}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Stat Pill */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-4 space-y-2 text-center shrink-0 min-w-[160px]">
            <span className="text-[10px] uppercase font-bold text-blue-200 block">Weekly Frequency</span>
            <strong className="text-2xl font-black text-white font-mono">
              {classroom.timetableSlots?.length || 0} Periods
            </strong>
            <span className="text-[10px] text-blue-300 block">
              Room: {classroom.timetableSlots[0]?.roomNo || 'Main Hall'}
            </span>
          </div>
        </div>
      </div>

      {/* Classroom Tab Navigation */}
      <div className="flex items-center border-b border-slate-200 bg-slate-50/80 px-2 rounded-2xl overflow-x-auto no-scrollbar text-xs font-bold gap-1">
        {[
          { id: 'STREAM', label: 'Home Stream', icon: Sparkles },
          { id: 'HOMEWORK', label: `Homework (${classroom.homeworkList?.length || 0})`, icon: BookOpen },
          { id: 'TESTS', label: `Tests & Quizzes (${classroom.testList?.length || 0})`, icon: Award },
          { id: 'MATERIALS', label: `Study Material (${classroom.studyMaterials?.length || 0})`, icon: FolderOpen },
          { id: 'ANNOUNCEMENTS', label: `Announcements (${classroom.announcements?.length || 0})`, icon: Megaphone },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-4 py-3 rounded-xl transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-white text-[#2563EB] shadow-sm font-black'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: STREAM / HOME                                                      */}
      {/* ========================================================================= */}
      {activeTab === 'STREAM' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left 2 Cols: Recent Stream */}
          <div className="lg:col-span-2 space-y-5">
            {/* Live Period Banner if active */}
            {isLive && (
              <div className="p-5 rounded-3xl bg-emerald-50 border border-emerald-200 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                    <Radio className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 block">
                      Live Classroom Period
                    </span>
                    <h4 className="text-sm font-black text-emerald-950">
                      Class is running right now ({classroom.currentPeriod.startTime} - {classroom.currentPeriod.endTime})
                    </h4>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-xl bg-emerald-600 text-white font-bold text-xs">
                  {classroom.currentPeriod.roomNo}
                </span>
              </div>
            )}

            {/* Weekly Timetable Schedule Breakdown */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-slate-900 font-serif flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#2563EB]" />
                  <span>Weekly Schedule for {classroom.subjectName}</span>
                </h3>
                <span className="text-xs text-slate-500 font-medium">Asia/Karachi Timezone</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                {['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'].map((day) => {
                  const daySlots = classroom.timetableSlots?.filter((s: any) => s.dayOfWeek.toUpperCase() === day);
                  return (
                    <div
                      key={day}
                      className={`p-3 rounded-2xl border text-xs space-y-1.5 ${
                        daySlots?.length > 0
                          ? 'bg-blue-50/50 border-blue-200'
                          : 'bg-slate-50 border-slate-100 opacity-60'
                      }`}
                    >
                      <span className="text-[10px] font-black text-slate-700 block uppercase">
                        {day.slice(0, 3)}
                      </span>
                      {daySlots?.length > 0 ? (
                        daySlots.map((slot: any, idx: number) => (
                          <div key={idx} className="bg-white p-1.5 rounded-lg border border-blue-200 text-[10px]">
                            <strong className="text-blue-900 block font-mono">{slot.startTime}</strong>
                            <span className="text-slate-500 block font-mono text-[9px]">{slot.roomNo || 'Main'}</span>
                          </div>
                        ))
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">No class</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Active Homework Quick Stream */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-slate-900 font-serif flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#2563EB]" />
                  <span>Pending &amp; Active Homework</span>
                </h3>
                <button
                  onClick={() => setActiveTab('HOMEWORK')}
                  className="text-xs font-bold text-[#2563EB] hover:underline"
                >
                  View All ({classroom.homeworkList?.length || 0}) →
                </button>
              </div>

              {classroom.homeworkList?.length === 0 ? (
                <p className="text-xs text-slate-400 p-6 text-center bg-slate-50 rounded-2xl">
                  No homework assignments pending for this subject!
                </p>
              ) : (
                <div className="space-y-3">
                  {classroom.homeworkList.slice(0, 3).map((hw: any) => (
                    <div
                      key={hw.id}
                      className="p-4 rounded-2xl bg-slate-50 hover:bg-blue-50/40 border border-slate-200 transition-colors flex items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 text-xs">{hw.title}</h4>
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
                        <p className="text-[11px] text-slate-500">
                          Due: {new Date(hw.dueDate).toLocaleDateString()}
                        </p>
                      </div>

                      <button
                        onClick={() => setSubmittingHw(hw)}
                        className="px-3.5 py-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs rounded-xl shadow-sm transition-colors whitespace-nowrap"
                      >
                        {hw.isSubmitted ? 'Resubmit' : 'Submit Now'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Col: Upcoming Tests & Study Material Stream */}
          <div className="space-y-5">
            {/* Upcoming Tests Widget */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-900 font-serif flex items-center gap-2">
                  <Award className="w-4 h-4 text-purple-600" />
                  <span>Scheduled Tests</span>
                </h3>
                <button
                  onClick={() => setActiveTab('TESTS')}
                  className="text-xs font-bold text-purple-700 hover:underline"
                >
                  View All →
                </button>
              </div>

              {classroom.testList?.length === 0 ? (
                <p className="text-xs text-slate-400 p-4 text-center bg-slate-50 rounded-2xl">
                  No upcoming tests scheduled yet.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {classroom.testList.slice(0, 3).map((test: any) => (
                    <div key={test.id} className="p-3.5 rounded-2xl bg-purple-50/50 border border-purple-100 space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-slate-900 text-xs">{test.title}</h4>
                        <span className="text-[10px] font-mono font-bold text-purple-800">
                          {test.totalMarks} pts
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500">
                        Date: {new Date(test.testDate).toLocaleDateString()} at {test.startTime} ({test.durationMinutes}m)
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Study Docs */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-900 font-serif flex items-center gap-2">
                  <FolderOpen className="w-4 h-4 text-blue-600" />
                  <span>Latest Study Notes</span>
                </h3>
                <button
                  onClick={() => setActiveTab('MATERIALS')}
                  className="text-xs font-bold text-[#2563EB] hover:underline"
                >
                  View Docs →
                </button>
              </div>

              {classroom.studyMaterials?.length === 0 ? (
                <p className="text-xs text-slate-400 p-4 text-center bg-slate-50 rounded-2xl">
                  No documents uploaded yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {classroom.studyMaterials.slice(0, 3).map((doc: any) => (
                    <div key={doc.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-800 text-xs block truncate max-w-[150px]">
                          {doc.title}
                        </span>
                        <span className="text-[10px] text-slate-500">{doc.fileType}</span>
                      </div>
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 rounded-lg bg-blue-100 hover:bg-blue-200 text-[#2563EB] text-[11px] font-bold transition-colors"
                      >
                        Download
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: HOMEWORK LIST & ONLINE SUBMISSION WORKFLOW                         */}
      {/* ========================================================================= */}
      {activeTab === 'HOMEWORK' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900 font-serif">
              Homework Assignments ({classroom.homeworkList?.length || 0})
            </h2>
            <span className="text-xs text-slate-500 font-medium">
              Submit your work before deadline
            </span>
          </div>

          {classroom.homeworkList?.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-slate-50 border border-slate-200 space-y-2">
              <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700">No homework assigned yet.</p>
              <p className="text-xs text-slate-500">Your subject teacher will publish assignments here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {classroom.homeworkList.map((hw: any) => (
                <div
                  key={hw.id}
                  className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-bold text-slate-900 text-sm">{hw.title}</h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black whitespace-nowrap ${
                        hw.submissionStatus === 'SUBMITTED' || hw.submissionStatus === 'GRADED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : hw.submissionStatus === 'LATE'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {hw.submissionStatus}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {hw.description || 'Complete the assigned exercises from textbook.'}
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                      <span>Due Date: {new Date(hw.dueDate).toLocaleDateString()}</span>
                      {hw.marks !== null && (
                        <span className="font-bold text-emerald-700">Score: {hw.marks} pts</span>
                      )}
                    </div>

                    {hw.feedback && (
                      <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-100 text-[11px] text-blue-900 space-y-0.5">
                        <strong className="block text-[10px] uppercase tracking-wider text-blue-700 font-black">
                          Teacher Feedback:
                        </strong>
                        <p>{hw.feedback}</p>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setSubmittingHw(hw)}
                    className="w-full py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{hw.isSubmitted ? 'Update Submission' : 'Submit Homework Online'}</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: TESTS & QUIZZES                                                   */}
      {/* ========================================================================= */}
      {activeTab === 'TESTS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900 font-serif">
              Class Tests &amp; Quizzes ({classroom.testList?.length || 0})
            </h2>
            <span className="text-xs text-slate-500 font-medium">
              Official assessments scheduled by faculty
            </span>
          </div>

          {classroom.testList?.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-slate-50 border border-slate-200 space-y-2">
              <Award className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700">No tests scheduled at this time.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {classroom.testList.map((test: any) => (
                <div
                  key={test.id}
                  className="bg-white rounded-3xl border border-purple-200 p-5 shadow-sm space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 block">
                          Class Assessment
                        </span>
                        <h3 className="font-bold text-slate-900 text-sm">{test.title}</h3>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-xs font-black">
                        {test.totalMarks} Marks
                      </span>
                    </div>

                    <p className="text-xs text-slate-600">
                      {test.description || 'Assessed on current syllabus topics.'}
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                      <div>
                        <span className="block text-slate-400">Date:</span>
                        <strong className="text-slate-800">{new Date(test.testDate).toLocaleDateString()}</strong>
                      </div>
                      <div>
                        <span className="block text-slate-400">Duration & Time:</span>
                        <strong className="text-slate-800">{test.startTime} ({test.durationMinutes} mins)</strong>
                      </div>
                    </div>

                    {test.paperUrl && (
                      <div className="pt-2">
                        <a
                          href={test.paperUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-bold text-purple-700 hover:underline"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download Test Question Paper / Worksheet</span>
                        </a>
                      </div>
                    )}

                    {test.marksObtained !== null && (
                      <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-900">Your Score:</span>
                        <strong className="text-sm font-black text-emerald-800">
                          {test.marksObtained} / {test.totalMarks} pts
                        </strong>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setSubmittingTest(test)}
                    className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{test.isSubmitted ? 'Update Test Submission' : 'Submit Answers Online'}</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: STUDY MATERIALS                                                   */}
      {/* ========================================================================= */}
      {activeTab === 'MATERIALS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900 font-serif">
              Course Study Materials ({classroom.studyMaterials?.length || 0})
            </h2>
            <span className="text-xs text-slate-500 font-medium">
              Handouts, syllabus worksheets &amp; lecture notes
            </span>
          </div>

          {classroom.studyMaterials?.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-slate-50 border border-slate-200 space-y-2">
              <FolderOpen className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700">No study materials uploaded yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {classroom.studyMaterials.map((doc: any) => (
                <div
                  key={doc.id}
                  className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold text-[10px]">
                      {doc.fileType}
                    </span>
                    <h3 className="font-bold text-slate-900 text-xs leading-snug">{doc.title}</h3>
                    {doc.topic && (
                      <p className="text-[11px] text-slate-500 font-medium">Topic: {doc.topic}</p>
                    )}
                    {doc.description && (
                      <p className="text-[11px] text-slate-600">{doc.description}</p>
                    )}
                  </div>

                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 bg-slate-100 hover:bg-[#2563EB] text-slate-700 hover:text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>View / Download Document</span>
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: ANNOUNCEMENTS                                                      */}
      {/* ========================================================================= */}
      {activeTab === 'ANNOUNCEMENTS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900 font-serif">
              Announcements &amp; Notices ({classroom.announcements?.length || 0})
            </h2>
          </div>

          {classroom.announcements?.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-slate-50 border border-slate-200 space-y-2">
              <Megaphone className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700">No announcements for this classroom.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {classroom.announcements.map((ann: any) => (
                <div key={ann.id} className="p-5 rounded-3xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 text-sm">{ann.title}</h3>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(ann.publishDate).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">{ann.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: SUBMIT HOMEWORK                                                    */}
      {/* ========================================================================= */}
      {submittingHw && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-5">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#2563EB] block">
                  Online Assignment Submission
                </span>
                <h3 className="text-base font-black text-slate-900 font-serif">{submittingHw.title}</h3>
              </div>
              <button
                onClick={() => setSubmittingHw(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {hwSuccessMsg ? (
              <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{hwSuccessMsg}</span>
              </div>
            ) : (
              <form onSubmit={handleSubmitHomework} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">
                    Submission Notes / Text Answer
                  </label>
                  <textarea
                    rows={4}
                    value={hwText}
                    onChange={(e) => setHwText(e.target.value)}
                    placeholder="Type your answers, explanation, or notes for the teacher..."
                    className="w-full p-3 rounded-2xl border border-slate-200 font-medium focus:ring-2 focus:ring-[#2563EB] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">
                    Worksheet / PDF / Image URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={hwFileUrl}
                    onChange={(e) => setHwFileUrl(e.target.value)}
                    placeholder="https://.../my-homework-sheet.pdf"
                    className="w-full p-3 rounded-2xl border border-slate-200 font-medium focus:ring-2 focus:ring-[#2563EB] focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setSubmittingHw(null)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={hwSubmitting}
                    className="px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold shadow-md disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{hwSubmitting ? 'Submitting...' : 'Confirm Submission'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: SUBMIT TEST ANSWERS                                                */}
      {/* ========================================================================= */}
      {submittingTest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl border border-purple-200 shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-5">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-purple-700 block">
                  Online Test Answer Sheet
                </span>
                <h3 className="text-base font-black text-slate-900 font-serif">{submittingTest.title}</h3>
              </div>
              <button
                onClick={() => setSubmittingTest(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {testSuccessMsg ? (
              <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{testSuccessMsg}</span>
              </div>
            ) : (
              <form onSubmit={handleSubmitTest} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">
                    Test Answers / Written Solution
                  </label>
                  <textarea
                    rows={4}
                    value={testText}
                    onChange={(e) => setTestText(e.target.value)}
                    placeholder="Type your question answers or solutions here..."
                    className="w-full p-3 rounded-2xl border border-slate-200 font-medium focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">
                    Scanned Answer Sheet / Image URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={testFileUrl}
                    onChange={(e) => setTestFileUrl(e.target.value)}
                    placeholder="https://.../my-test-answers.pdf"
                    className="w-full p-3 rounded-2xl border border-slate-200 font-medium focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setSubmittingTest(null)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={testSubmitting}
                    className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-md disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{testSubmitting ? 'Submitting...' : 'Submit Answers'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
