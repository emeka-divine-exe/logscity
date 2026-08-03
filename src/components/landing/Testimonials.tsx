import Image from 'next/image';

interface Testimonial {
  name: string;
  role: string;
  quote: string;
  avatar: string;
}

// PLACEHOLDER — swap these names/quotes/avatars for real customer testimonials later
const testimonials: Testimonial[] = [
  {
    name: 'Chidi Okafor',
    role: 'Social Media Manager',
    quote:
      'Ordered a Facebook page and had the login details in my inbox within a minute. No stress, no waiting around.',
    avatar: '/images/testimonial-1.jpg',
  },
  {
    name: 'Amara Bello',
    role: 'Digital Marketer',
    quote:
      'I was skeptical at first, but the account was exactly as described and delivery was genuinely instant.',
    avatar: '/images/testimonial-2.jpg',
  },
  {
    name: 'Tunde Adeyemi',
    role: 'Content Creator',
    quote:
      'Been buying TikTok and Instagram pages here for months now. Always fast, always reliable.',
    avatar: '/images/testimonial-3.jpg',
  },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="relative overflow-hidden px-4 py-20 sm:px-6">
      {/* Brand-colored glow, replacing the rainbow gradient from the reference */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/3 rounded-full opacity-30 blur-[120px]"
        style={{ background: 'var(--color-primary)' }}
      />

      <div className="relative mx-auto max-w-6xl text-center">
        <h2
          className="text-3xl font-bold text-white sm:text-4xl"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          What people say
        </h2>
        <p className="mx-auto mt-3 max-w-md text-neutral">
          Discover what our customers have to say about buying and receiving accounts on LogsCity.
        </p>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 text-left backdrop-blur-md"
            >
              <div className="flex items-center gap-3">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-white/10">
                  <Image
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="font-semibold text-white">{testimonial.name}</p>
                  <p className="text-sm text-neutral">{testimonial.role}</p>
                </div>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-neutral">
                {testimonial.quote}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
