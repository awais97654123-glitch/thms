'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  UserPlus,
  Users,
  CreditCard,
  QrCode,
  CalendarCheck,
  GraduationCap,
  Award,
  DollarSign,
  BookOpen,
  FileText,
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
  Key
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  role?: string;
}

export default function Sidebar({ isOpen, onClose, role = 'SUPER_ADMIN' }: SidebarProps) {
  const pathname = usePathname();

  const navGroups = [
    {
      title: 'CORE MODULES',
      items: [
        { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
        { name: 'Admissions Pipeline', href: '/admin/admissions', icon: UserPlus, badge: 'Active' },
        { name: 'Student 360° Directory', href: '/admin/students', icon: Users },
        { name: 'Faculty & Teachers', href: '/admin/teachers', icon: UserCheck },
        { name: 'Staff Management', href: '/admin/staff', icon: UserCircle },
        { name: 'Parents Directory', href: '/admin/parents', icon: Users },
        { name: 'ID Card Studio (QR)', href: '/admin/id-cards', icon: CreditCard, badge: 'Pro' },
      ],
    },
    {
      title: 'ACADEMICS & EXAMS',
      items: [
        { name: 'Classes & Sections', href: '/admin/academics/classes', icon: Layers },
        { name: 'Master Timetable', href: '/admin/academics/timetable', icon: Clock },
        { name: 'Attendance Hub', href: '/admin/attendance', icon: CalendarCheck },
        { name: 'Fee Management', href: '/admin/fees', icon: DollarSign },
        { name: 'Exams & Marksheets', href: '/admin/examinations/marks', icon: Award },
        { name: 'Library System', href: '/admin/library', icon: Library },
        { name: 'Transport & Routes', href: '/admin/transport', icon: Bus },
        { name: 'Inventory & Assets', href: '/admin/inventory', icon: Package },
        { name: 'Announcements', href: '/admin/announcements', icon: Megaphone },
      ],
    },
    {
      title: 'ADMINISTRATION',
      items: [
        { name: 'Login & Passwords', href: '/admin/users', icon: Key, badge: 'Key' },
        { name: 'Offline & Sync Hub', href: '/admin/sync', icon: RefreshCw, badge: 'Live' },
        { name: 'Supabase Cloud', href: '/admin/supabase', icon: Cloud, badge: 'Active' },
        { name: 'Push Alerts (FCM)', href: '/admin/notifications/fcm', icon: Bell, badge: 'FCM' },
        { name: 'Analytics Reports', href: '/admin/reports', icon: FileBarChart },
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
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-slate-900 text-slate-100 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Top Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl overflow-hidden bg-white flex items-center justify-center p-0.5 shadow-md border border-slate-700/50">
              <img
                src="/school-logo.png"
                alt="THMS Crest"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight text-white">
                THMS Admin ERP
              </h2>
              <span className="text-[10px] text-emerald-400 font-medium">
                Hayatabad Model School
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation Items */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
          {navGroups.map((group, idx) => (
            <div key={idx}>
              <p className="px-3 text-[11px] font-semibold tracking-wider text-slate-400 uppercase mb-2">
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
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-500/20'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                        <span>{item.name}</span>
                      </div>
                      {item.badge && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-slate-950">
                          {item.badge}
                        </span>
                      )}
                      {isActive && <ChevronRight className="w-3.5 h-3.5 text-blue-200" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Exit & Logout Buttons */}
        <div className="p-3 border-t border-slate-800 space-y-1.5 bg-slate-900/60">
          <Link
            href="/"
            onClick={() => {
              if (window.innerWidth < 1024) onClose();
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-all border border-slate-800"
          >
            <span>← Exit to Website</span>
            <span className="text-[10px] text-slate-500 font-normal">Public Site</span>
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
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-red-400 hover:bg-red-950/40 hover:text-red-300 transition-all border border-red-900/40"
          >
            <span>Leave Session / Logout</span>
          </button>
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40 text-[11px] text-slate-400 flex items-center justify-between">
          <span>THMS v2.6 • Production</span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Live
          </span>
        </div>
      </aside>
    </>
  );
}
