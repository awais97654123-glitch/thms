'use client';

import React from 'react';
import { Printer, Award, CheckCircle, GraduationCap } from 'lucide-react';

interface ReportCardProps {
  student: {
    studentId: string;
    admissionNo: string;
    rollNo: string;
    fullName: string;
    dob?: string | Date;
    class: { name: string };
    section: { name: string };
    parent?: { fatherName: string } | null;
  };
  exam: {
    name: string;
    term: string;
  };
  sessionName: string;
  marks: Array<{
    subjectName: string;
    totalMarks: number;
    obtainedMarks: number;
    percentage: number;
    grade: string;
    gpa: number;
    remarks?: string | null;
  }>;
  attendanceStats?: {
    totalDays: number;
    presentDays: number;
    percentage: number;
  };
  classPosition?: string;
  teacherRemarks?: string;
  principalRemarks?: string;
}

export default function PrintableReportCard({
  student,
  exam,
  sessionName,
  marks,
  attendanceStats = { totalDays: 110, presentDays: 106, percentage: 96.4 },
  classPosition = '1st Position',
  teacherRemarks = 'Demonstrates exemplary intellectual dedication, discipline, and outstanding problem-solving abilities.',
  principalRemarks = 'Promoted with High Honors. Keep up the extraordinary standard of academic excellence!',
}: ReportCardProps) {
  const totalMaxMarks = marks.reduce((sum, m) => sum + m.totalMarks, 0);
  const totalObtained = marks.reduce((sum, m) => sum + m.obtainedMarks, 0);
  const overallPercentage = totalMaxMarks > 0 ? (totalObtained / totalMaxMarks) * 100 : 0;

  const calculateOverallGrade = (pct: number) => {
    if (pct >= 90) return 'A+';
    if (pct >= 80) return 'A';
    if (pct >= 70) return 'B+';
    if (pct >= 60) return 'B';
    if (pct >= 50) return 'C';
    if (pct >= 33) return 'D';
    return 'F';
  };

  const overallGrade = calculateOverallGrade(overallPercentage);

  return (
    <div className="space-y-4">
      {/* Control Action Bar */}
      <div className="no-print flex items-center justify-between bg-slate-900 text-white p-3 rounded-xl shadow">
        <div className="flex items-center gap-2 text-xs">
          <Award className="w-4 h-4 text-amber-400" />
          <span className="font-semibold">Official Terminal Examination Transcript & Report Card</span>
        </div>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow transition-all"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Save PDF</span>
        </button>
      </div>

      {/* Official Report Card Printable Document */}
      <div
        id="report-card-print"
        className="max-w-4xl mx-auto bg-white p-8 sm:p-10 rounded-2xl shadow-xl border-2 border-slate-300 text-slate-900 relative"
      >
        {/* Watermark Crest */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
          <GraduationCap className="w-96 h-96 text-blue-900" />
        </div>

        {/* Top Header & Crest */}
        <div className="border-b-2 border-slate-900 pb-4 text-center">
          <div className="flex items-center justify-center gap-4">
            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white flex items-center justify-center p-1 shadow border border-slate-300">
              <img
                src="/school-logo.png"
                alt="THMS Crest"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold uppercase tracking-wide text-blue-950 font-serif">
                The Hayatabad Model School
              </h1>
              <p className="text-xs text-slate-600 font-medium">
                Phase 6, Hayatabad, Peshawar, Khyber Pakhtunkhwa, Pakistan
              </p>
              <p className="text-[11px] text-slate-500">
                Affiliated with Board of Intermediate & Secondary Education (BISE) Peshawar
              </p>
            </div>
          </div>

          <div className="mt-4 inline-block px-4 py-1 rounded-full bg-blue-900 text-white text-xs font-bold uppercase tracking-widest">
            {exam.name} • {sessionName}
          </div>
        </div>

        {/* Student Biodata Box */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">Student Name:</span>
            <span className="font-bold text-slate-900 text-sm">{student.fullName}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">Father Name:</span>
            <span className="font-bold text-slate-800">{student.parent?.fatherName || 'N/A'}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">Student ID:</span>
            <span className="font-mono font-bold text-blue-900">{student.studentId}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">Admission / Roll:</span>
            <span className="font-bold text-slate-800">{student.admissionNo} / {student.rollNo}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">Class & Section:</span>
            <span className="font-bold text-slate-800">{student.class.name} - {student.section.name}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">Attendance:</span>
            <span className="font-bold text-emerald-700">{attendanceStats.presentDays}/{attendanceStats.totalDays} ({attendanceStats.percentage}%)</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">Class Standing:</span>
            <span className="font-bold text-amber-600">{classPosition}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">Result Status:</span>
            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
              PASSED (HIGH HONORS)
            </span>
          </div>
        </div>

        {/* Academic Marks Breakdown Table */}
        <div className="mt-6">
          <table className="w-full text-xs text-left border-collapse border border-slate-300">
            <thead>
              <tr className="bg-slate-900 text-white font-semibold uppercase text-[10px] tracking-wider">
                <th className="border border-slate-700 p-2.5">#</th>
                <th className="border border-slate-700 p-2.5">Subject</th>
                <th className="border border-slate-700 p-2.5 text-center">Max Marks</th>
                <th className="border border-slate-700 p-2.5 text-center">Obtained</th>
                <th className="border border-slate-700 p-2.5 text-center">Percentage</th>
                <th className="border border-slate-700 p-2.5 text-center">Grade</th>
                <th className="border border-slate-700 p-2.5">Teacher Evaluation / Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {marks.map((m, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                  <td className="border border-slate-300 p-2.5 text-slate-500 font-mono">{idx + 1}</td>
                  <td className="border border-slate-300 p-2.5 font-bold text-slate-800">{m.subjectName}</td>
                  <td className="border border-slate-300 p-2.5 text-center font-mono text-slate-600">{m.totalMarks}</td>
                  <td className="border border-slate-300 p-2.5 text-center font-mono font-bold text-blue-900">{m.obtainedMarks}</td>
                  <td className="border border-slate-300 p-2.5 text-center font-mono font-semibold">{m.percentage.toFixed(1)}%</td>
                  <td className="border border-slate-300 p-2.5 text-center">
                    <span className="font-extrabold text-emerald-700 px-2 py-0.5 bg-emerald-50 rounded border border-emerald-200">
                      {m.grade}
                    </span>
                  </td>
                  <td className="border border-slate-300 p-2.5 text-slate-600 italic text-[11px]">{m.remarks || 'Satisfactory progress'}</td>
                </tr>
              ))}
            </tbody>
            {/* Table Footer Totals */}
            <tfoot>
              <tr className="bg-slate-100 font-bold text-slate-900 text-xs border-t-2 border-slate-900">
                <td colSpan={2} className="border border-slate-300 p-2.5 text-right uppercase">
                  Grand Total
                </td>
                <td className="border border-slate-300 p-2.5 text-center font-mono font-bold">{totalMaxMarks}</td>
                <td className="border border-slate-300 p-2.5 text-center font-mono font-extrabold text-blue-950">{totalObtained}</td>
                <td className="border border-slate-300 p-2.5 text-center font-mono font-extrabold text-emerald-800">
                  {overallPercentage.toFixed(2)}%
                </td>
                <td className="border border-slate-300 p-2.5 text-center font-extrabold text-white bg-blue-900">
                  {overallGrade}
                </td>
                <td className="border border-slate-300 p-2.5 text-slate-700 font-bold uppercase text-[10px]">
                  GPA: 4.0 / 4.0
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Remarks Section */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
              Class Teacher Remarks:
            </span>
            <p className="italic text-slate-700 leading-relaxed font-serif">
              "{teacherRemarks}"
            </p>
          </div>
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
              Principal Assessment:
            </span>
            <p className="italic text-slate-700 leading-relaxed font-serif">
              "{principalRemarks}"
            </p>
          </div>
        </div>

        {/* Official Signature Lines */}
        <div className="mt-12 pt-6 border-t border-slate-300 grid grid-cols-3 gap-4 text-center text-xs">
          <div>
            <div className="h-10 flex items-end justify-center font-serif italic text-slate-700">
              Engr. Farooq Ahmad
            </div>
            <div className="border-t border-slate-400 pt-1 text-[10px] uppercase font-bold text-slate-500">
              Class Teacher
            </div>
          </div>
          <div>
            <div className="h-10 flex items-end justify-center font-serif italic text-slate-700">
              Dr. Tariq Mehmood
            </div>
            <div className="border-t border-slate-400 pt-1 text-[10px] uppercase font-bold text-slate-500">
              Parent / Guardian
            </div>
          </div>
          <div>
            <div className="h-10 flex items-end justify-center font-serif font-bold text-blue-950">
              Prof. M. Tariq Khan
            </div>
            <div className="border-t border-slate-400 pt-1 text-[10px] uppercase font-bold text-slate-500">
              Principal / Headmaster
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
