'use client';

import React from 'react';
import { Printer, DollarSign, CheckCircle2, Building2 } from 'lucide-react';

interface FeeReceiptProps {
  receipt?: {
    receiptNo?: string;
    amount?: number;
    paymentDate?: string | Date;
    paymentMethod?: string;
    transactionRef?: string | null;
    bankName?: string | null;
  };
  payment?: any;
  invoice: {
    invoiceNo: string;
    title?: string;
    month: string;
    totalAmount: number;
    discountAmount?: number;
    paidAmount: number;
    remainingAmount: number;
    items?: Array<{ feeType: string; amount: number; description?: string | null }>;
  };
  student: {
    studentId: string;
    admissionNo: string;
    rollNo: string;
    fullName: string;
    className?: string;
    sectionName?: string;
    fatherName?: string;
    class?: { name: string };
    section?: { name: string };
    parent?: { fatherName?: string };
  };
  school?: {
    schoolName: string;
    phone: string;
    bankDetails?: string;
  };
}

export default function PrintableReceipt({
  receipt,
  payment,
  invoice,
  student,
  school,
}: FeeReceiptProps) {
  const slips = ['STUDENT COPY', 'SCHOOL ACCOUNTS COPY', 'BANK COPY'];
  const schoolName = school?.schoolName || 'The Hayatabad Model School';

  const receiptNo = receipt?.receiptNo || payment?.receiptNo || `REC-${invoice.invoiceNo}`;
  const paidAmount = receipt?.amount || payment?.amount || invoice.paidAmount || 0;
  const paymentDate = receipt?.paymentDate || payment?.createdAt || new Date();
  const paymentMethod = receipt?.paymentMethod || payment?.method || 'CASH_COUNTER';
  const className = student.className || student.class?.name || 'Class 8';
  const sectionName = student.sectionName || student.section?.name || 'Section A';
  const fatherName = student.fatherName || student.parent?.fatherName || 'Respected Parent';
  const discountAmount = invoice.discountAmount || 0;

  return (
    <div className="space-y-4">
      {/* Top Action Bar */}
      <div className="no-print flex items-center justify-between bg-slate-900 text-white p-3 rounded-xl shadow">
        <div className="flex items-center gap-2 text-xs">
          <DollarSign className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold">Official Fee Deposit Voucher & Payment Receipt</span>
        </div>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow transition-all"
        >
          <Printer className="w-4 h-4" />
          <span>Print Receipt (3 Slips)</span>
        </button>
      </div>

      {/* 3-Slip Voucher Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-100 p-4 rounded-2xl border border-slate-200">
        {slips.map((slipType, idx) => (
          <div
            key={idx}
            className="bg-white p-4 rounded-xl border border-slate-300 shadow-sm flex flex-col justify-between text-slate-800 text-[11px]"
          >
            {/* Header */}
            <div className="text-center border-b border-slate-200 pb-2.5">
              <div className="inline-block px-2 py-0.5 rounded bg-blue-900 text-white text-[9px] font-bold uppercase tracking-widest mb-1">
                {slipType}
              </div>
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <img
                  src="/school-logo.png"
                  alt="THMS"
                  className="w-5 h-5 object-contain"
                />
                <h4 className="font-bold text-slate-900 text-xs">{schoolName}</h4>
              </div>
              <p className="text-[10px] text-slate-500">Sector F-4, Phase 6, Hayatabad, Peshawar</p>
              <div className="mt-1.5 flex items-center justify-between text-[10px] bg-slate-50 p-1.5 rounded border border-slate-200">
                <span>Receipt: <strong className="text-emerald-700">{receiptNo}</strong></span>
                <span>Inv: <strong className="text-blue-700">{invoice.invoiceNo}</strong></span>
              </div>
            </div>

            {/* Student & Invoice Info */}
            <div className="py-2.5 space-y-1 text-[10px]">
              <div className="flex justify-between">
                <span className="text-slate-500">Student Name:</span>
                <span className="font-bold text-slate-900">{student.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Father Name:</span>
                <span className="text-slate-800">{fatherName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Student ID / Roll:</span>
                <span className="font-mono font-bold text-slate-800">{student.studentId} ({student.rollNo})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Class & Section:</span>
                <span className="font-semibold text-slate-800">{className} - {sectionName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Fee Month:</span>
                <span className="font-bold text-blue-900">{invoice.month}</span>
              </div>
            </div>

            {/* Fee Items Table */}
            <div className="border-t border-b border-slate-200 py-1.5">
              <table className="w-full text-[10px]">
                <thead>
                  <tr className="text-slate-500 text-left font-semibold">
                    <th>Description</th>
                    <th className="text-right">Amount (Rs)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoice.items && invoice.items.length > 0 ? (
                    invoice.items.map((item, i) => (
                      <tr key={i}>
                        <td className="py-0.5 text-slate-700">{item.description || item.feeType}</td>
                        <td className="py-0.5 text-right font-mono font-medium">{item.amount.toLocaleString()}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="py-0.5 text-slate-700">Monthly Tuition & Facility Fees</td>
                      <td className="py-0.5 text-right font-mono font-medium">{invoice.totalAmount.toLocaleString()}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Financial Summary & Stamp */}
            <div className="pt-2 space-y-1 text-[10px]">
              <div className="flex justify-between text-slate-600">
                <span>Total Invoice:</span>
                <span className="font-mono font-bold">Rs. {invoice.totalAmount.toLocaleString()}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Concession / Discount:</span>
                  <span className="font-mono">- Rs. {discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-emerald-900 bg-emerald-50 p-1 rounded font-bold border border-emerald-200">
                <span>Paid Amount:</span>
                <span className="font-mono">Rs. {paidAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-500 text-[9px]">
                <span>Remaining Balance:</span>
                <span className="font-mono font-bold text-red-600">Rs. {invoice.remainingAmount.toLocaleString()}</span>
              </div>
            </div>

            {/* Payment Mode & Stamp */}
            <div className="mt-3 pt-2 border-t border-dashed border-slate-300 text-[9px] text-slate-500 flex items-center justify-between">
              <div>
                <p>Mode: <strong>{paymentMethod}</strong></p>
                <p className="text-[8px]">{new Date(paymentDate).toLocaleDateString('en-GB')}</p>
              </div>
              <div className="text-right">
                <span className="inline-block px-1.5 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded text-[8px]">
                  PAID & VERIFIED
                </span>
                <p className="text-[8px] mt-0.5 text-slate-400">Cashier Signature</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
