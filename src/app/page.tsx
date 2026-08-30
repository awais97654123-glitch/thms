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
  Lock
} from 'lucide-react';
import Header from '@/components/common/Header';

export default function PublicHomePage() {
  const academicWings = [
    {
      title: 'Early Years / Pre-School',
      grades: 'Playgroup, Nursery & Prep',
      description: 'Activity-based Montessori learning, phonics development, foundational numeracy, and caring environment.',
      color: 'from-amber-500/10 to-orange-500/10 border-amber-200 text-amber-900',
      badge: 'Ages 3 - 5',
    },
    {
      title: 'Primary School Wing',
      grades: 'Class 1 to Class 5',
      description: 'Core literacy, mathematics, general science, Islamic ethics, computer basics, and creative arts.',
      color: 'from-blue-500/10 to-cyan-500/10 border-blue-200 text-blue-900',
      badge: 'Ages 6 - 10',
    },
    {
      title: 'Middle School Wing',
      grades: 'Class 6 to Class 8',
      description: 'Conceptual science, advanced mathematics, English grammar, analytical thinking, and leadership grooming.',
      color: 'from-emerald-500/10 to-teal-500/10 border-emerald-200 text-emerald-900',
      badge: 'Ages 11 - 13',
    },
    {
      title: 'Secondary SSC Wing',
      grades: 'Class 9 & 10 (BISE Peshawar)',
      description: 'Rigorous SSC Board examination preparation in Science group (Physics, Chemistry, Biology & Computer Science).',
      color: 'from-purple-500/10 to-indigo-500/10 border-purple-200 text-purple-900',
      badge: 'Matriculation',
    },
  ];

  const facilities = [
    {
      title: 'High-Tech Computer & Robotics Lab',
      desc: 'Modern networked PCs with high-speed internet, programming curriculum, and digital literacy tools.',
      icon: Laptop,
    },
    {
      title: 'Advanced Science Laboratories',
      desc: 'Well-equipped Physics, Chemistry, and Biology practical apparatus strictly following BISE curriculum.',
      icon: Microscope,
    },
    {
      title: 'Modern Library & Resource Hub',
      desc: 'Extensive repository of encyclopedias, Islamic literature, science reference books, and quiet reading halls.',
      icon: BookOpen,
    },
    {
      title: 'Safe Fleet Transportation',
      desc: 'Dedicated school vans covering all sectors of Hayatabad and surrounding areas with verified drivers.',
      icon: Bus,
    },
    {
      title: 'Automated QR / Smart Attendance',
      desc: 'Instant gate check-in alerts sent via Push Notification and SMS to parents in real-time.',
      icon: ShieldCheck,
    },
    {
      title: 'Islamic Values & Tahfeez Program',
      desc: 'Daily Nazra Quran, moral character building, and regular ethical counseling for students.',
      icon: Award,
    },
  ];

  const notices = [
    {
      tag: 'ADMISSION',
      title: 'Admissions Open for Academic Session 2026-2027 (Nursery to Class 9)',
      date: 'March 2026',
      link: '/admissions/apply',
    },
    {
      tag: 'EXAMINATIONS',
      title: 'Annual Examination Schedule & Model Papers Published Online',
      date: 'April 2026',
      link: '/login',
    },
    {
      tag: 'EVENTS',
      title: 'Annual Science & Robotics Exhibition and Sports Gala 2026',
      date: 'May 2026',
      link: '/admissions/track',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Top Header Navigation */}
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-950 via-slate-900 to-slate-950 text-white py-16 lg:py-24 px-4 sm:px-6 lg:px-8">
        {/* Ambient Lighting */}
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
              The Hayatabad Model School delivers quality education, modern STEM training, and moral character building from Nursery to Matriculation with certified faculty and cloud-connected portals for students, parents, and teachers.
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-2">
              <Link
                href="/admissions/apply"
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-extrabold text-sm shadow-xl shadow-blue-600/25 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
              >
                <span>Apply for Online Admission</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/login"
                className="px-6 py-3.5 rounded-2xl bg-white text-slate-900 hover:bg-slate-100 font-extrabold text-sm shadow-md flex items-center gap-2 transition-all hover:scale-105 active:scale-95 border border-slate-200"
              >
                <Lock className="w-4 h-4 text-blue-600" />
                <span>Portal Login (Students & Staff)</span>
              </Link>

              <Link
                href="/admissions/track"
                className="px-5 py-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700 flex items-center gap-2 transition-all"
              >
                <Search className="w-4 h-4 text-blue-400" />
                <span>Track Application</span>
              </Link>
            </div>

            {/* Metric Highlights */}
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
                  <div className="w-12 h-12 rounded-2xl overflow-hidden bg-white flex items-center justify-center p-1 shadow-md border border-slate-700">
                    <img
                      src="/school-logo.png"
                      alt="The Hayatabad Model School Logo"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white leading-tight">The Hayatabad Model School</h3>
                    <p className="text-[11px] text-slate-400">Hayatabad, Peshawar • Est. 2005</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Affiliated BISE
                </span>
              </div>

              {/* Online Admission Callout */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-900/40 to-slate-800 border border-blue-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-300 uppercase tracking-wider">Session 2026-2027</span>
                  <span className="text-[10px] text-amber-300 font-bold bg-amber-500/20 px-2 py-0.5 rounded-full">Limited Seats</span>
                </div>
                <h4 className="text-sm font-bold text-white">Online Admission Applications Open</h4>
                <p className="text-xs text-slate-300">
                  Complete the 4-step digital application form online and receive instant confirmation along with tracking number.
                </p>
                <Link
                  href="/admissions/apply"
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md"
                >
                  <span>Start Online Admission Application</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Direct Portal Access Bar */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Self-Service Portal Login
                </span>
                <p className="text-xs text-slate-400">
                  Students, parents, and teachers can login directly to check attendance, marks, homework, and fee status.
                </p>
                <Link
                  href="/login"
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all border border-slate-700"
                >
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Open Unified Login Screen</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Online Admission Process Steps */}
      <section className="py-16 bg-slate-50 border-b border-slate-200 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Hassle-Free Process</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Simple 4-Step Online Admission
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Apply from the comfort of your home in under 5 minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3 relative">
              <span className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-md">1</span>
              <h3 className="text-sm font-bold text-slate-900">Fill Application Form</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Provide student information, parent details, residential address, and select the desired class.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3 relative">
              <span className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shadow-md">2</span>
              <h3 className="text-sm font-bold text-slate-900">Upload Documents</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Attach student photo, previous school leaving certificate, and birth certificate/Form-B.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3 relative">
              <span className="w-8 h-8 rounded-full bg-purple-600 text-white font-bold text-xs flex items-center justify-center shadow-md">3</span>
              <h3 className="text-sm font-bold text-slate-900">Assessment & Interview</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Track status online and receive interview/admission test date updates directly on phone/portal.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3 relative">
              <span className="w-8 h-8 rounded-full bg-amber-500 text-white font-bold text-xs flex items-center justify-center shadow-md">4</span>
              <h3 className="text-sm font-bold text-slate-900">Instant Enrollment Slip</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Receive official Roll Number, student & parent login credentials, and printable fee voucher.
              </p>
            </div>
          </div>

          <div className="text-center pt-2">
            <Link
              href="/admissions/apply"
              className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm rounded-2xl shadow-xl shadow-blue-500/20 transition-all hover:scale-105"
            >
              <span>Apply Online for Admission Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Academic Programs Wing */}
      <section className="py-16 bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">Curriculum & Wings</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Academic Excellence from Nursery to Matric
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Comprehensive academic stages designed to foster critical thinking, moral character, and board examination success.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {academicWings.map((wing, idx) => (
              <div
                key={idx}
                className={`p-6 rounded-3xl border bg-gradient-to-b ${wing.color} shadow-sm space-y-3 flex flex-col justify-between`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/80 border">
                      {wing.badge}
                    </span>
                    <GraduationCap className="w-5 h-5 opacity-70" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{wing.title}</h3>
                  <p className="text-xs font-semibold text-blue-700">{wing.grades}</p>
                  <p className="text-xs text-slate-600 leading-relaxed">{wing.description}</p>
                </div>
                <Link
                  href="/admissions/apply"
                  className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 pt-2"
                >
                  <span>Apply for this Wing</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Facilities & Infrastructure */}
      <section className="py-16 bg-slate-50 border-b border-slate-200 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Campus Life</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              State-of-the-Art School Facilities
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Purpose-built campus designed for safe, engaging, and comprehensive student development.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {facilities.map((fac, idx) => {
              const Icon = fac.icon;
              return (
                <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{fac.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{fac.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Latest Notices & Announcements */}
      <section className="py-16 bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Notice Board</span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">Latest School Announcements</h2>
            </div>
            <Link
              href="/login"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>Login for All Notices</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {notices.map((n, idx) => (
              <div key={idx} className="p-5 rounded-3xl border border-slate-200 bg-slate-50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                    {n.tag}
                  </span>
                  <span className="text-[11px] text-slate-400">{n.date}</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 leading-snug">{n.title}</h3>
                <Link
                  href={n.link}
                  className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 pt-1"
                >
                  <span>View Details</span>
                  <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-white pt-16 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 border-b border-slate-800 pb-12">
          {/* Col 1 */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-white flex items-center justify-center p-0.5">
                <img src="/school-logo.png" alt="School Crest" className="w-full h-full object-contain" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">The Hayatabad Model School</h3>
                <p className="text-[11px] text-slate-400">Hayatabad, Peshawar</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Excellence in academics, Islamic morals, and modern science education in Peshawar, Khyber Pakhtunkhwa.
            </p>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Quick Links</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link href="/" className="hover:text-white transition-colors">Home Page</Link></li>
              <li><Link href="/admissions/apply" className="hover:text-white transition-colors">Online Admission Form</Link></li>
              <li><Link href="/admissions/track" className="hover:text-white transition-colors">Track Admission Status</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">Portal Login</Link></li>
            </ul>
          </div>

          {/* Col 3: Portals */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Dedicated Portals</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link href="/login" className="hover:text-white transition-colors">Student Portal</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">Parent Portal</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">Faculty & Teacher Portal</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">Administration ERP</Link></li>
            </ul>
          </div>

          {/* Col 4: Contact */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Campus Contact</h4>
            <div className="space-y-2 text-xs text-slate-400">
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>Sector F-4, Phase 6, Hayatabad, Peshawar, KP, Pakistan</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>+92 91 5812345 / +92 333 9123456</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <span>admissions@hayatabadmodel.edu.pk</span>
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-8 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 The Hayatabad Model School. All Rights Reserved.</p>
          <p className="font-mono text-[11px]">ISO 9001:2015 • BISE Peshawar Registered</p>
        </div>
      </footer>
    </div>
  );
}
