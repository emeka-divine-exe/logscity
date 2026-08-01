import { cn } from '@/lib/utils';

interface DividerProps {
  label?: string;
  className?: string;
}

export function Divider({ label, className }: DividerProps) {
  if (!label) {
    return <div className={cn('h-px w-full bg-white/10', className)} />;
  }

  return (
    <div className={cn('flex items-center gap-4', className)}>
      <div className="h-px flex-1 bg-white/10" />
      <span className="text-sm text-neutral">{label}</span>
      <div className="h-px flex-1 bg-white/10" />
    </div>
  );
}
