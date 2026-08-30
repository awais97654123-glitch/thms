'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Bell, 
  Globe, 
  LogOut, 
  User, 
  Menu, 
  X, 
  Building2, 
  GraduationCap, 
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { Language, getDictionary } from '@/lib/i18n';

interface HeaderProps {
  user?: {
    username: string;
    role: string;
    fullName?: string;
    email?: string;
  } | null;
  onToggleSidebar?: () => void;
}

export default function Header({ user, onToggleSidebar }: HeaderProps) {
  const [currentUser, setCurrentUser] = useState<HeaderProps['user']>(user || null);
  const [lang, setLang] = useState<Language>('en');
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  React.useEffect(() => {
    if (user) {
      setCurrentUser(user);
    } else {
      fetch('/api/auth/me')
        .then((res) => res.json())
        .then((data) => {
          if (data.user) {
            let fullName = data.user.username;
            if (data.user.student) fullName = data.user.student.fullName;
            else if (data.user.teacher) fullName = data.user.teacher.fullName;
            else if (data.user.parent) fullName = data.user.parent.fatherName;
            else if (data.user.staff) fullName = data.user.staff.fullName;

            setCurrentUser({
              username: data.user.username,
              role: data.user.role,
              fullName,
              email: data.user.email,
            });
          }
        })
        .catch(() => {
          setCurrentUser(null);
        });
    }
  }, [user]);

  const dict = getDictionary(lang);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/login';
    } catch {
      window.location.href = '/login';
    }
  };

  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'ADMIN':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'TEACHER':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'STUDENT':
        return 'bg-sky-100 text-sky-800 border-sky-200';
      case 'PARENT':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'ADMISSION_OFFICER':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'ACCOUNTANT':
        return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'LIBRARIAN':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Hamburger & School Logo */}
        <div className="flex items-center gap-3">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 lg:hidden"
              aria-label="Toggle Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform bg-white flex items-center justify-center p-0.5 border border-slate-200">
              <img
                src="/school-logo.png"
                alt="The Hayatabad Model School Crest"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 tracking-tight text-base sm:text-lg">
                  The Hayatabad Model School
                </span>
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Session 2026-27
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Peshawar, Khyber Pakhtunkhwa • ISO 9001:2015 Certified
              </p>
            </div>
          </Link>
        </div>

        {/* Right: Language Picker, Notifications, User Menu */}
        <div className="flex items-center gap-3">
          {/* i18n Selector */}
          <div className="relative">
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors"
            >
              <Globe className="w-4 h-4 text-blue-600" />
              <span className="uppercase">{lang}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>
            {showLangMenu && (
              <div className="absolute right-0 mt-2 w-36 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50 animate-in fade-in zoom-in-95">
                <button
                  onClick={() => { setLang('en'); setShowLangMenu(false); }}
                  className={`w-full text-left px-3.5 py-1.5 text-xs flex items-center justify-between hover:bg-blue-50 ${lang === 'en' ? 'font-bold text-blue-600' : 'text-slate-700'}`}
                >
                  <span>English</span>
                  {lang === 'en' && <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>}
                </button>
                <button
                  onClick={() => { setLang('ur'); setShowLangMenu(false); }}
                  className={`w-full text-left px-3.5 py-1.5 text-xs flex items-center justify-between hover:bg-blue-50 ${lang === 'ur' ? 'font-bold text-blue-600' : 'text-slate-700'}`}
                >
                  <span>اردو (Urdu)</span>
                  {lang === 'ur' && <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>}
                </button>
                <button
                  onClick={() => { setLang('ps'); setShowLangMenu(false); }}
                  className={`w-full text-left px-3.5 py-1.5 text-xs flex items-center justify-between hover:bg-blue-50 ${lang === 'ps' ? 'font-bold text-blue-600' : 'text-slate-700'}`}
                >
                  <span>پښتو (Pashto)</span>
                  {lang === 'ps' && <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>}
                </button>
              </div>
            )}
          </div>

          {/* User Profile Pill */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-semibold flex items-center justify-center text-xs shadow-sm">
                  {currentUser.fullName ? currentUser.fullName.charAt(0).toUpperCase() : currentUser.username.charAt(0).toUpperCase()}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-semibold text-slate-800 leading-tight">
                    {currentUser.fullName || currentUser.username}
                  </p>
                  <span className={`inline-block px-1.5 py-0.2 text-[10px] font-bold rounded border ${getRoleBadgeColor(currentUser.role)}`}>
                    {currentUser.role.replace('_', ' ')}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-semibold text-slate-900">{currentUser.fullName || currentUser.username}</p>
                    <p className="text-[11px] text-slate-500 truncate">{currentUser.email || currentUser.username}</p>
                    <div className="mt-1">
                      <span className={`inline-block px-1.5 py-0.5 text-[10px] font-bold rounded border ${getRoleBadgeColor(currentUser.role)}`}>
                        {currentUser.role.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  <Link
                    href="/change-password"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    <span>Change Password</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors border-t border-slate-100 mt-1"
                  >
                    <LogOut className="w-4 h-4 text-red-500" />
                    <span>{dict.logout}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all"
            >
              <User className="w-4 h-4" />
              <span>Portal Login</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
