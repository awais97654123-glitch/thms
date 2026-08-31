'use client';

import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, MapPin, Sparkles, CheckCircle2, Video } from 'lucide-react';

interface CampusTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSlide?: number;
}

export const CAMPUS_FACILITIES = [
  {
    id: 'classrooms',
    title: 'Smart Multimedia Classrooms',
    category: 'Academic Spaces',
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1600&q=85',
    description:
      'Spacious, climate-controlled classrooms equipped with interactive smart boards, ergonomic wooden desks, and optimal natural lighting designed for collaborative and focused learning.',
    features: ['Interactive Smart Boards', 'Air-Conditioned & Well-Ventilated', 'Ergonomic Seating', 'CCTV Monitored'],
  },
  {
    id: 'science-labs',
    title: 'Modern Science Laboratories',
    category: 'STEM & Research',
    image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1600&q=85',
    description:
      'Separate, fully equipped laboratories for Physics, Chemistry, and Biology aligned with BISE Peshawar Matriculation practical curriculum standards and safety protocols.',
    features: ['Precision Optical & Electrical Instruments', 'Chemical Fume Hoods & Safety Kits', 'Individual Workstations', 'Experienced Lab Demonstrators'],
  },
  {
    id: 'computer-lab',
    title: 'Advanced Computer & AI Lab',
    category: 'Technology',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1600&q=85',
    description:
      'Cutting-edge computer systems equipped with high-speed fiber internet, coding platforms (Python, Scratch, Web Development), and AI exploration tools.',
    features: ['High-Performance Core i7 PCs', 'Dedicated Fiber Optic Internet', 'Robotics & STEM Kits', 'Smart Screen Broadcast System'],
  },
  {
    id: 'library',
    title: 'Central Academic Library',
    category: 'Knowledge Hub',
    image: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1600&q=85',
    description:
      'A serene repository of over 8,000 titles including academic reference texts, classical literature, Islamic studies, encyclopedia collections, and quiet study carrels.',
    features: ['8,000+ Curated Books', 'Digital E-Library Access', 'Silent Study Cubicles', 'Periodicals & Science Journals'],
  },
  {
    id: 'sports',
    title: 'Sports Grounds & Physical Arena',
    category: 'Athletics & Health',
    image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1600&q=85',
    description:
      'Lush green cricket and football grounds, basketball court, badminton arenas, and indoor table tennis facilities supervised by professional physical education instructors.',
    features: ['Full-Size Cricket Turf', 'Basketball & Badminton Courts', 'Indoor Table Tennis & Chess', 'Annual Sports Olympiad Grounds'],
  },
  {
    id: 'transport',
    title: 'Safe Dedicated Transport Fleet',
    category: 'Student Logistics',
    image: 'https://images.unsplash.com/photo-1557223562-6c77ef16210f?auto=format&fit=crop&w=1600&q=85',
    description:
      'A modern fleet of GPS-tracked, air-conditioned buses and vans with trained drivers and bus attendants providing safe commute across Hayatabad and greater Peshawar.',
    features: ['Live GPS Tracking for Parents', 'Trained Drivers & Attendants', 'Covering All Hayatabad Sectors', 'Emergency First-Aid on Board'],
  },
];

export default function CampusTourModal({ isOpen, onClose, initialSlide = 0 }: CampusTourModalProps) {
  const [currentIdx, setCurrentIdx] = useState(initialSlide);

  if (!isOpen) return null;

  const current = CAMPUS_FACILITIES[currentIdx];

  const handleNext = () => {
    setCurrentIdx((prev) => (prev + 1) % CAMPUS_FACILITIES.length);
  };

  const handlePrev = () => {
    setCurrentIdx((prev) => (prev - 1 + CAMPUS_FACILITIES.length) % CAMPUS_FACILITIES.length);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-navy-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-5xl bg-navy-900 border border-gold-500/30 rounded-2xl shadow-2xl overflow-hidden text-white flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-navy-800 bg-navy-950/90">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gold-500/20 border border-gold-500/40 flex items-center justify-center text-gold-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-lg text-white font-bold tracking-tight">
                Virtual Campus Tour & Facilities
              </h3>
              <p className="text-xs text-slate-400 font-sans">
                The Hayatabad Model School, Phase 3, Peshawar
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-navy-800 transition-all"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          {/* Main Visual Carousel */}
          <div className="relative rounded-xl overflow-hidden aspect-[16/9] sm:aspect-[21/9] bg-navy-950 border border-navy-800 shadow-inner group">
            <img
              src={current.image}
              alt={current.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/40 to-transparent" />

            {/* Top Badge */}
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-gold-500 text-navy-950 shadow-md">
                {current.category}
              </span>
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-navy-900/80 hover:bg-gold-500 hover:text-navy-950 text-white border border-white/20 flex items-center justify-center transition-all backdrop-blur-sm shadow-lg"
              aria-label="Previous facility"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-navy-900/80 hover:bg-gold-500 hover:text-navy-950 text-white border border-white/20 flex items-center justify-center transition-all backdrop-blur-sm shadow-lg"
              aria-label="Next facility"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Slide Indicator Overlay */}
            <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
              <div>
                <p className="text-gold-400 text-xs font-bold uppercase tracking-widest mb-1">
                  Facility {currentIdx + 1} of {CAMPUS_FACILITIES.length}
                </p>
                <h4 className="font-serif text-xl sm:text-2xl font-bold text-white">
                  {current.title}
                </h4>
              </div>
            </div>
          </div>

          {/* Facility Details & Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-navy-950/60 p-5 rounded-xl border border-navy-800">
            <div className="md:col-span-2 space-y-3">
              <h5 className="text-sm font-bold uppercase tracking-wider text-gold-400">
                Facility Overview
              </h5>
              <p className="text-slate-300 text-sm leading-relaxed font-sans">
                {current.description}
              </p>
            </div>
            <div>
              <h5 className="text-sm font-bold uppercase tracking-wider text-gold-400 mb-3">
                Key Highlights
              </h5>
              <ul className="space-y-2">
                {current.features.map((feat, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-slate-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-gold-400 shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Thumbnail Selector */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-2">
            {CAMPUS_FACILITIES.map((fac, idx) => (
              <button
                key={fac.id}
                onClick={() => setCurrentIdx(idx)}
                className={`relative rounded-lg overflow-hidden aspect-[4/3] border transition-all text-left group ${
                  currentIdx === idx
                    ? 'border-gold-500 ring-2 ring-gold-500/40 opacity-100 scale-105'
                    : 'border-navy-800 opacity-60 hover:opacity-100'
                }`}
              >
                <img src={fac.image} alt={fac.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-navy-950/50 flex items-end p-1.5">
                  <span className="text-[10px] font-bold text-white leading-tight truncate">
                    {fac.title}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-navy-800 bg-navy-950 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <MapPin className="w-3.5 h-3.5 text-gold-400" />
            <span>On-site physical visits welcome Monday–Saturday, 8:00 AM – 2:00 PM</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-navy-800 hover:bg-navy-700 transition-all"
            >
              Close Tour
            </button>
            <a
              href="/admissions/apply"
              className="px-5 py-2 rounded-lg text-xs font-bold text-navy-950 btn-gold-prestige"
            >
              Apply for Admission →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
