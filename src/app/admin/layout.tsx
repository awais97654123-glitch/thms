'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { 
  ArrowLeft, 
  LogOut, 
  Home, 
  School, 
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Menu,
  User,
  Settings,
  Bell,
  Search,
  KeyRound,
  Eye,
  Bot
} from 'lucide-react';
import Sidebar from '@/components/common/Sidebar';
import OfflineSyncBar from '@/components/common/OfflineSyncBar';
import NotificationBell from '@/components/common/NotificationBell';
import GlobalStudentSearch from '@/components/admin/GlobalStudentSearch';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const isMainDashboard = pathname === '/admin';

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setCurrentUser(data.user);
        }
      })
      .catch(console.error);
  }, []);

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
    <div className="min-h-screen bg-[#f8fafc] flex flex-col text-slate-900 selection:bg-blue-600 selection:text-white">
      {/* Universal Session Control Strip (Prestige Royal Blue / Navy) */}
      <div className="bg-[#0a192f] text-white px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-2 border-b border-blue-900/60 sticky top-0 z-40 backdrop-blur-xl shadow-md">
        <div className="flex items-center gap-2">
          {!isMainDashboard ? (
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-1 px-3 py-1 bg-blue-900/40 hover:bg-blue-800/60 text-white rounded-xl font-bold transition-all shadow-sm border border-blue-700/60 active:scale-95 text-xs"
              title="Go back to previous page"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-900/40 hover:bg-blue-800/60 text-blue-200 hover:text-white rounded-xl font-semibold transition-all border border-blue-700/60 text-xs"
              title="View Public Website"
            >
              <Home className="w-3.5 h-3.5 text-cyan-400" />
              <span>School Website</span>
            </Link>
          )}

          <div className="hidden sm:flex items-center gap-2 text-slate-400 pl-3 border-l border-blue-900/80">
            <span className="font-extrabold text-white text-xs">The Hayatabad Model School</span>
            <ChevronRight className="w-3 h-3 text-slate-500" />
            <span className="text-blue-400 font-bold text-xs">Executive Admin Control Tower</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30 text-[11px] font-extrabold">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse shadow-[0_0_8px_#60a5fa]"></span>
            <span>Session: 2026–2027</span>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-500/15 hover:bg-rose-600 text-rose-300 hover:text-white rounded-xl font-bold transition-all border border-rose-500/30 text-[11px] active:scale-95"
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
          role={currentUser?.role || 'ADMIN'}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col lg:pl-72 min-w-0">
          <OfflineSyncBar />

          {/* DEDICATED ADMIN TOP NAVBAR (Replaces Public Website Header) */}
          <header className="sticky top-10 z-30 bg-white/95 backdrop-blur-2xl border-b border-slate-200/80 shadow-sm px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
            
            {/* Left: Mobile Sidebar Toggle + Global Student Search */}
            <div className="flex items-center gap-3 flex-1 max-w-2xl">
              <button
                type="button"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2.5 rounded-2xl bg-white hover:bg-blue-50 border border-slate-200 text-slate-700 shadow-sm lg:hidden transition-colors"
                title="Toggle Sidebar Menu"
              >
                <Menu className="w-5 h-5 text-slate-800" />
              </button>

              {/* Global Fast Student Search Bar */}
              <GlobalStudentSearch />
            </div>

            {/* Right: Quick Action Controls + Notifications + Admin Avatar */}
            <div className="flex items-center gap-2.5 shrink-0">
              <Link
                href="/admin/ai-insights"
                className="hidden xl:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-black transition-all hover:scale-105"
              >
                <Bot className="w-4 h-4 text-blue-600 animate-pulse" />
                <span>AI Insights</span>
              </Link>

              {/* Push & In-App Notification Bell */}
              <NotificationBell />

              {/* Admin Profile Chip */}
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <Link
                  href="/admin/settings"
                  className="flex items-center gap-2 p-1.5 pr-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 shadow-sm transition-all"
                >
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#0a192f] via-[#1e3a8a] to-[#2563eb] text-white font-black flex items-center justify-center text-xs shadow-md border border-white shrink-0">
                    {currentUser?.username?.charAt(0).toUpperCase() || 'A'}
                  </div>
                  <div className="text-left hidden md:block">
                    <p className="text-xs font-black text-slate-900 leading-tight">
                      {currentUser?.fullName || currentUser?.username || 'Administrator'}
                    </p>
                    <p className="text-[10px] text-blue-600 font-mono font-bold">
                      {currentUser?.role || 'SUPER_ADMIN'}
                    </p>
                  </div>
                </Link>
              </div>
            </div>

          </header>

          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
