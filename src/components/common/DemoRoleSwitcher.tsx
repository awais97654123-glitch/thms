'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert, User, GraduationCap, Users, UserCheck, Calculator, BookOpen, Check } from 'lucide-react';

interface DemoRoleSwitcherProps {
  currentRole?: string;
}

export default function DemoRoleSwitcher({ currentRole }: DemoRoleSwitcherProps) {
  const router = useRouter();
  const [loadingRole, setLoadingRole] = useState<string | null>(null);

  const demoAccounts = [
    { role: 'SUPER_ADMIN', username: 'admin', label: 'Super Admin', icon: ShieldAlert, color: 'bg-red-600' },
    { role: 'TEACHER', username: 'teacher.farooq', label: 'Teacher (Farooq)', icon: UserCheck, color: 'bg-emerald-600' },
    { role: 'STUDENT', username: 'THMS-2026-000001', label: 'Student (Hamza)', icon: GraduationCap, color: 'bg-blue-600' },
    { role: 'PARENT', username: 'parent.tariq', label: 'Parent (Dr. Tariq)', icon: Users, color: 'bg-amber-600' },
    { role: 'ADMISSION_OFFICER', username: 'admissions', label: 'Admissions Officer', icon: User, color: 'bg-purple-600' },
    { role: 'ACCOUNTANT', username: 'accounts', label: 'Accountant', icon: Calculator, color: 'bg-teal-600' },
    { role: 'LIBRARIAN', username: 'library', label: 'Librarian', icon: BookOpen, color: 'bg-indigo-600' },
  ];

  const handleQuickSwitch = async (username: string, role: string) => {
    setLoadingRole(role);
    try {
      const res = await fetch('/api/auth/demo-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });
      const data = await res.json();
      if (res.ok && data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        alert(data.error || 'Failed to switch demo account');
        setLoadingRole(null);
      }
    } catch (err) {
      console.error(err);
      setLoadingRole(null);
    }
  };

  return (
    <div className="bg-slate-900 text-white text-xs py-2 px-4 shadow-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 font-medium">
          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-semibold border border-blue-400/30">
            DEMO FAST-SWITCH
          </span>
          <span className="hidden sm:inline text-slate-300">
            Click any role to test full workflows instantly:
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {demoAccounts.map((acc) => {
            const Icon = acc.icon;
            const isCurrent = currentRole === acc.role;
            const isLoading = loadingRole === acc.role;
            return (
              <button
                key={acc.role}
                onClick={() => handleQuickSwitch(acc.username, acc.role)}
                disabled={isLoading}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded transition-all font-medium border ${
                  isCurrent
                    ? 'bg-blue-600 text-white border-blue-400 shadow-sm'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{acc.label}</span>
                {isCurrent && <Check className="w-3 h-3 text-emerald-300 ml-0.5" />}
                {isLoading && <span className="animate-spin text-xs ml-1">⏳</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
