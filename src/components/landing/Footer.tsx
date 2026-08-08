import Link from 'next/link';
import { Icon } from '@iconify/react';
import { Logo } from '@/components/shared';

// PLACEHOLDER — replace with real handles/links once client sends details
const CONTACT_LINKS = [
  { label: 'WhatsApp', icon: 'ic:baseline-whatsapp', href: 'https://wa.me/2349131455377' },
  { label: 'WhatsApp Channel', icon: 'ic:baseline-whatsapp', href: 'https://chat.whatsapp.com/GxPPfHUPCFJB05mOOfioBL' },
  { label: 'Facebook', icon: 'mdi:facebook', href: 'https://www.facebook.com/share/14mjecrKeMk/?mibextid=wwXIfr' },
  { label: 'TikTok', icon: 'ic:baseline-tiktok', href: 'https://www.tiktok.com/@logs.city1' },
  { label: 'Email', icon: 'lucide:mail', href: 'mailto:staffordsavvy7@gmail.com' },
  { label: 'Phone', icon: 'lucide:phone', href: 'tel:+2349131455377' },
];

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Store', href: '/store' },
  { label: 'Testimonials', href: '/#testimonials' },
  { label: 'How It Works', href: '/#faq' },
  { label: 'Contact', href: '/#footer' },
];

export function Footer() {
  return (
    <footer id="footer" className="px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 sm:grid-cols-[1.5fr_1fr_1fr]">
          {/* Logo + tagline */}
          <div>
            <Logo />
            <p className="mt-3 max-w-xs text-sm text-neutral">
              Social accounts, delivered instantly. Facebook, Instagram, and TikTok pages by
              follower tier — no waiting, no back and forth.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <p className="text-sm font-semibold text-white">Navigation</p>
            <ul className="mt-4 flex flex-col gap-3">
              {NAV_LINKS.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-neutral hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-sm font-semibold text-white">Contact</p>
            <ul className="mt-4 flex flex-col gap-3">
              {CONTACT_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-neutral hover:text-white"
                  >
                    <Icon icon={link.icon} className="text-base" />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 border-t border-white/10 pt-6">
          <p className="text-sm text-neutral">© 2026 LogsCity. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
