'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileText, Search, Printer, DollarSign, ArrowLeft } from 'lucide-react';
import PrintableReceipt from '@/components/common/PrintableReceipt';

export default function AdminReceiptsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);

  useEffect(() => {
    fetch('/api/fees/payments')
      .then((res) => res.json())
      .then((data) => {
        if (data.payments) setPayments(data.payments);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = payments.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.receiptNo.toLowerCase().includes(q) ||
      p.student?.fullName?.toLowerCase().includes(q) ||
      p.student?.studentId?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/admin/fees"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Fees & Invoices</span>
        </Link>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-teal-600">
            Financial Audit Ledger
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
            Payment Receipts Ledger
          </h1>
          <p className="text-xs text-slate-500">
            Official deposit vouchers and verified transaction receipts with 3-slip printing.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
        <div className="flex justify-between items-center">
          <div className="relative w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search receipt code or student..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <span className="text-xs text-slate-500 font-medium">Total: {filtered.length} Receipts</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-3">Receipt Code</th>
                <th className="p-3">Student Name</th>
                <th className="p-3">Class & Roll</th>
                <th className="p-3">Amount Paid</th>
                <th className="p-3">Payment Channel</th>
                <th className="p-3">Date</th>
                <th className="p-3 text-right">Print Voucher</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3 font-mono font-bold text-teal-800">{p.receiptNo}</td>
                  <td className="p-3 font-bold text-slate-900">{p.student?.fullName}</td>
                  <td className="p-3 font-semibold text-slate-700">
                    {p.student?.class?.name} ({p.student?.rollNo})
                  </td>
                  <td className="p-3 font-mono font-bold text-emerald-700">
                    Rs. {p.amount.toLocaleString()}
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 bg-slate-100 font-bold text-[10px] rounded text-slate-700">
                      {p.paymentMethod}
                    </span>
                  </td>
                  <td className="p-3 text-slate-500">
                    {new Date(p.paymentDate).toLocaleDateString('en-GB')}
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => setSelectedReceipt(p)}
                      className="px-3 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold rounded-lg text-xs flex items-center gap-1 ml-auto"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print (3 Slips)</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3-Slip Voucher Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-4xl w-full bg-white rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-2">
              <h4 className="font-bold text-sm">Fee Deposit Receipt Voucher (3 Copies)</h4>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-xs font-bold rounded-lg"
              >
                ✕ Close
              </button>
            </div>
            <PrintableReceipt
              receipt={selectedReceipt}
              invoice={selectedReceipt.invoice || {
                invoiceNo: 'INV-2026-000001',
                title: 'Monthly Tuition & Activity Fee',
                month: 'March 2026',
                totalAmount: selectedReceipt.amount,
                discountAmount: 0,
                paidAmount: selectedReceipt.amount,
                remainingAmount: 0,
              }}
              student={{
                studentId: selectedReceipt.student?.studentId || 'THMS-2026-000001',
                admissionNo: selectedReceipt.student?.admissionNo || 'ADM-2026-000001',
                rollNo: selectedReceipt.student?.rollNo || '08-A-001',
                fullName: selectedReceipt.student?.fullName || 'Student',
                className: selectedReceipt.student?.class?.name || 'Class 8',
                sectionName: selectedReceipt.student?.section?.name || 'Section A',
                fatherName: selectedReceipt.student?.parent?.fatherName || 'Father',
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
