'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none select-none active:scale-[0.98]';

    const variants: Record<string, string> = {
      primary:
        'bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-sm hover:shadow focus:ring-[#2563EB] border border-transparent',
      secondary:
        'bg-white hover:bg-[#F8FAFC] text-[#0F172A] border border-[#E2E8F0] shadow-sm hover:border-[#CBD5E1] focus:ring-[#2563EB]',
      outline:
        'bg-transparent hover:bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE] focus:ring-[#2563EB]',
      ghost:
        'bg-transparent hover:bg-[#F1F5F9] text-[#475569] hover:text-[#0F172A] border border-transparent focus:ring-[#2563EB]',
      danger:
        'bg-[#DC2626] hover:bg-[#B91C1C] text-white shadow-sm hover:shadow focus:ring-[#DC2626] border border-transparent',
      success:
        'bg-[#16A34A] hover:bg-[#15803D] text-white shadow-sm hover:shadow focus:ring-[#16A34A] border border-transparent',
    };

    const sizes: Record<string, string> = {
      xs: 'px-2.5 py-1 text-xs gap-1.5 rounded-lg',
      sm: 'px-3 py-1.5 text-xs gap-1.5 rounded-lg',
      md: 'px-4 py-2 text-sm gap-2 rounded-xl',
      lg: 'px-5 py-2.5 text-base gap-2.5 rounded-xl',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-current shrink-0" />
            <span>{children}</span>
          </>
        ) : (
          <>
            {leftIcon && <span className="shrink-0">{leftIcon}</span>}
            <span>{children}</span>
            {rightIcon && <span className="shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
