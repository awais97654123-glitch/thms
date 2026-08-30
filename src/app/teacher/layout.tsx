'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  CalendarCheck, 
  Award, 
  BookOpen, 
  UserCheck, 
  LogOut, 
  ArrowLeft, 
  Home,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import Header from '@/components/common/Header';

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [teacher, setTeacher] = useState<any | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user?.teacher) {
          setTeacher(data.user.teacher);
        }
      })
      .catch(console.error);
  }, []);

  const isMainDashboard = pathname === '/teacher';

  const navItems = [
    { name: 'Dashboard', href: '/teacher', icon: LayoutDashboard },
    { name: 'Attendance Register', href: '/teacher/attendance', icon: CalendarCheck },
    { name: 'Marks Entry', href: '/teacher/marks', icon: Award },
    { name: 'Homework Composer', href: '/teacher/homework', icon: BookOpen },
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
            <span className="text-cyan-400 font-bold text-xs">Teacher Classroom Portal</span>
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

      {/* Floating Glass Teacher Navigation Bar */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-3 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-500/20">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-900">
                {teacher ? teacher.fullName : 'Faculty Member'}
              </p>
              <p className="text-[11px] text-slate-500 font-medium">
                {teacher ? `${teacher.designation} • ${teacher.employeeId}` : 'Classroom Faculty'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 rounded-2xl font-black flex items-center gap-2 transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-500/25 scale-[1.02]'
                      : 'text-slate-600 hover:bg-white/80 hover:text-slate-900 border border-transparent hover:border-slate-200/60'
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
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
        {children}
      </main>
    </div>
  );
}
