'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { CalendarCheck, Award, Plus, Clock, Printer } from 'lucide-react';

export default function AdminExaminationsPage() {
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/examinations')
      .then((res) => res.json())
      .then((data) => {
        if (data.exams) setExams(data.exams);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
            Examinations Office
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
            Exam Sessions & Official Date Sheets
          </h1>
          <p className="text-xs text-slate-500">
            Manage Mid-Term, Final Term, and Pre-Board exam schedules and marks recording matrix.
          </p>
        </div>

        <Link
          href="/admin/examinations/marks"
          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5"
        >
          <Award className="w-4 h-4" />
          <span>Marks Entry Matrix</span>
        </Link>
      </div>

      <div className="space-y-6">
        {exams.map((exam) => (
          <div key={exam.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-4">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">{exam.name}</h3>
                <p className="text-xs text-slate-500">
                  {exam.session?.name} • Term: <strong>{exam.term}</strong>
                </p>
              </div>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-full border border-emerald-200">
                {exam.status}
              </span>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Official Examination Date Sheet & Hall Schedules:
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                {exam.schedules?.map((sch: any) => (
                  <div key={sch.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <div className="flex justify-between">
                      <strong className="text-slate-900">{sch.subject?.name}</strong>
                      <span className="font-bold text-blue-900 bg-blue-50 px-1.5 py-0.2 rounded border text-[10px]">
                        {sch.class?.name} ({sch.section?.name})
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Date: <strong>{new Date(sch.examDate).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}</strong>
                    </p>
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>{sch.startTime} - {sch.endTime}</span>
                      <span>Max: {sch.totalMarks} (Pass: {sch.passingMarks})</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
