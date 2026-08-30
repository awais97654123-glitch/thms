'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DollarSign, Printer, ArrowLeft, CheckCircle2, AlertCircle, FileText } from 'lucide-react';
import PrintableReceipt from '@/components/common/PrintableReceipt';

export default function StudentFeesPage() {
  const [student, setStudent] = useState<any | null>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user?.student) {
          const st = data.user.student;
          setStudent(st);
          // Fetch invoices for this specific student
          fetch(`/api/fees/invoices?studentId=${st.id}`)
            .then((res) => res.json())
            .then((invData) => {
              if (invData.invoices) setInvoices(invData.invoices);
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
        <p>Loading your official fee records & payment ledger...</p>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="p-8 text-center text-xs text-red-500 bg-red-50 border border-red-200 rounded-3xl max-w-lg mx-auto">
        <AlertCircle className="w-8 h-8 mx-auto text-red-500 mb-2" />
        <h3 className="font-bold text-sm">Student Profile Not Linked</h3>
        <p className="mt-1">This user account is not linked to an active student record.</p>
      </div>
    );
  }

  const totalOutstanding = invoices
    .filter((inv) => inv.status !== 'PAID')
    .reduce((sum, inv) => sum + (inv.remainingAmount || 0), 0);

  const totalPaid = invoices.reduce((sum, inv) => sum + (inv.paidAmount || 0), 0);

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

      {/* Header & Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Total Invoices</span>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{invoices.length} Vouchers</h3>
          <p className="text-[11px] text-slate-500 mt-1">Academic Session 2026</p>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Total Paid to Date</span>
          <h3 className="text-2xl font-extrabold text-emerald-700 font-mono mt-1">
            Rs. {totalPaid.toLocaleString()}
          </h3>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">Verified Bank & Cash Deposits</p>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Outstanding Balance</span>
          <h3 className={`text-2xl font-extrabold font-mono mt-1 ${totalOutstanding > 0 ? 'text-red-600' : 'text-slate-900'}`}>
            Rs. {totalOutstanding.toLocaleString()}
          </h3>
          <p className="text-[11px] text-slate-500 mt-1">
            {totalOutstanding === 0 ? '✓ All dues cleared' : 'Please deposit at school accounts office'}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <h3 className="font-bold text-sm text-slate-900">Fee Invoices & Deposit History</h3>
          <span className="text-xs text-slate-500">Official Accounts Ledger</span>
        </div>

        {invoices.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No fee invoices generated yet for this student.
          </div>
        ) : (
          <div className="space-y-3">
            {invoices.map((inv) => (
              <div key={inv.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50 text-xs space-y-3">
                <div className="flex flex-wrap justify-between items-center gap-2">
                  <div>
                    <span className="font-mono font-bold text-blue-900 mr-2">{inv.invoiceNo}</span>
                    <strong className="text-slate-900 text-sm">{inv.title}</strong>
                    <span className="text-slate-500 ml-2">({inv.month})</span>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-extrabold border ${
                      inv.status === 'PAID'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : inv.status === 'PARTIALLY_PAID'
                        ? 'bg-blue-100 text-blue-800 border-blue-300'
                        : 'bg-amber-100 text-amber-800 border-amber-300'
                    }`}
                  >
                    {inv.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-3.5 rounded-xl border border-slate-200/80">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Total Billed:</span>
                    <strong className="text-slate-900 font-mono text-xs">Rs. {inv.totalAmount.toLocaleString()}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Paid Amount:</span>
                    <strong className="text-emerald-700 font-mono text-xs">Rs. {inv.paidAmount.toLocaleString()}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Remaining Due:</span>
                    <strong className="text-red-600 font-mono text-xs">Rs. {inv.remainingAmount.toLocaleString()}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Due Date:</span>
                    <strong className="text-slate-800 text-xs">{new Date(inv.dueDate).toLocaleDateString('en-GB')}</strong>
                  </div>
                </div>

                {inv.items && inv.items.length > 0 && (
                  <div className="pt-2 border-t border-slate-200 flex flex-wrap gap-2 text-[11px] text-slate-600">
                    {inv.items.map((it: any) => (
                      <span key={it.id} className="px-2.5 py-0.5 rounded bg-slate-200/70 font-medium">
                        {it.description || it.feeType}: Rs. {it.amount.toLocaleString()}
                      </span>
                    ))}
                  </div>
                )}

                {inv.payments && inv.payments.length > 0 && (
                  <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[11px] text-slate-500 font-semibold">
                      Verified Payment: Receipt #{inv.payments[0].receiptNo} ({new Date(inv.payments[0].paymentDate).toLocaleDateString('en-GB')})
                    </span>
                    <button
                      onClick={() => setSelectedReceipt({ receipt: inv.payments[0], invoice: inv, student })}
                      className="px-3.5 py-1.5 bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print Official Receipt</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
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
                className: student.class?.name || 'Class',
                sectionName: student.section?.name || 'Section',
                fatherName: student.parent?.fatherName || 'Parent/Guardian',
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
