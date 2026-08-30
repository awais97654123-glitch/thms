'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  UserPlus, 
  ArrowLeft, 
  Sparkles, 
  CheckCircle2, 
  CreditCard, 
  UserCheck, 
  User, 
  Users, 
  MapPin, 
  GraduationCap, 
  Camera, 
  FileText,
  DollarSign,
  QrCode,
  Check
} from 'lucide-react';
import { recordOfflineAction } from '@/lib/offline-sync';

const INITIAL_CLASSES = [
  { id: 'c-pg', name: 'Playgroup (Pre-School)', code: 'PG', sections: [{ id: 'sec-a', name: 'Section A' }] },
  { id: 'c-nur', name: 'Nursery (Early Years)', code: 'NUR', sections: [{ id: 'sec-a', name: 'Section A' }] },
  { id: 'c-prep', name: 'Prep (Kindergarten)', code: 'PREP', sections: [{ id: 'sec-a', name: 'Section A' }] },
  { id: 'c-01', name: 'Class 1', code: 'C01', sections: [{ id: 'sec-a', name: 'Section A' }] },
  { id: 'c-02', name: 'Class 2', code: 'C02', sections: [{ id: 'sec-a', name: 'Section A' }] },
  { id: 'c-03', name: 'Class 3', code: 'C03', sections: [{ id: 'sec-a', name: 'Section A' }] },
  { id: 'c-04', name: 'Class 4', code: 'C04', sections: [{ id: 'sec-a', name: 'Section A' }] },
  { id: 'c-05', name: 'Class 5', code: 'C05', sections: [{ id: 'sec-a', name: 'Section A' }] },
  { id: 'c-06', name: 'Class 6', code: 'C06', sections: [{ id: 'sec-a', name: 'Section A' }, { id: 'sec-b', name: 'Section B' }] },
  { id: 'c-07', name: 'Class 7', code: 'C07', sections: [{ id: 'sec-a', name: 'Section A' }, { id: 'sec-b', name: 'Section B' }] },
  { id: 'c-08', name: 'Class 8', code: 'C08', sections: [{ id: 'sec-a', name: 'Section A' }, { id: 'sec-b', name: 'Section B' }] },
  { id: 'c-09', name: 'Class 9 (Science)', code: 'C09', sections: [{ id: 'sec-a', name: 'Section A' }, { id: 'sec-b', name: 'Section B' }] },
  { id: 'c-10', name: 'Class 10 (Science)', code: 'C10', sections: [{ id: 'sec-a', name: 'Section A' }, { id: 'sec-b', name: 'Section B' }] },
];

export default function AdminNewAdmissionPage() {
  const router = useRouter();
  const [classes, setClasses] = useState<any[]>(INITIAL_CLASSES);
  const [loading, setLoading] = useState(false);
  const [enrollDirectly, setEnrollDirectly] = useState(true);
  const [enrollmentResult, setEnrollmentResult] = useState<any | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    // Student Info
    firstName: '',
    middleName: '',
    lastName: '',
    dob: '2014-05-10',
    gender: 'MALE',
    bloodGroup: 'B+',
    nationality: 'Pakistani',
    photoUrl: '',
    
    // Parents
    fatherName: '',
    fatherPhone: '',
    fatherEmail: '',
    fatherOccupation: '',
    fatherCnic: '',
    motherName: '',
    motherPhone: '',

    // Address
    houseStreet: '',
    area: '',
    city: 'Peshawar',
    district: 'Peshawar',
    province: 'KPK',
    postalCode: '25000',
    emergencyName: '',
    emergencyRelation: 'Father',
    emergencyPhone: '',

    // Academic
    applyingClassId: INITIAL_CLASSES[10].id, // Default to Class 8
    preferredSectionId: '',
    customRollNo: '',
    previousSchool: '',
    previousClass: '',
    previousGrade: '',
  });

  useEffect(() => {
    fetch('/api/classes')
      .then((res) => res.json())
      .then((data) => {
        const liveList = Array.isArray(data.classes) ? data.classes : Array.isArray(data) ? data : [];
        if (liveList.length > 0) {
          setClasses(liveList);
          setFormData((prev) => {
            const match = liveList.find(
              (c: any) => c.id === prev.applyingClassId || c.code === 'C08' || c.name?.includes('8')
            );
            const targetClass = match || liveList[0];
            const defaultSection = targetClass?.sections?.[0]?.id || '';
            return { 
              ...prev, 
              applyingClassId: targetClass.id,
              preferredSectionId: prev.preferredSectionId || defaultSection,
            };
          });
        }
      })
      .catch((err) => console.warn('Using standard class roster:', err));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Submit Admission Application
      const res = await fetch('/api/admissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit admission form');
      }

      const appId = data.id;

      // 2. If direct 1-Click Enrollment is requested, trigger enrollment immediately
      if (enrollDirectly && appId) {
        const enrollRes = await fetch(`/api/admissions/${appId}/enroll`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sectionId: formData.preferredSectionId,
            customRollNo: formData.customRollNo,
          }),
        });

        const enrollData = await enrollRes.json();
        if (enrollRes.ok && enrollData.success) {
          setEnrollmentResult(enrollData.enrollment);
          // Also record in offline-sync audit tracker if needed
          recordOfflineAction('ADMISSION_AND_ENROLLMENT', {
            applicationNo: data.applicationNo,
            studentId: enrollData.enrollment.studentId,
            fullName: `${formData.firstName} ${formData.lastName}`.trim(),
            className: enrollData.enrollment.className,
          });
        } else {
          alert('Admission submitted, but automatic enrollment encountered an error: ' + (enrollData.error || ''));
          router.push('/admin/admissions');
        }
      } else {
        recordOfflineAction('ADMISSION_APPLICATION', {
          applicationNo: data.applicationNo,
          fullName: `${formData.firstName} ${formData.lastName}`.trim(),
        });
        alert(`Application ${data.applicationNo} registered successfully!`);
        router.push('/admin/admissions');
      }
    } catch (err: any) {
      console.error(err);
      // Offline fallback
      recordOfflineAction('OFFLINE_ADMISSION_QUEUED', formData);
      alert('Offline record saved to local outbox. Data will synchronize automatically when online.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <Link href="/admin" className="hover:text-blue-600">Admin</Link>
            <span>/</span>
            <Link href="/admin/admissions" className="hover:text-blue-600">Admissions</Link>
            <span>/</span>
            <span className="text-blue-600 font-bold">New In-App Admission</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <UserPlus className="w-6 h-6 text-blue-600" />
            <span>Direct Student Admission & Enrollment</span>
          </h1>
          <p className="text-xs text-slate-500">
            Register new students directly within the Admin ERP with instant ID Card and Portal account provisioning.
          </p>
        </div>

        <Link
          href="/admin/admissions"
          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Admissions Hub</span>
        </Link>
      </div>

      {/* Success Result Screen — Official Login Credentials Slip */}
      {enrollmentResult ? (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-emerald-400 shadow-2xl space-y-6 animate-in fade-in">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3 text-emerald-800">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-inner">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">Student Enrolled & Portal Accounts Created!</h2>
                <p className="text-xs text-emerald-700 font-medium">
                  Official login credentials have been generated for both the Student and Parent.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const text = `*THE HAYATABAD MODEL SCHOOL — LOGIN DETAILS*\nStudent: ${enrollmentResult.fullName}\nClass: ${enrollmentResult.className} (Roll ${enrollmentResult.rollNo})\nStudent ID: ${enrollmentResult.studentId}\n\n*STUDENT PORTAL LOGIN:*\nUsername: ${enrollmentResult.studentUsername || enrollmentResult.portalUsername}\nPassword: ${enrollmentResult.studentPassword || enrollmentResult.temporaryPassword}\n\n*PARENT PORTAL LOGIN:*\nUsername: ${enrollmentResult.parentUsername}\nPassword: ${enrollmentResult.parentPassword || 'Parent@123'}\n\n*PORTAL LINK:* http://localhost:3000/login`;
                  navigator.clipboard.writeText(text);
                  alert('Login credentials copied to clipboard for WhatsApp/SMS sharing!');
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5 transition-all"
              >
                <span>📱 Copy for WhatsApp / SMS</span>
              </button>

              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5 transition-all"
              >
                <span>🖨️ Print Credentials Slip</span>
              </button>
            </div>
          </div>

          {/* Printable Slip Container */}
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-6">
            {/* School Header Banner on Slip */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-3">
                <img src="/school-logo.png" alt="THMS" className="w-10 h-10 object-contain" />
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">The Hayatabad Model School</h3>
                  <p className="text-[10px] text-slate-500">Official Student & Parent Portal Login Slip (Session 2026-2027)</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-mono">Admission No:</span>
                <span className="text-xs font-bold text-slate-800 font-mono">{enrollmentResult.admissionNo}</span>
              </div>
            </div>

            {/* Student Basic Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-4 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">Student Full Name:</span>
                <strong className="text-slate-900 text-sm">{enrollmentResult.fullName}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Assigned Class & Section:</span>
                <strong className="text-purple-900 text-sm">{enrollmentResult.className} ({enrollmentResult.sectionName || 'Sec A'})</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Assigned Roll Number:</span>
                <strong className="text-blue-900 font-mono text-sm">{enrollmentResult.rollNo}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Initial Fee Voucher:</span>
                <strong className="text-emerald-700 font-mono text-sm">{enrollmentResult.invoiceNo} (Rs. {enrollmentResult.initialAmount})</strong>
              </div>
            </div>

            {/* Dual Credentials Cards: Student & Parent */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Student Credentials Card */}
              <div className="bg-blue-50/80 border-2 border-blue-200 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-blue-200 pb-2">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-blue-600" />
                    <h4 className="font-extrabold text-xs text-blue-950 uppercase tracking-wider">Student Portal Login</h4>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-blue-600 text-white text-[10px] font-bold">Student Account</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-blue-100">
                    <span className="text-slate-500 font-semibold">Portal Username:</span>
                    <strong className="font-mono text-blue-900 text-sm select-all">
                      {enrollmentResult.studentUsername || enrollmentResult.portalUsername}
                    </strong>
                  </div>

                  <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-blue-100">
                    <span className="text-slate-500 font-semibold">Initial Password:</span>
                    <strong className="font-mono text-red-600 text-sm select-all">
                      {enrollmentResult.studentPassword || enrollmentResult.temporaryPassword}
                    </strong>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span>Portal URL:</span>
                    <span className="font-mono text-blue-600 font-bold">http://localhost:3000/login</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    const text = `Username: ${enrollmentResult.studentUsername || enrollmentResult.portalUsername}\nPassword: ${enrollmentResult.studentPassword || enrollmentResult.temporaryPassword}\nLogin: http://localhost:3000/login`;
                    navigator.clipboard.writeText(text);
                    alert('Student login copied!');
                  }}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
                >
                  📋 Copy Student Login Only
                </button>
              </div>

              {/* Parent Credentials Card */}
              <div className="bg-amber-50/80 border-2 border-amber-200 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-amber-600" />
                    <h4 className="font-extrabold text-xs text-amber-950 uppercase tracking-wider">Parent Portal Login</h4>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-amber-600 text-white text-[10px] font-bold">Parent Account</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-amber-100">
                    <span className="text-slate-500 font-semibold">Portal Username:</span>
                    <strong className="font-mono text-amber-900 text-sm select-all">
                      {enrollmentResult.parentUsername || `parent.${formData.fatherPhone.replace(/\D/g, '').slice(-7)}`}
                    </strong>
                  </div>

                  <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-amber-100">
                    <span className="text-slate-500 font-semibold">Initial Password:</span>
                    <strong className="font-mono text-red-600 text-sm select-all">
                      {enrollmentResult.parentPassword || 'Parent@123'}
                    </strong>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span>Portal URL:</span>
                    <span className="font-mono text-amber-700 font-bold">http://localhost:3000/login</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    const text = `Username: ${enrollmentResult.parentUsername || `parent.${formData.fatherPhone.replace(/\D/g, '').slice(-7)}`}\nPassword: ${enrollmentResult.parentPassword || 'Parent@123'}\nLogin: http://localhost:3000/login`;
                    navigator.clipboard.writeText(text);
                    alert('Parent login copied!');
                  }}
                  className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
                >
                  📋 Copy Parent Login Only
                </button>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 text-center italic">
              ℹ️ Please advise the student and parent to change their password upon their first login.
            </p>
          </div>

          {/* Action Navigation */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/admin/id-cards"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/20 flex items-center gap-2"
            >
              <CreditCard className="w-4 h-4" />
              <span>Print Student ID Card</span>
            </Link>
            <Link
              href={`/admin/students/${enrollmentResult.studentId}`}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-2"
            >
              <UserCheck className="w-4 h-4" />
              <span>Open Student 360° Profile</span>
            </Link>
            <button
              onClick={() => {
                setEnrollmentResult(null);
                setFormData((prev) => ({
                  ...prev,
                  firstName: '',
                  middleName: '',
                  lastName: '',
                  photoUrl: '',
                  fatherName: '',
                  fatherPhone: '',
                }));
              }}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
            >
              + Admit Another Student
            </button>
          </div>
        </div>
      ) : (
        /* Form Card */
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-8">
          
          {/* Section 1: Student Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <User className="w-5 h-5 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                1. Student Personal Information
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">First Name *</label>
                <input
                  type="text"
                  name="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="e.g. Muhammad"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Middle Name</label>
                <input
                  type="text"
                  name="middleName"
                  value={formData.middleName}
                  onChange={handleChange}
                  placeholder="e.g. Ali"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Last Name *</label>
                <input
                  type="text"
                  name="lastName"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="e.g. Durrani"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Birth *</label>
                <input
                  type="date"
                  name="dob"
                  required
                  value={formData.dob}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Gender *</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Blood Group</label>
                <select
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>
            </div>

            {/* Passport Photo Box */}
            <div className="pt-2">
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Official Student Photo <span className="text-slate-400 font-normal">(Used on Student ID Card)</span>
              </label>
              <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/40">
                {formData.photoUrl ? (
                  <div className="relative">
                    <img
                      src={formData.photoUrl}
                      alt="Student"
                      className="w-20 h-24 object-cover rounded-xl border-2 border-blue-600 shadow"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, photoUrl: '' }))}
                      className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 shadow text-[10px]"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="w-20 h-24 rounded-xl border border-slate-300 bg-white flex flex-col items-center justify-center text-slate-400 p-2 text-center">
                    <Camera className="w-6 h-6 text-slate-300 mb-1" />
                    <span className="text-[9px] font-bold">Photo</span>
                  </div>
                )}
                <div className="flex-1 space-y-1 text-center sm:text-left">
                  <p className="text-xs font-bold text-slate-800">Upload Student Photo</p>
                  <div className="flex flex-wrap gap-2 pt-1 justify-center sm:justify-start">
                    <label className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow cursor-pointer transition-all">
                      Choose Photo File
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = () => {
                              setFormData((prev) => ({ ...prev, photoUrl: reader.result as string }));
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                    {!formData.photoUrl && (
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&h=350&fit=crop',
                          }))
                        }
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-all"
                      >
                        Use Sample Photo
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Parents & Emergency Contact */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Users className="w-5 h-5 text-emerald-600" />
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                2. Parents & Residential Information
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Father Full Name *</label>
                <input
                  type="text"
                  name="fatherName"
                  required
                  value={formData.fatherName}
                  onChange={handleChange}
                  placeholder="e.g. Dr. Kamran Khan"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Father Mobile Number *</label>
                <input
                  type="tel"
                  name="fatherPhone"
                  required
                  value={formData.fatherPhone}
                  onChange={handleChange}
                  placeholder="e.g. +92 333 9123456"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Father CNIC</label>
                <input
                  type="text"
                  name="fatherCnic"
                  value={formData.fatherCnic}
                  onChange={handleChange}
                  placeholder="e.g. 17301-1234567-1"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">House / Street Address *</label>
                <input
                  type="text"
                  name="houseStreet"
                  required
                  value={formData.houseStreet}
                  onChange={handleChange}
                  placeholder="e.g. House 42, Street 7"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Sector / Area *</label>
                <input
                  type="text"
                  name="area"
                  required
                  value={formData.area}
                  onChange={handleChange}
                  placeholder="e.g. Phase 6, Hayatabad"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Academic Placement */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-purple-600" />
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  3. Academic Class Placement & Previous School
                </h2>
              </div>
              <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200">
                {classes.length} Classes Available
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Assign Class *</label>
                <select
                  name="applyingClassId"
                  required
                  value={formData.applyingClassId}
                  onChange={(e) => {
                    const newClassId = e.target.value;
                    const matched = classes.find((c) => c.id === newClassId);
                    const firstSec = matched?.sections?.[0]?.id || '';
                    setFormData((prev) => ({
                      ...prev,
                      applyingClassId: newClassId,
                      preferredSectionId: firstSec,
                    }));
                  }}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.code ? `(${c.code})` : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Section</label>
                <select
                  name="preferredSectionId"
                  value={formData.preferredSectionId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {(() => {
                    const currentClass = classes.find((c) => c.id === formData.applyingClassId);
                    const sections = currentClass?.sections && currentClass.sections.length > 0
                      ? currentClass.sections
                      : [
                          { id: 'sec-a', name: 'Section A' },
                          { id: 'sec-b', name: 'Section B' },
                        ];
                    return sections.map((s: any) => (
                      <option key={s.id} value={s.id}>
                        {s.name} {s.roomNo ? `(${s.roomNo})` : ''}
                      </option>
                    ));
                  })()}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Custom Roll No <span className="text-slate-400 font-normal">(Leave blank for auto)</span>
                </label>
                <input
                  type="text"
                  name="customRollNo"
                  placeholder="Auto-generated e.g. 08-A-015"
                  value={formData.customRollNo}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Previous School Attended</label>
                <input
                  type="text"
                  name="previousSchool"
                  value={formData.previousSchool}
                  onChange={handleChange}
                  placeholder="e.g. Army Public School Peshawar"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Previous Grade / Marks %</label>
                <input
                  type="text"
                  name="previousGrade"
                  value={formData.previousGrade}
                  onChange={handleChange}
                  placeholder="e.g. 88% / Grade A"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 4: 1-Click Instant Enrollment Setting */}
          <div className="p-5 bg-gradient-to-r from-blue-50 via-indigo-50 to-emerald-50 rounded-2xl border-2 border-blue-200 flex items-start gap-3">
            <input
              type="checkbox"
              id="enrollDirectly"
              checked={enrollDirectly}
              onChange={(e) => setEnrollDirectly(e.target.checked)}
              className="w-5 h-5 rounded text-blue-600 mt-0.5 cursor-pointer"
            />
            <label htmlFor="enrollDirectly" className="cursor-pointer space-y-1">
              <span className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Instant 1-Click Complete Enrollment (Recommended)</span>
              </span>
              <p className="text-[11px] text-blue-800 leading-relaxed">
                Immediately assign official Student ID (<code>THMS-2026-XXXXXX</code>), roll number, generate student portal account credentials, initial monthly fee voucher, and prepare dual-sided QR ID Card.
              </p>
            </label>
          </div>

          {/* Form Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <Link
              href="/admin/admissions"
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-gradient-to-r from-blue-700 to-emerald-600 hover:from-blue-600 hover:to-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all"
            >
              {loading ? (
                <span className="animate-spin">⏳</span>
              ) : (
                <Check className="w-4 h-4" />
              )}
              <span>{enrollDirectly ? 'Submit & Enroll Student Now' : 'Save Admission Application'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
