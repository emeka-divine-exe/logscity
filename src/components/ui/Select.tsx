'use client';

import { SelectHTMLAttributes, forwardRef } from 'react';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';

interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  icon: string;
  options: SelectOption[];
  error?: string;
  label?: string;
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ icon, options, error, label, placeholder, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-2">
        {label && (
          <label className="text-sm font-medium text-neutral">{label}</label>
        )}
        <div className="relative flex items-center">
          <Icon
            icon={icon}
            className="absolute left-4 text-neutral text-lg pointer-events-none z-10"
          />
          <select
            ref={ref}
            className={cn(
              'w-full h-12 pl-11 pr-4 rounded-2xl bg-white/5 border border-white/10 text-white outline-none appearance-none transition-colors duration-200 focus:border-primary',
              error && 'border-red-500 focus:border-red-500',
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <Icon
            icon="lucide:chevron-down"
            className="absolute right-4 text-neutral text-lg pointer-events-none"
          />
        </div>
        {error && <span className="text-sm text-red-500">{error}</span>}
      </div>
    );
  }
);

Select.displayName = 'Select';
