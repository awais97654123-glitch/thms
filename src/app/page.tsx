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
  ShieldCheck, 
  Laptop, 
  Microscope, 
  Bus,
  Lock,
  ChevronRight,
  School,
  Check,
  Star,
  Compass,
  Cpu,
  Layers
} from 'lucide-react';
import Header from '@/components/common/Header';

export default function PublicHomePage() {
  const academicWings = [
    {
      title: 'Early Years / Pre-School',
      grades: 'Playgroup, Nursery & Prep',
      description: 'Activity-based Montessori learning, phonics development, foundational numeracy, and caring nurturing environment.',
      color: 'from-amber-500/10 via-amber-500/5 to-transparent border-amber-200/80 text-amber-950',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
      badge: 'Ages 3 - 5 Years',
    },
    {
      title: 'Primary School Wing',
      grades: 'Class 1 to Class 5',
      description: 'Core literacy, conceptual mathematics, general science, Islamic ethics, computer fundamentals, and creative arts.',
      color: 'from-blue-500/10 via-blue-500/5 to-transparent border-blue-200/80 text-blue-950',
      badgeColor: 'bg-blue-100 text-blue-900 border-blue-300',
      badge: 'Ages 6 - 10 Years',
    },
    {
      title: 'Middle School Wing',
      grades: 'Class 6 to Class 8',
      description: 'Analytical science, advanced algebra, English composition, logical reasoning, and leadership grooming.',
      color: 'from-cyan-500/10 via-cyan-500/5 to-transparent border-cyan-200/80 text-cyan-950',
      badgeColor: 'bg-cyan-100 text-cyan-900 border-cyan-300',
      badge: 'Ages 11 - 13 Years',
    },
    {
      title: 'Secondary SSC Wing',
      grades: 'Class 9 & 10 (BISE Peshawar)',
      description: 'Rigorous SSC Board examination preparation in Science group (Physics, Chemistry, Biology & Computer Science).',
      color: 'from-indigo-500/10 via-indigo-500/5 to-transparent border-indigo-200/80 text-indigo-950',
      badgeColor: 'bg-indigo-100 text-indigo-900 border-indigo-300',
      badge: 'Matriculation (BISEP)',
    },
  ];

  const facilities = [
    {
      title: 'Robotics & Computer Laboratory',
      desc: 'High-speed networked workstations, programming curriculum, algorithmic thinking, and modern educational software.',
      icon: Laptop,
      color: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      title: 'State-of-the-Art Science Labs',
      desc: 'Physics, Chemistry, and Biology practical apparatus strictly following the BISE Peshawar curriculum.',
      icon: Microscope,
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    },
    {
      title: 'Digital Library & Research Hub',
      desc: 'Extensive repository of encyclopedias, Islamic literature, science reference books, and quiet study stations.',
      icon: BookOpen,
      color: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    {
      title: 'Safe Fleet Transportation',
      desc: 'Dedicated school fleet covering all sectors of Hayatabad and surrounding areas with verified staff.',
      icon: Bus,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      title: 'Automated QR Gate Attendance',
      desc: 'Instant gate check-in alerts delivered via Push Notification and SMS to parents in real-time.',
      icon: ShieldCheck,
      color: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    },
    {
      title: 'Islamic Values & Nazra Program',
      desc: 'Daily Nazra Quran with Tajweed, character development, and regular ethical counseling for students.',
      icon: Award,
      color: 'bg-rose-50 text-rose-700 border-rose-200',
    },
  ];

  const facultyMembers = [
    { name: 'Engr. Farooq Ahmad', role: 'Head of Mathematics & Analytics', exp: '14+ Years Exp', degree: 'M.Sc Applied Mathematics (UoP)' },
    { name: 'Dr. Zobia Khan', role: 'Head of Biological Sciences', exp: '11+ Years Exp', degree: 'Ph.D Biotechnology / M.Phil Biology' },
    { name: 'Prof. Asadullah Tariq', role: 'Senior Physics Faculty (SSC Wing)', exp: '12+ Years Exp', degree: 'M.Sc Physics (Gold Medalist)' },
    { name: 'Ms. Saima Khattak', role: 'Senior English Literature Faculty', exp: '9+ Years Exp', degree: 'M.A English Linguistics' },
  ];

  const notices = [
    {
      tag: 'ADMISSION',
      title: 'Admissions Open for Academic Session 2026-2027 (Playgroup to Class 9)',
      date: 'Active Now',
      link: '/admissions/apply',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    },
    {
      tag: 'EXAMS',
      title: 'Annual Board Examination Schedule 2026 for Class 9 & 10 released by BISEP',
      date: 'Session 2026',
      link: '/login',
      badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
    },
    {
      tag: 'COMPETITION',
      title: 'Annual Inter-School Science, Robotics & Quran Qirat Competition',
      date: 'Next Week',
      link: '/login',
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col selection:bg-blue-600 selection:text-white mesh-glow-bg subtle-grid">
      {/* Floating Frosted Header */}
      <Header />

      {/* Futuristic Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center space-y-6 max-w-4xl mx-auto">
            
            {/* Session Tag */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-200 text-blue-700 text-xs font-black tracking-wide uppercase shadow-sm backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
              <span>Admissions Open • Academic Session 2026-2027</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 leading-[1.1]">
              Empowering Students.{' '}
              <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-600 bg-clip-text text-transparent block sm:inline">
                Building Tomorrow.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-medium max-w-2xl mx-auto">
              The premier educational institution in Hayatabad, Peshawar offering Playgroup to Matriculation (BISE Peshawar) education, modern digital campus management, and dedicated character grooming.
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Link
                href="/admissions/apply"
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white font-black text-sm shadow-xl shadow-blue-500/25 flex items-center gap-2.5 transition-all hover:scale-105"
              >
                <span>Apply for Admission Online</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/login"
                className="px-8 py-4 rounded-2xl bg-white/90 hover:bg-white text-slate-800 font-extrabold text-sm border border-slate-200/90 shadow-sm backdrop-blur-xl flex items-center gap-2.5 transition-all hover:scale-105"
              >
                <Lock className="w-4 h-4 text-blue-600" />
                <span>Login to School Portal</span>
              </Link>
            </div>
          </div>

          {/* Floating Glass Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mt-16 max-w-5xl mx-auto">
            <div className="glass-panel p-6 rounded-3xl text-center space-y-1 glass-card-hover">
              <div className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                100%
              </div>
              <div className="text-xs text-slate-600 font-bold">BISE Matric Pass Rate</div>
            </div>
            <div className="glass-panel p-6 rounded-3xl text-center space-y-1 glass-card-hover">
              <div className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                1:18
              </div>
              <div className="text-xs text-slate-600 font-bold">Teacher-Student Ratio</div>
            </div>
            <div className="glass-panel p-6 rounded-3xl text-center space-y-1 glass-card-hover">
              <div className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">
                13
              </div>
              <div className="text-xs text-slate-600 font-bold">Academic Classes</div>
            </div>
            <div className="glass-panel p-6 rounded-3xl text-center space-y-1 glass-card-hover">
              <div className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                24/7
              </div>
              <div className="text-xs text-slate-600 font-bold">Parent Portal Access</div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Notice Board Section */}
      <section className="bg-white/80 backdrop-blur-xl border-y border-slate-200/80 py-5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-900 flex-shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
            <span>Official Notices:</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full">
            {notices.map((n, idx) => (
              <Link
                key={idx}
                href={n.link}
                className="p-3 bg-white/70 hover:bg-blue-50/80 rounded-2xl border border-slate-200 flex items-center justify-between text-xs transition-all group shadow-sm hover:scale-[1.01]"
              >
                <div className="space-y-0.5 pr-2">
                  <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-md border inline-block ${n.badgeClass}`}>
                    {n.tag}
                  </span>
                  <p className="font-bold text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                    {n.title}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 flex-shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Academic Wings Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-black uppercase tracking-widest text-blue-700 bg-blue-50 px-3.5 py-1 rounded-full border border-blue-200">
            Academic Wings & Structure
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Comprehensive Learning from Playgroup to SSC
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            Structured educational programs designed to nurture intellectual curiosity, analytical capability, and moral values.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {academicWings.map((w, idx) => (
            <div
              key={idx}
              className={`glass-panel bg-gradient-to-b ${w.color} p-6 rounded-3xl border shadow-sm glass-card-hover flex flex-col justify-between space-y-4`}
            >
              <div className="space-y-3">
                <span className={`text-[10px] font-black px-2.5 py-1 rounded-xl border inline-block ${w.badgeColor}`}>
                  {w.badge}
                </span>
                <h3 className="font-black text-lg text-slate-900">{w.title}</h3>
                <span className="text-xs font-bold text-slate-500 block">{w.grades}</span>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">{w.description}</p>
              </div>

              <Link
                href="/admissions/apply"
                className="text-xs font-black text-blue-700 hover:text-blue-900 flex items-center gap-1 pt-3 border-t border-slate-200/80"
              >
                <span>Apply for this Wing</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Campus Facilities */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-y border-slate-200/80 bg-white/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-black uppercase tracking-widest text-indigo-700 bg-indigo-50 px-3.5 py-1 rounded-full border border-indigo-200">
              Campus Facilities & Infrastructure
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              State-of-the-Art Learning Environments
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Equipped with modern laboratories, automated QR attendance, digital library, and safe fleet transportation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {facilities.map((f, idx) => {
              const IconComp = f.icon;
              return (
                <div key={idx} className="glass-panel p-6 rounded-3xl border border-white shadow-sm space-y-3 glass-card-hover">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-sm ${f.color}`}>
                    <IconComp className="w-6 h-6" />
                  </div>
                  <h3 className="font-black text-base text-slate-900">{f.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Faculty Spotlight */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3.5 py-1 rounded-full border border-emerald-200">
            Senior Educators
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Meet Our Senior Faculty
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            Dedicated subject specialists committed to individual student achievement and mentorship.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {facultyMembers.map((fac, idx) => (
            <div key={idx} className="glass-panel p-6 rounded-3xl border border-white shadow-sm space-y-3 text-center glass-card-hover">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 text-white font-black text-xl flex items-center justify-center mx-auto shadow-lg shadow-blue-500/20">
                {fac.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-black text-sm text-slate-900">{fac.name}</h3>
                <p className="text-xs text-blue-600 font-bold mt-0.5">{fac.role}</p>
                <span className="text-[11px] text-slate-500 block font-medium mt-1">{fac.degree}</span>
                <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full inline-block mt-2 border border-emerald-200">
                  {fac.exp}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Online Admission CTA Banner */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-950 rounded-3xl p-8 sm:p-12 text-white shadow-2xl text-center space-y-6 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>

          <div className="max-w-2xl mx-auto space-y-3 relative z-10">
            <span className="px-3.5 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-extrabold border border-blue-400/30 inline-block">
              Limited Seats • Session 2026-2027
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">
              Enroll Your Child at The Hayatabad Model School Today
            </h2>
            <p className="text-xs sm:text-sm text-blue-200 font-medium">
              Submit your online admission form in under 3 minutes. Our admissions team will review your application and schedule the assessment.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 relative z-10">
            <Link
              href="/admissions/apply"
              className="px-8 py-4 rounded-2xl bg-white text-blue-900 font-black text-sm shadow-xl hover:bg-blue-50 transition-all hover:scale-105"
            >
              Start Online Admission Application
            </Link>
            <Link
              href="/admissions/track"
              className="px-6 py-4 rounded-2xl bg-blue-800/50 hover:bg-blue-800 text-white font-bold text-sm border border-blue-700/80 backdrop-blur-md transition-all hover:scale-105"
            >
              Track Application
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-12 px-4 sm:px-6 lg:px-8 border-t border-slate-800 text-xs mt-auto">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white p-1">
                <img src="/school-logo.png" alt="THMS Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <h3 className="font-black text-white text-base">The Hayatabad Model School</h3>
                <p className="text-[11px] text-slate-500">Government Registered & BISE Peshawar Affiliated</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-md">
              Committed to providing world-class academic standards, scientific inquiry, moral character grooming, and digital innovation for the children of Peshawar.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-white uppercase text-[11px] tracking-wider">Quick Navigation</h4>
            <ul className="space-y-1.5 text-xs font-medium">
              <li><Link href="/admissions/apply" className="hover:text-cyan-400 transition-colors">Online Admission</Link></li>
              <li><Link href="/login" className="hover:text-cyan-400 transition-colors">Student & Parent Portal</Link></li>
              <li><Link href="/login" className="hover:text-cyan-400 transition-colors">Teacher Workspace</Link></li>
              <li><Link href="/login" className="hover:text-cyan-400 transition-colors">Admin Command Center</Link></li>
              <li><Link href="/forgot-password" className="hover:text-cyan-400 transition-colors">Forgot Password</Link></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-white uppercase text-[11px] tracking-wider">Campus Contact</h4>
            <ul className="space-y-1.5 text-xs font-medium">
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <span>Sector F-4, Phase 6, Hayatabad, Peshawar</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>+92 91 5812345 / 0333 9988111</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>admissions@hayatabadmodel.edu.pk</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-8 mt-8 border-t border-slate-900 flex flex-wrap items-center justify-between gap-4 text-[11px]">
          <span>© {new Date().getFullYear()} The Hayatabad Model School, Peshawar. All Rights Reserved.</span>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hover:text-white">Portal Sign In</Link>
            <span>•</span>
            <Link href="/admissions/track" className="hover:text-white">Track Admission</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
