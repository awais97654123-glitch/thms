'use client';

import React from 'react';
import Card from './Card';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  className = '',
}) => {
  return (
    <Card hoverEffect className={`flex flex-col justify-between ${className}`}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-bold text-[#475569] uppercase tracking-wider">
          {title}
        </span>
        <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] text-[#2563EB] flex items-center justify-center shrink-0">
          {icon}
        </div>
      </div>

      <div className="mt-4">
        <p className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">
          {value}
        </p>
        {(subtitle || trend) && (
          <div className="flex items-center gap-2 mt-1.5 text-xs">
            {trend && (
              <span
                className={`font-bold inline-flex items-center ${
                  trend.isPositive ? 'text-[#16A34A]' : 'text-[#DC2626]'
                }`}
              >
                {trend.isPositive ? '↑' : '↓'} {trend.value}
              </span>
            )}
            {subtitle && <span className="text-[#64748B]">{subtitle}</span>}
          </div>
        )}
      </div>
    </Card>
  );
};

export default StatCard;
