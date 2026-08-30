'use client';

import React from 'react';

interface AdminChipLoaderProps {
  message?: string;
  subMessage?: string;
  isFullScreen?: boolean;
}

export default function AdminChipLoader({
  message = 'Processing AI Database Transaction...',
  subMessage = 'Synchronizing with Neon PostgreSQL Cluster',
  isFullScreen = false,
}: AdminChipLoaderProps) {
  const content = (
    <div className="flex flex-col items-center justify-center p-6 space-y-4 max-w-md mx-auto text-center">
      {/* SVG Chip Trace Loader */}
      <div className="w-64 sm:w-80 max-w-full drop-shadow-[0_0_20px_rgba(249,115,22,0.25)]">
        <svg viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
          <defs>
            <linearGradient id="chipGradient" x1={0} y1={0} x2={0} y2={1}>
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
            <linearGradient id="textGradient" x1={0} y1={0} x2={0} y2={1}>
              <stop offset="0%" stopColor="#ffedd5" />
              <stop offset="100%" stopColor="#f97316" />
            </linearGradient>
            <linearGradient id="pinGradient" x1={1} y1={0} x2={0} y2={0}>
              <stop offset="0%" stopColor="#fdba74" />
              <stop offset="50%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#ea580c" />
            </linearGradient>
          </defs>

          {/* Circuit Traces */}
          <g id="traces">
            <path d="M100 100 H200 V210 H326" className="stroke-slate-800 stroke-[2] fill-none" />
            <path 
              d="M100 100 H200 V210 H326" 
              className="stroke-orange-500 stroke-[2.5] fill-none stroke-dasharray-[40_400] animate-flow drop-shadow-[0_0_6px_#f97316]" 
            />
            <path d="M80 180 H180 V230 H326" className="stroke-slate-800 stroke-[2] fill-none" />
            <path 
              d="M80 180 H180 V230 H326" 
              className="stroke-amber-400 stroke-[2.5] fill-none stroke-dasharray-[40_400] animate-flow drop-shadow-[0_0_6px_#fbbf24]" 
            />
            <path d="M60 260 H150 V250 H326" className="stroke-slate-800 stroke-[2] fill-none" />
            <path 
              d="M60 260 H150 V250 H326" 
              className="stroke-orange-400 stroke-[2.5] fill-none stroke-dasharray-[40_400] animate-flow drop-shadow-[0_0_6px_#f97316]" 
            />
            <path d="M100 350 H200 V270 H326" className="stroke-slate-800 stroke-[2] fill-none" />
            <path 
              d="M100 350 H200 V270 H326" 
              className="stroke-amber-500 stroke-[2.5] fill-none stroke-dasharray-[40_400] animate-flow drop-shadow-[0_0_6px_#f59e0b]" 
            />

            <path d="M700 90 H560 V210 H474" className="stroke-slate-800 stroke-[2] fill-none" />
            <path 
              d="M700 90 H560 V210 H474" 
              className="stroke-orange-500 stroke-[2.5] fill-none stroke-dasharray-[40_400] animate-flow drop-shadow-[0_0_6px_#f97316]" 
            />
            <path d="M740 160 H580 V230 H474" className="stroke-slate-800 stroke-[2] fill-none" />
            <path 
              d="M740 160 H580 V230 H474" 
              className="stroke-amber-400 stroke-[2.5] fill-none stroke-dasharray-[40_400] animate-flow drop-shadow-[0_0_6px_#fbbf24]" 
            />
            <path d="M720 250 H590 V250 H474" className="stroke-slate-800 stroke-[2] fill-none" />
            <path 
              d="M720 250 H590 V250 H474" 
              className="stroke-orange-400 stroke-[2.5] fill-none stroke-dasharray-[40_400] animate-flow drop-shadow-[0_0_6px_#f97316]" 
            />
            <path d="M680 340 H570 V270 H474" className="stroke-slate-800 stroke-[2] fill-none" />
            <path 
              d="M680 340 H570 V270 H474" 
              className="stroke-amber-500 stroke-[2.5] fill-none stroke-dasharray-[40_400] animate-flow drop-shadow-[0_0_6px_#f59e0b]" 
            />
          </g>

          {/* Central AI Processor Chip */}
          <rect 
            x={330} 
            y={190} 
            width={140} 
            height={100} 
            rx={20} 
            ry={20} 
            fill="url(#chipGradient)" 
            stroke="#f97316" 
            strokeWidth={2.5} 
            className="filter drop-shadow-[0_0_12px_rgba(249,115,22,0.4)]"
          />

          {/* Left Pins */}
          <g>
            <rect x={322} y={205} width={8} height={10} fill="url(#pinGradient)" rx={2} />
            <rect x={322} y={225} width={8} height={10} fill="url(#pinGradient)" rx={2} />
            <rect x={322} y={245} width={8} height={10} fill="url(#pinGradient)" rx={2} />
            <rect x={322} y={265} width={8} height={10} fill="url(#pinGradient)" rx={2} />
          </g>

          {/* Right Pins */}
          <g>
            <rect x={470} y={205} width={8} height={10} fill="url(#pinGradient)" rx={2} />
            <rect x={470} y={225} width={8} height={10} fill="url(#pinGradient)" rx={2} />
            <rect x={470} y={245} width={8} height={10} fill="url(#pinGradient)" rx={2} />
            <rect x={470} y={265} width={8} height={10} fill="url(#pinGradient)" rx={2} />
          </g>

          {/* Chip Center Text */}
          <text 
            x={400} 
            y={242} 
            fontFamily="Arial, sans-serif" 
            fontSize={20} 
            fontWeight="bold"
            fill="url(#textGradient)" 
            textAnchor="middle" 
            alignmentBaseline="middle"
            letterSpacing="1.5"
          >
            THMS AI
          </text>

          {/* Circuit Terminals */}
          <circle cx={100} cy={100} r={5} fill="#f97316" />
          <circle cx={80} cy={180} r={5} fill="#fbbf24" />
          <circle cx={60} cy={260} r={5} fill="#f97316" />
          <circle cx={100} cy={350} r={5} fill="#f59e0b" />
          <circle cx={700} cy={90} r={5} fill="#f97316" />
          <circle cx={740} cy={160} r={5} fill="#fbbf24" />
          <circle cx={720} cy={250} r={5} fill="#f97316" />
          <circle cx={680} cy={340} r={5} fill="#f59e0b" />
        </svg>
      </div>

      <div className="space-y-1">
        <h4 className="text-sm font-black text-slate-900 tracking-tight">
          {message}
        </h4>
        <p className="text-[11px] text-slate-500 font-medium font-mono">
          {subMessage}
        </p>
      </div>
    </div>
  );

  if (isFullScreen) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
        <div className="bg-white rounded-3xl border border-white shadow-2xl p-6">
          {content}
        </div>
      </div>
    );
  }

  return content;
}
