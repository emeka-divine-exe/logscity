'use client';

import { InputHTMLAttributes, forwardRef } from 'react';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon: string;
  error?: string;
  label?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ icon, error, label, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-2">
        {label && (
          <label className="text-sm font-medium text-neutral">{label}</label>
        )}
        <div className="relative flex items-center">
          <Icon
            icon={icon}
            className="absolute left-4 bottom-4 text-neutral text-lg pointer-events-none"
          />
          <input
            ref={ref}
            className={cn(
              'w-full h-12 pl-11 pr-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-neutral/60 outline-none transition-colors duration-200 focus:border-primary',
              error && 'border-red-500 focus:border-red-500',
              className
            )}
            {...props}
          />
        </div>
        {error && <span className="text-sm text-red-500">{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
