import React from 'react';

export type BadgeVariant = 
  | 'verified'
  | 'available'
  | 'busy'
  | 'pending'
  | 'accepted'
  | 'completed'
  | 'cancelled'
  | 'trade'
  | 'sample'
  | 'accent'
  | 'neutral';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  children,
  size = 'md',
  icon,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs font-medium px-2.5 py-1 gap-1.5',
  };

  const variantClasses: Record<BadgeVariant, string> = {
    verified: 'bg-emerald-50 text-emerald-700 border border-emerald-200/80',
    available: 'bg-green-50 text-green-700 border border-green-200/80',
    busy: 'bg-amber-50 text-amber-700 border border-amber-200/80',
    pending: 'bg-amber-50 text-amber-700 border border-amber-200/80',
    accepted: 'bg-blue-50 text-blue-700 border border-blue-200/80',
    completed: 'bg-emerald-50 text-emerald-700 border border-emerald-200/80',
    cancelled: 'bg-rose-50 text-rose-700 border border-rose-200/80',
    trade: 'bg-navy-50 text-navy-800 border border-navy-200 uppercase font-semibold tracking-wider text-[10px]',
    sample: 'bg-accent-50 text-accent-700 border border-accent-200 font-semibold tracking-wider text-[10px]',
    accent: 'bg-accent-500 text-white font-semibold text-[10px]',
    neutral: 'bg-slate-100 text-slate-700 border border-slate-200',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </span>
  );
};
