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
  Sparkles
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
        { name: 'Admissions Pipeline', href: '/admin/admissions', icon: UserPlus, badge: 'Live', badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
        { name: 'Student 360° Directory', href: '/admin/students', icon: Users },
        { name: 'Faculty & Teachers', href: '/admin/teachers', icon: UserCheck },
        { name: 'Staff Management', href: '/admin/staff', icon: UserCircle },
        { name: 'Parents Directory', href: '/admin/parents', icon: Users },
        { name: 'ID Card Studio (QR)', href: '/admin/id-cards', icon: CreditCard, badge: 'Smart', badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' },
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
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-slate-950/95 text-slate-200 border-r border-slate-800/80 backdrop-blur-2xl flex flex-col transition-all duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl shadow-blue-950/50' : '-translate-x-full'
        }`}
      >
        {/* Top Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800/80 bg-slate-900/40">
          <Link href="/admin" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-cyan-500 to-indigo-600 p-0.5 shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-all">
              <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center p-0.5">
                <img
                  src="/school-logo.png"
                  alt="THMS Crest"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            <div>
              <h2 className="text-sm font-extrabold tracking-tight text-white flex items-center gap-1.5">
                <span>THMS Command</span>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
              </h2>
              <span className="text-[10px] text-slate-400 font-medium tracking-wide">
                Admin Control Center
              </span>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 lg:hidden transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6">
          {navGroups.map((group, idx) => (
            <div key={idx}>
              <p className="px-3 text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-2">
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
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30'
                          : 'text-slate-400 hover:bg-slate-900/80 hover:text-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-cyan-400'}`} />
                        <span>{item.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {item.badge && (
                          <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-extrabold border ${item.badgeColor || 'bg-blue-500/20 text-blue-300 border-blue-500/30'}`}>
                            {item.badge}
                          </span>
                        )}
                        {isActive && <ChevronRight className="w-3.5 h-3.5 text-blue-200" />}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Exit & Logout Buttons */}
        <div className="p-3 border-t border-slate-800/80 space-y-2 bg-slate-900/30">
          <Link
            href="/"
            onClick={() => {
              if (window.innerWidth < 1024) onClose();
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800/80 hover:text-white transition-all border border-slate-800/60"
          >
            <span>← Exit to Website</span>
            <span className="text-[10px] text-slate-500">Public Portal</span>
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
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition-all border border-rose-900/30"
          >
            <span>Leave Session / Sign Out</span>
          </button>
        </div>

        {/* Footer info */}
        <div className="p-3.5 border-t border-slate-800/80 bg-slate-950/80 text-[11px] text-slate-400 flex items-center justify-between">
          <span className="font-mono text-[10px]">THMS v2.6 • Neon PG</span>
          <span className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[10px]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse"></span>
            Live Cluster
          </span>
        </div>
      </aside>
    </>
  );
}
