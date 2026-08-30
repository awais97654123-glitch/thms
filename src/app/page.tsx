import React from 'react';
import Link from 'next/link';
import { 
  GraduationCap, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  BookOpen, 
  Award, 
  Users, 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  ShieldCheck, 
  Laptop, 
  Microscope, 
  Bus,
  Search
} from 'lucide-react';
import Header from '@/components/common/Header';
import DemoRoleSwitcher from '@/components/common/DemoRoleSwitcher';

export default function PublicHomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* 1-Click Demo Fast Switcher Bar for instant tester access */}
      <DemoRoleSwitcher />
      
      {/* Top Header */}
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-950 via-slate-900 to-slate-950 text-white py-20 lg:py-28 px-4 sm:px-6 lg:px-8">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-emerald-600/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold shadow-inner">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Admissions Open for Academic Session 2026-2027</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
              Nurturing Future Leaders in{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-emerald-300 to-amber-300">
                Hayatabad, Peshawar
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
              The Hayatabad Model School provides world-class STEM education, character building, and academic excellence from Nursery to Matriculation (SSC BISE Peshawar) with state-of-the-art campus infrastructure.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                href="/admissions/apply"
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-bold text-sm shadow-lg shadow-blue-500/25 flex items-center gap-2 transition-all hover:scale-105"
              >
                <span>Apply for Online Admission</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/admissions/track"
                className="px-6 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700 flex items-center gap-2 transition-all"
              >
                <Search className="w-4 h-4 text-blue-400" />
                <span>Track Application Status</span>
              </Link>
            </div>

            {/* Key Badges */}
            <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-800 text-left">
              <div>
                <span className="block text-xl sm:text-2xl font-bold text-white">100%</span>
                <span className="text-[11px] text-slate-400">BISE Matric Pass Rate</span>
              </div>
              <div>
                <span className="block text-xl sm:text-2xl font-bold text-white">1:20</span>
                <span className="text-[11px] text-slate-400">Teacher-Student Ratio</span>
              </div>
              <div>
                <span className="block text-xl sm:text-2xl font-bold text-white">100+</span>
                <span className="text-[11px] text-slate-400">Board Positions & Medals</span>
              </div>
            </div>
          </div>

          {/* Right Card / Interactive Preview */}
          <div className="lg:col-span-5">
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-xl relative space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl overflow-hidden bg-white flex items-center justify-center p-0.5 shadow-md border border-slate-700">
                    <img
                      src="/school-logo.png"
                      alt="THMS Crest"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">School Portals Access</h3>
                    <p className="text-xs text-slate-400">Unified Digital Campus Hub</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                  Online
                </span>
              </div>

              {/* Portal Links */}
              <div className="space-y-2.5">
                <Link
                  href="/login"
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-red-500/20 text-red-400">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white group-hover:text-blue-300 transition-colors">
                        Admin & Staff ERP
                      </p>
                      <p className="text-[11px] text-slate-400">Admissions, Attendance, Finance & Exams</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
                </Link>

                <Link
                  href="/login"
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white group-hover:text-emerald-300 transition-colors">
                        Teacher Portal
                      </p>
                      <p className="text-[11px] text-slate-400">My Classes, Mark Attendance & Enter Marks</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
                </Link>

                <Link
                  href="/login"
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white group-hover:text-blue-300 transition-colors">
                        Student Portal
                      </p>
                      <p className="text-[11px] text-slate-400">ID Card, Timetable, Results & Homework</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
                </Link>

                <Link
                  href="/login"
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white group-hover:text-amber-300 transition-colors">
                        Parent & Guardian Portal
                      </p>
                      <p className="text-[11px] text-slate-400">Multi-Child Tracking, Fee Receipts & Results</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
                </Link>
              </div>

              <div className="p-3 bg-blue-950/60 border border-blue-800/50 rounded-xl text-center">
                <p className="text-[11px] text-blue-200">
                  New student? <Link href="/admissions/apply" className="font-bold text-white underline ml-1">Submit admission form online</Link> in under 3 minutes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Academic Divisions Section */}
      <section className="py-16 bg-slate-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider">
              Academic Divisions
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
              Comprehensive Curriculum from Early Years to SSC
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2">
              Tailored learning pathways fostering scientific inquiry, linguistic fluency, and moral integrity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Early Years Wing</h3>
              <p className="text-xs font-semibold text-pink-600 mt-0.5">Nursery & Prep</p>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Play-based sensory learning, phonics foundation, interactive numeracy, and motor skills development.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Primary School</h3>
              <p className="text-xs font-semibold text-emerald-600 mt-0.5">Class 1 to Class 5</p>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Strong bilingual literacy (English/Urdu), foundational sciences, arts, and creative problem solving.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
                <Microscope className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Middle School</h3>
              <p className="text-xs font-semibold text-blue-600 mt-0.5">Class 6 to Class 8</p>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Advanced STEM labs, computer science coding, Islamic studies, social studies, and public speaking.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-4">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Secondary Wing (SSC)</h3>
              <p className="text-xs font-semibold text-purple-600 mt-0.5">Class 9 & Class 10 (Science)</p>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Intensive BISE Peshawar board preparation in Physics, Chemistry, Biology, Mathematics & Computer Science.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Campus Infrastructure Highlights */}
      <section className="py-16 bg-white px-4 sm:px-6 lg:px-8 border-t border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">
              Campus Facilities
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
              Purpose-Built 5-Acre Campus in Phase 6 Hayatabad
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
              <Laptop className="w-8 h-8 text-blue-600 mb-3" />
              <h4 className="font-bold text-slate-900 text-sm">Smart Robotics & IT Labs</h4>
              <p className="text-xs text-slate-600 mt-1">
                40+ high-speed workstations with fiber internet and robotics programming kits.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
              <Microscope className="w-8 h-8 text-emerald-600 mb-3" />
              <h4 className="font-bold text-slate-900 text-sm">Advanced Science Laboratories</h4>
              <p className="text-xs text-slate-600 mt-1">
                Dedicated Physics, Chemistry, and Biology laboratories equipped with modern apparatus.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
              <Bus className="w-8 h-8 text-amber-600 mb-3" />
              <h4 className="font-bold text-slate-900 text-sm">Dedicated AC Transport Fleet</h4>
              <p className="text-xs text-slate-600 mt-1">
                Safe Toyota Coaster fleet covering all phases of Hayatabad and Peshawar city.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-300 py-12 px-4 sm:px-6 lg:px-8 mt-auto border-t border-slate-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 text-xs">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center">
                H
              </div>
              <span className="font-bold text-white text-sm">The Hayatabad Model School</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Excellence in Education, Character & Innovation since 1998. Registered with Directorate of Education KPK.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3">Quick Portals</h4>
            <ul className="space-y-2 text-[11px]">
              <li><Link href="/login" className="hover:text-white">Admin Management ERP</Link></li>
              <li><Link href="/login" className="hover:text-white">Teacher Portal</Link></li>
              <li><Link href="/login" className="hover:text-white">Student Portal</Link></li>
              <li><Link href="/login" className="hover:text-white">Parent Portal</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3">Admissions</h4>
            <ul className="space-y-2 text-[11px]">
              <li><Link href="/admissions/apply" className="hover:text-white">Online Admission Form</Link></li>
              <li><Link href="/admissions/track" className="hover:text-white">Track Application</Link></li>
              <li><span className="text-slate-400">Fee Structure 2026</span></li>
              <li><span className="text-slate-400">Scholarship Criteria</span></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3">Campus Contact</h4>
            <p className="text-slate-400 text-[11px]">Sector F-4, Phase 6, Hayatabad, Peshawar, KPK</p>
            <p className="text-slate-400 text-[11px] mt-1">Phone: +92 91 5828100</p>
            <p className="text-slate-400 text-[11px]">Email: admissions@hayatabadmodel.edu.pk</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto border-t border-slate-900 mt-8 pt-6 text-center text-[10px] text-slate-500">
          © 2026 The Hayatabad Model School. All Rights Reserved. Full School Management ERP System.
        </div>
      </footer>
    </div>
  );
}
