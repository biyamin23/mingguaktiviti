import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'royal' | 'gold' | 'silver' | 'bronze' | 'success' | 'danger' | 'warning' | 'outline';
  size?: 'sm' | 'md';
}

export function Badge({ className, variant = 'default', size = 'md', children, ...props }: BadgeProps) {
  const baseStyles = 'inline-flex items-center font-semibold rounded-full tracking-wide transition-colors';

  const variants = {
    default: 'bg-[#F1F5F9] text-[#475569]',
    royal: 'bg-[#EFF6FF] text-[#1646A0] border border-[#BFDBFE]',
    gold: 'bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]',
    silver: 'bg-[#F1F5F9] text-[#334155] border border-[#CBD5E1]',
    bronze: 'bg-[#FFEDD5] text-[#9A3412] border border-[#FED7AA]',
    success: 'bg-[#DCFCE7] text-[#15803D] border border-[#BBF7D0]',
    danger: 'bg-[#FEE2E2] text-[#B91C1C] border border-[#FECACA]',
    warning: 'bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]',
    outline: 'bg-transparent border border-[#CBD5E1] text-[#475569]',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
  };

  return (
    <span className={cn(baseStyles, variants[variant], sizes[size], className)} {...props}>
      {children}
    </span>
  );
}
