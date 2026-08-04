'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui';
import { useTheme } from '@/lib/theme/ThemeProvider';

export function Hero() {
  const { theme } = useTheme();
  const heroImageSrc = theme === 'light' ? '/images/hero-person-light.png' : '/images/hero-person-dark.png';

  return (
    <section id="hero" className="overflow-x-hidden px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
        {/* Left — content */}
        <div>
          <h1
            className="text-4xl font-bold leading-tight text-white sm:text-5xl"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Social accounts, <span className="text-primary">delivered instantly</span>
          </h1>

          <p className="mt-6 max-w-md text-lg text-neutral">
            Facebook, Instagram, and TikTok pages by follower tier. Pay once, get your
            credentials immediately — no waiting, no back and forth.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link href="/store">
              <Button variant="primary" size="lg">
                Browse the store
              </Button>
            </Link>
          </div>

          <div className="mt-12 flex gap-10">
            <div>
              <p className="text-2xl font-bold text-white">500+</p>
              <p className="text-sm text-neutral">Accounts Delivered</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">Instant</p>
              <p className="text-sm text-neutral">Delivery Time</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">24/7</p>
              <p className="text-sm text-neutral">Support</p>
            </div>
          </div>
        </div>

        {/* Right — photo, icons baked into the composited image itself, swaps by theme */}
        <div className="relative mx-auto w-full max-w-sm">
          <Image
            src={heroImageSrc}
            alt="LogsCity customer"
            width={500}
            height={500}
            className="w-full rounded-2xl"
            priority
          />
        </div>
      </div>
    </section>
  );
}
