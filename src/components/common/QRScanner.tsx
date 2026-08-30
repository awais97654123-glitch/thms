'use client';

import React, { useState, useEffect } from 'react';
import { QrCode, CheckCircle2, XCircle, AlertCircle, Camera, Keyboard, RefreshCw, UserCheck } from 'lucide-react';

interface ScanResult {
  success: boolean;
  message: string;
  student?: {
    id: string;
    studentId: string;
    fullName: string;
    rollNo: string;
    className: string;
    sectionName: string;
    time: string;
    status: string;
  };
}

export default function QRScannerModal({ 
  onAttendanceMarked,
  onClose 
}: { 
  onAttendanceMarked?: () => void;
  onClose?: () => void;
}) {
  const [manualToken, setManualToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [recentScans, setRecentScans] = useState<any[]>([]);
  const [isCameraActive, setIsCameraActive] = useState(false);

  const processQrToken = async (token: string) => {
    if (!token || token.trim() === '') return;
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/attendance/qr-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrToken: token.trim(), method: 'QR' }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setResult({
          success: true,
          message: data.message,
          student: data.student,
        });
        setRecentScans((prev) => [data.student, ...prev.slice(0, 7)]);
        if (onAttendanceMarked) onAttendanceMarked();
        setManualToken('');
      } else {
        setResult({
          success: false,
          message: data.error || 'Invalid or unregistered QR code.',
        });
      }
    } catch (err) {
      setResult({
        success: false,
        message: 'Network or server communication error.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    processQrToken(manualToken);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-4 text-white flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-500/20 border border-blue-400/30 text-blue-300">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm">Automated QR Attendance Scanner</h3>
            <p className="text-[11px] text-blue-200">
              Live Token Verification & Anti-Duplicate Attendance Engine
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-400/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Scanner Online
          </span>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors text-xs font-bold"
              title="Close Scanner"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Scanner / Input Area */}
        <div className="lg:col-span-7 space-y-4">
          <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center bg-slate-50 relative overflow-hidden">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-3 shadow-inner">
              <Camera className="w-8 h-8" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">
              Ready to Scan Student QR Code
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              Hold the student identity card QR code in front of the optical barcode scanner, camera lens, or enter token manually.
            </p>

            {/* Manual Token Quick Input Form */}
            <form onSubmit={handleManualSubmit} className="flex gap-2 max-w-md mx-auto">
              <div className="relative flex-1">
                <Keyboard className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Enter or scan QR token (e.g. THMS-QR-2026-000001-...)"
                  value={manualToken}
                  onChange={(e) => setManualToken(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-mono"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !manualToken}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow transition-all flex items-center gap-1.5"
              >
                {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <UserCheck className="w-3.5 h-3.5" />}
                <span>Verify</span>
              </button>
            </form>

            {/* Quick Demo Scan Button */}
            <div className="mt-4 pt-4 border-t border-slate-200/80 flex flex-wrap items-center justify-center gap-2">
              <span className="text-[11px] text-slate-400">Quick Test Tokens:</span>
              <button
                type="button"
                onClick={() => processQrToken('THMS-QR-2026-000001-a1b2c3d4')}
                className="px-2.5 py-1 text-[11px] font-mono bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg border border-blue-200 transition-colors"
              >
                Hamza Tariq (08-A-001)
              </button>
              <button
                type="button"
                onClick={() => processQrToken('THMS-QR-2026-000003-i9j0k1l2')}
                className="px-2.5 py-1 text-[11px] font-mono bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg border border-blue-200 transition-colors"
              >
                Usman Zafar (08-A-002)
              </button>
            </div>
          </div>

          {/* Feedback Result Banner */}
          {result && (
            <div
              className={`p-4 rounded-xl border flex items-start gap-3 animate-in fade-in zoom-in-95 ${
                result.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-red-50 border-red-200 text-red-900'
              }`}
            >
              {result.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1 text-xs">
                <p className="font-bold text-sm">{result.message}</p>
                {result.student && (
                  <div className="mt-2 grid grid-cols-2 gap-2 bg-white/80 p-2.5 rounded-lg border border-emerald-200">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Student Name</span>
                      <span className="font-bold text-slate-800">{result.student.fullName}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Roll & Class</span>
                      <span className="font-bold text-slate-800">
                        {result.student.rollNo} ({result.student.className})
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Recorded Time</span>
                      <span className="font-semibold text-blue-700">{result.student.time}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Status</span>
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {result.student.status}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Live Scans Feed */}
        <div className="lg:col-span-5 bg-slate-50 rounded-2xl p-4 border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Recent Scans Feed
              </h4>
              <span className="text-[10px] text-slate-500">Live Real-Time</span>
            </div>

            <div className="divide-y divide-slate-100 mt-2">
              {recentScans.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No scans yet in this session. Tap a test token or scan a student QR card.
                </div>
              ) : (
                recentScans.map((scan, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-800">{scan.fullName}</p>
                      <p className="text-[10px] text-slate-500">
                        {scan.rollNo} • {scan.className} - {scan.sectionName}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {scan.status}
                      </span>
                      <p className="text-[10px] font-mono text-slate-400 mt-0.5">{scan.time}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 text-[10px] text-slate-400 text-center">
            The Hayatabad Model School • Smart Attendance Gateway
          </div>
        </div>
      </div>
    </div>
  );
}
