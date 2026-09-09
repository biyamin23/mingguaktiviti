'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'gold';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.98]';

    const variants = {
      primary: 'bg-[#1646A0] hover:bg-[#0B2F6B] text-white shadow-sm hover:shadow focus:ring-[#2563EB]',
      secondary: 'bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#172033] focus:ring-[#64748B]',
      outline: 'border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#172033] focus:ring-[#2563EB]',
      danger: 'bg-[#DC2626] hover:bg-[#B91C1C] text-white focus:ring-[#DC2626]',
      ghost: 'hover:bg-[#F1F5F9] text-[#64748B] hover:text-[#172033] focus:ring-[#64748B]',
      gold: 'bg-[#FBBF24] hover:bg-[#F59E0B] text-[#172033] font-semibold shadow-sm focus:ring-[#FBBF24]',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs gap-1.5',
      md: 'px-4 py-2 text-sm gap-2',
      lg: 'px-6 py-2.5 text-base gap-2.5',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
