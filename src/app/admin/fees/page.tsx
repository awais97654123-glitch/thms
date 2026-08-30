'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  DollarSign, 
  Search, 
  Plus, 
  Printer, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileText,
  CreditCard,
  Building2,
  Sparkles
} from 'lucide-react';
import PrintableReceipt from '@/components/common/PrintableReceipt';

export default function AdminFeesInvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Payment Recording Modal State
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [bankName, setBankName] = useState('');
  const [txRef, setTxRef] = useState('');
  const [recordingPayment, setRecordingPayment] = useState(false);
  const [generatedReceipt, setGeneratedReceipt] = useState<any | null>(null);

  const fetchInvoices = () => {
    setLoading(true);
    let url = `/api/fees/invoices?status=${filterStatus}`;
    if (searchQuery) url += `&q=${encodeURIComponent(searchQuery)}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.invoices) setInvoices(data.invoices);
        if (data.metrics) setMetrics(data.metrics);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchInvoices();
  }, [filterStatus]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchInvoices();
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    setRecordingPayment(true);

    try {
      const res = await fetch('/api/fees/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId: selectedInvoice.id,
          amount: parseFloat(paymentAmount),
          paymentMethod,
          bankName,
          transactionRef: txRef,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setGeneratedReceipt(data);
        fetchInvoices();
      } else {
        alert(data.error || 'Failed to record payment');
      }
    } catch {
      alert('Error submitting payment');
    } finally {
      setRecordingPayment(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'PARTIALLY_PAID':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'OVERDUE':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-amber-100 text-amber-800 border-amber-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-teal-600">
            Accounts & Fee Management
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
            Fee Invoicing, Payments & Receipts Ledger
          </h1>
          <p className="text-xs text-slate-500">
            Generate monthly fee vouchers, record multi-channel payments, and print 3-copy deposit receipts.
          </p>
        </div>

        <Link
          href="/admin/fees/receipts"
          className="px-4 py-2 bg-teal-50 hover:bg-teal-100 text-teal-700 font-bold text-xs rounded-xl flex items-center gap-1.5 border border-teal-200"
        >
          <FileText className="w-4 h-4" />
          <span>Payment Receipts Ledger</span>
        </Link>
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Total Billed Fees</span>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
            Rs. {metrics?.totalBilled?.toLocaleString() || '23,500'}
          </h3>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Total Collected</span>
          <h3 className="text-2xl font-extrabold text-emerald-700 mt-1">
            Rs. {metrics?.totalCollected?.toLocaleString() || '10,000'}
          </h3>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Outstanding Dues</span>
          <h3 className="text-2xl font-extrabold text-amber-700 mt-1">
            Rs. {metrics?.totalPending?.toLocaleString() || '12,500'}
          </h3>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-medium">
          {['ALL', 'PENDING', 'PARTIALLY_PAID', 'PAID'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterStatus === st
                  ? 'bg-teal-700 text-white font-bold shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by invoice no, student name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none w-64"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl"
          >
            Search
          </button>
        </form>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-4">Invoice No</th>
                <th className="p-4">Student Name & Roll</th>
                <th className="p-4">Title / Fee Month</th>
                <th className="p-4">Total Amount</th>
                <th className="p-4">Paid Amount</th>
                <th className="p-4">Remaining Balance</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    Loading fee invoices...
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    No fee invoices found.
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-mono font-bold text-blue-900">
                      {inv.invoiceNo}
                    </td>
                    <td className="p-4">
                      <strong className="text-slate-900 block font-bold">{inv.student?.fullName}</strong>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {inv.student?.studentId} • {inv.student?.class?.name} ({inv.student?.rollNo})
                      </span>
                    </td>
                    <td className="p-4">
                      <p className="font-semibold text-slate-800">{inv.title}</p>
                      <p className="text-[10px] text-slate-500">Due: {new Date(inv.dueDate).toLocaleDateString('en-GB')}</p>
                    </td>
                    <td className="p-4 font-mono font-bold text-slate-900">
                      Rs. {inv.totalAmount.toLocaleString()}
                    </td>
                    <td className="p-4 font-mono font-bold text-emerald-700">
                      Rs. {inv.paidAmount.toLocaleString()}
                    </td>
                    <td className="p-4 font-mono font-bold text-red-600">
                      Rs. {inv.remainingAmount.toLocaleString()}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(inv.status)}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {inv.remainingAmount > 0 ? (
                        <button
                          onClick={() => {
                            setSelectedInvoice(inv);
                            setPaymentAmount(inv.remainingAmount.toString());
                            setGeneratedReceipt(null);
                          }}
                          className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-lg text-xs transition-colors"
                        >
                          Record Payment
                        </button>
                      ) : (
                        <span className="text-emerald-700 text-xs font-bold flex items-center justify-end gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Fully Paid</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment & Print Receipt Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-teal-600 block">
                  Payment Collection & Deposit Voucher
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  Record Fee Payment for {selectedInvoice.student?.fullName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-600"
              >
                ✕ Close
              </button>
            </div>

            {generatedReceipt ? (
              <div className="space-y-4 animate-in fade-in">
                <PrintableReceipt
                  receipt={generatedReceipt.receipt}
                  invoice={generatedReceipt.invoice}
                  student={generatedReceipt.student}
                />
              </div>
            ) : (
              <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 grid grid-cols-3 gap-2">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Invoice Total:</span>
                    <strong className="text-slate-900 font-mono">Rs. {selectedInvoice.totalAmount.toLocaleString()}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Already Paid:</span>
                    <strong className="text-emerald-700 font-mono">Rs. {selectedInvoice.paidAmount.toLocaleString()}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Remaining Balance:</span>
                    <strong className="text-red-600 font-mono text-sm">Rs. {selectedInvoice.remainingAmount.toLocaleString()}</strong>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Payment Amount to Collect (Rs.) *
                    </label>
                    <input
                      type="number"
                      max={selectedInvoice.remainingAmount}
                      min="1"
                      required
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      className="w-full px-3 py-2 text-sm font-mono font-bold text-emerald-900 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Payment Channel / Mode *
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-teal-500 outline-none"
                    >
                      <option value="CASH">Cash Deposit at Campus Counter</option>
                      <option value="BANK_TRANSFER">Bank Online Transfer / Raast</option>
                      <option value="ONLINE">Credit/Debit Card Online</option>
                      <option value="CHEQUE">Bank Pay Order / Cheque</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Bank Name / Branch (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. HBL / Meezan Bank Hayatabad"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Transaction Reference / Deposit Slip No
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. FT-9482103"
                      value={txRef}
                      onChange={(e) => setTxRef(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={recordingPayment}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl shadow flex items-center justify-center gap-2 mt-4"
                >
                  {recordingPayment ? <span className="animate-spin">⏳</span> : <DollarSign className="w-4 h-4" />}
                  <span>Record Payment & Issue Official Receipt</span>
                </button>
              </form>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
