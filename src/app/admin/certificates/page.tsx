'use client';

import React, { useState, useEffect } from 'react';
import { Award, Search, Plus, Printer, ShieldCheck } from 'lucide-react';
import PrintableCertificate from '@/components/common/PrintableCertificate';

export default function AdminCertificatesPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [certType, setCertType] = useState<'BONAFIDE' | 'CHARACTER' | 'LEAVING' | 'TRANSFER'>('BONAFIDE');
  const [purpose, setPurpose] = useState('Passport / Visa Application');
  const [remarks, setRemarks] = useState('Exemplary character, disciplined conduct, and active participation.');
  const [generatedCert, setGeneratedCert] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/students')
      .then((res) => res.json())
      .then((data) => {
        if (data.students && data.students.length > 0) {
          setStudents(data.students);
          setSelectedStudent(data.students[0]);
        }
      })
      .catch(console.error);

    fetch('/api/certificates')
      .then((res) => res.json())
      .then((data) => {
        if (data.certificates) setCertificates(data.certificates);
      })
      .catch(console.error);
  }, []);

  const handleGenerateCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    setLoading(true);

    try {
      const res = await fetch('/api/certificates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: selectedStudent.id,
          type: certType,
          purpose,
          remarks,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setGeneratedCert(data.certificate);
      } else {
        alert(data.error || 'Failed to generate certificate');
      }
    } catch {
      alert('Error generating certificate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
            Document Center
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
            Official School Certificate Studio
          </h1>
          <p className="text-xs text-slate-500">
            Generate and verify Bonafide, Character, School Leaving, and Transfer Certificates with QR authentication.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Certificate Config Form */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 border-b pb-2">
            Configure Certificate Parameters
          </h3>

          <form onSubmit={handleGenerateCertificate} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Select Student *</label>
              <select
                value={selectedStudent?.id || ''}
                onChange={(e) => {
                  const s = students.find((st) => st.id === e.target.value);
                  setSelectedStudent(s);
                  setGeneratedCert(null);
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium outline-none focus:ring-2 focus:ring-amber-500"
              >
                {students.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.fullName} — {st.class?.name} ({st.rollNo})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Certificate Type *</label>
              <select
                value={certType}
                onChange={(e) => setCertType(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="BONAFIDE">Bonafide Certificate</option>
                <option value="CHARACTER">Character Certificate</option>
                <option value="LEAVING">School Leaving Certificate (SLC)</option>
                <option value="TRANSFER">School Transfer Certificate</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Purpose of Certificate</label>
              <input
                type="text"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="e.g. Passport, Admission, Scholarship"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Character Assessment & Remarks</label>
              <textarea
                rows={3}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold rounded-xl shadow flex items-center justify-center gap-2"
            >
              {loading ? <span className="animate-spin">⏳</span> : <Award className="w-4 h-4" />}
              <span>Generate Official Certificate</span>
            </button>
          </form>
        </div>

        {/* Right: Live Certificate Preview */}
        <div className="lg:col-span-7">
          {selectedStudent ? (
            <PrintableCertificate
              certificate={{
                certificateNo: generatedCert?.certificateNo || 'THMS-BON-2026-00042',
                type: certType,
                issueDate: new Date(),
                purpose,
                remarks,
                qrToken: generatedCert?.qrToken || `THMS-CERT-DEMO-${selectedStudent.studentId}`,
              }}
              student={{
                studentId: selectedStudent.studentId,
                admissionNo: selectedStudent.admissionNo,
                rollNo: selectedStudent.rollNo,
                fullName: selectedStudent.fullName,
                fatherName: selectedStudent.parent?.fatherName || 'Dr. Tariq Mehmood',
                className: selectedStudent.class?.name || 'Class 8',
                sectionName: selectedStudent.section?.name || 'Section A',
                dob: selectedStudent.dob || '2012-05-14',
              }}
            />
          ) : (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-slate-400 text-xs">
              Select student to generate certificate.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
