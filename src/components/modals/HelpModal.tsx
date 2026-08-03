'use client';

import { Icon } from '@iconify/react';
import { Modal, Button } from '@/components/ui';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// PLACEHOLDER — replace with the real LogsCity WhatsApp business number
const WHATSAPP_NUMBER = '+2349128054985';
const WHATSAPP_MESSAGE = "Hi, I need help with ...";

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Need help?" size="sm">
      <div className="flex flex-col items-center gap-4 py-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5">
          <Icon icon="ic:baseline-whatsapp" className="text-3xl text-primary" />
        </div>

        <p className="text-sm text-neutral">
          Chat with us directly on WhatsApp and we'll respond as quickly as we can.
        </p>

        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="w-full">
          <Button variant="primary" className="w-full">
            <Icon icon="ic:baseline-whatsapp" className="mr-2 text-base" />
            Chat on WhatsApp
          </Button>
        </a>
      </div>
    </Modal>
  );
}
