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
      }
    } catch {
      setError('A network error occurred during authentication. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-between text-slate-900 relative overflow-hidden mesh-glow-bg subtle-grid">
      {/* Background Ambient Glow Orbs */}
      <div className="absolute top-10 left-10 w-[500px] h-[500px] bg-gradient-to-tr from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-gradient-to-br from-amber-500/10 to-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Top Floating Glass Bar */}
      <header className="p-4 sm:p-6 max-w-7xl w-full mx-auto flex items-center justify-between z-10">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-cyan-500 to-indigo-600 p-0.5 shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center p-1">
              <img
                src="/school-logo.png"
                alt="THMS Crest"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
          <div>
            <span className="font-extrabold text-sm text-slate-900 tracking-tight block">
              The Hayatabad Model School
            </span>
            <span className="text-[11px] text-slate-500 block font-medium">
              Unified Authentication Gateway
            </span>
          </div>
        </Link>

        <Link
          href="/"
          className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white/80 hover:bg-white border border-slate-200 shadow-sm backdrop-blur-md transition-all hover:scale-[1.02]"
        >
          ← Back to Website
        </Link>
      </header>

      {/* Center 2-Column SaaS Layout */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-12 relative z-10">
        <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Branding & Feature Highlights */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-200 text-blue-700 text-xs font-extrabold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
              <span>Next-Gen Cloud School ERP</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                Empowering Students. <br />
                <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-600 bg-clip-text text-transparent">
                  Building Tomorrow.
                </span>
              </h1>
              <p className="text-sm text-slate-600 leading-relaxed max-w-lg font-medium">
                One centralized portal connecting School Administrators, Faculty, Students, and Parents with real-time academic records, automated fee vouchers, and smart QR attendance.
              </p>
            </div>

            {/* Feature Bullets */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-white/70 backdrop-blur-md border border-white/80 shadow-sm space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Real-Time Records</span>
                </div>
                <p className="text-[11px] text-slate-500">Live grades & attendance</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/70 backdrop-blur-md border border-white/80 shadow-sm space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  <span>Role Protected</span>
                </div>
                <p className="text-[11px] text-slate-500">Encrypted JWT sessions</p>
              </div>
            </div>

            {/* Supported Portals Pill Showcase */}
            <div className="pt-2">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                Unified Portal Access For
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-xl text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/80 shadow-sm">
                  Super Admin
                </span>
                <span className="px-3 py-1 rounded-xl text-xs font-bold bg-cyan-50 text-cyan-700 border border-cyan-200/80 shadow-sm">
                  Teachers & Faculty
                </span>
                <span className="px-3 py-1 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/80 shadow-sm">
                  Students (Class 1-10)
                </span>
                <span className="px-3 py-1 rounded-xl text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200/80 shadow-sm">
                  Parents & Guardians
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: High-Fidelity Glass Login Card */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="w-full max-w-md bg-white/85 backdrop-blur-2xl border border-white rounded-3xl p-8 sm:p-10 shadow-[0_20px_50px_rgba(37,99,235,0.08)] space-y-6">
              
              <div className="text-left space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
                  <ShieldCheck className="w-3 h-3 text-blue-600" />
                  <span>Secure SSL Gateway</span>
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  Welcome Back
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Enter your credentials to access your designated school workspace.
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs flex items-center gap-2.5 animate-in fade-in">
                  <ShieldAlert className="w-4 h-4 flex-shrink-0 text-rose-500" />
                  <span className="font-medium">{error}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                    Username / ID / Email
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      required
                      autoFocus
                      placeholder="admin, THMS-2026-..., or phone"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50/70 border border-slate-200 rounded-2xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15 transition-all font-mono"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-extrabold text-slate-700">
                      Password
                    </label>
                    <Link href="/forgot-password" className="text-[11px] text-blue-600 hover:text-blue-700 font-bold transition-colors">
                      Forgot Password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50/70 border border-slate-200 rounded-2xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15 transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 active:scale-[0.99] disabled:opacity-50 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 mt-2 group"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      <span>Verifying Session...</span>
                    </span>
                  ) : (
                    <>
                      <span>Sign In to School Portal</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </>
                  )}
                </button>
              </form>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                <span>The Hayatabad Model School</span>
                <span className="flex items-center gap-1 text-emerald-600 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Online
                </span>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 sm:p-6 text-center text-xs text-slate-500 font-medium z-10">
        © {new Date().getFullYear()} The Hayatabad Model School, Peshawar • BISE Peshawar Affiliated
      </footer>
    </div>
  );
}
