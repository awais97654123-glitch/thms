'use client';

import React, { useState } from 'react';
import { FileBarChart, Download, Printer, Users, DollarSign, CalendarCheck, Award, Library, Bus } from 'lucide-react';

export default function AdminReportsPage() {
  const reportCards = [
    { title: 'Student Directory Ledger', description: 'Full register of enrolled students with roll numbers, contact and parent details.', icon: Users, type: 'STUDENTS' },
    { title: 'Admission Applications Report', description: 'Session 2026 applicant queue with verification status and enrollment logs.', icon: Users, type: 'ADMISSIONS' },
    { title: 'Attendance Analytics & Register', description: 'Daily and monthly attendance breakdown with late arrivals and absent tracking.', icon: CalendarCheck, type: 'ATTENDANCE' },
    { title: 'Fee Collection & Overdue Dues', description: 'Billed invoices, bank transfers, cash counter collections and pending balances.', icon: DollarSign, type: 'FEES' },
    { title: 'Terminal Exam Performance', description: 'Subject marks matrix, GPA averages, class positions, and pass/fail statistics.', icon: Award, type: 'EXAMS' },
    { title: 'Library Book Circulation', description: 'Inventory accession list and active book issues with overdue fines ledger.', icon: Library, type: 'LIBRARY' },
  ];

  const handleDownload = (type: string) => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
            Institutional Intelligence
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
            Official ERP Reports & Analytics
          </h1>
          <p className="text-xs text-slate-500">
            Generate and export printable PDF and audit registers for school executive reporting.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportCards.map((r, idx) => {
          const Icon = r.icon;
          return (
            <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">{r.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{r.description}</p>
              </div>

              <div className="pt-4 border-t flex gap-2">
                <button
                  onClick={() => handleDownload(r.type)}
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow flex items-center justify-center gap-1.5 transition-all"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print PDF Report</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
