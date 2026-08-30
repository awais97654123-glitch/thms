'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import QRScannerModal from '@/components/common/QRScanner';

export default function DedicatedQRScannerPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/admin/attendance"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Attendance Register</span>
        </Link>
      </div>

      <QRScannerModal />
    </div>
  );
}
