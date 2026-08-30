'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Globe, 
  LogOut, 
  User, 
  Menu, 
  X,
  ChevronDown, 
  Sparkles, 
  KeyRound,
  ArrowRight,
  GraduationCap,
  BookOpen,
  PhoneCall,
  HelpCircle,
  Home
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
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<HeaderProps['user']>(user || null);
  const [lang, setLang] = useState<Language>('en');
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/#about' },
    { name: 'Admissions', href: '/admissions/apply' },
    { name: 'Learning Paths', href: '/#programs' },
    { name: 'Support', href: '/#support' },
    { name: 'Contact', href: '/#contact' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-orange-500/10 shadow-[0_4px_20px_-4px_rgba(249,115,22,0.06)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Official 3D THMS Logo */}
        <div className="flex items-center gap-3">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="p-2.5 rounded-2xl text-slate-700 hover:bg-orange-50/80 border border-slate-200/80 focus:outline-none transition-all lg:hidden"
              aria-label="Toggle Portal Sidebar"
            >
              <Menu className="w-5 h-5 text-orange-600" />
            </button>
          )}

          <Link href="/" className="flex items-center gap-3 group">
            {/* THMS 3D Metallic & Gold Crest */}
            <div className="h-14 sm:h-16 flex items-center justify-center transition-transform group-hover:scale-105">
              <img
                src="/logo.png"
                alt="THMS — The Hayatabad Model School"
                className="h-12 sm:h-14 w-auto object-contain drop-shadow-[0_4px_12px_rgba(249,115,22,0.25)]"
              />
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-2">
                <span className="font-black text-slate-900 tracking-tight text-base sm:text-lg">
                  The Hayatabad Model School
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-orange-50 text-orange-700 border border-orange-200/80">
                  <Sparkles className="w-3 h-3 text-orange-500" />
                  Session 2026-27
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Peshawar, Khyber Pakhtunkhwa • BISE Matriculation
              </p>
            </div>
          </Link>
        </div>

        {/* Center: Navigation Pill Bar (Matching Reference EEST Layout) */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-100/70 p-1.5 rounded-full border border-slate-200/60 shadow-inner">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-white text-orange-600 shadow-sm'
                    : 'text-slate-700 hover:text-orange-600 hover:bg-white/60'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Right: Language Selector + Action Buttons (Student Login & Orange Apply Now) */}
        <div className="flex items-center gap-2.5">
          {/* Language Selector */}
          <div className="relative hidden md:block">
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-bold text-slate-700 bg-white hover:bg-orange-50/50 border border-slate-200/80 shadow-sm transition-all"
            >
              <Globe className="w-3.5 h-3.5 text-orange-600" />
              <span className="uppercase tracking-wider">{lang}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>
            {showLangMenu && (
              <div className="absolute right-0 mt-2 w-40 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95">
                <button
                  onClick={() => { setLang('en'); setShowLangMenu(false); }}
                  className={`w-full text-left px-4 py-2 text-xs flex items-center justify-between hover:bg-orange-50 ${lang === 'en' ? 'font-bold text-orange-600' : 'text-slate-700'}`}
                >
                  <span>English</span>
                  {lang === 'en' && <span className="w-2 h-2 rounded-full bg-orange-600"></span>}
                </button>
                <button
                  onClick={() => { setLang('ur'); setShowLangMenu(false); }}
                  className={`w-full text-left px-4 py-2 text-xs flex items-center justify-between hover:bg-orange-50 ${lang === 'ur' ? 'font-bold text-orange-600' : 'text-slate-700'}`}
                >
                  <span>اردو (Urdu)</span>
                  {lang === 'ur' && <span className="w-2 h-2 rounded-full bg-orange-600"></span>}
                </button>
                <button
                  onClick={() => { setLang('ps'); setShowLangMenu(false); }}
                  className={`w-full text-left px-4 py-2 text-xs flex items-center justify-between hover:bg-orange-50 ${lang === 'ps' ? 'font-bold text-orange-600' : 'text-slate-700'}`}
                >
                  <span>پښتو (Pashto)</span>
                  {lang === 'ps' && <span className="w-2 h-2 rounded-full bg-orange-600"></span>}
                </button>
              </div>
            )}
          </div>

          {/* User Profile Pill or Student Login + Apply Now */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2.5 p-1.5 pr-3.5 rounded-2xl bg-white hover:bg-orange-50/50 border border-orange-500/20 shadow-sm transition-all group"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white font-bold flex items-center justify-center text-xs shadow-md group-hover:scale-105 transition-transform">
                  {currentUser.fullName ? currentUser.fullName.charAt(0).toUpperCase() : currentUser.username.charAt(0).toUpperCase()}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-bold text-slate-800 leading-tight">
                    {currentUser.fullName || currentUser.username}
                  </p>
                  <span className="inline-block px-1.5 py-0.2 text-[9px] font-black rounded-md bg-orange-100 text-orange-800 uppercase tracking-wider">
                    {currentUser.role.replace('_', ' ')}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-colors" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-slate-100 p-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="p-3 bg-orange-50/60 rounded-xl border border-orange-100 mb-2">
                    <p className="text-xs font-bold text-slate-900 truncate">{currentUser.fullName || currentUser.username}</p>
                    <p className="text-[11px] text-slate-500 truncate font-mono mt-0.5">{currentUser.email || currentUser.username}</p>
                    <span className="inline-block px-2 py-0.5 text-[10px] font-black rounded-lg bg-orange-100 text-orange-800 mt-2 border border-orange-200">
                      {currentUser.role.replace('_', ' ')} Portal
                    </span>
                  </div>
                  <Link
                    href="/change-password"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:bg-orange-50 hover:text-orange-700 rounded-xl transition-all"
                  >
                    <KeyRound className="w-4 h-4 text-slate-400" />
                    <span>Change Password</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-all mt-1"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" />
                    <span>{dict.logout}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold border border-slate-200 shadow-sm transition-all"
              >
                Student Login
              </Link>
              <Link
                href="/admissions/apply"
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white text-xs font-black shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all hover:scale-105 flex items-center gap-1.5"
              >
                <span>Apply Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-2xl text-slate-700 hover:bg-orange-50 border border-slate-200 lg:hidden"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white/95 backdrop-blur-xl border-b border-orange-500/10 p-4 space-y-3 shadow-xl animate-in slide-in-from-top duration-200">
          <div className="grid grid-cols-2 gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100 flex gap-2">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex-1 py-2.5 text-center rounded-xl bg-slate-100 text-slate-800 font-bold text-xs"
            >
              Student Login
            </Link>
            <Link
              href="/admissions/apply"
              onClick={() => setMobileMenuOpen(false)}
              className="flex-1 py-2.5 text-center rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 text-white font-bold text-xs shadow-md"
            >
              Apply Now
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
