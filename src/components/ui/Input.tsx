'use client';

import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-bold text-[#0F172A] tracking-wide">
            {label} {props.required && <span className="text-[#DC2626]">*</span>}
          </label>
        )}
        <div className="relative rounded-xl">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#64748B]">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={`w-full bg-white text-[#0F172A] placeholder-[#94A3B8] text-sm rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 ${
              leftIcon ? 'pl-10' : 'pl-3.5'
            } pr-3.5 py-2.5 ${
              error
                ? 'border-[#DC2626] focus:border-[#DC2626] focus:ring-[#FEF2F2]'
                : 'border-[#E2E8F0] hover:border-[#CBD5E1] focus:border-[#2563EB] focus:ring-[#EFF6FF]'
            } disabled:bg-[#F8FAFC] disabled:text-[#94A3B8] disabled:cursor-not-allowed ${className}`}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-[#DC2626] font-medium">{error}</p>}
        {helperText && !error && <p className="text-xs text-[#64748B]">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, children, className = '', id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label htmlFor={selectId} className="block text-xs font-bold text-[#0F172A] tracking-wide">
            {label} {props.required && <span className="text-[#DC2626]">*</span>}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          className={`w-full bg-white text-[#0F172A] text-sm rounded-xl border transition-all duration-200 px-3.5 py-2.5 focus:outline-none focus:ring-2 ${
            error
              ? 'border-[#DC2626] focus:border-[#DC2626] focus:ring-[#FEF2F2]'
              : 'border-[#E2E8F0] hover:border-[#CBD5E1] focus:border-[#2563EB] focus:ring-[#EFF6FF]'
          } disabled:bg-[#F8FAFC] disabled:cursor-not-allowed ${className}`}
          {...props}
        >
          {children}
        </select>
        {error && <p className="text-xs text-[#DC2626] font-medium">{error}</p>}
        {helperText && !error && <p className="text-xs text-[#64748B]">{helperText}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Input;
