import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui';

export function Hero() {
  return (
    <section id="hero" className="px-4 py-16 sm:px-6 sm:py-24">
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

          {/* Stats — placeholder numbers, replace with real figures */}
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

        {/* Right — photo with floating platform icons */}
        <div className="relative mx-auto w-full max-w-sm">
          <div className="relative aspect-square w-full overflow-hidden rounded-2xl">
            <Image
              src="/images/hero-person.png"
              alt="LogsCity customer"
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Floating platform icons — 3D glossy style, decorative, from public/images/ */}
          <Image
            src="/images/facebook-icon.png"
            alt="Facebook"
            width={72}
            height={72}
            className="absolute -left-6 top-8"
          />

          <Image
            src="/images/instagram-icon.png"
            alt="Instagram"
            width={56}
            height={56}
            className="absolute -right-6 top-1/3"
          />

          <Image
            src="/images/tiktok-icon.png"
            alt="TikTok"
            width={56}
            height={56}
            className="absolute -bottom-6 left-1/4"
          />
        </div>
      </div>
    </section>
  );
            }
