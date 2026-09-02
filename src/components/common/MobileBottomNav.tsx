'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Calendar, 
  BookOpen, 
  Award, 
  CreditCard, 
  CalendarCheck,
  UserCheck,
  QrCode
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface MobileBottomNavProps {
  role: 'TEACHER' | 'STUDENT' | 'PARENT';
}

export default function MobileBottomNav({ role }: MobileBottomNavProps) {
  const pathname = usePathname();

  const navConfigs: Record<'TEACHER' | 'STUDENT' | 'PARENT', NavItem[]> = {
    TEACHER: [
      { label: 'Dashboard', href: '/teacher', icon: <LayoutDashboard className="w-5 h-5" /> },
      { label: 'Attendance', href: '/teacher/attendance', icon: <CalendarCheck className="w-5 h-5" /> },
      { label: 'Homework', href: '/teacher/homework', icon: <BookOpen className="w-5 h-5" /> },
      { label: 'Marks', href: '/teacher/marks', icon: <Award className="w-5 h-5" /> },
    ],
    STUDENT: [
      { label: 'Overview', href: '/student', icon: <LayoutDashboard className="w-5 h-5" /> },
      { label: 'Homework', href: '/student/homework', icon: <BookOpen className="w-5 h-5" /> },
      { label: 'Results', href: '/student/results', icon: <Award className="w-5 h-5" /> },
      { label: 'Fees', href: '/student/fees', icon: <CreditCard className="w-5 h-5" /> },
    ],
    PARENT: [
      { label: 'Wards', href: '/parent', icon: <LayoutDashboard className="w-5 h-5" /> },
      { label: 'Attendance', href: '/parent?tab=attendance', icon: <CalendarCheck className="w-5 h-5" /> },
      { label: 'Academics', href: '/parent?tab=exams', icon: <Award className="w-5 h-5" /> },
      { label: 'Fees', href: '/parent?tab=fees', icon: <CreditCard className="w-5 h-5" /> },
    ],
  };

  const items = navConfigs[role] || [];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E2E8F0] shadow-lg px-2 py-1.5 flex items-center justify-around"
      aria-label="Mobile Navigation"
    >
      {items.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.label}
            href={item.href}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all ${
              isActive
                ? 'text-[#2563EB] font-bold'
                : 'text-[#64748B] hover:text-[#0F172A] font-medium'
            }`}
          >
            <div
              className={`p-1 rounded-xl transition-all ${
                isActive ? 'bg-[#EFF6FF] text-[#2563EB]' : 'text-[#64748B]'
              }`}
            >
              {item.icon}
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
