'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  GraduationCap, 
  LayoutDashboard, 
  CalendarCheck, 
  Award, 
  DollarSign, 
  CreditCard, 
  BookOpen, 
  Clock,
  Sparkles
} from 'lucide-react';
import Header from '@/components/common/Header';
import DemoRoleSwitcher from '@/components/common/DemoRoleSwitcher';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/student', icon: LayoutDashboard },
    { name: 'My Results', href: '/student/results', icon: Award },
    { name: 'Fee Dues & Receipts', href: '/student/fees', icon: DollarSign },
    { name: 'Digital ID Card', href: '/student/id-card', icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <DemoRoleSwitcher currentRole="STUDENT" />
      
      <Header
        user={{
          username: 'THMS-2026-000001',
          role: 'STUDENT',
          fullName: 'Hamza Tariq',
          email: 'hamza.tariq@student.hayatabadmodel.edu.pk',
        }}
      />

      {/* Student Sub-bar */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-100 text-blue-800">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Student Portal — Hamza Tariq</p>
              <p className="text-[10px] text-slate-500 font-mono">ID: THMS-2026-000001 • Class 8-A (Roll 08-A-001)</p>
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
                      ? 'bg-blue-600 text-white shadow-sm'
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

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
}
