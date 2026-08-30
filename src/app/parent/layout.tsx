'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Users, 
  LogOut, 
  ArrowLeft, 
  Home,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import Header from '@/components/common/Header';

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [parent, setParent] = useState<any | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user?.parent) {
          setParent(data.user.parent);
        }
      })
      .catch(console.error);
  }, []);

  const isMainDashboard = pathname === '/parent';

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/parent');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error(e);
    }
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col mesh-glow-bg subtle-grid text-slate-900">
      {/* Session Strip */}
      <div className="bg-slate-950/90 text-white px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 sticky top-0 z-40 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          {!isMainDashboard ? (
            <button
              onClick={handleBack}
              className="inline-flex items-center gap-1 px-3 py-1 bg-slate-800/80 hover:bg-slate-700 text-white rounded-xl font-bold transition-all shadow-sm border border-slate-700/80 active:scale-95 text-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl font-semibold transition-all border border-slate-700/80 text-xs"
            >
              <Home className="w-3.5 h-3.5 text-cyan-400" />
              <span>Website</span>
            </Link>
          )}
          <div className="hidden sm:flex items-center gap-2 text-slate-400 pl-3 border-l border-slate-800">
            <span className="font-extrabold text-white text-xs">The Hayatabad Model School</span>
            <ChevronRight className="w-3 h-3 text-slate-600" />
            <span className="text-amber-400 font-bold text-xs">Parent & Family Portal</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-500/10 hover:bg-rose-600 text-rose-300 hover:text-white rounded-xl font-bold transition-all border border-rose-500/30 text-[11px] active:scale-95"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      <Header />

      {/* Floating Glass Parent Navigation Sub-bar */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-3 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white shadow-md shadow-amber-500/20">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-900">
                {parent ? `Family Portal — ${parent.fatherName}` : 'Parent & Guardian Portal'}
              </p>
              <p className="text-[11px] text-slate-500 font-medium">
                {parent?.students ? `${parent.students.length} Enrolled Children in Academic Roster` : 'Family Monitoring Dashboard'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
        {children}
      </main>
    </div>
  );
}
