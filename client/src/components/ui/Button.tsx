import React from 'react';
import { cn } from '../../lib/utils.js';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-all rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]';
    
    const variants = {
      primary: 'bg-brand-500 text-white hover:bg-brand-600 focus:ring-brand-400 focus:ring-offset-slate-950 shadow-sm shadow-brand-500/20',
      secondary: 'bg-slate-800 text-slate-100 hover:bg-slate-700 focus:ring-slate-600 focus:ring-offset-slate-950',
      outline: 'border border-slate-700 text-slate-200 hover:bg-slate-800/60 focus:ring-slate-600 focus:ring-offset-slate-950',
      ghost: 'text-slate-300 hover:bg-slate-800/60 hover:text-white focus:ring-slate-600 focus:ring-offset-slate-950',
      danger: 'bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-500 focus:ring-offset-slate-950',
    };

    const sizes = {
      sm: 'text-xs px-3 py-1.5 gap-1.5',
      md: 'text-sm px-4 py-2 gap-2',
      lg: 'text-base px-6 py-3 gap-2.5',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
