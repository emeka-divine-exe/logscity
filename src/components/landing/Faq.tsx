'use client';

import { useState } from 'react';
import { Icon } from '@iconify/react';
import { Accordion, Button } from '@/components/ui';
import { HelpModal } from '@/components/modals';

// PLACEHOLDER — tailored to LogsCity, refine copy once real policies/pricing are locked
const faqs = [
  {
    id: 'how-it-works',
    question: 'How does LogsCity work?',
    answer:
      'Browse the store, choose a category (like Facebook pages by follower tier), and pick the specific accounts you want. Pay with Paystack, and your login credentials are delivered instantly to your order history — no waiting.',
  },
  {
    id: 'delivery-speed',
    question: 'How fast is delivery?',
    answer:
      'Instant. As soon as your payment is confirmed, the account credentials are unlocked in your My Orders page — no manual processing on our end.',
  },
  {
    id: 'what-you-get',
    question: 'What do I get access to?',
    answer:
      'Each account comes with its login email, password, and profile link. You can view these anytime from your order history after purchase.',
  },
  {
    id: 'payment-methods',
    question: 'What payment methods are supported?',
    answer:
      'All payments are processed securely through Paystack, so you can pay with your debit card, bank transfer, or USSD.',
  },
  {
    id: 'preview-account',
    question: 'Can I view an account before buying it?',
    answer:
      'Yes. When choosing accounts inside a category, each one has a "View Account" link that opens the real profile in a new tab so you can check it before selecting it.',
  },
  {
    id: 'order-issues',
    question: 'What if I have an issue with my order?',
    answer:
      'Reach out to us directly on WhatsApp using the help button below and our support team will assist you.',
  },
];

export function Faq() {
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  return (
    <section id="faq" className="px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <h2
            className="text-3xl font-bold text-white sm:text-4xl"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Frequently asked questions
          </h2>
          <p className="mx-auto mt-3 max-w-md text-neutral">
            Everything you need to know about buying and receiving accounts on LogsCity.
          </p>
        </div>

        <div className="mt-12">
          <Accordion
            items={faqs.map((faq) => ({
              id: faq.id,
              title: faq.question,
              content: faq.answer,
            }))}
          />
        </div>

        <div className="mt-12 flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
          <Icon icon="lucide:message-circle-question" className="text-3xl text-primary" />
          <p className="text-white">Still have questions?</p>
          <Button variant="secondary" onClick={() => setIsHelpOpen(true)}>
            Chat with us
          </Button>
        </div>
      </div>

      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </section>
  );
}
