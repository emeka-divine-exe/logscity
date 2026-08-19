'use client';

import { useState, useRef, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { buildWhatsAppChatLink, WHATSAPP_CHANNEL_URL } from '@/lib/constants/whatsapp';

export function FloatingWhatsApp() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3">
      {isOpen && (
        <div className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-background/95 p-2 shadow-xl backdrop-blur-md">
          <a
            href={buildWhatsAppChatLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm text-white hover:bg-white/5"
          >
            <Icon icon="ic:baseline-whatsapp" className="text-lg text-green-500" />
            Chat with LogsCity
          </a>
          <a
            href={WHATSAPP_CHANNEL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm text-white hover:bg-white/5"
          >
            <Icon icon="lucide:megaphone" className="text-lg text-primary" />
            View Channel
          </a>
        </div>
      )}

      <button
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="WhatsApp options"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-lg transition-transform hover:scale-105"
      >
        <Icon icon={isOpen ? 'lucide:x' : 'ic:baseline-whatsapp'} className="text-2xl" />
      </button>
    </div>
  );
}
