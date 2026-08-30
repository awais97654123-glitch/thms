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
  Search,
  UserCheck,
  Clock,
  ChevronRight,
  School,
  Lock,
  Star,
  Compass,
  Check,
  Globe,
  FileText
} from 'lucide-react';
import Header from '@/components/common/Header';

export default function PublicHomePage() {
  const academicWings = [
    {
      title: 'Early Years / Pre-School',
      grades: 'Playgroup, Nursery & Prep',
      description: 'Activity-based Montessori learning, phonics development, foundational numeracy, and caring environment.',
      color: 'from-amber-500/10 via-amber-500/5 to-transparent border-amber-200 text-amber-900',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
      badge: 'Ages 3 - 5 Years',
    },
    {
      title: 'Primary School Wing',
      grades: 'Class 1 to Class 5',
      description: 'Core literacy, mathematics, general science, Islamic ethics, computer basics, and creative arts.',
      color: 'from-blue-500/10 via-blue-500/5 to-transparent border-blue-200 text-blue-900',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
      badge: 'Ages 6 - 10 Years',
    },
    {
      title: 'Middle School Wing',
      grades: 'Class 6 to Class 8',
      description: 'Conceptual science, advanced mathematics, English grammar, analytical thinking, and leadership grooming.',
      color: 'from-emerald-500/10 via-emerald-500/5 to-transparent border-emerald-200 text-emerald-900',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      badge: 'Ages 11 - 13 Years',
    },
    {
      title: 'Secondary SSC Wing',
      grades: 'Class 9 & 10 (BISE Peshawar)',
      description: 'Rigorous SSC Board examination preparation in Science group (Physics, Chemistry, Biology & Computer Science).',
      color: 'from-purple-500/10 via-purple-500/5 to-transparent border-purple-200 text-purple-900',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
      badge: 'Matriculation (BISEP)',
    },
  ];

  const facilities = [
    {
      title: 'High-Tech Computer & Robotics Lab',
      desc: 'Modern networked PCs with high-speed internet, programming curriculum, and digital literacy tools.',
      icon: Laptop,
      color: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      title: 'Advanced Science Laboratories',
      desc: 'Well-equipped Physics, Chemistry, and Biology practical apparatus strictly following BISE curriculum.',
      icon: Microscope,
      color: 'bg-purple-50 text-purple-700 border-purple-200',
    },
    {
      title: 'Modern Library & Resource Hub',
      desc: 'Extensive repository of encyclopedias, Islamic literature, science reference books, and quiet reading halls.',
      icon: BookOpen,
      color: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    {
      title: 'Safe Fleet Transportation',
      desc: 'Dedicated school vans covering all sectors of Hayatabad and surrounding areas with verified drivers.',
      icon: Bus,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      title: 'Automated QR / Smart Attendance',
      desc: 'Instant gate check-in alerts sent via Push Notification and SMS to parents in real-time.',
      icon: ShieldCheck,
      color: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    },
    {
      title: 'Islamic Values & Tahfeez Program',
      desc: 'Daily Nazra Quran, moral character building, and regular ethical counseling for students.',
      icon: Award,
      color: 'bg-rose-50 text-rose-700 border-rose-200',
    },
  ];

  const notices = [
    {
      tag: 'ADMISSION',
      title: 'Admissions Open for Academic Session 2026-2027 (Nursery to Class 9)',
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
      tag: 'ACTIVITY',
      title: 'Inter-School Science, Robotics & Quran Qirat Competition — Registration Open',
      date: 'Next Week',
      link: '/login',
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
    },
  ];

  const facultyMembers = [
    { name: 'Engr. Farooq Ahmad', role: 'Head of Mathematics & Analytical Studies', exp: '14+ Years Exp', degree: 'M.Sc Applied Mathematics (UoP)' },
    { name: 'Dr. Zobia Khan', role: 'Head of Biological Sciences & Pre-Medical Wing', exp: '11+ Years Exp', degree: 'Ph.D Biotechnology / M.Phil Biology' },
    { name: 'Prof. Asadullah Tariq', role: 'Senior Physics Specialist (SSC Wing)', exp: '12+ Years Exp', degree: 'M.Sc Physics (Gold Medalist)' },
    { name: 'Ms. Saima Khattak', role: 'Senior English Literature & Language Faculty', exp: '9+ Years Exp', degree: 'M.A English Linguistics' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Public Header */}
      <Header />

      {/* Top Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-blue-950 text-white pt-16 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(37,99,235,0.25),rgba(255,255,255,0))]"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-300 text-xs font-bold tracking-wide uppercase shadow-inner">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Admissions Open • Academic Session 2026-2027</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
              Shaping Future Leaders with{' '}
              <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-emerald-300 bg-clip-text text-transparent">
                Academic Excellence & Moral Values
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
              The premier institution in Hayatabad, Peshawar offering comprehensive Playgroup to Matriculation (BISE Peshawar) education, modern digital campus systems, scientific laboratories, and dedicated Islamic character building.
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link
                href="/admissions/apply"
                className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-sm shadow-xl shadow-blue-600/30 flex items-center gap-2 transition-all hover:scale-105"
              >
                <span>Apply for Admission Online</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/login"
                className="px-7 py-3.5 rounded-2xl bg-slate-800/90 hover:bg-slate-700/90 text-slate-100 font-extrabold text-sm border border-slate-700 flex items-center gap-2 transition-all hover:scale-105 shadow"
              >
                <Lock className="w-4 h-4 text-emerald-400" />
                <span>Login to ERP Portal</span>
              </Link>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-5xl mx-auto">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-3xl text-center space-y-1">
              <div className="text-2xl sm:text-3xl font-black text-white">100%</div>
              <div className="text-xs text-blue-200 font-medium">BISE Matric Pass Rate</div>
            </div>
            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-3xl text-center space-y-1">
              <div className="text-2xl sm:text-3xl font-black text-white">1:18</div>
              <div className="text-xs text-blue-200 font-medium">Teacher-Student Ratio</div>
            </div>
            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-3xl text-center space-y-1">
              <div className="text-2xl sm:text-3xl font-black text-white">13+</div>
              <div className="text-xs text-blue-200 font-medium">Academic Classes</div>
            </div>
            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-3xl text-center space-y-1">
              <div className="text-2xl sm:text-3xl font-black text-white">24/7</div>
              <div className="text-xs text-blue-200 font-medium">Parent Portal Access</div>
            </div>
          </div>
        </div>
      </section>

      {/* Notice Board Section */}
      <section className="bg-white border-b border-slate-200 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-800 flex-shrink-0">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></div>
            <span>Official Notices:</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full">
            {notices.map((n, idx) => (
              <Link
                key={idx}
                href={n.link}
                className="p-3 bg-slate-50 hover:bg-blue-50/60 rounded-2xl border border-slate-200 flex items-center justify-between text-xs transition-colors group"
              >
                <div className="space-y-0.5 pr-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border inline-block ${n.badgeClass}`}>
                    {n.tag}
                  </span>
                  <p className="font-semibold text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
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
          <span className="text-xs font-extrabold uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            Academic Wings & Curriculum
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Comprehensive Education from Early Years to SSC
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Structured curriculum tailored for holistic mental, physical, ethical, and academic development.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {academicWings.map((w, idx) => (
            <div
              key={idx}
              className={`bg-gradient-to-b ${w.color} p-6 rounded-3xl border shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4`}
            >
              <div className="space-y-3">
                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-xl border inline-block ${w.badgeColor}`}>
                  {w.badge}
                </span>
                <h3 className="font-extrabold text-lg text-slate-900">{w.title}</h3>
                <span className="text-xs font-semibold text-slate-500 block">{w.grades}</span>
                <p className="text-xs text-slate-600 leading-relaxed">{w.description}</p>
              </div>

              <Link
                href="/admissions/apply"
                className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 pt-2 border-t border-slate-200/60"
              >
                <span>Apply for this Wing</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Campus Facilities */}
      <section className="bg-slate-100 py-20 px-4 sm:px-6 lg:px-8 border-y border-slate-200">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-extrabold uppercase tracking-widest text-purple-600 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
              Campus Facilities & Infrastructure
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              State-of-the-Art Learning Environments
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Equipped with modern laboratories, smart attendance infrastructure, digital library, and safe fleet transportation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {facilities.map((f, idx) => {
              const IconComp = f.icon;
              return (
                <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3 hover:shadow-md transition-shadow">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${f.color}`}>
                    <IconComp className="w-6 h-6" />
                  </div>
                  <h3 className="font-extrabold text-base text-slate-900">{f.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Faculty Spotlight */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Dedicated Educators
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Meet Our Senior Academic Faculty
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Highly qualified subject specialists dedicated to nurturing individual student talent.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {facultyMembers.map((fac, idx) => (
            <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3 text-center hover:shadow-md transition-shadow">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-extrabold text-xl flex items-center justify-center mx-auto shadow-md">
                {fac.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">{fac.name}</h3>
                <p className="text-xs text-blue-600 font-semibold mt-0.5">{fac.role}</p>
                <span className="text-[11px] text-slate-500 block mt-1">{fac.degree}</span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full inline-block mt-2">
                  {fac.exp}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Online Admission Call-to-Action */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-2xl text-center space-y-6 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="max-w-2xl mx-auto space-y-3 relative z-10">
            <span className="px-3.5 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-400/30 inline-block">
              Seats Limited • Session 2026-2027
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
              Enroll Your Child at The Hayatabad Model School Today
            </h2>
            <p className="text-xs sm:text-sm text-blue-200">
              Submit your online application in under 3 minutes. Our admissions committee will review your application and schedule the baseline assessment.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 relative z-10">
            <Link
              href="/admissions/apply"
              className="px-8 py-3.5 rounded-2xl bg-white text-blue-900 font-extrabold text-sm shadow-xl hover:bg-blue-50 transition-all hover:scale-105"
            >
              Start Online Admission Application
            </Link>
            <Link
              href="/admissions/track"
              className="px-6 py-3.5 rounded-2xl bg-blue-800/60 hover:bg-blue-800 text-white font-bold text-sm border border-blue-700 transition-all"
            >
              Track Existing Application
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-12 px-4 sm:px-6 lg:px-8 border-t border-slate-800 text-xs mt-auto">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-3">
              <img src="/school-logo.png" alt="THMS Logo" className="w-10 h-10 object-contain" />
              <div>
                <h3 className="font-extrabold text-white text-base">The Hayatabad Model School</h3>
                <p className="text-[11px] text-slate-500">Government Registered & BISE Peshawar Affiliated</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-md">
              Committed to providing world-class academic standards, scientific inquiry, moral character grooming, and digital innovation for the children of Peshawar.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-white uppercase text-[11px] tracking-wider">Quick Navigation</h4>
            <ul className="space-y-1.5 text-xs">
              <li><Link href="/admissions/apply" className="hover:text-white">Online Admission</Link></li>
              <li><Link href="/login" className="hover:text-white">Student & Parent Portal</Link></li>
              <li><Link href="/login" className="hover:text-white">Teacher Login</Link></li>
              <li><Link href="/login" className="hover:text-white">Admin Management</Link></li>
              <li><Link href="/forgot-password" className="hover:text-white">Forgot Password</Link></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-white uppercase text-[11px] tracking-wider">Campus Contact</h4>
            <ul className="space-y-1.5 text-xs">
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
          <span>© 2026 The Hayatabad Model School. All Rights Reserved.</span>
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
