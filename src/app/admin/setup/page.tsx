'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Building2, 
  UserCheck, 
  Layers, 
  GraduationCap, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Printer, 
  Sparkles, 
  Key,
  ShieldCheck
} from 'lucide-react';

export default function SchoolSetupWizardPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [completedResult, setCompletedResult] = useState<any | null>(null);

  // Form State
  const [schoolInfo, setSchoolInfo] = useState({
    schoolName: 'The Hayatabad Model School',
    tagline: 'Excellence in Education, Character & Innovation',
    phone: '+92 91 5812345',
    email: 'info@hayatabadmodel.edu.pk',
    website: 'https://hayatabadmodel.edu.pk',
    address: 'Sector F-4, Phase 6, Hayatabad, Peshawar, KPK',
    principalName: 'Prof. Dr. Muhammad Tariq Khan',
  });

  const [adminInfo, setAdminInfo] = useState({
    fullName: 'System Administrator',
    username: 'admin',
    email: 'admin@hayatabadmodel.edu.pk',
    password: 'Admin@123',
  });

  const [academicStructure, setAcademicStructure] = useState({
    sessionName: 'Academic Session 2026-2027',
  });

  const [firstTeacher, setFirstTeacher] = useState({
    fullName: 'Engr. Farooq Ahmad',
    employeeId: 'THMS-T-0001',
    email: 'farooq.ahmad@hayatabadmodel.edu.pk',
    phone: '+92 333 9123456',
    qualification: 'M.Sc. Mathematics',
    designation: 'Senior Faculty Head (Mathematics)',
    tempPassword: 'Teacher@123',
  });

  const handleFinishSetup = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schoolInfo,
          adminInfo,
          academicStructure,
          firstTeacher,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setCompletedResult(data.result);
        setCurrentStep(5); // Success step
      } else {
        alert(data.error || 'Failed to complete setup');
      }
    } catch {
      alert('Error connecting to setup service');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { num: 1, label: 'School Profile', icon: Building2 },
    { num: 2, label: 'Admin Account', icon: ShieldCheck },
    { num: 3, label: 'Academic Structure', icon: Layers },
    { num: 4, label: 'First Teacher', icon: UserCheck },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex flex-col items-center justify-center p-4 sm:p-6">
      {/* Header Branding */}
      <div className="text-center mb-8 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>First-Time System Initialization</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Welcome to The Hayatabad Model School
        </h1>
        <p className="text-xs sm:text-sm text-slate-300">
          Let's configure your school ERP parameters in 4 guided steps.
        </p>
      </div>

      {/* Main Wizard Card */}
      <div className="max-w-3xl w-full bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Step Indicators */}
        {currentStep <= 4 && (
          <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
            <div className="flex justify-between">
              {steps.map((st) => {
                const Icon = st.icon;
                const isCurrent = currentStep === st.num;
                const isPassed = currentStep > st.num;
                return (
                  <div key={st.num} className="flex items-center gap-2">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isPassed
                          ? 'bg-emerald-600 text-white'
                          : isCurrent
                          ? 'bg-blue-600 text-white shadow-md ring-4 ring-blue-100'
                          : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      {isPassed ? <CheckCircle2 className="w-4 h-4" /> : st.num}
                    </div>
                    <span
                      className={`text-xs font-bold hidden sm:inline ${
                        isCurrent ? 'text-blue-900' : isPassed ? 'text-emerald-800' : 'text-slate-400'
                      }`}
                    >
                      {st.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Wizard Form Steps */}
        <div className="p-6 sm:p-8">
          {/* STEP 1: School Profile */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <span className="text-[10px] uppercase font-bold text-blue-600 block">Step 1 of 4</span>
                <h2 className="text-lg font-bold text-slate-900">School Identity & Institutional Profile</h2>
                <p className="text-xs text-slate-500">Official credentials shown on ID cards, report cards, and receipts.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">School Name *</label>
                  <input
                    type="text"
                    required
                    value={schoolInfo.schoolName}
                    onChange={(e) => setSchoolInfo({ ...schoolInfo, schoolName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Motto / Tagline</label>
                  <input
                    type="text"
                    value={schoolInfo.tagline}
                    onChange={(e) => setSchoolInfo({ ...schoolInfo, tagline: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Official Phone *</label>
                  <input
                    type="text"
                    value={schoolInfo.phone}
                    onChange={(e) => setSchoolInfo({ ...schoolInfo, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Official Email *</label>
                  <input
                    type="email"
                    value={schoolInfo.email}
                    onChange={(e) => setSchoolInfo({ ...schoolInfo, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Campus Physical Address</label>
                  <input
                    type="text"
                    value={schoolInfo.address}
                    onChange={(e) => setSchoolInfo({ ...schoolInfo, address: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Admin Profile */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <span className="text-[10px] uppercase font-bold text-blue-600 block">Step 2 of 4</span>
                <h2 className="text-lg font-bold text-slate-900">Create Primary Super Admin Account</h2>
                <p className="text-xs text-slate-500">Master credentials for managing school ERP and Windows desktop application.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={adminInfo.fullName}
                    onChange={(e) => setAdminInfo({ ...adminInfo, fullName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Admin Username *</label>
                  <input
                    type="text"
                    value={adminInfo.username}
                    onChange={(e) => setAdminInfo({ ...adminInfo, username: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Official Email</label>
                  <input
                    type="email"
                    value={adminInfo.email}
                    onChange={(e) => setAdminInfo({ ...adminInfo, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Secure Password *</label>
                  <input
                    type="password"
                    value={adminInfo.password}
                    onChange={(e) => setAdminInfo({ ...adminInfo, password: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Academic Structure */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <span className="text-[10px] uppercase font-bold text-blue-600 block">Step 3 of 4</span>
                <h2 className="text-lg font-bold text-slate-900">Academic Hierarchy & Grade Levels</h2>
                <p className="text-xs text-slate-500">Initializes standard academic session and class structure (Nursery through Class 10).</p>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 text-xs text-blue-950 space-y-2">
                <p className="font-semibold">Academic Session: <strong>{academicStructure.sessionName}</strong></p>
                <p className="text-[11px] text-blue-800">
                  Classes to be automatically provisioned with Section A & Section B:
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {['Nursery', 'Prep', 'Class 1', 'Class 2', 'Class 3', 'Class 5', 'Class 8', 'Class 9', 'Class 10'].map((c) => (
                    <span key={c} className="px-2.5 py-0.5 bg-white font-bold rounded-lg border border-blue-200 shadow-sm text-[10px]">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: First Teacher */}
          {currentStep === 4 && (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <span className="text-[10px] uppercase font-bold text-blue-600 block">Step 4 of 4</span>
                <h2 className="text-lg font-bold text-slate-900">Add Your First Faculty Teacher</h2>
                <p className="text-xs text-slate-500">Automatically creates teacher profile and mobile portal account.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Teacher Full Name *</label>
                  <input
                    type="text"
                    value={firstTeacher.fullName}
                    onChange={(e) => setFirstTeacher({ ...firstTeacher, fullName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Employee ID *</label>
                  <input
                    type="text"
                    value={firstTeacher.employeeId}
                    onChange={(e) => setFirstTeacher({ ...firstTeacher, employeeId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={firstTeacher.email}
                    onChange={(e) => setFirstTeacher({ ...firstTeacher, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Temporary Password</label>
                  <input
                    type="password"
                    value={firstTeacher.tempPassword}
                    onChange={(e) => setFirstTeacher({ ...firstTeacher, tempPassword: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Success & Credentials Card */}
          {currentStep === 5 && completedResult && (
            <div className="space-y-6 text-center animate-in zoom-in-95">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h2 className="text-xl font-extrabold text-slate-900">School Setup Completed!</h2>
                <p className="text-xs text-slate-500 mt-1">
                  The Hayatabad Model School is now ready for operations.
                </p>
              </div>

              {completedResult.teacherCredentials && (
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-left text-xs space-y-3 max-w-md mx-auto">
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="font-bold text-slate-900">Teacher Login Slip</span>
                    <button
                      onClick={() => window.print()}
                      className="text-blue-600 font-bold flex items-center gap-1 hover:underline"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print Slip</span>
                    </button>
                  </div>
                  <p>Faculty: <strong>{completedResult.teacherCredentials.fullName}</strong></p>
                  <p>Employee ID: <code className="font-bold font-mono">{completedResult.teacherCredentials.employeeId}</code></p>
                  <p>Portal Username: <code className="font-bold font-mono">{completedResult.teacherCredentials.username}</code></p>
                  <p>Temp Password: <code className="font-mono bg-white px-2 py-0.5 rounded border">{completedResult.teacherCredentials.temporaryPassword}</code></p>
                </div>
              )}

              <div className="pt-4 flex justify-center gap-3">
                <Link
                  href="/admin"
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-lg transition-all"
                >
                  Enter Admin ERP Dashboard
                </Link>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          {currentStep <= 4 && (
            <div className="flex items-center justify-between border-t border-slate-100 pt-6 mt-6">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep((prev) => prev - 1)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
              ) : (
                <div></div>
              )}

              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep((prev) => prev + 1)}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow flex items-center gap-1.5"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleFinishSetup}
                  className="px-8 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow flex items-center gap-2"
                >
                  {loading ? <span className="animate-spin">⏳</span> : <Sparkles className="w-4 h-4" />}
                  <span>Finish Setup & Launch ERP</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
