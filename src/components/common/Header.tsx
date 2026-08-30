'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Globe, 
  LogOut, 
  User, 
  Menu, 
  ChevronDown,
  ShieldCheck,
  Sparkles,
  KeyRound
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

  useEffect(() => {
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

  const getRoleTheme = (role?: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
      case 'ADMIN':
        return {
          badge: 'bg-blue-500/10 text-blue-700 border-blue-200/80',
          dot: 'bg-blue-500 shadow-blue-500/50',
          gradient: 'from-blue-600 to-indigo-600',
        };
      case 'TEACHER':
        return {
          badge: 'bg-cyan-500/10 text-cyan-700 border-cyan-200/80',
          dot: 'bg-cyan-500 shadow-cyan-500/50',
          gradient: 'from-cyan-600 to-blue-600',
        };
      case 'STUDENT':
        return {
          badge: 'bg-indigo-500/10 text-indigo-700 border-indigo-200/80',
          dot: 'bg-indigo-500 shadow-indigo-500/50',
          gradient: 'from-indigo-600 to-cyan-500',
        };
      case 'PARENT':
        return {
          badge: 'bg-amber-500/10 text-amber-700 border-amber-200/80',
          dot: 'bg-amber-500 shadow-amber-500/50',
          gradient: 'from-amber-500 to-orange-600',
        };
      default:
        return {
          badge: 'bg-slate-500/10 text-slate-700 border-slate-200',
          dot: 'bg-slate-500',
          gradient: 'from-slate-700 to-slate-900',
        };
    }
  };

  const roleStyle = getRoleTheme(currentUser?.role);

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-white/60 shadow-[0_4px_24px_-4px_rgba(15,23,42,0.04)]">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Mobile Toggle & School Monogram */}
        <div className="flex items-center gap-3">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100/80 border border-slate-200/60 focus:outline-none transition-all lg:hidden"
              aria-label="Toggle Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-cyan-500 to-blue-700 p-0.5 shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-all">
              <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center p-1">
                <img
                  src="/school-logo.png"
                  alt="The Hayatabad Model School Crest"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 tracking-tight text-base sm:text-lg">
                  The Hayatabad Model School
                </span>
                <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50/80 text-blue-700 border border-blue-200/60 backdrop-blur-sm">
                  <Sparkles className="w-3 h-3 text-cyan-500" />
                  Session 2026-27
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                Peshawar, Khyber Pakhtunkhwa • ISO 9001:2015 Registered
              </p>
            </div>
          </Link>
        </div>

        {/* Right: Language Picker, Security Indicator & User Profile Pill */}
        <div className="flex items-center gap-3">
          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-white/70 hover:bg-white border border-slate-200/80 shadow-sm backdrop-blur-sm transition-all"
            >
              <Globe className="w-3.5 h-3.5 text-blue-600" />
              <span className="uppercase tracking-wider">{lang}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>
            {showLangMenu && (
              <div className="absolute right-0 mt-2 w-40 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95">
                <button
                  onClick={() => { setLang('en'); setShowLangMenu(false); }}
                  className={`w-full text-left px-4 py-2 text-xs flex items-center justify-between hover:bg-blue-50/80 transition-colors ${lang === 'en' ? 'font-bold text-blue-600' : 'text-slate-700'}`}
                >
                  <span>English</span>
                  {lang === 'en' && <span className="w-2 h-2 rounded-full bg-blue-600 shadow-sm"></span>}
                </button>
                <button
                  onClick={() => { setLang('ur'); setShowLangMenu(false); }}
                  className={`w-full text-left px-4 py-2 text-xs flex items-center justify-between hover:bg-blue-50/80 transition-colors ${lang === 'ur' ? 'font-bold text-blue-600' : 'text-slate-700'}`}
                >
                  <span>اردو (Urdu)</span>
                  {lang === 'ur' && <span className="w-2 h-2 rounded-full bg-blue-600 shadow-sm"></span>}
                </button>
                <button
                  onClick={() => { setLang('ps'); setShowLangMenu(false); }}
                  className={`w-full text-left px-4 py-2 text-xs flex items-center justify-between hover:bg-blue-50/80 transition-colors ${lang === 'ps' ? 'font-bold text-blue-600' : 'text-slate-700'}`}
                >
                  <span>پښتو (Pashto)</span>
                  {lang === 'ps' && <span className="w-2 h-2 rounded-full bg-blue-600 shadow-sm"></span>}
                </button>
              </div>
            )}
          </div>

          {/* User Profile Pill */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2.5 p-1.5 pr-3.5 rounded-2xl bg-white/80 hover:bg-white border border-slate-200/80 shadow-sm backdrop-blur-md transition-all group"
              >
                <div className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${roleStyle.gradient} text-white font-bold flex items-center justify-center text-xs shadow-md group-hover:scale-105 transition-transform`}>
                  {currentUser.fullName ? currentUser.fullName.charAt(0).toUpperCase() : currentUser.username.charAt(0).toUpperCase()}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-bold text-slate-800 leading-tight">
                    {currentUser.fullName || currentUser.username}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${roleStyle.dot} shadow-[0_0_8px]`}></span>
                    <span className={`inline-block px-1.5 py-0.2 text-[9px] font-extrabold rounded-md border uppercase tracking-wider ${roleStyle.badge}`}>
                      {currentUser.role.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-colors" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-slate-100 p-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100/80 mb-2">
                    <p className="text-xs font-bold text-slate-900 truncate">{currentUser.fullName || currentUser.username}</p>
                    <p className="text-[11px] text-slate-500 truncate font-mono mt-0.5">{currentUser.email || currentUser.username}</p>
                    <div className="mt-2 flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${roleStyle.dot}`}></span>
                      <span className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-lg border ${roleStyle.badge}`}>
                        {currentUser.role.replace('_', ' ')} Portal
                      </span>
                    </div>
                  </div>
                  <Link
                    href="/change-password"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-medium text-slate-700 hover:bg-blue-50/80 hover:text-blue-700 rounded-xl transition-all"
                  >
                    <KeyRound className="w-4 h-4 text-slate-400" />
                    <span>Change Password</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50/80 rounded-xl transition-all mt-1"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" />
                    <span>{dict.logout}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all hover:scale-[1.02]"
            >
              <User className="w-3.5 h-3.5" />
              <span>Portal Login</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
