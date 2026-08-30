'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  GraduationCap, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  BookOpen, 
  Award, 
  Users, 
  ShieldCheck, 
  Clock, 
  DollarSign, 
  QrCode, 
  Phone, 
  Mail, 
  MapPin, 
  ChevronRight,
  Code,
  Cpu,
  Palette,
  Megaphone,
  FlaskConical,
  HeartHandshake,
  Star,
  Zap,
  Layers,
  HelpCircle,
  School,
  ExternalLink,
  ChevronDown,
  Building2
} from 'lucide-react';
import Header from '@/components/common/Header';

export default function HomePage() {
  const [selectedWing, setSelectedWing] = useState('ALL');
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  // All 13 Classes from Playgroup to Class 10
  const allClasses = [
    {
      id: 'playgroup',
      name: 'Playgroup',
      wing: 'PRE_PRIMARY',
      age: '3 - 4 Years',
      icon: '🎨',
      description: 'Activity-based sensory learning, phonics, color recognition, and creative motor skills development in a nurturing environment.',
      subjects: ['Phonics & Letters', 'Sensory Play', 'Rhymes & Arts', 'Basic Etiquette'],
    },
    {
      id: 'nursery',
      name: 'Nursery',
      wing: 'PRE_PRIMARY',
      age: '4 - 5 Years',
      icon: '🧸',
      description: 'Montessori foundation, number readiness, English and Urdu alphabet writing, and Islamic moral stories.',
      subjects: ['English Alphabets', 'Urdu Haroof', 'Number Counting', 'Nazra Quran Basics'],
    },
    {
      id: 'prep',
      name: 'Prep / Kindergarten',
      wing: 'PRE_PRIMARY',
      age: '5 - 6 Years',
      icon: '🌟',
      description: 'Pre-primary graduation stage with sentence formation, basic addition/subtraction, general knowledge, and conversational English.',
      subjects: ['English Reading', 'Urdu Sentences', 'Elementary Math', 'General Knowledge'],
    },
    {
      id: 'class-1',
      name: 'Class 1',
      wing: 'PRIMARY',
      age: '6 - 7 Years',
      icon: '📚',
      description: 'Formal primary school entry with integrated STEM concepts, foundational science, and Quranic recitation.',
      subjects: ['English Comprehension', 'Mathematics', 'General Science', 'Islamiat & Nazra'],
    },
    {
      id: 'class-2',
      name: 'Class 2',
      wing: 'PRIMARY',
      age: '7 - 8 Years',
      icon: '✏️',
      description: 'Language fluency building, multiplication tables, environmental science, and computer lab orientation.',
      subjects: ['English Grammar', 'Mathematics', 'General Science', 'Computer Studies', 'Urdu'],
    },
    {
      id: 'class-3',
      name: 'Class 3',
      wing: 'PRIMARY',
      age: '8 - 9 Years',
      icon: '🔬',
      description: 'Practical experiments in science lab, introductory coding logic, social studies, and creative writing.',
      subjects: ['Science Lab', 'Applied Math', 'Computer Basics', 'Social Studies', 'Islamiat'],
    },
    {
      id: 'class-4',
      name: 'Class 4',
      wing: 'PRIMARY',
      age: '9 - 10 Years',
      icon: '💡',
      description: 'Analytical problem solving, geometry foundations, digital literacy, and conversational Urdu/English presentations.',
      subjects: ['Mathematics & Geometry', 'Science Experiments', 'Computer Studies', 'Social Studies'],
    },
    {
      id: 'class-5',
      name: 'Class 5',
      wing: 'PRIMARY',
      age: '10 - 11 Years',
      icon: '🏆',
      description: 'Primary Wing capstone class with comprehensive evaluation, leadership development, and middle school transition prep.',
      subjects: ['Advanced Math', 'General Science', 'English Literature', 'Computer Applications'],
    },
    {
      id: 'class-6',
      name: 'Class 6',
      wing: 'MIDDLE',
      age: '11 - 12 Years',
      icon: '⚙️',
      description: 'Middle school STEM curriculum with separate physics/chemistry concepts, algebra, computer programming, and history.',
      subjects: ['Physics & Chemistry', 'Algebra & Geometry', 'Computer Coding', 'Geography & History'],
    },
    {
      id: 'class-7',
      name: 'Class 7',
      wing: 'MIDDLE',
      age: '12 - 13 Years',
      icon: '💻',
      description: 'Robotics experiments, biological sciences, scientific method projects, and advanced Islamic jurisprudence.',
      subjects: ['Biology & Chemistry', 'Advanced Algebra', 'Robotics & Coding', 'English Essay Writing'],
    },
    {
      id: 'class-8',
      name: 'Class 8',
      wing: 'MIDDLE',
      age: '13 - 14 Years',
      icon: '🚀',
      description: 'Pre-Matriculation intensive preparation, model paper solving, career counseling, and BISE Peshawar curriculum alignment.',
      subjects: ['Pre-Matric Science', 'Mathematics Proofs', 'Computer Science', 'Pakistan Studies'],
    },
    {
      id: 'class-9',
      name: 'Class 9',
      wing: 'HIGH',
      age: '14 - 15 Years',
      icon: '🎯',
      description: 'BISE Peshawar Matriculation Part-I (Science, Pre-Medical, Pre-Engineering & Computer Science groups) with board test series.',
      subjects: ['Physics', 'Chemistry', 'Biology / Computer Science', 'Mathematics', 'English & Urdu'],
    },
    {
      id: 'class-10',
      name: 'Class 10',
      wing: 'HIGH',
      age: '15 - 16 Years',
      icon: '🎖️',
      description: 'BISE Peshawar Matriculation Final Board Year. Comprehensive board revision series, practical lab exams, and top merit targeting.',
      subjects: ['Board Physics Lab', 'Chemistry Lab', 'Computer Science / Bio', 'Maths Intensive', 'Pak Studies'],
    },
  ];

  const filteredClasses = selectedWing === 'ALL' 
    ? allClasses 
    : allClasses.filter(c => c.wing === selectedWing);

  const faqs = [
    {
      q: 'How can I apply for online admission for Session 2026-2027?',
      a: 'Click the "Apply Now" button at the top or on any class card. Fill out the 4-step digital application, attach the student photograph, and submit. You will receive an instant tracking code and SMS/email confirmation.'
    },
    {
      q: 'Which education board is The Hayatabad Model School affiliated with?',
      a: 'The Hayatabad Model School is officially registered and affiliated with the Board of Intermediate and Secondary Education (BISE) Peshawar, maintaining a consistent 100% first-division pass record.'
    },
    {
      q: 'Are merit-based fee scholarships available for new students?',
      a: 'Yes! We offer up to 100% merit fee waivers for position holders, high achievers, and sports champions, as well as sibling discounts for families with multiple enrolled children.'
    },
    {
      q: 'How does the Smart Gate QR Attendance and Student Portal work?',
      a: 'Every student receives an ISO-standard dual-sided Smart ID Card with an encrypted QR token. Upon entry at the school gate, the camera scanner logs their attendance in real time and sends instant status alerts to the Parent Portal.'
    },
    {
      q: 'Can parents monitor attendance, homework, and exam marks online?',
      a: 'Yes. Every parent is provided with secure credentials to the Parent Family Portal, allowing live monitoring of daily gate check-ins, homework assignments, downloadable 3-copy fee vouchers, and terminal examination transcripts.'
    },
  ];

  return (
    <div className="min-h-screen bg-[#ffffff] text-slate-900 selection:bg-orange-500 selection:text-white">
      {/* 1. TOP LIVE NEWS TICKER MARQUEE (Matching Reference Image 2) */}
      <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 text-white text-xs py-2 px-4 shadow-md sticky top-0 z-50 overflow-hidden border-b border-orange-500/30">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 overflow-hidden">
            <span className="flex-shrink-0 px-2.5 py-0.5 rounded-full bg-white text-orange-700 font-black text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-sm">
              <Zap className="w-3 h-3 fill-orange-600 text-orange-600 animate-pulse" />
              LIVE NEWS
            </span>
            <div className="overflow-hidden whitespace-nowrap w-full">
              <div className="animate-marquee inline-block text-[11px] font-bold tracking-wide">
                <span className="mx-4">📢 Online Admissions are Officially OPEN for Academic Session 2026-2027 (Playgroup to Class 10)</span>
                <span className="mx-4">🌟 100% Merit Fee Scholarships Available for BISE High Achievers</span>
                <span className="mx-4">💻 New Computer & AI Lab Inaugurated in Senior Wing</span>
                <span className="mx-4">🏆 Congratulations to Class 10 Position Holders in BISE Peshawar Board Exams</span>
                <span className="mx-4">🕌 Daily Nazra Quran & Character Building Wing in Full Swing</span>
              </div>
            </div>
          </div>

          <Link
            href="/admissions/apply"
            className="flex-shrink-0 px-3.5 py-1 bg-white hover:bg-orange-50 text-orange-700 rounded-full font-black text-[11px] transition-all shadow-sm flex items-center gap-1 hover:scale-105"
          >
            <span>APPLY NOW</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* 2. UNIVERSAL HEADER */}
      <Header />

      {/* 3. HERO SECTION (Exact Reference Image 2 Direction: Orange, Floating Feature Pills, High Impact) */}
      <section id="hero" className="relative pt-12 pb-24 lg:pt-20 lg:pb-32 overflow-hidden mesh-orange-bg subtle-grid-orange">
        {/* Ambient Glows */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-orange-400/15 rounded-full blur-3xl pointer-events-none"></div>

        {/* Floating Feature Pills Around Hero (Matching Reference Image 2) */}
        <div className="hidden lg:block pointer-events-none">
          {/* Top Left Pill */}
          <div className="absolute top-16 left-8 xl:left-20 bg-white/90 backdrop-blur-xl p-3 px-5 rounded-2xl shadow-xl shadow-orange-500/10 border border-orange-500/20 flex items-center gap-3 animate-float-slow">
            <div className="p-2 rounded-xl bg-orange-100 text-orange-600 font-mono text-xs font-black">
              &lt;/&gt;
            </div>
            <div>
              <p className="text-xs font-black text-slate-900">Modern Computer & AI Lab</p>
              <p className="text-[10px] text-slate-500 font-medium">Coding & Digital Literacy</p>
            </div>
          </div>

          {/* Top Right Pill */}
          <div className="absolute top-20 right-8 xl:right-20 bg-white/90 backdrop-blur-xl p-3 px-5 rounded-2xl shadow-xl shadow-orange-500/10 border border-orange-500/20 flex items-center gap-3 animate-float-delayed">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-600">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-900">Robotics & STEM Education</p>
              <p className="text-[10px] text-slate-500 font-medium">Practical Innovation</p>
            </div>
          </div>

          {/* Bottom Left Pill */}
          <div className="absolute bottom-20 left-12 xl:left-24 bg-white/90 backdrop-blur-xl p-3 px-5 rounded-2xl shadow-xl shadow-orange-500/10 border border-orange-500/20 flex items-center gap-3 animate-float-delayed">
            <div className="p-2 rounded-xl bg-rose-100 text-rose-600">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-900">Arts & Creative Expression</p>
              <p className="text-[10px] text-slate-500 font-medium">Montessori Early Foundation</p>
            </div>
          </div>

          {/* Bottom Right Pill */}
          <div className="absolute bottom-16 right-12 xl:right-24 bg-white/90 backdrop-blur-xl p-3 px-5 rounded-2xl shadow-xl shadow-orange-500/10 border border-orange-500/20 flex items-center gap-3 animate-float-slow">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-600">
              <Megaphone className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-900">Public Speaking & Debate</p>
              <p className="text-[10px] text-slate-500 font-medium">English Fluency & Leadership</p>
            </div>
          </div>
        </div>

        {/* Central Hero Content */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-7">
          {/* Main Hero Session Pill */}
          <div className="inline-flex items-center gap-2 p-1.5 pr-4 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-800 text-xs font-black backdrop-blur-md shadow-sm animate-in fade-in">
            <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-600 text-white text-[10px] uppercase tracking-wider font-extrabold flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              NEW SESSION
            </span>
            <span>Academic Admissions 2026-2027 • Playgroup to Class 10</span>
            <ChevronRight className="w-3.5 h-3.5 text-orange-600" />
          </div>

          {/* School Identity Pill */}
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white text-slate-700 text-xs font-bold border border-slate-200 shadow-sm">
              <School className="w-3.5 h-3.5 text-orange-600" />
              <span>The Hayatabad Model School, Peshawar (Since 1998)</span>
            </div>
          </div>

          {/* Giant Impact Headline */}
          <div className="space-y-2">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-slate-900 tracking-tight leading-[1.08]">
              Learn Skills Online.
              <br />
              <span className="bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 bg-clip-text text-transparent drop-shadow-sm">
                Admissions are OPEN.
              </span>
            </h1>
          </div>

          {/* Hero Subtitle */}
          <p className="text-sm sm:text-lg text-slate-600 max-w-3xl mx-auto font-medium leading-relaxed">
            BISE Peshawar Board matriculation curriculum, modern computer coding, STEM laboratories, Nazra Quran ethics, and 360° student development with real-time Parent Portal tracking.
          </p>

          {/* Tuition & Scholarship Banner (Matching Reference Image 2 Discount Banner) */}
          <div className="max-w-2xl mx-auto bg-orange-50/80 border border-orange-200/90 rounded-2xl p-3 px-6 text-xs font-bold text-slate-800 shadow-sm flex flex-wrap items-center justify-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Course/Tuition: <strong className="text-emerald-700 font-extrabold">100% Merit Scholarships Available</strong></span>
            <span className="text-slate-300">|</span>
            <span className="text-orange-950">Registration: <strong className="text-orange-700 font-extrabold">Instant Online Processing</strong></span>
          </div>

          {/* Primary Call-to-Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-3">
            <Link
              href="/admissions/apply"
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-black text-sm shadow-xl shadow-orange-500/30 hover:shadow-orange-500/50 transition-all hover:scale-105 flex items-center gap-2"
            >
              <span>Register / Apply Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href="#all-classes"
              className="px-8 py-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-black text-sm border border-slate-200 shadow-lg shadow-slate-900/5 transition-all hover:scale-105 flex items-center gap-2"
            >
              <span>Explore All 13 Classes</span>
              <ChevronDown className="w-4 h-4 text-orange-600" />
            </a>
          </div>

          {/* Quick Metrics Strip */}
          <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="glass-panel p-4 rounded-2xl border border-white space-y-1">
              <span className="text-[10px] font-black text-slate-400 uppercase">Board Results</span>
              <h3 className="text-xl font-black text-slate-900">100% Pass</h3>
              <p className="text-[11px] text-emerald-600 font-bold">BISE Peshawar A+ Grades</p>
            </div>

            <div className="glass-panel p-4 rounded-2xl border border-white space-y-1">
              <span className="text-[10px] font-black text-slate-400 uppercase">Faculty</span>
              <h3 className="text-xl font-black text-slate-900">45+ Teachers</h3>
              <p className="text-[11px] text-orange-600 font-bold">Subject Specialists</p>
            </div>

            <div className="glass-panel p-4 rounded-2xl border border-white space-y-1">
              <span className="text-[10px] font-black text-slate-400 uppercase">Smart Campus</span>
              <h3 className="text-xl font-black text-slate-900">Gate QR</h3>
              <p className="text-[11px] text-blue-600 font-bold">Live Parent SMS & App</p>
            </div>

            <div className="glass-panel p-4 rounded-2xl border border-white space-y-1">
              <span className="text-[10px] font-black text-slate-400 uppercase">Alumni Network</span>
              <h3 className="text-xl font-black text-slate-900">1,250+ Scholars</h3>
              <p className="text-[11px] text-purple-600 font-bold">Doctors & Engineers</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. ALL 13 CLASSES & ONLINE ADMISSION DIRECTORY (Prompt requirement: All classes mentioned) */}
      <section id="all-classes" className="py-20 bg-slate-50 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-black">
                <GraduationCap className="w-3.5 h-3.5 text-orange-600" />
                <span>Complete Academic Roster</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Admissions Open for All 13 Classes
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">
                Choose any class below to review curriculum highlights and initiate an instant online admission application.
              </p>
            </div>

            {/* Wing Filter Pills */}
            <div className="flex flex-wrap gap-1.5 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
              {[
                { id: 'ALL', label: 'All Classes (13)' },
                { id: 'PRE_PRIMARY', label: 'Pre-Primary' },
                { id: 'PRIMARY', label: 'Primary (1-5)' },
                { id: 'MIDDLE', label: 'Middle (6-8)' },
                { id: 'HIGH', label: 'High (9-10)' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedWing(tab.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedWing === tab.id
                      ? 'bg-orange-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Classes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClasses.map((cls) => (
              <div
                key={cls.id}
                className="glass-panel p-6 rounded-3xl border border-white shadow-sm hover:shadow-xl hover:border-orange-500/40 transition-all duration-300 flex flex-col justify-between space-y-5 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl p-2 rounded-2xl bg-orange-50 border border-orange-100 group-hover:scale-110 transition-transform">
                      {cls.icon}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-extrabold border border-slate-200">
                      Age: {cls.age}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-black text-slate-900 group-hover:text-orange-600 transition-colors">
                      {cls.name}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                      {cls.description}
                    </p>
                  </div>

                  {/* Subject Badges */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                      Core Curriculum:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {cls.subjects.map((sub, sIdx) => (
                        <span
                          key={sIdx}
                          className="px-2.5 py-0.5 rounded-lg bg-orange-50/80 text-orange-900 text-[10px] font-bold border border-orange-100"
                        >
                          {sub}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Direct 1-Click Apply Button for this Class */}
                <Link
                  href={`/admissions/apply?class=${cls.id}`}
                  className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-black text-xs text-center shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 transition-all group-hover:scale-[1.02]"
                >
                  <span>Apply for {cls.name}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. ACADEMIC WINGS & LEARNING PATHS */}
      <section id="programs" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <span className="px-3.5 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-black">
              Specialized Learning Paths
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Four Specialized Academic Wings
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Every child follows a tailored developmental journey from early Montessori discovery to high school board excellence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Wing 1: Pre-Primary */}
            <div className="p-6 rounded-3xl bg-gradient-to-b from-orange-50/60 to-white border border-orange-200/80 space-y-4 hover:shadow-lg transition-all">
              <div className="w-12 h-12 rounded-2xl bg-orange-500 text-white flex items-center justify-center text-xl font-bold shadow-md shadow-orange-500/25">
                🧸
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">Pre-Primary Montessori</h3>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Playgroup, Nursery & Prep. Activity rooms, phonics, fine motor skills, and social etiquette.
                </p>
              </div>
              <ul className="text-xs text-slate-700 space-y-1.5 font-semibold">
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-orange-600" /> Sensory Play Area</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-orange-600" /> Phonics & Oxford Reading</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-orange-600" /> Basic Quranic Etiquette</li>
              </ul>
            </div>

            {/* Wing 2: Primary */}
            <div className="p-6 rounded-3xl bg-gradient-to-b from-blue-50/60 to-white border border-blue-200/80 space-y-4 hover:shadow-lg transition-all">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-xl font-bold shadow-md shadow-blue-500/25">
                📚
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">Primary Foundation</h3>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Class 1 through Class 5. Core mathematics, STEM experiments, computer basics, and dual-language fluency.
                </p>
              </div>
              <ul className="text-xs text-slate-700 space-y-1.5 font-semibold">
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-blue-600" /> Science Lab Demos</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-blue-600" /> Computer Typing & Logic</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-blue-600" /> Art & Creative Writing</li>
              </ul>
            </div>

            {/* Wing 3: Middle */}
            <div className="p-6 rounded-3xl bg-gradient-to-b from-emerald-50/60 to-white border border-emerald-200/80 space-y-4 hover:shadow-lg transition-all">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-xl font-bold shadow-md shadow-emerald-500/25">
                ⚙️
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">Middle STEM & Robotics</h3>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Class 6 through Class 8. Pre-Matric scientific method, algebra, coding fundamentals, and inter-school debates.
                </p>
              </div>
              <ul className="text-xs text-slate-700 space-y-1.5 font-semibold">
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Robotics Experiments</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Pre-Matric Test Series</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Spoken English Debates</li>
              </ul>
            </div>

            {/* Wing 4: High School */}
            <div className="p-6 rounded-3xl bg-gradient-to-b from-purple-50/60 to-white border border-purple-200/80 space-y-4 hover:shadow-lg transition-all">
              <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center text-xl font-bold shadow-md shadow-purple-500/25">
                🎯
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">High School BISE Board</h3>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Class 9 & 10. Science, Pre-Medical, Pre-Engineering & Computer Science with board exam prep and career counseling.
                </p>
              </div>
              <ul className="text-xs text-slate-700 space-y-1.5 font-semibold">
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-purple-600" /> Physics & Chem Labs</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-purple-600" /> Model Paper Drills</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-purple-600" /> 100% Board Pass Rate</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 6. ABOUT THE SCHOOL & LEADERSHIP */}
      <section id="about" className="py-20 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-orange-500/20 text-orange-300 text-xs font-black border border-orange-400/30">
              <Sparkles className="w-3.5 h-3.5 text-orange-400" />
              <span>28 Years of Educational Legacy</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Shaping Tomorrow's Visionaries in Hayatabad, Peshawar
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
              Founded in 1998, The Hayatabad Model School has stood as a hallmark of academic rigor, character building, and technological leadership in Khyber Pakhtunkhwa. Our graduates lead top universities across Pakistan and abroad.
            </p>

            <div className="grid grid-cols-2 gap-4 text-xs font-bold pt-2">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-orange-400 text-xl font-black">28+</span>
                <p className="text-white font-extrabold">Years of Excellence</p>
                <p className="text-[10px] text-slate-400 font-medium">Serving Peshawar since 1998</p>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-emerald-400 text-xl font-black">100%</span>
                <p className="text-white font-extrabold">Matric First Division</p>
                <p className="text-[10px] text-slate-400 font-medium">BISE Peshawar Roster</p>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/admissions/apply"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs shadow-lg shadow-orange-500/25 transition-all"
              >
                <span>Enroll in Next Session</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-4">
            {/* Campus Facilities Card */}
            <div className="glass-panel bg-white/10 backdrop-blur-2xl p-6 sm:p-8 rounded-3xl border border-white/15 text-white space-y-4 shadow-2xl">
              <h3 className="font-black text-lg text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-orange-400" />
                <span>Smart Campus Infrastructure</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-orange-500/20 text-orange-400 font-bold">01</div>
                  <div>
                    <strong className="text-white">Science & Physics/Chemistry Labs</strong>
                    <p className="text-slate-300 text-[11px]">Fully equipped with modern equipment for BISE practicals.</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 font-bold">02</div>
                  <div>
                    <strong className="text-white">High-Speed AI & Computer Wing</strong>
                    <p className="text-slate-300 text-[11px]">Dual-monitor workstations with Python, Web & Robotics software.</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold">03</div>
                  <div>
                    <strong className="text-white">Smart Gate QR Attendance Scanner</strong>
                    <p className="text-slate-300 text-[11px]">Automated instant parent notification on student check-in.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. ADMISSIONS 4-STEP PROCEDURE GUIDE */}
      <section id="admissions" className="py-20 bg-slate-50 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <span className="px-3.5 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-black">
              Simple & Fast Procedure
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              4 Steps to Complete Admission
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              We have eliminated long queues. Complete everything online in under 5 minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass-panel p-6 rounded-3xl border border-white space-y-3">
              <span className="w-10 h-10 rounded-2xl bg-orange-500 text-white flex items-center justify-center font-black text-sm shadow-md">
                1
              </span>
              <h3 className="font-black text-base text-slate-900">Submit Application</h3>
              <p className="text-xs text-slate-500 font-medium">
                Fill the online form with applicant details, parent CNIC/phone, and upload a student photograph.
              </p>
            </div>

            <div className="glass-panel p-6 rounded-3xl border border-white space-y-3">
              <span className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-sm shadow-md">
                2
              </span>
              <h3 className="font-black text-base text-slate-900">Track Status</h3>
              <p className="text-xs text-slate-500 font-medium">
                Receive an instant tracking code (e.g. THMS-APP-2026-001) to check review progress live.
              </p>
            </div>

            <div className="glass-panel p-6 rounded-3xl border border-white space-y-3">
              <span className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-sm shadow-md">
                3
              </span>
              <h3 className="font-black text-base text-slate-900">1-Click Approval</h3>
              <p className="text-xs text-slate-500 font-medium">
                Admin desk reviews and approves student, automatically generating roll number & portal accounts.
              </p>
            </div>

            <div className="glass-panel p-6 rounded-3xl border border-white space-y-3">
              <span className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-black text-sm shadow-md">
                4
              </span>
              <h3 className="font-black text-base text-slate-900">ID Card & Vouchers</h3>
              <p className="text-xs text-slate-500 font-medium">
                Print dual-sided QR Smart ID card and 3-copy fee voucher from your personal portal.
              </p>
            </div>
          </div>

          <div className="text-center pt-4">
            <Link
              href="/admissions/apply"
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-black text-sm shadow-xl shadow-orange-500/25 inline-flex items-center gap-2 transition-all hover:scale-105"
            >
              <span>Start Online Admission Application</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 8. SUPPORT & FREQUENTLY ASKED QUESTIONS */}
      <section id="support" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-3">
            <span className="px-3.5 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-black">
              Help & Support Center
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Everything parents and students need to know regarding admissions, portal access, and fees.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = faqOpen === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200 bg-slate-50/60 overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setFaqOpen(isOpen ? null : idx)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-black text-slate-900 text-xs sm:text-sm"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-orange-600 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs text-slate-600 font-medium leading-relaxed animate-in fade-in">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 9. CONTACT US & CAMPUS LOCATION */}
      <section id="contact" className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-2">
              <span className="px-3.5 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-black">
                Get In Touch
              </span>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                Campus Location & Office Desk
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Visit our campus in Hayatabad Phase 4, Peshawar or contact our admissions counseling team.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-start gap-3">
                <MapPin className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 block font-bold">Campus Address:</strong>
                  <span className="text-slate-600">Phase 4, Sector N-2, Hayatabad, Peshawar, Khyber Pakhtunkhwa</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-start gap-3">
                <Phone className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 block font-bold">Admissions Helplines:</strong>
                  <span className="text-slate-600 font-mono">+92 (091) 581-2345 • +92 (300) 123-4567</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-start gap-3">
                <Mail className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 block font-bold">Official Email:</strong>
                  <span className="text-slate-600 font-mono">admissions@hayatabadmodel.edu.pk</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Inquiry Form */}
          <div className="lg:col-span-7 glass-panel p-6 sm:p-8 rounded-3xl border border-white shadow-lg space-y-5">
            <h3 className="font-black text-lg text-slate-900">
              Send an Instant Admission Inquiry
            </h3>
            <form onSubmit={(e) => { e.preventDefault(); alert('Inquiry submitted! Our admissions team will contact you shortly.'); }} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Parent / Guardian Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tariq Mehmood"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Mobile Number (WhatsApp)</label>
                  <input
                    type="tel"
                    required
                    placeholder="0300-1234567"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-mono focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Student Seeking Class</label>
                  <select className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-orange-500 outline-none">
                    {allClasses.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.age})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">City / Area</label>
                  <input
                    type="text"
                    placeholder="e.g. Hayatabad, Peshawar"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Inquiry / Questions</label>
                <textarea
                  rows={3}
                  placeholder="Ask about fee structures, transport, or scholarships..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-orange-500 outline-none"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-black text-xs shadow-lg shadow-orange-500/25 transition-all hover:scale-[1.01]"
              >
                Send Inquiry to Admissions Desk ➔
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* 10. FOOTER */}
      <footer className="bg-slate-950 text-white py-12 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <img src="/logo.png" alt="THMS" className="h-10 w-auto object-contain" />
                <span className="font-black text-base text-white">The Hayatabad Model School</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Premier educational institution affiliated with BISE Peshawar. Committed to academic excellence and moral leadership.
              </p>
            </div>

            <div>
              <p className="font-black text-white text-xs mb-3 uppercase tracking-wider">Quick Navigation</p>
              <ul className="space-y-2 text-slate-400 font-medium">
                <li><Link href="/" className="hover:text-orange-400">Home</Link></li>
                <li><Link href="/#about" className="hover:text-orange-400">About School</Link></li>
                <li><Link href="/#all-classes" className="hover:text-orange-400">All 13 Classes</Link></li>
                <li><Link href="/#programs" className="hover:text-orange-400">Academic Wings</Link></li>
                <li><Link href="/#support" className="hover:text-orange-400">Support & FAQs</Link></li>
              </ul>
            </div>

            <div>
              <p className="font-black text-white text-xs mb-3 uppercase tracking-wider">Portal Access</p>
              <ul className="space-y-2 text-slate-400 font-medium">
                <li><Link href="/login" className="hover:text-orange-400">Central Login Gateway</Link></li>
                <li><Link href="/admin" className="hover:text-orange-400">Admin Control Tower</Link></li>
                <li><Link href="/teacher" className="hover:text-orange-400">Teacher Workspace</Link></li>
                <li><Link href="/student" className="hover:text-orange-400">Student Academic Hub</Link></li>
                <li><Link href="/parent" className="hover:text-orange-400">Parent Family Portal</Link></li>
              </ul>
            </div>

            <div className="space-y-2">
              <p className="font-black text-white text-xs mb-3 uppercase tracking-wider">Accreditation</p>
              <p className="text-slate-400 text-[11px]">
                Registered under KP Private Schools Regulatory Authority (PSRA) and affiliated with BISE Peshawar for Matriculation.
              </p>
              <div className="pt-2">
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                  ● Session 2026-2027 Active
                </span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800/80 flex flex-wrap justify-between items-center gap-4 text-slate-500 text-[11px]">
            <p>© {new Date().getFullYear()} The Hayatabad Model School, Peshawar. All Rights Reserved.</p>
            <p>Unified School ERP & Learning Management System</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
