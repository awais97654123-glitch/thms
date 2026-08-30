'use client';

import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  CalendarCheck, 
  BookOpen, 
  MapPin, 
  UserCheck, 
  Sparkles, 
  Printer, 
  ChevronRight,
  School
} from 'lucide-react';

export default function StudentTimetablePage() {
  const [activeDay, setActiveDay] = useState('Monday');
  const [currentPeriodIdx, setCurrentPeriodIdx] = useState(2); // Simulated active period

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const weeklySchedule: { [key: string]: any[] } = {
    Monday: [
      { period: '1', time: '08:00 - 08:45 AM', subject: 'Mathematics (Algebra)', teacher: 'Engr. Farooq Ahmad', room: 'Room 201', type: 'Lecture' },
      { period: '2', time: '08:45 - 09:30 AM', subject: 'English Grammar & Comp', teacher: 'Ms. Sadia Khan', room: 'Room 201', type: 'Lecture' },
      { period: '3', time: '09:30 - 10:15 AM', subject: 'Physics Laboratory', teacher: 'Dr. Zobia Khan', room: 'Science Lab A', type: 'Practical' },
      { period: 'Break', time: '10:15 - 10:45 AM', subject: 'Recess & Morning Refreshment', teacher: 'Campus Ground', room: 'Cafeteria', type: 'Break' },
      { period: '4', time: '10:45 - 11:30 AM', subject: 'Computer Science & AI', teacher: 'Prof. Tariq Mahmood', room: 'IT Lab 1', type: 'Lab' },
      { period: '5', time: '11:30 - 12:15 PM', subject: 'Urdu Literature', teacher: 'Sir Usman Ali', room: 'Room 201', type: 'Lecture' },
      { period: '6', time: '12:15 - 01:00 PM', subject: 'Islamic Studies & Ethics', teacher: 'Qari Abdul Rehman', room: 'Room 201', type: 'Lecture' },
    ],
    Tuesday: [
      { period: '1', time: '08:00 - 08:45 AM', subject: 'Chemistry Laboratory', teacher: 'Dr. Ayesha Malik', room: 'Science Lab B', type: 'Practical' },
      { period: '2', time: '08:45 - 09:30 AM', subject: 'Mathematics (Geometry)', teacher: 'Engr. Farooq Ahmad', room: 'Room 201', type: 'Lecture' },
      { period: '3', time: '09:30 - 10:15 AM', subject: 'English Reading & Speech', teacher: 'Ms. Sadia Khan', room: 'Room 201', type: 'Workshop' },
      { period: 'Break', time: '10:15 - 10:45 AM', subject: 'Recess', teacher: 'Campus Ground', room: 'Cafeteria', type: 'Break' },
      { period: '4', time: '10:45 - 11:30 AM', subject: 'Biology & Botany', teacher: 'Dr. Ayesha Malik', room: 'Room 201', type: 'Lecture' },
      { period: '5', time: '11:30 - 12:15 PM', subject: 'Pakistan Studies', teacher: 'Sir Javed Iqbal', room: 'Room 201', type: 'Lecture' },
      { period: '6', time: '12:15 - 01:00 PM', subject: 'Physical Education & Sports', teacher: 'Coach Bilal', room: 'Sports Arena', type: 'Activity' },
    ],
    Wednesday: [
      { period: '1', time: '08:00 - 08:45 AM', subject: 'Computer Programming & Python', teacher: 'Prof. Tariq Mahmood', room: 'IT Lab 1', type: 'Lab' },
      { period: '2', time: '08:45 - 09:30 AM', subject: 'Mathematics (Trigonometry)', teacher: 'Engr. Farooq Ahmad', room: 'Room 201', type: 'Lecture' },
      { period: '3', time: '09:30 - 10:15 AM', subject: 'Physics Numerical Analysis', teacher: 'Dr. Zobia Khan', room: 'Room 201', type: 'Lecture' },
      { period: 'Break', time: '10:15 - 10:45 AM', subject: 'Recess', teacher: 'Campus Ground', room: 'Cafeteria', type: 'Break' },
      { period: '4', time: '10:45 - 11:30 AM', subject: 'English Essay Writing', teacher: 'Ms. Sadia Khan', room: 'Room 201', type: 'Lecture' },
      { period: '5', time: '11:30 - 12:15 PM', subject: 'Robotics Workshop', teacher: 'Engr. Farooq Ahmad', room: 'STEM Center', type: 'Lab' },
      { period: '6', time: '12:15 - 01:00 PM', subject: 'Library Research & Reading', teacher: 'Ms. Hina Gul', room: 'Main Library', type: 'Study' },
    ],
    Thursday: [
      { period: '1', time: '08:00 - 08:45 AM', subject: 'Mathematics (Past Papers)', teacher: 'Engr. Farooq Ahmad', room: 'Room 201', type: 'Practice' },
      { period: '2', time: '08:45 - 09:30 AM', subject: 'Chemistry Formulas & Equations', teacher: 'Dr. Ayesha Malik', room: 'Room 201', type: 'Lecture' },
      { period: '3', time: '09:30 - 10:15 AM', subject: 'Biology Genetics & Ecology', teacher: 'Dr. Ayesha Malik', room: 'Science Lab A', type: 'Practical' },
      { period: 'Break', time: '10:15 - 10:45 AM', subject: 'Recess', teacher: 'Campus Ground', room: 'Cafeteria', type: 'Break' },
      { period: '4', time: '10:45 - 11:30 AM', subject: 'Urdu Grammar & Nazm', teacher: 'Sir Usman Ali', room: 'Room 201', type: 'Lecture' },
      { period: '5', time: '11:30 - 12:15 PM', subject: 'Islamic Morals & Hadith', teacher: 'Qari Abdul Rehman', room: 'Room 201', type: 'Lecture' },
      { period: '6', time: '12:15 - 01:00 PM', subject: 'Art & Creative Design', teacher: 'Ms. Amna Tariq', room: 'Arts Studio', type: 'Activity' },
    ],
    Friday: [
      { period: '1', time: '08:00 - 08:45 AM', subject: 'Weekly Assessment Test', teacher: 'Academic Faculty', room: 'Room 201', type: 'Exam' },
      { period: '2', time: '08:45 - 09:30 AM', subject: 'Mathematics Problem Solving', teacher: 'Engr. Farooq Ahmad', room: 'Room 201', type: 'Lecture' },
      { period: '3', time: '09:30 - 10:15 AM', subject: 'English Debate & Declamation', teacher: 'Ms. Sadia Khan', room: 'Auditorium', type: 'Activity' },
      { period: '4', time: '10:15 - 11:00 AM', subject: 'Friday Assembly & Character Talk', teacher: 'Principal Office', room: 'Central Hall', type: 'Assembly' },
    ],
    Saturday: [
      { period: '1', time: '08:30 - 09:15 AM', subject: 'STEM Project Innovation', teacher: 'STEM Faculty', room: 'Robotics Lab', type: 'Project' },
      { period: '2', time: '09:15 - 10:00 AM', subject: 'Computer Coding Competition', teacher: 'Prof. Tariq Mahmood', room: 'IT Lab 1', type: 'Contest' },
      { period: '3', time: '10:00 - 10:45 AM', subject: 'Physical Athletics & Matches', teacher: 'Sports Department', room: 'Ground', type: 'Sports' },
    ],
  };

  const scheduleForDay = weeklySchedule[activeDay] || weeklySchedule.Monday;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Weekly Class Timetable & Schedule
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Daily academic periods, assigned subject teachers, laboratories, and lecture timings.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-2xl text-xs font-black shadow-sm flex items-center gap-2 transition-all hover:scale-105"
        >
          <Printer className="w-4 h-4 text-orange-600" />
          <span>Print Schedule</span>
        </button>
      </div>

      {/* Day Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {days.map((day) => (
          <button
            key={day}
            onClick={() => setActiveDay(day)}
            className={`px-5 py-3 rounded-2xl text-xs font-black shrink-0 transition-all ${
              activeDay === day
                ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-md shadow-orange-500/25 scale-105'
                : 'bg-white text-slate-700 hover:bg-orange-50 border border-slate-200'
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      {/* Timetable Period List */}
      <div className="space-y-3">
        {scheduleForDay.map((p, idx) => {
          const isBreak = p.type === 'Break';
          const isCurrent = idx === currentPeriodIdx && activeDay === 'Monday';

          return (
            <div
              key={idx}
              className={`p-5 sm:p-6 rounded-3xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                isBreak
                  ? 'bg-amber-50/60 border-amber-200/80'
                  : isCurrent
                  ? 'bg-orange-500/10 border-orange-400 shadow-md ring-2 ring-orange-400/30'
                  : 'bg-white border-slate-200 shadow-sm hover:shadow-md'
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 shadow-sm ${
                    isBreak
                      ? 'bg-amber-200 text-amber-900'
                      : isCurrent
                      ? 'bg-orange-500 text-white animate-pulse'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {isBreak ? '☕' : `P${p.period}`}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-base text-slate-900 leading-snug">
                      {p.subject}
                    </span>
                    {isCurrent && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-orange-600 text-white uppercase tracking-wider animate-pulse">
                        Now in Session
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600">
                      {p.type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    Instructor: <strong className="text-slate-800 font-bold">{p.teacher}</strong>
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-6 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                <div className="text-left sm:text-right space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                    Duration
                  </span>
                  <span className="text-xs font-black font-mono text-slate-800 block">
                    {p.time}
                  </span>
                </div>

                <div className="text-left sm:text-right space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                    Location
                  </span>
                  <span className="text-xs font-bold text-orange-600 block">
                    {p.room}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
