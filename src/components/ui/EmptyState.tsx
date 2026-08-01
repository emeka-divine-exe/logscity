import { Icon } from '@iconify/react';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon: string;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center py-16 px-6',
        className
      )}
    >
      <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 mb-4">
        <Icon icon={icon} className="text-3xl text-neutral" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-neutral max-w-xs mb-4">{description}</p>
      )}
      {action}
    </div>
  );
}
