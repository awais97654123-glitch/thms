'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  Sparkles
} from 'lucide-react';
import Header from '@/components/common/Header';
import DemoRoleSwitcher from '@/components/common/DemoRoleSwitcher';

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { name: 'Teacher Dashboard', href: '/teacher', icon: LayoutDashboard },
    { name: 'Class Attendance', href: '/teacher/attendance', icon: CalendarCheck },
    { name: 'Marks Entry', href: '/teacher/marks', icon: Award },
    { name: 'Homework & Tasks', href: '/teacher/homework', icon: BookOpen },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <DemoRoleSwitcher currentRole="TEACHER" />
      
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
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100'
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

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
