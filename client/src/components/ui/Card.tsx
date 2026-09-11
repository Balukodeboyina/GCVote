import React from 'react';
import { cn } from '../../lib/utils.js';

export function Card({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm p-6 text-slate-100 shadow-md',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
