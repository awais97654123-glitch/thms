'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DollarSign, Printer, ArrowLeft, CheckCircle2 } from 'lucide-react';
import PrintableReceipt from '@/components/common/PrintableReceipt';

export default function StudentFeesPage() {
  const [student, setStudent] = useState<any | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);

  useEffect(() => {
    fetch('/api/students/THMS-2026-000001')
      .then((res) => res.json())
      .then((data) => {
        if (data.student) setStudent(data.student);
      })
      .catch(console.error);
  }, []);

  if (!student) {
    return <div className="p-8 text-center text-xs text-slate-400">Loading fee records...</div>;
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

      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-bold text-sm text-slate-900 border-b pb-3">My Fee Invoices & Payment Ledger</h3>

        <div className="space-y-3">
          {student.invoices.map((inv: any) => (
            <div key={inv.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 text-xs space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-mono font-bold text-blue-900 mr-2">{inv.invoiceNo}</span>
                  <strong className="text-slate-900">{inv.title}</strong>
                </div>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  {inv.status}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <span className="text-slate-500 block text-[10px]">Total Amount:</span>
                  <strong className="text-slate-900 font-mono">Rs. {inv.totalAmount.toLocaleString()}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Paid:</span>
                  <strong className="text-emerald-700 font-mono">Rs. {inv.paidAmount.toLocaleString()}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Balance Due:</span>
                  <strong className="text-red-600 font-mono">Rs. {inv.remainingAmount.toLocaleString()}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Due Date:</span>
                  <strong className="text-slate-800">{new Date(inv.dueDate).toLocaleDateString('en-GB')}</strong>
                </div>
              </div>

              {inv.payments && inv.payments.length > 0 && (
                <div className="pt-2 border-t flex items-center justify-between">
                  <span className="text-[10px] text-slate-500">Official Payment Receipt:</span>
                  <button
                    onClick={() => setSelectedReceipt({ receipt: inv.payments[0], invoice: inv, student })}
                    className="px-3 py-1 bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Receipt ({inv.payments[0].receiptNo})</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Receipt Modal Popup */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-4xl w-full bg-white rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-2">
              <h4 className="font-bold text-sm">Fee Deposit Receipt</h4>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-xs font-bold rounded-lg"
              >
                ✕ Close
              </button>
            </div>
            <PrintableReceipt
              receipt={selectedReceipt.receipt}
              invoice={selectedReceipt.invoice}
              student={{
                studentId: student.studentId,
                admissionNo: student.admissionNo,
                rollNo: student.rollNo,
                fullName: student.fullName,
                className: student.class.name,
                sectionName: student.section.name,
                fatherName: student.parent?.fatherName || 'Dr. Tariq Mehmood',
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
