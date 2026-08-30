'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  GraduationCap, 
  Lock, 
  User, 
  ArrowRight, 
  ShieldAlert, 
  ShieldCheck
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
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
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between text-slate-100 relative overflow-hidden">
      {/* Background Ambient Lights */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Top Simple Bar */}
      <header className="p-6 flex items-center justify-between z-10 max-w-7xl w-full mx-auto">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-white flex items-center justify-center p-0.5 shadow-md border border-slate-700">
            <img
              src="/school-logo.png"
              alt="THMS Crest"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <span className="font-extrabold text-sm text-white tracking-tight block">The Hayatabad Model School</span>
            <span className="text-[10px] text-slate-400 block">Unified School Portal Gateway</span>
          </div>
        </Link>

        <Link
          href="/"
          className="text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          ← Back to Website
        </Link>
      </header>

      {/* Center Form Card */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative z-10">
        <div className="max-w-md w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl backdrop-blur-2xl space-y-6">
          {/* Brand Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl overflow-hidden bg-white/95 p-1 shadow-lg border-2 border-blue-500/40 mb-1">
              <img
                src="/school-logo.png"
                alt="The Hayatabad Model School Crest"
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Sign In to Your Account
            </h1>
            <p className="text-xs text-slate-400">
              Enter your authorized username, Student ID, or Teacher ID and password.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-300 text-xs flex items-center gap-2.5 animate-in fade-in">
              <ShieldAlert className="w-4 h-4 flex-shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Username / Student ID / Teacher ID / Email
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="Enter your assigned username or ID"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-300">
                  Password
                </label>
                <Link href="/forgot-password" className="text-[11px] text-blue-400 hover:underline font-semibold">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 active:scale-[0.99] disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <span className="animate-spin">⏳</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-slate-800/80 text-center text-[11px] text-slate-500">
            Protected by The Hayatabad Model School Role-Based Security Gateway
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="p-6 text-center text-xs text-slate-500 z-10">
        © {new Date().getFullYear()} The Hayatabad Model School • All rights reserved.
      </footer>
    </div>
  );
}
