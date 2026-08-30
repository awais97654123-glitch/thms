'use client';

import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Award, Printer, ShieldCheck } from 'lucide-react';

interface CertificateProps {
  certificate: {
    certificateNo: string;
    type: 'BONAFIDE' | 'CHARACTER' | 'LEAVING' | 'TRANSFER' | 'ENROLLMENT';
    issueDate: string | Date;
    validTill?: string | Date | null;
    purpose?: string | null;
    remarks?: string | null;
    qrToken: string;
  };
  student: {
    studentId: string;
    admissionNo: string;
    rollNo: string;
    fullName: string;
    fatherName: string;
    className: string;
    sectionName: string;
    dob: string | Date;
  };
  school?: {
    schoolName: string;
    address: string;
    principalName: string;
  };
}

export default function PrintableCertificate({
  certificate,
  student,
  school,
}: CertificateProps) {
  const [qrUrl, setQrUrl] = useState('');

  useEffect(() => {
    if (certificate.qrToken) {
      QRCode.toDataURL(certificate.qrToken, { width: 140, margin: 1 })
        .then((url) => setQrUrl(url))
        .catch(console.error);
    }
  }, [certificate.qrToken]);

  const schoolName = school?.schoolName || 'The Hayatabad Model School';
  const principalName = school?.principalName || 'Prof. Muhammad Tariq Khan';

  const getTitle = () => {
    switch (certificate.type) {
      case 'BONAFIDE':
        return 'BONAFIDE CERTIFICATE';
      case 'CHARACTER':
        return 'CHARACTER CERTIFICATE';
      case 'LEAVING':
        return 'SCHOOL LEAVING CERTIFICATE';
      case 'TRANSFER':
        return 'SCHOOL TRANSFER CERTIFICATE';
      default:
        return 'ENROLLMENT CERTIFICATE';
    }
  };

  return (
    <div className="space-y-4">
      {/* Control Action Bar */}
      <div className="no-print flex items-center justify-between bg-slate-900 text-white p-3 rounded-xl shadow">
        <div className="flex items-center gap-2 text-xs">
          <Award className="w-4 h-4 text-amber-400" />
          <span className="font-semibold">Official Certificate Generator</span>
        </div>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow transition-all"
        >
          <Printer className="w-4 h-4" />
          <span>Print Certificate</span>
        </button>
      </div>

      {/* Certificate Frame */}
      <div
        id="certificate-print"
        className="max-w-4xl mx-auto bg-[#faf8f5] p-10 sm:p-14 rounded-2xl shadow-2xl border-8 border-double border-amber-800/60 text-slate-900 relative"
      >
        {/* Inner Border Frame */}
        <div className="border border-amber-900/40 p-8 sm:p-12 rounded-xl relative">
          
          {/* Header */}
          <div className="text-center pb-6 border-b-2 border-amber-900/30">
            <div className="w-20 h-20 mx-auto rounded-2xl overflow-hidden bg-white flex items-center justify-center p-1 shadow-lg border border-amber-900/30 mb-3">
              <img
                src="/school-logo.png"
                alt="THMS Crest"
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-wide text-blue-950 font-serif">
              {schoolName}
            </h1>
            <p className="text-xs text-slate-600 font-medium mt-0.5">
              Phase 6, Hayatabad, Peshawar, Khyber Pakhtunkhwa, Pakistan
            </p>
            <p className="text-[11px] text-slate-500">
              Recognized & Registered with Directorate of Elementary & Secondary Education KPK
            </p>

            <div className="mt-5 inline-block px-6 py-1.5 rounded-full bg-amber-900 text-amber-50 text-sm font-serif font-bold uppercase tracking-widest shadow">
              {getTitle()}
            </div>
          </div>

          {/* Certificate Metadata Bar */}
          <div className="mt-4 flex items-center justify-between text-xs text-slate-600">
            <div>
              <span>Certificate No: </span>
              <strong className="font-mono text-slate-900">{certificate.certificateNo}</strong>
            </div>
            <div>
              <span>Date of Issue: </span>
              <strong className="text-slate-900">
                {new Date(certificate.issueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
              </strong>
            </div>
          </div>

          {/* Certificate Body Text */}
          <div className="mt-8 text-sm sm:text-base leading-loose font-serif text-slate-800 text-justify">
            <p>
              This is to certify that <strong>Mr./Ms. {student.fullName}</strong>, Son/Daughter of{' '}
              <strong>{student.fatherName}</strong>, bearing Student ID <strong>{student.studentId}</strong>{' '}
              and Roll Number <strong>{student.rollNo}</strong>, is / was a bona fide student of{' '}
              <strong>{schoolName}</strong> studying in <strong>{student.className} ({student.sectionName})</strong>.
            </p>
            <p className="mt-4">
              According to the school register, their date of birth is recorded as{' '}
              <strong>{new Date(student.dob).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>.
            </p>
            <p className="mt-4">
              During their tenure at this institution, their academic conduct, character, and moral discipline have been found to be{' '}
              <strong>{certificate.remarks || 'Exemplary and Outstanding'}</strong>. They actively participated in curricular and extracurricular pursuits.
            </p>
            {certificate.purpose && (
              <p className="mt-4 text-xs italic text-slate-600">
                This certificate is issued upon the request of the parent/guardian for the purpose of: <u>{certificate.purpose}</u>.
              </p>
            )}
          </div>

          {/* Footer & Signatures */}
          <div className="mt-14 pt-6 flex items-end justify-between text-xs">
            {/* QR Verification Seal */}
            <div className="flex items-center gap-3">
              {qrUrl && (
                <div className="p-1 bg-white border border-slate-300 rounded-lg shadow-sm">
                  <img src={qrUrl} alt="Verify Certificate QR" className="w-20 h-20" />
                </div>
              )}
              <div className="text-[10px] text-slate-500 max-w-[160px]">
                <ShieldCheck className="w-4 h-4 text-emerald-600 mb-0.5" />
                <span>Scan QR code to verify authenticity against school record ledger.</span>
              </div>
            </div>

            {/* School Seal */}
            <div className="text-center hidden sm:block">
              <div className="w-20 h-20 rounded-full border-2 border-dashed border-amber-900/40 flex items-center justify-center text-[10px] uppercase font-bold text-amber-900/60">
                Official Seal
              </div>
            </div>

            {/* Principal Signature */}
            <div className="text-center">
              <div className="h-10 flex items-end justify-center font-serif font-bold text-base text-blue-950">
                {principalName}
              </div>
              <div className="border-t-2 border-slate-900 pt-1 text-[11px] uppercase font-bold text-slate-700">
                Principal & Head of Institution
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
