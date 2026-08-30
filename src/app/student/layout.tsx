'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  GraduationCap, 
  LayoutDashboard, 
  CalendarCheck, 
  Award, 
  DollarSign, 
  CreditCard, 
  BookOpen, 
  Clock,
  Sparkles,
  ArrowLeft,
  Home,
  LogOut
} from 'lucide-react';
import Header from '@/components/common/Header';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [student, setStudent] = React.useState<any | null>(null);

  React.useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user?.student) {
          setStudent(data.user.student);
        }
      })
      .catch(console.error);
  }, []);

  const isMainDashboard = pathname === '/student';

  const navItems = [
    { name: 'Dashboard', href: '/student', icon: LayoutDashboard },
    { name: 'My Results', href: '/student/results', icon: Award },
    { name: 'Fee Dues & Receipts', href: '/student/fees', icon: DollarSign },
    { name: 'Digital ID Card', href: '/student/id-card', icon: CreditCard },
  ];

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/student');
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
      {/* Student Session Top Bar */}
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
          <span className="font-bold text-blue-400">Student Portal</span>
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

      {/* Student Sub-bar */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-100 text-blue-800">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">
                {student ? `Student Portal — ${student.fullName}` : 'Student Portal'}
              </p>
              <p className="text-[10px] text-slate-500 font-mono">
                {student
                  ? `ID: ${student.studentId} • ${student.class?.name || 'Class'} (${student.section?.name || 'Section'}, Roll ${student.rollNo})`
                  : 'Official Enrolled Student'}
              </p>
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
                      ? 'bg-blue-600 text-white shadow-sm'
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
