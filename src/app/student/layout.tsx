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
  BookOpen, 
  Settings, 
  Menu, 
  X, 
  Sparkles, 
  Clock, 
  FolderDown, 
  Calendar, 
  Bot, 
  HelpCircle, 
  ChevronRight,
  Bell
} from 'lucide-react';
import NotificationBell from '@/components/common/NotificationBell';

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
    { name: 'AI Copilot', href: '/student/ai-assistant', icon: Bot, isAI: true },
    { name: 'Daily Homework', href: '/student/homework', icon: BookOpen },
    { name: 'Timetable', href: '/student/timetable', icon: Clock },
    { name: 'Study Library', href: '/student/resources', icon: FolderDown },
    { name: 'Exam Results', href: '/student/results', icon: Award },
    { name: 'Fee Vouchers', href: '/student/fees', icon: DollarSign },
    { name: 'Leave Application', href: '/student/leave', icon: Calendar },
    { name: 'Support & Helpdesk', href: '/student/support', icon: HelpCircle },
    { name: 'Smart ID Card', href: '/student/id-card', icon: CreditCard },
    { name: 'Settings', href: '/student/settings', icon: Settings },
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
    <div className="min-h-screen bg-[#f8fafc] flex flex-col text-slate-900 selection:bg-blue-600 selection:text-white">
      {/* DEDICATED STUDENT PORTAL HEADER (Royal Blue Prestige & Crisp White) */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-2xl border-b border-blue-900/10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          
          {/* Left: School Logo + Student Portal Title */}
          <div className="flex items-center gap-3">
            <Link href="/student" className="flex items-center gap-3 group">
              <img
                src="/logo.png"
                alt="THMS"
                className="h-12 sm:h-14 w-auto object-contain drop-shadow-[0_2px_8px_rgba(37,99,235,0.25)] group-hover:scale-105 transition-transform"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-slate-900 text-sm sm:text-base tracking-tight block">
                    The Hayatabad Model School
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider hidden sm:inline-block">
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
          <nav className="hidden 2xl:flex items-center gap-1 bg-slate-100/80 p-1.5 rounded-full border border-slate-200/80">
            {navItems.slice(0, 7).map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-black flex items-center gap-1.5 transition-all ${
                    isActive
                      ? 'bg-white text-blue-700 shadow-sm'
                      : 'text-slate-700 hover:text-blue-700 hover:bg-white/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${item.isAI ? 'text-blue-600 animate-pulse' : ''}`} />
                  <span>{item.name}</span>
                  {item.isAI && (
                    <span className="px-1 py-0.2 rounded text-[8px] bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-black">
                      AI
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right: Notification Bell + AI Quick Launcher + Student Avatar + Sign Out */}
          <div className="flex items-center gap-2.5">
            {/* In-App Notifications */}
            <NotificationBell />

            <Link
              href="/student/ai-assistant"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/80 text-xs font-black transition-all hover:scale-105"
            >
              <Bot className="w-4 h-4 text-blue-600 animate-pulse" />
              <span>AI Copilot</span>
            </Link>

            <Link
              href="/student/settings"
              className="flex items-center gap-2 p-1.5 pr-3 rounded-2xl bg-white hover:bg-blue-50/60 border border-slate-200 shadow-sm transition-all"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#0a192f] via-[#1e3a8a] to-[#2563eb] text-white font-black flex items-center justify-center text-xs shadow-md overflow-hidden border border-white">
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
                <p className="text-[10px] text-blue-600 font-mono font-bold">
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
              className="p-2.5 rounded-2xl text-slate-700 hover:bg-blue-50 border border-slate-200 2xl:hidden"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-blue-600" /> : <Menu className="w-5 h-5 text-slate-800" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="2xl:hidden bg-white/95 backdrop-blur-2xl border-b border-blue-900/10 px-4 py-4 space-y-1 animate-in slide-in-from-top-4 duration-200">
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
                    <Icon className={`w-4 h-4 ${item.isAI ? 'text-cyan-600' : 'text-blue-600'}`} />
                    <span>{item.name}</span>
                    {item.isAI && (
                      <span className="px-1.5 py-0.5 rounded text-[8px] bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-black">
                        AI
                      </span>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>
              );
            })}
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
        {children}
      </main>
    </div>
  );
}
