'use client';

import React, { useState, useEffect } from 'react';
import { Award, Printer, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import PrintableReportCard from '@/components/common/PrintableReportCard';

export default function StudentResultsPage() {
  const [student, setStudent] = useState<any | null>(null);

  useEffect(() => {
    fetch('/api/students/THMS-2026-000001')
      .then((res) => res.json())
      .then((data) => {
        if (data.student) setStudent(data.student);
      })
      .catch(console.error);
  }, []);

  if (!student) {
    return <div className="p-8 text-center text-xs text-slate-400">Loading exam results...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/student"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      <PrintableReportCard
        student={student}
        exam={{
          name: 'Mid-Term Examination 2026',
          term: 'MID_TERM',
        }}
        sessionName="Academic Session 2026-2027"
        marks={[
          { subjectName: 'Mathematics', totalMarks: 100, obtainedMarks: 95, percentage: 95, grade: 'A+', gpa: 4.0, remarks: 'Outstanding proofs & calculations' },
          { subjectName: 'English Literature', totalMarks: 100, obtainedMarks: 91, percentage: 91, grade: 'A+', gpa: 4.0, remarks: 'Superb grammar and comprehension' },
          { subjectName: 'General Science', totalMarks: 100, obtainedMarks: 94, percentage: 94, grade: 'A+', gpa: 4.0, remarks: 'Excellent grasp of physics and chemistry' },
        ]}
      />
    </div>
  );
}
