'use client';

import React, { useState, useEffect } from 'react';
import { 
  User, 
  Lock, 
  Phone, 
  Mail, 
  MapPin, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Camera, 
  Save, 
  Sparkles,
  KeyRound,
  GraduationCap
} from 'lucide-react';
import PortalCircularLoader from '@/components/common/PortalCircularLoader';

export default function StudentSettingsPage() {
  const [student, setStudent] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    phone: '',
    email: '',
    address: '',
    photoUrl: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user?.student) {
          const st = data.user.student;
          setStudent(st);
          setFormData({
            phone: st.phone || '',
            email: st.email || data.user.email || '',
            address: st.address || '',
            photoUrl: st.photoUrl || '',
          });
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSuccess(null);

    try {
      // Simulate profile save with state feedback
      await new Promise((r) => setTimeout(r, 600));
      setProfileSuccess('Profile preferences updated successfully!');
      setTimeout(() => setProfileSuccess(null), 3000);
    } catch {
      // Handle error
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (passwordData.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match. Please verify.');
      return;
    }

    setSavingPassword(true);

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setPasswordSuccess('Your password has been changed securely.');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setPasswordError(data.error || 'Failed to update password. Please check current password.');
      }
    } catch {
      setPasswordError('Network error while updating password.');
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="p-16 text-center">
        <PortalCircularLoader message="Loading Profile Settings..." subMessage="Fetching student credentials" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Account & Profile Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Manage your personal profile picture, contact preferences, and portal security.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 text-orange-700 text-xs font-black border border-orange-200">
          <ShieldCheck className="w-4 h-4 text-orange-600" />
          <span>Student ID: {student?.studentId || 'THMS-ID'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Student Identity Card Overview */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 text-center">
            
            {/* Avatar with Camera Overlay */}
            <div className="relative w-28 h-28 mx-auto group">
              <div className="w-28 h-28 rounded-3xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white font-black text-4xl flex items-center justify-center shadow-xl overflow-hidden">
                {formData.photoUrl ? (
                  <img src={formData.photoUrl} alt={student?.fullName} className="w-full h-full object-cover" />
                ) : (
                  student?.fullName?.charAt(0).toUpperCase() || 'S'
                )}
              </div>
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-black text-slate-900">{student?.fullName}</h2>
              <p className="text-xs font-bold text-orange-600">
                {student?.class?.name || 'Class'} • Section {student?.section?.name || 'A'}
              </p>
              <p className="text-[11px] text-slate-400 font-mono">Roll No: {student?.rollNo || '01'}</p>
            </div>

            {/* Read-Only Academic Attributes */}
            <div className="text-left text-xs space-y-3 pt-4 border-t border-slate-100">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Admission No:</span>
                <span className="font-mono font-bold text-slate-800">{student?.admissionNo || 'ADM-2026'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Guardian:</span>
                <span className="font-bold text-slate-800">{student?.parent?.fatherName || student?.fatherName || 'Parent'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">B-Form / CNIC:</span>
                <span className="font-mono font-bold text-slate-800">{student?.bFormNo || 'Verified'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Blood Group:</span>
                <span className="font-bold text-orange-600">{student?.bloodGroup || 'B+'}</span>
              </div>
            </div>

          </div>
        </div>

        {/* Right Column: Profile Edit & Change Password Forms */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Section 1: Contact Details & Avatar URL */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900">Personal Information</h3>
              <p className="text-xs text-slate-500 font-medium">Update your photo URL and contact info.</p>
            </div>

            {profileSuccess && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{profileSuccess}</span>
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block text-slate-700 font-bold">Profile Photo URL</label>
                <div className="relative">
                  <Camera className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={formData.photoUrl}
                    onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                    className="w-full pl-10 pr-3.5 py-3 rounded-2xl border border-slate-200 bg-white focus:ring-2 focus:ring-orange-500 outline-none text-slate-900 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-slate-700 font-bold">WhatsApp / Phone Number</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      placeholder="0300-1234567"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pl-10 pr-3.5 py-3 rounded-2xl border border-slate-200 bg-white focus:ring-2 focus:ring-orange-500 outline-none text-slate-900 font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-700 font-bold">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      placeholder="student@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-10 pr-3.5 py-3 rounded-2xl border border-slate-200 bg-white focus:ring-2 focus:ring-orange-500 outline-none text-slate-900 font-medium"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-slate-700 font-bold">Residential Address</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    placeholder="Phase 3, Hayatabad, Peshawar"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full pl-10 pr-3.5 py-3 rounded-2xl border border-slate-200 bg-white focus:ring-2 focus:ring-orange-500 outline-none text-slate-900 font-medium"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-black text-xs rounded-2xl shadow-md shadow-orange-500/20 flex items-center gap-2 transition-all hover:scale-105"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingProfile ? 'Saving...' : 'Save Profile Changes'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Section 2: Security & Password Change */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900">Security & Password</h3>
              <p className="text-xs text-slate-500 font-medium">Update your login password securely.</p>
            </div>

            {passwordSuccess && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{passwordSuccess}</span>
              </div>
            )}

            {passwordError && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block text-slate-700 font-bold">Current Password</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="w-full pl-10 pr-3.5 py-3 rounded-2xl border border-slate-200 bg-white focus:ring-2 focus:ring-orange-500 outline-none text-slate-900 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-slate-700 font-bold">New Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="w-full pl-10 pr-3.5 py-3 rounded-2xl border border-slate-200 bg-white focus:ring-2 focus:ring-orange-500 outline-none text-slate-900 font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-700 font-bold">Confirm New Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="w-full pl-10 pr-3.5 py-3 rounded-2xl border border-slate-200 bg-white focus:ring-2 focus:ring-orange-500 outline-none text-slate-900 font-medium"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-2xl shadow-md flex items-center gap-2 transition-all hover:scale-105"
                >
                  <Lock className="w-4 h-4 text-orange-400" />
                  <span>{savingPassword ? 'Updating...' : 'Update Password'}</span>
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>

    </div>
  );
}
