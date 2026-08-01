'use client';

import { InputHTMLAttributes, forwardRef } from 'react';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, className, checked, ...props }, ref) => {
    return (
      <label className="inline-flex items-center gap-3 cursor-pointer select-none">
        <span className="relative flex items-center justify-center w-5 h-5 shrink-0">
          <input
            ref={ref}
            type="checkbox"
            checked={checked}
            className={cn('peer absolute inset-0 opacity-0 cursor-pointer', className)}
            {...props}
          />
          <span className="w-5 h-5 rounded-md border border-white/20 bg-white/5 transition-colors duration-200 peer-checked:bg-primary peer-checked:border-primary" />
          <Icon
            icon="lucide:check"
            className="absolute text-white text-xs opacity-0 peer-checked:opacity-100 pointer-events-none"
          />
        </span>
        {label && <span className="text-sm text-white">{label}</span>}
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';
