'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { 
  ArrowLeft, 
  LogOut, 
  Home, 
  School, 
  Sparkles,
  ChevronRight,
  ShieldCheck
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
    <div className="min-h-screen bg-[#f8fafc] flex flex-col mesh-glow-bg subtle-grid text-slate-900">
      {/* Universal Session Control Strip */}
      <div className="bg-slate-950/90 text-white px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 sticky top-0 z-40 backdrop-blur-xl shadow-md">
        <div className="flex items-center gap-2">
          {!isMainDashboard ? (
            <button
              onClick={handleBack}
              className="inline-flex items-center gap-1 px-3 py-1 bg-slate-800/80 hover:bg-slate-700 text-white rounded-xl font-bold transition-all shadow-sm border border-slate-700/80 active:scale-95 text-xs"
              title="Go back to previous page"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl font-semibold transition-all border border-slate-700/80 text-xs"
              title="View Public Website"
            >
              <Home className="w-3.5 h-3.5 text-cyan-400" />
              <span>School Website</span>
            </Link>
          )}

          <div className="hidden sm:flex items-center gap-2 text-slate-400 pl-3 border-l border-slate-800">
            <span className="font-extrabold text-white text-xs">The Hayatabad Model School</span>
            <ChevronRight className="w-3 h-3 text-slate-600" />
            <span className="text-cyan-400 font-bold text-xs">Admin Control Center</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-extrabold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]"></span>
            <span>Session: 2026-2027</span>
          </div>

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-500/10 hover:bg-rose-600 text-rose-300 hover:text-white rounded-xl font-bold transition-all border border-rose-500/30 text-[11px] active:scale-95"
            title="Leave current session"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Admin App Layout */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Responsive Floating Glass Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          role="SUPER_ADMIN"
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col lg:pl-72 min-w-0">
          <OfflineSyncBar />

          <Header
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          />

          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
