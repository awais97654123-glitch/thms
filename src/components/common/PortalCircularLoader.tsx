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
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
  };

  const content = (
    <div className="flex flex-col items-center justify-center p-6 space-y-4 text-center">
      {/* Animated Glowing Orange Circular Ring */}
      <div className="relative flex items-center justify-center">
        {/* Outer Pulsing Glow */}
        <div className={`absolute rounded-full bg-orange-500/20 blur-xl animate-pulse ${sizeClasses[size]}`}></div>
        
        {/* Outer Rotating Gradient Ring */}
        <div className={`rounded-full border-4 border-orange-100 border-t-orange-500 border-r-amber-500 animate-spin drop-shadow-[0_0_8px_rgba(249,115,22,0.5)] ${sizeClasses[size]}`}></div>
        
        {/* Inner Glowing Center */}
        <div className="absolute w-3 h-3 rounded-full bg-gradient-to-tr from-orange-600 to-amber-400 animate-ping"></div>
      </div>

      <div className="space-y-1">
        <p className="text-xs sm:text-sm font-black text-slate-800 tracking-tight">
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
      <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
        <div className="bg-white/95 rounded-3xl border border-orange-200/80 shadow-2xl p-6 backdrop-blur-xl">
          {content}
        </div>
      </div>
    );
  }

  return content;
}
