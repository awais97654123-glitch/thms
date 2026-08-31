'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Users, 
  MapPin, 
  GraduationCap, 
  FileText, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles,
  Phone,
  Mail,
  Building2,
  Calendar
} from 'lucide-react';
import Header from '@/components/common/Header';

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

export default function AdmissionApplyPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [classes, setClasses] = useState<any[]>(INITIAL_CLASSES);
  const [loading, setLoading] = useState(false);
  const [submittedApp, setSubmittedApp] = useState<any | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Student
    firstName: '',
    middleName: '',
    lastName: '',
    dob: '2012-04-15',
    gender: 'MALE',
    bloodGroup: 'B+',
    nationality: 'Pakistani',
    photoUrl: '',
    
    // Step 2: Parents
    fatherName: '',
    fatherPhone: '',
    fatherEmail: '',
    fatherOccupation: '',
    fatherCnic: '',
    motherName: '',
    motherPhone: '',
    guardianName: '',
    guardianPhone: '',

    // Step 3: Address & Emergency
    houseStreet: '',
    area: '',
    city: 'Peshawar',
    district: 'Peshawar',
    province: 'KPK',
    postalCode: '25000',
    emergencyName: '',
    emergencyRelation: 'Father',
    emergencyPhone: '',

    // Step 4: Academic
    applyingClassId: INITIAL_CLASSES[10].id, // Default Class 8
    preferredSectionId: '',
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
      .catch((err) => console.warn('Using standard class roster for admissions:', err));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    setStep((prev) => Math.min(5, prev + 1));
  };

  const handleBack = () => {
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/admissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSubmittedApp(data);
        setStep(5);
      } else {
        alert(data.error || 'Failed to submit admission application');
      }
    } catch (err) {
      console.error(err);
      alert('Error submitting application');
    } finally {
      setLoading(false);
    }
  };

  const stepTitles = [
    'Student Information',
    'Parents / Guardian',
    'Address & Emergency',
    'Academic History',
    'Review & Submit',
  ];

  return (
    <div className="min-h-screen bg-[#ffffff] bg-white flex flex-col selection:bg-blue-600 selection:text-white">
      <Header />

      <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-10">
        {/* Breadcrumb / Title */}
        <div className="text-center mb-8 space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#0a192f] border border-blue-500/30 text-blue-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            Online Admission Gateway 2026–2027
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            The Hayatabad Model School Admission Portal
          </h1>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Please fill in accurate details. You will receive an official application tracking code upon completion.
          </p>
        </div>

        {/* Multi-step progress bar */}
        {!submittedApp && (
          <div className="mb-8 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              {stepTitles.map((title, idx) => (
                <div key={idx} className="flex flex-col items-center flex-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow transition-all ${
                      step === idx + 1
                        ? 'bg-blue-600 text-white ring-4 ring-blue-500/20 border border-blue-500'
                        : step > idx + 1
                        ? 'bg-blue-600 text-white font-black'
                        : 'bg-slate-100 text-slate-400 border border-slate-200'
                    }`}
                  >
                    {step > idx + 1 ? '✓' : idx + 1}
                  </div>
                  <span className="text-[10px] text-slate-600 mt-1 font-semibold hidden sm:block text-center">
                    {title}
                  </span>
                </div>
              ))}
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#0a192f] to-blue-600 h-full transition-all duration-300"
                style={{ width: `${((step - 1) / 4) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Step Container Form */}
        <div className="academic-card bg-white rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-200">
          {submittedApp ? (
            /* Submission Success Screen */
            <div className="text-center py-8 space-y-6">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-extrabold text-slate-900">
                  Admission Application Submitted!
                </h2>
                <p className="text-xs text-slate-600 max-w-md mx-auto">
                  Your application has been received by the Admissions Office of The Hayatabad Model School.
                </p>
              </div>

              <div className="max-w-sm mx-auto bg-blue-50 border-2 border-dashed border-blue-300 rounded-2xl p-4">
                <span className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider block">
                  Application Tracking Number
                </span>
                <p className="text-xl font-mono font-extrabold text-blue-950 mt-1">
                  {submittedApp.applicationNo}
                </p>
                <p className="text-[10px] text-slate-500 mt-1">
                  Save this tracking code to check status anytime.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
                <Link
                  href={`/admissions/track?appNo=${submittedApp.applicationNo}`}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow transition-all"
                >
                  Track Application Status
                </Link>
                <Link
                  href="/"
                  className="px-6 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all"
                >
                  Return to Home
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* STEP 1: STUDENT INFO */}
              {step === 1 && (
                <div className="space-y-4 animate-in fade-in">
                  <h3 className="text-sm font-bold text-slate-900 border-b pb-2 flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-600" />
                    <span>Step 1: Student Personal Information</span>
                  </h3>

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
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
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
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
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

                  {/* Required Passport Photo Upload */}
                  <div className="pt-2 border-t border-slate-100">
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Student Passport-Size Photo * <span className="text-[10px] text-red-600 font-semibold">(Mandatory for Student ID Card & Digital Badge)</span>
                    </label>
                    <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/40">
                      {formData.photoUrl ? (
                        <div className="relative group">
                          <img
                            src={formData.photoUrl}
                            alt="Student Passport Preview"
                            className="w-24 h-28 object-cover rounded-xl border-2 border-blue-600 shadow-md"
                          />
                          <button
                            type="button"
                            onClick={() => setFormData((prev) => ({ ...prev, photoUrl: '' }))}
                            className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 shadow hover:bg-red-700 text-[10px]"
                            title="Remove photo"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div className="w-24 h-28 rounded-xl border border-slate-300 bg-white flex flex-col items-center justify-center text-slate-400 text-center p-2">
                          <User className="w-8 h-8 mb-1 text-slate-300" />
                          <span className="text-[9px] font-bold">Passport Photo</span>
                        </div>
                      )}

                      <div className="flex-1 space-y-1.5 text-center sm:text-left">
                        <p className="text-xs font-bold text-slate-900">Upload or Select Official Student Photo</p>
                        <p className="text-[11px] text-slate-500">
                          Supported formats: JPG, PNG, WebP (Max 5MB). Photo will appear on formal enrollment credentials.
                        </p>
                        <div className="flex flex-wrap gap-2 pt-1 justify-center sm:justify-start">
                          <label className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow cursor-pointer transition-all">
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
              )}

              {/* STEP 2: PARENTS INFO */}
              {step === 2 && (
                <div className="space-y-4 animate-in fade-in">
                  <h3 className="text-sm font-bold text-slate-900 border-b pb-2 flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-600" />
                    <span>Step 2: Parent / Guardian Information</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Father Full Name *</label>
                      <input
                        type="text"
                        name="fatherName"
                        required
                        value={formData.fatherName}
                        onChange={handleChange}
                        placeholder="e.g. Dr. Kamran Khan Durrani"
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
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Father Email</label>
                      <input
                        type="email"
                        name="fatherEmail"
                        value={formData.fatherEmail}
                        onChange={handleChange}
                        placeholder="e.g. father@gmail.com"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Father Occupation</label>
                      <input
                        type="text"
                        name="fatherOccupation"
                        value={formData.fatherOccupation}
                        onChange={handleChange}
                        placeholder="e.g. Engineer / Doctor / Business"
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Mother Name</label>
                      <input
                        type="text"
                        name="motherName"
                        value={formData.motherName}
                        onChange={handleChange}
                        placeholder="e.g. Shazia Durrani"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Mother Phone</label>
                      <input
                        type="tel"
                        name="motherPhone"
                        value={formData.motherPhone}
                        onChange={handleChange}
                        placeholder="e.g. +92 333 9876543"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: ADDRESS & EMERGENCY */}
              {step === 3 && (
                <div className="space-y-4 animate-in fade-in">
                  <h3 className="text-sm font-bold text-slate-900 border-b pb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-amber-600" />
                    <span>Step 3: Residential Address & Emergency Contact</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">House / Street Address *</label>
                      <input
                        type="text"
                        name="houseStreet"
                        required
                        value={formData.houseStreet}
                        onChange={handleChange}
                        placeholder="e.g. House 42, Street 7, Sector F-3"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Phase / Area *</label>
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

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">District / Province</label>
                      <input
                        type="text"
                        name="province"
                        value={formData.province}
                        onChange={handleChange}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Postal Code</label>
                      <input
                        type="text"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleChange}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Emergency Contact Person</label>
                      <input
                        type="text"
                        name="emergencyName"
                        value={formData.emergencyName}
                        onChange={handleChange}
                        placeholder="e.g. Uncle / Father"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Emergency Phone *</label>
                      <input
                        type="tel"
                        name="emergencyPhone"
                        required
                        value={formData.emergencyPhone}
                        onChange={handleChange}
                        placeholder="e.g. +92 333 5551122"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: ACADEMIC INFO */}
              {step === 4 && (
                <div className="space-y-4 animate-in fade-in">
                  <h3 className="text-sm font-bold text-slate-900 border-b pb-2 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-purple-600" />
                    <span>Step 4: Academic Information & Class Applying For</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Applying Class *</label>
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
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white font-medium"
                      >
                        {classes.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} {c.code ? `(${c.code})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Section</label>
                      <select
                        name="preferredSectionId"
                        value={formData.preferredSectionId}
                        onChange={handleChange}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white font-medium"
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
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Previous Class Passed</label>
                      <input
                        type="text"
                        name="previousClass"
                        value={formData.previousClass}
                        onChange={handleChange}
                        placeholder="e.g. Class 7"
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
                        placeholder="e.g. 88% / Grade A+"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 5: REVIEW */}
              {step === 5 && (
                <div className="space-y-4 animate-in fade-in">
                  <h3 className="text-sm font-bold text-slate-900 border-b pb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span>Step 5: Review & Confirmation</span>
                  </h3>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 text-xs">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      <div>
                        <span className="text-slate-500 block text-[10px]">Student Name:</span>
                        <strong className="text-slate-900">{formData.firstName} {formData.middleName} {formData.lastName}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Date of Birth:</span>
                        <strong className="text-slate-900">{formData.dob} ({formData.gender})</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Blood Group:</span>
                        <strong className="text-red-700">{formData.bloodGroup}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Father Name:</span>
                        <strong className="text-slate-900">{formData.fatherName}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Father Phone:</span>
                        <strong className="text-slate-900">{formData.fatherPhone}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Address:</span>
                        <strong className="text-slate-900">{formData.houseStreet}, {formData.area}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px] flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <span>
                      By submitting this form, you confirm that all entered details are genuine. You will be scheduled for assessment / interview upon verification.
                    </span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-6 border-t border-slate-200 mt-6">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>
                ) : (
                  <div></div>
                )}

                {step < 5 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow transition-all"
                  >
                    <span>Continue Step</span>
                    <ArrowRight className="w-4 h-4 text-white" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-3 rounded-xl text-white text-xs font-bold flex items-center gap-2 btn-blue-prestige shadow-lg shadow-blue-600/30 transition-all"
                  >
                    {loading ? <span className="animate-spin">⏳</span> : <CheckCircle2 className="w-4 h-4" />}
                    <span>Submit Official Admission Application</span>
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
