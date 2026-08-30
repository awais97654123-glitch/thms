'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Users, 
  LayoutDashboard, 
  CalendarCheck, 
  Award, 
  DollarSign, 
  BookOpen, 
  Check, 
  ChevronDown,
  ArrowLeft,
  Home,
  LogOut
} from 'lucide-react';
import Header from '@/components/common/Header';

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [parent, setParent] = React.useState<any | null>(null);

  React.useEffect(() => {
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
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Parent Session Top Bar */}
      <div className="bg-slate-900 text-white px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          {!isMainDashboard ? (
            <button
              onClick={handleBack}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold transition-all border border-slate-700 active:scale-95"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <Link
              href="/"
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg font-medium transition-all"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Website</span>
            </Link>
          )}
          <span className="font-bold text-amber-400">Parent Portal</span>
        </div>

        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white rounded-lg font-semibold transition-all border border-red-500/30 text-[11px]"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Leave Session / Logout</span>
        </button>
      </div>

      <Header />

      {/* Parent Sub-bar */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">
                {parent ? `Parent & Guardian Portal — ${parent.fatherName}` : 'Parent Portal'}
              </p>
              <p className="text-[10px] text-slate-500">
                {parent?.students ? `${parent.students.length} Enrolled Children` : 'Family Monitoring Dashboard'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
}
