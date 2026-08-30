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
    { name: 'Learning Paths', href: '/#classes' },
    { name: 'Support', href: '/#support' },
    { name: 'Contact', href: '/#contact' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-2xl border-b border-orange-500/10 shadow-[0_4px_30px_rgba(249,115,22,0.06)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        
        {/* Left: Prominent 3D Metallic THMS Logo (Clean, No extra session/school text beside it) */}
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

          <Link href="/" className="flex items-center group">
            <div className="h-16 flex items-center justify-center transition-all duration-300 group-hover:scale-105">
              <img
                src="/logo.png"
                alt="THMS Logo"
                className="h-14 sm:h-16 w-auto object-contain drop-shadow-[0_4px_16px_rgba(249,115,22,0.35)] filter hover:brightness-105 transition-all"
              />
            </div>
          </Link>
        </div>

        {/* Center: Clean Standalone Navigation Buttons (No bounding box / gray container) */}
        <nav className="hidden lg:flex items-center gap-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`px-4 py-2 rounded-2xl text-xs font-black transition-all duration-200 ${
                  isActive
                    ? 'bg-orange-500/10 text-orange-600 border border-orange-300 shadow-sm'
                    : 'text-slate-800 hover:text-orange-600 hover:bg-orange-50/80 border border-transparent hover:border-orange-200/70 hover:scale-105'
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
              className="flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-black text-slate-700 bg-white hover:bg-orange-50/70 border border-slate-200 shadow-sm transition-all hover:scale-105"
            >
              <Globe className="w-3.5 h-3.5 text-orange-600" />
              <span className="uppercase tracking-wider">{lang}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>
            {showLangMenu && (
              <div className="absolute right-0 mt-2 w-40 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95">
                <button
                  onClick={() => { setLang('en'); setShowLangMenu(false); }}
                  className={`w-full text-left px-4 py-2 text-xs flex items-center justify-between hover:bg-orange-50 ${lang === 'en' ? 'font-black text-orange-600' : 'text-slate-700'}`}
                >
                  <span>English</span>
                  {lang === 'en' && <span className="w-2 h-2 rounded-full bg-orange-600"></span>}
                </button>
                <button
                  onClick={() => { setLang('ur'); setShowLangMenu(false); }}
                  className={`w-full text-left px-4 py-2 text-xs flex items-center justify-between hover:bg-orange-50 ${lang === 'ur' ? 'font-black text-orange-600' : 'text-slate-700'}`}
                >
                  <span>اردو (Urdu)</span>
                  {lang === 'ur' && <span className="w-2 h-2 rounded-full bg-orange-600"></span>}
                </button>
                <button
                  onClick={() => { setLang('ps'); setShowLangMenu(false); }}
                  className={`w-full text-left px-4 py-2 text-xs flex items-center justify-between hover:bg-orange-50 ${lang === 'ps' ? 'font-black text-orange-600' : 'text-slate-700'}`}
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
                className="flex items-center gap-2.5 p-1.5 pr-3.5 rounded-2xl bg-white hover:bg-orange-50/50 border border-orange-500/20 shadow-sm transition-all group hover:scale-105"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white font-black flex items-center justify-center text-xs shadow-md group-hover:scale-105 transition-transform">
                  {currentUser.fullName ? currentUser.fullName.charAt(0).toUpperCase() : currentUser.username.charAt(0).toUpperCase()}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-black text-slate-900 leading-tight">
                    {currentUser.fullName || currentUser.username}
                  </p>
                  <p className="text-[10px] text-orange-600 font-bold uppercase tracking-wider">
                    {currentUser.role.replace('_', ' ')}
                  </p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-colors" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-slate-100 py-3 px-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-2 border-b border-slate-100 mb-2">
                    <p className="text-xs font-black text-slate-900">{currentUser.fullName || currentUser.username}</p>
                    <p className="text-[11px] text-slate-500 font-mono truncate">{currentUser.email || currentUser.username}</p>
                    <span className="inline-block mt-1.5 px-2 py-0.5 rounded-md bg-orange-50 text-orange-700 font-black text-[9px] border border-orange-200">
                      {currentUser.role}
                    </span>
                  </div>

                  <Link
                    href={`/${currentUser.role === 'SUPER_ADMIN' ? 'admin' : currentUser.role.toLowerCase()}`}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-orange-50 hover:text-orange-600 rounded-xl transition-all"
                  >
                    <User className="w-4 h-4 text-orange-500" />
                    <span>Open {currentUser.role} Portal</span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-all mt-1"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200/80 text-slate-800 text-xs font-black transition-all hover:scale-105 border border-slate-200/80 shadow-sm"
              >
                Student Login
              </Link>
              <Link
                href="/admissions/apply"
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white text-xs font-black shadow-lg shadow-orange-500/30 flex items-center gap-2 transition-all hover:scale-105 hover:shadow-orange-500/40"
              >
                <span>Apply Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          {/* Mobile Hamburger Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2.5 rounded-2xl text-slate-700 hover:bg-orange-50/80 border border-slate-200/80 focus:outline-none transition-all lg:hidden"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-orange-600" /> : <Menu className="w-5 h-5 text-slate-700" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white/95 backdrop-blur-2xl border-b border-orange-500/10 px-4 py-6 space-y-4 animate-in slide-in-from-top-4 duration-200">
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 rounded-2xl text-sm font-black text-slate-800 hover:bg-orange-50 hover:text-orange-600 transition-all"
              >
                {link.name}
              </Link>
            ))}
          </nav>
          <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-3 text-center rounded-2xl bg-slate-100 text-slate-900 font-black text-xs"
            >
              Student & Parent Login
            </Link>
            <Link
              href="/admissions/apply"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-3 text-center rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 text-white font-black text-xs shadow-lg shadow-orange-500/30"
            >
              Apply Online Now ➔
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
