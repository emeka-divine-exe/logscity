'use client';

import { useEffect, useState, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';

type ModalSize = 'sm' | 'md' | 'lg';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: ModalSize;
  showCloseButton?: boolean;
  footer?: ReactNode;
  children: ReactNode;
}

const sizeStyles: Record<ModalSize, string> = {
  sm: 'max-w-md',
  md: 'max-w-xl',
  lg: 'max-w-2xl',
};

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  size = 'md',
  showCloseButton = true,
  footer,
  children,
}: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop — clicking it does NOT close the modal, prevents accidental dismissal */}
      <div className="absolute inset-0 bg-black/60" />

      <div
        className={cn(
          'relative flex flex-col w-full max-h-[85vh] rounded-2xl bg-background border border-white/10 shadow-xl',
          sizeStyles[size]
        )}
      >
        {(title || showCloseButton) && (
          <div className="flex items-start justify-between gap-4 p-6 border-b border-white/10 shrink-0">
            <div>
              {title && (
                <h2 className="text-lg font-semibold text-white">{title}</h2>
              )}
              {description && (
                <p className="mt-1 text-sm text-neutral">{description}</p>
              )}
            </div>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="shrink-0 flex items-center justify-center w-8 h-8 rounded-xl text-neutral hover:text-white hover:bg-white/10 transition-colors duration-200"
                aria-label="Close"
              >
                <Icon icon="lucide:x" className="text-lg" />
              </button>
            )}
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-6">{children}</div>

        {footer && (
          <div className="flex items-center justify-end gap-3 p-6 border-t border-white/10 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

