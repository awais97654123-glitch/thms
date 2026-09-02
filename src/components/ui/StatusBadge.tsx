'use client';

import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  XCircle, 
  UserCheck, 
  Building2, 
  Info 
} from 'lucide-react';

export type StatusType =
  | 'ACTIVE'
  | 'UPCOMING'
  | 'COMPLETED'
  | 'FREE_PERIOD'
  | 'CANCELLED'
  | 'SUBSTITUTE'
  | 'SCHOOL_CLOSED'
  | 'SUCCESS'
  | 'WARNING'
  | 'DANGER'
  | 'INFO';

export interface StatusBadgeProps {
  status: StatusType | string;
  label?: string;
  size?: 'sm' | 'md';
  pulse?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  size = 'md',
  pulse = false,
  className = '',
}) => {
  const norm = (status || '').toUpperCase();

  const configs: Record<
    string,
    { bg: string; text: string; border: string; dot: string; icon: React.ReactNode; defaultLabel: string }
  > = {
    ACTIVE: {
      bg: 'bg-[#F0FDF4]',
      text: 'text-[#16A34A]',
      border: 'border-[#BBF7D0]',
      dot: 'bg-[#16A34A]',
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
      defaultLabel: 'ACTIVE NOW',
    },
    UPCOMING: {
      bg: 'bg-[#EFF6FF]',
      text: 'text-[#2563EB]',
      border: 'border-[#BFDBFE]',
      dot: 'bg-[#2563EB]',
      icon: <Clock className="w-3.5 h-3.5" />,
      defaultLabel: 'UPCOMING',
    },
    COMPLETED: {
      bg: 'bg-[#F8FAFC]',
      text: 'text-[#64748B]',
      border: 'border-[#E2E8F0]',
      dot: 'bg-[#94A3B8]',
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
      defaultLabel: 'COMPLETED',
    },
    FREE_PERIOD: {
      bg: 'bg-[#F1F5F9]',
      text: 'text-[#475569]',
      border: 'border-[#CBD5E1]',
      dot: 'bg-[#64748B]',
      icon: <Clock className="w-3.5 h-3.5" />,
      defaultLabel: 'FREE PERIOD',
    },
    CANCELLED: {
      bg: 'bg-[#FEF2F2]',
      text: 'text-[#DC2626]',
      border: 'border-[#FECACA]',
      dot: 'bg-[#DC2626]',
      icon: <XCircle className="w-3.5 h-3.5" />,
      defaultLabel: 'CANCELLED',
    },
    SUBSTITUTE: {
      bg: 'bg-[#FFFBEB]',
      text: 'text-[#B45309]',
      border: 'border-[#FDE68A]',
      dot: 'bg-[#F59E0B]',
      icon: <UserCheck className="w-3.5 h-3.5" />,
      defaultLabel: 'SUBSTITUTE',
    },
    SCHOOL_CLOSED: {
      bg: 'bg-[#FEF2F2]',
      text: 'text-[#DC2626]',
      border: 'border-[#FCA5A5]',
      dot: 'bg-[#DC2626]',
      icon: <Building2 className="w-3.5 h-3.5" />,
      defaultLabel: 'CAMPUS CLOSED',
    },
    SUCCESS: {
      bg: 'bg-[#F0FDF4]',
      text: 'text-[#16A34A]',
      border: 'border-[#BBF7D0]',
      dot: 'bg-[#16A34A]',
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
      defaultLabel: 'SUCCESS',
    },
    WARNING: {
      bg: 'bg-[#FFFBEB]',
      text: 'text-[#B45309]',
      border: 'border-[#FDE68A]',
      dot: 'bg-[#F59E0B]',
      icon: <AlertCircle className="w-3.5 h-3.5" />,
      defaultLabel: 'WARNING',
    },
    DANGER: {
      bg: 'bg-[#FEF2F2]',
      text: 'text-[#DC2626]',
      border: 'border-[#FECACA]',
      dot: 'bg-[#DC2626]',
      icon: <XCircle className="w-3.5 h-3.5" />,
      defaultLabel: 'DANGER',
    },
    INFO: {
      bg: 'bg-[#F0F9FF]',
      text: 'text-[#0284C7]',
      border: 'border-[#BAE6FD]',
      dot: 'bg-[#0284C7]',
      icon: <Info className="w-3.5 h-3.5" />,
      defaultLabel: 'INFO',
    },
  };

  const cfg = configs[norm] || configs.INFO;
  const displayLabel = label || cfg.defaultLabel;

  const sizeClasses =
    size === 'sm' ? 'px-2 py-0.5 text-[11px] gap-1.5' : 'px-2.5 py-1 text-xs gap-1.5';

  return (
    <span
      className={`inline-flex items-center font-bold rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border} ${sizeClasses} ${className}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${
          pulse || norm === 'ACTIVE' ? 'animate-pulse shadow-sm' : ''
        }`}
      />
      <span>{displayLabel}</span>
    </span>
  );
};

export default StatusBadge;
