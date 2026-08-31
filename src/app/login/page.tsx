'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Lock, 
  User, 
  ArrowRight, 
  ShieldAlert, 
  ShieldCheck, 
  Sparkles, 
  GraduationCap, 
  Users, 
  Building2, 
  CheckCircle2 
} from 'lucide-react';
import PortalCircularLoader from '@/components/common/PortalCircularLoader';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (data.user.isFirstLogin) {
          window.location.href = '/change-password';
        } else {
          window.location.href = data.redirectUrl || '/admin';
        }
      } else {
        setError(data.error || 'Invalid username or password. Please check your credentials.');
        setLoading(false);
      }
    } catch {
      setError('A network error occurred during authentication. Please try again.');
      setLoading(false);
    }
  };

  const handleQuickFill = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div className="min-h-screen bg-[#ffffff] flex flex-col justify-between text-slate-900 relative overflow-hidden">
      {/* Background Ambient Glow Orbs */}
      <div className="absolute top-10 left-10 w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-indigo-400/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Top Floating Header */}
      <header className="p-4 sm:p-6 max-w-7xl w-full mx-auto flex items-center justify-between z-10">
        <Link href="/" className="flex items-center gap-3 group">
          <img
            src="/logo.png"
            alt="THMS"
            className="h-12 w-auto object-contain drop-shadow-[0_2px_8px_rgba(37,99,235,0.2)] group-hover:scale-105 transition-transform"
          />
          <div>
            <span className="font-black text-sm text-slate-900 tracking-tight block">
              The Hayatabad Model School
            </span>
            <span className="text-[11px] text-blue-700 block font-bold">
              Central Portal Authentication Gateway
            </span>
          </div>
        </Link>

        <Link
          href="/"
          className="px-4 py-2 rounded-2xl text-xs font-bold text-slate-700 bg-white hover:bg-blue-50 border border-slate-200 shadow-sm transition-all hover:scale-105"
        >
          ← Back to Website
        </Link>
      </header>

      {/* Center 2-Column Layout */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-12 relative z-10">
        <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Branding & Overview */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100 border border-blue-200 text-blue-800 text-xs font-black backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
              <span>Session 2026-2027 Academic Network</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                Single Sign-On for All Portals & Roles
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                Seamless role-based access for School Principals, Subject Faculty, Students, and Parents. Encrypted authentication on Neon PostgreSQL.
              </p>
            </div>

            {/* Role Features Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="glass-panel p-3.5 rounded-2xl border border-slate-200 bg-white/80 space-y-1">
                <span className="text-blue-600 font-black flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" /> Admin Control
                </span>
                <p className="text-[11px] text-slate-500 font-medium">Admissions, 3-copy fee billing & gate scanning</p>
              </div>

              <div className="glass-panel p-3.5 rounded-2xl border border-slate-200 bg-white/80 space-y-1">
                <span className="text-blue-600 font-black flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" /> Teacher Hub
                </span>
                <p className="text-[11px] text-slate-500 font-medium">Daily attendance, homework tasks & marks</p>
              </div>

              <div className="glass-panel p-3.5 rounded-2xl border border-slate-200 bg-white/80 space-y-1">
                <span className="text-indigo-600 font-black flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5" /> Student Desk
                </span>
                <p className="text-[11px] text-slate-500 font-medium">Exam report card, timetable & digital ID</p>
              </div>

              <div className="glass-panel p-3.5 rounded-2xl border border-slate-200 bg-white/80 space-y-1">
                <span className="text-emerald-600 font-black flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" /> Parent Portal
                </span>
                <p className="text-[11px] text-slate-500 font-medium">Gate check-in alerts & online fee receipts</p>
              </div>
            </div>

            {/* Quick Fill Credentials Bar */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                Quick 1-Tap Fill Credentials:
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickFill('admin', 'Admin@123')}
                  className="px-2.5 py-1 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 text-[11px] font-bold border border-blue-200 transition-colors"
                >
                  Super Admin
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('teacher.farooq', 'Teacher@123')}
                  className="px-2.5 py-1 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 text-[11px] font-bold border border-sky-200 transition-colors"
                >
                  Teacher
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('THMS-2026-000001', 'Student@123')}
                  className="px-2.5 py-1 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 text-[11px] font-bold border border-indigo-200 transition-colors"
                >
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('parent.tariq', 'Parent@123')}
                  className="px-2.5 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-200 transition-colors"
                >
                  Parent
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Glassmorphic Login Form */}
          <div className="lg:col-span-6">
            <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-slate-200 bg-white/95 shadow-2xl space-y-6">
              
              <div className="space-y-1.5 text-center">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  Sign In to Your Portal
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Enter your assigned username, Student ID, or mobile number
                </p>
              </div>

              {error && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2.5 animate-in fade-in">
                  <ShieldAlert className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="block text-slate-700 font-bold">
                    Username / ID / Phone
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. admin or THMS-2026-000001"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-3 rounded-2xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-slate-700 font-bold">
                      Password
                    </label>
                    <Link
                      href="/forgot-password"
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-700"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-3 rounded-2xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 font-medium"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-black text-sm shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2.5 transition-all hover:scale-[1.01] hover:shadow-blue-500/35 disabled:opacity-50 cursor-pointer"
                >
                  <span>Sign In to Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
                <span>Looking for new admission? </span>
                <Link
                  href="/admissions/apply"
                  className="font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
                >
                  <span>Apply Online ➔</span>
                </Link>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 sm:p-6 text-center text-xs text-slate-400 border-t border-slate-100">
        © 2026 The Hayatabad Model School, Peshawar. All rights reserved. Encrypted Portal Network.
      </footer>

      {/* DEDICATED FULL-SCREEN CENTERED PROGRESSIVE CIRCULAR LOADER */}
      {loading && (
        <PortalCircularLoader
          isFullScreen
          message="Authenticating Credentials..."
          subMessage="Verifying role permissions with PostgreSQL"
        />
      )}
    </div>
  );
}
