'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  ArrowRight, 
  GraduationCap, 
  ShieldCheck, 
  Award, 
  Users, 
  BookOpen, 
  CalendarCheck, 
  PhoneCall, 
  MapPin, 
  Mail, 
  CheckCircle2, 
  ChevronRight, 
  Compass, 
  Cpu, 
  Palette, 
  Mic, 
  Zap, 
  Star, 
  Clock, 
  HelpCircle,
  School,
  ExternalLink,
  ChevronDown,
  Building2,
  Lock
} from 'lucide-react';
import Header from '@/components/common/Header';

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const classesCatalog = [
    { name: 'Playgroup', level: 'Early Montessori', age: 'Age 3-4', badge: 'Play & Learn', desc: 'Sensory exploration, motor skills development, phonics, and socialization in a caring Montessori environment.', color: 'from-orange-500 to-amber-500' },
    { name: 'Nursery', level: 'Early Montessori', age: 'Age 4-5', badge: 'Foundation', desc: 'Alphabet phonetics, basic number concepts, Urdu/English vocabulary, and creative artistic expression.', color: 'from-amber-500 to-orange-500' },
    { name: 'Prep / KG', level: 'Kindergarten', age: 'Age 5-6', badge: 'Pre-Primary', desc: 'Sentence formation, elementary arithmetic, Islamic morals, and environmental awareness.', color: 'from-orange-600 to-amber-600' },
    { name: 'Class 1', level: 'Primary Wing', age: 'Age 6-7', badge: 'Primary', desc: 'Fundamental literacy, mental math, basic computer concepts, and general science exploration.', color: 'from-slate-900 to-slate-800' },
    { name: 'Class 2', level: 'Primary Wing', age: 'Age 7-8', badge: 'Primary', desc: 'Creative writing, addition/subtraction problem solving, and social studies foundations.', color: 'from-slate-900 to-slate-800' },
    { name: 'Class 3', level: 'Primary Wing', age: 'Age 8-9', badge: 'Primary', desc: 'Multiplication/division mastery, Urdu grammar, English comprehension, and science experiments.', color: 'from-slate-900 to-slate-800' },
    { name: 'Class 4', level: 'Primary Wing', age: 'Age 9-10', badge: 'Primary', desc: 'Critical thinking, computer programming basics, geography, and language fluency.', color: 'from-slate-900 to-slate-800' },
    { name: 'Class 5', level: 'Primary Capstone', age: 'Age 10-11', badge: 'Primary Capstone', desc: 'Preparation for middle school, advanced arithmetic, science labs, and bilingual debate.', color: 'from-orange-500 to-amber-600' },
    { name: 'Class 6', level: 'Middle Wing', age: 'Age 11-12', badge: 'Middle School', desc: 'Integrated sciences, algebraic expressions, computer science, and Pakistan studies.', color: 'from-slate-900 to-slate-800' },
    { name: 'Class 7', level: 'Middle Wing', age: 'Age 12-13', badge: 'Middle School', desc: 'Physics/Chemistry/Biology foundations, geometric proofs, and robotics workshop orientation.', color: 'from-slate-900 to-slate-800' },
    { name: 'Class 8', level: 'Pre-Matric', age: 'Age 13-14', badge: 'Pre-Matric Capstone', desc: 'Rigorous preparatory curriculum aligned with BISE Peshawar Board standards.', color: 'from-orange-600 to-amber-700' },
    { name: 'Class 9', level: 'Secondary (Matric-I)', age: 'Age 14-15', badge: 'BISE Matric Part 1', desc: 'Specialized science (Bio/Comp) & humanities tracks under BISE Peshawar board registration.', color: 'from-slate-950 to-orange-950' },
    { name: 'Class 10', level: 'Secondary (Matric-II)', age: 'Age 15-16', badge: 'BISE Matric Part 2', desc: 'Board exam mastery, intensive mock examinations, laboratory practicals, and career counseling.', color: 'from-slate-950 to-orange-950' },
  ];

  const academicWings = [
    {
      title: 'Pre-Primary Montessori',
      grades: 'Playgroup, Nursery & Prep',
      description: 'Activity-based sensory learning, phonics mastery, cognitive growth, and emotional nurturing in custom-designed child-safe spaces.',
      icon: Sparkles,
      color: 'bg-orange-50 text-orange-600 border-orange-200',
    },
    {
      title: 'Primary Foundation Wing',
      grades: 'Class 1 to Class 5',
      description: 'Concept-oriented bilingual literacy, mental mathematics, science laboratory experiments, and character development ethics.',
      icon: BookOpen,
      color: 'bg-amber-50 text-amber-600 border-amber-200',
    },
    {
      title: 'Middle STEM Wing',
      grades: 'Class 6 to Class 8',
      description: 'Hands-on robotics, computer programming, physics/chemistry labs, and preparation for board examination excellence.',
      icon: Cpu,
      color: 'bg-orange-50 text-orange-700 border-orange-200',
    },
    {
      title: 'High School BISE Board Wing',
      grades: 'Class 9 & Class 10 (Matric)',
      description: 'Rigorous BISE Peshawar board preparation, Science/Computer/Arts streams, past paper workshops, and academic scholarships.',
      icon: Award,
      color: 'bg-slate-900 text-orange-400 border-slate-700',
    },
  ];

  const faqs = [
    { q: 'How can I submit an online admission application for Session 2026-2027?', a: 'Click on the "Apply Now" button on any class card. Fill in student details, parent contact, and attach a photograph. You will receive an instant application tracking ID.' },
    { q: 'What curriculum is followed at The Hayatabad Model School?', a: 'We follow the standardized National Curriculum aligned with BISE Peshawar Board for Matric, enriched with modern Oxford & Cambridge supplementary materials for STEM and languages.' },
    { q: 'Are merit and need-based scholarships available?', a: 'Yes! We offer 100% and 50% tuition scholarships for academic position holders, orphans, and siblings.' },
    { q: 'How does the Smart Attendance and QR gate system work?', a: 'Every student receives an official Smart ID card with an encrypted QR pass. Attendance is logged in real-time at the school gate and synced instantly with parents\' portals.' },
  ];

  return (
    <div className="min-h-screen bg-[#fcfcfc] text-slate-900 mesh-orange-bg subtle-grid-orange flex flex-col font-sans selection:bg-orange-500 selection:text-white">
      {/* Universal Sticky Header (Clean 3D Logo + Center Nav + Action Buttons) */}
      <Header />

      {/* HERO SECTION — Fully Animated on Load with Official School Headings & Glowing Effects */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-32">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-gradient-to-tr from-orange-500/20 via-amber-500/15 to-transparent rounded-full blur-3xl pointer-events-none -z-10 animate-pulse"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          {/* Main Hero Header Stack with Staggered Entrance Animations */}
          <div className="text-center space-y-6 max-w-4xl mx-auto">
            
            {/* Animated Badge */}
            <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-orange-500/10 text-orange-700 text-xs font-black border border-orange-500/25 shadow-sm backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-700">
              <Sparkles className="w-4 h-4 text-orange-600 animate-spin" />
              <span>Phase 3, Hayatabad, Peshawar • Established 1998 (28+ Years of Excellence)</span>
            </div>

            {/* Main Headline (Animated Staggered Glow) */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-950 leading-[1.1] animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
              The Hayatabad Model School
              <span className="block mt-2 bg-gradient-to-r from-orange-600 via-amber-500 to-orange-500 bg-clip-text text-transparent drop-shadow-sm">
                Admissions Open 2026-2027
              </span>
            </h1>

            {/* Sub-headline Text */}
            <p className="text-base sm:text-xl text-slate-600 font-medium leading-relaxed max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
              Empowering future leaders from <strong className="text-slate-900 font-bold">Playgroup to Class 10 (Matric)</strong> with state-of-the-art AI labs, robotics, bilingual English fluency, and proven BISE Peshawar Board position holders.
            </p>

            {/* Floating Feature Pills (Animated Slide-in) */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/90 shadow-md shadow-orange-500/5 text-slate-800 text-xs font-black border border-orange-500/20 hover:scale-105 transition-transform">
                <Cpu className="w-4 h-4 text-orange-600" />
                <span>Modern Computer & AI Lab</span>
              </span>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/90 shadow-md shadow-orange-500/5 text-slate-800 text-xs font-black border border-orange-500/20 hover:scale-105 transition-transform">
                <Compass className="w-4 h-4 text-amber-600" />
                <span>Robotics & STEM Education</span>
              </span>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/90 shadow-md shadow-orange-500/5 text-slate-800 text-xs font-black border border-orange-500/20 hover:scale-105 transition-transform">
                <Palette className="w-4 h-4 text-orange-500" />
                <span>Creative Arts Studio</span>
              </span>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/90 shadow-md shadow-orange-500/5 text-slate-800 text-xs font-black border border-orange-500/20 hover:scale-105 transition-transform">
                <Mic className="w-4 h-4 text-amber-500" />
                <span>Public Speaking & Fluency</span>
              </span>
            </div>

            {/* Primary Action Buttons & 100% Scholarship Banner */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-400">
              <Link
                href="/admissions/apply"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-black text-sm shadow-xl shadow-orange-500/30 flex items-center justify-center gap-3 transition-all hover:scale-105 hover:shadow-orange-500/40"
              >
                <span>Apply Online for Admission 2026-27</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#classes"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/90 hover:bg-white text-slate-800 font-black text-sm border border-slate-300 shadow-md shadow-slate-200/50 flex items-center justify-center gap-2 transition-all hover:scale-105"
              >
                <span>Explore All 13 Classes</span>
                <ChevronDown className="w-4 h-4 text-orange-600" />
              </a>
            </div>

            {/* Scholarship & Merit Discount Bar */}
            <div className="pt-2 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700 delay-500">
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-orange-500/10 border border-orange-500/20 text-xs text-orange-950 font-bold flex items-center justify-center gap-2">
                <Award className="w-4 h-4 text-orange-600 shrink-0" />
                <span>100% Merit & Need-Based Tuition Scholarships Available for High Achievers & Siblings</span>
              </div>
            </div>
          </div>

          {/* 4 Interactive KPI Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 pt-6">
            <div className="glass-panel p-6 rounded-3xl border border-white shadow-sm hover:shadow-md transition-all text-center space-y-2 group">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-600 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                <School className="w-6 h-6" />
              </div>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">28+</h3>
              <p className="text-xs font-bold text-slate-500">Years of Academic Legacy</p>
            </div>

            <div className="glass-panel p-6 rounded-3xl border border-white shadow-sm hover:shadow-md transition-all text-center space-y-2 group">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">100%</h3>
              <p className="text-xs font-bold text-slate-500">BISE Matric Board Pass Rate</p>
            </div>

            <div className="glass-panel p-6 rounded-3xl border border-white shadow-sm hover:shadow-md transition-all text-center space-y-2 group">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-600 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">13</h3>
              <p className="text-xs font-bold text-slate-500">Complete Classes (Playgroup - 10)</p>
            </div>

            <div className="glass-panel p-6 rounded-3xl border border-white shadow-sm hover:shadow-md transition-all text-center space-y-2 group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">100%</h3>
              <p className="text-xs font-bold text-slate-500">Secure Campus & QR Tracking</p>
            </div>
          </div>

        </div>
      </section>

      {/* COMPLETE 13 CLASSES DIRECTORY SECTION (Playgroup to Class 10) */}
      <section id="classes" className="py-16 bg-white/70 backdrop-blur-md border-y border-orange-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <span className="text-xs font-black uppercase tracking-wider text-orange-600 bg-orange-50 px-3.5 py-1 rounded-full border border-orange-200">
              Complete Academic Roster
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
              Admissions Open Across All 13 Classes
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
              Select your child&apos;s class below for detailed curriculum outlines and 1-click online admission registration.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classesCatalog.map((cls, idx) => (
              <div
                key={cls.name}
                className="glass-panel p-6 sm:p-7 rounded-3xl border border-white shadow-sm hover:shadow-xl transition-all duration-300 space-y-5 flex flex-col justify-between group hover:-translate-y-1"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-orange-600">
                        {cls.level}
                      </span>
                      <h3 className="text-xl font-black text-slate-950 tracking-tight group-hover:text-orange-600 transition-colors">
                        {cls.name}
                      </h3>
                    </div>
                    <span className="px-3 py-1 rounded-full text-[10px] font-black bg-orange-50 text-orange-800 border border-orange-200 shrink-0">
                      {cls.age}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 font-medium leading-relaxed bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100">
                    {cls.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                  <span className="text-[10px] font-mono font-bold text-slate-400">
                    Session 2026-27
                  </span>
                  <Link
                    href={`/admissions/apply?class=${encodeURIComponent(cls.name)}`}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-orange-500/20 transition-all group-hover:scale-105"
                  >
                    <span>Apply for {cls.name}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4 SPECIALIZED ACADEMIC WINGS */}
      <section id="about" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <span className="text-xs font-black uppercase tracking-wider text-orange-600 bg-orange-50 px-3.5 py-1 rounded-full border border-orange-200">
              Structured Learning Stages
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
              Four Wings of Educational Excellence
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
              Every academic division features dedicated specialist faculty, modern science & computer labs, and age-tailored environments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {academicWings.map((wing, idx) => {
              const Icon = wing.icon;
              return (
                <div
                  key={wing.title}
                  className="glass-panel p-8 rounded-3xl border border-white shadow-sm space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-2xl border ${wing.color} shadow-sm`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-black text-lg text-slate-900">{wing.title}</h3>
                        <span className="text-xs font-bold text-orange-600">{wing.grades}</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      {wing.description}
                    </p>
                  </div>

                  <div className="pt-2">
                    <Link
                      href="/admissions/apply"
                      className="inline-flex items-center gap-2 text-xs font-black text-orange-600 hover:text-orange-700"
                    >
                      <span>Register for this Wing</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4-STEP ADMISSION PROCEDURE */}
      <section className="py-16 bg-gradient-to-br from-orange-50/50 via-amber-50/30 to-transparent border-y border-orange-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <span className="text-xs font-black uppercase tracking-wider text-orange-600 bg-white px-3.5 py-1 rounded-full border border-orange-200">
              Hassle-Free Process
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
              4 Simple Steps to Complete Admission
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Submit Online Application', desc: 'Fill out our fast digital admission form and attach your child&apos;s photo in under 3 minutes.' },
              { step: '02', title: 'Review & Interview Call', desc: 'Our admissions desk reviews the application and schedules an interview / evaluation.' },
              { step: '03', title: 'Receive 3-Copy Voucher', desc: 'Get your official admission confirmation, student ID, and 3-copy fee voucher.' },
              { step: '04', title: 'Smart Pass & Orientation', desc: 'Receive your smart QR ID card, uniform guidelines, and welcome orientation schedule.' },
            ].map((st, idx) => (
              <div key={idx} className="bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-orange-500/15 shadow-sm space-y-3">
                <span className="text-3xl font-black text-orange-500/40 block font-mono">{st.step}</span>
                <h3 className="font-black text-sm text-slate-900">{st.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">{st.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ ACCORDION SECTION */}
      <section id="support" className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-black uppercase tracking-wider text-orange-600 bg-orange-50 px-3.5 py-1 rounded-full border border-orange-200">
              Got Questions?
            </span>
            <h2 className="text-3xl font-black text-slate-950 tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 hover:bg-orange-50/40 transition-colors"
                >
                  <span className="font-black text-xs sm:text-sm text-slate-900">{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-orange-600 transition-transform ${openFaq === idx ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3 font-medium">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CAMPUS CONTACT & LOCATION */}
      <section id="contact" className="py-16 bg-slate-950 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs font-black border border-orange-400/30">
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Admissions Helpline & Campus Visit</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              Visit The Hayatabad Model School
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
              We invite parents to visit our state-of-the-art campus, meet faculty specialists, and inspect our computer, robotics, and science laboratories.
            </p>

            <div className="space-y-3 text-xs">
              <p className="flex items-center gap-3 text-slate-300">
                <MapPin className="w-4 h-4 text-orange-400 shrink-0" />
                <span>Phase 3, Hayatabad, Peshawar, Khyber Pakhtunkhwa, Pakistan</span>
              </p>
              <p className="flex items-center gap-3 text-slate-300">
                <PhoneCall className="w-4 h-4 text-orange-400 shrink-0" />
                <span>+92 91 5828100 / +92 300 1234567</span>
              </p>
              <p className="flex items-center gap-3 text-slate-300">
                <Mail className="w-4 h-4 text-orange-400 shrink-0" />
                <span>admissions@hayatabadmodel.edu.pk</span>
              </p>
            </div>
          </div>

          <div className="bg-slate-900/80 p-8 rounded-3xl border border-orange-500/20 backdrop-blur-xl space-y-4">
            <h3 className="font-black text-base text-white">Instant Admission Inquiry</h3>
            <p className="text-xs text-slate-400 font-medium">Leave your details and our admission counselor will call you within 24 hours.</p>

            <form onSubmit={(e) => { e.preventDefault(); alert('Inquiry submitted! Our counselor will call you shortly.'); }} className="space-y-3 text-xs">
              <input
                type="text"
                required
                placeholder="Parent Full Name"
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:ring-2 focus:ring-orange-500 outline-none"
              />
              <input
                type="tel"
                required
                placeholder="WhatsApp Phone Number"
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:ring-2 focus:ring-orange-500 outline-none"
              />
              <select className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:ring-2 focus:ring-orange-500 outline-none">
                <option value="">Select Applying Class (Playgroup - 10)</option>
                {classesCatalog.map((c) => (
                  <option key={c.name} value={c.name}>{c.name} ({c.level})</option>
                ))}
              </select>
              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-black text-xs rounded-xl shadow-lg shadow-orange-500/30 transition-all hover:scale-[1.01]"
              >
                Send Admission Inquiry
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* RICH FOOTER */}
      <footer className="bg-slate-950 border-t border-slate-900 py-12 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-3">
            <img src="/logo.png" alt="THMS" className="h-14 w-auto drop-shadow-md" />
            <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
              The Hayatabad Model School, Phase 3, Peshawar. Delivering premier educational excellence and character building since 1998.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-black text-white uppercase text-[11px] tracking-wider">Academic Portals</h4>
            <div className="flex flex-col space-y-1.5 font-medium">
              <Link href="/login" className="hover:text-orange-400 transition-colors">Student Portal</Link>
              <Link href="/login" className="hover:text-orange-400 transition-colors">Teacher Portal</Link>
              <Link href="/login" className="hover:text-orange-400 transition-colors">Parent Portal</Link>
              <Link href="/login" className="hover:text-orange-400 transition-colors">Admin Command Center</Link>
            </div>
          </div>
          <div className="space-y-2">
            <h4 className="font-black text-white uppercase text-[11px] tracking-wider">Quick Navigation</h4>
            <div className="flex flex-col space-y-1.5 font-medium">
              <Link href="/admissions/apply" className="hover:text-orange-400 transition-colors">Apply for Admission</Link>
              <a href="#classes" className="hover:text-orange-400 transition-colors">All 13 Classes</a>
              <a href="#about" className="hover:text-orange-400 transition-colors">Academic Wings</a>
              <a href="#support" className="hover:text-orange-400 transition-colors">Help & FAQ</a>
            </div>
          </div>
          <div className="space-y-2">
            <h4 className="font-black text-white uppercase text-[11px] tracking-wider">Contact & Campus</h4>
            <p className="text-[11px] text-slate-400">Phase 3, Hayatabad, Peshawar, KPK</p>
            <p className="text-[11px] font-mono text-orange-400">+92 91 5828100</p>
            <p className="text-[11px] font-mono text-slate-400">admissions@hayatabadmodel.edu.pk</p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 mt-8 border-t border-slate-900 text-center text-[10px] text-slate-500 font-medium">
          © 2026 The Hayatabad Model School. All Rights Reserved. Powered by THMS Cloud Engine.
        </div>
      </footer>
    </div>
  );
}
