'use client';

import React from 'react';

interface PortalCircularLoaderProps {
  message?: string;
  subMessage?: string;
  size?: 'sm' | 'md' | 'lg';
  isFullScreen?: boolean;
}

export default function PortalCircularLoader({
  message = 'Loading Academic Records...',
  subMessage = 'Fetching verified session data from server',
  size = 'md',
  isFullScreen = false,
}: PortalCircularLoaderProps) {
  const content = (
    <div className="flex flex-col items-center justify-center p-6 space-y-4 text-center">
      {/* Progressive Rotating Arc with Central THMS Mark (Royal Blue Prestige) */}
      <div className="relative flex items-center justify-center w-24 h-24">
        {/* Outer Glow */}
        <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-xl animate-pulse"></div>
        
        {/* Progressive Rotating Arc Ring */}
        <div className="w-24 h-24 rounded-full border-4 border-blue-100/70 border-t-blue-600 border-r-cyan-500 animate-spin drop-shadow-[0_0_14px_rgba(37,99,235,0.45)]"></div>
        
        {/* Center THMS Mark */}
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <img 
            src="/logo.png" 
            alt="THMS" 
            className="w-12 h-12 object-contain drop-shadow-[0_2px_8px_rgba(37,99,235,0.35)] animate-pulse" 
          />
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-sm font-black text-slate-900 tracking-tight">
          {message}
        </p>
        {subMessage && (
          <p className="text-[11px] text-slate-500 font-medium font-mono">
            {subMessage}
          </p>
        )}
      </div>
    </div>
  );

  if (isFullScreen) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
        <div className="bg-white/95 rounded-3xl border border-white/80 shadow-2xl p-6 backdrop-blur-2xl">
          {content}
        </div>
      </div>
    );
  }

  return content;
}
