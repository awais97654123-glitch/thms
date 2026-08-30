'use client';

import React, { useState, useEffect } from 'react';
import { User, Phone, Mail, Award, Shield } from 'lucide-react';

export default function AdminStaffPage() {
  const staffList = [
    { fullName: 'Shahid Mehmood', role: 'Chief Accountant & Bursar', phone: '+92 333 1122334', email: 'accounts@hayatabadmodel.edu.pk', employeeId: 'EMP-S-0201' },
    { fullName: 'Ms. Rabia Noreen', role: 'Head Librarian', phone: '+92 345 2233445', email: 'librarian@hayatabadmodel.edu.pk', employeeId: 'EMP-S-0202' },
    { fullName: 'Sher Afzal Khan', role: 'Senior Fleet Transport Supervisor', phone: '+92 344 7711223', email: 'transport@hayatabadmodel.edu.pk', employeeId: 'EMP-S-0203' },
    { fullName: 'Inamullah Shinwari', role: 'Science & Physics Lab Attendant', phone: '+92 300 8899001', email: 'labs@hayatabadmodel.edu.pk', employeeId: 'EMP-S-0204' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
            Human Resources
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
            Administrative & Support Staff
          </h1>
          <p className="text-xs text-slate-500">
            Accountants, librarians, fleet managers, and laboratory technical staff.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {staffList.map((s, idx) => (
          <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-800 flex items-center justify-center font-bold text-base">
              {s.fullName.charAt(0)}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">{s.fullName}</h3>
              <p className="text-xs text-blue-700 font-semibold">{s.role}</p>
              <span className="text-[10px] font-mono text-slate-400">{s.employeeId}</span>
            </div>

            <div className="space-y-1 text-xs text-slate-600 border-t pt-3">
              <p className="font-mono">{s.phone}</p>
              <p className="truncate text-slate-400">{s.email}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
