'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FileBarChart, 
  Download, 
  Printer, 
  Users, 
  DollarSign, 
  CalendarCheck, 
  Award, 
  Library, 
  Bus,
  Search,
  Filter,
  RefreshCw,
  FileSpreadsheet,
  Building2,
  Sparkles,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

export default function AdminReportsPage() {
  const [reportType, setReportType] = useState('STUDENTS');
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [reportData, setReportData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/classes')
      .then((res) => res.json())
      .then((data) => {
        if (data.classes) setClasses(data.classes);
      })
      .catch(console.error);
  }, []);

  const fetchReport = () => {
    setLoading(true);
    let url = `/api/reports?type=${reportType}`;
    if (selectedClass !== 'ALL') url += `&classId=${selectedClass}`;
    if (startDate) url += `&startDate=${startDate}`;
    if (endDate) url += `&endDate=${endDate}`;
    if (searchQuery) url += `&q=${encodeURIComponent(searchQuery)}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.report) setReportData(data.report);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReport();
  }, [reportType, selectedClass]);

  const handleExportCSV = () => {
    if (!reportData || !reportData.rows || reportData.rows.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = reportData.columns.join(',');
    const rows = reportData.rows.map((r: any) => {
      return Object.values(r)
        .filter((v, idx) => idx > 0) // Skip ID
        .map((v) => `"${(v ?? '').toString().replace(/"/g, '""')}"`)
        .join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `THMS_Report_${reportType}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const reportTypes = [
    { id: 'STUDENTS', label: 'Students Directory', icon: Users },
    { id: 'DEFAULTERS', label: 'Fee Defaulters List', icon: ShieldAlert },
    { id: 'FEES', label: 'Fee Collections Audit', icon: DollarSign },
    { id: 'ATTENDANCE', label: 'Attendance Register', icon: CalendarCheck },
    { id: 'ADMISSIONS', label: 'Admissions Pipeline', icon: Users },
    { id: 'EXAMS', label: 'Exam Merit Scorecard', icon: Award },
    { id: 'TEACHERS', label: 'Faculty Workload', icon: Users },
    { id: 'LIBRARY', label: 'Library Circulation', icon: Library },
    { id: 'TRANSPORT', label: 'Transport Manifest', icon: Bus },
    { id: 'STAFF', label: 'Support Staff Roster', icon: Users },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300 bg-[#ffffff] text-slate-900 pb-16">
      
      {/* Top Header Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-[#0a192f] text-white p-8 sm:p-10 shadow-2xl border border-blue-900/40 print:hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-600/25 text-blue-300 text-xs font-bold border border-blue-500/40 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
              <span>Central Intelligence & Executive Compliance • Session 2026-2027</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white font-serif">
              Reports, Audit Registers & Analytics Center
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
              Generate dynamic datasets, class-filtered defaulters statements, daily gate biometric pass percentages, and exportable CSV/print audit transcripts.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleExportCSV}
              className="px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 backdrop-blur-xl flex items-center gap-2.5 transition-all hover:scale-105"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Export CSV / Excel</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-5 py-3.5 rounded-2xl btn-blue-prestige text-white text-xs font-bold shadow-lg flex items-center gap-2.5 transition-all hover:scale-105"
            >
              <Printer className="w-4 h-4" />
              <span>Print Official Document</span>
            </button>
          </div>
        </div>
      </div>

      {/* Report Types Carousel / Tab Selector */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-2 overflow-x-auto print:hidden">
        {reportTypes.map((rt) => {
          const Icon = rt.icon;
          const isActive = reportType === rt.id;
          return (
            <button
              key={rt.id}
              onClick={() => setReportType(rt.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold shrink-0 transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-[1.02]'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{rt.label}</span>
            </button>
          );
        })}
      </div>

      {/* Filter Control Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Filter Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-3.5 py-2 rounded-xl border border-slate-300 font-bold focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="ALL">All Academic Classes</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3.5 py-2 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3.5 py-2 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search in report..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchReport()}
              className="pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 font-medium outline-none focus:ring-2 focus:ring-blue-500 w-56"
            />
          </div>
          <button
            onClick={fetchReport}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow"
          >
            Apply Filters
          </button>
        </div>
      </div>

      {/* Printable Official Document Container */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-10 space-y-6 print:border-none print:shadow-none print:p-0">
        
        {/* Printable Official Header */}
        <div className="border-b-2 border-slate-900 pb-5 space-y-2 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#0a192f] text-white flex items-center justify-center font-serif text-2xl font-black border-2 border-blue-900 shadow-md">
              THMS
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 block font-bold">
                Government of Khyber Pakhtunkhwa • BISE Peshawar Registered
              </span>
              <h2 className="text-2xl font-black text-slate-900 font-serif tracking-tight">
                THE HAYATABAD MODEL SCHOOL
              </h2>
              <p className="text-xs text-slate-600 font-medium">
                Phase 3, Hayatabad, Peshawar, Khyber Pakhtunkhwa, Pakistan • Phone: +92 91 5828100
              </p>
            </div>
          </div>

          <div className="text-right text-xs">
            <span className="font-mono text-slate-400 block text-[10px]">DOCUMENT DISPATCH ID</span>
            <strong className="font-mono text-blue-950 font-bold">DOC-{reportType}-{Date.now().toString().slice(-6)}</strong>
            <p className="text-[10px] text-slate-500 mt-0.5">Date: {new Date().toLocaleDateString('en-GB')}</p>
          </div>
        </div>

        {/* Report Title & Counters */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-3">
          <div>
            <h3 className="font-black text-lg text-slate-900 font-serif">{reportData?.title || 'Official Report'}</h3>
            <p className="text-xs text-slate-500 font-medium">
              Academic Session 2026-2027 • Generated on {new Date().toLocaleString('en-GB')}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3.5 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-bold border border-blue-200">
              Total Records: {reportData?.totalCount || 0}
            </span>
          </div>
        </div>

        {/* Dynamic Summary Cards if present */}
        {reportData?.summary && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
            {Object.entries(reportData.summary).map(([key, value]: any) => (
              <div key={key}>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">{key.replace(/([A-Z])/g, ' $1')}:</span>
                <strong className="text-sm font-black text-slate-900 font-mono">
                  {typeof value === 'number' && key.toLowerCase().includes('amount') || key.toLowerCase().includes('total') || key.toLowerCase().includes('billed') || key.toLowerCase().includes('paid') || key.toLowerCase().includes('remaining') ? `Rs. ${value.toLocaleString()}` : value}
                </strong>
              </div>
            ))}
          </div>
        )}

        {/* Report Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100/80 border-b border-slate-300 text-slate-700 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                {reportData?.columns?.map((col: string, idx: number) => (
                  <th key={idx} className="p-3">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={reportData?.columns?.length || 6} className="p-12 text-center text-slate-400">
                    Querying real-time database records...
                  </td>
                </tr>
              ) : !reportData?.rows || reportData.rows.length === 0 ? (
                <tr>
                  <td colSpan={reportData?.columns?.length || 6} className="p-12 text-center text-slate-400 font-medium">
                    No matching records found for this filter criteria.
                  </td>
                </tr>
              ) : (
                reportData.rows.map((row: any, rIdx: number) => (
                  <tr key={row.id || rIdx} className="hover:bg-blue-50/30 transition-colors">
                    {Object.values(row)
                      .filter((_, idx) => idx > 0) // Skip ID
                      .map((val: any, cIdx: number) => (
                        <td key={cIdx} className="p-3 font-medium text-slate-800">
                          {typeof val === 'number' && val > 99 ? `Rs. ${val.toLocaleString()}` : val}
                        </td>
                      ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Official Printable Signatures Footer */}
        <div className="hidden print:grid grid-cols-3 gap-8 pt-16 border-t mt-12 text-center text-xs text-slate-700">
          <div>
            <div className="border-b border-slate-400 w-40 mx-auto mb-2"></div>
            <span className="font-bold">Prepared By</span>
            <p className="text-[10px] text-slate-500">Accounts & Records Dept</p>
          </div>
          <div>
            <div className="border-b border-slate-400 w-40 mx-auto mb-2"></div>
            <span className="font-bold">Verified By</span>
            <p className="text-[10px] text-slate-500">Controller of Examinations / Admin</p>
          </div>
          <div>
            <div className="border-b border-slate-400 w-40 mx-auto mb-2"></div>
            <span className="font-bold">Prof. Muhammad Tariq Khan</span>
            <p className="text-[10px] text-slate-500">Principal & Executive Head</p>
          </div>
        </div>

      </div>

    </div>
  );
}
