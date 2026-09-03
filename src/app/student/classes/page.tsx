'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  BookOpen, 
  Clock, 
  Calendar, 
  Award, 
  FolderOpen, 
  User, 
  ChevronRight, 
  Sparkles, 
  Radio, 
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import PortalCircularLoader from '@/components/common/PortalCircularLoader';

export default function StudentClassesPage() {
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<any | null>(null);
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchClassrooms = () => {
    setLoading(true);
    fetch('/api/student/classes')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStudent(data.student);
          setClassrooms(data.classrooms || []);
        } else {
          setError(data.error || 'Failed to load classroom list');
        }
      })
      .catch((err) => {
        console.error(err);
        setError('Network error loading classroom hub');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchClassrooms();
    const timer = setInterval(fetchClassrooms, 60000); // refresh schedule every minute
    return () => clearInterval(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <PortalCircularLoader size="lg" />
        <p className="text-xs text-slate-500 font-bold animate-pulse">Loading Your Enrolled Classrooms...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300 bg-white text-slate-900 pb-16">
      
      {/* Top Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0F2A5F] via-[#173B7A] to-[#1E3A8A] text-white p-6 sm:p-10 shadow-xl border border-blue-900">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/30 text-blue-200 text-xs font-bold border border-blue-400/40">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Student Digital Classroom Hub • 2026-2027</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black font-serif tracking-tight">
              My Subjects &amp; Classrooms
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 font-medium">
              {student ? `${student.className} — Section ${student.sectionName} (Roll #${student.rollNo})` : 'Enrolled Classes'}
            </p>
          </div>

          <button
            onClick={fetchClassrooms}
            className="self-start md:self-auto px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 backdrop-blur-xl flex items-center gap-2 transition-all shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync Live Classes</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Classroom Cards Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-black text-slate-900 font-serif">
            Enrolled Subjects ({classrooms.length})
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            Live schedule mapped to official timetable
          </span>
        </div>

        {classrooms.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-slate-50 border border-slate-200 space-y-3">
            <BookOpen className="w-12 h-12 mx-auto text-slate-300" />
            <h3 className="text-base font-bold text-slate-800">No Classrooms Available Yet</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              You are not currently enrolled in any scheduled timetable subjects. Please contact the administrative office to verify enrollment.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {classrooms.map((room) => {
              const isLiveNow = room.currentPeriodStatus === 'NOW';
              const isUpcomingToday = room.currentPeriodStatus === 'UPCOMING_TODAY';

              return (
                <div
                  key={room.subjectId}
                  className="bg-white rounded-3xl border border-slate-200 hover:border-blue-400 hover:shadow-xl transition-all duration-200 flex flex-col justify-between overflow-hidden group"
                >
                  {/* Card Header Strip */}
                  <div className={`p-5 border-b border-slate-100 ${
                    isLiveNow 
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white' 
                      : 'bg-slate-50/80'
                  }`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          isLiveNow
                            ? 'bg-white/20 text-white'
                            : 'bg-blue-100 text-[#2563EB]'
                        }`}>
                          {room.subjectCode || 'ACADEMIC'}
                        </span>
                        <h3 className={`text-lg font-black font-serif leading-snug ${
                          isLiveNow ? 'text-white' : 'text-slate-900'
                        }`}>
                          {room.subjectName}
                        </h3>
                      </div>

                      {/* Live Period Indicator */}
                      {isLiveNow ? (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white text-emerald-700 font-extrabold text-[10px] shadow-sm animate-pulse">
                          <Radio className="w-3 h-3 text-emerald-600" />
                          <span>LIVE NOW</span>
                        </div>
                      ) : isUpcomingToday ? (
                        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-bold text-[10px]">
                          <Clock className="w-3 h-3 text-blue-600" />
                          <span>Today: {room.todayTime}</span>
                        </div>
                      ) : null}
                    </div>

                    {/* Teacher Row */}
                    <div className="flex items-center gap-2.5 mt-3 pt-3 border-t border-white/20">
                      <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden shrink-0 border border-white">
                        <img
                          src={room.teacher?.photoUrl || '/faculty-avatar.png'}
                          alt={room.teacher?.fullName || 'Teacher'}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="text-xs">
                        <span className={`font-bold block ${isLiveNow ? 'text-white' : 'text-slate-800'}`}>
                          {room.teacher?.fullName || 'Assigned Faculty'}
                        </span>
                        <span className={`text-[10px] ${isLiveNow ? 'text-blue-100' : 'text-slate-500'}`}>
                          {room.teacher?.designation || 'Subject Teacher'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Body — Counts & Schedule */}
                  <div className="p-5 space-y-4 flex-1">
                    {/* 3 Metric Pills */}
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-0.5">
                        <span className="text-[10px] text-slate-500 font-bold block">Homework</span>
                        <strong className="text-sm font-black text-slate-800 font-mono">
                          {room.activeHomeworkCount}
                        </strong>
                      </div>
                      <div className="p-2.5 rounded-2xl bg-purple-50/70 border border-purple-100 space-y-0.5">
                        <span className="text-[10px] text-purple-700 font-bold block">Tests</span>
                        <strong className="text-sm font-black text-purple-900 font-mono">
                          {room.upcomingTestCount}
                        </strong>
                      </div>
                      <div className="p-2.5 rounded-2xl bg-blue-50/70 border border-blue-100 space-y-0.5">
                        <span className="text-[10px] text-blue-700 font-bold block">Docs</span>
                        <strong className="text-sm font-black text-blue-900 font-mono">
                          {room.studyMaterialCount}
                        </strong>
                      </div>
                    </div>

                    {/* Schedule Summary */}
                    {room.weeklySchedule?.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">
                          Weekly Periods ({room.weeklySchedule.length}):
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {room.weeklySchedule.slice(0, 4).map((slot: any, idx: number) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-mono text-[10px] font-semibold"
                            >
                              {slot.dayOfWeek.slice(0, 3)}: {slot.startTime}
                            </span>
                          ))}
                          {room.weeklySchedule.length > 4 && (
                            <span className="px-1.5 py-0.5 text-[10px] text-slate-400 font-bold">
                              +{room.weeklySchedule.length - 4} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Footer Button */}
                  <div className="p-5 pt-0">
                    <Link
                      href={`/student/classes/${room.subjectId}`}
                      className="w-full py-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-2xl flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/20 group-hover:scale-[1.02] transition-all"
                    >
                      <span>Open Classroom</span>
                      <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
