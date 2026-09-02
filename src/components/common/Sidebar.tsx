'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  UserPlus,
  Users,
  CreditCard,
  CalendarCheck,
  Award,
  DollarSign,
  Megaphone,
  Library,
  Bus,
  Package,
  FileBarChart,
  ShieldCheck,
  Settings,
  X,
  ChevronRight,
  Clock,
  Layers,
  UserCheck,
  UserCircle,
  RefreshCw,
  Cloud,
  Bell,
  KeyRound,
  Sparkles,
  Bot,
  Headphones
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  role?: string;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  const navGroups = [
    {
      title: 'CORE MODULES',
      items: [
        { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
        { name: 'AI Command Center', href: '/admin/ai-insights', icon: Bot, badge: 'AI', badgeColor: 'bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold' },
        { name: 'Student Support Desk', href: '/admin/support', icon: Headphones, badge: 'Live', badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
        { name: 'Admissions Pipeline', href: '/admin/admissions', icon: UserPlus, badge: 'Live', badgeColor: 'bg-orange-500/20 text-orange-300 border-orange-500/30' },
        { name: 'Student 360° Directory', href: '/admin/students', icon: Users },
        { name: 'Faculty & Teachers', href: '/admin/teachers', icon: UserCheck },
        { name: 'Staff Management', href: '/admin/staff', icon: UserCircle },
        { name: 'Parents Directory', href: '/admin/parents', icon: Users },
        { name: 'ID Card Studio (QR)', href: '/admin/id-cards', icon: CreditCard, badge: 'Smart', badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
      ],
    },
    {
      title: 'ACADEMICS & FINANCE',
      items: [
        { name: 'Classes & Sections', href: '/admin/academics/classes', icon: Layers },
        { name: 'Master Timetable', href: '/admin/academics/timetable', icon: Clock },
        { name: 'Attendance & QR Gate', href: '/admin/attendance', icon: CalendarCheck },
        { name: 'Fee & Billing Hub', href: '/admin/fees', icon: DollarSign },
        { name: 'Exams & Marksheets', href: '/admin/examinations/marks', icon: Award },
        { name: 'Library System', href: '/admin/library', icon: Library },
        { name: 'Transport & Routes', href: '/admin/transport', icon: Bus },
        { name: 'Inventory & Assets', href: '/admin/inventory', icon: Package },
        { name: 'Announcements', href: '/admin/announcements', icon: Megaphone },
      ],
    },
    {
      title: 'ADMINISTRATION & SECURITY',
      items: [
        { name: 'User & Password Manager', href: '/admin/users', icon: KeyRound },
        { name: 'Offline & Sync Hub', href: '/admin/sync', icon: RefreshCw },
        { name: 'Supabase Cloud', href: '/admin/supabase', icon: Cloud },
        { name: 'Push Alerts (FCM)', href: '/admin/notifications/fcm', icon: Bell },
        { name: 'Analytics & Reports', href: '/admin/reports', icon: FileBarChart },
        { name: 'Audit Trail Logs', href: '/admin/audit-logs', icon: ShieldCheck },
        { name: 'School Settings', href: '/admin/settings', icon: Settings },
      ],
    },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-md transition-opacity lg:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#0F2A5F] text-slate-100 border-r border-[#173B7A]/80 backdrop-blur-xl flex flex-col transition-all duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl shadow-blue-950/50' : '-translate-x-full'
        }`}
      >
        {/* Top Header with School Crest & Brand */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-[#173B7A]/80 bg-[#0B214B]">
          <Link href="/admin" className="flex items-center gap-3 group">
            <img
              src="/logo.png"
              alt="THMS Logo"
              className="h-9 w-auto object-contain drop-shadow-[0_2px_8px_rgba(37,99,235,0.3)] group-hover:scale-105 transition-transform"
            />
            <div>
              <h2 className="text-sm font-black tracking-tight text-white flex items-center gap-1.5">
                <span>THMS Executive</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] animate-pulse"></span>
              </h2>
              <span className="text-[10px] text-blue-200 font-medium tracking-wide">
                Admin Control Tower
              </span>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-[#173B7A] lg:hidden transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6">
          {navGroups.map((group, idx) => (
            <div key={idx}>
              <p className="px-3 text-[10px] font-bold tracking-widest text-blue-200/70 uppercase mb-2">
                {group.title}
              </p>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => {
                        if (window.innerWidth < 1024) onClose();
                      }}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                        isActive
                          ? 'bg-[#2563EB] text-white shadow-sm font-bold'
                          : 'text-slate-300 hover:bg-[#173B7A]/60 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-white' : 'text-blue-300 group-hover:text-white'}`} />
                        <span>{item.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {item.badge && (
                          <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-extrabold border ${
                            isActive 
                              ? 'bg-white/20 text-white border-white/30' 
                              : 'bg-blue-500/20 text-blue-200 border-blue-400/30'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                        {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/80" />}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Exit & Logout Buttons */}
        <div className="p-3 border-t border-[#173B7A]/80 space-y-2 bg-[#0B214B]/60">
          <Link
            href="/"
            onClick={() => {
              if (window.innerWidth < 1024) onClose();
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-[#173B7A]/60 hover:text-white transition-all border border-[#173B7A]/80"
          >
            <span>← Exit to Website</span>
            <span className="text-[10px] text-blue-300 font-medium">Public Portal</span>
          </Link>
          <button
            onClick={async () => {
              try {
                await fetch('/api/auth/logout', { method: 'POST' });
              } catch (e) {
                console.error(e);
              }
              window.location.href = '/login';
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-300 hover:bg-rose-900/30 hover:text-rose-200 transition-all border border-rose-800/40"
          >
            <span>Leave Session / Sign Out</span>
          </button>
        </div>

        {/* Footer info */}
        <div className="p-3.5 border-t border-[#173B7A]/80 bg-[#0B214B] text-[11px] text-slate-300 flex items-center justify-between">
          <span className="font-mono text-[10px] text-blue-200/80">THMS ERP • 2026–2027</span>
          <span className="flex items-center gap-1.5 text-blue-300 font-bold text-[10px]">
            <span className="w-2 h-2 rounded-full bg-[#16A34A] shadow-[0_0_8px_#4ade80] animate-pulse"></span>
            Live Cluster
          </span>
        </div>
      </aside>
    </>
  );
}
