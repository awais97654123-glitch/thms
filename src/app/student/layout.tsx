'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  GraduationCap, 
  LayoutDashboard, 
  Award, 
  DollarSign, 
  CreditCard, 
  LogOut, 
  ArrowLeft, 
  Home, 
  Sparkles, 
  ChevronRight,
  BookOpen,
  Settings,
  Menu,
  X,
  User,
  Bell
} from 'lucide-react';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [student, setStudent] = useState<any | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user?.student) {
          setStudent(data.user.student);
        }
      })
      .catch(console.error);
  }, []);

  const navItems = [
    { name: 'Academic Hub', href: '/student', icon: LayoutDashboard },
    { name: 'Daily Homework', href: '/student/homework', icon: BookOpen },
    { name: 'Exam Results', href: '/student/results', icon: Award },
    { name: 'Fee Vouchers', href: '/student/fees', icon: DollarSign },
    { name: 'Smart Digital ID', href: '/student/id-card', icon: CreditCard },
    { name: 'Settings & Profile', href: '/student/settings', icon: Settings },
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
    <div className="min-h-screen bg-[#f8fafc] flex flex-col text-slate-900 selection:bg-orange-500 selection:text-white">
      {/* DEDICATED STUDENT PORTAL HEADER (No public website navbar) */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-2xl border-b border-orange-500/10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          
          {/* Left: 3D School Logo + Student Portal Title */}
          <div className="flex items-center gap-3">
            <Link href="/student" className="flex items-center gap-3 group">
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
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-orange-50 text-orange-700 border border-orange-200 uppercase tracking-wider hidden sm:inline-block">
                    Student Portal
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">
                  {student ? `${student.fullName} • ${student.class?.name || 'Class'} (${student.section?.name || 'Section'})` : 'Enrolled Scholar'}
                </p>
              </div>
            </Link>
          </div>

          {/* Center: Desktop Navigation Tabs */}
          <nav className="hidden xl:flex items-center gap-1.5 bg-slate-100/70 p-1.5 rounded-full border border-slate-200/80">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-black flex items-center gap-1.5 transition-all ${
                    isActive
                      ? 'bg-white text-orange-600 shadow-sm'
                      : 'text-slate-700 hover:text-orange-600 hover:bg-white/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right: Student Avatar + Sign Out */}
          <div className="flex items-center gap-2.5">
            <Link
              href="/student/settings"
              className="flex items-center gap-2 p-1.5 pr-3 rounded-2xl bg-white hover:bg-orange-50/60 border border-slate-200 shadow-sm transition-all"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white font-black flex items-center justify-center text-xs shadow-md overflow-hidden">
                {student?.photoUrl ? (
                  <img src={student.photoUrl} alt={student.fullName} className="w-full h-full object-cover" />
                ) : (
                  student?.fullName?.charAt(0).toUpperCase() || 'S'
                )}
              </div>
              <div className="text-left hidden md:block">
                <p className="text-xs font-black text-slate-900 leading-tight">
                  {student?.fullName || 'Student'}
                </p>
                <p className="text-[10px] text-orange-600 font-mono font-bold">
                  {student?.studentId || 'THMS-ID'}
                </p>
              </div>
            </Link>

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
              className="p-2.5 rounded-2xl text-slate-700 hover:bg-orange-50 border border-slate-200 xl:hidden"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-orange-600" /> : <Menu className="w-5 h-5 text-slate-800" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="xl:hidden bg-white/95 backdrop-blur-2xl border-b border-orange-500/10 px-4 py-4 space-y-1 animate-in slide-in-from-top-4 duration-200">
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
                      ? 'bg-orange-500/10 text-orange-600 border border-orange-200'
                      : 'text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-orange-600" />
                    <span>{item.name}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>
              );
            })}
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
        {children}
      </main>
    </div>
  );
}
