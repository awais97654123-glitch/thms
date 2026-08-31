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
  ChevronLeft,
  Compass, 
  Cpu, 
  Star, 
  Clock, 
  HelpCircle, 
  School, 
  ChevronDown, 
  Search, 
  HeartHandshake, 
  KeyRound, 
  X,
  Play,
  Download,
  FileText,
  Building2,
  Phone,
  ArrowUpRight,
  ChevronUp
} from 'lucide-react';
import Header from '@/components/common/Header';
import CampusTourModal, { CAMPUS_FACILITIES } from '@/components/common/CampusTourModal';
import NoticeModal from '@/components/common/NoticeModal';
import ProspectusModal from '@/components/common/ProspectusModal';

// Smooth Scroll Reveal Wrapper using IntersectionObserver
function RevealOnScroll({ 
  children, 
  className = '', 
  delay = 0,
  animation = 'reveal-init'
}: { 
  children: React.ReactNode; 
  className?: string; 
  delay?: number;
  animation?: string;
}) {
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
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
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
      className={`${animation} ${isVisible ? 'reveal-visible' : ''} ${className}`}
    >
      {children}
    </div>
  );
}

// Smooth Number Counter on Viewport Enter
function AnimatedCounter({ end, duration = 2000, suffix = '', prefix = '' }: { end: number; duration?: number; suffix?: string; prefix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
          let startTimestamp: number | null = null;
          const step = (timestamp: number) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            // Ease out cubic
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(easeProgress * end));
            if (progress < 1) {
              window.requestAnimationFrame(step);
            } else {
              setCount(end);
            }
          };
          window.requestAnimationFrame(step);
        }
      },
      { threshold: 0.2 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [end, duration, started]);

  return (
    <span ref={ref}>
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

// Curated High-Res Educational Assets
const IMAGES = {
  heroCampus: '/hero-campus.jpg',
  aboutMain: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1200&q=85',
  aboutSecondary: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=85',
  primaryWing: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1000&q=85',
  middleWing: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1000&q=85',
  secondaryWing: 'https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=1000&q=85',
  matricWing: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&w=1000&q=85',
  scienceLab: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1000&q=85',
  computerLab: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1000&q=85',
  library: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1000&q=85',
  sports: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1000&q=85',
  transport: 'https://images.unsplash.com/photo-1557223562-6c77ef16210f?auto=format&fit=crop&w=1000&q=85',
  ctaBg: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=2000&q=85',
};

// Fallback faculty data if API is pending
const DEFAULT_FACULTY = [
  {
    name: 'Prof. Muhammad Tariq Khan',
    designation: 'Principal & Head of Academic Council',
    department: 'Academic Leadership',
    qualification: 'M.Phil Education (Gold Medalist), M.Sc Physics',
    experience: '24+ Years Experience',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Dr. Shahida Parveen',
    designation: 'Vice Principal & Head of Science Wing',
    department: 'Biological Sciences',
    qualification: 'Ph.D. Biotechnology, M.Sc Botany',
    experience: '18+ Years Experience',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Engr. Farhan Ali Afridi',
    designation: 'Head of STEM & Computer Science',
    department: 'Computer Science & Robotics',
    qualification: 'MS Computer Engineering (UET Peshawar)',
    experience: '12+ Years Experience',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Mrs. Samina Qureshi',
    designation: 'Head of Primary & Early Years Wing',
    department: 'Child Development & Phonics',
    qualification: 'M.A. English Literature & Montessori Certified',
    experience: '15+ Years Experience',
    image: 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?auto=format&fit=crop&w=600&q=80',
  },
];

// Fallback announcements
const DEFAULT_ANNOUNCEMENTS = [
  {
    id: 1,
    title: 'Admissions Open for Session 2026–2027 (Playgroup to 10th Class)',
    date: 'August 28, 2026',
    category: 'Admissions',
    excerpt: 'Registration is now open for prospective students across all academic wings. Entrance evaluation dates and merit scholarship test schedules announced.',
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 2,
    title: 'Outstanding BISE Peshawar Board Matriculation Examination Results',
    date: 'August 20, 2026',
    category: 'Academic Honor',
    excerpt: 'Hayatabad Model School students secured top distinction positions in BISE Peshawar SSC annual exams with a 100% pass record in Pre-Medical & Pre-Engineering.',
    image: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 3,
    title: 'Annual Inter-School Science Olympiad & Robotics Exhibition 2026',
    date: 'August 12, 2026',
    category: 'STEM & Co-Curricular',
    excerpt: 'Students showcased over 40 innovative prototypes in renewable energy, automated robotics, and environmental science before esteemed university judges.',
    image: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=800&q=80',
  },
];

// Testimonials Data
const TESTIMONIALS = [
  {
    id: 1,
    quote:
      'The Hayatabad Model School has provided my children with not only stellar academic preparation for their board exams, but also a deep sense of discipline, Islamic values, and self-confidence. The teachers are exceptional.',
    parentName: 'Dr. Asadullah Jan',
    parentRole: 'Parent of Class 9 & Class 7 Students • Consultant Surgeon, Hayatabad Medical Complex',
    rating: 5,
  },
  {
    id: 2,
    quote:
      'The focus on conceptual learning and hands-on science laboratories makes all the difference. My daughter secured 94% in BISE Peshawar Matric exams and effortlessly gained admission into top pre-medical colleges.',
    parentName: 'Engr. Maria Bibi',
    parentRole: 'Parent of 2025 SSC Alumna • Senior Telecommunications Engineer',
    rating: 5,
  },
  {
    id: 3,
    quote:
      'From safe transport to monitored classrooms and active parent-teacher communication via their portal, the administration operates with absolute transparency and prestige. A true model school.',
    parentName: 'Col. (R) Tariq Mahmood',
    parentRole: 'Parent of Class 5 Student • Phase 3 Resident, Peshawar',
    rating: 5,
  },
];

export default function HomePage() {
  const [stats, setStats] = useState({
    totalStudents: 1250,
    totalTeachers: 85,
    yearsExcellence: 28,
    matricPassRate: 98,
    safeCampus: 100,
  });

  const [announcements, setAnnouncements] = useState<any[]>(DEFAULT_ANNOUNCEMENTS);
  const [faculty, setFaculty] = useState<any[]>(DEFAULT_FACULTY);
  
  // Modals state
  const [tourModalOpen, setTourModalOpen] = useState(false);
  const [tourInitialSlide, setTourInitialSlide] = useState(0);
  const [selectedNotice, setSelectedNotice] = useState<any | null>(null);
  const [prospectusModalOpen, setProspectusModalOpen] = useState(false);
  
  // Testimonials Slider State
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  useEffect(() => {
    // Fetch live dashboard stats if available
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

    // Fetch faculty
    fetch('/api/teachers')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.teachers) && data.teachers.length > 0) {
          const formatted = data.teachers.slice(0, 4).map((t: any, idx: number) => ({
            name: t.fullName || t.name,
            designation: t.designation || 'Senior Educator',
            department: t.department || t.subject || 'Faculty of Sciences',
            qualification: t.qualification || 'M.Phil / Master Degree',
            experience: t.experience || 'Experienced Educator',
            image: t.photoUrl || DEFAULT_FACULTY[idx % DEFAULT_FACULTY.length].image,
          }));
          setFaculty(formatted);
        }
      })
      .catch(() => {});

    // Fetch announcements
    fetch('/api/announcements')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.announcements) && data.announcements.length > 0) {
          const formatted = data.announcements.slice(0, 3).map((a: any, idx: number) => ({
            id: a.id,
            title: a.title,
            date: new Date(a.createdAt || Date.now()).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            }),
            category: a.category || 'Official Circular',
            excerpt: a.content ? a.content.substring(0, 140) + '...' : DEFAULT_ANNOUNCEMENTS[idx % DEFAULT_ANNOUNCEMENTS.length].excerpt,
            content: a.content,
            image: a.imageUrl || DEFAULT_ANNOUNCEMENTS[idx % DEFAULT_ANNOUNCEMENTS.length].image,
          }));
          setAnnouncements(formatted);
        }
      })
      .catch(() => {});
  }, []);

  // Automatic Testimonial Slider
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  const openTour = (slideIndex = 0) => {
    setTourInitialSlide(slideIndex);
    setTourModalOpen(true);
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail) {
      setNewsletterSubscribed(true);
      setNewsletterEmail('');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#ffffff] bg-white text-slate-900 selection:bg-blue-600 selection:text-white">
      
      {/* Sticky Header with Thin Top Bar */}
      <Header />

      <main className="flex-grow">
        
        {/* ================================================================
            SECTION 1: CINEMATIC PRESTIGE HERO SECTION
           ================================================================ */}
        <section className="relative min-h-[90vh] lg:min-h-[92vh] flex items-center justify-center overflow-hidden bg-slate-900 text-white">
          
          {/* Background Image with Ken Burns Slow Zoom */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            <img
              src={IMAGES.heroCampus}
              alt="The Hayatabad Model School Campus"
              className="w-full h-full object-cover object-center animate-ken-burns filter brightness-100 contrast-105"
            />
            {/* Soft, light gradient overlay to keep building bright while ensuring typography contrast */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a192f]/80 via-[#0a192f]/45 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a192f]/60 via-transparent to-black/20" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              
              {/* Left Column: Hero Typography & Call-To-Actions */}
              <div className="lg:col-span-8 space-y-6 text-left">
                
                {/* Small Section Label */}
                <RevealOnScroll delay={100}>
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-600/25 border border-blue-500/40 backdrop-blur-md">
                    <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-[11px] sm:text-xs uppercase font-bold tracking-widest text-blue-300">
                      Welcome to The Hayatabad Model School
                    </span>
                  </div>
                </RevealOnScroll>

                {/* Main Heading: Staggered Line Reveal with Blue Accents */}
                <RevealOnScroll delay={250}>
                  <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.15]">
                    Shaping Bright Minds, <br />
                    <span className="text-blue-400 relative inline-block">
                      Building Strong Futures.
                      <span className="absolute left-0 bottom-1 w-full h-[2px] bg-gradient-to-r from-blue-400 to-transparent" />
                    </span>
                  </h1>
                </RevealOnScroll>

                {/* Supporting Body Paragraph */}
                <RevealOnScroll delay={400}>
                  <p className="text-base sm:text-lg text-slate-300 font-sans leading-relaxed max-w-2xl">
                    Nurturing talent, character, and academic leadership since 1998 in the heart of Peshawar. Affiliated with BISE Peshawar for matriculation, blending modern STEM disciplines with moral excellence.
                  </p>
                </RevealOnScroll>

                {/* Hero Buttons */}
                <RevealOnScroll delay={550}>
                  <div className="flex flex-wrap items-center gap-4 pt-2">
                    <Link
                      href="/admissions/apply"
                      className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-bold text-white btn-blue-prestige shadow-xl shadow-blue-600/25"
                    >
                      <span>Explore Admissions 2026–27</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>

                    <button
                      onClick={() => openTour(0)}
                      className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl text-sm font-semibold text-white bg-[#0f274a]/80 hover:bg-[#163765] border border-blue-500/30 hover:border-blue-400 backdrop-blur-md transition-all shadow-lg group"
                    >
                      <div className="w-6 h-6 rounded-full bg-blue-600/30 text-blue-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Play className="w-3 h-3 fill-blue-300 ml-0.5" />
                      </div>
                      <span>Watch Campus Tour</span>
                    </button>
                  </div>
                </RevealOnScroll>

                {/* Institutional Trust Badges */}
                <RevealOnScroll delay={700}>
                  <div className="pt-6 border-t border-white/10 flex flex-wrap items-center gap-6 text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-blue-400" />
                      <span>BISE Peshawar Affiliated</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-blue-400" />
                      <span>28+ Years of Educational Legacy</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-blue-400" />
                      <span>Purpose-Built Peshawar Campus</span>
                    </div>
                  </div>
                </RevealOnScroll>

              </div>

              {/* Right Column: Floating Admissions Notice Card */}
              <div className="lg:col-span-4">
                <RevealOnScroll delay={600} animation="reveal-slide-right">
                  <div className="relative rounded-2xl p-6 sm:p-7 bg-gradient-to-b from-[#0f274a]/95 to-[#0a192f]/95 border border-blue-500/30 shadow-2xl backdrop-blur-xl space-y-5">
                    
                    {/* Floating Corner Accent */}
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-blue-600 text-white shadow-md">
                        ADMISSIONS OPEN
                      </span>
                      <span className="text-xs text-blue-300 font-semibold">
                        Session 2026–2027
                      </span>
                    </div>

                    <div className="space-y-2">
                      <h2 className="font-serif text-xl font-bold text-white leading-snug">
                        Enroll Your Child for Academic Distinction
                      </h2>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Admissions open for Playgroup, Primary, Middle, and Matriculation (Science & Humanities). Limited seats per section.
                      </p>
                    </div>

                    {/* Feature Bullets */}
                    <div className="space-y-2 text-xs text-slate-200">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                        <span>Merit Scholarships for High Achievers</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                        <span>Modern Computer & Science Labs</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                        <span>Safe GPS-Monitored School Transport</span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <Link
                        href="/admissions/apply"
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-white btn-blue-prestige shadow-md"
                      >
                        <span>Start Online Application</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-300 pt-1 border-t border-white/10">
                      <button
                        onClick={() => setProspectusModalOpen(true)}
                        className="hover:text-blue-300 transition-colors flex items-center gap-1"
                      >
                        <Download className="w-3 h-3 text-blue-400" />
                        <span>Download Prospectus</span>
                      </button>
                      <Link href="/admissions/track" className="hover:text-blue-300 transition-colors">
                        Track Application →
                      </Link>
                    </div>

                  </div>
                </RevealOnScroll>
              </div>

            </div>
          </div>
        </section>

        {/* ================================================================
            SECTION 2: FLOATING STATISTICS BAR (Overlapping Bottom of Hero)
           ================================================================ */}
        <section className="relative z-20 -mt-10 sm:-mt-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            
            {/* Stat Card 1 */}
            <RevealOnScroll delay={100}>
              <div className="academic-card bg-white rounded-2xl p-5 sm:p-6 text-center group border-t-2 border-t-blue-600">
                <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900">
                  <AnimatedCounter end={stats.totalStudents} suffix="+" />
                </h3>
                <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">
                  Students Enrolled
                </p>
                <p className="text-[11px] text-blue-600 mt-0.5 font-semibold">
                  Playgroup to Matric
                </p>
              </div>
            </RevealOnScroll>

            {/* Stat Card 2 */}
            <RevealOnScroll delay={200}>
              <div className="academic-card bg-white rounded-2xl p-5 sm:p-6 text-center group border-t-2 border-t-blue-600">
                <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900">
                  <AnimatedCounter end={stats.totalTeachers} suffix="+" />
                </h3>
                <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">
                  Qualified Teachers
                </p>
                <p className="text-[11px] text-blue-600 mt-0.5 font-semibold">
                  Subject Specialists
                </p>
              </div>
            </RevealOnScroll>

            {/* Stat Card 3 */}
            <RevealOnScroll delay={300}>
              <div className="academic-card bg-white rounded-2xl p-5 sm:p-6 text-center group border-t-2 border-t-blue-600">
                <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                  <Award className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900">
                  <AnimatedCounter end={stats.matricPassRate} suffix="%" />
                </h3>
                <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">
                  Board Exam Success
                </p>
                <p className="text-[11px] text-blue-600 mt-0.5 font-semibold">
                  BISE Peshawar Top Marks
                </p>
              </div>
            </RevealOnScroll>

            {/* Stat Card 4 */}
            <RevealOnScroll delay={400}>
              <div className="academic-card bg-white rounded-2xl p-5 sm:p-6 text-center group border-t-2 border-t-blue-600">
                <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900">
                  <AnimatedCounter end={stats.safeCampus} suffix="%" />
                </h3>
                <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">
                  Safe & Secure Campus
                </p>
                <p className="text-[11px] text-blue-600 mt-0.5 font-semibold">
                  24/7 CCTV & Guards
                </p>
              </div>
            </RevealOnScroll>

          </div>
        </section>

        {/* ================================================================
            SECTION 3: ABOUT US ("Why Choose Hayatabad Model School?")
           ================================================================ */}
        <section id="about" className="py-24 sm:py-28 bg-[#ffffff] bg-white relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              
              {/* Left Column: Prestigious Multi-Image Composition */}
              <div className="lg:col-span-6 relative">
                <RevealOnScroll animation="reveal-slide-left">
                  <div className="relative">
                    
                    {/* Main Image with Blue Border Frame */}
                    <div className="relative rounded-2xl overflow-hidden aspect-[4/3] shadow-2xl border-2 border-blue-500/30 bg-[#0a192f] group">
                      <img
                        src={IMAGES.aboutMain}
                        alt="Hayatabad Model School Classroom"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0a192f]/70 via-transparent to-transparent" />
                    </div>

                    {/* Secondary Floating Student Photo */}
                    <div className="hidden sm:block absolute -bottom-8 -right-8 w-3/5 rounded-xl overflow-hidden aspect-[4/3] shadow-2xl border-4 border-white bg-[#0a192f] group">
                      <img
                        src={IMAGES.aboutSecondary}
                        alt="Students engaging in laboratory learning"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>

                    {/* Established Badge Overlay */}
                    <div className="absolute top-4 left-4 p-3 sm:p-4 rounded-xl bg-[#0a192f]/95 text-white border border-blue-500/40 backdrop-blur-md shadow-xl flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black font-serif text-lg">
                        28
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-widest text-blue-300 block">
                          Years of Legacy
                        </span>
                        <span className="text-xs font-semibold text-slate-200">
                          Est. 1998 in Peshawar
                        </span>
                      </div>
                    </div>

                  </div>
                </RevealOnScroll>
              </div>

              {/* Right Column: Narrative & 4 Core Pillars */}
              <div className="lg:col-span-6 space-y-6">
                <RevealOnScroll>
                  <div className="space-y-3">
                    <span className="text-xs uppercase font-bold tracking-widest text-blue-600 block">
                      ABOUT OUR INSTITUTION
                    </span>
                    <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight leading-tight">
                      Why Choose Hayatabad Model School?
                    </h2>
                    <div className="w-16 h-1 bg-blue-600 rounded-full" />
                  </div>
                </RevealOnScroll>

                <RevealOnScroll delay={150}>
                  <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                    Founded in 1998, The Hayatabad Model School has stood as a beacon of academic distinction and moral leadership in Khyber Pakhtunkhwa. We prepare young minds for global challenges by seamlessly integrating rigorous BISE Peshawar board curricula, hands-on STEM education, and timeless ethical values.
                  </p>
                </RevealOnScroll>

                {/* 4 Feature Items */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  
                  {/* Feature 1 */}
                  <RevealOnScroll delay={200}>
                    <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm hover:border-blue-500 transition-colors space-y-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                        <Award className="w-4 h-4" />
                      </div>
                      <h4 className="font-serif font-bold text-slate-900 text-sm">
                        Quality Education
                      </h4>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Top BISE Peshawar board standing with conceptual mastery over rote memorization.
                      </p>
                    </div>
                  </RevealOnScroll>

                  {/* Feature 2 */}
                  <RevealOnScroll delay={300}>
                    <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm hover:border-blue-500 transition-colors space-y-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                        <Users className="w-4 h-4" />
                      </div>
                      <h4 className="font-serif font-bold text-slate-900 text-sm">
                        Experienced Faculty
                      </h4>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Qualified master-degree specialists dedicated to mentorship and personal growth.
                      </p>
                    </div>
                  </RevealOnScroll>

                  {/* Feature 3 */}
                  <RevealOnScroll delay={400}>
                    <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm hover:border-blue-500 transition-colors space-y-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <h4 className="font-serif font-bold text-slate-900 text-sm">
                        Safe Environment
                      </h4>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Fully gated, 24/7 CCTV surveillance and an atmosphere of mutual respect.
                      </p>
                    </div>
                  </RevealOnScroll>

                  {/* Feature 4 */}
                  <RevealOnScroll delay={500}>
                    <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm hover:border-blue-500 transition-colors space-y-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                        <HeartHandshake className="w-4 h-4" />
                      </div>
                      <h4 className="font-serif font-bold text-slate-900 text-sm">
                        Holistic Development
                      </h4>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Sports, robotics, public speaking, arts, and Islamic character upbringing.
                      </p>
                    </div>
                  </RevealOnScroll>

                </div>

                {/* CTA Action */}
                <RevealOnScroll delay={600}>
                  <div className="flex flex-wrap items-center gap-4 pt-3">
                    <button
                      onClick={() => setProspectusModalOpen(true)}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold text-white btn-blue-prestige shadow-md"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download School Prospectus</span>
                    </button>
                    <Link
                      href="/admissions/apply"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      <span>Apply Online for 2026–2027</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </RevealOnScroll>

              </div>

            </div>
          </div>
        </section>

        {/* ================================================================
            SECTION 4: ACADEMICS SECTION (Wings & Programs)
           ================================================================ */}
        <section id="academics" className="py-24 sm:py-28 bg-[#ffffff] bg-white border-y border-slate-200 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Section Header */}
            <div className="max-w-3xl mx-auto text-center space-y-3 mb-16">
              <RevealOnScroll>
                <span className="text-xs uppercase font-bold tracking-widest text-blue-600 block">
                  OUR ACADEMICS
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
                  Academic Excellence Across All Wings
                </h2>
                <div className="w-16 h-1 bg-blue-600 rounded-full mx-auto" />
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed mt-2">
                  Our structured educational pipeline guides children from early foundational discovery to top-tier matriculation board distinctions.
                </p>
              </RevealOnScroll>
            </div>

            {/* Academic Wings 4-Card Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Wing 1: Primary School */}
              <RevealOnScroll delay={100}>
                <div className="academic-card bg-white rounded-2xl overflow-hidden flex flex-col h-full group">
                  <div className="relative aspect-[16/10] overflow-hidden bg-[#0a192f]">
                    <img
                      src={IMAGES.primaryWing}
                      alt="Primary School"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-600 text-white shadow-md">
                        Playgroup – Class 5
                      </span>
                    </div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <h3 className="font-serif text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        Primary School
                      </h3>
                      <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                        Activity-based foundation focusing on phonics, numeracy, creative expression, curiosity, and early Islamic values.
                      </p>
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>Interactive Phonics & Reading</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>Foundational Mathematics</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </RevealOnScroll>

              {/* Wing 2: Middle School */}
              <RevealOnScroll delay={200}>
                <div className="academic-card bg-white rounded-2xl overflow-hidden flex flex-col h-full group">
                  <div className="relative aspect-[16/10] overflow-hidden bg-[#0a192f]">
                    <img
                      src={IMAGES.middleWing}
                      alt="Middle School"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-600 text-white shadow-md">
                        Class 6 – Class 8
                      </span>
                    </div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <h3 className="font-serif text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        Middle School
                      </h3>
                      <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                        Transitioning students into critical inquiry, experimental science, computer programming fundamentals, and bilingual eloquence.
                      </p>
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>Introductory Lab Sciences</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>Coding & Digital Literacy</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </RevealOnScroll>

              {/* Wing 3: Secondary School */}
              <RevealOnScroll delay={300}>
                <div className="academic-card bg-white rounded-2xl overflow-hidden flex flex-col h-full group">
                  <div className="relative aspect-[16/10] overflow-hidden bg-[#0a192f]">
                    <img
                      src={IMAGES.secondaryWing}
                      alt="Secondary School"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-600 text-white shadow-md">
                        Class 9 & Class 10
                      </span>
                    </div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <h3 className="font-serif text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        Secondary School
                      </h3>
                      <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                        Specialized science streams including Pre-Medical, Pre-Engineering, and Computer Science aligned with BISE board requirements.
                      </p>
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>Physics, Chem & Biology</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>High Speed Computer Lab</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </RevealOnScroll>

              {/* Wing 4: Matriculation & Board Prep */}
              <RevealOnScroll delay={400}>
                <div className="academic-card bg-white rounded-2xl overflow-hidden flex flex-col h-full group">
                  <div className="relative aspect-[16/10] overflow-hidden bg-[#0a192f]">
                    <img
                      src={IMAGES.matricWing}
                      alt="Matriculation Board Prep"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-600 text-white shadow-md">
                        BISE Peshawar
                      </span>
                    </div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <h3 className="font-serif text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        Matriculation Prep
                      </h3>
                      <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                        Intensive board preparation, mock test series, past paper analysis, and personalized coaching for top Peshawar distinctions.
                      </p>
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>Mock Board Examinations</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>Top Position Mentorship</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </RevealOnScroll>

            </div>
          </div>
        </section>

        {/* ================================================================
            SECTION 5: CAMPUS SECTION (Deep Academic Blue Showcase)
           ================================================================ */}
        <section id="campus" className="py-24 sm:py-28 bg-[#0a192f] text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-navy-pattern opacity-40" />
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              {/* Left Column: Campus Overview & Feature Highlights */}
              <div className="lg:col-span-5 space-y-6">
                <RevealOnScroll>
                  <div className="space-y-3">
                    <span className="text-xs uppercase font-bold tracking-widest text-blue-400 block">
                      OUR CAMPUS
                    </span>
                    <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white tracking-tight leading-tight">
                      World-Class Campus & Modern Facilities
                    </h2>
                    <div className="w-16 h-1 bg-blue-500 rounded-full" />
                  </div>
                </RevealOnScroll>

                <RevealOnScroll delay={150}>
                  <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                    Set in the serene educational hub of Hayatabad Phase 3, our purpose-built campus provides students with state-of-the-art infrastructure designed to foster academic focus, physical vitality, and scientific discovery.
                  </p>
                </RevealOnScroll>

                {/* Facilities Quick List */}
                <RevealOnScroll delay={250}>
                  <div className="space-y-3">
                    {CAMPUS_FACILITIES.slice(0, 4).map((fac, idx) => (
                      <div
                        key={fac.id}
                        onClick={() => openTour(idx)}
                        className="p-3.5 rounded-xl bg-[#0f274a]/80 border border-blue-900/50 hover:border-blue-500/50 cursor-pointer transition-all flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-600/25 text-blue-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Sparkles className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs sm:text-sm font-serif font-bold text-white group-hover:text-blue-300 transition-colors">
                              {fac.title}
                            </h4>
                            <p className="text-[11px] text-slate-300 truncate max-w-[240px]">
                              {fac.category}
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                      </div>
                    ))}
                  </div>
                </RevealOnScroll>

                <RevealOnScroll delay={350}>
                  <div className="pt-2">
                    <button
                      onClick={() => openTour(0)}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold text-white btn-blue-prestige shadow-lg shadow-blue-600/30"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Take a Virtual Campus Tour</span>
                    </button>
                  </div>
                </RevealOnScroll>

              </div>

              {/* Right Column: Interactive Image Collage */}
              <div className="lg:col-span-7">
                <RevealOnScroll delay={200} animation="reveal-slide-right">
                  <div className="grid grid-cols-2 gap-4">
                    
                    <div 
                      onClick={() => openTour(0)}
                      className="rounded-2xl overflow-hidden aspect-[4/3] relative group cursor-pointer border border-blue-900/50 hover:border-blue-500/50 transition-all shadow-xl"
                    >
                      <img src={IMAGES.scienceLab} alt="Science Lab" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0a192f]/90 via-[#0a192f]/20 to-transparent p-4 flex flex-col justify-end">
                        <span className="text-[10px] uppercase font-bold text-blue-300">STEM & Research</span>
                        <h5 className="font-serif text-sm font-bold text-white">Modern Science Labs</h5>
                      </div>
                    </div>

                    <div 
                      onClick={() => openTour(2)}
                      className="rounded-2xl overflow-hidden aspect-[4/3] relative group cursor-pointer border border-blue-900/50 hover:border-blue-500/50 transition-all shadow-xl"
                    >
                      <img src={IMAGES.computerLab} alt="Computer Lab" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0a192f]/90 via-[#0a192f]/20 to-transparent p-4 flex flex-col justify-end">
                        <span className="text-[10px] uppercase font-bold text-blue-300">Technology</span>
                        <h5 className="font-serif text-sm font-bold text-white">Computer & AI Lab</h5>
                      </div>
                    </div>

                    <div 
                      onClick={() => openTour(3)}
                      className="rounded-2xl overflow-hidden aspect-[4/3] relative group cursor-pointer border border-blue-900/50 hover:border-blue-500/50 transition-all shadow-xl"
                    >
                      <img src={IMAGES.library} alt="Library" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0a192f]/90 via-[#0a192f]/20 to-transparent p-4 flex flex-col justify-end">
                        <span className="text-[10px] uppercase font-bold text-blue-300">Knowledge Hub</span>
                        <h5 className="font-serif text-sm font-bold text-white">Academic Library</h5>
                      </div>
                    </div>

                    <div 
                      onClick={() => openTour(4)}
                      className="rounded-2xl overflow-hidden aspect-[4/3] relative group cursor-pointer border border-blue-900/50 hover:border-blue-500/50 transition-all shadow-xl"
                    >
                      <img src={IMAGES.sports} alt="Sports Ground" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0a192f]/90 via-[#0a192f]/20 to-transparent p-4 flex flex-col justify-end">
                        <span className="text-[10px] uppercase font-bold text-blue-300">Athletics</span>
                        <h5 className="font-serif text-sm font-bold text-white">Sports Complex</h5>
                      </div>
                    </div>

                  </div>
                </RevealOnScroll>
              </div>

            </div>
          </div>
        </section>

        {/* ================================================================
            SECTION 6: FACILITIES SECTION ("Everything Your Child Needs")
           ================================================================ */}
        <section className="py-24 sm:py-28 bg-[#ffffff] bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="max-w-3xl mx-auto text-center space-y-3 mb-16">
              <RevealOnScroll>
                <span className="text-xs uppercase font-bold tracking-widest text-blue-600 block">
                  INFRASTRUCTURE & ENVIRONMENT
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
                  Everything Your Child Needs to Excel
                </h2>
                <div className="w-16 h-1 bg-blue-600 rounded-full mx-auto" />
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed mt-2">
                  Comprehensive amenities ensuring physical safety, mental wellness, and intellectual enrichment.
                </p>
              </RevealOnScroll>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {CAMPUS_FACILITIES.map((fac, idx) => (
                <RevealOnScroll key={fac.id} delay={idx * 100}>
                  <div 
                    onClick={() => openTour(idx)}
                    className="academic-card bg-white rounded-2xl overflow-hidden group cursor-pointer flex flex-col h-full"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-[#0a192f]">
                      <img
                        src={fac.image}
                        alt={fac.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0a192f]/70 via-transparent to-transparent" />
                      <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#0a192f]/90 text-blue-300 border border-blue-500/30">
                        {fac.category}
                      </span>
                    </div>
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <h4 className="font-serif text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {fac.title}
                        </h4>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                          {fac.description}
                        </p>
                      </div>
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-600">
                        <span>Explore Space & Specs</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </RevealOnScroll>
              ))}
            </div>

          </div>
        </section>

        {/* ================================================================
            SECTION 7: FACULTY SECTION
           ================================================================ */}
        <section id="faculty" className="py-24 sm:py-28 bg-[#ffffff] bg-white border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="max-w-3xl mx-auto text-center space-y-3 mb-16">
              <RevealOnScroll>
                <span className="text-xs uppercase font-bold tracking-widest text-blue-600 block">
                  OUR FACULTY
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
                  Meet Our Dedicated Teachers & Leadership
                </h2>
                <div className="w-16 h-1 bg-blue-600 rounded-full mx-auto" />
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed mt-2">
                  Our distinguished academic faculty comprises experienced educators, M.Phil subject scholars, and caring mentors.
                </p>
              </RevealOnScroll>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {faculty.map((teacher, idx) => (
                <RevealOnScroll key={idx} delay={idx * 100}>
                  <div className="academic-card bg-white rounded-2xl overflow-hidden text-center group flex flex-col h-full border border-slate-200">
                    <div className="relative aspect-[4/4] overflow-hidden bg-[#0a192f]">
                      <img
                        src={teacher.image}
                        alt={teacher.name}
                        className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0a192f]/80 via-transparent to-transparent" />
                      <span className="absolute bottom-3 left-3 right-3 text-[11px] font-medium text-blue-300 truncate">
                        {teacher.qualification}
                      </span>
                    </div>
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-2">
                      <div>
                        <h4 className="font-serif text-base font-bold text-slate-900">
                          {teacher.name}
                        </h4>
                        <p className="text-xs font-semibold text-blue-600 mt-0.5">
                          {teacher.designation}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-1">
                          {teacher.department}
                        </p>
                      </div>
                      <div className="pt-2 border-t border-slate-100">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                          {teacher.experience}
                        </span>
                      </div>
                    </div>
                  </div>
                </RevealOnScroll>
              ))}
            </div>

          </div>
        </section>

        {/* ================================================================
            SECTION 8: TESTIMONIALS SECTION (Deep Academic Blue)
           ================================================================ */}
        <section id="testimonials" className="py-24 sm:py-28 bg-[#0a192f] text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-navy-pattern opacity-50" />
          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            
            <RevealOnScroll>
              <span className="text-xs uppercase font-bold tracking-widest text-blue-400 block mb-2">
                TESTIMONIALS & TRUST
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
                What Parents & Alumni Say
              </h2>
              <div className="w-16 h-1 bg-blue-500 rounded-full mx-auto mb-12" />
            </RevealOnScroll>

            {/* Testimonial Card */}
            <div className="relative rounded-2xl p-8 sm:p-12 bg-[#0f274a]/90 border border-blue-500/30 shadow-2xl backdrop-blur-xl space-y-6 min-h-[280px] flex flex-col justify-between">
              
              {/* Star Rating Indicator */}
              <div className="flex items-center justify-center gap-1 text-blue-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-blue-400" />
                ))}
              </div>

              {/* Quote Body */}
              <p className="font-serif text-lg sm:text-xl text-slate-100 italic leading-relaxed">
                "{TESTIMONIALS[currentTestimonial].quote}"
              </p>

              {/* Parent Info */}
              <div className="space-y-1">
                <h4 className="font-serif font-bold text-base text-blue-400">
                  {TESTIMONIALS[currentTestimonial].parentName}
                </h4>
                <p className="text-xs text-slate-300">
                  {TESTIMONIALS[currentTestimonial].parentRole}
                </p>
              </div>

              {/* Slider Controls */}
              <div className="flex items-center justify-between pt-4 border-t border-blue-900/60">
                <button
                  onClick={() => setCurrentTestimonial((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)}
                  className="p-2 rounded-full bg-blue-950 hover:bg-blue-600 hover:text-white text-slate-300 transition-all"
                  aria-label="Previous testimonial"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {/* Dots */}
                <div className="flex items-center gap-2">
                  {TESTIMONIALS.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentTestimonial(i)}
                      className={`h-2 rounded-full transition-all ${
                        currentTestimonial === i ? 'w-6 bg-blue-400' : 'w-2 bg-slate-600'
                      }`}
                      aria-label={`Slide ${i + 1}`}
                    />
                  ))}
                </div>

                <button
                  onClick={() => setCurrentTestimonial((prev) => (prev + 1) % TESTIMONIALS.length)}
                  className="p-2 rounded-full bg-blue-950 hover:bg-blue-600 hover:text-white text-slate-300 transition-all"
                  aria-label="Next testimonial"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

            </div>

          </div>
        </section>

        {/* ================================================================
            SECTION 9: NEWS & EVENTS SECTION
           ================================================================ */}
        <section id="news" className="py-24 sm:py-28 bg-[#ffffff] bg-white border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
              <RevealOnScroll>
                <div className="space-y-3">
                  <span className="text-xs uppercase font-bold tracking-widest text-blue-600 block">
                    NEWS & EVENTS
                  </span>
                  <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
                    Latest News & Campus Events
                  </h2>
                  <div className="w-16 h-1 bg-blue-600 rounded-full" />
                </div>
              </RevealOnScroll>
              <RevealOnScroll delay={150}>
                <Link
                  href="/admissions/apply"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <span>View All Academic Notices</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </RevealOnScroll>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {announcements.map((item, idx) => (
                <RevealOnScroll key={item.id || idx} delay={idx * 100}>
                  <div 
                    onClick={() => setSelectedNotice(item)}
                    className="academic-card bg-white rounded-2xl overflow-hidden group cursor-pointer flex flex-col h-full"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-[#0a192f]">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-600 text-white shadow-md">
                          {item.category}
                        </span>
                      </div>
                      <div className="absolute bottom-3 right-3 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-[#0a192f]/80 text-slate-200 backdrop-blur-sm">
                        {item.date}
                      </div>
                    </div>
                    <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <h3 className="font-serif text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                          {item.title}
                        </h3>
                        <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                          {item.excerpt}
                        </p>
                      </div>
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600 group-hover:text-blue-700">
                        <span>Read Full Announcement</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </RevealOnScroll>
              ))}
            </div>

          </div>
        </section>

        {/* ================================================================
            SECTION 10: HIGH-CONVERSION ADMISSIONS CALL TO ACTION
           ================================================================ */}
        <section id="admissions" className="relative py-24 sm:py-28 bg-[#0a192f] text-white overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img
              src={IMAGES.ctaBg}
              alt="Hayatabad Model School Students"
              className="w-full h-full object-cover filter brightness-40"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a192f] via-[#0a192f]/90 to-[#0a192f]/80" />
            <div className="absolute inset-0 bg-crest-watermark opacity-25" />
          </div>

          <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
            
            <RevealOnScroll>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-600/25 border border-blue-500/40 backdrop-blur-md mb-2">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-[11px] uppercase font-bold tracking-widest text-blue-300">
                  Begin Your Child's Journey of Excellence
                </span>
              </div>

              <h2 className="font-serif text-3xl sm:text-5xl font-bold text-white tracking-tight leading-tight">
                Secure Your Child’s Seat for Academic Year 2026–2027
              </h2>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto mt-4">
                Admissions are now open for Playgroup through Class 10 (BISE Peshawar). Give your child the advantage of premier education, ethical character building, and modern STEM facilities.
              </p>
            </RevealOnScroll>

            {/* Action Buttons */}
            <RevealOnScroll delay={200}>
              <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                <Link
                  href="/admissions/apply"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-sm font-bold text-white btn-blue-prestige shadow-2xl shadow-blue-600/30"
                >
                  <span>Apply for Admission Online</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <button
                  onClick={() => setProspectusModalOpen(true)}
                  className="inline-flex items-center gap-2 px-7 py-4 rounded-xl text-sm font-semibold text-white bg-[#0f274a]/90 hover:bg-[#163765] border border-blue-500/40 backdrop-blur-md transition-all shadow-lg"
                >
                  <Download className="w-4 h-4 text-blue-400" />
                  <span>Download Prospectus</span>
                </button>
              </div>
            </RevealOnScroll>

            {/* Helpline Info */}
            <RevealOnScroll delay={300}>
              <div className="pt-6 border-t border-white/10 flex flex-wrap items-center justify-center gap-8 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <PhoneCall className="w-4 h-4 text-blue-400" />
                  <span>Admissions Desk: +92 91 5828850</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-blue-400" />
                  <span>admissions@hayatabadmodel.edu.pk</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-400" />
                  <span>Phase 3, Hayatabad, Peshawar</span>
                </div>
              </div>
            </RevealOnScroll>

          </div>
        </section>

      </main>

      {/* ================================================================
          SECTION 11: GRAND ACADEMIC FOOTER
         ================================================================ */}
      <footer id="contact" className="bg-[#0a192f] text-slate-300 border-t border-blue-900/40 pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
            
            {/* Column 1: School Bio & Crest (4 cols) */}
            <div className="lg:col-span-4 space-y-4">
              <div className="flex items-center gap-3">
                <img src="/logo.png" alt="Hayatabad Model School Crest" className="h-14 w-auto filter drop-shadow-md" />
                <div>
                  <span className="font-serif font-bold text-white text-base tracking-tight block">
                    THE HAYATABAD MODEL SCHOOL
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-blue-400 block">
                    Peshawar • Established 1998
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                A prestigious academic institution providing premier education from Playgroup through Matriculation (BISE Peshawar). Committed to developing intellect, character, and progressive leadership.
              </p>
              <div className="pt-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-semibold bg-blue-950 border border-blue-800 text-blue-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                  BISE Peshawar Registered & Affiliated
                </span>
              </div>
            </div>

            {/* Column 2: Quick Links (2 cols) */}
            <div className="lg:col-span-2 space-y-3">
              <h4 className="font-serif text-sm font-bold text-white tracking-wider uppercase border-b border-blue-900/60 pb-2">
                Quick Navigation
              </h4>
              <ul className="space-y-2 text-xs">
                <li><Link href="/" className="hover:text-blue-400 transition-colors">Home Page</Link></li>
                <li><Link href="/#about" className="hover:text-blue-400 transition-colors">About Our Legacy</Link></li>
                <li><Link href="/#academics" className="hover:text-blue-400 transition-colors">Academic Programs</Link></li>
                <li><Link href="/#campus" className="hover:text-blue-400 transition-colors">Campus & Labs</Link></li>
                <li><Link href="/#faculty" className="hover:text-blue-400 transition-colors">Faculty & Staff</Link></li>
                <li><Link href="/#news" className="hover:text-blue-400 transition-colors">News & Events</Link></li>
              </ul>
            </div>

            {/* Column 3: Academic Programs (2 cols) */}
            <div className="lg:col-span-2 space-y-3">
              <h4 className="font-serif text-sm font-bold text-white tracking-wider uppercase border-b border-blue-900/60 pb-2">
                Academic Wings
              </h4>
              <ul className="space-y-2 text-xs">
                <li><span className="text-slate-400">Early Years (Playgroup – Prep)</span></li>
                <li><span className="text-slate-400">Primary Wing (Class 1 – 5)</span></li>
                <li><span className="text-slate-400">Middle Wing (Class 6 – 8)</span></li>
                <li><span className="text-slate-400">SSC Pre-Medical (9th & 10th)</span></li>
                <li><span className="text-slate-400">SSC Pre-Engineering</span></li>
                <li><span className="text-slate-400">Computer Science Stream</span></li>
              </ul>
            </div>

            {/* Column 4: Portals & Contact Info (4 cols) */}
            <div className="lg:col-span-4 space-y-4">
              <h4 className="font-serif text-sm font-bold text-white tracking-wider uppercase border-b border-blue-900/60 pb-2">
                Campus Location & Contact
              </h4>
              <div className="space-y-2.5 text-xs text-slate-300">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <span>Phase 3, Hayatabad, Peshawar, Khyber Pakhtunkhwa, Pakistan</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <PhoneCall className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>+92 91 5828850 / +92 333 9123456</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>info@hayatabadmodel.edu.pk</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>Mon – Sat: 8:00 AM – 2:00 PM</span>
                </div>
              </div>

              {/* Newsletter Subscription */}
              <div className="pt-2">
                <p className="text-[11px] font-semibold text-slate-300 mb-2">
                  Subscribe to School Newsletter & Circulars
                </p>
                {newsletterSubscribed ? (
                  <div className="p-2.5 rounded-lg bg-blue-600/20 text-blue-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Thank you for subscribing!</span>
                  </div>
                ) : (
                  <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                    <input
                      type="email"
                      required
                      placeholder="Enter parent email address"
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg bg-[#0f274a] border border-blue-900 text-white text-xs focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-lg text-xs font-bold text-white btn-blue-prestige shrink-0 shadow-md"
                    >
                      Subscribe
                    </button>
                  </form>
                )}
              </div>
            </div>

          </div>

          {/* Bottom Bar: Copyright & Accreditation */}
          <div className="pt-8 border-t border-blue-900/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <p>
              © {new Date().getFullYear()} The Hayatabad Model School, Peshawar. All Rights Reserved.
            </p>
            <div className="flex items-center gap-6">
              <button onClick={() => setProspectusModalOpen(true)} className="hover:text-blue-400 transition-colors">
                Prospectus PDF
              </button>
              <Link href="/admissions/track" className="hover:text-blue-400 transition-colors">
                Track Application
              </Link>
              <Link href="/login" className="hover:text-blue-400 transition-colors">
                Staff Portal
              </Link>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex items-center gap-1 hover:text-blue-400 transition-colors ml-2"
              >
                <span>Back to Top</span>
                <ChevronUp className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

        </div>
      </footer>

      {/* Interactive Modals */}
      <CampusTourModal
        isOpen={tourModalOpen}
        onClose={() => setTourModalOpen(false)}
        initialSlide={tourInitialSlide}
      />

      <NoticeModal
        isOpen={!!selectedNotice}
        onClose={() => setSelectedNotice(null)}
        notice={selectedNotice}
      />

      <ProspectusModal
        isOpen={prospectusModalOpen}
        onClose={() => setProspectusModalOpen(false)}
      />

    </div>
  );
}
