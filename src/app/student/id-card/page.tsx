'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { CreditCard, ArrowLeft, Printer, ShieldCheck } from 'lucide-react';
import PrintableIDCard from '@/components/common/PrintableIDCard';

export default function StudentIdCardPage() {
  const [student, setStudent] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user?.student) {
          setStudent(data.user.student);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-slate-500 space-y-3">
        <span className="animate-spin inline-block text-xl">⏳</span>
        <p>Loading your Official Digital ID Card...</p>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="p-8 text-center text-xs text-red-500 bg-red-50 border border-red-200 rounded-2xl">
        Student profile record not found. Please contact administration.
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <Link
          href="/student"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Student Portal</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Verified Official Identity</span>
          </span>
          <button
            onClick={() => window.print()}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5 transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print My Card</span>
          </button>
        </div>
      </div>

      <PrintableIDCard student={student} />
    </div>
  );
}
