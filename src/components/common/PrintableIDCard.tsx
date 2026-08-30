'use client';

import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Printer, Download, Sparkles, Shield, User, Phone, MapPin } from 'lucide-react';

interface StudentIDCardProps {
  student: {
    id: string;
    studentId: string;
    admissionNo: string;
    rollNo: string;
    fullName: string;
    photoUrl?: string | null;
    gender: string;
    bloodGroup?: string | null;
    dob?: string | Date;
    qrToken: string;
    class?: { name: string };
    section?: { name: string };
    session?: { name: string };
    parent?: {
      fatherName: string;
      fatherPhone: string;
      emergencyContact?: string | null;
    } | null;
  };
  school?: {
    schoolName: string;
    phone: string;
    address: string;
    website: string;
  };
}

export default function PrintableIDCard({ student, school }: StudentIDCardProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    if (student.qrToken) {
      QRCode.toDataURL(student.qrToken, {
        width: 180,
        margin: 1,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error(err));
    }
  }, [student.qrToken]);

  const handlePrint = () => {
    window.print();
  };

  const schoolName = school?.schoolName || 'The Hayatabad Model School';
  const schoolPhone = school?.phone || '+92 91 5828100';
  const schoolAddress = school?.address || 'Phase 6, Hayatabad, Peshawar';

  return (
    <div className="space-y-4">
      {/* Control Action Bar */}
      <div className="no-print flex items-center justify-between bg-slate-900 text-white p-3 rounded-xl shadow">
        <div className="flex items-center gap-2 text-xs">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="font-semibold">Official Student Identity Card (Dual Sided)</span>
          <span className="text-slate-400">| Standard CR80 Dimensions</span>
        </div>
        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow transition-all"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Save PDF</span>
        </button>
      </div>

      {/* ID Cards Layout (Front & Back) */}
      <div className="flex flex-wrap items-center justify-center gap-8 p-6 bg-slate-100 rounded-2xl border border-slate-200">
        
        {/* ================= ID CARD FRONT ================= */}
        <div
          id="id-card-front"
          className="w-[340px] h-[520px] bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-300 flex flex-col justify-between relative"
          style={{
            backgroundImage: 'radial-gradient(#3b82f6 0.5px, transparent 0.5px)',
            backgroundSize: '12px 12px',
          }}
        >
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-800 text-white p-4 text-center relative overflow-hidden shadow">
            <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-emerald-500/20 rounded-full blur-lg"></div>
            <div className="w-10 h-10 mx-auto mb-1.5 rounded-lg bg-white overflow-hidden p-0.5 flex items-center justify-center shadow">
              <img
                src="/school-logo.png"
                alt="THMS Crest"
                className="w-full h-full object-contain"
              />
            </div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider leading-tight">
              {schoolName}
            </h3>
            <p className="text-[9px] text-blue-200 mt-0.5">
              Sector F-4, Phase 6, Hayatabad, Peshawar
            </p>
            <div className="mt-1.5 inline-block px-2.5 py-0.5 rounded-full bg-emerald-500 text-white text-[9px] font-bold tracking-widest uppercase">
              STUDENT CARD
            </div>
          </div>

          {/* Student Photo & Details */}
          <div className="px-5 py-2 flex flex-col items-center flex-1 justify-center text-center">
            <div className="w-24 h-28 rounded-xl bg-slate-100 border-2 border-blue-600 shadow-md overflow-hidden flex items-center justify-center mb-2.5 relative">
              {student.photoUrl ? (
                <img
                  src={student.photoUrl}
                  alt={student.fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-400">
                  <User className="w-12 h-12 text-slate-300" />
                  <span className="text-[9px] font-medium text-slate-400">PHOTO</span>
                </div>
              )}
              {student.bloodGroup && (
                <span className="absolute bottom-1 right-1 px-1.5 py-0.2 bg-red-600 text-white text-[9px] font-extrabold rounded shadow">
                  {student.bloodGroup}
                </span>
              )}
            </div>

            <h4 className="text-sm font-bold text-slate-900 tracking-tight">
              {student.fullName}
            </h4>
            <p className="text-[11px] text-slate-600 font-medium">
              S/D of {student.parent?.fatherName || 'N/A'}
            </p>

            {/* Grid specs */}
            <div className="w-full mt-3 grid grid-cols-2 gap-2 text-left bg-slate-50/80 p-2.5 rounded-xl border border-slate-200 text-[10px]">
              <div>
                <span className="text-slate-600 block">Student ID:</span>
                <span className="font-bold text-blue-900">{student.studentId}</span>
              </div>
              <div>
                <span className="text-slate-600 block">Admission No:</span>
                <span className="font-bold text-slate-800">{student.admissionNo}</span>
              </div>
              <div>
                <span className="text-slate-600 block">Class & Section:</span>
                <span className="font-bold text-slate-800">
                  {student.class?.name || 'Class 8'} - {student.section?.name || 'A'}
                </span>
              </div>
              <div>
                <span className="text-slate-600 block">Roll Number:</span>
                <span className="font-bold text-emerald-700">{student.rollNo}</span>
              </div>
            </div>
          </div>

          {/* Card Footer */}
          <div className="bg-slate-900 text-white px-4 py-2 flex items-center justify-between text-[9px]">
            <div>
              <span className="text-slate-400 block">Validity Session</span>
              <span className="font-bold text-amber-400">2026 — 2027</span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block">Principal Signature</span>
              <span className="font-serif italic font-bold text-slate-200">M. Tariq Khan</span>
            </div>
          </div>
        </div>

        {/* ================= ID CARD BACK ================= */}
        <div
          id="id-card-back"
          className="w-[340px] h-[520px] bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-300 flex flex-col justify-between relative p-5 text-center"
        >
          {/* Top Back Header */}
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-900 border border-blue-200 text-[10px] font-bold uppercase">
              <Shield className="w-3 h-3 text-blue-600" />
              <span>Official Student Identity Verification</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-2">
              Scan this secure QR code for automated school gate attendance & identity verification.
            </p>
          </div>

          {/* QR Code Container */}
          <div className="my-2 flex flex-col items-center justify-center">
            <div className="p-2.5 bg-white rounded-xl shadow-md border-2 border-slate-900 inline-block">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="Student Attendance QR"
                  className="w-32 h-32 object-contain"
                />
              ) : (
                <div className="w-32 h-32 flex items-center justify-center bg-slate-100 text-xs text-slate-400">
                  Loading QR...
                </div>
              )}
            </div>
            <span className="text-[9px] font-mono text-slate-500 mt-1.5 tracking-wider font-semibold">
              TOKEN: {student.qrToken.substring(0, 20)}...
            </span>
          </div>

          {/* Emergency & Rules */}
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-left text-[9px] space-y-1 text-slate-600">
            <div className="flex items-center gap-1 text-red-600 font-bold">
              <Phone className="w-3 h-3" />
              <span>EMERGENCY HELPLINE: {student.parent?.fatherPhone || schoolPhone}</span>
            </div>
            <p className="text-slate-500 leading-tight">
              1. This card is non-transferable and must be worn inside campus.
            </p>
            <p className="text-slate-500 leading-tight">
              2. In case of loss, report immediately to the administration office.
            </p>
            <p className="text-slate-500 leading-tight">
              3. If found, please return to: {schoolAddress}.
            </p>
          </div>

          {/* Bottom Contact */}
          <div className="text-[9px] text-slate-500 pt-2 border-t border-slate-200">
            <p className="font-semibold text-slate-700">{schoolName}</p>
            <p>Phone: {schoolPhone} • Web: {school?.website || 'www.hayatabadmodel.edu.pk'}</p>
          </div>
        </div>

      </div>
    </div>
  );
}
