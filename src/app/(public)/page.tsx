import type { Metadata } from 'next';
import { Hero, FeaturedListings, Testimonials, Faq } from '@/components/landing';

export const metadata: Metadata = {
  title: 'LogsCity — Digital Accounts, Delivered Instantly',
  description:
    'Buy social media accounts, VPN accounts, and more — with instant delivery after payment. No waiting, no back and forth.',
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedListings />
      <Testimonials />
      <Faq />
    </>
  );
}
