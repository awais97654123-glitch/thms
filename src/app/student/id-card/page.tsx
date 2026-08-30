'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { CreditCard, ArrowLeft } from 'lucide-react';
import PrintableIDCard from '@/components/common/PrintableIDCard';

export default function StudentIdCardPage() {
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
    return <div className="p-8 text-center text-xs text-slate-400">Loading student ID card...</div>;
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

      <PrintableIDCard student={student} />
    </div>
  );
}
