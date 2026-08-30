'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { 
  ArrowLeft, 
  LogOut, 
  Home, 
  School, 
  Calendar, 
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import Header from '@/components/common/Header';
import Sidebar from '@/components/common/Sidebar';
import OfflineSyncBar from '@/components/common/OfflineSyncBar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const isMainDashboard = pathname === '/admin';

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/admin');
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
      {/* Universal Admin Session Bar with Back Button & Leave Session */}
      <div className="bg-slate-900 text-white px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-2">
          {!isMainDashboard ? (
            <button
              onClick={handleBack}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold transition-all shadow-sm border border-slate-700 active:scale-95"
              title="Go back to previous page"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <Link
              href="/"
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg font-medium transition-all"
              title="View Public Website"
            >
              <Home className="w-3.5 h-3.5" />
              <span>School Website</span>
            </Link>
          )}

          <div className="hidden sm:flex items-center gap-1.5 text-slate-400 pl-2 border-l border-slate-800">
            <School className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-semibold text-slate-200">The Hayatabad Model School</span>
            <ChevronRight className="w-3 h-3 text-slate-600" />
            <span className="text-blue-400 font-bold">Admin Portal</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Session: 2026-2027</span>
          </div>

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white rounded-lg font-semibold transition-all border border-red-500/30 text-[11px]"
            title="Leave current session"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Leave Session / Logout</span>
          </button>
        </div>
      </div>

      {/* Main App Layout */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Responsive Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          role="SUPER_ADMIN"
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col lg:pl-72 min-w-0">
          {/* Offline Sync State Bar */}
          <OfflineSyncBar />

          <Header
            user={{
              username: 'admin',
              role: 'SUPER_ADMIN',
              fullName: 'Super Admin',
              email: 'admin@hayatabadmodel.edu.pk',
            }}
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          />

          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
