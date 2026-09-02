'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  CalendarCheck, 
  Award, 
  BookOpen, 
  LogOut, 
  Sparkles, 
  Menu, 
  X, 
  ChevronRight,
  UserCheck
} from 'lucide-react';
import MobileBottomNav from '@/components/common/MobileBottomNav';

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [teacher, setTeacher] = useState<any | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const navItems = [
    { name: 'Dashboard', href: '/teacher', icon: LayoutDashboard },
    { name: 'Attendance Roll Call', href: '/teacher/attendance', icon: CalendarCheck },
    { name: 'Homework Publisher', href: '/teacher/homework', icon: BookOpen },
    { name: 'Marks & Grading', href: '/teacher/marks', icon: Award },
  ];

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error(e);
    }
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col text-[#0F172A] selection:bg-[#2563EB] selection:text-white">
      {/* DEDICATED TEACHER PORTAL HEADER */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-[#E2E8F0] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          
          {/* Left: School Logo + Teacher Portal Title */}
          <div className="flex items-center gap-3">
            <Link href="/teacher" className="flex items-center gap-3 group">
              <img
                src="/logo.png"
                alt="THMS"
                className="h-12 sm:h-14 w-auto object-contain drop-shadow-[0_2px_8px_rgba(37,99,235,0.2)] group-hover:scale-105 transition-transform"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-[#0F172A] text-sm sm:text-base tracking-tight block">
                    The Hayatabad Model School
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE] uppercase tracking-wider hidden sm:inline-block">
                    Faculty Workload Portal
                  </span>
                </div>
                <p className="text-[11px] text-[#64748B] font-medium">
                  {teacher ? `${teacher.fullName} • ${teacher.designation || 'Faculty Member'}` : 'Authorized Educator'}
                </p>
              </div>
            </Link>
          </div>

          {/* Center: Desktop Navigation Tabs */}
          <nav className="hidden lg:flex items-center gap-1.5 bg-[#F1F5F9] p-1.5 rounded-full border border-[#E2E8F0]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${
                    isActive
                      ? 'bg-white text-[#2563EB] shadow-sm'
                      : 'text-[#475569] hover:text-[#2563EB] hover:bg-white/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right: Teacher Avatar + Sign Out */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-2 p-1.5 pr-3 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black flex items-center justify-center text-xs shadow-md overflow-hidden">
                {teacher?.photoUrl ? (
                  <img src={teacher.photoUrl} alt={teacher.fullName} className="w-full h-full object-cover" />
                ) : (
                  teacher?.fullName?.charAt(0).toUpperCase() || 'T'
                )}
              </div>
              <div className="text-left hidden md:block">
                <p className="text-xs font-black text-slate-900 leading-tight">
                  {teacher?.fullName || 'Teacher'}
                </p>
                <p className="text-[10px] text-blue-600 font-mono font-bold">
                  {teacher?.employeeId || 'THMS-FACULTY'}
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

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-2xl text-slate-700 hover:bg-slate-100 border border-slate-200 lg:hidden"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-blue-600" /> : <Menu className="w-5 h-5 text-slate-800" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white/95 backdrop-blur-2xl border-b border-blue-500/10 px-4 py-4 space-y-1 animate-in slide-in-from-top-4 duration-200">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-black transition-all ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-blue-600" />
                    <span>{item.name}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>
              );
            })}
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6 pb-20 md:pb-8">
        {children}
      </main>

      {/* Mobile Bottom Navigation (Section 45-46) */}
      <MobileBottomNav role="TEACHER" />
    </div>
  );
}
