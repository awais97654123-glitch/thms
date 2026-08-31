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
  MapPin,
  Mail,
  ShieldCheck,
  Building2,
  CalendarCheck,
  Users,
  Compass,
  Award
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
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [mobileMenuOpen]);

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
    { name: 'About Us', href: '/#about' },
    { name: 'Academics', href: '/#academics' },
    { name: 'Admissions', href: '/#admissions' },
    { name: 'Campus', href: '/#campus' },
    { name: 'Faculty', href: '/#faculty' },
    { name: 'News & Events', href: '/#news' },
    { name: 'Contact', href: '/#contact' },
  ];

  return (
    <>
      {/* ================================================================
          1. THIN NAVY TOP INFORMATION BAR
         ================================================================ */}
      <div className="bg-navy-950 text-slate-300 text-[11px] font-medium border-b border-gold-500/20 py-1.5 px-4 sm:px-6 lg:px-8 relative z-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
          {/* Left: Location & Contact */}
          <div className="flex items-center gap-4 text-slate-300">
            <div className="flex items-center gap-1.5 hover:text-gold-400 transition-colors">
              <MapPin className="w-3.5 h-3.5 text-gold-400 shrink-0" />
              <span className="truncate">Phase 3, Hayatabad, Peshawar, Pakistan</span>
            </div>
            <div className="hidden lg:flex items-center gap-1.5 text-slate-400">
              <span className="text-gold-500">•</span>
              <PhoneCall className="w-3 h-3 text-gold-400 shrink-0" />
              <span>+92 91 5828850</span>
            </div>
          </div>

          {/* Center: Admissions Announcement Badge */}
          <div className="hidden md:flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gold-500/15 border border-gold-500/30 text-gold-300 text-[10px] font-bold tracking-wide uppercase">
              <Sparkles className="w-3 h-3 text-gold-400" />
              Admissions Open 2026–2027
            </span>
            <span className="text-slate-400 text-[11px]">Limited Seats & Merit Scholarships</span>
          </div>

          {/* Right: Quick Portals & Language */}
          <div className="flex items-center gap-3">
            <Link 
              href="/parent" 
              className="text-slate-300 hover:text-gold-300 transition-colors flex items-center gap-1"
            >
              <Users className="w-3 h-3 text-gold-400" />
              <span>Parent Portal</span>
            </Link>
            <span className="text-navy-700">|</span>
            <Link 
              href="/student" 
              className="text-slate-300 hover:text-gold-300 transition-colors flex items-center gap-1"
            >
              <GraduationCap className="w-3 h-3 text-gold-400" />
              <span>Student Portal</span>
            </Link>
            <span className="text-navy-700">|</span>
            
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="flex items-center gap-1 text-slate-300 hover:text-gold-400 transition-colors"
                aria-label="Select language"
              >
                <Globe className="w-3 h-3 text-gold-400" />
                <span className="uppercase font-semibold">{lang}</span>
                <ChevronDown className="w-2.5 h-2.5" />
              </button>
              {showLangMenu && (
                <div className="absolute right-0 mt-1 w-32 bg-navy-900 border border-gold-500/30 rounded-lg shadow-xl py-1 z-50 text-slate-200">
                  <button
                    onClick={() => { setLang('en'); setShowLangMenu(false); }}
                    className={`w-full text-left px-3 py-1.5 text-[11px] flex items-center justify-between hover:bg-navy-800 ${lang === 'en' ? 'font-bold text-gold-400' : ''}`}
                  >
                    <span>English</span>
                    {lang === 'en' && <span className="w-1.5 h-1.5 rounded-full bg-gold-400" />}
                  </button>
                  <button
                    onClick={() => { setLang('ur'); setShowLangMenu(false); }}
                    className={`w-full text-left px-3 py-1.5 text-[11px] flex items-center justify-between hover:bg-navy-800 ${lang === 'ur' ? 'font-bold text-gold-400' : ''}`}
                  >
                    <span>اردو (Urdu)</span>
                    {lang === 'ur' && <span className="w-1.5 h-1.5 rounded-full bg-gold-400" />}
                  </button>
                  <button
                    onClick={() => { setLang('ps'); setShowLangMenu(false); }}
                    className={`w-full text-left px-3 py-1.5 text-[11px] flex items-center justify-between hover:bg-navy-800 ${lang === 'ps' ? 'font-bold text-gold-400' : ''}`}
                  >
                    <span>پښتو (Pashto)</span>
                    {lang === 'ps' && <span className="w-1.5 h-1.5 rounded-full bg-gold-400" />}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================
          2. MAIN PRESTIGE NAVIGATION BAR
         ================================================================ */}
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-md border-b border-gold-500/20 shadow-md py-2.5'
            : 'bg-white/90 backdrop-blur-sm border-b border-slate-100 py-3.5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          
          {/* LEFT: School Crest & Formal Academic Brand */}
          <div className="flex items-center gap-3">
            {onToggleSidebar && (
              <button
                onClick={onToggleSidebar}
                className="p-2 rounded-lg text-slate-700 hover:bg-gold-50 border border-slate-200 focus:outline-none transition-all lg:hidden"
                aria-label="Toggle Portal Sidebar"
              >
                <Menu className="w-5 h-5 text-navy-900" />
              </button>
            )}

            <Link href="/" className="flex items-center gap-3 group">
              <div className="h-12 sm:h-14 w-auto flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                <img
                  src="/logo.png"
                  alt="The Hayatabad Model School Crest"
                  className="h-11 sm:h-13 w-auto object-contain filter drop-shadow-sm"
                />
              </div>
              <div className="text-left">
                <span className="font-serif font-bold text-navy-950 tracking-tight text-base sm:text-lg block leading-tight group-hover:text-gold-700 transition-colors">
                  THE HAYATABAD MODEL SCHOOL
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-gold-600 block">
                  Peshawar • Established 1998
                </span>
              </div>
            </Link>
          </div>

          {/* CENTER: Desktop Main Navigation */}
          <nav className="hidden xl:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-3 py-2 text-xs font-semibold tracking-wide transition-all duration-200 rounded-lg relative ${
                    isActive
                      ? 'text-gold-600 font-bold bg-gold-50/80'
                      : 'text-slate-700 hover:text-navy-950 hover:bg-slate-50'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* RIGHT: Action Buttons + User Session */}
          <div className="flex items-center gap-2.5">
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-navy-900 text-white hover:bg-navy-800 transition-all text-xs font-medium border border-gold-500/30"
                >
                  <div className="w-5 h-5 rounded-full bg-gold-500 text-navy-950 flex items-center justify-center font-bold text-[10px]">
                    {currentUser.username?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="max-w-[100px] truncate hidden sm:inline">
                    {currentUser.fullName || currentUser.username}
                  </span>
                  <ChevronDown className="w-3 h-3 text-gold-400" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-2xl border border-slate-100 py-2 z-50 text-slate-800">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-navy-950 truncate">
                        {currentUser.fullName || currentUser.username}
                      </p>
                      <p className="text-[10px] text-gold-600 font-semibold uppercase tracking-wider">
                        {currentUser.role}
                      </p>
                    </div>
                    <Link
                      href={`/${currentUser.role.toLowerCase()}`}
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                    >
                      <Building2 className="w-3.5 h-3.5 text-navy-900" />
                      <span>Go to Dashboard</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left flex items-center gap-2 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 border-t border-slate-100"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold text-navy-900 bg-slate-100 hover:bg-navy-900 hover:text-white border border-slate-200 transition-all"
                >
                  <KeyRound className="w-3.5 h-3.5 text-gold-500" />
                  <span>Portal Login</span>
                </Link>

                <Link
                  href="/admissions/apply"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-navy-950 btn-gold-prestige"
                >
                  <span>Apply Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100 hover:text-navy-950 border border-slate-200 transition-colors"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6 text-navy-950" /> : <Menu className="w-6 h-6 text-navy-950" />}
            </button>
          </div>
        </div>
      </header>

      {/* ================================================================
          3. MOBILE SLIDE-OVER / DRAWER NAVIGATION
         ================================================================ */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 xl:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-navy-950/70 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Container */}
          <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-white shadow-2xl flex flex-col z-50 border-l border-gold-500/30">
            {/* Drawer Top */}
            <div className="p-4 bg-navy-950 text-white flex items-center justify-between border-b border-gold-500/20">
              <div className="flex items-center gap-2">
                <img src="/logo.png" alt="School Logo" className="h-8 w-auto" />
                <div>
                  <span className="font-serif text-xs font-bold block text-white">Hayatabad Model School</span>
                  <span className="text-[9px] uppercase tracking-widest text-gold-400">Peshawar • 1998</span>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-navy-800"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Navigation Links */}
            <div className="flex-1 overflow-y-auto p-4 space-y-1">
              <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 px-3 py-1">
                Main Navigation
              </p>
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-800 hover:bg-gold-50 hover:text-gold-700 transition-all"
                >
                  <span>{link.name}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </Link>
              ))}

              <div className="gold-hairline my-4" />

              <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 px-3 py-1">
                Portals & Services
              </p>
              <Link
                href="/parent"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100"
              >
                <Users className="w-4 h-4 text-gold-600" />
                <span>Parent Portal</span>
              </Link>
              <Link
                href="/student"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100"
              >
                <GraduationCap className="w-4 h-4 text-gold-600" />
                <span>Student Portal</span>
              </Link>
              <Link
                href="/teacher"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100"
              >
                <BookOpen className="w-4 h-4 text-gold-600" />
                <span>Faculty Portal</span>
              </Link>
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100"
              >
                <Building2 className="w-4 h-4 text-gold-600" />
                <span>Administration ERP</span>
              </Link>
            </div>

            {/* Drawer Bottom Action */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-2">
              <Link
                href="/admissions/apply"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-xs font-bold text-navy-950 btn-gold-prestige"
              >
                <span>Apply for Admission</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-xs font-bold text-navy-900 bg-white border border-slate-200 hover:bg-slate-100"
              >
                <KeyRound className="w-3.5 h-3.5 text-gold-600" />
                <span>Staff / Student Login</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
