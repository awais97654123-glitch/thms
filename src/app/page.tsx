'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Lock,
  Search,
  BookMarked,
  Layers,
  HeartHandshake,
  KeyRound,
  X
} from 'lucide-react';
import Header from '@/components/common/Header';

// Smooth Scroll Reveal Wrapper using IntersectionObserver
function RevealOnScroll({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`reveal-init ${isVisible ? 'reveal-visible' : ''} ${className}`}
    >
      {children}
    </div>
  );
}

export default function HomePage() {
  const [stats, setStats] = useState({
    totalStudents: 1250,
    totalTeachers: 48,
    yearsExcellence: 28,
    matricPassRate: 100,
    academicWings: 4,
    secureCampus: 100,
  });

  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [faculty, setFaculty] = useState<any[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [activeLightboxImage, setActiveLightboxImage] = useState<string | null>(null);

  // Mouse position for subtle interactive hero ambient glow
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Fetch real dashboard stats if available
    fetch('/api/admin/dashboard-stats')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.stats) {
          setStats((prev) => ({
            ...prev,
            totalStudents: data.stats.totalStudents || prev.totalStudents,
            totalTeachers: data.stats.totalTeachers || prev.totalTeachers,
          }));
        }
      })
      .catch(() => {});

    // Fetch real faculty
    fetch('/api/teachers')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.teachers && data.teachers.length > 0) {
          setFaculty(data.teachers.slice(0, 8));
        }
      })
      .catch(() => {});

    // Fetch real announcements
    fetch('/api/announcements')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.announcements) {
          setAnnouncements(data.announcements.slice(0, 4));
        }
      })
      .catch(() => {});
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  // Why Choose The Hayatabad Model School (8 Core Pillars)
  const whyChooseUs = [
    {
      title: 'Academic Excellence & BISE Top Positions',
      desc: 'Proven track record of top positions in BISE Peshawar Board matric examinations with rigorous academic mentoring.',
      icon: Award,
      color: 'from-orange-500 to-amber-500',
    },
    {
      title: 'Character, Discipline & Islamic Ethics',
      desc: 'Holistic upbringing cultivating personal responsibility, Islamic values, punctuality, and mutual respect.',
      icon: HeartHandshake,
      color: 'from-amber-500 to-orange-600',
    },
    {
      title: 'Modern Computer & AI Laboratories',
      desc: 'High-speed coding workstations, computer programming, digital literacy, and artificial intelligence workshops.',
      icon: Cpu,
      color: 'from-slate-900 to-slate-800',
    },
    {
      title: 'Robotics & STEM Hands-on Learning',
      desc: 'Practical physics, chemistry, biology, and robotics kits that spark innovation and critical inquiry in young minds.',
      icon: Compass,
      color: 'from-orange-600 to-amber-600',
    },
    {
      title: 'Certified & Caring Faculty Specialists',
      desc: 'Experienced subject matter educators dedicated to individualized student attention and conceptual mastery.',
      icon: Users,
      color: 'from-amber-600 to-orange-500',
    },
    {
      title: 'Smart Campus & Instant Gate QR Tracking',
      desc: 'Encrypted digital ID cards with real-time gate entry/exit logging instantly notified to parents’ mobile portals.',
      icon: ShieldCheck,
      color: 'from-emerald-600 to-teal-600',
    },
    {
      title: 'Sports, Arts & Co-Curricular Growth',
      desc: 'Vibrant indoor & outdoor athletics, bilingual declamation contests, arts studio, and inter-school science exhibitions.',
      icon: Palette,
      color: 'from-orange-500 to-amber-500',
    },
    {
      title: '100% Merit & Sibling Scholarships',
      desc: 'Financial fee concessions and full merit scholarships rewarding high academic achievers, orphans, and siblings.',
      icon: Sparkles,
      color: 'from-amber-500 to-orange-600',
    },
  ];

  // Facilities Alternating Sections
  const campusFacilities = [
    {
      title: 'Modern Computer & AI Laboratory',
      subtitle: 'Coding, Digital Literacy & Artificial Intelligence',
      desc: 'Our dedicated IT and computer labs are equipped with high-speed networked workstations, modern software development tools, and multimedia projectors where students learn programming foundations, AI concepts, and digital design.',
      image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
      tag: 'Technology & Computing',
    },
    {
      title: 'Advanced Science Laboratories',
      subtitle: 'Physics, Chemistry & Biology Practical Work',
      desc: 'Fully equipped experimental stations adhering to BISE Peshawar Board standards. Students conduct hands-on chemical reactions, microscopic biological observations, and optical physics experiments under certified lab instructors.',
      image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&auto=format&fit=crop&q=80',
      tag: 'Scientific Discovery',
    },
    {
      title: 'Smart Classrooms & Audio-Visual Learning',
      subtitle: 'Interactive Digital Whiteboards & Ergonomic Spaces',
      desc: 'Airy, well-ventilated, and naturally lit classrooms featuring digital projectors, interactive learning displays, and comfortable seating designed to maximize student engagement and collaborative study.',
      image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&auto=format&fit=crop&q=80',
      tag: 'Modern Environment',
    },
    {
      title: 'Sports Arena & Outdoor Playgrounds',
      subtitle: 'Physical Fitness, Teamwork & Athletics',
      desc: 'Spacious sports grounds catering to cricket, football, badminton, and table tennis. Regular physical training sessions promote sportsmanship, endurance, and physical health in a safe, monitored setting.',
      image: 'https://images.unsplash.com/photo-1526676037777-05a232554f77?w=800&auto=format&fit=crop&q=80',
      tag: 'Athletics & Health',
    },
  ];

  // Learning Journey Stages (4 Academic Wings)
  const learningStages = [
    {
      stage: '01',
      name: 'Early Years Montessori',
      grades: 'Playgroup • Nursery • Prep',
      age: 'Ages 3 – 6 Years',
      desc: 'Child-centric sensory exploration, phonics mastery, cognitive foundation, socialization, and nurturing care in safe classrooms.',
      image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&auto=format&fit=crop&q=80',
    },
    {
      stage: '02',
      name: 'Primary Foundation Wing',
      grades: 'Class 1 to Class 5',
      age: 'Ages 6 – 11 Years',
      desc: 'Bilingual literacy, mathematical logic, basic computer skills, general sciences, and Islamic moral education development.',
      image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=80',
    },
    {
      stage: '03',
      name: 'Middle STEM Wing',
      grades: 'Class 6 to Class 8',
      age: 'Ages 11 – 14 Years',
      desc: 'Integrated physical and biological sciences, algebraic reasoning, computer programming, and pre-matric academic rigor.',
      image: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=600&auto=format&fit=crop&q=80',
    },
    {
      stage: '04',
      name: 'Secondary / BISE Board (Matric)',
      grades: 'Class 9 & Class 10',
      age: 'Ages 14 – 16 Years',
      desc: 'Comprehensive BISE Peshawar board examination preparation in Science & Computer Science groups with intensive practical labs.',
      image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&auto=format&fit=crop&q=80',
    },
  ];

  // School Life Gallery Images
  const galleryImages = [
    { src: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&auto=format&fit=crop&q=80', title: 'Smart Classroom Collaboration' },
    { src: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&auto=format&fit=crop&q=80', title: 'Chemistry & Biology Laboratory' },
    { src: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80', title: 'Computer Science & AI Lab' },
    { src: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&auto=format&fit=crop&q=80', title: 'Central Reference Library' },
    { src: 'https://images.unsplash.com/photo-1526676037777-05a232554f77?w=800&auto=format&fit=crop&q=80', title: 'Campus Sports & Activity Day' },
    { src: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&auto=format&fit=crop&q=80', title: 'Montessori Play & Learn Session' },
  ];

  const faqs = [
    { q: 'How do I submit an online admission application for Session 2026-2027?', a: 'Click the "Apply for Admission" button in the header or hero section. Fill in student details, parent contact information, and upload a student photograph. You will receive an instant application tracking ID.' },
    { q: 'What curriculum and examination board is followed?', a: 'We follow the standardized National Curriculum aligned with BISE Peshawar Board for Matriculation, enriched with Oxford & Cambridge STEM, robotics, and bilingual English fluency programs.' },
    { q: 'Are merit and need-based scholarships available?', a: 'Yes! We offer up to 100% tuition scholarships for academic position holders, orphans, and siblings.' },
    { q: 'How does the Smart Attendance and QR gate system work?', a: 'Every student receives an official Smart ID card with an encrypted QR code. Attendance is recorded in real time upon arrival and departure and synced directly to the parent and student portals.' },
  ];

  return (
    <div className="min-h-screen bg-[#fafaf9] text-slate-900 font-sans selection:bg-orange-500 selection:text-white flex flex-col">
      {/* Sticky Header */}
      <Header />

      {/* 1. HERO SECTION — Vivid, Bright & Clear Campus Image Background with Staggered Animations */}
      <section 
        onMouseMove={handleMouseMove}
        className="relative overflow-hidden pt-12 pb-24 lg:pt-20 lg:pb-36 bg-slate-900 text-white"
      >
        {/* Crisp, Bright, High-Clarity Campus Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-70 scale-105 transition-transform duration-1000 ease-out"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1562774053-701939374585?w=1800&auto=format&fit=crop&q=85')` }}
        ></div>

        {/* Luminous Soft Gradient Overlay for Crystal Clear Text Contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-900/40 to-slate-950/80"></div>
        <div 
          className="absolute w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-orange-500/25 via-amber-500/20 to-transparent blur-3xl pointer-events-none transition-all duration-300 -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${mousePos.x}px`, top: `${mousePos.y}px` }}
        ></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-center z-10">
          
          {/* Animated School Badge */}
          <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-slate-900/80 backdrop-blur-md text-orange-400 text-xs font-black border border-orange-500/40 shadow-xl animate-in fade-in slide-in-from-top-4 duration-700">
            <Sparkles className="w-4 h-4 text-orange-400 animate-spin" />
            <span className="tracking-widest uppercase">The Hayatabad Model School • Phase 3, Peshawar</span>
          </div>

          {/* Staggered Animated Headline with Glowing Shadow */}
          <div className="space-y-3 max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.1] drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)] animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
              Shaping Bright Minds.
              <span className="block mt-2 bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500 bg-clip-text text-transparent drop-shadow-md">
                Building Strong Futures.
              </span>
            </h1>

            <p className="text-base sm:text-xl text-slate-100 font-medium leading-relaxed max-w-3xl mx-auto pt-4 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
              Delivering 28+ years of premier academic excellence, character building, state-of-the-art AI laboratories, and proven BISE Peshawar Board position holders from <strong className="text-white font-bold">Playgroup to Class 10 (Matric)</strong>.
            </p>
          </div>

          {/* Hero Action Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300">
            <Link
              href="/admissions/apply"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-black text-sm shadow-xl shadow-orange-500/30 flex items-center justify-center gap-3 transition-all hover:scale-105 hover:shadow-orange-500/40"
            >
              <span>Apply for Admission</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href="#about"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900/80 hover:bg-slate-900 text-white font-black text-sm border border-white/30 backdrop-blur-md flex items-center justify-center gap-2 transition-all hover:scale-105 shadow-lg"
            >
              <span>Explore Our School</span>
              <ChevronDown className="w-4 h-4 text-orange-400" />
            </a>

            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-950/90 hover:bg-slate-900 text-slate-100 font-black text-sm border border-slate-700 flex items-center justify-center gap-2 transition-all hover:scale-105 shadow-lg"
            >
              <KeyRound className="w-4 h-4 text-orange-400" />
              <span>Login to ERP</span>
            </Link>
          </div>

        </div>
      </section>

      {/* 2. REAL ANIMATED STATISTICS SECTION */}
      <RevealOnScroll className="relative -mt-12 z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white/95 backdrop-blur-2xl rounded-3xl border border-orange-500/15 shadow-2xl p-8 sm:p-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 text-center">
          
          <div className="space-y-1">
            <h3 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
              {stats.totalStudents}+
            </h3>
            <p className="text-[11px] font-black uppercase tracking-wider text-orange-600">Students Enrolled</p>
          </div>

          <div className="space-y-1">
            <h3 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
              {stats.totalTeachers}+
            </h3>
            <p className="text-[11px] font-black uppercase tracking-wider text-orange-600">Active Teachers</p>
          </div>

          <div className="space-y-1">
            <h3 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
              28+
            </h3>
            <p className="text-[11px] font-black uppercase tracking-wider text-orange-600">Years of Legacy</p>
          </div>

          <div className="space-y-1">
            <h3 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
              100%
            </h3>
            <p className="text-[11px] font-black uppercase tracking-wider text-orange-600">BISE Board Pass Rate</p>
          </div>

          <div className="space-y-1">
            <h3 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
              4
            </h3>
            <p className="text-[11px] font-black uppercase tracking-wider text-orange-600">Academic Wings</p>
          </div>

          <div className="space-y-1">
            <h3 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
              100%
            </h3>
            <p className="text-[11px] font-black uppercase tracking-wider text-orange-600">Secure QR Campus</p>
          </div>

        </div>
      </RevealOnScroll>

      {/* 3. "WHY CHOOSE THE HAYATABAD MODEL SCHOOL?" (8 Core Pillars) */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          
          <RevealOnScroll className="text-center space-y-3 max-w-3xl mx-auto">
            <span className="text-xs font-black uppercase tracking-wider text-orange-600 bg-orange-50 px-4 py-1.5 rounded-full border border-orange-200">
              The THMS Standard
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight">
              Why Choose The Hayatabad Model School?
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
              Combining 28 years of pedagogical tradition with 21st-century technological tools and character development.
            </p>
          </RevealOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyChooseUs.map((item, idx) => {
              const Icon = item.icon;
              return (
                <RevealOnScroll key={idx} delay={idx * 75}>
                  <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-orange-300 transition-all duration-300 space-y-4 group hover:-translate-y-1 h-full flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${item.color} text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-black text-base text-slate-900 leading-snug group-hover:text-orange-600 transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-xs text-slate-600 leading-relaxed font-medium">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                </RevealOnScroll>
              );
            })}
          </div>

        </div>
      </section>

      {/* 4. ABOUT THE SCHOOL SECTION — Image LEFT / Story RIGHT */}
      <section id="about" className="py-20 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left: Large High-Quality Campus Visual */}
          <RevealOnScroll className="lg:col-span-6 relative" delay={100}>
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-100 group">
              <img
                src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=900&auto=format&fit=crop&q=80"
                alt="Students at The Hayatabad Model School"
                className="w-full h-[450px] object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
                <span className="text-xs font-black text-orange-400 uppercase tracking-widest">Established 1998</span>
                <h4 className="text-lg font-black">28+ Years of Academic Excellence in Peshawar</h4>
              </div>
            </div>
          </RevealOnScroll>

          {/* Right: School Mission & Narrative */}
          <RevealOnScroll className="lg:col-span-6 space-y-6" delay={200}>
            <div className="space-y-2">
              <span className="text-xs font-black uppercase tracking-wider text-orange-600 bg-orange-50 px-3.5 py-1 rounded-full border border-orange-200">
                About The School
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight leading-tight">
                Education Beyond the Classroom
              </h2>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              Founded in 1998 in Phase 3, Hayatabad, Peshawar, <strong className="text-slate-900 font-bold">The Hayatabad Model School</strong> has developed into one of Khyber Pakhtunkhwa’s premier educational institutions. We believe that true education extends far beyond memorization—it is about nurturing curiosity, building moral integrity, and fostering technological proficiency.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-orange-50/60 border border-orange-200/80 space-y-1">
                <span className="font-black text-xs text-orange-950 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-orange-600" />
                  Holistic Development
                </span>
                <p className="text-[11px] text-slate-600 font-medium">Balancing academic rigor with sports, arts, and character building.</p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-1">
                <span className="font-black text-xs text-amber-950 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-600" />
                  Islamic Moral Values
                </span>
                <p className="text-[11px] text-slate-600 font-medium">Instilling honesty, humility, punctuality, and civic respect.</p>
              </div>
            </div>

            <div className="pt-2">
              <a
                href="#academics"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs shadow-md transition-all hover:scale-105"
              >
                <span>Discover Our Academic Wings</span>
                <ArrowRight className="w-3.5 h-3.5 text-orange-400" />
              </a>
            </div>
          </RevealOnScroll>

        </div>
      </section>

      {/* 5. CAMPUS & FACILITIES (Large Image-Driven Alternating Layout) */}
      <section id="campus" className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          
          <RevealOnScroll className="text-center space-y-3 max-w-3xl mx-auto">
            <span className="text-xs font-black uppercase tracking-wider text-orange-600 bg-orange-50 px-4 py-1.5 rounded-full border border-orange-200">
              Campus Infrastructure
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight">
              Our Campus & Facilities
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
              Purpose-built facilities engineered to inspire, experiment, discover, and excel in both academics and sports.
            </p>
          </RevealOnScroll>

          <div className="space-y-12">
            {campusFacilities.map((fac, idx) => {
              const isEven = idx % 2 === 0;
              return (
                <RevealOnScroll key={idx} delay={idx * 100}>
                  <div
                    className={`grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all ${
                      isEven ? '' : 'lg:flex-row-reverse'
                    }`}
                  >
                    {/* Visual */}
                    <div className={`lg:col-span-6 overflow-hidden rounded-2xl ${isEven ? 'order-1' : 'order-1 lg:order-2'}`}>
                      <img
                        src={fac.image}
                        alt={fac.title}
                        className="w-full h-72 sm:h-80 object-cover hover:scale-105 transition-transform duration-500 rounded-2xl"
                      />
                    </div>

                    {/* Content */}
                    <div className={`lg:col-span-6 space-y-4 ${isEven ? 'order-2' : 'order-2 lg:order-1'}`}>
                      <span className="text-[10px] font-black uppercase tracking-wider text-orange-600 bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
                        {fac.tag}
                      </span>
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                        {fac.title}
                      </h3>
                      <p className="text-xs font-bold text-orange-600">
                        {fac.subtitle}
                      </p>
                      <p className="text-xs text-slate-600 leading-relaxed font-medium">
                        {fac.desc}
                      </p>
                    </div>
                  </div>
                </RevealOnScroll>
              );
            })}
          </div>

        </div>
      </section>

      {/* 6. DEDICATED LIBRARY SECTION ("Knowledge Lives Here") */}
      <section className="py-20 bg-slate-950 text-white relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-25"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1600&auto=format&fit=crop&q=80')` }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-transparent"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <RevealOnScroll className="lg:col-span-7 space-y-6" delay={100}>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/20 text-orange-400 text-xs font-black border border-orange-400/30">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Central School Library</span>
            </div>
            
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Knowledge Lives Here.
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium max-w-2xl">
              Our central library houses an extensive collection of Oxford reference books, scientific encyclopedias, Islamic literature, Urdu poetry, and quiet digital research terminals for students across all grades.
            </p>

            <div className="grid grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                <span className="text-2xl font-black text-orange-400 block font-mono">10,000+</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Books & References</span>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                <span className="text-2xl font-black text-orange-400 block font-mono">100%</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Digital Catalog</span>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                <span className="text-2xl font-black text-orange-400 block font-mono">Daily</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Reading Hours</span>
              </div>
            </div>

            <div className="pt-2">
              <a
                href="#admissions"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-black text-xs shadow-xl shadow-orange-500/20 transition-all hover:scale-105"
              >
                <span>Apply & Join THMS</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </RevealOnScroll>

          <RevealOnScroll className="lg:col-span-5" delay={200}>
            <div className="rounded-3xl overflow-hidden shadow-2xl border border-white/10 group">
              <img
                src="https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&auto=format&fit=crop&q=80"
                alt="Library Interior"
                className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* 7. CHARACTER, DISCIPLINE & VALUES */}
      <section className="py-20 lg:py-28 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <RevealOnScroll className="text-center space-y-3 max-w-3xl mx-auto">
            <span className="text-xs font-black uppercase tracking-wider text-orange-600 bg-orange-50 px-4 py-1.5 rounded-full border border-orange-200">
              Moral Foundation
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight">
              Character, Discipline & Responsibility
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
              Education without character is incomplete. We emphasize core virtues that shape honorable and responsible citizens.
            </p>
          </RevealOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <RevealOnScroll delay={100}>
              <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200 space-y-3 h-full">
                <span className="text-3xl">🤝</span>
                <h3 className="font-black text-lg text-slate-900">Mutual Respect & Kindness</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Fostering an inclusive environment where students respect faculty, fellow classmates, school property, and diversity of thought.
                </p>
              </div>
            </RevealOnScroll>

            <RevealOnScroll delay={200}>
              <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200 space-y-3 h-full">
                <span className="text-3xl">⏰</span>
                <h3 className="font-black text-lg text-slate-900">Punctuality & Habitual Order</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Instilling morning discipline, timely homework submission, regular attendance, and clean personal presentation.
                </p>
              </div>
            </RevealOnScroll>

            <RevealOnScroll delay={300}>
              <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200 space-y-3 h-full">
                <span className="text-3xl">📖</span>
                <h3 className="font-black text-lg text-slate-900">Academic Integrity</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Encouraging original thinking, honest examination conduct, intellectual curiosity, and self-driven problem solving.
                </p>
              </div>
            </RevealOnScroll>
          </div>

        </div>
      </section>

      {/* 8. LEARNING JOURNEY — 4 ACADEMIC WINGS (Visual Timeline) */}
      <section id="academics" className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          
          <RevealOnScroll className="text-center space-y-3 max-w-3xl mx-auto">
            <span className="text-xs font-black uppercase tracking-wider text-orange-600 bg-orange-50 px-4 py-1.5 rounded-full border border-orange-200">
              Academic Wings
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight">
              The THMS Learning Journey
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
              Four progressive academic stages tailored to each phase of your child&apos;s intellectual and emotional maturity.
            </p>
          </RevealOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {learningStages.map((st, idx) => (
              <RevealOnScroll key={idx} delay={idx * 100}>
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group hover:-translate-y-1 h-full">
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={st.image}
                      alt={st.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-950/80 text-white font-mono text-xs font-black">
                      {st.stage}
                    </div>
                  </div>

                  <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                    <div className="space-y-1">
                      <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest">{st.age}</span>
                      <h3 className="font-black text-base text-slate-900 leading-snug">{st.name}</h3>
                      <p className="text-xs font-bold text-slate-500">{st.grades}</p>
                      <p className="text-xs text-slate-600 leading-relaxed font-medium pt-1">
                        {st.desc}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                      <Link
                        href="/admissions/apply"
                        className="inline-flex items-center gap-1.5 text-xs font-black text-orange-600 hover:text-orange-700"
                      >
                        <span>Enroll in this Wing</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </RevealOnScroll>
            ))}
          </div>

        </div>
      </section>

      {/* 9. FACULTY SHOWCASE (Real Faculty Profiles) */}
      <section id="faculty" className="py-20 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          
          <RevealOnScroll className="text-center space-y-3 max-w-3xl mx-auto">
            <span className="text-xs font-black uppercase tracking-wider text-orange-600 bg-orange-50 px-4 py-1.5 rounded-full border border-orange-200">
              Expert Educators
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
              Meet Our Distinguished Faculty
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
              Passionate subject educators with proven teaching methodologies and dedication to student success.
            </p>
          </RevealOnScroll>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {faculty.length > 0 ? (
              faculty.map((t, idx) => (
                <RevealOnScroll key={t.id || idx} delay={idx * 75}>
                  <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 text-center space-y-4 hover:shadow-lg transition-all group h-full">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white font-black text-2xl flex items-center justify-center mx-auto shadow-md group-hover:scale-105 transition-transform overflow-hidden">
                      {t.photoUrl ? (
                        <img src={t.photoUrl} alt={t.fullName} className="w-full h-full object-cover" />
                      ) : (
                        t.fullName?.charAt(0).toUpperCase() || 'T'
                      )}
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-black text-sm text-slate-900">{t.fullName}</h3>
                      <p className="text-xs font-bold text-orange-600">{t.designation || 'Senior Faculty'}</p>
                      <p className="text-[11px] text-slate-500 font-medium">{t.qualification || 'M.Sc / M.Ed'}</p>
                    </div>
                  </div>
                </RevealOnScroll>
              ))
            ) : (
              [
                { name: 'Engr. Farooq Ahmad', role: 'Head of Mathematics & STEM', qual: 'M.Sc Mathematics • 12 Yrs Exp' },
                { name: 'Dr. Ayesha Malik', role: 'Head of Biology & Sciences', qual: 'Ph.D Biology • 10 Yrs Exp' },
                { name: 'Prof. Tariq Mahmood', role: 'Head of Computer & AI', qual: 'MS Computer Science • 9 Yrs Exp' },
                { name: 'Ms. Sadia Khan', role: 'Senior English Department', qual: 'M.A English Literature • 8 Yrs Exp' },
              ].map((f, idx) => (
                <RevealOnScroll key={idx} delay={idx * 75}>
                  <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 text-center space-y-4 hover:shadow-lg transition-all group h-full">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white font-black text-2xl flex items-center justify-center mx-auto shadow-md group-hover:scale-105 transition-transform">
                      {f.name.charAt(0)}
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-black text-sm text-slate-900">{f.name}</h3>
                      <p className="text-xs font-bold text-orange-600">{f.role}</p>
                      <p className="text-[11px] text-slate-500 font-medium">{f.qual}</p>
                    </div>
                  </div>
                </RevealOnScroll>
              ))
            )}
          </div>

        </div>
      </section>

      {/* 10. SCHOOL LIFE MASONRY GALLERY WITH LIGHTBOX */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          
          <RevealOnScroll className="text-center space-y-3 max-w-3xl mx-auto">
            <span className="text-xs font-black uppercase tracking-wider text-orange-600 bg-orange-50 px-4 py-1.5 rounded-full border border-orange-200">
              Campus Moments
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight">
              Life at The Hayatabad Model School
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
              A glimpse into daily classroom discussions, laboratory discoveries, sporting tournaments, and campus celebrations.
            </p>
          </RevealOnScroll>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleryImages.map((img, idx) => (
              <RevealOnScroll key={idx} delay={idx * 75}>
                <div
                  onClick={() => setActiveLightboxImage(img.src)}
                  className="relative rounded-3xl overflow-hidden shadow-sm hover:shadow-xl cursor-pointer group h-64"
                >
                  <img
                    src={img.src}
                    alt={img.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                    <span className="text-white font-black text-xs tracking-wide">{img.title}</span>
                  </div>
                </div>
              </RevealOnScroll>
            ))}
          </div>

        </div>
      </section>

      {/* LIGHTBOX MODAL */}
      {activeLightboxImage && (
        <div 
          onClick={() => setActiveLightboxImage(null)}
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
        >
          <div className="relative max-w-4xl w-full">
            <button
              onClick={() => setActiveLightboxImage(null)}
              className="absolute -top-12 right-0 p-2 text-white hover:text-orange-400 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={activeLightboxImage}
              alt="Enlarged Campus View"
              className="w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl border border-white/20"
            />
          </div>
        </div>
      )}

      {/* 11. ADMISSIONS SECTION (5 Clear Steps) */}
      <section id="admissions" className="py-20 bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-transparent border-y border-orange-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          
          <RevealOnScroll className="text-center space-y-3 max-w-3xl mx-auto">
            <span className="text-xs font-black uppercase tracking-wider text-orange-600 bg-white px-4 py-1.5 rounded-full border border-orange-200 shadow-sm">
              Admissions 2026-2027
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight">
              Begin Your Child&apos;s Journey With Us
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
              Simple 5-step admission roadmap from initial online application to enrollment and smart pass issuance.
            </p>
          </RevealOnScroll>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              { step: '01', title: 'Submit Online Form', desc: 'Fill out our digital admission portal form and attach a photo in 3 minutes.' },
              { step: '02', title: 'Application Review', desc: 'Our admissions desk verifies student details and schedules an interview.' },
              { step: '03', title: 'Assessment / Meeting', desc: 'Friendly interaction to assess grade readiness and understand student potential.' },
              { step: '04', title: 'Admission Decision', desc: 'Receive official confirmation letter and 3-copy fee deposit voucher.' },
              { step: '05', title: 'Smart Pass & Start', desc: 'Receive smart QR ID card, uniform kit guidelines, and welcome orientation.' },
            ].map((st, idx) => (
              <RevealOnScroll key={idx} delay={idx * 75}>
                <div className="bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-orange-500/15 shadow-sm space-y-3 h-full">
                  <span className="text-3xl font-black text-orange-500/40 block font-mono">{st.step}</span>
                  <h3 className="font-black text-sm text-slate-900">{st.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">{st.desc}</p>
                </div>
              </RevealOnScroll>
            ))}
          </div>

          <RevealOnScroll className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4" delay={200}>
            <Link
              href="/admissions/apply"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-black text-sm shadow-xl shadow-orange-500/30 flex items-center justify-center gap-3 transition-all hover:scale-105"
            >
              <span>Apply Online Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/admissions/apply"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-black text-sm border border-slate-300 shadow-sm flex items-center justify-center gap-2 transition-all hover:scale-105"
            >
              <Search className="w-4 h-4 text-orange-600" />
              <span>Track Existing Application</span>
            </Link>
          </RevealOnScroll>

        </div>
      </section>

      {/* 12. LIVE SCHOOL UPDATES / ANNOUNCEMENTS */}
      <section id="news" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <RevealOnScroll className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-6">
            <div className="space-y-2">
              <span className="text-xs font-black uppercase tracking-wider text-orange-600 bg-orange-50 px-3.5 py-1 rounded-full border border-orange-200">
                Notice Board
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
                Live School Announcements
              </h2>
            </div>
            <Link
              href="/login"
              className="text-xs font-black text-orange-600 hover:text-orange-700 flex items-center gap-1.5"
            >
              <span>View All via Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </RevealOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {announcements.length > 0 ? (
              announcements.map((a, idx) => (
                <RevealOnScroll key={a.id || idx} delay={idx * 75}>
                  <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-3 h-full">
                    <span className="text-[10px] font-black uppercase tracking-wider text-orange-600 bg-orange-100/80 px-2.5 py-1 rounded-full">
                      {a.type || 'Academic'}
                    </span>
                    <h3 className="font-black text-sm text-slate-900 leading-snug">{a.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">{a.content}</p>
                  </div>
                </RevealOnScroll>
              ))
            ) : (
              [
                { title: 'Admissions Open 2026-2027', type: 'Admissions', date: 'Session 2026-27', desc: 'Online admissions open for Playgroup, Primary, Middle & Matric BISE streams.' },
                { title: 'STEM & Robotics Exhibition', type: 'Event', date: 'Upcoming', desc: 'Annual science and robotics project exhibition scheduled for next term.' },
                { title: '100% Merit Scholarships', type: 'Scholarship', date: 'Active', desc: 'Applications invited for merit positions and sibling tuition fee discount.' },
                { title: 'Smart QR ID Rollout', type: 'Security', date: 'Active', desc: 'Encrypted smart cards active for instant real-time parent gate notifications.' },
              ].map((n, idx) => (
                <RevealOnScroll key={idx} delay={idx * 75}>
                  <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-3 h-full">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider text-orange-600 bg-orange-100/80 px-2.5 py-0.5 rounded-full">
                        {n.type}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">{n.date}</span>
                    </div>
                    <h3 className="font-black text-sm text-slate-900 leading-snug">{n.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">{n.desc}</p>
                  </div>
                </RevealOnScroll>
              ))
            )}
          </div>

        </div>
      </section>

      {/* 13. FAQ ACCORDION SECTION */}
      <section className="py-20 bg-slate-50 border-t border-slate-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <RevealOnScroll className="text-center space-y-2">
            <span className="text-xs font-black uppercase tracking-wider text-orange-600 bg-orange-50 px-3.5 py-1 rounded-full border border-orange-200">
              Got Questions?
            </span>
            <h2 className="text-3xl font-black text-slate-950 tracking-tight">
              Frequently Asked Questions
            </h2>
          </RevealOnScroll>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <RevealOnScroll key={idx} delay={idx * 50}>
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-orange-50/40 transition-colors"
                  >
                    <span className="font-black text-sm text-slate-900">{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-orange-600 transition-transform ${openFaq === idx ? 'rotate-180' : ''}`} />
                  </button>
                  {openFaq === idx && (
                    <div className="px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3 font-medium">
                      {faq.a}
                    </div>
                  )}
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* 14. FINAL HERO CTA SECTION */}
      <section className="py-24 bg-slate-900 text-white relative overflow-hidden text-center">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1562774053-701939374585?w=1600&auto=format&fit=crop&q=85')` }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-slate-950"></div>

        <RevealOnScroll className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 z-10">
          <img src="/logo.png" alt="THMS" className="h-20 w-auto mx-auto object-contain drop-shadow-[0_4px_20px_rgba(249,115,22,0.4)]" />
          
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
            Your Child&apos;s Future Starts Here.
          </h2>

          <p className="text-sm sm:text-base text-slate-200 font-medium max-w-2xl mx-auto leading-relaxed drop-shadow-md">
            Join over 1,200+ students on their journey of academic brilliance, character growth, and technological mastery at The Hayatabad Model School.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/admissions/apply"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-black text-sm shadow-xl shadow-orange-500/30 flex items-center justify-center gap-3 transition-all hover:scale-105"
            >
              <span>Apply for Admission</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-950/80 hover:bg-slate-900 text-white font-black text-sm border border-white/20 backdrop-blur-md flex items-center justify-center gap-2 transition-all hover:scale-105 shadow-lg"
            >
              <KeyRound className="w-4 h-4 text-orange-400" />
              <span>Login to ERP</span>
            </Link>
          </div>
        </RevealOnScroll>
      </section>

      {/* 15. LARGE PROFESSIONAL FOOTER */}
      <footer id="contact" className="bg-slate-950 border-t border-slate-900 py-16 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          
          <div className="space-y-4">
            <img src="/logo.png" alt="The Hayatabad Model School" className="h-16 w-auto object-contain" />
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              The Hayatabad Model School, Phase 3, Peshawar. Providing premier education, character formation, and 100% board results since 1998.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-black text-white uppercase text-xs tracking-wider">Quick Navigation</h4>
            <div className="flex flex-col space-y-2 font-medium">
              <Link href="/" className="hover:text-orange-400 transition-colors">Home</Link>
              <a href="#about" className="hover:text-orange-400 transition-colors">About School</a>
              <a href="#academics" className="hover:text-orange-400 transition-colors">Academic Wings</a>
              <a href="#campus" className="hover:text-orange-400 transition-colors">Campus Facilities</a>
              <Link href="/admissions/apply" className="hover:text-orange-400 transition-colors">Online Admission</Link>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-black text-white uppercase text-xs tracking-wider">ERP Cloud Portals</h4>
            <div className="flex flex-col space-y-2 font-medium">
              <Link href="/login" className="hover:text-orange-400 transition-colors">Admin Command Center</Link>
              <Link href="/login" className="hover:text-orange-400 transition-colors">Teacher Workload Hub</Link>
              <Link href="/login" className="hover:text-orange-400 transition-colors">Student Attendance Desk</Link>
              <Link href="/login" className="hover:text-orange-400 transition-colors">Parent Portal & Fee Slips</Link>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-black text-white uppercase text-xs tracking-wider">Campus & Helpline</h4>
            <div className="space-y-2 text-xs">
              <p className="flex items-center gap-2.5 text-slate-300">
                <MapPin className="w-4 h-4 text-orange-400 shrink-0" />
                <span>Phase 3, Hayatabad, Peshawar, KPK</span>
              </p>
              <p className="flex items-center gap-2.5 text-slate-300">
                <PhoneCall className="w-4 h-4 text-orange-400 shrink-0" />
                <span className="font-mono">+92 91 5828100</span>
              </p>
              <p className="flex items-center gap-2.5 text-slate-300">
                <Mail className="w-4 h-4 text-orange-400 shrink-0" />
                <span>admissions@hayatabadmodel.edu.pk</span>
              </p>
            </div>
          </div>

        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 mt-10 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500 font-medium">
          <p>© 2026 The Hayatabad Model School. All Rights Reserved.</p>
          <p>Powered by THMS Cloud Engine • Connected to PostgreSQL</p>
        </div>
      </footer>
    </div>
  );
}
