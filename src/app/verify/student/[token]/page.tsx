'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Building2, 
  GraduationCap, 
  Calendar, 
  Clock, 
  Sparkles, 
  ExternalLink,
  Lock,
  ArrowRight,
  RefreshCw
} from 'lucide-react';

export default function StudentPublicVerificationPage({
  params,
}: {
  params: { token: string };
}) {
  const { token } = params;
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any | null>(null);
  const [errorData, setErrorData] = useState<any | null>(null);

  useEffect(() => {
    if (!token) return;

    fetch(`/api/verify/student/${encodeURIComponent(token)}`)
      .then(async (res) => {
        const json = await res.json();
        if (res.ok && json.verified) {
          setData(json);
        } else {
          setErrorData(json);
        }
      })
      .catch((err) => {
        console.error(err);
        setErrorData({
          error: 'Unable to reach school verification server. Please verify your connection.',
          code: 'NETWORK_ERROR',
        });
      })
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col justify-between selection:bg-[#2563EB] selection:text-white">
      {/* Top Header Strip */}
      <header className="bg-[#0F2A5F] text-white border-b border-[#173B7A] px-4 py-3 sm:px-6 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <img
              src="/logo.png"
              alt="THMS Crest"
              className="h-9 w-auto object-contain drop-shadow-[0_2px_8px_rgba(37,99,235,0.3)]"
            />
            <div>
              <span className="font-extrabold text-sm sm:text-base tracking-tight block">
                The Hayatabad Model School
              </span>
              <span className="text-[10px] text-blue-200 block font-medium">
                Official Credential Verification Registry
              </span>
            </div>
          </Link>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2563EB]/25 text-blue-200 text-xs font-bold border border-[#2563EB]/40">
            <Lock className="w-3.5 h-3.5 text-blue-300" />
            <span>Cryptographically Verified</span>
          </span>
        </div>
      </header>

      {/* Main Verification Container */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12 flex items-center justify-center">
        {loading ? (
          <div className="bg-white rounded-3xl p-10 border border-[#E2E8F0] shadow-sm text-center space-y-4 w-full">
            <div className="w-12 h-12 rounded-full border-4 border-[#2563EB] border-t-transparent animate-spin mx-auto" />
            <div className="space-y-1">
              <h3 className="text-base font-bold text-[#0F172A]">
                Verifying Official Student Credentials...
              </h3>
              <p className="text-xs text-[#64748B]">
                Querying The Hayatabad Model School institutional registry
              </p>
            </div>
          </div>
        ) : errorData ? (
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-[#E2E8F0] shadow-md space-y-6 w-full text-center">
            {errorData.code === 'CARD_INACTIVE' ? (
              <>
                <div className="w-16 h-16 rounded-3xl bg-[#FEF3C7] text-[#D97706] flex items-center justify-center mx-auto shadow-sm">
                  <AlertTriangle className="w-8 h-8 text-[#D97706]" />
                </div>
                <div className="space-y-2">
                  <span className="inline-block px-3 py-1 rounded-full bg-[#FEF3C7] text-[#92400E] text-xs font-black uppercase tracking-wider border border-[#FCD34D]">
                    Card Status: {errorData.cardStatus || 'INACTIVE'}
                  </span>
                  <h2 className="text-2xl font-black text-[#0F172A]">
                    Student ID Card Inactive
                  </h2>
                  <p className="text-xs sm:text-sm text-[#475569] max-w-md mx-auto leading-relaxed">
                    This identity card has been marked as <strong>{errorData.cardStatus}</strong> by the school registrar. It is no longer valid for official entry or academic verification.
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-3xl bg-[#FEE2E2] text-[#DC2626] flex items-center justify-center mx-auto shadow-sm">
                  <XCircle className="w-8 h-8 text-[#DC2626]" />
                </div>
                <div className="space-y-2">
                  <span className="inline-block px-3 py-1 rounded-full bg-[#FEE2E2] text-[#991B1B] text-xs font-black uppercase tracking-wider border border-[#FECACA]">
                    Verification Failed
                  </span>
                  <h2 className="text-2xl font-black text-[#0F172A]">
                    Credential Not Verified
                  </h2>
                  <p className="text-xs sm:text-sm text-[#475569] max-w-md mx-auto leading-relaxed">
                    This QR code could not be verified with our registrar. The card may be expired, revoked, or an unauthenticated duplicate.
                  </p>
                </div>
              </>
            )}

            <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs text-[#64748B] space-y-1 text-left">
              <p className="font-bold text-[#0F172A]">Security Notice:</p>
              <p>
                If you believe this status is in error, please contact the Administration Office at <strong>+92 91 5828100</strong> with the physical card.
              </p>
            </div>

            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0F2A5F] hover:bg-[#173B7A] text-white text-xs font-bold transition-colors shadow-sm"
            >
              <span>Return to School Website</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : data && data.student ? (
          <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-md overflow-hidden w-full space-y-6">
            {/* Verification Success Header Banner */}
            <div className="bg-gradient-to-r from-[#0F2A5F] via-[#173B7A] to-[#2563EB] text-white p-6 sm:p-8 text-center space-y-3 relative">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#16A34A]/20 text-[#4ADE80] text-xs font-black uppercase tracking-wider border border-[#16A34A]/40 backdrop-blur-md">
                <CheckCircle2 className="w-4 h-4 text-[#4ADE80]" />
                <span>Verified Student Record</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Official Student Identity
              </h2>
              <p className="text-xs text-blue-100/90 font-medium">
                The Hayatabad Model School Registry • Session {data.student.session?.name || '2026-2027'}
              </p>
            </div>

            {/* Student Dossier Body */}
            <div className="p-6 sm:p-8 pt-0 space-y-6">
              {/* Photo & Primary Bio */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-[#F8FAFC] border-2 border-[#2563EB]/40 shadow-sm overflow-hidden shrink-0">
                  <img
                    src={data.student.photoUrl}
                    alt={data.student.fullName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <h3 className="text-xl font-black text-[#0F172A]">
                      {data.student.fullName}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]">
                      {data.student.enrollmentStatus}
                    </span>
                  </div>
                  <p className="text-xs text-[#475569] font-medium">
                    Student ID: <strong className="font-mono text-[#0F172A]">{data.student.studentId}</strong>
                  </p>
                  <p className="text-xs text-[#475569] font-medium">
                    Roll Number: <strong className="font-mono text-[#0F172A]">{data.student.rollNo}</strong>
                  </p>
                  <p className="text-xs text-[#64748B]">
                    Academic Wing: <strong>{data.student.class?.name}</strong> • Section: <strong>{data.student.section?.name}</strong>
                  </p>
                </div>
              </div>

              {/* Verified Attributes Table */}
              <div className="divide-y divide-[#E2E8F0] border border-[#E2E8F0] rounded-2xl overflow-hidden text-xs">
                <div className="grid grid-cols-2 p-3 bg-[#F8FAFC]">
                  <span className="font-bold text-[#64748B]">Verification Result</span>
                  <span className="font-bold text-[#16A34A] flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>AUTHENTIC & VERIFIED</span>
                  </span>
                </div>
                <div className="grid grid-cols-2 p-3">
                  <span className="text-[#64748B]">Card Validity Status</span>
                  <span className="font-bold text-[#2563EB] font-mono">
                    {data.student.cardStatus} (OFFICIAL ID)
                  </span>
                </div>
                <div className="grid grid-cols-2 p-3 bg-[#F8FAFC]">
                  <span className="text-[#64748B]">Academic Class</span>
                  <span className="font-bold text-[#0F172A]">
                    {data.student.class?.name} ({data.student.section?.name})
                  </span>
                </div>
                <div className="grid grid-cols-2 p-3">
                  <span className="text-[#64748B]">Blood Group</span>
                  <span className="font-bold text-[#0F172A] font-mono">
                    {data.student.bloodGroup}
                  </span>
                </div>
                <div className="grid grid-cols-2 p-3 bg-[#F8FAFC]">
                  <span className="text-[#64748B]">Verification Timestamp</span>
                  <span className="text-[#475569] font-mono">
                    {new Date(data.verifiedAt).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Institutional Assurance Strip */}
              <div className="p-4 rounded-2xl bg-[#EFF6FF] border border-[#BFDBFE] text-xs text-[#1E3A8A] flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-[#2563EB] shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-bold">Official Campus Document Assurance</p>
                  <p className="text-[11px] text-[#334155] leading-relaxed">
                    This document was cryptographically validated by The Hayatabad Model School server registry. In compliance with student privacy protocols, sensitive financial and personal details are suppressed.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E2E8F0] bg-white py-4 px-4 text-center text-xs text-[#64748B]">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© 2026 The Hayatabad Model School • Peshawar, Pakistan</span>
          <span className="font-mono text-[11px] text-[#2563EB]">THMS Secure ID Engine v2.6</span>
        </div>
      </footer>
    </div>
  );
}
