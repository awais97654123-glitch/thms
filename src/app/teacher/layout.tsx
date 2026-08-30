'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  GraduationCap, 
  LayoutDashboard, 
  CalendarCheck, 
  Award, 
  BookOpen, 
  Clock, 
  Megaphone,
  UserCheck,
  LogOut,
  Sparkles,
  ArrowLeft,
  Home
} from 'lucide-react';
import Header from '@/components/common/Header';

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const isMainDashboard = pathname === '/teacher';

  const navItems = [
    { name: 'Teacher Dashboard', href: '/teacher', icon: LayoutDashboard },
    { name: 'Class Attendance', href: '/teacher/attendance', icon: CalendarCheck },
    { name: 'Marks Entry', href: '/teacher/marks', icon: Award },
    { name: 'Homework & Tasks', href: '/teacher/homework', icon: BookOpen },
  ];

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/teacher');
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
      {/* Session Top Bar */}
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
          <span className="font-bold text-emerald-400">Teacher Portal</span>
        </div>

        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white rounded-lg font-semibold transition-all border border-red-500/30 text-[11px]"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Leave Session / Logout</span>
        </button>
      </div>

      <Header
        user={{
          username: 'teacher.farooq',
          role: 'TEACHER',
          fullName: 'Engr. Farooq Ahmad',
          email: 'farooq.ahmad@hayatabadmodel.edu.pk',
        }}
      />

      {/* Teacher Navigation Sub-bar */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Faculty Portal — Engr. Farooq Ahmad</p>
              <p className="text-[10px] text-slate-500">Head of Mathematics & Class 8 Incharge</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 transition-all ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
        {children}
      </main>
    </div>
  );
}
