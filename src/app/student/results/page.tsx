'use client';

import React, { useState, useEffect } from 'react';
import { Award, Printer, ArrowLeft, AlertCircle, BookOpen, Sparkles } from 'lucide-react';
import Link from 'next/link';
import PrintableReportCard from '@/components/common/PrintableReportCard';

export default function StudentResultsPage() {
  const [student, setStudent] = useState<any | null>(null);
  const [marks, setMarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExamName, setSelectedExamName] = useState('Mid-Term Examination 2026');

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user?.student) {
          const st = data.user.student;
          setStudent(st);

          // Fetch student marks from real database
          fetch(`/api/examinations/marks?studentId=${st.id}`)
            .then((res) => res.json())
            .then((mData) => {
              if (mData.marks) setMarks(mData.marks);
            })
            .catch(console.error);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-slate-500 space-y-2">
        <span className="animate-spin inline-block text-xl">⏳</span>
        <p>Loading your academic marks & report cards...</p>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="p-8 text-center text-xs text-red-500 bg-red-50 border border-red-200 rounded-3xl max-w-lg mx-auto">
        <AlertCircle className="w-8 h-8 mx-auto text-red-500 mb-2" />
        <h3 className="font-bold text-sm">Student Record Not Found</h3>
        <p className="mt-1">Please log in with an authorized student account.</p>
      </div>
    );
  }

  // Format marks for PrintableReportCard
  const formattedMarks = marks.map((m) => ({
    subjectName: m.examSchedule?.subject?.name || 'Subject',
    totalMarks: m.totalMarks || 100,
    obtainedMarks: m.marksObtained || 0,
    percentage: m.percentage || 0,
    grade: m.grade || 'N/A',
    gpa: m.gpa || 0,
    remarks: m.remarks || 'Satisfactory Performance',
  }));

  const totalObtained = formattedMarks.reduce((sum, m) => sum + m.obtainedMarks, 0);
  const totalMax = formattedMarks.reduce((sum, m) => sum + m.totalMarks, 0);
  const overallPercentage = totalMax > 0 ? ((totalObtained / totalMax) * 100).toFixed(1) : '0';
  const averageGpa = formattedMarks.length > 0 ? (formattedMarks.reduce((sum, m) => sum + m.gpa, 0) / formattedMarks.length).toFixed(2) : '0.00';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/student"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Student Portal</span>
        </Link>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Evaluated Subjects</span>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{formattedMarks.length} Subjects</h3>
          <p className="text-[11px] text-slate-500 mt-1">Class {student.class?.name || '8'}</p>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Cumulative Percentage</span>
          <h3 className="text-2xl font-extrabold text-emerald-700 font-mono mt-1">{overallPercentage}%</h3>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">Distinction Standing</p>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Academic GPA</span>
          <h3 className="text-2xl font-extrabold text-blue-700 font-mono mt-1">{averageGpa} / 4.0</h3>
          <p className="text-[11px] text-slate-500 mt-1">Official Board Standard</p>
        </div>
      </div>

      {formattedMarks.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-xs text-slate-400 space-y-2">
          <Award className="w-10 h-10 mx-auto text-slate-300 mb-2" />
          <h4 className="font-bold text-sm text-slate-700">No Exam Marks Published Yet</h4>
          <p>Marks entered by subject faculty will appear here once finalized by the examination department.</p>
        </div>
      ) : (
        <PrintableReportCard
          student={{
            studentId: student.studentId,
            admissionNo: student.admissionNo,
            rollNo: student.rollNo,
            fullName: student.fullName,
            class: student.class,
            section: student.section,
            parent: student.parent,
          }}
          exam={{
            name: selectedExamName,
            term: 'MID_TERM',
          }}
          sessionName={student.session?.name || 'Academic Session 2026-2027'}
          marks={formattedMarks}
        />
      )}
    </div>
  );
}
