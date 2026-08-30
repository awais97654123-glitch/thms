'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Users, 
  LayoutDashboard, 
  CalendarCheck, 
  Award, 
  DollarSign, 
  BookOpen, 
  Check, 
  ChevronDown 
} from 'lucide-react';
import Header from '@/components/common/Header';
import DemoRoleSwitcher from '@/components/common/DemoRoleSwitcher';

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <DemoRoleSwitcher currentRole="PARENT" />
      
      <Header
        user={{
          username: 'parent.tariq',
          role: 'PARENT',
          fullName: 'Dr. Tariq Mehmood',
          email: 'dr.tariq@gmail.com',
        }}
      />

      {/* Parent Sub-bar */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Parent Portal — Dr. Tariq Mehmood</p>
              <p className="text-[10px] text-slate-500">2 Enrolled Children (Hamza & Aiman)</p>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
}
