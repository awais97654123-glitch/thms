'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Users, 
  LogOut, 
  Sparkles, 
  Menu, 
  X, 
  ShieldCheck, 
  DollarSign, 
  CalendarCheck, 
  BookOpen
} from 'lucide-react';

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

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error(e);
    }
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col text-slate-900 selection:bg-orange-500 selection:text-white">
      {/* DEDICATED PARENT PORTAL HEADER (No public website navbar) */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-2xl border-b border-orange-500/10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          
          {/* Left: 3D School Logo + Parent Portal Title */}
          <div className="flex items-center gap-3">
            <Link href="/parent" className="flex items-center gap-3 group">
              <img
                src="/logo.png"
                alt="THMS"
                className="h-12 sm:h-14 w-auto object-contain drop-shadow-[0_2px_8px_rgba(249,115,22,0.25)] group-hover:scale-105 transition-transform"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-slate-900 text-sm sm:text-base tracking-tight block">
                    The Hayatabad Model School
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider hidden sm:inline-block">
                    Parent Guardian Portal
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">
                  {parent ? `${parent.fatherName || 'Parent'} • Registered Guardian` : 'Guardian Portal'}
                </p>
              </div>
            </Link>
          </div>

          {/* Right: Parent Avatar + Sign Out */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 p-1.5 pr-3 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white font-black flex items-center justify-center text-xs shadow-md">
                {parent?.fatherName?.charAt(0).toUpperCase() || 'P'}
              </div>
              <div className="text-left hidden md:block">
                <p className="text-xs font-black text-slate-900 leading-tight">
                  {parent?.fatherName || 'Parent'}
                </p>
                <p className="text-[10px] text-emerald-600 font-mono font-bold">
                  {parent?.cnic || 'CNIC Verified'}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-2.5 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
        {children}
      </main>
    </div>
  );
}
